import React, { useState, useEffect } from "react";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  PolarAngleAxis,
} from "recharts";
import { Info, X } from "lucide-react";
import { FaCheck, FaTimes } from "react-icons/fa";
import "./OverallProgress.css";

function OverallProgress() {
  const [readinessScore, setReadinessScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [checklist, setChecklist] = useState({
    baseProfile: false,
    hasSkills: false,
    hasProjects: false,
    hasContactOrBio: false,
    hasCertificates: false,
    hasResume: false,
    hasDsaMilestone: false,
  });

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  useEffect(() => {
    const fetchReadiness = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch(`${API_URL}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();

          let basePoints = 10;

          const skillsArray = data.skills || data.userSkills || [];
          let skillsCount = skillsArray.length;
          let skillsPoints = Math.min((skillsCount / 3) * 15, 15);

          const projectsArray = data.projects || data.userProjects || [];
          let projectsCount = projectsArray.length;
          let projectsPoints = Math.min((projectsCount / 2) * 20, 20);

          let hasContactOrBio = Boolean(
            data.bio || data.github || data.linkedin || data.phone || data.headline || data.email
          );
          let profilePoints = hasContactOrBio ? 10 : 0;

          const certsArray = data.certificates || data.userCertificates || [];
          let certsCount = certsArray.length;
          let certsPoints = Math.min((certsCount / 2) * 15, 15);

          let hasResume = Boolean(
            data.resumePath || 
            data.resume || 
            data.resumeUrl || 
            data.resumeFile || 
            data.resumeName ||
            data.cv ||
            data.document ||
            data.file
          );
          let resumePoints = hasResume ? 15 : 0;

          const dsaCount = data.dsaSolvedCount || data.dsaSolved || 0;
          let dsaPoints = Math.min((dsaCount / 50) * 15, 15);

          const totalScore = Math.round(
            basePoints + skillsPoints + projectsPoints + profilePoints + certsPoints + resumePoints + dsaPoints
          );

          setReadinessScore(Math.min(totalScore, 100));
          setChecklist({
            baseProfile: true,
            hasSkills: skillsCount > 0,
            hasProjects: projectsCount > 0,
            hasContactOrBio: hasContactOrBio,
            hasCertificates: certsCount > 0,
            hasResume: hasResume,
            hasDsaMilestone: dsaCount >= 50,
          });
        }
      } catch (error) {
        console.error("Error fetching readiness score:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReadiness();

    window.addEventListener("focus", fetchReadiness);
    return () => window.removeEventListener("focus", fetchReadiness);
  }, [API_URL]);

  const chartData = [
    {
      name: "Progress",
      value: readinessScore,
      fill: "#8B5CF6",
    },
  ];

  return (
    <>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #13101E;
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #2E2E42;
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #7C3AED;
        }
      `}</style>

      <div
        className="overall-card"
        style={{
          width: "100%",
          maxWidth: "100%",
          backgroundColor: "#12131a",
          border: "1px solid #2a2d3d",
          borderRadius: "16px",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
          <div style={{ position: "relative", width: "130px", height: "130px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="75%"
                outerRadius="95%"
                data={chartData}
                startAngle={90}
                endAngle={-270}
              >
                <PolarAngleAxis
                  type="number"
                  domain={[0, 100]}
                  angleAxisId={0}
                  tick={false}
                />
                <RadialBar dataKey="value" background cornerRadius={10} />
              </RadialBarChart>
            </ResponsiveContainer>

            <div style={{
              position: "absolute",
              width: "92px",
              height: "92px",
              backgroundColor: "#12131a",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <span style={{ fontSize: "26px", fontWeight: "700", color: "#c084fc", margin: 0 }}>
                {loading ? "..." : `${readinessScore}%`}
              </span>
            </div>
          </div>
        </div>

        <div className="progress-details" style={{ textAlign: "center", width: "100%" }}>
          <div className="title" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "8px" }}>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#ffffff" }}>Placement Readiness</h3>
            <Info size={14} color="#9ca3af" style={{ cursor: "pointer" }} />
          </div>

          <p style={{ fontSize: "13px", color: "#9ca3af", margin: "0 0 20px 0", lineHeight: "1.4", padding: "0 10px" }}>
            {readinessScore >= 90
              ? "Outstanding profile! You are fully placement-ready."
              : "Complete your checklist items & solve DSA problems to hit 100%!"}
          </p>

          <button 
            onClick={() => setIsModalOpen(true)}
            style={{
              width: "100%",
              backgroundColor: "#7C3AED",
              color: "#ffffff",
              border: "none",
              borderRadius: "12px",
              padding: "12px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 4px 15px rgba(124, 58, 237, 0.4)",
              transition: "background 0.2s",
            }}
          >
            View Details →
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <h3
                style={{
                  margin: 0,
                  fontSize: "18px",
                  color: "#FFFFFF",
                  fontWeight: "700",
                }}
              >
                Placement Checklist
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={closeBtnStyle}
              >
                <X size={20} />
              </button>
            </div>

            <p
              style={{
                fontSize: "13px",
                color: "#9CA3AF",
                marginBottom: "16px",
              }}
            >
              Current Score:{" "}
              <strong style={{ color: "#FFFFFF" }}>{readinessScore}%</strong>
            </p>

            <div
              className="custom-scrollbar"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                marginBottom: "20px",
                maxHeight: "320px",
                overflowY: "auto",
                paddingRight: "6px",
              }}
            >
              <div style={breakdownRowStyle}>
                <span>Base Profile Setup (10%):</span>
                <span>
                  {checklist.baseProfile ? (
                    <FaCheck color="#10b981" size={14} />
                  ) : (
                    <FaTimes color="#ef4444" size={14} />
                  )}
                </span>
              </div>
              <div style={breakdownRowStyle}>
                <span>Skills Added (15%):</span>
                <span>
                  {checklist.hasSkills ? (
                    <FaCheck color="#10b981" size={14} />
                  ) : (
                    <FaTimes color="#ef4444" size={14} />
                  )}
                </span>
              </div>
              <div style={breakdownRowStyle}>
                <span>Projects Registered (20%):</span>
                <span>
                  {checklist.hasProjects ? (
                    <FaCheck color="#10b981" size={14} />
                  ) : (
                    <FaTimes color="#ef4444" size={14} />
                  )}
                </span>
              </div>
              <div style={breakdownRowStyle}>
                <span>Bio, Links & Headline (10%):</span>
                <span>
                  {checklist.hasContactOrBio ? (
                    <FaCheck color="#10b981" size={14} />
                  ) : (
                    <FaTimes color="#ef4444" size={14} />
                  )}
                </span>
              </div>
              <div style={breakdownRowStyle}>
                <span>Certificates Earned (15%):</span>
                <span>
                  {checklist.hasCertificates ? (
                    <FaCheck color="#10b981" size={14} />
                  ) : (
                    <FaTimes color="#ef4444" size={14} />
                  )}
                </span>
              </div>
              <div style={breakdownRowStyle}>
                <span>Resume Uploaded (15%):</span>
                <span>
                  {checklist.hasResume ? (
                    <FaCheck color="#10b981" size={14} />
                  ) : (
                    <FaTimes color="#ef4444" size={14} />
                  )}
                </span>
              </div>
              <div style={breakdownRowStyle}>
                <span>DSA Solved Milestone (15%):</span>
                <span>
                  {checklist.hasDsaMilestone ? (
                    <FaCheck color="#10b981" size={14} />
                  ) : (
                    <FaTimes color="#ef4444" size={14} />
                  )}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(false)}
              style={actionBtnStyle}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
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
  backgroundColor: "#12131a",
  border: "1px solid #2a2d3d",
  borderRadius: "16px",
  padding: "24px",
  width: "100%",
  maxWidth: "420px",
  boxShadow: "0px 20px 40px rgba(0,0,0,0.8)",
  color: "#FFFFFF",
  boxSizing: "border-box",
};

const modalHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "4px",
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

const breakdownRowStyle = {
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

const actionBtnStyle = {
  width: "100%",
  backgroundColor: "#7C3AED",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "12px",
  padding: "12px",
  fontWeight: "600",
  fontSize: "14px",
  cursor: "pointer",
  boxShadow: "0px 4px 12px rgba(124, 58, 237, 0.3)",
};

export default OverallProgress;