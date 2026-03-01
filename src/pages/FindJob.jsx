import { useEffect, useState } from "react";
import {
  onSnapshot,
  updateDoc,
  arrayUnion,
  doc,
  getDoc,
  collection
} from "firebase/firestore";
import { auth, db } from "../firebase";
<<<<<<< HEAD

export default function FindJob() {

  const [jobs, setJobs] = useState([]);
  const [worker, setWorker] = useState(null);

  /* =========================
     LOAD WORKER PROFILE
  ========================= */
  useEffect(() => {

    const loadUser = async () => {

      if (!auth.currentUser) return;

      const snap = await getDoc(
        doc(db, "users", auth.currentUser.uid)
      );

      if (snap.exists()) {
        setWorker({
          uid: auth.currentUser.uid,
          ...snap.data()
        });
      }
    };

    loadUser();

  }, []);

  /* =========================
     REALTIME JOBS
  ========================= */
  useEffect(() => {

    const unsubscribe =
      onSnapshot(collection(db, "jobs"), (snap) => {

        const now = new Date();

        const jobsList = snap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))

          // Hide expired jobs
          .filter(job => {

            if (!job.date || !job.timeTo) return true;

            const end = new Date(
              `${job.date}T${job.timeTo}`
            );

            return end > now;
          });

        setJobs(jobsList);
      });

    return () => unsubscribe();

  }, []);

  /* =========================
     LOADING
  ========================= */
  if (!worker) {
    return (
      <p style={{ padding: "20px" }}>
        Loading jobs...
      </p>
    );
  }

  /* =========================
     CHECK APPLIED
  ========================= */
  const hasAlreadyApplied = (job) => {

    return (job.appliedWorkers || []).some(
      w => w.uid === worker.uid
    );
  };

  /* =========================
     APPLY JOB
  ========================= */
  const applyJob = async (job) => {

    try {

      // ❌ Prevent apply on completed jobs
      if (job.status === "completed") {
        alert("Job already completed");
        return;
      }

      // ❌ Prevent duplicate apply
      if (hasAlreadyApplied(job)) {
        alert("Already applied");
        return;
      }

      // ❌ Slot full check
      if (
        (job.appliedWorkers || []).length >=
        job.requiredWorkers
      ) {
        alert("No slots available");
        return;
      }

      /* 🔹 ADD WORKER TO JOB */
      await updateDoc(
        doc(db, "jobs", job.id),
        {
          appliedWorkers: arrayUnion({
            uid: worker.uid,
            username: worker.username,
            profile: worker.profile
          })
        }
      );

      /* 🔹 ADD WORKER ACTIVITY */
      await updateDoc(
        doc(db, "users", worker.uid),
        {
          activity: arrayUnion({
            type: "applied_job",
            message: `Applied for "${job.title}"`,
            jobTitle: job.title,
            jobId: job.id,
            time: new Date().toLocaleString(),
            providerProfile: job.providerProfile
          })
        }
      );

      alert("Applied successfully");

    } catch (error) {
      console.error(error);
      alert("Failed to apply for job");
=======
import Loader from "../components/Loader";
import "../styles/FindJob.css";

export default function FindJob() {
  const [jobs, setJobs] = useState([]);
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);

  /* =========================
      LOAD WORKER PROFILE
  ========================= */
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const snap = await getDoc(doc(db, "users", firebaseUser.uid));
          if (snap.exists()) {
            setWorker({ uid: firebaseUser.uid, ...snap.data() });
          }
        } catch (error) {
          console.error("Error loading worker:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  /* =========================
      REALTIME JOBS
  ========================= */
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "jobs"), (snap) => {
      const now = new Date();
      const jobsList = snap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(job => {
          if (!job.date || !job.timeTo) return true;
          const end = new Date(`${job.date}T${job.timeTo}`);
          return end > now;
        });
      setJobs(jobsList);
    });
    return () => unsubscribe();
  }, []);

  /* =========================
      LOGIC HELPERS
  ========================= */
  const hasAlreadyApplied = (job) => (job.appliedWorkers || []).some(w => w.uid === worker.uid);
  const getApprovedCount = (job) => (job.appliedWorkers || []).filter(w => w.status === "approved").length;

  /* =========================
      APPLY FOR JOB
  ========================= */
  const applyJob = async (job) => {
    try {
      if (job.status === "completed") return alert("Job already completed");
      if (hasAlreadyApplied(job)) return alert("Already applied.");
      if (getApprovedCount(job) >= (job.requiredWorkers || 1)) return alert("No slots available");

      // 1. Update Job List
      await updateDoc(doc(db, "jobs", job.id), {
        appliedWorkers: arrayUnion({
          uid: worker.uid,
          username: worker.username,
          profile: worker.profile,
          status: "pending"
        })
      });

      // 2. Update Worker Activity
      await updateDoc(doc(db, "users", worker.uid), {
        activity: arrayUnion({
          type: "applied_job",
          message: `Applied for "${job.title}"`,
          time: new Date().toLocaleString(),
          relatedUserId: job.providerId // ID of the Provider
        })
      });

      // 3. Update Provider Activity
      if (job.providerId) {
        await updateDoc(doc(db, "users", job.providerId), {
          activity: arrayUnion({
            type: "new_applicant",
            message: `${worker.username} applied for: "${job.title}"`,
            time: new Date().toLocaleString(),
            relatedUserId: worker.uid // ID of the Worker
          })
        });
      }

      alert("Applied successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to apply");
>>>>>>> 8d2cd8c (final 1/5)
    }
  };

  /* =========================
<<<<<<< HEAD
     UI
  ========================= */
  return (
    <div className="page">
        <h1
          style={{
              padding: "12px",
              borderBottom: "1px solid #4d4b4b",
              cursor: "pointer"
            }}
        >
          Find Jobs
        </h1>
        <br/>
      <h2>Available Jobs</h2>

      {jobs.length === 0 && (
        <p>No jobs available.</p>
      )}

      {jobs.map(job => (

        <div key={job.id} className="card">

          <h3>{job.title}</h3>

          <p>Date: {job.date}</p>

          <p>
            Contact Time:
            {job.timeFrom} – {job.timeTo}
          </p>

          {/* STATUS */}
          {job.status === "completed" && (
            <p style={{
              color: "orange",
              fontWeight: "bold"
            }}>
              Completed
            </p>
          )}

          {/* APPLY BUTTON */}
          {job.status !== "completed" &&
          (job.appliedWorkers || []).length <
          job.requiredWorkers &&
          !hasAlreadyApplied(job) ? (

            <button onClick={() => applyJob(job)}>
              Apply
            </button>

          ) : hasAlreadyApplied(job) ? (

            <p style={{
              color: "#38bdf8",
              fontWeight: "bold"
            }}>
              Applied
            </p>

          ) : (

            <p style={{
              color: "red",
              fontWeight: "bold"
            }}>
              No slots available
            </p>

          )}

        </div>
      ))}

=======
      CANCEL APPLICATION
  ========================= */
  const cancelApplication = async (job) => {
    if (!window.confirm("Are you sure you want to cancel your application?")) return;

    try {
      // 1. Remove worker from job's applied list
      const updatedWorkers = (job.appliedWorkers || []).filter(w => w.uid !== worker.uid);
      await updateDoc(doc(db, "jobs", job.id), {
        appliedWorkers: updatedWorkers
      });

      // 2. Update Worker Activity History
      await updateDoc(doc(db, "users", worker.uid), {
        activity: arrayUnion({
          type: "cancelled_application",
          message: `You cancelled your application for "${job.title}"`,
          time: new Date().toLocaleString(),
          relatedUserId: job.providerId
        })
      });

      // 3. Notify Provider Activity History
      if (job.providerId) {
        await updateDoc(doc(db, "users", job.providerId), {
          activity: arrayUnion({
            type: "application_withdrawn",
            message: `${worker.username} withdrew their application for "${job.title}"`,
            time: new Date().toLocaleString(),
            relatedUserId: worker.uid
          })
        });
      }

      alert("Application cancelled.");
    } catch (error) {
      console.error("Cancel error:", error);
      alert("Failed to cancel application.");
    }
  };

  if (loading) return <Loader message="Searching for jobs..." />;
  if (!worker) return <div className="page fj-error"><p>Please login as a worker.</p></div>;

  return (
    <div className="page fj-container">
      <h1 className="fj-main-heading">Find Jobs</h1>
      <div className="fj-list">
        {jobs.length === 0 ? (
           <p className="no-jobs">No jobs available at the moment.</p>
        ) : (
          jobs.map(job => {
            const approvedCount = getApprovedCount(job);
            const totalNeeded = job.requiredWorkers || 1;
            const isFull = approvedCount >= totalNeeded;
            const alreadyApplied = hasAlreadyApplied(job);
            const progressWidth = (approvedCount / totalNeeded) * 100;

            return (
              <div key={job.id} className="card fj-job-card">
                <h3 className="fj-job-card-title">{job.title}</h3>
                <p className="fj-job-meta">
                   <span className="material-icons">event</span> {job.date} | 
                   <span className="material-icons">schedule</span> {job.timeFrom} – {job.timeTo}
                </p>
                
                <div className="fj-slot-container">
                  <div className="fj-progress-bg">
                    <div className="fj-progress-bar" style={{ width: `${progressWidth}%` }}></div>
                  </div>
                  <span className="fj-slot-text">{approvedCount} / {totalNeeded} slots filled</span>
                </div>

                <div className="fj-action-area">
                  {job.status === "completed" ? (
                    <span className="fj-label completed">Job Completed</span>
                  ) : alreadyApplied ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                      <span className="fj-label applied">Already Applied</span>
                      <button className="fj-cancel-btn" onClick={() => cancelApplication(job)}>
                        Cancel Application
                      </button>
                    </div>
                  ) : isFull ? (
                    <span className="fj-label full">No Slots Available</span>
                  ) : (
                    <button className="fj-apply-btn" onClick={() => applyJob(job)}>
                      Apply Now
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
>>>>>>> 8d2cd8c (final 1/5)
    </div>
  );
}