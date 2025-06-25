import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // استيراد useNavigate للتنقل

function MyNavbar() {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate(); // استخدام useNavigate للتنقل

  return (
    <header className="hide-when-mobile" style={{ height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px" }}>
      {/* عنوان الموقع */}
      <h1 style={{ fontSize: "20px", margin: 0 }}>Health Monitoring Website</h1>

      {/* قائمة التنقل */}
      <ul className="flex" style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", alignItems: "center" }}>
        {/* زر الرجوع */}
        <li style={{ padding: "10px", cursor: "pointer" }} onClick={() => navigate(-1)}>
          <button style={{ padding: "5px 10px", background: "#007bff", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", marginLeft: "-100px" }}>
            Back
          </button>
        </li>

        {/* زر التقديم */}
      </ul>
    </header>
  );
}

export default MyNavbar;