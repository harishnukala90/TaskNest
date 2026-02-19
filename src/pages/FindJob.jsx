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
    }
  };

  /* =========================
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

    </div>
  );
}