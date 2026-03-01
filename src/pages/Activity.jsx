import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Loader from "../components/Loader";
import ProfileModal from "../components/ProfileModal";
import "../styles/activity.css";
import ScrollToTop from "../components/ScrollToTop";

export default function Activity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  /* ============================================================
     FETCH ACTIVITY
  ============================================================ */
  useEffect(() => {
    const fetchActivity = async () => {
      try {
        if (!auth.currentUser) return;

        const snap = await getDoc(
          doc(db, "users", auth.currentUser.uid)
        );

        if (snap.exists()) {
          const activityData = snap.data().activity || [];

          const filtered = activityData.filter(
            (act) =>
              act.type === "job_completed_summary" ||
              act.message === "Logged in"
          );

          setActivities([...filtered].reverse());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, []);

  /* ============================================================
     CLEAR HISTORY
  ============================================================ */
  const clearHistory = async () => {
    if (!window.confirm("Clear activity history?")) return;

    const userRef = doc(db, "users", auth.currentUser.uid);
    await updateDoc(userRef, { activity: [] });

    setActivities([]);
  };

  /* ============================================================
     OPEN SINGLE PROFILE (WORKER → PROVIDER)
  ============================================================ */
  const handleViewProfile = async (targetId) => {
    if (!targetId) return;

    setModalLoading(true);

    try {
      const snap = await getDoc(doc(db, "users", targetId));

      if (snap.exists()) {
        setSelectedUser({
          ...snap.data(),
          isGroup: false,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) return <Loader message="Fetching history..." />;

  return (
    <div className="page activity-page">
      <div className="activity-header">
        <h1 className="fj-main-heading">Activity History</h1>

        {activities.length > 0 && (
          <button onClick={clearHistory} className="clear-history-btn">
            <span className="material-icons">delete_sweep</span>
            Clear All
          </button>
        )}
      </div>

      <div className="activity-container">
        {activities.length === 0 ? (
          <div className="empty-activity">
            <span className="material-icons">history_toggle_off</span>
            <p>No relevant activity recorded yet.</p>
          </div>
        ) : (
          <div className="timeline">
            {activities.map((act, index) => {
              const isSummary =
                act.type === "job_completed_summary";

              const canView =
                isSummary || act.relatedUserId;

              return (
                <div
                  key={index}
                  className={`timeline-item ${
                    canView ? "clickable" : ""
                  }`}
                  onClick={() => {
                      if (
                        isSummary &&
                        Array.isArray(act.workers) &&
                        act.workers.length > 0
                      ) {
                        setSelectedUser({
                          workers: act.workers,
                          isGroup: true,
                        });
                        return;
                      }
                      if (act.relatedUserId) {
                        handleViewProfile(act.relatedUserId);
                      }
                    }}
                >
                  <div className="timeline-dot"></div>

                  <div className="timeline-content card">
                    <div className="activity-meta">
                      <span className="activity-date">
                        {act.time}
                      </span>

                      {canView && (
                        <span className="view-link">
                          <span className="material-icons">
                            visibility
                          </span>
                          View Profile
                        </span>
                      )}
                    </div>

                    <p className="activity-msg">
                      {isSummary
                        ? `Job Completed: "${act.jobTitle}"`
                        : act.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedUser && (
        <ProfileModal
          profile={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}

      {modalLoading && <Loader message="Opening Profile..." />}
      <ScrollToTop />
    </div>
  );
}