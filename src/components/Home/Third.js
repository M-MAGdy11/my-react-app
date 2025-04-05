import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
import "./e.css"; // Custom CSS for advanced styling
import {
  db,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  getDocs,
  doc, // Added doc import here
} from "../firebaseConfig";

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
  const [selectedPartIndex, setSelectedPartIndex] = useState(0); // Add state to track selected part

  // Function to save results to Firestore
  const saveResultsToFirestore = async (results) => {
    try {
      // Add the results to Firestore in a new collection called "ecg_results"
      await addDoc(collection(db, "ecg_results"), {
        prInterval: results.prInterval,
        qtInterval: results.qtInterval,
        stSegment: results.stSegment,
        qWave: results.qWave,
        tWave: results.tWave,
        timestamp: new Date() // Add a timestamp for when the data was saved
      });
      console.log("✅ Results saved to Firestore successfully!");
    } catch (error) {
      console.error("❌ Error while saving results to Firestore:", error);
      alert("An error occurred while saving results to Firestore. Check your internet connection.");
    }
  };

  // Function to split data into four parts
  const splitDataIntoFourParts = (data) => {
    const partSize = Math.ceil(data.length / 4);
    return Array.from({ length: 4 }, (_, i) =>
      data.slice(i * partSize, (i + 1) * partSize)
    );
  };

  useEffect(() => {
    // Query Firestore to fetch ECG data with orderBy time
    const q = query(collection(db, "spo22_bpm_data")); // Query to fetch all documents
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      try {
        // Extract data from Firestore
        const rawData = snapshot.docs.flatMap((doc) => {
          const dataField = doc.data().data; // Access the 'data' field which contains the list
          return dataField.map((item) => ({
            time: item.time, // Time from Firestore
            adc: item.adc, // ADC value from Firestore
          }));
        });
        console.log("Raw Data from Firestore:", rawData);

        // Step 1: Sort the data by time in ascending order
        const sortedData = rawData.sort((a, b) => a.time - b.time);
        console.log("Sorted Data:", sortedData);

        // Filtering Data
        const filteredData = sortedData.filter(
          (point) => point.adc >= 1000 && point.adc <= 3500
        );
        console.log("Filtered Data:", filteredData);

        // Remove duplicates
        const noDuplicates = filteredData.reduce((acc, current) => {
          if (!acc.find((item) => item.time === current.time)) {
            acc.push(current);
          }
          return acc;
        }, []);
        console.log("No Duplicates:", noDuplicates);

        // Apply smoothing
        const smoothedData = noDuplicates.map((point, index, arr) => {
          const start = Math.max(0, index - 2);
          const end = Math.min(arr.length, index + 3);
          const window = arr.slice(start, end);
          const avg = window.reduce((sum, p) => sum + p.adc, 0) / window.length;
          return { time: point.time, adc: Math.round(avg) };
        });
        console.log("Smoothed Data:", smoothedData);

        // Step 2: Adjust the time values in smoothedData
        const minTime = Math.min(...smoothedData.map(point => point.time));
        const adjustedSmoothedData = smoothedData.map(point => ({
          ...point,
          time: point.time - minTime, // Shift time values to start from 0
        }));
        console.log("Adjusted Smoothed Data:", adjustedSmoothedData);

        // Split the data into four parts
        const parts = splitDataIntoFourParts(adjustedSmoothedData);
        console.log("Data Parts:", parts);

        // Update chart data with the selected part
        setFilteredChartData(parts[selectedPartIndex]);

        // Calculate results for the selected part
        calculateResults(parts[selectedPartIndex]);
      } catch (error) {
        console.error("❌ Error while processing data:", error);
        alert("An error occurred while processing data. Check your internet connection.");
      }
    });

    return () => unsubscribe(); // Unsubscribe when component unmounts
  }, [selectedPartIndex]);

  const calculateResults = (data) => {
    if (data.length === 0) {
      console.warn("No data available to analyze.");
      setResults({
        prInterval: "N/A",
        qtInterval: "N/A",
        stSegment: "N/A",
        qWave: "N/A",
        tWave: "N/A",
        alert: "لا توجد بيانات كافية لتحليل ECG.",
      });
      return;
    }

    // Define the expected times manually
    const expectedTimes = [0, 100, 120, 140, 290, 320]; // Adjusted to match new time range

    // Finding Key Points
    const findClosest = (time, data) => {
      if (!data || data.length === 0) {
        console.error(`No data available to find closest point for time ${time}`);
        return { time: Infinity, adc: 0 }; // Return default value if nothing is found
      }
      let closestPoint = { time: Infinity, adc: 0 };
      let minDiff = Infinity;
      for (const point of data) {
        const diff = Math.abs(point.time - time);
        if (diff < minDiff && diff <= 50) { // Search only for points with time differences ≤ 50
          minDiff = diff;
          closestPoint = point;
        }
      }
      if (closestPoint.time === Infinity) {
        console.warn(`No suitable point found near time ${time}`);
        return null; // Return null if no suitable point is found
      }
      console.log(`Closest point for time ${time}:`, closestPoint);
      return closestPoint;
    };

    // Find key points
    const keyPoints = expectedTimes.map((time) => findClosest(time, data));

    // Check if all key points are found
    if (keyPoints.some(point => !point)) {
      console.error("Some key points were not found!");
      setResults({
        prInterval: "N/A",
        qtInterval: "N/A",
        stSegment: "N/A",
        qWave: "N/A",
        tWave: "N/A",
        alert: "لم يتم العثور على بعض النقاط الرئيسية.",
      });
      return;
    }

    const [pWave, qWave, rPeak, sPoint, tStart, tWaveEnd] = keyPoints;

    // Calculate intervals
    const prInterval = rPeak.time - pWave.time;
    const qtInterval = tWaveEnd.time - qWave.time;
    const stDiff = Math.abs(tStart.adc - sPoint.adc);
    const qDepth = qWave.adc / rPeak.adc;
    const tWaveValue = tWaveEnd.adc;

    const summary = {
      prInterval: `${prInterval} ms`,
      qtInterval: `${qtInterval} ms`,
      stSegment: `±${stDiff} ADC`,
      qWave: `${(qDepth * 100).toFixed(0)}%`,
      tWave: `${tWaveValue}`,
      alert:
        qtInterval < 350 || qDepth >= 0.25
          ? `تحذير: ${qtInterval < 350 ? `QT قصير (${qtInterval} ms)` : ""} ${
              qtInterval < 350 && qDepth >= 0.25 ? " + " : ""
            }${
              qDepth >= 0.25
                ? `Q-wave عميقة (${(qDepth * 100).toFixed(0)}%)`
                : ""
            }`
          : "لا يوجد مشاكل واضحة",
    };

    setResults(summary);

    // Save results to Firestore
    saveResultsToFirestore(summary);
  };

  const deleteAllData = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete all data?");
    if (!confirmDelete) return;
    try {
      // Get all documents in the collection
      const q = query(collection(db, "spo22_bpm_data"));
      const snapshot = await getDocs(q);

      // Check if the collection is empty
      if (snapshot.empty) {
        alert("The collection is already empty. No data to delete.");
        return;
      }

      // Delete each document one by one
      const deletePromises = snapshot.docs.map((docSnapshot) => {
        return deleteDoc(doc(db, "spo22_bpm_data", docSnapshot.id));
      });

      // Wait for all deletions to complete
      await Promise.all(deletePromises);
      console.log("✅ All data deleted successfully!");
      alert("All data deleted successfully!");

      // Update the UI
      setFilteredChartData([]);
      setResults(null);
    } catch (error) {
      console.error("❌ Error while deleting data:", error);
      alert("An error occurred while deleting data. Check your internet connection.");
    }
  };

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
                {/* Adjust graph position to center */}
                <XAxis
                  dataKey="time"
                  domain={[0, Math.max(...filteredChartData.map(point => point.time))]} // Update domain dynamically
                  tick={{ fontWeight: "bold", fontSize: 14 }} // Make numbers bold
                />
                <YAxis
                  domain={[1000, 3500]} // Set y-axis range
                  tick={{ fontWeight: "bold", fontSize: 14 }} // Make numbers bold
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
            <button
              className="btn btn-danger"
              onClick={deleteAllData}
            >
              Delete All Data
            </button>
          </div>
        </div>
      </div>
      {/* Results Section */}
      {results && (
        <div className="neumorphic-card card shadow mt-4 w-100 mx-auto text-dark" style={{ maxWidth: "1200px" }}>
          <div className="card-body p-4">
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
          </div>
        </div>
      )}
    </div>
  );
};

export default Third;