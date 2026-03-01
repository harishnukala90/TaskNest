import { useState } from "react";
import { auth } from "../firebase";
import { updatePassword } from "firebase/auth";
import Loader from "../components/Loader";
import "../styles/settings.css";

export default function Settings({ toggleTheme, currentTheme }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return alert("Passwords do not match");
    
    setLoading(true);
    try {
      await updatePassword(auth.currentUser, newPassword);
      alert("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader message="Updating settings..." />;

  return (
    <div className="page settings-page">
      <h1 className="settings-title">Settings</h1>
      
      <div className="settings-content">
        
        {/* APPEARANCE SECTION */}
        <div className="settings-header-group">
          <h3>Appearance</h3>
          <p>Switch between light and dark mode</p>
        </div>

        <section className="settings-card-flat">
           <div className="theme-toggle-pill-container" onClick={toggleTheme}>
              <div className={`theme-pill-slider ${currentTheme}`}></div>
              <div className={`pill-option ${currentTheme === 'light' ? 'active' : ''}`}>
                <span className="material-icons">light_mode</span>
                Light Mode
              </div>
              <div className={`pill-option ${currentTheme === 'dark' ? 'active' : ''}`}>
                <span className="material-icons">dark_mode</span>
                Dark Mode
              </div>
           </div>
        </section>

        {/* SECURITY SECTION */}
        <div className="settings-header-group">
          <h3>Security</h3>
          <p>Update your account password</p>
        </div>

        <section className="settings-card-flat">
          <form onSubmit={handlePasswordUpdate} className="settings-security-form">
            <div className="password-inputs">
              <input 
                type="password" 
                placeholder="New Password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <input 
                type="password" 
                placeholder="Confirm New Password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="settings-save-btn">
              Update Password
            </button>
          </form>
        </section>

      </div>
    </div>
  );
}