import "./styles.css";

import { StrictMode } from "react";
import ReactDOM from "react-dom/client";

import RouterApp from "./components/router";

ReactDOM.createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterApp />
  </StrictMode>
);
