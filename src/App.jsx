import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import './index.css';

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import FindJob from "./pages/FindJob";
import PostJob from "./pages/PostJob";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import About from "./pages/About";
import Activity from "./pages/Activity";

// Components
import Navbar from "./components/Navbar";
import Sidebar from "./components/SideBar"; 
import ProtectedRoute from "./components/ProtectedRoute";
import Loader from "./components/Loader";
import Footer from "./components/Footer";

function Layout() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  const location = useLocation();

  const authRoutes = ["/", "/register"];
  const isAuthPage = authRoutes.includes(location.pathname);

  /* =========================
     AUTH
  ========================= */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const snap = await getDoc(doc(db, "users", firebaseUser.uid));
        if (snap.exists()) {
          setUser({ uid: firebaseUser.uid, ...snap.data() });
        } else {
          setUser(firebaseUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /* =========================
     THEME SYNC
  ========================= */
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  /* =========================
     SIDEBAR CONTROL
  ========================= */
  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  /* =========================
     AUTO CLOSE ON ROUTE CHANGE
  ========================= */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSidebarOpen(false);
  }, [location.pathname]);

  /* =========================
     THEME TOGGLE
  ========================= */
  const toggleTheme = () => {
    setTheme(prev => (prev === "light" ? "dark" : "light"));
  };

  if (loading) return <Loader />;

  return (
    <div className={`app-shell ${isAuthPage ? "auth-bg" : ""}`}>

      {/* NAVBAR */}
      {!isAuthPage && (
        <Navbar
          user={user}
          toggleSidebar={toggleSidebar}
          toggleTheme={toggleTheme}
          currentTheme={theme}
        />
      )}

      {/* SIDEBAR */}
      {!isAuthPage && (
        <Sidebar
          isOpen={isSidebarOpen}
          user={user}
        />
      )}

      {/* MOBILE BACKDROP (NEW SYSTEM) */}
      {!isAuthPage && (
        <div
          className={`sidebar-backdrop ${isSidebarOpen ? "active" : ""}`}
          onClick={closeSidebar}
        />
      )}

      {/* MAIN CONTENT */}
      <div className="main-wrapper">
        <main
          className="page"
          onClick={() => {
            if (window.innerWidth <= 768 && isSidebarOpen) {
              closeSidebar();
            }
          }}
        >
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/dashboard" element={<ProtectedRoute user={user}><Dashboard /></ProtectedRoute>} />
            <Route path="/findjob" element={<ProtectedRoute user={user}><FindJob /></ProtectedRoute>} />
            <Route path="/postjob" element={<ProtectedRoute user={user}><PostJob /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute user={user}><Profile /></ProtectedRoute>} />
            <Route path="/settings" element={
              <ProtectedRoute user={user}>
                <Settings toggleTheme={toggleTheme} currentTheme={theme} />
              </ProtectedRoute>
            } />
            <Route path="/activity" element={<ProtectedRoute user={user}><Activity /></ProtectedRoute>} />
            <Route path="/about" element={<ProtectedRoute user={user}><About /></ProtectedRoute>} />
          </Routes>
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}