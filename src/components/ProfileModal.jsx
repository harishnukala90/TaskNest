<<<<<<< HEAD
import { useState } from "react";

const overlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000
};

export default function ProfileModal({
  profile,
  title,
  onClose
}) {
  const [theme] = useState(
    localStorage.getItem("theme") || "dark"
  );

  if (!profile) return null;

  /* 🔹 Theme styles */
  const modalStyle = {
    background:
      theme === "dark" ? "#020617" : "#ffffff",
    color:
      theme === "dark" ? "white" : "#020617",
    padding: "20px",
    borderRadius: "10px",
    minWidth: "300px",
    maxWidth: "90vw",
    boxShadow:
      "0 4px 20px rgba(0,0,0,0.4)"
  };

  return (
    <div style={overlay} onClick={onClose}>

      <div
        className="card"
        style={modalStyle}
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        <h3>{title}</h3>

        {/* =========================
           WORKERS LIST
        ========================= */}
        {profile.workers && (
          <div>

            {profile.workers.map(
              (w, i) => (

                <div
                  key={i}
                  className="card"
                  style={{
                    marginBottom: "10px",
                    padding: "10px",
                    background:
                      theme === "dark"
                        ? "#0f172a"
                        : "#f1f5f9",
                    color:
                      theme === "dark"
                        ? "white"
                        : "#020617",
                    cursor: "pointer"
                  }}
                >
                  <p>
                    <strong>
                      {w.profile.name}
                    </strong>
                  </p>

                  <p>
                    {
                      w.profile
                        .description
                    }
                  </p>

                  <button
                    className="call-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href =
                        `tel:${w.profile.phone}`;
                    }}
                  >
                    Call
                  </button>

                </div>

              )
            )}

          </div>
        )}

        {/* =========================
           SINGLE PROFILE
        ========================= */}
        {!profile.workers && (
          <>

            <p>
              <strong>Name:</strong>
              {profile.name}
            </p>

            <p>
              <strong>Location:</strong>
              {profile.location}
            </p>

            <p>
              <strong>Phone:</strong>
              {profile.phone}
            </p>

            {profile.age && (
              <p>
                <strong>Age:</strong>
                {profile.age}
              </p>
            )}

            <p>
              {profile.description}
            </p>

            <button
              className="call-btn"
              onClick={() =>
                window.location.href =
                  `tel:${profile.phone}`
              }
            >
              Call
            </button>

          </>
        )}

        <button
          className="close-btn"
          onClick={onClose}
        >
          Close
        </button>

      </div>

=======
import React, { useState, useEffect } from "react";
import "/src/styles/profilemodal.css";

export default function ProfileModal({ profile, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentData, setCurrentData] = useState(null);
  const [animating, setAnimating] = useState(false);

  /* ============================================================
     DATA SWITCHING (GROUP / SINGLE PROFILE)
  ============================================================ */
  useEffect(() => {
    if (!profile) return;

    if (profile.isGroup && profile.workers?.length) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAnimating(false);

      const timer = setTimeout(() => {
        setCurrentData(profile.workers[currentIndex]);
        setAnimating(true);
      }, 10);

      return () => clearTimeout(timer);
    } else {
      setCurrentData(profile);
      setAnimating(true);
    }
  }, [profile, currentIndex]);

  if (!profile || !currentData) return null;

  /* ============================================================
     NAVIGATION (GROUP MODE)
  ============================================================ */
  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) =>
      prev + 1 >= profile.workers.length ? 0 : prev + 1
    );
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) =>
      prev - 1 < 0 ? profile.workers.length - 1 : prev - 1
    );
  };

  /* ============================================================
     CONTACT BUTTONS
  ============================================================ */
  const renderContactButtons = (phone) => {
    if (!phone || phone === "00") return null;

    const cleanPhone = phone.replace(/\D/g, "");

    return (
      <div className="modal-contact-row">
        <button
          className="contact-btn whatsapp"
          onClick={() =>
            window.open(`https://wa.me/${cleanPhone}`, "_blank")
          }
        >
          <span className="material-icons">message</span>
          WhatsApp
        </button>

        <button
          className="contact-btn call"
          onClick={() => (window.location.href = `tel:${phone}`)}
        >
          <span className="material-icons">call</span>
          Call
        </button>
      </div>
    );
  };

  /* ============================================================
     SAFE DATA EXTRACTION
  ============================================================ */
  const displayName =
    currentData.username ||
    currentData.profile?.name ||
    currentData.name ||
    "User";

  const displayLocation =
    currentData.location ||
    currentData.profile?.location ||
    "Not specified";

  const displayDesc =
    currentData.description ||
    currentData.profile?.description ||
    "Professional Service Provider";

  const displayPhone =
    currentData.phone || currentData.profile?.phone;

  const displayRole = profile.isGroup
    ? `Worker ${currentIndex + 1} of ${profile.workers.length}`
    : currentData.role === "provider"
    ? "Provider"
    : "Worker";

  /* ============================================================
     UI
  ============================================================ */
  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      {/* GROUP NAVIGATION */}
      {profile.isGroup && profile.workers?.length > 1 && (
        <>
          <button className="modal-nav-arrow left" onClick={handlePrev}>
            <span className="material-icons">chevron_left</span>
          </button>

          <button className="modal-nav-arrow right" onClick={handleNext}>
            <span className="material-icons">chevron_right</span>
          </button>
        </>
      )}

      <div
        className={`profile-modal-container ${
          animating ? "profile-animate" : ""
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* CLOSE */}
        <button className="menu-close-x" onClick={onClose}>
          <span className="material-icons">close</span>
        </button>

        {/* HEADER */}
        <header className="profile-modal-header">
          <div className="profile-modal-avatar-large">
            <div className="profile-modal-letter-large">
              {displayName.charAt(0).toUpperCase()}
            </div>
          </div>

          <h2 className="profile-modal-name">
            {profile.isGroup ? displayName : `Hi, ${displayName}!`}
          </h2>

          <p className="profile-modal-role">{displayRole}</p>
        </header>

        {/* DETAILS */}
        <div className="profile-modal-details">
          <div className="detail-item">
            <span className="material-icons">location_on</span>
            <span>
              <strong>Location:</strong> {displayLocation}
            </span>
          </div>

          <div className="detail-item description-section">
            <span className="material-icons">description</span>
            <div className="description-text">
              <p className="profile-modal-description">
                {displayDesc}
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="profile-modal-footer">
          {renderContactButtons(displayPhone)}
        </footer>
      </div>
>>>>>>> 8d2cd8c (final 1/5)
    </div>
  );
}