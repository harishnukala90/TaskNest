import { useState, useEffect } from "react";
import { auth, db, storage } from "../firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { updatePassword } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import Loader from "../components/Loader";
import "../styles/profile.css";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [password, setPassword] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  /* =========================
     LOAD USER
  ========================= */
  useEffect(() => {
    const loadUser = async () => {
      try {
        if (!auth.currentUser) return;

        const snap = await getDoc(
          doc(db, "users", auth.currentUser.uid)
        );

        if (snap.exists()) {
          const data = snap.data();
          setUser({ uid: auth.currentUser.uid, ...data });
          setPreview(data.profilePic || null);
        }
      } catch (err) {
        console.error("Profile load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  /* =========================
     IMAGE CHANGE
  ========================= */
  const handleFileChange = (e) => {
    if (!e.target.files[0]) return;

    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  /* =========================
     SAVE PROFILE
  ========================= */
  const saveProfile = async () => {
    try {
      setIsSaving(true);

      let profilePicUrl = user.profilePic || "";

      // upload new image
      if (image) {
        const imageRef = ref(
          storage,
          `profiles/${user.uid}_${Date.now()}`
        );

        await uploadBytes(imageRef, image);
        profilePicUrl = await getDownloadURL(imageRef);
      }

      const updateData = {
        profile: user.profile,
        profilePic: profilePicUrl
      };

      await updateDoc(doc(db, "users", user.uid), updateData);

      if (password) {
        await updatePassword(auth.currentUser, password);
      }

      setUser({ ...user, ...updateData });
      setPassword("");
      setImage(null);
      setIsEditing(false);

      alert("Profile updated successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to update: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  /* =========================
     STATES
  ========================= */
  if (loading)
    return <Loader message="Loading profile..." />;

  if (isSaving)
    return <Loader message="Saving changes..." />;

  const getInitial = () =>
    (user?.profile?.name ||
      user?.username ||
      "U")
      .charAt(0)
      .toUpperCase();

  /* =========================
     UI
  ========================= */
  return (
    <div className="page prof-main-container">
      <h2>{isEditing ? "Edit Profile" : "My Profile"}</h2>

      <div className="prof-info-card">
        {/* AVATAR */}
        <div className="prof-avatar-display">
          <div className="prof-img-wrapper">
            {preview ? (
              <img
                src={preview}
                alt="Profile"
                className="prof-actual-img"
              />
            ) : (
              <div className="prof-letter-avatar">
                {getInitial()}
              </div>
            )}

            {isEditing && (
              <label className="prof-upload-btn">
                <span className="material-icons">
                  photo_camera
                </span>
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleFileChange}
                />
              </label>
            )}
          </div>

          <h3>{user.profile.name || user.username}</h3>
          <span className="role-badge">{user.role}</span>
        </div>

        {/* DETAILS */}
        {!isEditing ? (
          <div className="prof-view-mode">
            <p><b>Username:</b> {user.username}</p>
            <p><b>Location:</b> {user.profile.location || "Not set"}</p>
            <p><b>Phone:</b> {user.profile.phone || "Not set"}</p>

            {user.role === "worker" && (
              <p><b>Age:</b> {user.profile.age || "Not set"}</p>
            )}

            <p>{user.profile.description || "No description."}</p>

            <button
              className="prof-edit-trigger-btn"
              onClick={() => setIsEditing(true)}
            >
              Edit Details
            </button>
          </div>
        ) : (
          <div className="prof-edit-form">
            <input
              className="prof-input"
              placeholder="Name"
              value={user.profile.name}
              onChange={(e) =>
                setUser({
                  ...user,
                  profile: {
                    ...user.profile,
                    name: e.target.value
                  }
                })
              }
            />

            <input
              className="prof-input"
              placeholder="Location"
              value={user.profile.location}
              onChange={(e) =>
                setUser({
                  ...user,
                  profile: {
                    ...user.profile,
                    location: e.target.value
                  }
                })
              }
            />

            <input
              className="prof-input"
              placeholder="Phone"
              value={user.profile.phone}
              onChange={(e) =>
                setUser({
                  ...user,
                  profile: {
                    ...user.profile,
                    phone: e.target.value
                  }
                })
              }
            />

            {user.role === "worker" && (
              <input
                className="prof-input"
                placeholder="Age"
                value={user.profile.age}
                onChange={(e) =>
                  setUser({
                    ...user,
                    profile: {
                      ...user.profile,
                      age: e.target.value
                    }
                  })
                }
              />
            )}

            <textarea
              className="prof-textarea"
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

            <input
              type="password"
              className="prof-input"
              placeholder="New password (optional)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="prof-edit-actions">
              <button className="primary-btn" onClick={saveProfile}>
                Save Changes
              </button>
              <button
                className="secondary-btn"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}