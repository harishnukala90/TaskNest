import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  addDoc,
  collection,
  doc,
  getDoc,
<<<<<<< HEAD
=======
  updateDoc,
  arrayUnion,
>>>>>>> 8d2cd8c (final 1/5)
  serverTimestamp
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
<<<<<<< HEAD

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
=======
import Loader from "../components/Loader";
import "../styles/postjob.css";

export default function PostJob() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // eslint-disable-next-line no-empty-pattern
  const [] = useState({});

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
      } catch (error) {
        console.error("Auth error:", error);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

>>>>>>> 8d2cd8c (final 1/5)
  const [job, setJob] = useState({
    title: "",
    location: "",
    wage: "",
    requiredWorkers: "",
    date: "",
    timeFrom: "",
    timeTo: ""
  });

<<<<<<< HEAD
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
=======
  const validateForm = () => {
    const today = new Date().toISOString().split("T")[0];
    if (!job.title.trim()) { alert("Error: Please enter a Job Title."); return false; }
    if (!job.location.trim()) { alert("Error: Please enter a Location."); return false; }
    if (!job.wage || isNaN(job.wage) || Number(job.wage) <= 0) { alert("Error: Enter valid wage."); return false; }
    if (!job.requiredWorkers || Number(job.requiredWorkers) <= 0) { alert("Error: Workers needed must be at least 1."); return false; }
    if (!job.date || job.date < today) { alert("Error: Please select a valid future date."); return false; }
    if (!job.timeFrom || !job.timeTo || job.timeFrom >= job.timeTo) { alert("Error: Check work times."); return false; }
    return true;
  };

  const post = async () => {
    if (!validateForm()) return; 

    try {
      setIsSubmitting(true);

      // 1. Create Job Document
      await addDoc(collection(db, "jobs"), {
        title: job.title.trim(),
        location: job.location.trim(),
>>>>>>> 8d2cd8c (final 1/5)
        wage: job.wage,
        date: job.date,
        timeFrom: job.timeFrom,
        timeTo: job.timeTo,
        requiredWorkers: Number(job.requiredWorkers),
<<<<<<< HEAD

        providerId: user.uid,
        providerUsername: user.username,
        providerProfile: user.profile,

=======
        providerId: user.uid, // This is the key field
        providerUsername: user.username,
        providerProfile: user.profile,
>>>>>>> 8d2cd8c (final 1/5)
        appliedWorkers: [],
        status: "open",
        createdAt: serverTimestamp()
      });

<<<<<<< HEAD
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

=======
      // 2. Add activity to Provider's log
      await updateDoc(doc(db, "users", user.uid), {
        activity: arrayUnion({
          type: "job_posted",
          message: `You posted a new job: "${job.title}"`,
          time: new Date().toLocaleString(),
          relatedUserId: null // Posted by self
        })
      });

      alert("Job posted successfully!");
>>>>>>> 8d2cd8c (final 1/5)
      navigate("/dashboard");

    } catch (error) {
      console.error("Error posting job:", error);
<<<<<<< HEAD
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
=======
      alert("Failed to post job.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <Loader message="Setting up your job form..." />;
  if (isSubmitting) return <Loader message="Publishing your job listing..." />;

  return (
    <div className="page pj-form-wrapper">
      <h1>Post Job</h1>
      <br />
      <h4 className="pj-input-label">Job Title</h4>
      <input className="pj-input-field" placeholder="e.g. Electrician needed" value={job.title} onChange={(e) => setJob({ ...job, title: e.target.value })} />
      <h4 className="pj-input-label">Location</h4>
      <input className="pj-input-field" placeholder="Location" value={job.location} onChange={(e) => setJob({ ...job, location: e.target.value })} />
      <h4 className="pj-input-label">Wage</h4>
      <input className="pj-input-field" placeholder="Amount" value={job.wage} onChange={(e) => setJob({ ...job, wage: e.target.value })} />
      <h4 className="pj-input-label">Workers needed</h4>
      <input className="pj-input-field" type="number" value={job.requiredWorkers} onChange={(e) => setJob({ ...job, requiredWorkers: e.target.value })} />
      <h4 className="pj-input-label">Date</h4>
      <input className="pj-input-field" type="date" value={job.date} onChange={(e) => setJob({ ...job, date: e.target.value })} />
      <div className="time-row">
        <div>
          <h4 className="pj-input-label">Starts at</h4>
          <input className="pj-input-field" type="time" value={job.timeFrom} onChange={(e) => setJob({ ...job, timeFrom: e.target.value })} />
        </div>
        <div>
          <h4 className="pj-input-label">Ends at</h4>
          <input className="pj-input-field" type="time" value={job.timeTo} onChange={(e) => setJob({ ...job, timeTo: e.target.value })} />
        </div>
      </div>
      <button className="pj-submit-button" onClick={post}>Post Job</button>
    </div>
  );
}
>>>>>>> 8d2cd8c (final 1/5)
