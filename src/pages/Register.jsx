import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { registerUser } from "../utils/auth";
import { storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Loader from "../components/Loader";
import "../styles/register.css";
import { validatePassword, getPasswordStrength, getPasswordStrengthLabel } from "../utils/validation";

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

  // Password strength
  const passwordStrength = getPasswordStrength(user.password);
  const strengthInfo = getPasswordStrengthLabel(passwordStrength);

  /* =========================
     IMAGE SELECT
  ========================= */
  const onFileChange = (e) => {
    if (!e.target.files[0]) return;

    const file = e.target.files[0];
    
    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  /* =========================
     REGISTER
  ========================= */
  const register = async () => {
    try {
      // Validate required fields
      if (!user.username || !user.password) {
        toast.error("Username and password are required");
        return;
      }

      // Validate username
      const usernameRegex = /^[a-z0-9_]{3,20}$/;
      if (!usernameRegex.test(user.username)) {
        toast.error("Username must be 3-20 characters (letters, numbers, underscores only)");
        return;
      }

      // Validate password strength
      const passwordValidation = validatePassword(user.password);
      if (!passwordValidation.isValid) {
        toast.error(passwordValidation.message);
        return;
      }

      // Validate name
      if (!user.profile.name || user.profile.name.trim() === "") {
        toast.error("Please enter your full name");
        return;
      }

      setLoading(true);

      let profilePicUrl = "";

      // upload image if exists
      if (image) {
        try {
          const imageRef = ref(
            storage,
            `profiles/${user.username.toLowerCase()}_${Date.now()}`
          );

          await uploadBytes(imageRef, image);
          profilePicUrl = await getDownloadURL(imageRef);
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
          toast.error("Failed to upload profile picture, continuing without it...");
          // Continue without profile picture
        }
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

      toast.success("Account created successfully! 🎉 Welcome to TaskNest!");
      
      navigate("/dashboard");

    } catch (error) {
      console.error(error);
      
      // Handle specific Firebase auth errors
      const errorMessages = {
        "auth/email-already-in-use": "This username is already taken",
        "auth/invalid-email": "Invalid email format",
        "auth/weak-password": "Password is too weak",
        "auth/network-request-failed": "Network error. Please check your connection",
      };
      
      const message = errorMessages[error.code] || "Registration failed. Please try again.";
      toast.error(message);
      setLoading(false);
    }
  };

  /* =========================
     PASSWORD STRENGTH BAR
  ========================= */
  const renderPasswordStrengthBar = () => {
    if (!user.password) return null;

    return (
      <div className="password-strength-container">
        <div className="password-strength-bar">
          {[1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className="password-strength-segment"
              style={{
                backgroundColor: level <= passwordStrength 
                  ? strengthInfo.color 
                  : "var(--border-color, #e0e0e0)",
                width: "25%",
                height: "4px",
                borderRadius: "2px",
                transition: "background-color 0.3s ease"
              }}
            />
          ))}
        </div>
        <span 
          className="password-strength-label"
          style={{ color: strengthInfo.color, fontSize: "0.75rem" }}
        >
          {strengthInfo.label}
        </span>
      </div>
    );
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
        <p>We are facing some issue with profile picture 😅</p>
        <div className="reg-avatar-preview">
          <img
            src={preview || "/default-avatar.png"}
            alt="preview"
          />
        </div>

        <label className="reg-file-label">
          {preview ? "Change Profile Picture" : "Upload Profile Picture"}
          <input 
            type="file" 
            accept="image/*" 
            hidden 
            onChange={onFileChange} 
          />
        </label>
      </div>

      {/* FORM */}
      <h4 className="reg-label">Username</h4>
      <input
        className="reg-input"
        placeholder="3-20 characters (letters, numbers, _)"
        value={user.username}
        onChange={(e) =>
          setUser({ ...user, username: e.target.value.toLowerCase() })
        }
        autoComplete="username"
      />

      <h4 className="reg-label">Password</h4>
      <input
        type="password"
        className="reg-input"
        placeholder="Min 8 chars with uppercase, lowercase & numbers"
        value={user.password}
        onChange={(e) =>
          setUser({ ...user, password: e.target.value })
        }
        autoComplete="new-password"
      />
      {renderPasswordStrengthBar()}

      <h4 className="reg-label">Full Name</h4>
      <input
        className="reg-input"
        placeholder="Your full name"
        value={user.profile.name}
        onChange={(e) =>
          setUser({
            ...user,
            profile: { ...user.profile, name: e.target.value }
          })
        }
        autoComplete="name"
      />

      <h4 className="reg-label">Location</h4>
      <input
        className="reg-input"
        placeholder="Your location"
        value={user.profile.location}
        onChange={(e) =>
          setUser({
            ...user,
            profile: { ...user.profile, location: e.target.value }
          })
        }
        autoComplete="address-level2"
      />

      <h4 className="reg-label">Phone</h4>
      <input
        className="reg-input"
        type="tel"
        placeholder="Your phone number"
        value={user.profile.phone}
        onChange={(e) =>
          setUser({
            ...user,
            profile: { ...user.profile, phone: e.target.value }
          })
        }
        autoComplete="tel"
      />

      {user.role === "worker" && (
        <>
          <h4 className="reg-label">Age</h4>
          <input
            className="reg-input"
            type="number"
            placeholder="Your age"
            min="18"
            max="100"
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
        placeholder="Tell us about yourself..."
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
