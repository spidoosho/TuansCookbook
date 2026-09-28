import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import ListEditor from "./components/listEditor";
import { newRow } from "./lib/rows";
import { LockIcon } from "./components/icons";
import { createRecipe, recipePath, RecipeExistsError, WrongCodeError } from "./lib/recipes";
import { useDocumentTitle, useRecipes } from "./lib/hooks";
import { isUnlocked, lock, storedCode, unlock } from "./lib/unlock";

const DRAFT_KEY = "cookbook:draft";

function AddRecipeApp() {
  useDocumentTitle("Add a recipe");
  const [unlocked, setUnlocked] = useState(isUnlocked);
  const [notice, setNotice] = useState(null);

  function relock(message) {
    lock();
    setNotice(message);
    setUnlocked(false);
  }

  return unlocked ? (
    <RecipeForm
      onLock={() => relock(null)}
      onCodeRejected={() =>
        relock("The secret code has changed. Enter the new one. Your draft is saved.")
      }
    />
  ) : (
    <UnlockCard notice={notice} onUnlock={() => setUnlocked(true)} />
  );
}

// eslint-disable-next-line react/prop-types
function UnlockCard({ onUnlock, notice }) {
  const [code, setCode] = useState("");
  const [wrong, setWrong] = useState(false);
  const [checking, setChecking] = useState(false);
  const [failed, setFailed] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setChecking(true);
    setFailed(false);
    try {
      if (await unlock(code)) {
        onUnlock();
        return;
      }
      setWrong(true);
      setCode("");
    } catch (err) {
      console.error(err);
      setFailed(true);
    }
    setChecking(false);
  }

  return (
    <div className="unlock">
      <form className={`unlock-card ${wrong ? "shake" : ""}`} onSubmit={submit} onAnimationEnd={(e) => e.currentTarget.classList.remove("shake")}>
        <span className="unlock-icon">
          <LockIcon size={22} />
        </span>
        <h1>The kitchen is private</h1>
        <p className="muted">
          {notice ??
            "Enter the secret code to add recipes. You'll only need to do this once on this device."}
        </p>
        <input
          className={`input code-input ${wrong ? "is-invalid" : ""}`}
          type="password"
          inputMode="numeric"
          autoComplete="off"
          autoFocus
          placeholder="Secret code"
          aria-label="Secret code"
          aria-invalid={wrong}
          aria-describedby={wrong ? "code-error" : undefined}
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setWrong(false);
          }}
        />
        {wrong && (
          <p id="code-error" className="field-error" role="alert">
            That&apos;s not it. Try again?
          </p>
        )}
        {failed && (
          <p className="field-error" role="alert">
            Couldn&apos;t check the code. Check your connection and try again.
          </p>
        )}
        <button className="btn btn-primary btn-block" type="submit" disabled={!code || checking}>
          {checking ? "Checking…" : "Unlock"}
        </button>
        <Link to="/" className="text-btn">
          Just browsing? Back to recipes
        </Link>
      </form>
    </div>
  );
}

function loadDraft() {
  try {
    const d = JSON.parse(localStorage.getItem(DRAFT_KEY));
    if (d) {
      return {
        name: d.name ?? "",
        ingredients: (d.ingredients?.length ? d.ingredients : [""]).map(newRow),
        steps: (d.steps?.length ? d.steps : [""]).map(newRow),
      };
    }
  } catch {
    // Corrupt or unavailable; start fresh.
  }
  return { name: "", ingredients: [newRow()], steps: [newRow()] };
}

const clean = (rows) => rows.map((r) => r.value.trim()).filter(Boolean);

