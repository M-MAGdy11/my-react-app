import { Routes, Route, Router } from "react-router-dom";
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
  return (
    <>
  
      <div>
        <Header />
        <HealthDataProvider>
          <Routes>
            <Route index element={<Home />} />
            <Route path="e" element={<Home />} />
            <Route path="s" element={<Sec/>} />
            <Route path="t" element={<Third/>} />
            <Route path="f" element={<Four/>} />
            <Route path="h" element={<History/>} />
          </Routes>
          </HealthDataProvider>
        <Footer />
      </div>
    </>
  );
}
export default App;








