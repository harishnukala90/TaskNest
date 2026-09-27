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

          // Retain all meaningful activity records
          const filtered = activityData.filter(
            (act) => act && (act.message || act.type)
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

    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, { activity: [] });
      setActivities([]);
    } catch (err) {
      console.error("Failed to clear activity history:", err);
    }
  };

  /* ============================================================
     OPEN SINGLE PROFILE
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
            <p>No activity recorded yet.</p>
          </div>
        ) : (
          <div className="timeline">
            {activities.map((act, index) => {
              const isSummary =
                act.type === "job_completed_summary";

              const canView =
                isSummary || act.relatedUserId || (act.provider && act.provider.uid);

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
                      return;
                    }
                    if (act.provider?.uid) {
                      handleViewProfile(act.provider.uid);
                    }
                  }}
                >
                  <div className="timeline-dot"></div>

                  <div className="timeline-content card">
                    <div className="activity-meta">
                      <span className="activity-date">
                        {act.time || "Recently"}
                      </span>

                      {canView && (
                        <span className="view-link">
                          <span className="material-icons">
                            visibility
                          </span>
                          View Details
                        </span>
                      )}
                    </div>

                    <p className="activity-msg">
                      {isSummary && act.jobTitle
                        ? `Job Completed: "${act.jobTitle}"`
                        : act.message || "Activity recorded"}
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

      {modalLoading && <Loader message="Opening Details..." />}
      <ScrollToTop />
    </div>
  );
}
