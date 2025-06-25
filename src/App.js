import { Routes, Route } from "react-router-dom";
import Header from "./components/Header/header";
import Home from "./components/Home/home";
import Footer from "./components/Footer/footer";
import Sec from "./components/Home/Sec";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import Third from "./components/Home/Third";
import Four from "./components/Home/Four";
import History from "./components/Home/Histroy";
import { HealthDataProvider } from "./components/HealthDataContext";

function App() {
  const currentURL = window.location.href;
  const translateURL = `https://translate.google.com/translate?hl=ar&sl=auto&tl=ar&u=${currentURL}`;

  return (
    <>
      <div>
        <Header />
        <HealthDataProvider>
          <Routes>
            <Route index element={<Home />} />
            <Route path="e" element={<Home />} />
            <Route path="s" element={<Sec />} />
            <Route path="t" element={<Third />} />
            <Route path="f" element={<Four />} />
            <Route path="h" element={<History />} />
          </Routes>
        </HealthDataProvider>
        <Footer />

        {/* زر الترجمة الثابت */}
        <a
          href={translateURL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            position: "fixed",
            bottom: "20px",
            left: "20px",
            backgroundColor: "#007bff",
            color: "white",
            padding: "10px 14px",
            borderRadius: "50px",
            textDecoration: "none",
            fontWeight: "bold",
            fontSize: "14px",
            zIndex: 9999,
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)",
          }}
        >
          🌐 عربي
        </a>
      </div>
    </>
  );
}

export default App;
