// Editable list rows need stable ids so React keeps focus on the right input.
let nextId = 1;
export const newRow = (value = "") => ({ id: nextId++, value });
