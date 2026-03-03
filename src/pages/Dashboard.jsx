import { useState, useEffect } from "react";
import WorkerCard from "../components/WorkerCard";
import ProfileModal from "../components/ProfileModal";
import Loader from "../components/Loader";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  arrayUnion
} from "firebase/firestore";
import { auth, db } from "../firebase";
import "/src/styles/dashboard.css";

export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [, setModalTitle] = useState("");

  /* =========================
      LOAD CURRENT USER
  ========================= */
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const snap = await getDoc(doc(db, "users", user.uid));
          if (snap.exists()) {
            setCurrentUser({ uid: user.uid, ...snap.data() });
          }
        } catch (error) {
          console.error("Error loading user:", error);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  /* =========================
      REALTIME JOBS
  ========================= */
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "jobs"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setJobs(
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      );
    });
    return () => unsubscribe();
  }, []);

  /* =========================
      WORKER MANAGEMENT SYSTEM
  ========================= */
  const updateWorkerStatus = async (job, targetWorker, newStatus) => {
    try {
      const updatedWorkers = (job.appliedWorkers || []).map(w => {
        if (w.uid === targetWorker.uid) {
          return { ...w, status: newStatus };
        }
        return w;
      });

      await updateDoc(doc(db, "jobs", job.id), {
        appliedWorkers: updatedWorkers
      });

      await updateDoc(doc(db, "users", targetWorker.uid), {
        activity: arrayUnion({
          type: `job_${newStatus}`,
          message: `Your application for "${job.title}" was ${newStatus}.`,
          time: new Date().toLocaleString(),
          relatedUserId: currentUser.uid 
        })
      });
      
      alert(`Worker ${newStatus}!`);
    } catch (error) {
      console.error("Error updating worker:", error);
    }
  };

  /* =========================
      DELETE & COMPLETE
  ========================= */
