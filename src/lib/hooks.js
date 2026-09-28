import { useCallback, useEffect, useState } from "react";
import { listRecipes, peekRecipes } from "./recipes";

export function useRecipes() {
  const [recipes, setRecipes] = useState(peekRecipes);
  const [error, setError] = useState(null);

  const load = useCallback((refresh) => {
    setError(null);
    listRecipes({ refresh })
      .then(setRecipes)
      .catch((err) => {
        console.error(err);
        setError(err);
      });
  }, []);

  useEffect(() => load(false), [load]);

  return { recipes, error, retry: () => load(true) };
}

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · Tuan's Cookbook` : "Tuan's Cookbook";
  }, [title]);
}

// Stable pastel hue per recipe name, used for the monogram tiles.
export function hueFor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return h % 360;
}

export const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;
