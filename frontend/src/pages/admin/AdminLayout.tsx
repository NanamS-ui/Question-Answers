import { ExternalLink, LayoutDashboard, ListChecks, MessagesSquare } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import "./AdminLayout.css";

export function AdminLayout() {
  return (
    <>
      <header className="admin-nav">
        <span className="admin-nav-brand">
          <LayoutDashboard size={20} aria-hidden="true" />
          Administration
        </span>
        <nav className="admin-nav-links">
          <NavLink to="/admin" end>
            <ListChecks size={16} aria-hidden="true" />
            Questions
          </NavLink>
          <NavLink to="/admin/submissions">
            <MessagesSquare size={16} aria-hidden="true" />
            Réponses
          </NavLink>
          <NavLink to="/" className="admin-nav-public">
            <ExternalLink size={16} aria-hidden="true" />
            Voir le site public
          </NavLink>
        </nav>
      </header>
      <Outlet />
    </>
  );
}
