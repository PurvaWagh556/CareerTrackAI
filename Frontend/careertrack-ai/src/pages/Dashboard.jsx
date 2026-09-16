import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import WelcomeBanner from "../components/WelcomeBanner/WelcomeBanner";
import StatsCards from "../components/StatsCard/StatsCards";
import SkillsOverview from "../components/SkillsOverview/SkillsOverview";
import WeeklyProgress from "../components/WeeklyProgress/WeeklyProgress";
import AISuggestions from "../components/AISuggestions/AISuggestions";
import OverallProgress from "../components/OverallProgress/OverallProgress";
import LearningRoadmap from "../components/LearningRoadmap/LearningRoadmap";

import "../layouts/DashboardLayout.css";

function Dashboard() {
  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
  const [isRecsModalOpen, setIsRecsModalOpen] = useState(false);
  const [isRoadmapModalOpen, setIsRoadmapModalOpen] = useState(false);

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      document.body.classList.add("light-mode");
      document.documentElement.classList.remove("dark");
    } else {
      document.body.classList.remove("light-mode");
      document.documentElement.classList.add("dark");
    }

    const fetchDashboardContent = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.success !== false) {
            setDashboardData(data);
          }
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardContent();
  }, [API_URL]);

  const handleDashboardClick = (e) => {
    if (e.target.closest(".modal-content-box")) return;

    const button = e.target.closest("button");
    if (!button) return;
    const text = button.innerText.trim();

    if (text.includes("View All")) {
      setIsSkillsModalOpen(true);
    } else if (text.includes("Recommendations")) {
      setIsRecsModalOpen(true);
    } else if (text.includes("Roadmap")) {
      setIsRoadmapModalOpen(true);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "60px", color: "#FFFFFF", textAlign: "center", fontSize: "16px" }}>
        Loading your dashboard workspace!
      </div>
    );
  }

  return (
    <div className="dashboard" onClick={handleDashboardClick}>
      <div className="dashboard-top">
        <OverallProgress readiness={dashboardData?.readiness} />

        <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
          <WelcomeBanner username={dashboardData?.user?.username} />
        </div>
      </div>

      <LearningRoadmap roadmap={dashboardData?.roadmap} />

      <StatsCards metrics={dashboardData?.metrics} />

      <div className="dashboard-bottom">
        <SkillsOverview skills={dashboardData?.skills} />

        <div className="right-panel">
          <WeeklyProgress activity={dashboardData?.activity} />

          <AISuggestions suggestions={dashboardData?.suggestions} />
        </div>
      </div>

      {isRecsModalOpen && (
        <div style={modalOverlayStyle}>
          <div className="modal-content-box" style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <h3
                style={{
                  margin: 0,
                  fontSize: "18px",
                  color: "#FFFFFF",
                  fontWeight: "600",
                }}
              >
                Personalized AI Study Plan!
              </h3>
              <button
                type="button"
                onClick={() => setIsRecsModalOpen(false)}
                style={closeBtnStyle}
              >
                <X size={20} />
              </button>
            </div>
            <p
              style={{
                fontSize: "13px",
                color: "#9CA3AF",
                marginBottom: "20px",
              }}
            >
              Curated tasks for today based on your target role:
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                marginBottom: "24px",
              }}
            >
              {dashboardData?.suggestions && dashboardData.suggestions.length > 0 ? (
                dashboardData.suggestions.map((rec, index) => (
                  <div key={index} style={metricRowStyle}>
                    <span>{rec.title}</span>
                    <strong style={{ color: "#A78BFA" }}>{rec.description}</strong>
                  </div>
                ))
              ) : (
                <>
                  <div style={metricRowStyle}>
                    <span>Practice Graphs</span>
                    <strong style={{ color: "#A78BFA" }}>2 medium problems</strong>
                  </div>
                  <div style={metricRowStyle}>
                    <span>React Optimization</span>
                    <strong style={{ color: "#60A5FA" }}>Review Hooks</strong>
                  </div>
                  <div style={metricRowStyle}>
                    <span>System Design</span>
                    <strong style={{ color: "#34D399" }}>Connection Pooling</strong>
                  </div>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsRecsModalOpen(false)}
              style={actionBtnStyle}
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {isRoadmapModalOpen && (
        <div style={modalOverlayStyle}>
          <div
            className="modal-content-box"
            style={{ ...modalContentStyle, maxWidth: "520px" }}
          >
            <div style={modalHeaderStyle}>
              <h3
                style={{
                  margin: 0,
                  fontSize: "18px",
                  color: "#FFFFFF",
                  fontWeight: "600",
                }}
              >
                Full Career Learning Roadmap
              </h3>
              <button
                type="button"
                onClick={() => setIsRoadmapModalOpen(false)}
                style={closeBtnStyle}
              >
                <X size={20} />
              </button>
            </div>
            <p
              style={{
                fontSize: "13px",
                color: "#9CA3AF",
                marginBottom: "20px",
              }}
            >
              Your structured software engineering milestone timeline:
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                maxHeight: "320px",
                overflowY: "auto",
                paddingRight: "4px",
                marginBottom: "24px",
              }}
            >
              {dashboardData?.roadmap && dashboardData.roadmap.length > 0 ? (
                dashboardData.roadmap.map((phase, index) => (
                  <div key={index} style={roadmapItemStyle}>
                    <strong style={{ color: "#A78BFA" }}>
                      {phase.month || `Milestone ${index + 1}`}: {phase.title || phase.name}
                    </strong>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#9CA3AF",
                        margin: "4px 0 0",
                      }}
                    >
                      {phase.description || (phase.topics ? phase.topics.join(", ") : "")}
                    </p>
                  </div>
                ))
              ) : (
                <div style={roadmapItemStyle}>
                  <strong style={{ color: "#A78BFA" }}>Loading Roadmap...</strong>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsRoadmapModalOpen(false)}
              style={actionBtnStyle}
            >
              Close Roadmap
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0, 0, 0, 0.75)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  backdropFilter: "blur(6px)",
};

const modalContentStyle = {
  backgroundColor: "#161622",
  border: "1px solid #2E2E42",
  borderRadius: "16px",
  padding: "28px",
  width: "100%",
  maxWidth: "460px",
  maxHeight: "90vh",
  overflowY: "auto",
  boxShadow: "0px 20px 40px rgba(0,0,0,0.6)",
  color: "#FFFFFF",
  boxSizing: "border-box",
};

const modalHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "8px",
};

const closeBtnStyle = {
  background: "transparent",
  border: "none",
  color: "#9CA3AF",
  cursor: "pointer",
  padding: "4px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "6px",
};

const actionBtnStyle = {
  width: "100%",
  backgroundColor: "#7C3AED",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "10px",
  padding: "12px",
  fontWeight: "600",
  fontSize: "14px",
  cursor: "pointer",
  boxShadow: "0px 4px 12px rgba(124, 58, 237, 0.3)",
};

const metricRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: "#0D0D14",
  padding: "12px 16px",
  borderRadius: "10px",
  border: "1px solid #2E2E42",
  fontSize: "14px",
  color: "#E5E7EB",
};

const roadmapItemStyle = {
  backgroundColor: "#0D0D14",
  padding: "14px 16px",
  borderRadius: "10px",
  border: "1px solid #2E2E42",
};

export default Dashboard;