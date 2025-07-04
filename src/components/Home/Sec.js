import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { db, collection, query, orderBy, onSnapshot, addDoc } from "../firebaseConfig";
import "chart.js/auto";
import "bootstrap/dist/css/bootstrap.min.css";
import "./s.css";
import { getDocs, deleteDoc, doc } from "firebase/firestore";

const Sec = () => {
  const [data, setData] = useState([]);
  const [mostCommonBPM, setMostCommonBPM] = useState([]);
  const [mostCommonSpO2, setMostCommonSpO2] = useState(null);
  const [selectedView, setSelectedView] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [sbp, setSBP] = useState(null);
  const [dbp, setDBP] = useState(null);
  const [hb, setHb] = useState("");
  const [glucose, setGlucose] = useState("");
  const [maxHb, setMaxHb] = useState(null);
  const [avgGlucose, setAvgGlucose] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "spo2_bpm_data"), orderBy("time", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const readings = snapshot.docs.map((doc) => {
        const docData = doc.data();
        return {
          id: doc.id,
          bpm: docData.bpm || 0,
          spo2: docData.spo2 || 0,
          hb: docData.hb || 0,
          glucose: docData.glucose || 0,
          time: docData.time?.toDate ? docData.time.toDate() : new Date(docData.time),
        };
      });
      setData(readings);
      calculateCommonValues(readings);
      const { maxHb, avgGlucose } = calculateMaxAndAvgValues(readings);
      setMaxHb(maxHb);
      setAvgGlucose(avgGlucose);
    });
    return () => unsubscribe();
  }, []);

  const calculateCommonValues = (readings) => {
    if (readings.length > 0) {
      const bpmCounts = {};
      const spo2Counts = {};
      readings.forEach((entry) => {
        bpmCounts[entry.bpm] = (bpmCounts[entry.bpm] || 0) + 1;
        spo2Counts[entry.spo2] = (spo2Counts[entry.spo2] || 0) + 1;
      });
      const sortedBPM = Object.entries(bpmCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .filter((_, index) => index === 0 || index === 2)
        .map((item) => parseFloat(item[0]));
      const bpmAverage = sortedBPM.length > 0 ? (sortedBPM.reduce((sum, val) => sum + val, 0) / sortedBPM.length).toFixed(1) : null;
      const maxSpO2 = readings.length > 0 ? Math.max(...readings.map((entry) => entry.spo2)).toFixed(1) : null;
      setMostCommonBPM({ range: sortedBPM.map(val => val.toFixed(1)).join(", "), average: bpmAverage });
      setMostCommonSpO2(maxSpO2);
    }
  };

  const calculateMaxAndAvgValues = (readings) => {
    if (readings.length > 0) {
      const maxHb = Math.max(...readings.map((entry) => entry.hb));
      const glucoseValues = readings.map((entry) => entry.glucose).filter(g => g !== 0);
      const avgGlucose = glucoseValues.length > 0 
        ? (glucoseValues.reduce((sum, val) => sum + val, 0) / glucoseValues.length).toFixed(1)
        : null;
      return { maxHb, avgGlucose };
    }
    return { maxHb: null, avgGlucose: null };
  };

  const calculateBP = async (event) => {
    event.preventDefault();
    if (!age || !weight) {
      alert("⚠ Please enter age and weight!");
      return;
    }
    if (data.length === 0) {
      alert("⚠ Sensor data not loaded yet! Please wait.");
      return;
    }
    const latestData = data[0];
    if (!latestData || !latestData.bpm || !latestData.spo2) {
      alert("⚠ Incomplete data, ensure sensors are connected!");
      return;
    }
    const heartRate = latestData.bpm;
    const SpO2 = latestData.spo2 / 100;
    let calculatedSBP = 120 + 0.3 * age + 0.3 * weight - 0.4 * heartRate - 0.2 * SpO2;
    let calculatedDBP = 80 + 0.3 * age + 0.1 * weight - 0.2 * heartRate - 0.1 * SpO2;
    calculatedSBP = Math.max(90, Math.min(calculatedSBP, 180)).toFixed(1);
 calculatedDBP = Math.max(60, Math.min(calculatedDBP, 120)).toFixed(1);
    setSBP(calculatedSBP);
    setDBP(calculatedDBP);
    try {
      await addDoc(collection(db, "blood_pressure_history"), {
        sbp: calculatedSBP,
        dbp: calculatedDBP,
        bpm: mostCommonBPM.range || mostCommonBPM.join(", "),
        spo2: mostCommonSpO2 || 0,
        hb: maxHb || 0,
        glucose: avgGlucose || 0,
        age: parseInt(age),
        weight: parseInt(weight),
        timestamp: new Date(),
      });
      alert("✅ Results saved successfully to the record!");
    } catch (error) {
      console.error("❌ Error saving results:", error);
      alert("❌ Failed to save results! Check your internet connection.");
    }
  };

  const copyNumberToClipboard = (number) => {
    navigator.clipboard.writeText(number).then(() => {
      alert(`Copied: ${number}`);
    }).catch((error) => {
      console.error("Error during copying:", error);
      alert("Failed to copy! Check permissions.");
    });
  };

  const resetData = async () => {
    if (!window.confirm("⚠ Are you sure you want to delete all data? This action cannot be undone!")) {
      return;
    }
    try {
      const querySnapshot = await getDocs(collection(db, "spo2_bpm_data"));
      querySnapshot.forEach(async (document) => {
        await deleteDoc(doc(db, "spo2_bpm_data", document.id));
      });
      setData([]);
      alert("✅ All data deleted successfully!");
    } catch (error) {
      console.error("❌ Error during deletion:", error);
      alert("❌ Failed to delete data! Check your internet connection.");
    }
  };

  const evaluateHealth = () => {
    if (sbp === null || dbp === null) return "⚠ Please calculate blood pressure first!";
    let healthStatus = "✅ Your health condition is good! No cause for concern.";
    let issues = [];

    if (sbp >= 140 || dbp >= 90) {
      issues.push("🔴 High blood pressure! Consult a doctor.");
    } else if (sbp < 90 || dbp < 60) {
      issues.push("🟡 Low blood pressure! You may feel dizzy, ensure you stay hydrated.");
    }

    if (hb < 12) {
      issues.push("🟠 Possible anemia! Consider eating iron-rich foods.");
    } else if (hb > 16) {
      issues.push("🟣 Abnormally high hemoglobin! Check with your doctor.");
    }

    if (glucose >= 126) {
      issues.push("🚨 High glucose level! You may have diabetes, testing is recommended.");
    } else if (glucose < 70) {
      issues.push("🟡 Low blood sugar! Eat a snack immediately.");
    }

    if (issues.length > 0) {
      healthStatus = issues.map((issue) => `- ${issue}`).join("\n");
    }
    return healthStatus;
  };

  return (
    <div className="d-flex vh-100">
      <div
        className="sidebar bg-dark text-white p-4 d-flex flex-column align-items-start"
        style={{ width: "250px" }}
      >
        <h3 className="text-center w-100 mb-4">📊 Control Panel</h3>
        <button
          className="btn btn-outline-light my-2 w-100"
          onClick={() => setSelectedView("chart")}
        >
          📈 View Chart
        </button>
        <button
          className="btn btn-outline-light my-2 w-100"
          onClick={() => setSelectedView("bp")}
        >
          🩺 Calculate Blood Pressure
        </button>
        <button
          className="btn btn-outline-light my-2 w-100"
          onClick={() => setSelectedView("common")}
        >
          📊 Heart Rate and Oxygen Levels
        </button>
        <button
          className="btn btn-outline-light my-2 w-100"
          onClick={() => setSelectedView("blood")}
        >
          🩸 Hemoglobin and Glucose Levels
        </button>
        <button className="btn btn-danger my-2 w-100" onClick={resetData}>
          🗑 Delete All Data
        </button>
      </div>

      <div className="container-fluid p-4 flex-grow-1">
        {selectedView && (
          <button
            className="btn btn-danger mb-3 shadow-sm"
            onClick={() => setSelectedView("")}
            style={{ fontSize: "1.2rem" }}
          >
            ❌ Close
          </button>
        )}
        {selectedView === "chart" && (
          <div
            className="chart-container rounded-4 shadow-lg"
            style={{
              backgroundColor: "#ffffff",
              padding: "20px",
              height: "600px",
              width: "100%",
            }}
          >
            <Line
              data={{
                labels: data.map((entry) => entry.time.toLocaleTimeString()),
                datasets: [
                  {
                    label: "Heart Rate (BPM)",
                    data: data.map((entry) => entry.bpm),
                    borderColor: "#E91E63",
                    fill: true,
                    tension: 0.4,
                    backgroundColor: "rgba(233, 30, 99, 0.2)",
                  },
                  {
                    label: "Oxygen Saturation (SpO2)",
                    data: data.map((entry) => entry.spo2),
                    borderColor: "#2196F3",
                    fill: true,
                    tension: 0.4,
                    backgroundColor: "rgba(33, 150, 243, 0.2)",
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    labels: {
                      font: {
                        size: 14,
                      },
                    },
                  },
                },
                scales: {
                  x: {
                    grid: {
                      color: "#f0f0f0",
                    },
                    ticks: {
                      color: "#333",
                    },
                  },
                  y: {
                    grid: {
                      color: "#f0f0f0",
                    },
                    ticks: {
                      color: "#333",
                    },
                  },
                },
              }}
            />
          </div>
        )}
        {selectedView === "bp" && (
          <div className="cardd mt-4 shadow-lg p-5 border-0 bg-white text-dark rounded-4">
            <h3 className="text-center fw-bold fs-3">🩺 Calculate Blood Pressure</h3>
            <label className="fw-bold fs-4 mt-3 text-dark">📅 Age:</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Enter age"
              className="form-control mt-2 fs-4 p-3 rounded-3"
            />
            <label className="fw-bold fs-4 mt-3 text-dark">⚖ Weight (kg):</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Enter weight"
              className="form-control mt-2 fs-4 p-3 rounded-3"
            />
            <button
              onClick={calculateBP}
              className="btn btn-primary mt-4 w-100 fs-4 p-3 rounded-3"
            >
              🧮 Calculate Pressure
            </button>
            {sbp !== null && dbp !== null && (
              <div className="mt-4 text-center fw-bold fs-4">
                <p className="text-dark">
                  Systolic Blood Pressure (SBP):
                  <span className="text-danger"> {sbp} mmHg </span>
                  <button
                    className="btn btn-outline-secondary btn-sm ms-2"
                    onClick={() => copyNumberToClipboard(sbp)}
                  >
                    📋
                  </button>
                </p>
                <p className="text-dark">
                  Diastolic Blood Pressure (DBP):
                  <span className="text-success"> {dbp} mmHg </span>
                  <button
                    className="btn btn-outline-secondary btn-sm ms-2"
                    onClick={() => copyNumberToClipboard(dbp)}
                  >
                    📋
                  </button>
                </p>
              </div>
            )}
          </div>
        )}
        {selectedView === "common" && (
          <div className="card p-4">
            <h3>📊 Heart Rate and Oxygen Levels</h3>
            <p className="text-dark fw-bold fs-4">
              Heart Rate (Average: {mostCommonBPM.average || "Not available"}, Range: {mostCommonBPM.range || "Not available"})
              <button
                className="btn btn-outline-secondary btn-sm ms-2"
                onClick={() => copyNumberToClipboard(`Average: ${mostCommonBPM.average || "Not available"}, Range: ${mostCommonBPM.range || "Not available"}`)}
              >
                📋
              </button>
            </p>
            <p className="text-dark fw-bold fs-4">
              Oxygen Saturation: {mostCommonSpO2 || "Not available"}%
              <button
                className="btn btn-outline-secondary btn-sm ms-2"
                onClick={() => copyNumberToClipboard(mostCommonSpO2 || "Not available")}
              >
                📋
              </button>
            </p>
          </div>
        )}
        {selectedView === "blood" && (
          <div className="card p-4">
            <h3>🩸 Hemoglobin and Glucose Levels</h3>
            <p className="text-dark fw-bold fs-4">
              Hemoglobin Level: {maxHb !== null ? `${maxHb.toFixed(1)} g/dL` : "Not available"}
              <button
                className="btn btn-outline-secondary btn-sm ms-2"
                onClick={() => copyNumberToClipboard(maxHb !== null ? maxHb.toFixed(1) : "Not available")}
              >
                📋
              </button>
            </p>
            <p className="text-dark fw-bold fs-4">
              Glucose Level: {avgGlucose !== null ? `${avgGlucose} mg/dL` : "Not available"}
              <button
                className="btn btn-outline-secondary btn-sm ms-2"
                onClick={() => copyNumberToClipboard(avgGlucose || "Not available")}
              >
                📋
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sec;