import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp
} from "firebase/firestore";

/* =========================
   REGISTER USER
========================= */
export const registerUser = async (userData) => {
  let { username, password, role, profile } = userData;

  if (!username || !password) {
    throw new Error("Username and password required");
  }

  // 🔹 Normalize username
  username = username.toLowerCase().trim();

  const email = `${username}@tasknest.com`;

  // 🔹 Create Firebase Auth account
  const res = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  const uid = res.user.uid;

  // 🔹 Default fallbacks
  role = role || "worker";
  profile = profile || {
    name: "",
    location: "",
    phone: "",
    age: "",
    description: ""
  };

  // 🔹 Firestore user document
  const userDoc = {
    uid,
    username,
    role,
    profile,
    activity: [
      {
        time: new Date().toLocaleString(),
        message: "Account created"
      }
    ],
    createdAt: serverTimestamp()
  };

  await setDoc(doc(db, "users", uid), userDoc);

  return userDoc;
};

/* =========================
   LOGIN USER
========================= */
export const loginUser = async (username, password) => {
  if (!username || !password) {
    throw new Error("Username and password required");
  }

  // 🔹 Normalize username
  username = username.toLowerCase().trim();

  const email = `${username}@tasknest.com`;

  // 🔹 Firebase login
  const res = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );

  const uid = res.user.uid;

  // 🔹 Fetch Firestore profile
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    throw new Error(
      "User profile missing. Contact admin."
    );
  }

  const userData = snap.data();

  // 🔹 Add login activity
  await updateDoc(userRef, {
    activity: arrayUnion({
      time: new Date().toLocaleString(),
      message: "Logged in"
    })
  });

  return userData;
};

/* =========================
   LOGOUT USER
========================= */
export const logoutUser = async () => {
  await signOut(auth);
  localStorage.removeItem("currentUser");
};
