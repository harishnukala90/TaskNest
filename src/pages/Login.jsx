import { useState } from "react";
import { loginUser } from "../utils/auth";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    try {

      if (!username || !password) {
        alert("Enter username & password");
        return;
      }

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
      alert("Login failed: " + error.message);
      console.error(error);
    }
  };

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
        If you don't have  account, &nbsp;"
      <a className="reg-link" href="/register">Register</a>
      "&nbsp;
      now !
      </p>
    </div>

  );
}
