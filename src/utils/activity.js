<<<<<<< HEAD
export const addActivity = (username, message) => {
  const users = JSON.parse(localStorage.getItem("users")) || [];

  const updatedUsers = users.map(user => {
    if (user.username === username) {
      return {
        ...user,
        activity: [
          ...(user.activity || []),
          {
            message,
            time: new Date().toLocaleString()
          }
        ]
      };
    }
    return user;
  });

  localStorage.setItem("users", JSON.stringify(updatedUsers));

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (currentUser.username === username) {
    localStorage.setItem(
      "currentUser",
      JSON.stringify({
        ...currentUser,
        activity: updatedUsers.find(u => u.username === username).activity
      })
    );
  }
};
=======
import { db } from "../firebase";
import { doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { addActivity } from "./activity"; // The Firestore version we just made

export const applyForJob = async (jobId, workerId, workerName) => {
  try {
    const jobRef = doc(db, "jobs", jobId);
    const jobSnap = await getDoc(jobRef);

    if (!jobSnap.exists()) throw new Error("Job not found");
    const jobData = jobSnap.data();

    // 1. Update the Job Document with the applicant
    await updateDoc(jobRef, {
      appliedWorkers: arrayUnion({
        uid: workerId,
        name: workerName,
        appliedAt: new Date().toISOString()
      })
    });

    // 2. Record in Worker's History
    // We link the Provider's ID so the worker can view who they applied to
    await addActivity(
      workerId,
      `You applied for the job: "${jobData.title}"`,
      jobData.providerId 
    );

    return { success: true };
  } catch (error) {
    console.error("Apply Error:", error);
    return { success: false, error: error.message };
  }
};
>>>>>>> 8d2cd8c (final 1/5)
