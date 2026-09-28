import {
  checkCode,
  getRecipe,
  listRecipes,
  parseRecipe,
  putRecipe,
  RecipeExistsError,
} from "./_lib/dynamo.js";

// GET  /api/recipes               -> all recipes
// GET  /api/recipes?name=<name>   -> one recipe, or 404
// POST /api/recipes {code, recipe} -> 201 created, 400 invalid, 401 wrong code, 409 name taken
export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const { name } = req.query;
      if (name) {
        const recipe = await getRecipe(String(name));
        return recipe
          ? res.status(200).json(recipe)
          : res.status(404).json({ error: "Recipe not found" });
      }
      return res.status(200).json(await listRecipes());
    }

    if (req.method === "POST") {
      const { code, recipe } = req.body ?? {};
      if (!(await checkCode(code))) {
        return res.status(401).json({ error: "Wrong code" });
      }
      const parsed = parseRecipe(recipe);
      if (!parsed) {
        return res.status(400).json({ error: "A recipe needs a name, ingredients and steps" });
      }
      try {
        await putRecipe(parsed);
      } catch (err) {
        if (err instanceof RecipeExistsError) {
          return res.status(409).json({ error: "A recipe with that name already exists" });
        }
        throw err;
      }
      return res.status(201).json(parsed);
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
}
