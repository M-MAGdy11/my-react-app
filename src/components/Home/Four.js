import React, { useEffect, useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
import {
  db,
  collection,
  onSnapshot,
  addDoc, // لإضافة وثائق جديدة
  deleteDoc, // لإزالة الوثائق
  getDocs, // للحصول على جميع الوثائق
  doc,
} from "../firebaseConfig"; // استيراد Firebase SDK

const Four = () => {
  const [chartData, setChartData] = useState([]); // All data fetched from Firestore
  const [selectedChart, setSelectedChart] = useState(0); // Selected main chart index (0-3)
  const [topAdcValues, setTopAdcValues] = useState([]); // To store top ADC values history

  useEffect(() => {
    // Query Firestore to fetch ECG data with nested 'data' field
    const unsubscribe = onSnapshot(collection(db, "spo222_bpm_data"), (snapshot) => {
      const rawData = snapshot.docs.flatMap((doc) => {
        const dataField = doc.data().data; // Access the nested 'data' field
        return dataField || []; // Return the array or an empty array if 'data' is missing
      });
      // Sort the data by 'time' in ascending order
      const sortedData = rawData.sort((a, b) => a.time - b.time);
      setChartData(sortedData);
      // Automatically calculate and store top 3 ADC values
      const top3Values = [...sortedData]
        .sort((a, b) => b.adc - a.adc) // Sort descending by ADC
        .slice(0, 3); // Get top 3 values
      // Store top 3 ADC values in Firestore automatically
      storeTopAdcValues(top3Values);
    });

    // Fetch top ADC values history
    const fetchTopAdcValues = async () => {
      const querySnapshot = await getDocs(collection(db, "top_adc_values"));
      const values = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTopAdcValues(values);
    };
    fetchTopAdcValues();

    return () => unsubscribe(); // Unsubscribe when component unmounts
  }, []);

  // Split data into chunks of a given size
  const splitData = (data, chunkSize) => {
    const result = [];
    for (let i = 0; i < data.length; i += chunkSize) {
      result.push(data.slice(i, i + chunkSize));
    }
    return result;
  };

  // Split data into 4 main chunks (each containing 250 points)
  const mainChunks = useMemo(() => splitData(chartData, 250), [chartData]);

  // Split each main chunk into 2 sub-chunks (each containing 125 points)
  const subChunks = useMemo(
    () => mainChunks.map((chunk) => splitData(chunk, 125)),
    [mainChunks]
  );

  // Get the currently selected sub-chunk (always use the first sub-chunk)
  const selectedSubChunk = useMemo(
    () => subChunks[selectedChart]?.[0] || [],
    [subChunks, selectedChart]
  );

  // Function to store top 3 ADC values in Firestore
  const storeTopAdcValues = async (values) => {
    try {
      // Clear existing top ADC values in Firestore
      const topAdcSnapshot = await getDocs(collection(db, "top_adc_values"));
      topAdcSnapshot.forEach(async (document) => {
        await deleteDoc(doc(db, "top_adc_values", document.id));
      });
      // Add new top 3 values to Firestore
      values.forEach(async (value) => {
        await addDoc(collection(db, "top_adc_values"), {
          time: value.time,
          adc: value.adc,
          timestamp: new Date(), // Add a timestamp for sorting or reference
        });
      });
      // Refresh the top ADC values history
      const querySnapshot = await getDocs(collection(db, "top_adc_values"));
      const updatedValues = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTopAdcValues(updatedValues);
      console.log("✅ تم حفظ أعلى 3 قيم بنجاح!");
    } catch (error) {
      console.error("❌ حدث خطأ أثناء الحفظ:", error);
      alert("❌ فشل في حفظ القيم! تحقق من الاتصال بالإنترنت.");
    }
  };

  // Function to reset all data
  const resetData = async () => {
    const confirmDelete = window.confirm("⚠ هل أنت متأكد أنك تريد مسح جميع البيانات؟ لا يمكن التراجع عن هذه العملية!");
    if (!confirmDelete) return;
    try {
      // Delete all documents in "spo222_bpm_data"
      const querySnapshot = await getDocs(collection(db, "spo222_bpm_data"));
      querySnapshot.forEach(async (document) => {
        await deleteDoc(doc(db, "spo222_bpm_data", document.id));
      });
      // Delete all documents in "top_adc_values"
      const topAdcSnapshot = await getDocs(collection(db, "top_adc_values"));
      topAdcSnapshot.forEach(async (document) => {
        await deleteDoc(doc(db, "top_adc_values", document.id));
      });
      // Update the UI
      setChartData([]); // Clear the data
      setTopAdcValues([]); // Clear the top ADC values history
      alert("✅ تم مسح جميع البيانات بنجاح!");
    } catch (error) {
      console.error("❌ حدث خطأ أثناء المسح:", error);
      alert("❌ فشل في مسح البيانات! تحقق من الاتصال بالإنترنت.");
    }
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
      {/* Main Container */}
      <div
        style={{
          width: "100%",
          maxWidth: "1400px",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        {/* Select Dropdown for Main Chart */}
        <div
          style={{
            marginBottom: "20px",
            display: "flex",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          <label style={{ fontWeight: "bold", color: "#333" }}>
            اختر الرسم الرئيسي:
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
                الرسم الرئيسي {index + 1}
              </option>
            ))}
          </select>
        </div>

        {/* Top 3 Values in a Table */}
        <div
          style={{
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          <h4 style={{ fontWeight: "bold", color: "#333" }}>اعلي 3 قيم لقوه العضلات :</h4>
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
              <tr
                style={{
                  background: "#8884d8",
                  color: "#fff",
                  fontWeight: "bold",
                }}
              >
                <th style={{ padding: "10px 15px", border: "1px solid #ddd" }}>
                  الوقت
                </th>
                <th style={{ padding: "10px 15px", border: "1px solid #ddd" }}>
                  القيمة
                </th>
              </tr>
            </thead>
            <tbody>
              {chartData.length > 0 ? (
                [...chartData]
                  .sort((a, b) => b.adc - a.adc) // Sort descending by ADC
                  .slice(0, 3) // Get top 3 values
                  .map((item, index) => (
                    <tr
                      key={index}
                      style={{
                        background: index % 2 === 0 ? "#f9f9f9" : "#fff",
                      }}
                    >
                      <td
                        style={{
                          padding: "10px 15px",
                          border: "1px solid #ddd",
                          color: "#333",
                        }}
                      >
                        {item.time} ms
                      </td>
                      <td
                        style={{
                          padding: "10px 15px",
                          border: "1px solid #ddd",
                          color: "#333",
                        }}
                      >
                        {item.adc}
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan="2" className="text-center">
                    لا توجد بيانات متاحة.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Chart Container */}
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
              {/* Improved Grid */}
              <CartesianGrid stroke="#f0f0f0" strokeDasharray="5 5" />
              {/* X-Axis */}
              <XAxis
                dataKey="time"
                domain={[
                  Math.min(...selectedSubChunk.map((d) => d.time)),
                  Math.max(...selectedSubChunk.map((d) => d.time)),
                ]}
                tick={{ fontWeight: "bold", fontSize: 12, fill: "#333" }}
              />
              {/* Y-Axis */}
              <YAxis
                domain={[
                  Math.min(...selectedSubChunk.map((d) => d.adc)),
                  Math.max(...selectedSubChunk.map((d) => d.adc)),
                ]}
                tick={{ fontWeight: "bold", fontSize: 12, fill: "#333" }}
              />
              {/* Tooltip */}
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
                          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                        }}
                      >
                        {/* تغيير لون النصوص إلى الأسود */}
                        <p style={{ fontWeight: "bold", color: "#000" }}>
                          الوقت: {payload[0].payload.time} ms
                        </p>
                        <p style={{ color: "#000" }}>
                          قيمة ADC: {payload[0].payload.adc}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {/* Improved Line */}
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
              لا توجد بيانات كافية للرسم.
            </p>
          )}
        </div>

        {/* Reset Button */}
        <div
          style={{
            marginTop: "20px",
            textAlign: "center",
          }}
        >
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
      </div>
    </div>
  );
};

export default Four;