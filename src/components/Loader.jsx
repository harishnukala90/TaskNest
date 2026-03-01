<<<<<<< HEAD
export default function Loader() {
  return (
    <div style={{ textAlign: "center", padding: "30px" }}>
      <div className="loader"></div>
    </div>
  );
}
=======
import "/src/styles/Loader.css";

export default function Loader({ message = "Loading..." }) {
  return (
    <div className="loader-overlay">
      <div className="loader-content">
        <div className="pulse-container">
          <div className="pulse-dot"></div>
          <div className="pulse-dot"></div>
          <div className="pulse-dot"></div>
        </div>
        <p className="loader-text">{message}</p>
      </div>
    </div>
  );
}
>>>>>>> 8d2cd8c (final 1/5)
