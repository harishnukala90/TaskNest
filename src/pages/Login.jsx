<<<<<<< HEAD
import { useState } from "react";
import { loginUser } from "../utils/auth";
=======
import { useState } from "react"; 
import { loginUser } from "../utils/auth";
import Loader from "../components/Loader";
import "/src/styles/Login.css";
>>>>>>> 8d2cd8c (final 1/5)

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
<<<<<<< HEAD

  const login = async () => {
    try {

=======
  const [loading, setLoading] = useState(false);

  const login = async () => {
    try {
>>>>>>> 8d2cd8c (final 1/5)
      if (!username || !password) {
        alert("Enter username & password");
        return;
      }

<<<<<<< HEAD
      // 🔹 Normalize username
      const normalizedUsername =
        username.toLowerCase().trim();

      const userData = await loginUser(
        normalizedUsername,
        password
      );

      if (!userData) {
        alert("Invalid credentials");
        return;
      }

      // 🔹 Save user locally
      localStorage.setItem(
        "currentUser",
        JSON.stringify(userData)
      );

      alert("Login successful");

      // 🔹 Force reload to refresh navbar + routes
      window.location.href = "/dashboard";

    } catch (error) {
=======
      setLoading(true);

      const normalizedUsername = username.toLowerCase().trim();
      const userData = await loginUser(normalizedUsername, password);

      if (!userData) {
        alert("Invalid credentials");
        setLoading(false); 
        return;
      }
      
      localStorage.setItem("currentUser", JSON.stringify(userData));
      
      alert("Login successful");
      // Hard refresh will trigger the Dashboard's own loader next
      window.location.href = "/dashboard";

    } catch (error) {
      setLoading(false); 
>>>>>>> 8d2cd8c (final 1/5)
      alert("Login failed: " + error.message);
      console.error(error);
    }
  };

<<<<<<< HEAD
  return (
    <div className="page">
      <h2>Login</h2>

      <h4>Username</h4>
      <input
        placeholder="Username"
        value={username}
        onChange={(e) =>
          setUsername(e.target.value)
        }
      />

      <h4>password</h4>
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) =>
          setPassword(e.target.value)
        }
      />

      <button onClick={login}>Login</button>
      <br />
      <p className="reg-prompt">
        If you don't have an account, &nbsp;"
      <a className="reg-link" href="/register">Register</a>
      "&nbsp;
      now !
      </p>
    </div>

  );
}
=======
  if (loading) {
    /* ============================================================
       Passing the custom message to your new Loader prop
    ============================================================ */
    return <Loader message="Verifying credentials..." />;
  }

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

      <h4 className="auth-input-label">password</h4>
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
      
      <br className="auth-login-break" />
      
      <p className="reg-prompt auth-registration-hint">
        If you don't have an account, &nbsp;"
        <a className="reg-link auth-redirect-link" href="/register">
          Register
        </a>
        "&nbsp; now !
      </p>
    </div>
  );
}
>>>>>>> 8d2cd8c (final 1/5)
