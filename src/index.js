import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css"; // استيراد الأنماط العامة
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./ThemeContext"; // استيراد ThemeProvider

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ThemeProvider> {/* لف المشروع داخل ThemeProvider */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ThemeProvider>
);