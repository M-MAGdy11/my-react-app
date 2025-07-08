import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import "bootstrap/dist/css/bootstrap.min.css";
import "./e.css";
import { db, collection, query, addDoc, deleteDoc, getDocs, doc } from "../firebaseConfig";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="neumorphic-tooltip p-3 rounded shadow-sm">
        <p className="fw-bold text-dark">Time: {payload[0].payload.time} ms</p>
        <p className="text-dark">ADC Value: {payload[0].payload.adc}</p>
      </div>
    );
  }
  return null;
};

const Third = () => {
  const [filteredChartData, setFilteredChartData] = useState([]);
  const [results, setResults] = useState(null);
  const [selectedPartIndex, setSelectedPartIndex] = useState(0);
  const [fullData, setFullData] = useState([]);

  // Fixed ECG cycle template for a healthy person
  const singleEcgCycle = [
    { time: 0, adc: 1000 }, { time: 20, adc: 1020 }, { time: 40, adc: 1050 },
    { time: 60, adc: 1100 }, { time: 80, adc: 1050 }, { time: 100, adc: 1020 },
    { time: 120, adc: 1000 }, { time: 140, adc: 1000 }, { time: 160, adc: 1000 },
    { time: 165, adc: 950 }, { time: 175, adc: 1400 }, { time: 180, adc: 2000 },
    { time: 185, adc: 2500 }, { time: 195, adc: 1200 }, { time: 200, adc: 900 },
    { time: 205, adc: 800 }, { time: 220, adc: 850 }, { time: 250, adc: 900 },
    { time: 300, adc: 950 }, { time: 350, adc: 1000 }, { time: 375, adc: 1100 },
    { time: 400, adc: 1200 }, { time: 425, adc: 1100 }, { time: 450, adc: 1000 },
    { time: 500, adc: 1000 }, { time: 600, adc: 1000 }, { time: 700, adc: 1000 },
    { time: 800, adc: 1000 },
  ];

  // Generate fixed ECG data by repeating the single cycle
  const generateFullEcgData = () => {
    const totalCycles = 10;
    const cycleDuration = 800;
    let fullData = [];

    for (let i = 0; i < totalCycles; i++) {
      const offset = i * cycleDuration;
      const cycleData = singleEcgCycle.map((point) => ({
        time: point.time + offset,
        adc: point.adc,
      }));
      fullData = [...fullData, ...cycleData];
    }

    return fullData;
  };

  // Fixed results for a healthy person
  const generateFixedResults = () => {
    return {
      prInterval: "160 ms",
      qtInterval: "400 ms",
      stSegment: "±50 ADC",
      qWave: "20%",
      tWave: "300",
    };
  };

  // Split data into four parts
  const splitDataIntoFourParts = (data) => {
    const partSize = Math.ceil(data.length / 4);
    return Array.from({ length: 4 }, (_, i) =>
      data.slice(i * partSize, (i + 1) * partSize)
    );
  };

  // Save results to Firestore
  const saveResultsToFirestore = async (results) => {
    try {
      await addDoc(collection(db, "ecg_results"), {
        prInterval: results.prInterval,
        qtInterval: results.qtInterval,
        stSegment: results.stSegment,
        qWave: results.qWave,
        tWave: results.tWave,
        timestamp: new Date(),
      });
      console.log("✅ Results saved to Firestore successfully!");
    } catch (error) {
      console.error("❌ Error while saving results to Firestore:", error);
    }
  };

  // Delete all data from Firestore
  const deleteAllData = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete all data?");
    if (!confirmDelete) return;
    try {
      const q = query(collection(db, "ecg_results"));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        alert("The collection is already empty. No data to delete.");
        return;
      }

      const deletePromises = snapshot.docs.map((docSnapshot) =>
        deleteDoc(doc(db, "ecg_results", docSnapshot.id))
      );

      await Promise.all(deletePromises);
      console.log("✅ All data deleted successfully!");
      alert("All data deleted successfully!");
    } catch (error) {
      console.error("❌ Error while deleting data:", error);
      alert("An error occurred while deleting data. Check your internet connection.");
    }
  };

  // Copy results to clipboard
  const copyResultsToClipboard = () => {
    if (!results) return;
    const textToCopy = `
PR Interval: ${results.prInterval}
QT Interval: ${results.qtInterval}
ST Segment: ${results.stSegment}
Q-wave: ${results.qWave}
T-wave: ${results.tWave}
    `.trim();
    navigator.clipboard.writeText(textToCopy).then(() => {
      alert("Results copied successfully!");
    }).catch((error) => {
      console.error("Error during copying:", error);
      alert("Failed to copy! Check permissions.");
    });
  };

  // Load fixed data on component mount
  useEffect(() => {
    // Generate fixed ECG data
    const newEcgData = generateFullEcgData();
    setFullData(newEcgData);

    // Set fixed results
    const newResults = generateFixedResults();
    setResults(newResults);

    // Save results to Firestore
    saveResultsToFirestore(newResults);

    // Split the data into four parts and set the initial part
    const parts = splitDataIntoFourParts(newEcgData);
    setFilteredChartData(parts[selectedPartIndex]);
  }, [selectedPartIndex]);

  return (
    <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center gradient-bg py-5">
      {/* Chart Container */}
      <div className="neumorphic-card card shadow-lg w-100 mx-auto mt-5 text-dark" style={{ maxWidth: "1200px" }}>
        <div className="card-body p-4">
          {/* Dropdown to select the part */}
          <div className="mb-3">
            <label htmlFor="partSelector" className="form-label">
              Select Part:
            </label>
            <select
              id="partSelector"
              className="form-select"
              value={selectedPartIndex}
              onChange={(e) => setSelectedPartIndex(Number(e.target.value))}
            >
              <option value="0" style={{ backgroundColor: 'black' }}>Part 1</option>
              <option value="1" style={{ backgroundColor: 'black' }}>Part 2</option>
              <option value="2" style={{ backgroundColor: 'black' }}>Part 3</option>
              <option value="3" style={{ backgroundColor: 'black' }}>Part 4</option>
            </select>
          </div>
          {filteredChartData.length > 0 && (
            <div className="position-relative animate__animated animate__fadeInUp">
              <LineChart
                width={window.innerWidth > 768 ? 1000 : window.innerWidth - 50}
                height={500}
                data={filteredChartData}
                margin={{ top: 30, right: 30, left: 30, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="time"
                  domain={[0, Math.max(...filteredChartData.map(point => point.time))]}
                  tick={{ fontWeight: "bold", fontSize: 14 }}
                />
                <YAxis
                  domain={[600, 3000]}
                  tick={{ fontWeight: "bold", fontSize: 14 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="adc"
                  stroke="rgba(0, 0, 0, 0.9)"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </div>
          )}
          {/* Delete button */}
          <div className="d-flex justify-content-end mt-3">
            <button className="btn btn-danger" onClick={deleteAllData}>
              Delete All Data
            </button>
          </div>
        </div>
      </div>
      {/* Results Section */}
      {results && (
        <div className="neumorphic-card card shadow mt-4 w-100 mx-auto text-dark" style={{ maxWidth: "1200px" }}>
          <div className="card-body p-4">
            <h3 className="text-center fw-bold mb-3">Results of ECG Signal</h3>
            <textarea
              readOnly
              className="form-control bg-transparent border-0 text-dark neumorphic-textarea"
              rows={8}
              value={`
PR Interval: ${results.prInterval}
QT Interval: ${results.qtInterval}
ST Segment: ${results.stSegment}
Q-wave: ${results.qWave}
T-wave: ${results.tWave}
`}
            />
            <div className="d-flex justify-content-end mt-3">
              <button
                className="btn btn-outline-secondary"
                onClick={copyResultsToClipboard}
              >
                📋 Copy Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Third;