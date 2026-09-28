import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import { getRecipe } from "./lib/recipes";
import { hueFor, plural, useDocumentTitle } from "./lib/hooks";
import { ArrowLeftIcon, CheckIcon, LinkIcon } from "./components/icons";

function RecipeApp() {
  const { name } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  // undefined = loading, null = not found
  const [recipe, setRecipe] = useState(undefined);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const [haveIngredients, setHaveIngredients] = useState(new Set());
  const [doneSteps, setDoneSteps] = useState(new Set());
  const [copied, setCopied] = useState(false);
  const [justCreated, setJustCreated] = useState(!!location.state?.created);

  useDocumentTitle(recipe ? recipe.name : name);

  useEffect(() => {
    let cancelled = false;
    setRecipe(undefined);
    setError(null);
    setHaveIngredients(new Set());
    setDoneSteps(new Set());
    getRecipe(name)
      .then((r) => !cancelled && setRecipe(r))
      .catch((err) => {
        console.error(err);
        if (!cancelled) setError(err);
      });
    return () => {
      cancelled = true;
    };
  }, [name, attempt]);

  // Show the "published" toast once, and don't bring it back on refresh.
  useEffect(() => {
    if (!justCreated) return;
    navigate(location.pathname, { replace: true, state: null });
    const t = setTimeout(() => setJustCreated(false), 4000);
    return () => clearTimeout(t);
  }, [justCreated, navigate, location.pathname]);

  function toggle(setter, key) {
    setter((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked; nothing useful to do.
    }
  }

  const back = (
    <Link to="/" className="back-link">
      <ArrowLeftIcon size={16} /> All recipes
    </Link>
  );

  if (error) {
    return (
      <div className="empty">
        <h2>Couldn&apos;t load this recipe</h2>
        <p className="muted">Check your connection and try again.</p>
        <button className="btn" onClick={() => setAttempt((a) => a + 1)}>
          Try again
        </button>
      </div>
    );
  }

  if (recipe === undefined) {
    return (
      <div aria-busy="true" aria-label="Loading recipe">
        {back}
        <div className="skeleton-line wide" />
        <div className="skeleton-line" />
        <div className="recipe-layout">
          <div className="skeleton block" />
          <div className="skeleton block" />
        </div>
      </div>
    );
  }

  if (recipe === null) {
    return (
      <div className="empty">
        <p className="empty-emoji" aria-hidden="true">🥄</p>
        <h1>Recipe not found</h1>
        <p className="muted">There&apos;s no recipe called &ldquo;{name}&rdquo;.</p>
        <Link to="/" className="btn btn-primary">
          Browse recipes
        </Link>
      </div>
    );
  }

  const stepsDone = doneSteps.size;
  const allDone = stepsDone === recipe.steps.length;

  return (
    <article>
      {justCreated && (
        <div className="toast" role="status">
          <CheckIcon size={16} /> Recipe published
        </div>
      )}

      {back}

      <header className="recipe-header">
        <span
          className="monogram monogram-lg"
          style={{ "--hue": hueFor(recipe.name) }}
          aria-hidden="true"
        >
          {recipe.name.trim().charAt(0).toUpperCase()}
        </span>
        <div className="recipe-heading">
          <h1 className="display">{recipe.name}</h1>
          <p className="muted">
            {plural(recipe.ingredients.length, "ingredient")} · {plural(recipe.steps.length, "step")}
          </p>
        </div>
        <button className="btn btn-ghost btn-sm share-btn" onClick={copyLink}>
          {copied ? <CheckIcon size={16} /> : <LinkIcon size={16} />}
          {copied ? "Copied" : "Copy link"}
        </button>
      </header>

      <div className="recipe-layout">
        <section className="panel ingredients">
          <div className="panel-head">
            <h2>Ingredients</h2>
            {haveIngredients.size > 0 && (
              <button className="text-btn" onClick={() => setHaveIngredients(new Set())}>
                Reset
              </button>
            )}
          </div>
          <p className="hint">Tick things off as you gather them.</p>
          <ul className="checklist">
            {recipe.ingredients.map((ingredient) => {
              const checked = haveIngredients.has(ingredient);
              return (
                <li key={ingredient}>
                  <label className={`check ${checked ? "is-checked" : ""}`}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(setHaveIngredients, ingredient)}
                    />
                    <span className="box" aria-hidden="true">
                      <CheckIcon size={14} />
                    </span>
                    <span>{ingredient}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="steps-section">
          <div className="panel-head">
            <h2>Method</h2>
            {stepsDone > 0 && (
              <span className="progress-text">
                {allDone ? "All done — enjoy!" : `${stepsDone} of ${recipe.steps.length} done`}
                <button className="text-btn" onClick={() => setDoneSteps(new Set())}>
                  Reset
                </button>
              </span>
            )}
          </div>
          <p className="hint">Tap a step to mark it done.</p>
          <ol className="steps">
            {recipe.steps.map((step, i) => {
              const done = doneSteps.has(i);
              return (
                <li key={i}>
                  <button
                    className={`step ${done ? "is-done" : ""}`}
                    aria-pressed={done}
                    onClick={() => toggle(setDoneSteps, i)}
                  >
                    <span className="step-num" aria-hidden="true">
                      {done ? <CheckIcon size={16} /> : i + 1}
                    </span>
                    <span className="step-text">{step}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </section>
      </div>
    </article>
  );
}

export default RecipeApp;
