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
