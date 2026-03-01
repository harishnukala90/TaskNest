<<<<<<< HEAD
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import logo from "../assets/logo.png";
import "../styles/navbar.css";

export default function Navbar() {

  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* =========================
     HIDE NAVBAR ON LOGIN
  ========================= */
  if (location.pathname === "/" ||
      location.pathname === "/register") {
    return null;
  }

  /* =========================
     LOAD USER SAFELY
  ========================= */
  useEffect(() => {

    const unsubscribe =
      onAuthStateChanged(auth, async (firebaseUser) => {

        if (!firebaseUser) {
          setUser(null);
          setLoading(false);
          return;
        }

        const snap = await getDoc(
          doc(db, "users", firebaseUser.uid)
        );

        if (snap.exists()) {
          setUser(snap.data());
        }

        setLoading(false);
      });

    return () => unsubscribe();

  }, []);

  if (loading || !user) return null;

  /* =========================
     LOGOUT
  ========================= */
  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem("currentUser");
    window.location.href = "/";
  };

  return (
    <nav className="navbar">

      {/* LOGO */}
      <h2
        className="brand"
        onClick={() => navigate("/dashboard")}
        style={{ cursor: "pointer" }}
      >
        TaskNest
      </h2>

      {/* MENU */}
      <div className="morph-menu">

        <img
          src={user.profile?.photo || logo}
          className="morph-icon"
          alt="menu"
        />

        <ul className="menu-list">

          <li onClick={() => navigate("/dashboard")}>
            Dashboard
          </li>

          {user.role === "worker" && (
            <li onClick={() => navigate("/find")}>
              Find Job
            </li>
          )}

          {user.role === "provider" && (
            <li onClick={() => navigate("/post")}>
              Post Job
            </li>
          )}

          <li onClick={() => navigate("/profile")}>
            Profile
          </li>

          <li className="logout" onClick={logout}>
            Logout
          </li>

        </ul>
      </div>
    </nav>
  );
}
=======
import { useState, useEffect, useRef } from "react";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import "../styles/navbar.css";

export default function Navbar({ user, toggleSidebar }) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const displayLetter = (
    user?.profile?.name?.charAt(0) || 
    user?.displayName?.charAt(0) || 
    user?.email?.charAt(0) || 
    "U"
  ).toUpperCase();

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    signOut(auth).then(() => {
      navigate("/");
      setShowMenu(false);
    });
  };

  return (
    <nav className="top-navbar">
      {/* 1. Left side: Menu toggle and Brand */}
      <div className="nav-left">
        <button className="menu-toggle-btn" onClick={toggleSidebar}>
          <span className="material-icons">menu</span>
        </button>
        <div className="nav-brand" onClick={() => navigate("/dashboard")}>
          <img src={logo} alt="TaskNest Logo" className="nav-logo-img" />
          <h1 className="brand-title">TASK<span>NEST</span></h1>
        </div>
      </div>

      {/* 2. Right side: User Profile & Dropdown */}
      <div className="nav-right" ref={menuRef}>
        <div className="nav-avatar-trigger" onClick={() => setShowMenu(!showMenu)}>
          {user?.photoURL ? (
            <img src={user.photoURL} alt="profile" className="nav-avatar" />
          ) : (
            <div className="nav-avatar-letter">
              {displayLetter}
            </div>
          )}
        </div>

        {/* Google-style Dropdown Card */}
        <div className={`google-menu-card ${showMenu ? "active" : ""}`}>
          <button className="menu-close-x" onClick={() => setShowMenu(false)}>
            <span className="material-icons">close</span>
          </button>

          <div className="menu-email">{user?.email}</div>
          
          <div className="menu-avatar-large">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="profile" className="nav-avatar-img-large" />
            ) : (
              <div className="nav-avatar-letter large">
                {displayLetter}
              </div>
            )}
          </div>

          <h2 className="menu-greeting">Hi, {user?.profile?.name || user?.displayName || "User"}!</h2>
          <p className="menu-role-tag">{user?.role || "Member"}</p>

          <button 
            className="manage-account-btn" 
            onClick={() => { navigate("/profile"); setShowMenu(false); }}
          >
            <span className="material-icons">manage_accounts</span>
            <span>Manage your Account</span>
          </button>

          <div className="menu-footer-actions">
            <button className="menu-signout-btn" onClick={handleLogout}>
              <span className="material-icons">logout</span>
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
>>>>>>> 8d2cd8c (final 1/5)
