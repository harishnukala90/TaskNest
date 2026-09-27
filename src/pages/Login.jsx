import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { loginUser } from "../utils/auth";
import Loader from "../components/Loader";
import "../styles/login.css";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  /* =========================
     LOGIN HANDLER
  ========================= */
  const login = async () => {
    try {
      if (!username || !password) {
        toast.error("Please enter username & password");
        return;
      }

      setLoading(true);

      // normalize username
      const normalizedUsername = username.toLowerCase().trim();

      const userData = await loginUser(
        normalizedUsername,
        password
      );

      if (!userData) {
        toast.error("Invalid credentials");
        setLoading(false);
        return;
      }

      // save locally
      localStorage.setItem(
        "currentUser",
        JSON.stringify(userData)
      );

      toast.success("Login successful! 🎉");

      // redirect using React Router (no page reload)
      setTimeout(() => {
        navigate("/dashboard");
      }, 500);

    } catch (error) {
      console.error(error);
      
      // Handle specific Firebase auth errors
      const errorMessages = {
        "auth/user-not-found": "No account found with this username",
        "auth/wrong-password": "Incorrect password",
        "auth/invalid-email": "Invalid email format",
        "auth/too-many-requests": "Too many attempts. Please try again later",
        "auth/invalid-credential": "Invalid credentials",
      };
      
      const message = errorMessages[error.code] || "Login failed. Please try again.";
      toast.error(message);
      setLoading(false);
    }
  };

  /* =========================
     HANDLE KEYBOARD SUBMIT
  ========================= */
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      login();
    }
  };

  /* =========================
     LOADER STATE
  ========================= */
  if (loading) {
    return <Loader message="Verifying credentials..." />;
  }

  /* =========================
     UI
  ========================= */
  return (
    <div className="page auth-login-container">
      <h2 className="auth-login-header">Login</h2>

      <h4 className="auth-input-label">Username</h4>
      <input
        className="auth-input-field auth-username-input"
        placeholder="Enter your username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        onKeyDown={handleKeyPress}
        autoComplete="username"
        autoFocus
      />

      <h4 className="auth-input-label">Password</h4>
      <input
        className="auth-input-field auth-password-input"
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={handleKeyPress}
        autoComplete="current-password"
      />

      <button className="auth-login-submit" onClick={login}>
        Login
      </button>

      <br />

      <p className="reg-prompt auth-registration-hint">
        If you don't have an account,&nbsp;
        <Link className="reg-link auth-redirect-link" to="/register">
          Register
        </Link>
        &nbsp;now!
      </p>
    </div>
  );
}
