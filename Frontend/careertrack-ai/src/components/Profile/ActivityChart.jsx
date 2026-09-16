import React, { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight, FaRegClock, FaRegCalendarAlt } from "react-icons/fa";

function ActivityChart() {
  const [viewMode, setViewMode] = useState("Weekly");
  const [checkedDays, setCheckedDays] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredData, setHoveredData] = useState(null);
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

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  useEffect(() => {
    const fetchChartData = () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      fetch(`${API_URL}/api/streak`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.checkedDays) {
            setCheckedDays(data.checkedDays);
          }
        })
        .catch((err) => console.error("Error updating chart live:", err));
    };

    fetchChartData();
    const interval = setInterval(fetchChartData, 10000);
    return () => clearInterval(interval);
  }, [API_URL]);

  const getSunday = (d) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day;
    return new Date(date.setDate(diff));
  };

  const [weekStart, setWeekStart] = useState(getSunday(new Date()));

  const handlePrevPeriod = () => {
    if (viewMode === "Weekly") {
      const prev = new Date(weekStart);
      prev.setDate(prev.getDate() - 7);
      setWeekStart(prev);
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    }
  };

  const handleNextPeriod = () => {
    if (viewMode === "Weekly") {
      const next = new Date(weekStart);
      next.setDate(next.getDate() + 7);
      setWeekStart(next);
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    }
  };

  const formatDuration = (totalMinutes) => {
    if (!totalMinutes || totalMinutes === 0) return "0m";
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hrs > 0 && mins > 0) return `${hrs}hr ${mins}m`;
    if (hrs > 0) return `${hrs}hr`;
    return `${mins}m`;
  };

  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const dayDate = new Date(weekStart);
    dayDate.setDate(weekStart.getDate() + i);
    
    const year = dayDate.getFullYear();
    const month = String(dayDate.getMonth() + 1).padStart(2, '0');
    const day = String(dayDate.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;

    const labels = ["S", "M", "T", "W", "T", "F", "S"];
    const formattedDate = `${day}-${month}-${year}`;
    const dayRecord = checkedDays[dateKey];

    const actualMinutes = dayRecord ? (typeof dayRecord === 'number' ? dayRecord : (dayRecord.duration || dayRecord.minutes || 0)) : 0;

    return {
      label: labels[i],
      minutes: actualMinutes,
      dateStr: formattedDate
    };
  });

  const weekEndStr = new Date(weekStart);
  weekEndStr.setDate(weekStart.getDate() + 6);
  const weekRangeText = `${weekStart.getDate()} - ${weekEndStr.getDate()} ${weekEndStr.toLocaleString('default', { month: 'short' })} ${weekEndStr.getFullYear()}`;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  const monthlyData = Array.from({ length: totalDaysInMonth }, (_, i) => {
    const dayNum = i + 1;
    const formattedMonth = String(month + 1).padStart(2, '0');
    const formattedDay = String(dayNum).padStart(2, '0');
    const dateKey = `${year}-${formattedMonth}-${formattedDay}`;
    
    const formattedDate = `${formattedDay}-${formattedMonth}-${year}`;
    const dayRecord = checkedDays[dateKey];

    const actualMinutes = dayRecord ? (typeof dayRecord === 'number' ? dayRecord : (dayRecord.duration || dayRecord.minutes || 0)) : 0;

    return {
      day: dayNum,
      minutes: actualMinutes,
      dateStr: formattedDate
    };
  });

  const currentDataset = viewMode === "Weekly" ? weeklyData : monthlyData;
  const peakMinutes = Math.max(...currentDataset.map(d => d.minutes), 0);
  const maxMinutes = peakMinutes > 0 ? Math.ceil(peakMinutes / 20) * 20 : 60; 

  const currentStyles = {
    cardContainer: {
      width: "100%",
      borderRadius: "12px",
      padding: "14px",
      fontFamily: "Inter, sans-serif",
      boxSizing: "border-box",
      backgroundColor: isLightMode ? "#FFFFFF" : "#12131a",
      color: isLightMode ? "#0F172A" : "#ffffff",
      border: isLightMode ? "1px solid #E2E8F0" : "1px solid #2a2d3d",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: "10px",
    },
    title: {
      fontSize: "14px",
      fontWeight: "700",
      lineHeight: "1.2",
      color: isLightMode ? "#7C3AED" : "#c084fc",
    },
    dropdown: {
      borderRadius: "8px",
      padding: "4px 8px",
      fontSize: "11px",
      cursor: "pointer",
      outline: "none",
      backgroundColor: isLightMode ? "#F8FAFC" : "#1a1c29",
      border: isLightMode ? "1px solid #CBD5E1" : "1px solid #2a2d3d",
      color: isLightMode ? "#7C3AED" : "#c084fc",
    },
    chartAreaWrapper: {
      position: "relative",
    },
    tooltip: {
      position: "absolute",
      top: "-55px",
      left: "50%",
      transform: "translateX(-50%)",
      borderRadius: "10px",
      padding: "8px 12px",
      zIndex: 10,
      width: "145px",
      boxSizing: "border-box",
      backgroundColor: isLightMode ? "#FFFFFF" : "#1a1c29",
      border: isLightMode ? "1px solid #CBD5E1" : "1px solid #2a2d3d",
      boxShadow: isLightMode ? "0 10px 25px rgba(0,0,0,0.1)" : "0 10px 25px rgba(0,0,0,0.5)",
    },
    tooltipRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      fontSize: "11px",
      marginBottom: "4px",
    },
    tooltipLabel: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      color: isLightMode ? "#64748B" : "#9ca3af",
    },
    tooltipValue: {
      fontWeight: "700",
      color: isLightMode ? "#0F172A" : "#ffffff",
    },
    chartArea: {
      display: "flex",
      height: "110px",
      marginBottom: "10px",
    },
    yAxisLabels: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      fontSize: "10px",
      paddingRight: "8px",
      paddingBottom: "16px",
      width: "55px",
      color: isLightMode ? "#64748B" : "#9ca3af",
    },
    barsGrid: {
      flex: 1,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-end",
      paddingBottom: "4px",
      gap: "1px",
      minWidth: 0,
    },
    barColumn: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      flex: 1,
      minWidth: 0,
      height: "100%",
      justifyContent: "flex-end",
      cursor: "pointer",
    },
    barTrack: {
      width: "100%",
      maxWidth: "8px",
      height: "80px",
      display: "flex",
      alignItems: "flex-end",
      marginBottom: "6px",
    },
    barFill: {
      width: "100%",
      borderRadius: "4px",
      transition: "height 0.3s ease",
    },
    dayLabel: {
      fontSize: "8px",
      fontWeight: "600",
      whiteSpace: "nowrap",
      color: isLightMode ? "#64748B" : "#9ca3af",
    },
    emptyLabel: {
      fontSize: "8px",
      height: "11px",
    },
    footerNav: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: "10px",
      borderTop: isLightMode ? "1px solid #E2E8F0" : "1px solid #2a2d3d",
    },
    dateRangeText: {
      fontSize: "11px",
      fontWeight: "500",
      color: isLightMode ? "#64748B" : "#9ca3af",
    },
    navBtn: {
      padding: "6px 8px",
      borderRadius: "6px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isLightMode ? "#F8FAFC" : "#1a1c29",
      border: isLightMode ? "1px solid #CBD5E1" : "1px solid #2a2d3d",
      color: isLightMode ? "#0F172A" : "#c084fc",
    }
  };

  return (
    <div style={currentStyles.cardContainer}>
      <div style={currentStyles.header}>
        <span style={currentStyles.title}>Total Learning Time</span>
        <select 
          value={viewMode} 
          onChange={(e) => setViewMode(e.target.value)}
          style={currentStyles.dropdown}
        >
          <option value="Weekly">Weekly</option>
          <option value="Monthly">Monthly</option>
        </select>
      </div>

      <div style={currentStyles.chartAreaWrapper}>
        {hoveredData && (
          <div style={currentStyles.tooltip}>
            <div style={currentStyles.tooltipRow}>
              <span style={currentStyles.tooltipLabel}><FaRegClock size={11} /> Time</span>
              <span style={currentStyles.tooltipValue}>{formatDuration(hoveredData.minutes)}</span>
            </div>
            <div style={currentStyles.tooltipRow}>
              <span style={currentStyles.tooltipLabel}><FaRegCalendarAlt size={11} /> Date</span>
              <span style={currentStyles.tooltipValue}>{hoveredData.dateStr}</span>
            </div>
          </div>
        )}

        <div style={currentStyles.chartArea}>
          <div style={currentStyles.yAxisLabels}>
            <span>{formatDuration(maxMinutes)} -</span>
            <span>{formatDuration(Math.round(maxMinutes / 2))} -</span>
            <span>0 -</span>
          </div>

          {viewMode === "Weekly" ? (
            <div style={currentStyles.barsGrid}>
              {weeklyData.map((item, index) => {
                const heightPercent = Math.min(100, (item.minutes / maxMinutes) * 100);
                return (
                  <div 
                    key={index} 
                    style={currentStyles.barColumn}
                    onMouseEnter={() => setHoveredData(item)}
                    onMouseLeave={() => setHoveredData(null)}
                  >
                    <div style={currentStyles.barTrack}>
                      <div 
                        className="chart-bar-fill"
                        data-active={item.minutes > 0 ? "true" : "false"}
                        style={{
                          ...currentStyles.barFill, 
                          height: `${heightPercent}%`,
                          backgroundColor: item.minutes > 0 ? "#7C3AED" : "transparent"
                        }} 
                      />
                    </div>
                    <span style={currentStyles.dayLabel}>{item.label}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={currentStyles.barsGrid}>
              {monthlyData.map((item) => {
                const heightPercent = Math.min(100, (item.minutes / maxMinutes) * 100);
                const showLabel = [1, 5, 10, 15, 20, 25, totalDaysInMonth].includes(item.day);

                return (
                  <div 
                    key={item.day} 
                    style={currentStyles.barColumn}
                    onMouseEnter={() => setHoveredData(item)}
                    onMouseLeave={() => setHoveredData(null)}
                  >
                    <div style={currentStyles.barTrack}>
                      <div 
                        className="chart-bar-fill"
                        data-active={item.minutes > 0 ? "true" : "false"}
                        style={{
                          ...currentStyles.barFill, 
                          height: `${heightPercent}%`,
                          backgroundColor: item.minutes > 0 ? "#7C3AED" : "transparent"
                        }} 
                      />
                    </div>
                    {showLabel ? <span style={currentStyles.dayLabel}>{item.day}</span> : <span style={currentStyles.emptyLabel}></span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div style={currentStyles.footerNav}>
        <button className="chart-nav-btn" style={currentStyles.navBtn} onClick={handlePrevPeriod}>
          <FaChevronLeft size={10} color={isLightMode ? "#0F172A" : "#c084fc"} />
        </button>
        <span style={currentStyles.dateRangeText}>
          {viewMode === "Weekly" ? weekRangeText : `1 - ${totalDaysInMonth} ${monthName} ${year}`}
        </span>
        <button className="chart-nav-btn" style={currentStyles.navBtn} onClick={handleNextPeriod}>
          <FaChevronRight size={10} color={isLightMode ? "#0F172A" : "#c084fc"} />
        </button>
      </div>
    </div>
  );
}

export default ActivityChart;