import { checkCode } from "./_lib/dynamo.js";

// POST /api/unlock {code} -> 204 if the code is right, 401 otherwise
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (await checkCode(req.body?.code)) {
    return res.status(204).end();
  }
  return res.status(401).json({ error: "Wrong code" });
}
