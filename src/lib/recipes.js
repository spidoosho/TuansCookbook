// All data goes through the /api functions; the browser never sees AWS keys.

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function api(path, options) {
  const res = await fetch(`/api/${path}`, options);
  if (res.ok) return res.status === 204 ? null : res.json();
  const body = await res.json().catch(() => ({}));
  throw new ApiError(res.status, body.error ?? res.statusText);
}

// The whole table is small, so it is fetched once and shared by every page.
let listPromise = null;
let cachedList = null;

export function listRecipes({ refresh = false } = {}) {
  if (!listPromise || refresh) {
    listPromise = api("recipes")
      .then((recipes) => (cachedList = recipes))
      .catch((err) => {
        listPromise = null;
        throw err;
      });
  }
  return listPromise;
}

export function peekRecipes() {
  return cachedList;
}

export async function getRecipe(name) {
  const cached = cachedList?.find((r) => r.name === name);
  if (cached) return cached;

  try {
    return await api(`recipes?name=${encodeURIComponent(name)}`);
  } catch (err) {
    if (err.status === 404) return null;
    throw err;
  }
}

export class RecipeExistsError extends Error {}
export class WrongCodeError extends Error {}

export async function createRecipe(recipe, code) {
  let saved;
  try {
    saved = await api("recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, recipe }),
    });
  } catch (err) {
    if (err.status === 409) throw new RecipeExistsError(recipe.name);
    if (err.status === 401) throw new WrongCodeError();
    throw err;
  }

  if (cachedList) {
    cachedList = [...cachedList, saved].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    listPromise = Promise.resolve(cachedList);
  }
  return saved;
}

export async function checkCode(code) {
  try {
    await api("unlock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    return true;
  } catch (err) {
    if (err.status === 401) return false;
    throw err;
  }
}

export function recipePath(name) {
  return `/recipe/${encodeURIComponent(name)}`;
}
