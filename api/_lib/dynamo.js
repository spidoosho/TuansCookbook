// Server-only. Files under api/_lib are not exposed as Vercel functions.
import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";
import { createHash, timingSafeEqual } from "node:crypto";

const TABLE = "Recipes";

// The VITE_ fallbacks let an existing deployment keep working until the env
// vars are renamed. Only these server files read them now, so they no longer
// end up in the browser bundle.
function env(name, legacy) {
  return process.env[name] ?? process.env[legacy];
}

// Anything not set here falls back to the AWS SDK's usual lookup
// (AWS_REGION / AWS_ACCESS_KEY_ID env vars, ~/.aws/credentials, ~/.aws/config),
// which is handy locally. On Vercel, use the DYNAMODB_* names: Vercel reserves AWS_*.
let client;
function db() {
  if (!client) {
    const region = env("DYNAMODB_REGION", "VITE_DYNAMODB_REGION");
    const accessKeyId = env("DYNAMODB_ACCESS_KEY_ID", "VITE_DYNAMODB_ACCESS_KEY_ID");
    const secretAccessKey = env("DYNAMODB_SECRET_ACCESS_KEY", "VITE_DYNAMODB_SECRET_ACCESS_KEY");
    client = new DynamoDBClient({
      ...(region && { region }),
      ...(accessKeyId && secretAccessKey && { credentials: { accessKeyId, secretAccessKey } }),
    });
  }
  return client;
}

function toRecipe(item) {
  return {
    name: item.Name.S,
    ingredients:
      item.Ingredients?.SS ?? item.Ingredients?.L?.map((i) => i.S) ?? [],
    steps: item.Steps?.L?.map((s) => s.S) ?? [],
  };
}

export async function listRecipes() {
  const items = [];
  let ExclusiveStartKey;
  do {
    const res = await db().send(
      new ScanCommand({ TableName: TABLE, ExclusiveStartKey })
    );
    items.push(...(res.Items ?? []));
    ExclusiveStartKey = res.LastEvaluatedKey;
  } while (ExclusiveStartKey);

  return items.map(toRecipe).sort((a, b) => a.name.localeCompare(b.name));
}

export async function getRecipe(name) {
  const res = await db().send(
    new GetItemCommand({ TableName: TABLE, Key: { Name: { S: name } } })
  );
  return res.Item ? toRecipe(res.Item) : null;
}

export class RecipeExistsError extends Error {}

export async function putRecipe({ name, ingredients, steps }) {
  try {
    await db().send(
      new PutItemCommand({
        TableName: TABLE,
        Item: {
          Name: { S: name },
          Ingredients: { SS: ingredients },
          Steps: { L: steps.map((s) => ({ S: s })) },
        },
        // Never silently overwrite an existing recipe.
        ConditionExpression: "attribute_not_exists(#n)",
        ExpressionAttributeNames: { "#n": "Name" },
      })
    );
  } catch (err) {
    if (err.name === "ConditionalCheckFailedException") {
      throw new RecipeExistsError(name);
    }
    throw err;
  }
}

const sha256 = (s) => createHash("sha256").update(String(s)).digest();

// Constant-time comparison; a failed guess also costs the caller a second so
// the code can't be brute-forced quickly.
export async function checkCode(code) {
  const secret = env("RECIPE_CODE", "VITE_CODE");
  const ok =
    !!secret &&
    typeof code === "string" &&
    timingSafeEqual(sha256(code.trim()), sha256(secret));
  if (!ok) await new Promise((r) => setTimeout(r, 1000));
  return ok;
}

const cleanList = (list, maxItems, maxLength) =>
  Array.isArray(list)
    ? list
        .filter((s) => typeof s === "string")
        .map((s) => s.trim())
        .filter((s) => s && s.length <= maxLength)
        .slice(0, maxItems)
    : [];

// Returns a clean recipe, or null if the input isn't a valid one.
export function parseRecipe(input) {
  const name = typeof input?.name === "string" ? input.name.trim() : "";
  // String sets reject duplicates.
  const ingredients = [...new Set(cleanList(input?.ingredients, 100, 300))];
  const steps = cleanList(input?.steps, 100, 2000);
  if (!name || name.length > 120 || !ingredients.length || !steps.length) {
    return null;
  }
  return { name, ingredients, steps };
}
