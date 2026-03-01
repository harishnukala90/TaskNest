import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
<<<<<<< HEAD
import "./styles/global.css";
=======
import "./styles/dashboard.css";
import "./styles/findjob.css";
import "./styles/login.css";
import "./styles/postjob.css";
import "./styles/profile.css";
import "./styles/profilemodal.css";
import "./styles/register.css";
>>>>>>> 8d2cd8c (final 1/5)
import "./styles/navbar.css";
import "./styles/cards.css";

const theme = localStorage.getItem("theme") || "dark";
document.body.className = theme;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
