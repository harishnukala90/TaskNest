import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../utils/auth";

export default function Register() {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    username: "",
    password: "",
    role: "worker",
    profile: {
      name: "",
      location: "",
      phone: "",
      age: "",
      description: ""
    }
  });

  const register = async () => {
    try {
      if (!user.username || !user.password) {
        alert("Username and password are required");
        return;
      }

      // 🔹 Normalize username BEFORE sending
      const payload = {
        ...user,
        username: user.username.toLowerCase().trim()
      };

      const userData = await registerUser(payload);

      localStorage.setItem(
        "currentUser",
        JSON.stringify(userData)
      );

      alert("Registered successfully");
      navigate("/dashboard");

    } catch (error) {
      alert("Registration failed: " + error.message);
      console.error(error);
    }
  };

  return (
    <div className="page">
      <h2>Register</h2>
      
      <h4>Username</h4>
      <input
        placeholder="Username"
        value={user.username}
        onChange={(e) =>
          setUser({ ...user, username: e.target.value })
        }
      />

      <h4>password</h4>
      <input
        type="password"
        placeholder="Password"
        value={user.password}
        onChange={(e) =>
          setUser({ ...user, password: e.target.value })
        }
      />

      <h4>Role</h4>
      <select
        value={user.role}
        onChange={(e) =>
          setUser({ ...user, role: e.target.value })
        }
      >
        <option value="worker">Worker</option>
        <option value="provider">Provider</option>
      </select>
      
      <h4>Name</h4>
      <input
        placeholder="Name"
        value={user.profile.name}
        onChange={(e) =>
          setUser({
            ...user,
            profile: { ...user.profile, name: e.target.value }
          })
        }
      />

      <h4>Location</h4>
      <input
        placeholder="Location"
        value={user.profile.location}
        onChange={(e) =>
          setUser({
            ...user,
            profile: { ...user.profile, location: e.target.value }
          })
        }
      />

      <h4>Phone</h4>
      <input
        placeholder="Phone"
        value={user.profile.phone}
        onChange={(e) =>
          setUser({
            ...user,
            profile: { ...user.profile, phone: e.target.value }
          })
        }
      />

      {/* 🔹 AGE only for worker */}
      {user.role === "worker" && (
        <>
        <h4>Age</h4>
        <input
          placeholder="Age"
          value={user.profile.age}
          onChange={(e) =>
            setUser({
              ...user,
              profile: { ...user.profile, age: e.target.value }
            })
          }
        />
        </>
      )}

      <h4>Description</h4>
      <textarea
        placeholder="Description"
        value={user.profile.description}
        onChange={(e) =>
          setUser({
            ...user,
            profile: {
              ...user.profile,
              description: e.target.value
            }
          })
        }
      />

      <button onClick={register}>Create Account</button>
    </div>
  );
}
