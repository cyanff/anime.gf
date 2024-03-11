import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const ddb = await window.api.getDDB();
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App ddbProp={ddb} />
  </React.StrictMode>
);
