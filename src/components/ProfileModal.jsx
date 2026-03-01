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
    </div>
  );
}