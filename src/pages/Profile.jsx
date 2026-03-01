import { useState, useEffect } from "react";
<<<<<<< HEAD
import { auth, db } from "../firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { updatePassword } from "firebase/auth";
import ProfileModal from "../components/ProfileModal";

export default function Profile() {

  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showActivity, setShowActivity] = useState(false);

  const [selectedProfile, setSelectedProfile] = useState(null);
  const [modalTitle, setModalTitle] = useState("");

  const [password, setPassword] = useState("");
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "dark"
  );

  /* =========================
     LOAD USER
  ========================= */
  useEffect(() => {

    const loadUser = async () => {

      if (!auth.currentUser) return;

      const snap = await getDoc(
        doc(db, "users", auth.currentUser.uid)
      );

      if (snap.exists()) {
        setUser({
          uid: auth.currentUser.uid,
          ...snap.data()
        });
      }
    };

    loadUser();

  }, []);

  if (!user) {
    return <p style={{ padding: 20 }}>Loading profile...</p>;
  }

  /* =========================
     PROFILE UPDATE
  ========================= */
  const saveProfile = async () => {

    await updateDoc(
      doc(db, "users", user.uid),
      { profile: user.profile }
    );

    if (password) {
      await updatePassword(auth.currentUser, password);
    }

    alert("Profile updated");
    setIsEditing(false);
    setPassword("");
  };

  /* =========================
     THEME
  ========================= */
  const toggleTheme = () => {

    const next =
      theme === "dark" ? "light" : "dark";

    document.body.className = next;
    localStorage.setItem("theme", next);
    setTheme(next);
  };

  /* =========================
     CLEAR ACTIVITY
  ========================= */
  const clearActivity = async () => {

    if (!window.confirm("Clear activity history?"))
      return;

    await updateDoc(
      doc(db, "users", user.uid),
      { activity: [] }
    );

    setUser({ ...user, activity: [] });
  };

  /* =========================
     ACTIVITY CLICK
  ========================= */
  const openActivity = (activity) => {

    // Worker → Provider modal
    if (activity.providerProfile) {

      setSelectedProfile(
        activity.providerProfile
      );

      setModalTitle("Provider Details");
      return;
    }

    // Provider → Workers list modal
    if (activity.workers) {

      setSelectedProfile({
        workers: activity.workers
      });

      setModalTitle("Workers Applied");
      return;
    }

    alert("No details available");
  };

  /* =========================
     UI
  ========================= */
  return (
    <div className="page">

      {/* HEADER */}
      <div style={{
        display: "flex",
        justifyContent: "space-between"
      }}>
        <h2>My Profile</h2>

        <button
          onClick={() =>
            setShowSettings(!showSettings)
          }
        >
          ⚙️
        </button>
      </div>

      {/* PROFILE CARD */}
      <div className="card" style={{marginTop:30}}>
        
        <h2 style={{
              padding: "12px",
              borderBottom: "1px solid #4d4b4b",
              cursor: "pointer"
            }}>
              User Details
        </h2>
        <p><b>Username:</b> {user.username}</p>
        <p><b>Role:</b> {user.role}</p>

        {!isEditing ? (
          <>
            <p><b>Name:</b> {user.profile.name}</p>
            <p><b>Location:</b> {user.profile.location}</p>
            <p><b>Phone:</b> {user.profile.phone}</p>
            <p>{user.profile.description}</p>
          </>
        ) : (
          <>
            <h4>Name</h4>
            <input
              value={user.profile.name}
              onChange={e =>
                setUser({
                  ...user,
                  profile: {
                    ...user.profile,
                    name: e.target.value
                  }
                })
              }
            />

            <h4>Location</h4>
            <input
              value={user.profile.location}
              onChange={e =>
                setUser({
                  ...user,
                  profile: {
                    ...user.profile,
                    location: e.target.value
                  }
                })
              }
            />

            <h4>Phone</h4>
            <input
              value={user.profile.phone}
              onChange={e =>
                setUser({
                  ...user,
                  profile: {
                    ...user.profile,
                    phone: e.target.value
                  }
                })
              }
            />

            <h4>Description</h4>
            <textarea
              value={user.profile.description}
              onChange={e =>
                setUser({
                  ...user,
                  profile: {
                    ...user.profile,
                    description: e.target.value
                  }
                })
              }
            />

            <h4>Change Password</h4>
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={e =>
                setPassword(e.target.value)
              }
            />

            <button onClick={saveProfile}>
              Save
            </button>

            <button
              onClick={() =>
                setIsEditing(false)
              }
            >
              Cancel
            </button>
          </>
        )}
      </div>

      {/* =========================
         ACTIVITY HISTORY LIST
      ========================= */}
      {showActivity && (

        <div className="card">

          <h3>Activity History</h3>

          {(user.activity || []).length === 0 && (
            <p>No activity yet</p>
          )}

          <ul style={{
            listStyle: "none",
            padding: 0
          }}>

            {(user.activity || [])
              .slice()
              .reverse()
              .map((a, i) => (

                <li
                  key={i}
                  style={{
                    padding: "12px",
                    borderBottom: "1px solid #333",
                    cursor: "pointer"
                  }}
                  onClick={() =>
                    openActivity(a)
                  }
                >
                  <strong>{a.time}</strong>
                  <br />
                  {a.message}
                </li>

              ))}

          </ul>

        </div>
      )}

      {/* SETTINGS */}
      {showSettings && (
        <div className="card">

          <h2>Settings</h2>
          <button
            onClick={() => {
              setIsEditing(true);
              setShowSettings(false);
            }}
            style={{
              margin : 10
            }}
          >
            Edit Profile
          </button>

          <button onClick={toggleTheme}
            style={{
              margin : 10
            }}
          >
            Toggle Theme
          </button>

          <button
            onClick={() =>
              setShowActivity(!showActivity)
            }
            style={{
              margin : 10
            }}
          >
            {showActivity
              ? "Hide Activity"
              : "Show Activity"}
          </button>

          <button onClick={clearActivity}
          style={{
              margin : 10
            }}
          >
            Clear Activity
          </button>

        </div>
      )}

      {/* MODAL */}
      <ProfileModal
        profile={selectedProfile}
        title={modalTitle}
        onClose={() =>
          setSelectedProfile(null)
        }
      />

=======
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

  useEffect(() => {

    const loadUser = async () => {
      try {
        if (!auth.currentUser) return;
        const snap = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (snap.exists()) {
          const data = snap.data();
          setUser({ uid: auth.currentUser.uid, ...data });
          setPreview(data.profilePic || null);
        }
      } catch (error) {
        console.error("Profile load error:", error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setImage(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const saveProfile = async () => {
    try {
      setIsSaving(true);
      let profilePicUrl = user.profilePic || "";

      if (image) {
        const imageRef = ref(storage, `profiles/${user.uid}_${Date.now()}`);
        await uploadBytes(imageRef, image);
        profilePicUrl = await getDownloadURL(imageRef);
      }

      const updateData = { 
        profile: user.profile,
        profilePic: profilePicUrl 
      };
      
      await updateDoc(doc(db, "users", user.uid), updateData);
      
      if (password) await updatePassword(auth.currentUser, password);
      
      setUser({ ...user, ...updateData });
      alert("Profile updated successfully");
      setIsEditing(false);
      setPassword("");
      setImage(null);
    } catch (error) {
      alert("Failed to update: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <Loader message="Loading profile..." />;
  if (isSaving) return <Loader message="Saving changes..." />;

  const getInitial = () => (user?.profile?.name || user?.username || "U").charAt(0).toUpperCase();

  return (
    <div className="page prof-main-container">
      <div className="prof-header-flex">
        <h2>{isEditing ? "Edit Profile" : "My Profile"}</h2>
      </div>

      <div className="prof-info-card">
        <div className="prof-avatar-display">
          <div className="prof-img-wrapper">
            {preview ? (
              <img src={preview} alt="Profile" className="prof-actual-img" />
            ) : (
              <div className="prof-letter-avatar">{getInitial()}</div>
            )}
            
            {/* FLOATING CAMERA ICON */}
            {isEditing && (
              <label className="prof-upload-btn" title="Change Photo">
                <span className="material-icons">photo_camera</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  hidden 
                />
              </label>
            )}
          </div>
          <div className="prof-basic-meta">
            <h3>{user.profile.name || user.username}</h3>
            <span className="role-badge">{user.role}</span>
          </div>
        </div>

        <div className="prof-details-grid">
          {!isEditing ? (
            <div className="prof-view-mode">
              <div className="view-group">
                <p><b className="prof-label">Username:</b> {user.username}</p>
                <p><b className="prof-label">Location:</b> {user.profile.location || "Not set"}</p>
                <p><b className="prof-label">Phone:</b> {user.profile.phone || "Not set"}</p>
                {user.role === "worker" && (
                   <p><b className="prof-label">Age:</b> {user.profile.age || "Not set"}</p>
                )}
              </div>
              <div className="prof-bio">
                <b className="prof-label">Description:</b>
                <p>{user.profile.description || "No description provided."}</p>
              </div>
              <button className="prof-edit-trigger-btn" onClick={() => setIsEditing(true)}>
                Edit Details
              </button>
            </div>
          ) : (
            <div className="prof-edit-form">
              <h4 className="reg-label">Full Name</h4>
              <input className="prof-input" placeholder="Name" value={user.profile.name} 
                onChange={e => setUser({...user, profile: {...user.profile, name: e.target.value}})} />
              
              <h4 className="reg-label">Location</h4>
              <input className="prof-input" placeholder="Location" value={user.profile.location} 
                onChange={e => setUser({...user, profile: {...user.profile, location: e.target.value}})} />
              
              <h4 className="reg-label">Phone</h4>
              <input className="prof-input" placeholder="Phone" value={user.profile.phone} 
                onChange={e => setUser({...user, profile: {...user.profile, phone: e.target.value}})} />

              {user.role === "worker" && (
                <>
                  <h4 className="reg-label">Age</h4>
                  <input className="prof-input" placeholder="Age" value={user.profile.age} 
                    onChange={e => setUser({...user, profile: {...user.profile, age: e.target.value}})} />
                </>
              )}
              
              <h4 className="reg-label">Bio Description</h4>
              <textarea className="prof-textarea" placeholder="Description" value={user.profile.description} 
                onChange={e => setUser({...user, profile: {...user.profile, description: e.target.value}})} />
              
              <h4 className="reg-label">Update Password</h4>
              <input className="prof-input" type="password" placeholder="Leave blank to keep current" value={password} 
                onChange={e => setPassword(e.target.value)} />
              
              <div className="prof-edit-actions">
                <button className="primary-btn" onClick={saveProfile}>Save Changes</button>
                <button className="secondary-btn" onClick={() => setIsEditing(false)}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
>>>>>>> 8d2cd8c (final 1/5)
    </div>
  );
}