import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ProvideAuth } from "./hooks/use_auth";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ProvideAuth>
      <App />
    </ProvideAuth>
  </React.StrictMode>
);
