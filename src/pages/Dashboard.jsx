import { useState, useEffect } from "react";
import WorkerCard from "../components/WorkerCard";
import ProfileModal from "../components/ProfileModal";
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

export default function Dashboard() {

  const [jobs, setJobs] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [modalTitle, setModalTitle] = useState("");

  /* =========================
     LOAD CURRENT USER
  ========================= */
  useEffect(() => {

    const loadUser = async () => {

      if (!auth.currentUser) {
        setLoading(false);
        return;
      }

      const snap = await getDoc(
        doc(db, "users", auth.currentUser.uid)
      );

      if (snap.exists()) {
        setCurrentUser({
          uid: auth.currentUser.uid,
          ...snap.data()
        });
      }

      setLoading(false);
    };

    loadUser();

  }, []);

  /* =========================
     REALTIME JOBS
  ========================= */
  useEffect(() => {

    const unsubscribe =
      onSnapshot(collection(db, "jobs"), (snapshot) => {

        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setJobs(data);
      });

    return () => unsubscribe();

  }, []);

  /* =========================
     REMOVE WORKER
  ========================= */
  const removeWorker = async (jobId, workerUsername) => {

    const job = jobs.find(j => j.id === jobId);

    const updated = job.appliedWorkers.filter(
      w => w.username !== workerUsername
    );

    await updateDoc(doc(db, "jobs", jobId), {
      appliedWorkers: updated
    });
  };

  /* =========================
     DELETE JOB
  ========================= */
  const deleteJob = async (jobId) => {

    await deleteDoc(doc(db, "jobs", jobId));

    alert("Job deleted");
  };

  /* =========================
     COMPLETE JOB + ACTIVITY
  ========================= */
  const markCompleted = async (job) => {

    try {

      /* 1️⃣ Update Job Status */
      await updateDoc(doc(db, "jobs", job.id), {
        status: "completed"
      });

      /* 2️⃣ Provider Activity */
      await updateDoc(
        doc(db, "users", auth.currentUser.uid),
        {
          activity: arrayUnion({
            type: "completed_job",
            message: `Completed job "${job.title}"`,
            jobTitle: job.title,
            time: new Date().toLocaleString(),
            workers: job.appliedWorkers || []
          })
        }
      );

      /* 3️⃣ Workers Activity */
      for (const worker of job.appliedWorkers || []) {

        if (!worker.uid) continue; // safety

        await updateDoc(
          doc(db, "users", worker.uid),
          {
            activity: arrayUnion({
              type: "completed_job",
              message: `Completed job "${job.title}"`,
              jobTitle: job.title,
              time: new Date().toLocaleString(),
              providerProfile: job.providerProfile
            })
          }
        );
      }

      alert("Job completed!");

    } catch (error) {
      console.error(error);
      alert("Failed to complete job");
    }
  };

  /* =========================
     LOADING
  ========================= */
  if (loading) {
    return <div className="page">Loading...</div>;
  }

  if (!currentUser) {
    return <div className="page">Please login</div>;
  }

  /* =========================
     PROVIDER DASHBOARD
  ========================= */
  if (currentUser.role === "provider") {

    const myJobs = jobs.filter(
      job => job.providerId === currentUser.uid
    );

    return (
      <div className="page">
        <h1
          style={{
              padding: "12px",
              borderBottom: "1px solid #4d4b4b",
              cursor: "pointer"
            }}
        >
          Dashboard
        </h1>
        <br/>
        <h2>My Jobs</h2>

        {myJobs.length === 0 && (
          <p>No jobs posted yet.</p>
        )}

        {myJobs.map(job => (

          <div key={job.id} className="card">

            <h3>{job.title}</h3>

            {job.status === "completed" && (
              <p className="job-completed">
                Job Completed
              </p>
            )}

            <p>Location: {job.location}</p>

            <p>
              Workers Needed: {job.requiredWorkers}
            </p>

            {(job.appliedWorkers || []).map(worker => (

              <div
                key={worker.username}
                onClick={() => {
                  setSelectedProfile(worker.profile);
                  setModalTitle("Worker Details");
                }}
              >
                <WorkerCard
                  worker={worker}
                  onRemove={() =>
                    removeWorker(job.id, worker.username)
                  }
                />
              </div>
            ))}

            {job.status !== "completed" && (
              <button
                className="complete-btn"
                onClick={() => markCompleted(job)}
              >
                Mark as Completed
              </button>
            )}

            {job.status === "completed" && (
              <button
                className="delete-btn"
                onClick={() => deleteJob(job.id)}
              >
                Delete Job
              </button>
            )}

          </div>
        ))}

        <ProfileModal
          profile={selectedProfile}
          title={modalTitle}
          onClose={() => setSelectedProfile(null)}
        />

      </div>
    );
  }

  /* =========================
     WORKER DASHBOARD
  ========================= */
  if (currentUser.role === "worker") {

    const appliedJobs = jobs.filter(job =>
      (job.appliedWorkers || []).some(
        w => w.username === currentUser.username
      )
    );

    return (
      <div className="page">

        <h2>My Applied Jobs</h2>

        {appliedJobs.length === 0 && (
          <p>No applied jobs yet.</p>
        )}

        {appliedJobs.map(job => (

          <div
            key={job.id}
            className="card"
            onClick={() => {
              setSelectedProfile(job.providerProfile);
              setModalTitle("Provider Details");
            }}
          >
            <h3>{job.title}</h3>

            {job.status === "completed" && (
              <p className="job-completed">
                Job Completed
              </p>
            )}

            <p>Location: {job.location}</p>
            <p>Wage: {job.wage}</p>

          </div>
        ))}

        <ProfileModal
          profile={selectedProfile}
          title={modalTitle}
          onClose={() => setSelectedProfile(null)}
        />

      </div>
    );
  }

  return <div className="page">Welcome</div>;
}