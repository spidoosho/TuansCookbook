import { Link } from "react-router-dom";
import { useDocumentTitle } from "./lib/hooks";

function NotFound() {
  useDocumentTitle("Not found");
  return (
    <div className="empty">
      <p className="empty-emoji" aria-hidden="true">🍳</p>
      <h1>Nothing cooking here</h1>
      <p className="muted">That page doesn&apos;t exist.</p>
      <Link to="/" className="btn btn-primary">
        Browse recipes
      </Link>
    </div>
  );
}

export default NotFound;
