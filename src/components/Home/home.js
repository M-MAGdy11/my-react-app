import React, { useContext } from "react";
import { Carousel, Card, Button, Container, Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./h.css";
import { useState } from "react";
import { ThemeContext } from "../../ThemeContext";

const Home = () => {
  const [showInfo, setShowInfo] = useState(false);

  // استخدام السياق للحصول على الحالة والوظيفة الخاصة بالتبديل
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);

  // بيانات الـ Cards مع إضافة وصف إضافي لكل كارد
  const cardData = [
    {
      title: "🩸 قياس الأكسجين في الدم",
      description:
        "يمكن استخدام نفس التقنية لقياس نسبة الكلوجوز و نبضات القلب، الهيموجلوبين، والضغط.",
      buttonText: "اكتشف المزيد  ",
      link: "/s", // رابط الصفحة الخاصة بالأكسجين
    },
    {
      title: "💓 عرض نشاط القلب",

      additionalInfo: "مناسب لتطبيقات الصحة واللياقة.",
      buttonText: "اكتشف المزيد  ",
      link: "/t", // رابط الصفحة الخاصة بنبضات القلب
    },
    {
      title: "💪 قياس نشاط العضلات",
      description:
        "يمكن استخدام المستشعر لتحليل النشاط العضلي وتوفير بيانات دقيقة حول الأداء الرياضي.",
      additionalInfo: "مناسب لمراقبة الأداء الرياضي والتدريب.",
      buttonText: "اكتشف المزيد  ",
      link: "/f", // رابط الصفحة الخاصة بالعضلات
    },
    {
      title: "📜 سجل القياسات",
      description:
        "عرض جميع القياسات السابقة مثل ضغط الدم، معدل نبض القلب، ونسب الأكسجين في الدم.",
      additionalInfo: "يساعدك على تتبع تطور حالتك الصحية.",
      buttonText: "عرض السجل",
      link: "/h", // رابط صفحة السجل
    },
  ];

  return (
    <>
      {/* ✅ Jumbotron Section */}
      <div
        className="jumbotron text-center"
        style={{
          background: "linear-gradient(135deg, #f5f7fa, #c3cfe2)",
          padding: "80px 20px",
          borderRadius: "0 0 20px 20px",
        }}
      >
        {/* زر التبديل بين Dark Mode وLight Mode */}
    
        <h1 className="display-4 fw-bold">📈 نظام مراقبة صحة الإنسان</h1>
        <p className="lead fs-4 text-dark">
          منصة شاملة لرصد ومتابعة صحتك الشخصية. يمكنك تتبع{" "}
          <strong className="text-dark">معدل ضربات القلب</strong>،{" "}
          <strong className="text-dark">مستويات الأكسجين في الدم</strong>،{" "}
          <strong className="text-dark">نسبة الكلوجوز والهيموجلوبين</strong>، بالإضافة إلى مراقبة{" "}
          <strong className="text-dark">إشارات القلب </strong> و{" "}
          <strong className="text-dark">نشاط العضلات</strong>.
        </p>
        <Button
          variant="warning"
          className="btn-custom mt-3"
          onClick={() => setShowInfo(!showInfo)}
          style={{
            padding: "10px 20px",
            fontSize: "1rem",
            fontWeight: "bold",
          }}
        >
          🔍 اكتشف المزيد
        </Button>
        {showInfo && (
          <div
            className="mt-4 p-4 bg-light text-dark rounded-3 shadow"
            style={{ border: "2px solid #ddd" }}
          >
            <h3 className="fw-bold">🔍 مميزات النظام</h3>
            <ul className="list-unstyled text-start mx-auto w-75">
              <li className="lead fs-4 text-dark">✅ قياس دقيق لمعدل نبض القلب.</li>
              <li className="lead fs-4 text-dark">✅ مراقبة مستويات الأكسجين في الدم.</li>
              <li className="lead fs-4 text-dark">✅ تتبع نسبة الكلوجوز والهيموجلوبين.</li>
              <li className="lead fs-4 text-dark">✅ تحليل إشارات تخطيط القلب (ECG).</li>
              <li className="lead fs-4 text-dark">✅ قياس نشاط العضلات للأداء الرياضي.</li>
            </ul>
          </div>
        )}
      </div>

      {/* ✅ Cards Section */}
      <Container className="mt-5">
        {/* أول 3 كروت */}
        <Row className="g-4">
          {cardData.slice(0, 3).map((card, index) => (
            <Col md={4} key={index}>
              <Card
                className="shadow-lg h-100 d-flex flex-column justify-content-between"
                style={{
                  border: "none",
                  borderRadius: "15px",
                  transition: "transform 0.3s ease",
                }}
                onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                <Card.Body>
                  <Card.Title>{card.title}</Card.Title>
                  <Card.Text>{card.description}</Card.Text>
                  <Card.Text className="text-muted">{card.additionalInfo}</Card.Text>
                </Card.Body>
                <div className="text-center mb-3">
                  <Button
                    variant="primary"
                    href={card.link}
                    style={{
                      padding: "10px 20px",
                      fontSize: "1rem",
                      fontWeight: "bold",
                      borderRadius: "25px",
                    }}
                  >
                    {card.buttonText}
                  </Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* الكارت الرابع في صف منفصل */}
        <Row className="justify-content-center mt-5">
          <Col md={6}>
            <Card
              className="shadow-lg h-100 d-flex flex-column justify-content-between"
              style={{
                border: "none",
                borderRadius: "15px",
                transition: "transform 0.3s ease",
              }}
              onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <Card.Body>
                <Card.Title>{cardData[3].title}</Card.Title>
                <Card.Text>{cardData[3].description}</Card.Text>
                <Card.Text className="text-muted">{cardData[3].additionalInfo}</Card.Text>
              </Card.Body>
              <div className="text-center mb-3">
                <Button
                  variant="primary"
                  href={cardData[3].link}
                  style={{
                    padding: "10px 20px",
                    fontSize: "1rem",
                    fontWeight: "bold",
                    borderRadius: "25px",
                  }}
                >
                  {cardData[3].buttonText}
                </Button>
              </div>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* ✅ Video Section */}
      <Container className="mt-5 text-center">
        <h2 className="video-title" style={{ fontWeight: "bold", color: "white" }}>
          🎥 شرح النظام الصحي
        </h2>
        <p className="video-desc" style={{ fontSize: "1.9rem", color: "white" }}>
          تعرف على كيفية عمل النظام الصحي وكيفية استخدامه لمراقبة صحتك الشخصية.
        </p>
        <div className="video-container">
          <iframe
            src="https://www.youtube.com/embed/2xkW9jvKQ3w" // رابط فيديو جديد ويعمل
            title="شرح النظام الصحي"
            allowFullScreen
            style={{
              width: "100%",
              height: "400px",
              border: "none",
              borderRadius: "15px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          ></iframe>
        </div>
      </Container>
    </>
  );
};

export default Home;