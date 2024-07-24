import { Link, NavLink, Outlet } from "react-router-dom";
import Footer from "./Static/Footer";
import { useRef } from "react";

export default function NavRoot() {
  const navbarCollapseRef = useRef(null);

  const handleNavLinkClick = () => {
    if (navbarCollapseRef.current.classList.contains("show")) {
      navbarCollapseRef.current.classList.remove("show");
    }
  };

  return (
    <header>
      <div className="p-0 m-0 shadow-sm" style={{ zIndex: 4 }}>
        <nav className="container navbar navbar-expand-lg py-2 ">
          <div className="container-fluid">
            <h1 className="nav-brand">
              <Link to="/">Flight In Range</Link>
            </h1>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
              aria-controls="navbarNav"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
          </div>
          <div
            className="collapse navbar-collapse"
            id="navbarNav"
            ref={navbarCollapseRef}
          >
            <ul className="navbar-nav ps-3">
              <li className="nav-item">
                <NavLink
                  to="/"
                  className="nav-link"
                  onClick={handleNavLinkClick}
                >
                  Home
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/airlines"
                  className="nav-link"
                  onClick={handleNavLinkClick}
                >
                  Airlines
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/about"
                  className="nav-link"
                  onClick={handleNavLinkClick}
                >
                  About
                </NavLink>
              </li>
            </ul>
          </div>
        </nav>
      </div>
      <Outlet />
      <Footer />
    </header>
  );
}
