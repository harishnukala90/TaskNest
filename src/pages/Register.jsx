import { useState } from "react";
<<<<<<< HEAD
import { useNavigate } from "react-router-dom";
import { registerUser } from "../utils/auth";

export default function Register() {
  const navigate = useNavigate();
=======
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../utils/auth";
import { storage } from "../firebase"; 
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Loader from "../components/Loader";
import "/src/styles/Register.css";

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
>>>>>>> 8d2cd8c (final 1/5)

  const [user, setUser] = useState({
    username: "",
    password: "",
<<<<<<< HEAD
    role: "worker",
=======
    role: "worker", // Default role
>>>>>>> 8d2cd8c (final 1/5)
    profile: {
      name: "",
      location: "",
      phone: "",
      age: "",
      description: ""
    }
  });

<<<<<<< HEAD
=======
  const onFileChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
      setPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

>>>>>>> 8d2cd8c (final 1/5)
  const register = async () => {
    try {
      if (!user.username || !user.password) {
        alert("Username and password are required");
        return;
      }
<<<<<<< HEAD

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
=======
      setLoading(true);
      let profilePicUrl = ""; 

      if (image) {
        const imageRef = ref(storage, `profiles/${user.username.toLowerCase()}_${Date.now()}`);
        await uploadBytes(imageRef, image);
        profilePicUrl = await getDownloadURL(imageRef);
      }

      const payload = {
        ...user,
        username: user.username.toLowerCase().trim(),
        profilePic: profilePicUrl,
        activity: [] 
      };

      const userData = await registerUser(payload);
      localStorage.setItem("currentUser", JSON.stringify(userData));
      alert("Registered successfully");
      navigate("/dashboard");
    } catch (error) {
      setLoading(false);
      alert("Registration failed: " + error.message);
    }
  };

  if (loading) return <Loader message="Creating your TaskNest account..." />;

  return (
    <div className="page reg-container">
      <h2 className="reg-title">Register</h2>

      {/* CUSTOM ROLE TOGGLE [Reference: image_b899d7.png] */}
      <div className="role-toggle-container">
        <div className={`role-slider ${user.role}`}></div>
        <button 
          className={`role-btn ${user.role === 'worker' ? 'active' : ''}`}
          onClick={() => setUser({ ...user, role: 'worker' })}
        >
          Worker
        </button>
        <button 
          className={`role-btn ${user.role === 'provider' ? 'active' : ''}`}
          onClick={() => setUser({ ...user, role: 'provider' })}
        >
          Provider
        </button>
      </div>

      <div className="reg-avatar-section">
        <div className="reg-avatar-preview">
          <img style={{alignItems: "center"}} src={preview || "/default-avatar.png"} alt="Preview" />
        </div>
        <label className="reg-file-label">
          {preview ? "Change Profile Picture" : "Upload Profile Picture"}
          <input type="file" accept="image/*" onChange={onFileChange} hidden />
        </label>
      </div>
      
      <h4 className="reg-label">Username</h4>
      <input
        className="reg-input"
        placeholder="Username"
        value={user.username}
        onChange={(e) => setUser({ ...user, username: e.target.value })}
      />

      <h4 className="reg-label">Password</h4>
      <input
        className="reg-input"
        type="password"
        placeholder="Password"
        value={user.password}
        onChange={(e) => setUser({ ...user, password: e.target.value })}
      />
      
      <h4 className="reg-label">Full Name</h4>
      <input
        className="reg-input"
        placeholder="Name"
        value={user.profile.name}
        onChange={(e) => setUser({ ...user, profile: { ...user.profile, name: e.target.value } })}
      />

      <h4 className="reg-label">Location</h4>
      <input
        className="reg-input"
        placeholder="Location"
        value={user.profile.location}
        onChange={(e) => setUser({ ...user, profile: { ...user.profile, location: e.target.value } })}
      />

      <h4 className="reg-label">Phone</h4>
      <input
        className="reg-input"
        placeholder="Phone"
        value={user.profile.phone}
        onChange={(e) => setUser({ ...user, profile: { ...user.profile, phone: e.target.value } })}
      />

      {user.role === "worker" && (
        <>
          <h4 className="reg-label">Age</h4>
          <input
            className="reg-input"
            placeholder="Age"
            value={user.profile.age}
            onChange={(e) => setUser({ ...user, profile: { ...user.profile, age: e.target.value } })}
          />
        </>
      )}

      <h4 className="reg-label">Description</h4>
      <textarea
        className="reg-textarea"
        placeholder={user.role === 'worker' ? "Describe your skills..." : "Describe your company/services..."}
        value={user.profile.description}
        onChange={(e) => setUser({ ...user, profile: { ...user.profile, description: e.target.value } })}
      />

      <button className="reg-submit-btn" onClick={register}>
        Create Account
      </button>

      <p className="reg-prompt">
        Already have an account? &nbsp;
        <Link className="reg-link" to="/">Login</Link> now!
      </p>
    </div>
  );
}
>>>>>>> 8d2cd8c (final 1/5)
