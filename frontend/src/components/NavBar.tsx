import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth-context";
import "./NavBar.css";

// NavLink (vs. plain Link) automatically adds an "active" class to
// whichever link matches the current page - useful for highlighting
// the current page in the menu.
function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    "nav-bar__link" + (isActive ? " nav-bar__link--active" : "");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="nav-bar">
      {user ? (
        <>
          <NavLink to="/" end className={linkClass}>
            Home
          </NavLink>
          <NavLink to="/gallery" className={linkClass}>
            Gallery
          </NavLink>
          <span className="nav-bar__spacer" />
          <span className="nav-bar__email">{user.email}</span>
          <button type="button" className="nav-bar__logout" onClick={handleLogout}>
            Log Out
          </button>
        </>
      ) : (
        <>
          <NavLink to="/login" className={linkClass}>
            Log In
          </NavLink>
          <NavLink to="/signup" className={linkClass}>
            Sign Up
          </NavLink>
        </>
      )}
    </nav>
  );
}

export default NavBar;
