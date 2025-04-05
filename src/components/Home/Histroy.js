import React, { useEffect, useState } from "react";
import {
  db,
  collection,
  getDocs,
  deleteDoc, // لإزالة الوثائق
  query, // لتحديد المجموعة
  doc, // للإشارة إلى وثيقة محددة
} from "../firebaseConfig"; // استيراد الوظائف اللازمة من Firestore
import "bootstrap/dist/css/bootstrap.min.css";
import "./HistoryPage.css"; // ملف CSS للتنسيق

const HistoryPage = () => {
  const [bloodPressureData, setBloodPressureData] = useState([]);
  const [ecgAnalysisData, setEcgAnalysisData] = useState([]);
  const [topAdcValues, setTopAdcValues] = useState([]); // لتخزين أعلى 3 قيم ADC

  useEffect(() => {
    const fetchData = async () => {
      try {
        // جلب بيانات قياسات الضغط
        const bloodPressureSnapshot = await getDocs(collection(db, "blood_pressure_history"));
        const bloodPressureReadings = bloodPressureSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate ? doc.data().timestamp.toDate() : null, // تحويل Timestamp إلى Date
        }));
        setBloodPressureData(bloodPressureReadings);

        // جلب بيانات تحليل ECG
        const ecgAnalysisSnapshot = await getDocs(collection(db, "ecg_results"));
        const ecgAnalysisReadings = ecgAnalysisSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate ? doc.data().timestamp.toDate() : null, // تحويل Timestamp إلى Date
        }));
        setEcgAnalysisData(ecgAnalysisReadings);

        // جلب أعلى 3 قيم ADC المخزنة
        const topAdcSnapshot = await getDocs(collection(db, "top_adc_values"));
        const topAdcReadings = topAdcSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate ? doc.data().timestamp.toDate() : null, // تحويل Timestamp إلى Date
        }));
        setTopAdcValues(topAdcReadings);
      } catch (error) {
        console.error("❌ خطأ أثناء جلب السجل:", error);
        alert("❌ فشل في جلب السجل! تحقق من الاتصال بالإنترنت.");
      }
    };

    fetchData();
  }, []);

  // دالة لحذف جميع البيانات
  const deleteAllData = async () => {
    const confirmDelete = window.confirm("هل أنت متأكد أنك تريد حذف جميع البيانات؟");
    if (!confirmDelete) return;
  
    try {
      // حذف بيانات قياسات الضغط
      const bloodPressureQuery = query(collection(db, "blood_pressure_history"));
      const bloodPressureSnapshot = await getDocs(bloodPressureQuery);
      const bloodPressureDeletePromises = bloodPressureSnapshot.docs.map((docSnapshot) => {
        return deleteDoc(doc(db, "blood_pressure_history", docSnapshot.id));
      });
  
      // حذف بيانات تحليل ECG (تصحيح المسار)
      const ecgAnalysisQuery = query(collection(db, "ecg_results")); // اسم المجموعة الصحيح
      const ecgAnalysisSnapshot = await getDocs(ecgAnalysisQuery);
      const ecgAnalysisDeletePromises = ecgAnalysisSnapshot.docs.map((docSnapshot) => {
        return deleteDoc(doc(db, "ecg_results", docSnapshot.id)); // تصحيح المسار هنا
      });
  
      // حذف أعلى 3 قيم ADC
      const topAdcQuery = query(collection(db, "top_adc_values"));
      const topAdcSnapshot = await getDocs(topAdcQuery);
      const topAdcDeletePromises = topAdcSnapshot.docs.map((docSnapshot) => {
        return deleteDoc(doc(db, "top_adc_values", docSnapshot.id));
      });
  
      // انتظار انتهاء جميع عمليات الحذف بالتوازي
      await Promise.all([
        ...bloodPressureDeletePromises,
        ...ecgAnalysisDeletePromises,
        ...topAdcDeletePromises,
      ]);
  
      console.log("✅ تم حذف جميع البيانات بنجاح!");
      alert("تم حذف جميع البيانات بنجاح!");
  
      // تحديث البيانات في الواجهة
      setBloodPressureData([]);
      setEcgAnalysisData([]);
      setTopAdcValues([]);
    } catch (error) {
      console.error("❌ خطأ أثناء حذف البيانات:", error);
      alert("حدث خطأ أثناء حذف البيانات. تحقق من الاتصال بالإنترنت.");
    }
  };

  return (
    <div className="history-page min-vh-100">
      {/* Header */}
      <div className="container text-center py-5">
        <h1 className="text-white">سجل البيانات</h1>
      </div>

      {/* Blood Pressure Table */}
      <div className="container my-5">
        <h2 className="text-center mb-4 text-white">🩺 سجل قياسات الضغط</h2>
        <table className="table table-hover shadow-lg">
          <thead className="bg-primary text-white">
            <tr>
              <th>التاريخ</th>
              <th>الضغط الانقباضي (SBP)</th>
              <th>الضغط الانبساطي (DBP)</th>
              <th>نبضات القلب الأكثر شيوعًا</th>
              <th>نسب الأكسجين الأكثر شيوعًا</th>
              <th>نسبة الهيموجلوبين</th>
              <th>نسبة الجلوكوز</th>
              <th>العمر</th>
              <th>الوزن</th>
            </tr>
          </thead>
          <tbody>
            {bloodPressureData.length > 0 ? (
              bloodPressureData.map((record) => (
                <tr key={record.id}>
                  <td>{record.timestamp ? record.timestamp.toLocaleString() : "غير متوفر"}</td>
                  <td>{record.sbp} mmHg</td>
                  <td>{record.dbp} mmHg</td>
                  <td>{record.bpm}</td>
                  <td>{record.spo2}%</td>
                  <td>{record.hemoglobin} g/dL</td>
                  <td>{record.glucose} mg/dL</td>
                  <td>{record.age}</td>
                  <td>{record.weight} كجم</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center">
                  لا توجد بيانات متاحة في السجل.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ECG Analysis Table */}
      <div className="container my-5">
        <h2 className="text-center mb-4 text-white">📊 سجل تحليل ECG</h2>
        <table className="table table-hover shadow-lg">
          <thead className="bg-success text-white">
            <tr>
              <th>التاريخ</th>
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
                  <td>{record.timestamp ? record.timestamp.toLocaleString() : "غير متوفر"}</td>
                  <td>{record.prInterval}</td>
                  <td>{record.qtInterval}</td>
                  <td>{record.stSegment}</td>
                  <td>{record.qWave}</td>
                  <td>{record.tWave}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center">
                  لا توجد بيانات متاحة في السجل.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Top ADC Values Table */}
      <div className="container my-5">
        <h2 className="text-center mb-4 text-white">📈 أعلى 3 قيم ADC</h2>
        <table className="table table-hover shadow-lg">
          <thead className="bg-info text-white">
            <tr>
              <th>التاريخ</th>
              <th>القيمة (ADC)</th>
            </tr>
          </thead>
          <tbody>
            {topAdcValues.length > 0 ? (
              topAdcValues.map((record) => (
                <tr key={record.id}>
                  <td>{record.timestamp ? record.timestamp.toLocaleString() : "غير متوفر"}</td>
                  <td>{record.adc}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="text-center">
                  لا توجد بيانات متاحة في السجل.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* زر الحذف */}
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