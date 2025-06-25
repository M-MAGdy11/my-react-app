import React, { useEffect, useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import "bootstrap/dist/css/bootstrap.min.css";
import "./e.css"; // Assuming e.css contains neumorphic-card styles
import {
  db,
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  getDocs,
  doc,
} from "../firebaseConfig";

const Four = () => {
  const [chartData, setChartData] = useState([]);
  const [selectedChart, setSelectedChart] = useState(0);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "spo222_bpm_data"), (snapshot) => {
      const rawData = snapshot.docs.flatMap((doc) => {
        const dataField = doc.data().data;
        return dataField || [];
      });
      const sortedData = rawData.sort((a, b) => a.time - b.time);
      setChartData(sortedData);
      const top3Values = [...sortedData]
        .sort((a, b) => b.adc - a.adc)
        .slice(0, 3);
      storeTopMuscleValues(top3Values);
    });

    return () => unsubscribe();
  }, []);

  const splitData = (data, chunkSize) => {
    const result = [];
    for (let i = 0; i < data.length; i += chunkSize) {
      result.push(data.slice(i, i + chunkSize));
    }
    return result;
  };

  const mainChunks = useMemo(() => splitData(chartData, 250), [chartData]);

  const subChunks = useMemo(
    () => mainChunks.map((chunk) => splitData(chunk, 125)),
    [mainChunks]
  );

  const selectedSubChunk = useMemo(
    () => subChunks[selectedChart]?.[0] || [],
    [subChunks, selectedChart]
  );

  const storeTopMuscleValues = async (values) => {
    try {
      // Store in muscle_activity_history only
      values.forEach(async (value) => {
        await addDoc(collection(db, "muscle_activity_history"), {
          time: value.time,
          adc: value.adc,
          timestamp: new Date(),
        });
      });

      console.log("✅ Top 3 muscle activity values saved successfully!");
    } catch (error) {
      console.error("❌ Error during saving:", error);
      alert("❌ Failed to save values! Check your internet connection.");
    }
  };

  const resetData = async () => {
    const confirmDelete = window.confirm("⚠ Are you sure you want to delete all data? This action cannot be undone!");
    if (!confirmDelete) return;
    try {
      const querySnapshot = await getDocs(collection(db, "spo222_bpm_data"));
      querySnapshot.forEach(async (document) => {
        await deleteDoc(doc(db, "spo222_bpm_data", document.id));
      });
      // Clear muscle_activity_history
      const muscleHistorySnapshot = await getDocs(collection(db, "muscle_activity_history"));
      muscleHistorySnapshot.forEach(async (document) => {
        await deleteDoc(doc(db, "muscle_activity_history", document.id));
      });
      setChartData([]);
      alert("✅ All data deleted successfully!");
    } catch (error) {
      console.error("❌ Error during deletion:", error);
      alert("❌ Failed to delete data! Check your internet connection.");
    }
  };

  const copyTopValuesToClipboard = () => {
    const top3Values = [...chartData]
      .sort((a, b) => b.adc - a.adc)
      .slice(0, 3);

    const formattedValues = top3Values
      .map((item, index) => `Value ${index + 1}: Time = ${item.time} ms, Muscle Activity = ${item.adc}`)
      .join("\n");

    navigator.clipboard.writeText(formattedValues).then(() => {
      alert("Top 3 muscle activity values copied to clipboard successfully!");
    }).catch((error) => {
      console.error("Error during copying:", error);
      alert("Failed to copy values! Check permissions.");
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f5f7fa, #c3cfe2)",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1400px",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <div
          style={{
            marginBottom: "20px",
            display: "flex",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          <label style={{ fontWeight: "bold", color: "#333" }}>
            Select Main Chart:
          </label>
          <select
            value={selectedChart}
            onChange={(e) => setSelectedChart(Number(e.target.value))}
            style={{
              padding: "8px 12px",
              borderRadius: "5px",
              border: "1px solid #ddd",
              backgroundColor: "black",
              color: "white",
              fontWeight: "bold",
            }}
          >
            {mainChunks.map((_, index) => (
              <option key={index} value={index}>
                Main Chart {index + 1}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: "20px", textAlign: "center" }}>
          <h4 style={{ fontWeight: "bold", color: "#333" }}>Top 3 Muscle Activity Values:</h4>
          <table
            style={{
              margin: "0 auto",
              borderCollapse: "collapse",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              borderRadius: "8px",
              overflow: "hidden",
              background: "#fff",
            }}
          >
            <thead>
              <tr style={{ background: "#8884d8", color: "#fff", fontWeight: "bold" }}>
                <th style={{ padding: "10px 15px", border: "1px solid #ddd" }}>Time</th>
                <th style={{ padding: "10px 15px", border: "1px solid #ddd" }}>Muscle Activity</th>
              </tr>
            </thead>
            <tbody>
              {chartData.length > 0 ? (
                [...chartData]
                  .sort((a, b) => b.adc - a.adc)
                  .slice(0, 3)
                  .map((item, index) => (
                    <tr key={index} style={{ background: index % 2 === 0 ? "#f9f9f9" : "#fff" }}>
                      <td style={{ padding: "10px 15px", border: "1px solid #ddd", color: "#333" }}>
                        {item.time} ms
                      </td>
                      <td style={{ padding: "10px 15px", border: "1px solid #ddd", color: "#333" }}>
                        {item.adc}
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan="2" className="text-center">
                    No data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ marginBottom: "20px", textAlign: "center" }}>
          <button
            className="btn btn-primary"
            onClick={copyTopValuesToClipboard}
            style={{
              padding: "10px 20px",
              fontWeight: "bold",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            Copy Top 3 Muscle Activity Values
          </button>
        </div>

        <div
          style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          {selectedSubChunk.length > 0 ? (
            <LineChart
              width={window.innerWidth > 768 ? 1200 : window.innerWidth - 50}
              height={400}
              data={selectedSubChunk}
              margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
            >
              <CartesianGrid stroke="#f0f0f0" strokeDasharray="5 5" />
              <XAxis
                dataKey="time"
                domain={[
                  Math.min(...selectedSubChunk.map((d) => d.time)),
                  Math.max(...selectedSubChunk.map((d) => d.time)),
                ]}
                tick={{ fontWeight: "bold", fontSize: 12, fill: "#333" }}
              />
              <YAxis
                domain={[
                  Math.min(...selectedSubChunk.map((d) => d.adc)),
                  Math.max(...selectedSubChunk.map((d) => d.adc)),
                ]}
                tick={{ fontWeight: "bold", fontSize: 12, fill: "#333" }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div
                        style={{
                          padding: "10px",
                          background: "#fff",
                          border: "1px solid #ddd",
                          borderRadius: "5px",
                          boxShadow: "0 2px 4px rgba(0entieth: 0, 0, 0, 0.1)",
                        }}
                      >
                        <p style={{ fontWeight: "bold", color: "#000" }}>
                          Time: {payload[0].payload.time} ms
                        </p>
                        <p style={{ color: "#000" }}>
                          Muscle Activity: {payload[0].payload.adc}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="adc"
                stroke="#8884d8"
                strokeWidth={2}
                strokeLinecap="round"
                fillOpacity={0}
              />
            </LineChart>
          ) : (
            <p style={{ color: "#dc3545", fontWeight: "bold" }}>
              Insufficient data for plotting.
            </p>
          )}
        </div>

        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <button
            className="btn btn-danger"
            onClick={resetData}
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

        {/* Footer Note */}
        <div className="neumorphic-card card shadow mt-4 w-100 mx-auto text-dark" style={{ maxWidth: "1200px" }}>
          <div className="card-body p-3 text-center">
            <p className="text-muted small mb-0">
              For more information, ask the chatbot
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Four;