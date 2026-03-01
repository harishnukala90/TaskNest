import { useState } from "react";
import { loginUser } from "../utils/auth";
import Loader from "../components/Loader";
import "../styles/login.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  /* =========================
     LOGIN HANDLER
  ========================= */
  const login = async () => {
    try {
      if (!username || !password) {
        alert("Enter username & password");
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
        alert("Invalid credentials");
        setLoading(false);
        return;
      }

      // save locally
      localStorage.setItem(
        "currentUser",
        JSON.stringify(userData)
      );

      alert("Login successful");

      // redirect
      window.location.href = "/dashboard";

    } catch (error) {
      console.error(error);
      alert("Login failed: " + error.message);
      setLoading(false);
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
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <h4 className="auth-input-label">Password</h4>
      <input
        className="auth-input-field auth-password-input"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button className="auth-login-submit" onClick={login}>
        Login
      </button>

      <br />

      <p className="reg-prompt auth-registration-hint">
        If you don't have an account,&nbsp;
        <a className="reg-link auth-redirect-link" href="/register">
          Register
        </a>
        &nbsp;now!
      </p>
    </div>
  );
}