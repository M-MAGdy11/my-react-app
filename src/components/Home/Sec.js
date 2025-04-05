import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { db, collection, query, orderBy, onSnapshot, addDoc } from "../firebaseConfig"; // أضفنا addDoc
import "chart.js/auto";
import "bootstrap/dist/css/bootstrap.min.css";
import "./s.css";
import { getDocs, deleteDoc, doc } from "firebase/firestore";

const Sec = () => {
  const [data, setData] = useState([]);
  const [mostCommonBPM, setMostCommonBPM] = useState([]);
  const [mostCommonSpO2, setMostCommonSpO2] = useState([]);
  const [selectedView, setSelectedView] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [sbp, setSBP] = useState(null);
  const [dbp, setDBP] = useState(null);
  const [hb, sethb] = useState(null); // تحديث الحالة
  const [glucose, setGlucose] = useState(null); // تحديث الحالة
  const [maxhb, setMaxhb] = useState(null); // أعلى قيمة هيموجلوبين
  const [maxGlucose, setMaxGlucose] = useState(null); // أعلى قيمة جلوكوز

  useEffect(() => {
    const q = query(collection(db, "spo2_bpm_data"), orderBy("time", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const readings = snapshot.docs.map((doc) => {
        const docData = doc.data();
        return {
          id: doc.id,
          bpm: docData.bpm || 0,
          spo2: docData.spo2 || 0,
          hb: docData.hb || 0, // إضافة حقل الهيموجلوبين
          glucose: docData.glucose || 0, // إضافة حقل الجلوكوز
          time: docData.time?.toDate ? docData.time.toDate() : new Date(docData.time),
        };
      });
      setData(readings);
      calculateCommonValues(readings);

      // حساب القيم العليا
      const { maxhb, maxGlucose } = calculateMaxValues(readings);
      setMaxhb(maxhb);
      setMaxGlucose(maxGlucose);
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
        .slice(0, 5)
        .map((item) => parseFloat(item[0]).toFixed(1));
      const sortedSpO2 = Object.entries(spo2Counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map((item) => parseFloat(item[0]).toFixed(1));
      setMostCommonBPM(sortedBPM);
      setMostCommonSpO2(sortedSpO2);
    }
  };

  const calculateMaxValues = (readings) => {
    if (readings.length > 0) {
      const maxhb = Math.max(...readings.map((entry) => entry.hb));
      const maxGlucose = Math.max(...readings.map((entry) => entry.glucose));
      return { maxhb, maxGlucose };
    }
    return { maxhb: null, maxGlucose: null };
  };

  const calculateBP = async (event) => {
    event.preventDefault();
    if (!age || !weight) {
      alert("⚠️ يرجى إدخال العمر والوزن!");
      return;
    }
    if (data.length === 0) {
      alert("⚠️ لم يتم تحميل بيانات المستشعر بعد! الرجاء الانتظار.");
      return;
    }
    const latestData = data[0];
    if (!latestData || !latestData.bpm || !latestData.spo2) {
      alert("⚠️ البيانات غير مكتملة، تأكد من اتصال الحساسات!");
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
        bpm: mostCommonBPM.join(", "),
        spo2: mostCommonSpO2.join(", "),
        hb: hb,
        glucose: glucose,
        age: parseInt(age),
        weight: parseInt(weight),
        timestamp: new Date(),
      });
      alert("✅ تم حفظ النتائج بنجاح في السجل!");
    } catch (error) {
      console.error("❌ خطأ أثناء حفظ النتائج:", error);
      alert("❌ فشل في حفظ النتائج! تحقق من الاتصال بالإنترنت.");
    }
  };

  const copyNumberToClipboard = (number) => {
    navigator.clipboard.writeText(number);
    alert(`📋 تم نسخ: ${number}`);
  };

  const resetData = async () => {
    if (!window.confirm("⚠️ هل أنت متأكد أنك تريد مسح جميع البيانات؟ لا يمكن التراجع عن هذه العملية!")) {
      return;
    }
    try {
      const querySnapshot = await getDocs(collection(db, "spo2_bpm_data"));
      querySnapshot.forEach(async (document) => {
        await deleteDoc(doc(db, "spo2_bpm_data", document.id));
      });
      setData([]); // تفريغ البيانات في الواجهة
      alert("✅ تم مسح جميع البيانات بنجاح!");
    } catch (error) {
      console.error("❌ حدث خطأ أثناء المسح:", error);
      alert("❌ فشل في مسح البيانات! تحقق من الاتصال بالإنترنت.");
    }
  };

  const evaluateHealth = () => {
    if (sbp === null || dbp === null) return "⚠️ الرجاء حساب ضغط الدم أولاً!";
    let healthStatus = "✅ حالتك الصحية جيدة! لا يوجد ما يدعو للقلق.";
    let issues = [];
    // تقييم ضغط الدم
    if (sbp >= 140 || dbp >= 90) {
      issues.push("🔴 ارتفاع ضغط الدم! يُفضل استشارة الطبيب.");
    } else if (sbp < 90 || dbp < 60) {
      issues.push("🟡 انخفاض ضغط الدم! قد تشعر بالدوار، تأكد من شرب السوائل.");
    }
    // تقييم نسبة الهيموجلوبين
    if (hb < 12) {
      issues.push("🟠 احتمال وجود فقر دم! يُفضل تناول أطعمة غنية بالحديد.");
    } else if (hb > 16) {
      issues.push("🟣 ارتفاع غير طبيعي في الهيموجلوبين! تحقق من طبيبك.");
    }
    // تقييم نسبة الجلوكوز
    if (glucose >= 126) {
      issues.push("🚨 نسبة الجلوكوز مرتفعة! قد يكون لديك سكري، يُنصح بالفحص.");
    } else if (glucose < 70) {
      issues.push("🟡 انخفاض نسبة السكر في الدم! تناول وجبة خفيفة فورًا.");
    }
    if (issues.length > 0) {
      healthStatus = issues.map((issue) => `- ${issue}`).join("\n");
    }
    return healthStatus;
  };

  return (
    <div className="d-flex vh-100">
      {/* Sidebar */}
      <div
        className="sidebar bg-dark text-white p-4 d-flex flex-column align-items-start"
        style={{ width: "250px" }}
      >
        <h3 className="text-center w-100 mb-4">📊 التحكم</h3>
        <button
          className="btn btn-outline-light my-2 w-100"
          onClick={() => setSelectedView("chart")}
        >
          📈 عرض الرسم البياني
        </button>
        <button
          className="btn btn-outline-light my-2 w-100"
          onClick={() => setSelectedView("bp")}
        >
          🩺 حساب ضغط الدم
        </button>
        <button
          className="btn btn-outline-light my-2 w-100"
          onClick={() => setSelectedView("common")}
        >
          📊 أكثر القيم تكرارًا
        </button>
        <button
          className="btn btn-outline-light my-2 w-100"
          onClick={() => setSelectedView("blood")}
        >
          🩸 نسبة الهيموجلوبين والجلوكوز
        </button>
        <button className="btn btn-danger my-2 w-100" onClick={resetData}>
          🗑️ مسح جميع البيانات
        </button>
      </div>
      {/* Main Content */}
      <div className="container-fluid p-4 flex-grow-1">
        {selectedView && (
          <button
            className="btn btn-danger mb-3 shadow-sm"
            onClick={() => setSelectedView("")}
            style={{ fontSize: "1.2rem" }}
          >
            ❌ إغلاق
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
                    label: "معدل ضربات القلب (BPM)",
                    data: data.map((entry) => entry.bpm),
                    borderColor: "#E91E63",
                    fill: true,
                    tension: 0.4,
                    backgroundColor: "rgba(233, 30, 99, 0.2)",
                  },
                  {
                    label: "نسبة الأكسجين (SpO2)",
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
            <h3 className="text-center fw-bold fs-3">🩺 حساب ضغط الدم</h3>
            <label className="fw-bold fs-4 mt-3 text-dark">📅 العمر:</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="أدخل العمر"
              className="form-control mt-2 fs-4 p-3 rounded-3"
            />
            <label className="fw-bold fs-4 mt-3 text-dark">⚖️ الوزن (كجم):</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="أدخل الوزن"
              className="form-control mt-2 fs-4 p-3 rounded-3"
            />
            <button
              onClick={calculateBP}
              className="btn btn-primary mt-4 w-100 fs-4 p-3 rounded-3"
            >
              🧮 حساب الضغط
            </button>
            {sbp !== null && dbp !== null && (
              <div className="mt-4 text-center fw-bold fs-4">
                <p className="text-dark">
                  الضغط الانقباضي (SBP):
                  <span className="text-danger"> {sbp} mmHg </span>
                  <button
                    className="btn btn-outline-secondary btn-sm ms-2"
                    onClick={() => copyNumberToClipboard(sbp)}
                  >
                    📋
                  </button>
                </p>
                <p className="text-dark">
                  الضغط الانبساطي (DBP):
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
            <h3>📊 أكثر القيم تكرارًا</h3>
            <p className="text-dark fw-bold fs-4">
              🔴 نبضات القلب الأكثر شيوعًا: {mostCommonBPM.join(", ")}
              <button
                className="btn btn-outline-secondary btn-sm ms-2"
                onClick={() => copyNumberToClipboard(mostCommonBPM.join(", "))}
              >
                📋
              </button>
            </p>
            <p className="text-dark fw-bold fs-4">
              🟢 نسب الأكسجين الأكثر شيوعًا: {mostCommonSpO2.join(", ")}%
              <button
                className="btn btn-outline-secondary btn-sm ms-2"
                onClick={() => copyNumberToClipboard(mostCommonSpO2.join(", "))}
              >
                📋
              </button>
            </p>
          </div>
        )}
        {selectedView === "blood" && (
          <div className="card p-4">
            <h3>🩸 نسبة الهيموجلوبين والجلوكوز</h3>
            <p className="text-dark fw-bold fs-4">
              🔴 أعلى نسبة هيموجلوبين: {maxhb !== null ? `${maxhb} g/dL` : "غير متاح"}
              <button
                className="btn btn-outline-secondary btn-sm ms-2"
                onClick={() => copyNumberToClipboard(maxhb)}
              >
                📋
              </button>
            </p>
            <p className="text-dark fw-bold fs-4">
              🟢 أعلى نسبة جلوكوز: {maxGlucose !== null ? `${maxGlucose} mg/dL` : "غير متاح"}
              <button
                className="btn btn-outline-secondary btn-sm ms-2"
                onClick={() => copyNumberToClipboard(maxGlucose)}
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