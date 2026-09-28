/* eslint-disable react/prop-types */
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { PlusIcon, XIcon } from "./icons";
import { newRow } from "../lib/rows";

// Strips "- ", "• ", "1. ", "2) " etc. from pasted list lines.
const cleanLine = (line) => line.replace(/^\s*(?:[-*•]|\d+[.)])\s+/, "").trim();

function AutoTextarea({ value, inputRef, ...props }) {
  const local = useRef(null);
  useLayoutEffect(() => {
    const el = local.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);
  return (
    <textarea
      rows={1}
      value={value}
      ref={(el) => {
        local.current = el;
        inputRef(el);
      }}
      {...props}
    />
  );
}

function ListEditor({ rows, onChange, placeholder, addLabel, multiline, numbered, invalid, labelledBy }) {
  const refs = useRef(new Map());
  const [focusId, setFocusId] = useState(null);

  useEffect(() => {
    if (focusId == null) return;
    const el = refs.current.get(focusId);
    if (el) {
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    }
    setFocusId(null);
  }, [focusId]);

  function update(id, value) {
    onChange(rows.map((r) => (r.id === id ? { ...r, value } : r)));
  }

  function insertAfter(index, values = [""]) {
    const added = values.map(newRow);
    const next = [...rows];
    next.splice(index + 1, 0, ...added);
    onChange(next);
    setFocusId(added[added.length - 1].id);
  }

  function remove(index) {
    if (rows.length === 1) {
      onChange([newRow()]);
      return;
    }
    const next = rows.filter((_, i) => i !== index);
    onChange(next);
    setFocusId(next[Math.max(0, index - 1)].id);
  }

  function onKeyDown(e, index) {
    // Let IMEs (e.g. Vietnamese Telex) finish composing before handling keys.
    if (e.nativeEvent.isComposing) return;
    const row = rows[index];
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!row.value.trim()) return;
      const following = rows[index + 1];
      if (following && !following.value.trim()) setFocusId(following.id);
      else insertAfter(index);
    } else if (e.key === "Backspace" && row.value === "" && rows.length > 1) {
      e.preventDefault();
      remove(index);
    }
  }

  function onPaste(e, index) {
    const text = e.clipboardData.getData("text");
    const lines = text.split(/\r?\n/).map(cleanLine).filter(Boolean);
    if (lines.length < 2) return;
    e.preventDefault();
    const [first, ...rest] = lines;
    const row = rows[index];
    const next = [...rows];
    next[index] = { ...row, value: row.value ? `${row.value} ${first}` : first };
    const added = rest.map(newRow);
    next.splice(index + 1, 0, ...added);
    onChange(next);
    setFocusId(added[added.length - 1].id);
  }

  const Field = multiline ? AutoTextarea : "input";

  return (
    <div className="list-editor" role="group" aria-labelledby={labelledBy}>
      <ol className={numbered ? "rows numbered" : "rows"}>
        {rows.map((row, index) => (
          <li key={row.id} className="row">
            <span className="row-marker" aria-hidden="true">
              {numbered ? index + 1 : "•"}
            </span>
            <Field
              className={`input ${invalid && !row.value.trim() && index === 0 ? "is-invalid" : ""}`}
              type={multiline ? undefined : "text"}
              autoComplete="off"
              placeholder={index === 0 ? placeholder : ""}
              aria-label={`${numbered ? "Step" : "Ingredient"} ${index + 1}`}
              value={row.value}
              {...(multiline
                ? { inputRef: (el) => (el ? refs.current.set(row.id, el) : refs.current.delete(row.id)) }
                : { ref: (el) => (el ? refs.current.set(row.id, el) : refs.current.delete(row.id)) })}
              onChange={(e) => update(row.id, e.target.value)}
              onKeyDown={(e) => onKeyDown(e, index)}
              onPaste={(e) => onPaste(e, index)}
            />
            <button
              type="button"
              className="icon-btn row-remove"
              aria-label={`Remove ${numbered ? "step" : "ingredient"} ${index + 1}`}
              onClick={() => remove(index)}
              tabIndex={-1}
            >
              <XIcon size={16} />
            </button>
          </li>
        ))}
      </ol>
      <button type="button" className="text-btn add-row" onClick={() => insertAfter(rows.length - 1)}>
        <PlusIcon size={16} /> {addLabel}
      </button>
    </div>
  );
}

export default ListEditor;
