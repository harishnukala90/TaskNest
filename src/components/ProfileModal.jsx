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

    </div>
  );
}