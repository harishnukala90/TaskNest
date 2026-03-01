import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";

import Loader from "../components/Loader";
import "../styles/postjob.css";

export default function PostJob() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [job, setJob] = useState({
    title: "",
    location: "",
    wage: "",
    requiredWorkers: "",
    date: "",
    timeFrom: "",
    timeTo: ""
  });

  /* =========================
     LOAD USER
  ========================= */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        navigate("/");
        return;
      }

      try {
        const snap = await getDoc(doc(db, "users", firebaseUser.uid));

        if (snap.exists()) {
          setUser({ uid: firebaseUser.uid, ...snap.data() });
        } else {
          alert("User profile missing.");
          navigate("/");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  /* =========================
     VALIDATION
  ========================= */
  const validateForm = () => {
    const today = new Date().toISOString().split("T")[0];

    if (!job.title.trim()) return alert("Enter job title"), false;
    if (!job.location.trim()) return alert("Enter location"), false;
    if (!job.wage || Number(job.wage) <= 0)
      return alert("Enter valid wage"), false;
    if (!job.requiredWorkers || Number(job.requiredWorkers) <= 0)
      return alert("Workers must be at least 1"), false;
    if (!job.date || job.date < today)
      return alert("Select valid future date"), false;
    if (!job.timeFrom || !job.timeTo || job.timeFrom >= job.timeTo)
      return alert("Invalid work time"), false;

    return true;
  };

  /* =========================
     POST JOB
  ========================= */
  const post = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      await addDoc(collection(db, "jobs"), {
        title: job.title.trim(),
        location: job.location.trim(),
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

      // Provider activity log
      await updateDoc(doc(db, "users", user.uid), {
        activity: arrayUnion({
          type: "job_posted",
          message: `You posted a new job: "${job.title}"`,
          time: new Date().toLocaleString(),
          relatedUserId: null
        })
      });

      alert("Job posted successfully!");
      navigate("/dashboard");

    } catch (error) {
      console.error(error);
      alert("Failed to post job.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =========================
     STATES
  ========================= */
  if (loading)
    return <Loader message="Setting up your job form..." />;

  if (isSubmitting)
    return <Loader message="Publishing your job listing..." />;

  /* =========================
     UI
  ========================= */
  return (
    <div className="page pj-form-wrapper">
      <h1>Post Job</h1>

      <h4 className="pj-input-label">Job Title</h4>
      <input
        className="pj-input-field"
        value={job.title}
        onChange={(e) =>
          setJob({ ...job, title: e.target.value })
        }
      />

      <h4 className="pj-input-label">Location</h4>
      <input
        className="pj-input-field"
        value={job.location}
        onChange={(e) =>
          setJob({ ...job, location: e.target.value })
        }
      />

      <h4 className="pj-input-label">Wage</h4>
      <input
        className="pj-input-field"
        value={job.wage}
        onChange={(e) =>
          setJob({ ...job, wage: e.target.value })
        }
      />

      <h4 className="pj-input-label">Workers Needed</h4>
      <input
        type="number"
        className="pj-input-field"
        value={job.requiredWorkers}
        onChange={(e) =>
          setJob({
            ...job,
            requiredWorkers: e.target.value
          })
        }
      />

      <h4 className="pj-input-label">Date</h4>
      <input
        type="date"
        className="pj-input-field"
        value={job.date}
        onChange={(e) =>
          setJob({ ...job, date: e.target.value })
        }
      />

      <div className="time-row">
        <div>
          <h4 className="pj-input-label">Starts at</h4>
          <input
            type="time"
            className="pj-input-field"
            value={job.timeFrom}
            onChange={(e) =>
              setJob({ ...job, timeFrom: e.target.value })
            }
          />
        </div>

        <div>
          <h4 className="pj-input-label">Ends at</h4>
          <input
            type="time"
            className="pj-input-field"
            value={job.timeTo}
            onChange={(e) =>
              setJob({ ...job, timeTo: e.target.value })
            }
          />
        </div>
      </div>

      <button className="pj-submit-button" onClick={post}>
        Post Job
      </button>
    </div>
  );
}