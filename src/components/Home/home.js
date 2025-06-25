import React, { useContext } from "react";
import { Card, Button, Container, Row, Col, Alert } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./h.css";
import { useState } from "react";
import { ThemeContext } from "../../ThemeContext";

const Home = () => {
  const [showInfo, setShowInfo] = useState(false);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);

  const cardData = [
    {
      title: "🩸 Blood Oxygen Measurement",
      description:
        "The same technology can be used to measure glucose levels, heart rate, hemoglobin, and blood pressure.",
      buttonText: "Discover More",
      link: "/s",
    },
    {
      title: "💓 Heart Activity Monitoring",
      additionalInfo: "Suitable for health and fitness applications.",
      buttonText: "Discover More",
      link: "/t",
    },
    {
      title: "💪 Muscle Activity Measurement",
      description:
        "The sensor can be used to analyze muscle activity and provide accurate data on athletic performance.",
      additionalInfo: "Ideal for monitoring athletic performance and training.",
      buttonText: "Discover More",
      link: "/f",
    },
    {
      title: "📜 Measurement History",
      description:
        "View all previous measurements such as blood pressure, heart rate, and blood oxygen levels.",
      additionalInfo: "Helps you track the progress of your health condition.",
      buttonText: "View History",
      link: "/h",
    },
    {
      title: "🤖 Medical Chatbot",
      description: "Instant access to AI-powered medical assistance and health guidance.",
      additionalInfo: "Chat with our virtual health assistant for personalized advice.",
      buttonText: "Chat Now",
      link: "https://medicalchatbotyae5waty.streamlit.app/",
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
        <h1 className="display-4 fw-bold">📈 Human Health Monitoring System</h1>
        <p className="lead fs-4 text-dark">
          A comprehensive platform for monitoring your personal health. Track{" "}
          <strong className="text-dark">heart rate</strong>,{" "}
          <strong className="text-dark">blood oxygen levels</strong>,{" "}
          <strong className="text-dark">glucose and hemoglobin levels</strong>, in addition to monitoring{" "}
          <strong className="text-dark">heart signals</strong> and{" "}
          <strong className="text-dark">muscle activity</strong>.
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
          🔍 Discover More
        </Button>
        {showInfo && (
          <div
            className="mt-4 p-4 bg-light text-dark rounded-3 shadow"
            style={{ border: "2px solid #ddd" }}
          >
            <h3 className="fw-bold">🔍 System Features</h3>
            <ul className="list-unstyled text-start mx-auto w-75">
              <li className="lead fs-4 text-dark">✅ Accurate heart rate measurement.</li>
              <li className="lead fs-4 text-dark">✅ Monitoring blood oxygen levels.</li>
              <li className="lead fs-4 text-dark">✅ Tracking glucose and hemoglobin levels.</li>
              <li className="lead fs-4 text-dark">✅ Analyzing ECG signals.</li>
              <li className="lead fs-4 text-dark">✅ Measuring muscle activity for athletic performance.</li>
            </ul>
          </div>
        )}
      </div>

      {/* ✅ Disclaimer Section */}
      <Container className="mt-4">
        <Alert
          variant="danger"
          className="text-center fw-bold fs-5 p-3 shadow"
          style={{ borderRadius: "15px", backgroundColor: "#fff3cd", color: "#856404" }}
        >
          ⚠️ Please note: This system does not provide 100% medically accurate readings. It offers approximate indicators to help you assess your condition and decide whether to consult a healthcare professional.
        </Alert>
      </Container>

      {/* ✅ Cards Section */}
      <Container className="mt-5">
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

        <Row className="justify-content-center mt-5 g-4">
          {cardData.slice(3, 5).map((card, index) => (
            <Col md={6} key={index + 3}>
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
                    target="_blank"
                    rel="noopener noreferrer"
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
      </Container>
    </>
  );
};

export default Home;