// eslint-disable-next-line react/prop-types
function RecipeForm({ onLock, onCodeRejected }) {
  const navigate = useNavigate();
  const { recipes } = useRecipes();
  const [initial] = useState(loadDraft);
  const [name, setName] = useState(initial.name);
  const [ingredients, setIngredients] = useState(initial.ingredients);
  const [steps, setSteps] = useState(initial.steps);
  const [showErrors, setShowErrors] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const hasContent = !!(name.trim() || clean(ingredients).length || clean(steps).length);

  useEffect(() => {
    try {
      if (hasContent) {
        localStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({
            name,
            ingredients: ingredients.map((r) => r.value),
            steps: steps.map((r) => r.value),
          })
        );
      } else {
        localStorage.removeItem(DRAFT_KEY);
      }
    } catch {
      // Drafts are a convenience only.
    }
  }, [name, ingredients, steps, hasContent]);

  const existing = useMemo(() => {
    const n = name.trim().toLowerCase();
    return n ? recipes?.find((r) => r.name.toLowerCase() === n) : undefined;
  }, [name, recipes]);

  const errors = {
    name: !name.trim()
      ? "Give your recipe a name."
      : existing
        ? "exists"
        : null,
    ingredients: clean(ingredients).length ? null : "Add at least one ingredient.",
    steps: clean(steps).length ? null : "Add at least one step.",
  };
  const valid = !errors.name && !errors.ingredients && !errors.steps;

  function discard() {
    if (hasContent && !window.confirm("Discard this draft?")) return;
    setName("");
    setIngredients([newRow()]);
    setSteps([newRow()]);
    setShowErrors(false);
    setSubmitError(null);
  }

  async function submit(e) {
    e.preventDefault();
    setShowErrors(true);
    setSubmitError(null);
    if (!valid) {
      // Wait for the error messages to render before scrolling to the first one.
      requestAnimationFrame(() =>
        document
          .querySelector(".is-invalid, .field-error")
          ?.scrollIntoView({ behavior: "smooth", block: "center" })
      );
      return;
    }

    const recipe = {
      name: name.trim(),
      ingredients: clean(ingredients),
      steps: clean(steps),
    };

    setSubmitting(true);
    try {
      await createRecipe(recipe, storedCode());
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {
        // ignore
      }
      navigate(recipePath(recipe.name), { state: { created: true } });
    } catch (err) {
      if (err instanceof WrongCodeError) {
        onCodeRejected();
        return;
      }
      console.error(err);
      setSubmitError(
        err instanceof RecipeExistsError
          ? `A recipe called “${recipe.name}” already exists. Pick a different name.`
          : "Couldn't save the recipe. Your draft is kept, so you can try again."
      );
      setSubmitting(false);
    }
  }

  return (
    <form className="add-form" onSubmit={submit} noValidate>
      <div className="form-head">
        <div>
          <p className="eyebrow">New recipe</p>
          <h1 className="display">Add to the cookbook</h1>
        </div>
        <button type="button" className="text-btn" onClick={onLock} title="Forget the secret code on this device">
          <LockIcon size={14} /> Lock
        </button>
      </div>

      <div className="field">
        <label htmlFor="recipe-name" className="label">
          Recipe name
        </label>
        <input
          id="recipe-name"
          className={`input input-lg ${showErrors && errors.name ? "is-invalid" : ""}`}
          type="text"
          autoComplete="off"
          autoFocus
          placeholder="e.g. Grandma's phở"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={showErrors && !!errors.name}
        />
        {existing ? (
          <p className="field-error" role="alert">
            You already have a recipe called{" "}
            <Link to={recipePath(existing.name)}>{existing.name}</Link>.
          </p>
        ) : (
          showErrors && errors.name && <p className="field-error">{errors.name}</p>
        )}
      </div>

      <div className="form-cols">
        <div className="field">
          <h2 className="label" id="ingredients-label">
            Ingredients
          </h2>
          <ListEditor
            labelledBy="ingredients-label"
            rows={ingredients}
            onChange={setIngredients}
            placeholder="e.g. 2 cloves garlic, minced"
            addLabel="Add ingredient"
            invalid={showErrors && !!errors.ingredients}
          />
          {showErrors && errors.ingredients && <p className="field-error">{errors.ingredients}</p>}
        </div>

        <div className="field">
          <h2 className="label" id="steps-label">
            Method
          </h2>
          <ListEditor
            labelledBy="steps-label"
            rows={steps}
            onChange={setSteps}
            placeholder="e.g. Bring a large pot of water to a boil."
            addLabel="Add step"
            multiline
            numbered
            invalid={showErrors && !!errors.steps}
          />
          {showErrors && errors.steps && <p className="field-error">{errors.steps}</p>}
        </div>
      </div>

      <p className="hint tips">
        Tip: press <kbd>Enter</kbd> for a new line, <kbd>Backspace</kbd> on an
        empty line to remove it, or paste a whole list at once. Your draft saves
        automatically.
      </p>

      {submitError && (
        <p className="alert" role="alert">
          {submitError}
        </p>
      )}

      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={discard} disabled={!hasContent || submitting}>
          Discard
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Publishing…" : "Publish recipe"}
        </button>
      </div>
    </form>
  );
}

export default AddRecipeApp;
