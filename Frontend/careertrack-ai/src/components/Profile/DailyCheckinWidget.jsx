import React, { useState, useEffect } from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaBatteryThreeQuarters,
  FaCoffee,
  FaBrain,
  FaBed,
  FaTimes,
  FaFire,
} from "react-icons/fa";
import ActivityChart from "./ActivityChart";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

function DailyCheckinWidget() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [checkedDays, setCheckedDays] = useState({});
  const [energyStates, setEnergyStates] = useState({});
  const [selectedEnergy, setSelectedEnergy] = useState(null);

  const [streakCount, setStreakCount] = useState(0);
  const [consistencyPercent, setConsistencyPercent] = useState(0);
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

  const energyOptions = [
    {
      id: "flow",
      label: "Flow State",
      icon: <FaBatteryThreeQuarters color="#a855f7" size={16} />,
      color: "#a855f7",
    },
    {
      id: "coffee",
      label: "Coffee-Fueled",
      icon: <FaCoffee color="#f59e0b" size={16} />,
      color: "#f59e0b",
    },
    {
      id: "fog",
      label: "Brain-Fogged",
      icon: <FaBrain color="#3b82f6" size={16} />,
      color: "#3b82f6",
    },
    {
      id: "burnout",
      label: "Burnout / Rest",
      icon: <FaBed color="#ef4444" size={16} />,
      color: "#ef4444",
    },
  ];

  const fetchStreakData = () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${API_URL}/api/streak`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setStreakCount(data.streak || 0);
          setConsistencyPercent(data.consistency || 0);
          if (data.checkedDays) setCheckedDays(data.checkedDays);
          if (data.energyStates) setEnergyStates(data.energyStates);
        }
      })
      .catch((err) => console.error("Error fetching user streak:", err));
  };

  useEffect(() => {
    fetchStreakData();
  }, [API_URL]);

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
  };

  const handleEnergySelect = async (energyId) => {
    setSelectedEnergy(energyId);

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const key = `${year}-${month}-${day}`;

    const sessionDuration = 0;

    const token = localStorage.getItem("token");
    if (token) {
      try {
        const res = await fetch(`${API_URL}/api/checkin`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ 
            date: key, 
            energy: energyId, 
            duration: sessionDuration
          })
        });

        if (res.ok) {
          fetchStreakData();
        }
      } catch (err) {
        console.error("Error saving check-in:", err);
      }
    }
  };

  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthYearString = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const todayFormattedMonth = String(today.getMonth() + 1).padStart(2, "0");
  const todayFormattedDay = String(today.getDate()).padStart(2, "0");
  const todayKey = `${today.getFullYear()}-${todayFormattedMonth}-${todayFormattedDay}`;
  const isTodayChecked = checkedDays[todayKey];

  const dynamicStyles = {
    cardContainer: {
      width: "280px",
      backgroundColor: isLightMode ? "#FFFFFF" : "#12131a",
      borderRadius: "16px",
      padding: "16px",
      color: isLightMode ? "#0F172A" : "#ffffff",
      fontFamily: "Inter, sans-serif",
      boxShadow: isLightMode ? "0 4px 20px rgba(0,0,0,0.05)" : "0 10px 30px rgba(0,0,0,0.4)",
      border: isLightMode ? "1px solid #E2E8F0" : "1px solid #2a2d3d",
      boxSizing: "border-box",
      position: "relative",
    },
    monthYearTitle: { 
      fontSize: "16px", 
      fontWeight: "700", 
      color: isLightMode ? "#0F172A" : "#ffffff" 
    },
    iconBtn: {
      background: isLightMode ? "#F8FAFC" : "#1a1c29",
      border: isLightMode ? "1px solid #E2E8F0" : "1px solid #2a2d3d",
      color: "#7C3AED",
      padding: "6px 8px",
      borderRadius: "8px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    pulseContainer: {
      backgroundColor: isLightMode ? "#F8FAFC" : "#1a1c29",
      borderRadius: "10px",
      padding: "10px",
      marginBottom: "12px",
      border: isLightMode ? "1px solid #E2E8F0" : "1px solid #2a2d3d",
      textAlign: "center",
    },
    pulseLabel: {
      fontSize: "11px",
      fontWeight: "600",
      color: isLightMode ? "#0F172A" : "#e5e7eb",
      margin: "0 0 8px 0",
    },
    pulseBtn: {
      backgroundColor: isLightMode ? "#FFFFFF" : "#12131a",
      border: isLightMode ? "1px solid #E2E8F0" : "1px solid #2a2d3d",
      borderRadius: "8px",
      padding: "6px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.2s ease",
    },
    footer: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderTop: isLightMode ? "1px solid #E2E8F0" : "1px solid #2a2d3d",
      paddingTop: "10px",
    },
    streakSub: { fontSize: "10px", color: isLightMode ? "#64748B" : "#9ca3af" },
    rulesBtn: {
      background: "transparent",
      border: "none",
      color: "#7C3AED",
      fontSize: "12px",
      cursor: "pointer",
      fontWeight: "600",
    },
    modalContent: {
      width: "340px",
      backgroundColor: isLightMode ? "#FFFFFF" : "#12131a",
      border: isLightMode ? "1px solid #E2E8F0" : "1px solid #2a2d3d",
      borderRadius: "16px",
      padding: "20px",
      boxSizing: "border-box",
      boxShadow: isLightMode ? "0 20px 40px rgba(0,0,0,0.1)" : "0 20px 40px rgba(0,0,0,0.6)",
      color: isLightMode ? "#0F172A" : "#ffffff",
      maxHeight: "90vh",
      overflowY: "auto",
    },
    modalTitle: {
      fontSize: "15px",
      fontWeight: "700",
      margin: 0,
      color: isLightMode ? "#0F172A" : "#ffffff",
    },
    closeBtn: {
      background: "transparent",
      border: "none",
      color: isLightMode ? "#64748B" : "#9ca3af",
      cursor: "pointer",
      padding: "4px",
      display: "flex",
      alignItems: "center",
    },
    statBox: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      backgroundColor: isLightMode ? "#F8FAFC" : "#1a1c29",
      padding: "12px",
      borderRadius: "10px",
      border: isLightMode ? "1px solid #E2E8F0" : "1px solid #2a2d3d",
    },
    statValue: { fontSize: "16px", fontWeight: "700", color: isLightMode ? "#0F172A" : "#ffffff" },
    statLabel: { fontSize: "11px", color: isLightMode ? "#64748B" : "#9ca3af" },
  };

  return (
    <div className="profile-card calendar-widget-container" style={dynamicStyles.cardContainer}>
      <div style={styles.header}>
        <span className="calendar-title" style={dynamicStyles.monthYearTitle}>{monthYearString}</span>
        <div style={styles.navButtons}>
          <button className="calendar-nav-btn" style={dynamicStyles.iconBtn} onClick={handlePrevMonth}>
            <FaChevronLeft size={12} />
          </button>
          <button className="calendar-nav-btn" style={dynamicStyles.iconBtn} onClick={handleNextMonth}>
            <FaChevronRight size={12} />
          </button>
        </div>
      </div>

      <div style={styles.weekGrid}>
        {weekDays.map((day, idx) => (
          <span key={idx} style={styles.weekDayLabel}>
            {day}
          </span>
        ))}
      </div>

      <div style={styles.daysGrid}>
        {Array.from({ length: firstDayIndex }).map((_, index) => (
          <div key={`empty-${index}`} style={styles.emptyCell} />
        ))}

        {Array.from({ length: totalDaysInMonth }, (_, i) => i + 1).map(
          (day) => {
            const isToday =
              day === today.getDate() &&
              month === today.getMonth() &&
              year === today.getFullYear();
            const formattedMonth = String(month + 1).padStart(2, "0");
            const formattedDay = String(day).padStart(2, "0");
            const key = `${year}-${formattedMonth}-${formattedDay}`;
            const isChecked = checkedDays[key];

            return (
              <div
                key={day}
                className={isToday ? "calendar-day-current" : "calendar-day-cell"}
                style={{
                  ...styles.dayCell,
                  ...(isToday ? styles.currentDayCell : {}),
                }}
              >
                {isChecked && <span style={styles.lightningBolt}>⚡</span>}
                <span
                  className={isToday ? "calendar-day-current-text" : "calendar-day-num"}
                  style={{
                    ...styles.dayNumber,
                    ...(isToday ? styles.currentDayNumText : {}),
                    fontWeight: isToday || isChecked ? "bold" : "normal",
                  }}
                >
                  {day}
                </span>
              </div>
            );
          },
        )}
      </div>

      {!isTodayChecked && (
        <div className="calendar-pulse-box" style={dynamicStyles.pulseContainer}>
          <p className="calendar-pulse-label" style={dynamicStyles.pulseLabel}>How’s your energy today?</p>
          <div style={styles.pulseOptions}>
            {energyOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleEnergySelect(opt.id)}
                style={{
                  ...dynamicStyles.pulseBtn,
                  ...(selectedEnergy === opt.id
                    ? {
                        borderColor: opt.color,
                        backgroundColor: `${opt.color}25`,
                      }
                    : {}),
                }}
                title={opt.label}
              >
                {opt.icon}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={dynamicStyles.footer}>
        <div style={styles.streakInfo}>
          <span className="calendar-streak-text" style={styles.streakFlame}>🔥 {streakCount} Day Streak</span>
          <span className="calendar-streak-sub" style={dynamicStyles.streakSub}>
            Consistency: {consistencyPercent}%
          </span>
        </div>
        <button
          className="calendar-details-btn"
          style={dynamicStyles.rulesBtn}
          onClick={() => setShowDetailsModal(true)}
        >
          Details
        </button>
      </div>

      {showDetailsModal && (
        <div style={styles.modalOverlay}>
          <div style={dynamicStyles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={dynamicStyles.modalTitle}>Streak & Analytics</h3>
              <button
                style={dynamicStyles.closeBtn}
                onClick={() => setShowDetailsModal(false)}
              >
                <FaTimes size={14} />
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={dynamicStyles.statBox}>
                <FaFire color="#c084fc" size={22} />
                <div>
                  <div style={dynamicStyles.statValue}>{streakCount} Days</div>
                  <div style={dynamicStyles.statLabel}>Current Active Streak</div>
                </div>
              </div>

              <ActivityChart />
            </div>

            <button
              style={styles.modalActionBtn}
              onClick={() => setShowDetailsModal(false)}
              className="btn-close"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  navButtons: { display: "flex", gap: "6px" },
  weekGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    textAlign: "center",
    fontSize: "11px",
    color: "#7C3AED",
    marginBottom: "8px",
    fontWeight: "600",
  },
  weekDayLabel: { padding: "2px 0" },
  daysGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    rowGap: "8px",
    columnGap: "2px",
    justifyItems: "center",
    marginBottom: "12px",
  },
  emptyCell: { width: "32px", height: "32px" },
  dayCell: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    fontSize: "12px",
  },
  currentDayCell: {
    backgroundColor: "#7C3AED",
    color: "#ffffff",
    boxShadow: "0 0 12px rgba(124, 58, 237, 0.6)",
  },
  currentDayNumText: { color: "#ffffff", fontWeight: "bold" },
  dayNumber: { fontSize: "11px" },
  lightningBolt: { position: "absolute", top: "-10px", fontSize: "10px" },
  pulseOptions: { display: "flex", justifyContent: "space-around", gap: "4px" },
  streakInfo: { display: "flex", flexDirection: "column", gap: "2px" },
  streakFlame: { fontSize: "12px", fontWeight: "600", color: "#7C3AED" },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    backdropFilter: "blur(4px)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  modalBody: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginBottom: "20px",
  },
  modalActionBtn: {
    width: "100%",
    backgroundColor: "#7C3AED",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    padding: "10px",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(124, 58, 237, 0.4)",
  },
};

export default DailyCheckinWidget;