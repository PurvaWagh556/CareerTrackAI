import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Code2, FileText, ArrowRight, ArrowLeft } from "lucide-react";
import { LuSparkles } from "react-icons/lu";

function AIRecommendationsPage() {
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const API_URL = import.meta.env?.VITE_API_URL || "http://localhost:8080";

  useEffect(() => {
    const fetchAISuggestions = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setErrorMessage("No auth token found. Please log in.");
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/ai-suggestions`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.suggestions || []);
        } else {
          setErrorMessage(`Server error: ${res.status}`);
        }
      } catch (err) {
        console.error("Network error:", err);
        setErrorMessage("Could not connect to server.");
      } finally {
        setLoading(false);
      }
    };

    fetchAISuggestions();
  }, [API_URL]);

  const getIconComponent = (iconName) => {
    switch (iconName) {
      case "Code2":
        return Code2;
      case "FileText":
        return FileText;
      default:
        return BookOpen;
    }
  };

  const handleActionClick = (route) => {
    if (route && route.startsWith("http")) {
      window.open(route, "_blank");
    } else if (route) {
      navigate(route);
    } else {
      navigate("/");
    }
  };

  return (
    <div
      style={{
        padding: "28px",
        maxWidth: "1100px",
        margin: "0 auto",
        boxSizing: "border-box",
        color: "#FFFFFF",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <button
        type="button"
        onClick={() => navigate(-1)}
        style={{
          backgroundColor: "transparent",
          border: "1px solid #2E2E42",
          color: "#9CA3AF",
          borderRadius: "8px",
          padding: "6px 14px",
          fontWeight: "600",
          fontSize: "12px",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          marginBottom: "20px",
        }}
      >
        <ArrowLeft size={14} /> Back to Dashboard
      </button>

      <div style={{ marginBottom: "24px" }}>
        <h2
          style={{
            fontSize: "24px",
            fontWeight: "700",
            margin: "0 0 4px 0",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <LuSparkles size={24} color="#A78BFA" /> Today's AI Study Plan
        </h2>
        <p style={{ fontSize: "13px", color: "#9CA3AF", margin: 0 }}>
          Your personalized daily learning tasks, updated automatically each
          day.
        </p>
      </div>

      <div
        className="ai-recommendations-wrapper"
        style={{
          backgroundColor: "#161622",
          border: "1px solid #2E2E42",
          borderRadius: "14px",
          padding: "24px",
          boxShadow: "0px 10px 30px rgba(0,0,0,0.3)",
        }}
      >
        {errorMessage && (
          <div
            style={{
              color: "#EF4444",
              fontSize: "12px",
              textAlign: "center",
              padding: "12px",
            }}
          >
            {errorMessage}
          </div>
        )}

        {loading && suggestions.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              color: "#9CA3AF",
              padding: "40px",
              fontSize: "14px",
            }}
          >
            Preparing your daily study plan...
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {suggestions.map((item, index) => {
              const Icon = getIconComponent(item.icon);
              return (
                <div
                  key={index}
                  className="ai-suggestion-item"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderRadius: "12px",
                    padding: "18px",
                    gap: "16px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                    }}
                  >
                    <div
                      className="ai-icon-box"
                      style={{
                        background: "#2E2E42",
                        padding: "14px",
                        borderRadius: "10px",
                        color: "#A78BFA",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon size={24} />
                    </div>
                    <div>
                      <h4
                        className="ai-item-title"
                        style={{
                          fontSize: "16px",
                          fontWeight: "600",
                          color: "#fff",
                          margin: "0 0 4px 0",
                        }}
                      >
                        {item.title}
                      </h4>
                      <p
                        className="ai-item-desc"
                        style={{
                          fontSize: "13px",
                          color: "#9CA3AF",
                          margin: 0,
                          lineHeight: "1.4",
                        }}
                      >
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleActionClick(item.route)}
                    style={{
                      background: "transparent",
                      border: "1px solid #7C3AED",
                      color: "#A78BFA",
                      borderRadius: "8px",
                      padding: "8px 16px",
                      fontSize: "12px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      whiteSpace: "nowrap",
                      fontWeight: "600",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(124, 58, 237, 0.1)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    {item.action || "Start"}
                    <ArrowRight size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default AIRecommendationsPage;
