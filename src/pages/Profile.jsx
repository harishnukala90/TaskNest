import { useState, useEffect } from "react";
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

    </div>
  );
}