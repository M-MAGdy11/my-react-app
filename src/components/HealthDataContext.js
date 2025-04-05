import React, { createContext, useState } from "react";

export const HealthDataContext = createContext();

export const HealthDataProvider = ({ children }) => {
  const [healthData, setHealthData] = useState([]);

  // إضافة بيانات جديدة
  const addHealthData = (newData) => {
    setHealthData((prevData) => [...prevData, newData]);
  };

  return (
    <HealthDataContext.Provider value={{ healthData, addHealthData }}>
      {children}
    </HealthDataContext.Provider>
  );
};