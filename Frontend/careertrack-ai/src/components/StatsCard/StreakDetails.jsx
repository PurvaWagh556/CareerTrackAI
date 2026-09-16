import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Flame,
  Activity,
  Calendar,
} from "lucide-react";
import { FaFire, FaBolt } from "react-icons/fa";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

function StreakDetails() {
  const navigate = useNavigate();
  const [activityData, setActivityData] = useState({});
  const [totalSubmissions, setTotalSubmissions] = useState(0);
  const [activeDaysCount, setActiveDaysCount] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [hoveredDay, setHoveredDay] = useState(null);

  const cardRef = useRef(null);

  useEffect(() => {
    fetchStreakAndActivityData();
  }, [selectedYear]);

  const fetchStreakAndActivityData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const headers = { Authorization: `Bearer ${token}` };

    try {
      const activityRes = await fetch(`${API_URL}/api/activity`, { headers });
      if (activityRes.ok) {
        const data = await activityRes.json();
        setActivityData(data);
        const counts = Object.values(data);
        const total = counts.reduce((acc, curr) => acc + curr, 0);
        setTotalSubmissions(total);
        setActiveDaysCount(counts.filter((c) => c > 0).length);
      }

      const streakRes = await fetch(`${API_URL}/api/streak`, { headers });
      if (streakRes.ok) {
        const streakData = await streakRes.json();
        setCurrentStreak(streakData.streak || 0);
        setMaxStreak(streakData.streak || 0);
      }
    } catch (error) {
      console.error("Error fetching streak data:", error);
    }
  };

  const generateMonthsData = () => {
    const months = [
      { name: "Jan", days: [] }, { name: "Feb", days: [] },
      { name: "Mar", days: [] }, { name: "Apr", days: [] },
      { name: "May", days: [] }, { name: "Jun", days: [] },
      { name: "Jul", days: [] }, { name: "Aug", days: [] },
      { name: "Sep", days: [] }, { name: "Oct", days: [] },
      { name: "Nov", days: [] }, { name: "Dec", days: [] }
    ];

    const startDate = new Date(`${selectedYear}-01-01`);
    const endDate = new Date(`${selectedYear}-12-31`);

    let current = new Date(startDate);
    while (current <= endDate) {
      const monthIdx = current.getMonth();
      const dateString = current.toISOString().split("T")[0];
      
      months[monthIdx].days.push({
        date: dateString,
        dayOfWeek: current.getDay(),
        count: activityData[dateString] || 0
      });
      current.setDate(current.getDate() + 1);
    }

    return months.map(m => {
      const weeks = [];
      let currentWeek = new Array(7).fill(null);

      m.days.forEach(day => {
        currentWeek[day.dayOfWeek] = day;
        if (day.dayOfWeek === 6) {
          weeks.push(currentWeek);
          currentWeek = new Array(7).fill(null);
        }
      });

      if (currentWeek.some(d => d !== null)) {
        weeks.push(currentWeek);
      }

      return {
        name: m.name,
        weeks: weeks
      };
    });
  };

  const monthsList = generateMonthsData();

  const getColor = (count) => {
    if (count === 0) return "#1F1F2E";
    if (count < 3) return "#4c1d95";
    if (count < 6) return "#7c3aed";
    return "#a78bfa";
  };

  const formatDate = (dateStr) => {
    const [y, m, d] = dateStr.split("-");
    return `${d}-${m}-${y}`;
  };

  const handleMouseEnter = (day, e) => {
    if (!cardRef.current) return;
    const cardRect = cardRef.current.getBoundingClientRect();
    const cellRect = e.currentTarget.getBoundingClientRect();

    setHoveredDay({
      ...day,
      x: cellRect.left - cardRect.left + cellRect.width / 2,
      y: cellRect.top - cardRect.top
    });
  };

  return (
    <div style={{ padding: "28px", maxWidth: "1100px", margin: "0 auto", boxSizing: "border-box", color: "#FFFFFF", fontFamily: "Inter, sans-serif" }}>
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
        <h2 style={{ fontSize: "24px", fontWeight: "700", margin: "0 0 4px 0", display: "flex", alignItems: "center", gap: "10px" }}>
          <Flame size={24} color="#A78BFA" /> Streak Analytics & Contributions
        </h2>
        <p style={{ fontSize: "13px", color: "#9CA3AF", margin: 0 }}>
          Monitor your consistency and submission history.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginBottom: "24px" }}>
       <div style={cardStyle}>
        <span style={{ fontSize: "12px", color: "#9CA3AF", display: "block", marginBottom: "4px" }}>Current Streak</span>
        <h3 style={{ fontSize: "28px", fontWeight: "700", margin: 0, color: "#A78BFA", display: "flex", alignItems: "center", gap: "8px" }}>
          {currentStreak} Days <FaFire color="#f97316" size={20} />
        </h3>
        <span style={{ fontSize: "11px", color: "#A78BFA", fontWeight: "500", display: "block", marginTop: "4px" }}>Active consistency streak!</span>
      </div>
      <div style={cardStyle}>
        <span style={{ fontSize: "12px", color: "#9CA3AF", display: "block", marginBottom: "4px" }}>Active Days</span>
        <h3 style={{ fontSize: "28px", fontWeight: "700", margin: 0, color: "#C084FC", display: "flex", alignItems: "center", gap: "8px" }}>
          {activeDaysCount} Days <FaBolt color="#eab308" size={20} />
        </h3>
        <span style={{ fontSize: "11px", color: "#9CA3AF", fontWeight: "500", display: "block", marginTop: "4px" }}>Total Submissions: {totalSubmissions}</span>
      </div>
    </div>

      <div ref={cardRef} style={{ ...cardStyle, position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "15px", fontWeight: "700", color: "#A78BFA" }}>
              All Submissions
            </span>
            <span style={{ fontSize: "12px", color: "#9CA3AF" }}>
              {totalSubmissions} submissions in {selectedYear}
            </span>
          </div>
          <div style={{ fontSize: "12px", color: "#9CA3AF" }}>
            Active days: <strong style={{ color: "#FFFFFF" }}>{activeDaysCount}</strong> &nbsp;|&nbsp; Max streak: <strong style={{ color: "#FFFFFF" }}>{maxStreak}</strong>
          </div>
        </div>

        {hoveredDay && (
          <div style={{
            position: "absolute",
            left: `${hoveredDay.x}px`,
            top: `${hoveredDay.y - 10}px`,
            transform: "translate(-50%, -100%)",
            backgroundColor: "#161622",
            border: "1px solid #7C3AED",
            borderRadius: "12px",
            padding: "12px 16px",
            boxShadow: "0 10px 25px rgba(124, 58, 237, 0.3)",
            zIndex: 100,
            minWidth: "160px",
            pointerEvents: "none",
            whiteSpace: "nowrap"
          }}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: "#A78BFA", textTransform: "uppercase", marginBottom: "8px", letterSpacing: "0.5px" }}>
              Daily Activity
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", color: "#9CA3AF", marginBottom: "4px", gap: "16px" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Activity size={12} /> Submissions</span>
              <strong style={{ color: "#FFFFFF" }}>{hoveredDay.count}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", color: "#9CA3AF", gap: "16px" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Calendar size={12} /> Date</span>
              <strong style={{ color: "#FFFFFF" }}>{formatDate(hoveredDay.date)}</strong>
            </div>
          </div>
        )}

        <div style={{ width: "100%", overflowX: "auto", paddingBottom: "10px" }}>
          <div style={{ 
            display: "flex", 
            gap: "16px", 
            minWidth: "max-content",
            padding: "4px 0",
            alignItems: "flex-end"
          }}>
            {monthsList.map((month, mIdx) => (
              <div key={mIdx} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", gap: "3px" }}>
                  {month.weeks.map((week, wIdx) => (
                    <div key={wIdx} style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                      {week.map((day, dIdx) => (
                        day === null ? (
                          <div key={dIdx} style={{ width: "12px", height: "12px", visibility: "hidden" }} />
                        ) : (
                          <div
                            key={dIdx}
                            onMouseEnter={(e) => handleMouseEnter(day, e)}
                            onMouseLeave={() => setHoveredDay(null)}
                            title={`${day.date}: ${day.count} submissions`}
                            style={{
                              width: "12px",
                              height: "12px",
                              backgroundColor: getColor(day.count),
                              borderRadius: "2px",
                              cursor: "pointer",
                              transition: "transform 0.1s ease",
                            }}
                          />
                        )
                      ))}
                    </div>
                  ))}
                </div>
                <span style={{ fontSize: "12px", color: "#9CA3AF", textAlign: "left" }}>
                  {month.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginTop: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <button 
              type="button" 
              onClick={() => setSelectedYear(selectedYear - 1)} 
              style={yearBtnStyle}
            >
              &lt;
            </button>
            <span style={{ backgroundColor: "#2A2A3C", padding: "3px 10px", borderRadius: "6px", color: "#FFFFFF", fontWeight: "600", fontSize: "12px", border: "1px solid #7C3AED" }}>
              {selectedYear}
            </span>
            <button 
              type="button" 
              onClick={() => setSelectedYear(selectedYear + 1)} 
              style={yearBtnStyle}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const cardStyle = {
  backgroundColor: "#161622",
  border: "1px solid #2E2E42",
  borderRadius: "14px",
  padding: "20px",
  boxShadow: "0px 10px 30px rgba(0,0,0,0.3)",
  boxSizing: "border-box",
};

const yearBtnStyle = {
  backgroundColor: "transparent",
  border: "1px solid #2E2E42",
  color: "#9CA3AF",
  borderRadius: "6px",
  padding: "3px 8px",
  cursor: "pointer",
  fontSize: "11px"
};

export default StreakDetails;