import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";

export default function PostJob() {

  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* =========================
     LOAD USER SAFELY
  ========================= */
  useEffect(() => {

    const unsubscribe =
      onAuthStateChanged(auth, async (firebaseUser) => {

        if (!firebaseUser) {
          navigate("/");
          return;
        }

        const snap = await getDoc(
          doc(db, "users", firebaseUser.uid)
        );

        if (snap.exists()) {
          setUser({
            uid: firebaseUser.uid,
            ...snap.data()
          });
        } else {
          alert("User profile missing. Re-register.");
          navigate("/");
        }

        setLoading(false);
      });

    return () => unsubscribe();

  }, [navigate]);

  /* =========================
     JOB FORM STATE
  ========================= */
  const [job, setJob] = useState({
    title: "",
    location: "",
    wage: "",
    requiredWorkers: "",
    date: "",
    timeFrom: "",
    timeTo: ""
  });

  if (loading) {
    return <div className="page">Loading user...</div>;
  }

  if (!user) {
    return <div className="page">User not loaded</div>;
  }

  /* =========================
     POST JOB
  ========================= */
  const post = async () => {

    try {

      if (!job.title || !job.location) {
        alert("Please fill all fields");
        return;
      }

      await addDoc(collection(db, "jobs"), {

        title: job.title,
        location: job.location,
        wage: job.wage,
        date: job.date,
        timeFrom: job.timeFrom,
        timeTo: job.timeTo,
        requiredWorkers: Number(job.requiredWorkers),

        providerId: user.uid,
        providerUsername: user.username,
        providerProfile: user.profile,

        appliedWorkers: [],
        status: "open",
        createdAt: serverTimestamp()
      });

      alert("Job posted successfully!");

      setJob({
        title: "",
        location: "",
        wage: "",
        requiredWorkers: "",
        date: "",
        timeFrom: "",
        timeTo: ""
      });

      navigate("/dashboard");

    } catch (error) {
      console.error("Error posting job:", error);
      alert("Failed to post job");
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
          Post Job
        </h1>
        <br/>

      <h4>Job Title</h4>
      <input
        placeholder="Job Title"
        value={job.title}
        onChange={(e) =>
          setJob({ ...job, title: e.target.value })
        }
      />

      <h4>Location</h4>
      <input
        placeholder="Location"
        value={job.location}
        onChange={(e) =>
          setJob({ ...job, location: e.target.value })
        }
      />

      <h4>Wage</h4>
      <input
        placeholder="Wage"
        value={job.wage}
        onChange={(e) =>
          setJob({ ...job, wage: e.target.value })
        }
      />

      <h4>No of workers needed</h4>
      <input
        placeholder="Required Workers"
        value={job.requiredWorkers}
        onChange={(e) =>
          setJob({
            ...job,
            requiredWorkers: e.target.value
          })
        }
      />

      <h4>Date</h4>
      <input
        type="date"
        value={job.date}
        onChange={(e) =>
          setJob({ ...job, date: e.target.value })
        }
      />

      <h4>Work starts at</h4>
      <input
        type="time"
        value={job.timeFrom}
        onChange={(e) =>
          setJob({ ...job, timeFrom: e.target.value })
        }
      />

      <h4>Work ends at</h4>
      <input
        type="time"
        value={job.timeTo}
        onChange={(e) =>
          setJob({ ...job, timeTo: e.target.value })
        }
      />

      <button onClick={post}>
        Post Job
      </button>

    </div>
  );
}
