import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/global.css";
import "./styles/navbar.css";
import "./styles/cards.css";

const theme = localStorage.getItem("theme") || "dark";
document.body.className = theme;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
