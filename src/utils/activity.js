import { db } from "../firebase";
import { doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";

/**
 * Add an activity log entry to a user's Firestore document
 * @param {string} userId - ID of the user
 * @param {string} message - Activity message
 * @param {string|null} relatedUserId - Optional related user ID
 */
export const addActivity = async (userId, message, relatedUserId = null) => {
  if (!userId) return;
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      activity: arrayUnion({
        message,
        time: new Date().toLocaleString(),
        relatedUserId
      })
    });
  } catch (error) {
    console.error("Error adding activity:", error);
  }
};

/**
 * Apply for a job in Firestore
 * @param {string} jobId - ID of the job
 * @param {string} workerId - ID of the worker
 * @param {string} workerName - Name or username of the worker
 */
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
