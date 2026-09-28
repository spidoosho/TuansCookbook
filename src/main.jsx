/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { hueFor, plural, useDocumentTitle, useRecipes } from "./lib/hooks";
import { recipePath } from "./lib/recipes";
import { SearchIcon, XIcon } from "./components/icons";

function MainApp() {
  useDocumentTitle(null);
  const { recipes, error, retry } = useRecipes();
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
  const searchRef = useRef(null);

  // "/" focuses search from anywhere on the page.
  useEffect(() => {
    function onKey(e) {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo(() => search(recipes ?? [], query), [recipes, query]);

  function setQuery(q) {
    setParams(q ? { q } : {}, { replace: true });
  }

  let body;
  if (error) {
    body = (
      <div className="empty">
        <h2>Couldn&apos;t load recipes</h2>
        <p className="muted">Check your connection and try again.</p>
        <button className="btn" onClick={retry}>
          Try again
        </button>
      </div>
    );
  } else if (recipes === null) {
    body = (
      <div className="grid" aria-busy="true" aria-label="Loading recipes">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="card skeleton" />
        ))}
      </div>
    );
  } else if (recipes.length === 0) {
    body = (
      <div className="empty">
        <p className="empty-emoji" aria-hidden="true">📖</p>
        <h2>The cookbook is empty</h2>
        <p className="muted">Add the first recipe to get things started.</p>
        <Link to="/add" className="btn btn-primary">
          Add a recipe
        </Link>
      </div>
    );
  } else if (results.length === 0) {
    body = (
      <div className="empty">
        <h2>No recipes match &ldquo;{query}&rdquo;</h2>
        <p className="muted">Try a dish name or an ingredient.</p>
        <button className="btn" onClick={() => setQuery("")}>
          Clear search
        </button>
      </div>
    );
  } else {
    body = (
      <ul className="grid">
        {results.map(({ recipe, matched }) => (
          <li key={recipe.name}>
            <RecipeCard recipe={recipe} matched={matched} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <>
      <section className="hero">
        <p className="eyebrow">A personal collection</p>
        <h1 className="display">What are we cooking today?</h1>
        <div className="search">
          <SearchIcon className="search-icon" />
          <input
            ref={searchRef}
            type="search"
            placeholder="Search dishes or ingredients…"
            aria-label="Search recipes"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setQuery("");
            }}
          />
          {query ? (
            <button
              className="icon-btn search-clear"
              aria-label="Clear search"
              onClick={() => {
                setQuery("");
                searchRef.current?.focus();
              }}
            >
              <XIcon size={16} />
            </button>
          ) : (
            <kbd className="search-kbd" aria-hidden="true">
              /
            </kbd>
          )}
        </div>
        {recipes && recipes.length > 0 && (
          <p className="muted small">
            {query
              ? `${results.length} of ${recipes.length} recipes`
              : `${recipes.length} ${recipes.length === 1 ? "recipe" : "recipes"}`}
          </p>
        )}
      </section>
      {body}
    </>
  );
}

function RecipeCard({ recipe, matched }) {
  const { name, ingredients, steps } = recipe;
  return (
    <Link to={recipePath(name)} className="card">
      <span className="monogram" style={{ "--hue": hueFor(name) }} aria-hidden="true">
        {name.trim().charAt(0).toUpperCase()}
      </span>
      <span className="card-body">
        <span className="card-title">{name}</span>
        <span className="card-meta">
          {plural(ingredients.length, "ingredient")} · {plural(steps.length, "step")}
        </span>
        {matched.length > 0 ? (
          <span className="card-match">
            Uses {matched.slice(0, 2).join(", ")}
            {matched.length > 2 && ` +${matched.length - 2}`}
          </span>
        ) : (
          <span className="card-preview">{ingredients.slice(0, 4).join(" · ")}</span>
        )}
      </span>
    </Link>
  );
}

function search(recipes, query) {
  const q = query.trim().toLowerCase();
  if (!q) return recipes.map((recipe) => ({ recipe, matched: [] }));

  const results = [];
  for (const recipe of recipes) {
    const nameHit = recipe.name.toLowerCase().includes(q);
    const matched = recipe.ingredients.filter((i) => i.toLowerCase().includes(q));
    if (nameHit || matched.length) {
      results.push({ recipe, matched: nameHit ? [] : matched, nameHit });
    }
  }
  // Name matches first, then ingredient matches.
  return results.sort((a, b) => b.nameHit - a.nameHit);
}

export default MainApp;
