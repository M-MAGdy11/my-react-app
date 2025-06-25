import React, { useEffect, useState } from "react";
import {
  db,
  collection,
  getDocs,
  deleteDoc,
  query,
  doc,
} from "../firebaseConfig";
import "bootstrap/dist/css/bootstrap.min.css";
import "./HistoryPage.css";

const HistoryPage = () => {
  const [bloodPressureData, setBloodPressureData] = useState([]);
  const [ecgAnalysisData, setEcgAnalysisData] = useState([]);
  const [muscleActivityData, setMuscleActivityData] = useState([]);
  const [maxHemoglobin, setMaxHemoglobin] = useState(null);
  const [maxGlucose, setMaxGlucose] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Blood Pressure History
        const bloodPressureSnapshot = await getDocs(collection(db, "blood_pressure_history"));
        const bloodPressureReadings = bloodPressureSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate ? doc.data().timestamp.toDate() : null,
        }));
        setBloodPressureData(bloodPressureReadings);

        // ECG Analysis History
        const ecgAnalysisSnapshot = await getDocs(collection(db, "ecg_results"));
        const ecgAnalysisReadings = ecgAnalysisSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate ? doc.data().timestamp.toDate() : null,
        }));
        setEcgAnalysisData(ecgAnalysisReadings);

        // Muscle Activity History
        const muscleActivitySnapshot = await getDocs(collection(db, "muscle_activity_history"));
        const muscleActivityReadings = muscleActivitySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate ? doc.data().timestamp.toDate() : null,
        }));
        setMuscleActivityData(muscleActivityReadings);

        // Extract max hemoglobin and glucose
        const maxHemoglobinValue = Math.max(...bloodPressureReadings.map((record) => record.hb || 0));
        setMaxHemoglobin(maxHemoglobinValue);

        const maxGlucoseValue = Math.max(...bloodPressureReadings.map((record) => record.glucose || 0));
        setMaxGlucose(maxGlucoseValue);
      } catch (error) {
        console.error("❌ Error while fetching history:", error);
        alert("❌ Failed to fetch history! Check your internet connection.");
      }
    };

    fetchData();
  }, []);

  const deleteAllData = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete all data?");
    if (!confirmDelete) return;

    try {
      // Delete Blood Pressure History
      const bloodPressureQuery = query(collection(db, "blood_pressure_history"));
      const bloodPressureSnapshot = await getDocs(bloodPressureQuery);
      const bloodPressureDeletePromises = bloodPressureSnapshot.docs.map((docSnapshot) =>
        deleteDoc(doc(db, "blood_pressure_history", docSnapshot.id))
      );

      // Delete ECG Analysis History
      const ecgAnalysisQuery = query(collection(db, "ecg_results"));
      const ecgAnalysisSnapshot = await getDocs(ecgAnalysisQuery);
      const ecgAnalysisDeletePromises = ecgAnalysisSnapshot.docs.map((docSnapshot) =>
        deleteDoc(doc(db, "ecg_results", docSnapshot.id))
      );

      // Delete Muscle Activity History
      const muscleActivityQuery = query(collection(db, "muscle_activity_history"));
      const muscleActivitySnapshot = await getDocs(muscleActivityQuery);
      const muscleActivityDeletePromises = muscleActivitySnapshot.docs.map((docSnapshot) =>
        deleteDoc(doc(db, "muscle_activity_history", docSnapshot.id))
      );

      await Promise.all([
        ...bloodPressureDeletePromises,
        ...ecgAnalysisDeletePromises,
        ...muscleActivityDeletePromises,
      ]);

      console.log("✅ All data deleted successfully!");
      alert("All data deleted successfully!");

      setBloodPressureData([]);
      setEcgAnalysisData([]);
      setMuscleActivityData([]);
    } catch (error) {
      console.error("❌ Error while deleting data:", error);
      alert("Error occurred while deleting data. Check your internet connection.");
    }
  };

  return (
    <div className="history-page min-vh-100">
      <div className="container text-center py-5">
        <h1 className="text-white">Data History</h1>
      </div>

      <div className="container my-5">
        <h2 className="text-center mb-4 text-white">🩺 Blood Pressure History</h2>
        <table className="table table-hover shadow-lg">
          <thead className="bg-primary text-white">
            <tr>
              <th>Date</th>
              <th>Systolic Pressure (SBP)</th>
              <th>Diastolic Pressure (DBP)</th>
              <th>Most Common Heart Rate</th>
              <th>Most Common Oxygen Level</th>
              <th>Hemoglobin Level</th>
              <th>Glucose Level</th>
              <th>Age</th>
              <th>Weight</th>
            </tr>
          </thead>
          <tbody>
            {bloodPressureData.length > 0 ? (
              bloodPressureData.map((record) => (
                <tr key={record.id}>
                  <td>{record.timestamp ? record.timestamp.toLocaleString() : "Not Available"}</td>
                  <td>{record.sbp} mmHg</td>
                  <td>{record.dbp} mmHg</td>
                  <td>{record.bpm}</td>
                  <td>{record.spo2}%</td>
                  <td>{record.hb !== undefined && record.hb !== null ? `${record.hb} g/dL` : "Not Available"}</td>
                  <td>{record.glucose !== undefined && record.glucose !== null ? `${record.glucose} mg/dL` : "Not Available"}</td>
                  <td>{record.age}</td>
                  <td>{record.weight} kg</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center">No data available in history.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="container my-5">
        <h2 className="text-center mb-4 text-white">📊 ECG Analysis History</h2>
        <table className="table table-hover shadow-lg">
          <thead className="bg-success text-white">
            <tr>
              <th>Date</th>
              <th>PR Interval</th>
              <th>QT Interval</th>
              <th>ST Segment</th>
              <th>Q-wave</th>
              <th>T-wave</th>
            </tr>
          </thead>
          <tbody>
            {ecgAnalysisData.length > 0 ? (
              ecgAnalysisData.map((record) => (
                <tr key={record.id}>
                  <td>{record.timestamp ? record.timestamp.toLocaleString() : "Not Available"}</td>
                  <td>{record.prInterval}</td>
                  <td>{record.qtInterval}</td>
                  <td>{record.stSegment}</td>
                  <td>{record.qWave}</td>
                  <td>{record.tWave}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">No data available in history.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="container my-5">
        <h2 className="text-center mb-4 text-white">💪 Muscle Activity History</h2>
        <table className="table table-hover shadow-lg">
          <thead className="bg-warning text-white">
            <tr>
              <th>Date</th>
              <th>Time (ms)</th>
              <th>Muscle Activity (ADC)</th>
            </tr>
          </thead>
          <tbody>
            {muscleActivityData.length > 0 ? (
              muscleActivityData.map((record) => (
                <tr key={record.id}>
                  <td>{record.timestamp ? record.timestamp.toLocaleString() : "Not Available"}</td>
                  <td>{record.time} ms</td>
                  <td>{record.adc}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center">No data available in history.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="container text-center my-5">
        <button
          className="btn btn-danger"
          onClick={deleteAllData}
          style={{
            padding: "10px 20px",
            fontWeight: "bold",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          Delete All Data
        </button>
      </div>
    </div>
  );
};

export default HistoryPage;