const deleteJob = async (job) => {

  if (!window.confirm("Delete this job? All applicants will be notified."))
    return;

  try {

    /* =========================
       1️⃣ GET PROVIDER SNAPSHOT
    ========================= */
    const providerSnap = await getDoc(
      doc(db, "users", currentUser.uid)
    );

    const providerData = providerSnap.data();

    /* =========================
       2️⃣ STORE PROVIDER HISTORY
    ========================= */
    updateDoc(doc(db, "users", currentUser.uid), {
      activity: arrayUnion({
        type: "delete_job",
        message: `You deleted the job: "${job.title}"`,
        time: new Date().toLocaleString(),
        relatedUserId: null
      })
    }).catch(() => {});

    /* =========================
       3️⃣ SAVE PROVIDER DETAILS
       INTO EACH WORKER HISTORY
    ========================= */
    (job.appliedWorkers || []).forEach((w) => {
      updateDoc(doc(db, "users", w.uid), {
        activity: arrayUnion({
          type: "job_cancelled",

          jobTitle: job.title,
          location: job.location,
          date: job.date,

          // ⭐ IMPORTANT PART
          provider: {
            uid: currentUser.uid,
            username: providerData.username,
            profile: providerData.profile
          },

          message: `The job "${job.title}" was deleted by ${providerData.username}.`,
          time: new Date().toLocaleString()
        })
      }).catch(() => {});
    });

    /* =========================
       4️⃣ DELETE JOB LAST
    ========================= */
    await deleteDoc(doc(db, "jobs", job.id));

    alert("Job deleted successfully!");

  } catch (error) {
    console.error("Delete failed:", error);
    alert("Failed to delete job");
  }
};

  const markCompleted = async (job) => {
    try {
      // 1. Mark the job as completed in the jobs collection
      await updateDoc(doc(db, "jobs", job.id), { status: "completed" });

      const hiredWorkers = (job.appliedWorkers || [])
        .filter(w => w.status === "approved")
        .map(w => ({ 
          ...w, 
          uid: w.uid, 
          username: w.username || w.name 
        }));

      if (hiredWorkers.length === 0) {
        alert("Job completed, successfully");
        return;
      }

      // 2. Add to Provider's History
      await updateDoc(doc(db, "users", currentUser.uid), {
        activity: arrayUnion({
          type: "job_completed_summary", 
          jobTitle: job.title,
          workers: hiredWorkers,
          time: new Date().toLocaleString(),
          isGroup: true 
        })
      });

      // 3. Add to ALL Hired Workers' Histories
      // MODIFICATION: Using type 'job_completed_summary' so it passes the Activity.jsx filter
      const notifyPromises = hiredWorkers.map(w => 
        updateDoc(doc(db, "users", w.uid), {
          activity: arrayUnion({
            type: "job_completed_summary", 
            message: `Job "${job.title}" is marked as completed.`,
            jobTitle: job.title,
            time: new Date().toLocaleString(),
            relatedUserId: currentUser.uid
          })
        })
      );
      await Promise.all(notifyPromises);

      alert("Job completed, successfully");
    } catch (error) {
      console.error("Error marking job as completed:", error);
    }
  };

  if (loading) return <Loader message="Loading dashboard..." />;
  if (!currentUser) return <div className="page">Please log in.</div>;

  /* =========================
      PROVIDER VIEW
  ========================= */
  if (currentUser.role === "provider") {
    const myJobs = jobs.filter(job => job.providerId === currentUser.uid);

    return (
      <div className=" db-provider-container">
        <h1>Dashboard</h1>
        <h2>My Jobs</h2>
        {myJobs.length === 0 && (
          <p className="empty-message">No jobs posted yet.</p>
        )}

        {myJobs.map(job => {
          const approvedCount = (job.appliedWorkers || []).filter(w => w.status === "approved").length;
          const totalNeeded = job.requiredWorkers || 1;
          const hiredPercentage = (approvedCount / totalNeeded) * 100;
          const visibleWorkers = (job.appliedWorkers || []).filter(w => w.status !== "declined" && w.status !== "removed");

          return (
            <div key={job.id} className="card db-job-card">
              <h3>{job.title}</h3>
              <p>Location: {job.location}</p>
              
              <div className="hiring-info">
                <div className="hiring-progress-container-dual">
                  <div className="hiring-progress-bar joined" style={{ width: `${hiredPercentage}%` }}></div>
                </div>
                <span className="hiring-status-text">
                    {approvedCount} Hired / {totalNeeded} Total
                </span>
              </div>

              <div className="db-workers-list">
                {visibleWorkers.map(worker => (
                  <div key={worker.uid} className="db-worker-card-container">
                    <div onClick={() => { 
                        setSelectedProfile({ ...worker, role: "worker" }); 
                        setModalTitle("Worker Details"); 
                    }}>
                      <WorkerCard 
                        worker={worker} 
                        onRemove={worker.status === "approved" ? () => updateWorkerStatus(job, worker, "removed") : null} 
                      >
                        {(!worker.status || worker.status === "pending") && (
                          <div className="worker-card-actions">
                            <button className="approve-btn" onClick={(e) => { e.stopPropagation(); updateWorkerStatus(job, worker, "approved"); }}>Approve</button>
                            <button className="decline-btn" onClick={(e) => { e.stopPropagation(); updateWorkerStatus(job, worker, "declined"); }}>Decline</button>
                          </div>
                        )}
                      </WorkerCard>
                    </div>
                  </div>
                ))}
              </div>

              <div className="db-card-footer">
                {job.status !== "completed" ? (
                  <button className="complete-btn" onClick={() => markCompleted(job)}>Complete Job</button>
                ) : (
                  <button className="delete-btn" onClick={() => deleteJob(job)}>Delete Job Record</button>
                )}
              </div>
            </div>
          );
        })}
        
        {selectedProfile && (
          <ProfileModal 
            profile={selectedProfile} 
            currentUser={currentUser}
            onClose={() => setSelectedProfile(null)} 
          />
        )}
      </div>
    );
  }

  /* =========================
      WORKER VIEW
  ========================= */
  if (currentUser.role === "worker") {
    const appliedJobs = jobs.filter(job => (job.appliedWorkers || []).some(w => w.uid === currentUser.uid));

    return (
      <div className="page db-worker-container">
        <h1>My Applications</h1>
        {appliedJobs.length === 0 && (
          <p className="empty-message">No applied jobs yet.</p>
        )}
        <div className="db-worker-list">
          {appliedJobs.map(job => {
            const myData = job.appliedWorkers.find(w => w.uid === currentUser.uid);
            return (
              <div key={job.id} className={`card db-applied-job-card status-${myData.status}`} onClick={() => { setSelectedProfile({ ...job.providerProfile, id: job.providerId, role: "provider" }); }}>
                <div className="db-applied-header">
                  <h3>{job.title}</h3>
                  <span className={`status-badge ${myData.status}`}>{myData.status}</span>
                </div>
                <p>{job.location} | Wage: {job.wage}</p>
              </div>
            );
          })}
        </div>
        
        {selectedProfile && (
          <ProfileModal 
            profile={selectedProfile} 
            currentUser={currentUser}
            onClose={() => setSelectedProfile(null)} 
          />
        )}
      </div>
    );
  }
}
