import React from "react";
import ReactDOM from "react-dom/client";
import SnakeGame from "./SnakeGame";
import "./app.css";
import "./main.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <SnakeGame />
  </React.StrictMode>
);
