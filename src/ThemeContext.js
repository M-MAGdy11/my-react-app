import React, { createContext, useState, useEffect } from "react";

// إنشاء السياق
export const ThemeContext = createContext();

// Provider للسياق
export const ThemeProvider = ({ children }) => {
  // الحالة الافتراضية (Light Mode)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem("isDarkMode");
    return savedMode ? JSON.parse(savedMode) : false; // تحميل الوضع من localStorage
  });

  // حفظ الوضع في localStorage عندما يتغير
  useEffect(() => {
    localStorage.setItem("isDarkMode", JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  // وظيفة لتبديل الوضع
  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <div className={isDarkMode ? "dark-mode" : "light-mode"}>{children}</div>
    </ThemeContext.Provider>
  );
};