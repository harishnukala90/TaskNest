import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });

    return () => unsub();
  }, []);

<<<<<<< HEAD
  if (loading) return <p>Loading...</p>;
=======
  // Added a unique class 'pr-loading-text' to the paragraph tag
  if (loading) return <p className="pr-1 pr-loading-text">Loading...</p>;
>>>>>>> 8d2cd8c (final 1/5)

  if (!user) return <Navigate to="/" />;

  return children;
<<<<<<< HEAD
}
=======
}
>>>>>>> 8d2cd8c (final 1/5)
