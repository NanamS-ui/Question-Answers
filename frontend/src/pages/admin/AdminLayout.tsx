import { NavLink, Outlet } from "react-router-dom";
import "./AdminLayout.css";

export function AdminLayout() {
  return (
    <>
      <header className="admin-nav">
        <span className="admin-nav-brand">Administration</span>
        <nav className="admin-nav-links">
          <NavLink to="/admin" end>
            Questionnaires
          </NavLink>
          <NavLink to="/admin/submissions">Réponses</NavLink>
          <NavLink to="/" className="admin-nav-public">
            Voir le site public
          </NavLink>
        </nav>
      </header>
      <Outlet />
    </>
  );
}
