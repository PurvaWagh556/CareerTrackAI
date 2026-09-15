import React, { useState, useEffect } from "react";
import { FaInfoCircle, FaCheck, FaTimes } from "react-icons/fa";

function ProfileSummary({ profile }) {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      setIsLightMode(document.body.classList.contains("light-mode"));
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const calculateCompletion = (data) => {
    if (!data) return 0;

    const fieldsToCheck = [
      data.fullName,
      data.headline,
      data.location,
      data.phone,
      data.college,
      data.degree,
      data.github,
      data.linkedin,
      data.skills && data.skills.length > 0,
      data.resumePath,
    ];

    const filledCount = fieldsToCheck.filter(Boolean).length;
    return Math.round((filledCount / fieldsToCheck.length) * 100);
  };

  const completionPercentage = calculateCompletion(profile);

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionPercentage / 100) * circumference;

  const getSubtitle = (pct) => {
    if (pct === 100) return "Outstanding! Your profile is fully complete.";
    if (pct >= 70) return "You are doing great! Keep improving your skills.";
    if (pct >= 40) return "Good progress! Add more details to stand out.";
    return "Complete your profile to unlock full potential.";
  };

  const dynamicStyles = {
    cardContainer: {
      backgroundColor: isLightMode ? "#FFFFFF" : "#12131a",
      border: isLightMode ? "1px solid #E2E8F0" : "1px solid #2a2d3d",
      borderRadius: "16px",
      padding: "24px",
      color: isLightMode ? "#0F172A" : "#ffffff",
      boxShadow: isLightMode ? "0 4px 20px rgba(0, 0, 0, 0.03)" : "0 10px 30px rgba(0,0,0,0.2)",
      boxSizing: "border-box",
      marginBottom: "24px",
      textAlign: "center",
    },
    innerCircle: {
      position: "absolute",
      width: "92px",
      height: "92px",
      backgroundColor: isLightMode ? "#FFFFFF" : "#12131a",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    cardTitle: {
      fontSize: "18px",
      fontWeight: "700",
      margin: 0,
      color: isLightMode ? "#0F172A" : "#ffffff",
    },
    subtitleText: {
      fontSize: "13px",
      color: isLightMode ? "#64748B" : "#9ca3af",
      margin: "0 0 20px 0",
      lineHeight: "1.4",
      padding: "0 10px",
    },
    modalBox: {
      backgroundColor: isLightMode ? "#FFFFFF" : "#12131a",
      border: isLightMode ? "1px solid #E2E8F0" : "1px solid #2a2d3d",
      borderRadius: "16px",
      padding: "24px",
      width: "100%",
      maxWidth: "420px",
      boxShadow: isLightMode ? "0px 20px 40px rgba(0,0,0,0.1)" : "0px 20px 40px rgba(0,0,0,0.8)",
      color: isLightMode ? "#0F172A" : "#FFFFFF",
      boxSizing: "border-box",
      textAlign: "left",
    },
    breakdownRowStyle: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: isLightMode ? "#F8FAFC" : "#0D0D14",
      padding: "12px 16px",
      borderRadius: "10px",
      border: isLightMode ? "1px solid #E2E8F0" : "1px solid #2E2E42",
      fontSize: "14px",
      color: isLightMode ? "#0F172A" : "#E5E7EB",
      fontWeight: "500",
    },
  };

  return (
    <div className="profile-card" style={dynamicStyles.cardContainer}>
      
      <div style={styles.progressWrapper}>
        <div style={styles.svgContainer}>
          <svg width="130" height="130" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke={isLightMode ? "#E2E8F0" : "#2a2d3d"}
              strokeWidth="10"
              fill="none"
            />
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="#7C3AED"
              strokeWidth="10"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
              style={{ transition: "stroke-dashoffset 0.6s ease-in-out" }}
            />
          </svg>
          <div style={dynamicStyles.innerCircle}>
            <span style={styles.percentageText}>{completionPercentage}%</span>
          </div>
        </div>
      </div>

      <div style={styles.titleRow}>
        <h3 style={dynamicStyles.cardTitle}>Profile Completion</h3>
        <span title="Calculated based on your added details, skills, and uploaded resume.">
          <FaInfoCircle size={14} color={isLightMode ? "#64748B" : "#9ca3af"} style={{ cursor: "pointer" }} />
        </span>
      </div>

      <p style={dynamicStyles.subtitleText}>{getSubtitle(completionPercentage)}</p>

      <button 
        onClick={() => setShowDetailsModal(true)} 
        style={styles.viewDetailsBtn}
        className="btn-close"
      >
        View Details →
      </button>

      {showDetailsModal && (
        <div style={styles.modalOverlay}>
          <div style={dynamicStyles.modalBox}>
            <div style={styles.modalHeaderStyle}>
              <h3 style={{ margin: 0, fontSize: "18px", color: isLightMode ? "#0F172A" : "#FFFFFF", fontWeight: "700" }}>
                Profile Checklist
              </h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", margin: "20px 0 24px 0" }}>
              <div style={dynamicStyles.breakdownRowStyle}>
                <span>Name & Headline:</span>
                <span>
                  {profile?.fullName ? (
                    <FaCheck color="#10b981" size={14} />
                  ) : (
                    <FaTimes color="#ef4444" size={14} />
                  )}
                </span>
              </div>
              <div style={dynamicStyles.breakdownRowStyle}>
                <span>Location & Phone:</span>
                <span>
                  {profile?.location && profile?.phone ? (
                    <FaCheck color="#10b981" size={14} />
                  ) : (
                    <FaTimes color="#ef4444" size={14} />
                  )}
                </span>
              </div>
              <div style={dynamicStyles.breakdownRowStyle}>
                <span>College & Degree:</span>
                <span>
                  {profile?.college && profile?.degree ? (
                    <FaCheck color="#10b981" size={14} />
                  ) : (
                    <FaTimes color="#ef4444" size={14} />
                  )}
                </span>
              </div>
              <div style={dynamicStyles.breakdownRowStyle}>
                <span>GitHub & LinkedIn:</span>
                <span>
                  {profile?.github && profile?.linkedin ? (
                    <FaCheck color="#10b981" size={14} />
                  ) : (
                    <FaTimes color="#ef4444" size={14} />
                  )}
                </span>
              </div>
              <div style={dynamicStyles.breakdownRowStyle}>
                <span>Skills Added:</span>
                <span>
                  {profile?.skills?.length > 0 ? (
                    <FaCheck color="#10b981" size={14} />
                  ) : (
                    <FaTimes color="#ef4444" size={14} />
                  )}
                </span>
              </div>
              <div style={dynamicStyles.breakdownRowStyle}>
                <span>Resume Uploaded:</span>
                <span>
                  {profile?.resumePath ? (
                    <FaCheck color="#10b981" size={14} />
                  ) : (
                    <FaTimes color="#ef4444" size={14} />
                  )}
                </span>
              </div>
            </div>

            <button className="btn-close"
              onClick={() => setShowDetailsModal(false)}
              style={styles.closeModalBtn}
            >
              <span style={{ color: "#FFFFFF", fontWeight: "600" }}>Close</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  progressWrapper: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "20px",
  },
  svgContainer: {
    position: "relative",
    width: "130px",
    height: "130px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  percentageText: {
    fontSize: "26px",
    fontWeight: "700",
    color: "#c084fc",
  },
  titleRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    marginBottom: "8px",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000,
    backdropFilter: "blur(6px)",
  },
  modalHeaderStyle: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "4px",
  },
  viewDetailsBtn: {
    width: "100%",
    backgroundColor: "#7C3AED",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "12px",
    padding: "12px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(124, 58, 237, 0.4)",
    transition: "background 0.2s",
  },
  closeModalBtn: {
    width: "100%",
    backgroundColor: "#7C3AED",
    color: "#FFFFFF !important",
    border: "none",
    borderRadius: "12px",
    padding: "12px",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
    boxShadow: "0px 4px 12px rgba(124, 58, 237, 0.3)",
  },
};

export default ProfileSummary;