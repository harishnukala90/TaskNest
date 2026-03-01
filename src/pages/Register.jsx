import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../utils/auth";
import { storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Loader from "../components/Loader";
import "/src/styles/register.css";

export default function Register() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

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

  /* =========================
     IMAGE SELECT
  ========================= */
  const onFileChange = (e) => {
    if (!e.target.files[0]) return;

    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  /* =========================
     REGISTER
  ========================= */
  const register = async () => {
    try {
      if (!user.username || !user.password) {
        alert("Username and password required");
        return;
      }

      setLoading(true);

      let profilePicUrl = "";

      // upload image if exists
      if (image) {
        const imageRef = ref(
          storage,
          `profiles/${user.username.toLowerCase()}_${Date.now()}`
        );

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

      localStorage.setItem(
        "currentUser",
        JSON.stringify(userData)
      );

      alert("Registered successfully");
      navigate("/dashboard");

    } catch (error) {
      console.error(error);
      alert("Registration failed: " + error.message);
      setLoading(false);
    }
  };

  /* =========================
     LOADER
  ========================= */
  if (loading)
    return <Loader message="Creating your TaskNest account..." />;

  /* =========================
     UI
  ========================= */
  return (
    <div className="page reg-container">
      <h2 className="reg-title">Register</h2>

      {/* ROLE TOGGLE */}
      <div className="role-toggle-container">
        <div className={`role-slider ${user.role}`} />

        <button
          className={`role-btn ${user.role === "worker" ? "active" : ""}`}
          onClick={() => setUser({ ...user, role: "worker" })}
        >
          Worker
        </button>

        <button
          className={`role-btn ${user.role === "provider" ? "active" : ""}`}
          onClick={() => setUser({ ...user, role: "provider" })}
        >
          Provider
        </button>
      </div>

      {/* PROFILE IMAGE */}
      <div className="reg-avatar-section">
        <div className="reg-avatar-preview">
          <img
            src={preview || "/default-avatar.png"}
            alt="preview"
          />
        </div>

        <label className="reg-file-label">
          {preview ? "Change Profile Picture" : "Upload Profile Picture"}
          <input type="file" accept="image/*" hidden onChange={onFileChange} />
        </label>
      </div>

      {/* FORM */}
      <h4 className="reg-label">Username</h4>
      <input
        className="reg-input"
        value={user.username}
        onChange={(e) =>
          setUser({ ...user, username: e.target.value })
        }
      />

      <h4 className="reg-label">Password</h4>
      <input
        type="password"
        className="reg-input"
        value={user.password}
        onChange={(e) =>
          setUser({ ...user, password: e.target.value })
        }
      />

      <h4 className="reg-label">Full Name</h4>
      <input
        className="reg-input"
        value={user.profile.name}
        onChange={(e) =>
          setUser({
            ...user,
            profile: { ...user.profile, name: e.target.value }
          })
        }
      />

      <h4 className="reg-label">Location</h4>
      <input
        className="reg-input"
        value={user.profile.location}
        onChange={(e) =>
          setUser({
            ...user,
            profile: { ...user.profile, location: e.target.value }
          })
        }
      />

      <h4 className="reg-label">Phone</h4>
      <input
        className="reg-input"
        value={user.profile.phone}
        onChange={(e) =>
          setUser({
            ...user,
            profile: { ...user.profile, phone: e.target.value }
          })
        }
      />

      {user.role === "worker" && (
        <>
          <h4 className="reg-label">Age</h4>
          <input
            className="reg-input"
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

      <h4 className="reg-label">Description</h4>
      <textarea
        className="reg-textarea"
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

      <button className="reg-submit-btn" onClick={register}>
        Create Account
      </button>

      <p className="reg-prompt">
        Already have an account?{" "}
        <Link className="reg-link" to="/">
          Login
        </Link>
      </p>
    </div>
  );
}