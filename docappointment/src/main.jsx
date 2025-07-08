// src/index.js (or src/main.jsx)
import React from "react";
import ReactDOM from "react-dom/client"; // Use createRoot for React 18+
import { RouterProvider } from "react-router-dom";
import App from "./App.jsx"; // Import your router configuration

import "./index.css";

console.log("Type of App:", typeof App);
console.log("App object:", App);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <RouterProvider router={App} />
  </React.StrictMode>
);
