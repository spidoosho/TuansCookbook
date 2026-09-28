import { Link, NavLink } from "react-router-dom";
import { PlusIcon, PotIcon } from "./icons";

function MyNavbar() {
  return (
    <header className="nav">
      <div className="nav-inner">
        <Link to="/" className="brand">
          <span className="brand-mark">
            <PotIcon size={20} />
          </span>
          <span className="brand-name">Tuan&apos;s Cookbook</span>
        </Link>
        <nav className="nav-links">
          <NavLink to="/" end className="nav-link">
            Recipes
          </NavLink>
          <Link to="/add" className="btn btn-primary btn-sm" aria-label="Add recipe">
            <PlusIcon size={16} />
            <span className="hide-xs">Add recipe</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default MyNavbar;
