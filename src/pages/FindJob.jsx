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
        } catch (err) {
          console.error(err);
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
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((job) => {
          if (!job.date || !job.timeTo) return true;
          const end = new Date(`${job.date}T${job.timeTo}`);
          return end > now;
        });

      setJobs(jobsList);
    });

    return () => unsubscribe();
  }, []);

  /* =========================
     HELPERS
  ========================= */
  const hasAlreadyApplied = (job) =>
    (job.appliedWorkers || []).some((w) => w.uid === worker.uid);

  const getApprovedCount = (job) =>
    (job.appliedWorkers || []).filter((w) => w.status === "approved").length;

  /* =========================
     APPLY JOB
  ========================= */
  const applyJob = async (job) => {
    try {
      if (job.status === "completed") return alert("Job completed");
      if (hasAlreadyApplied(job)) return alert("Already applied");

      const approvedCount = getApprovedCount(job);
      if (approvedCount >= (job.requiredWorkers || 1))
        return alert("No slots available");

      await updateDoc(doc(db, "jobs", job.id), {
        appliedWorkers: arrayUnion({
          uid: worker.uid,
          username: worker.username,
          profile: worker.profile,
          status: "pending"
        })
      });

      await updateDoc(doc(db, "users", worker.uid), {
        activity: arrayUnion({
          type: "applied_job",
          message: `Applied for "${job.title}"`,
          time: new Date().toLocaleString(),
          relatedUserId: job.providerId
        })
      });

      if (job.providerId) {
        await updateDoc(doc(db, "users", job.providerId), {
          activity: arrayUnion({
            type: "new_applicant",
            message: `${worker.username} applied for "${job.title}"`,
            time: new Date().toLocaleString(),
            relatedUserId: worker.uid
          })
        });
      }

      alert("Applied successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to apply");
    }
  };

  /* =========================
     CANCEL APPLICATION
  ========================= */
  const cancelApplication = async (job) => {
    if (!window.confirm("Cancel application?")) return;

    try {
      const updatedWorkers = (job.appliedWorkers || []).filter(
        (w) => w.uid !== worker.uid
      );

      await updateDoc(doc(db, "jobs", job.id), {
        appliedWorkers: updatedWorkers
      });

      alert("Application cancelled");
    } catch (err) {
      console.error(err);
      alert("Cancel failed");
    }
  };

  /* =========================
     STATES
  ========================= */
  if (loading) return <Loader message="Searching for jobs..." />;
  if (!worker)
    return <div className="page"><p>Please login as worker.</p></div>;

  /* =========================
     UI
  ========================= */
  return (
    <div className="page fj-container">
      <h1 className="fj-main-heading">Find Jobs</h1>

      <div className="fj-list">
        {jobs.length === 0 ? (
          <p className="no-jobs">No jobs available.</p>
        ) : (
          jobs.map((job) => {
            const approvedCount = getApprovedCount(job);
            const totalNeeded = job.requiredWorkers || 1;
            const isFull = approvedCount >= totalNeeded;
            const alreadyApplied = hasAlreadyApplied(job);
            const progressWidth = (approvedCount / totalNeeded) * 100;

            return (
              <div key={job.id} className="card fj-job-card">
                <h3>{job.title}</h3>

                <p>
                  {job.date} | {job.timeFrom} – {job.timeTo}
                </p>

                <div className="fj-progress-bg">
                  <div
                    className="fj-progress-bar"
                    style={{ width: `${progressWidth}%` }}
                  />
                </div>

                {job.status === "completed" ? (
                  <span className="fj-label completed">Completed</span>
                ) : alreadyApplied ? (
                  <>
                    <span className="fj-label applied">Applied</span>
                    <button onClick={() => cancelApplication(job)}>
                      Cancel Application
                    </button>
                  </>
                ) : isFull ? (
                  <span className="fj-label full">No Slots</span>
                ) : (
                  <button onClick={() => applyJob(job)}>
                    Apply Now
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}