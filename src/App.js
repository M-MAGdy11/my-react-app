import { Routes, Route, Router } from "react-router-dom";
import Header from "./components/Header/header";
import Login from "./components/Login/login";
import Home from "./components/Home/home";
import Footer from "./components/Footer/footer";

function App() {
  return (
    <>
      <div>
        <Header />
      
          <Routes>
            <Route index element={<Home />} />
            <Route path="e" element={<Home />} />
            <Route path="f" element={<Login />} />
          </Routes>

        <Footer />
      </div>
    </>
  );
}

export default App;
