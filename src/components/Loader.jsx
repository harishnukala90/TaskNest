import "/src/styles/loader.css";

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