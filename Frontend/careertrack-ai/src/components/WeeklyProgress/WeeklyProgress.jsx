import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import "./WeeklyProgress.css";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

function WeeklyProgress() {
  const [weeklyData, setWeeklyData] = useState([
    { day: "Mon", progress: 0 },
    { day: "Tue", progress: 0 },
    { day: "Wed", progress: 0 },
    { day: "Thu", progress: 0 },
    { day: "Fri", progress: 0 },
    { day: "Sat", progress: 0 },
    { day: "Sun", progress: 0 },
  ]);

  useEffect(() => {
    const fetchWeeklyProgress = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch(`${API_URL}/api/activity`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (res.ok) {
          const activityMap = await res.json();
          
          const curr = new Date();
          const firstDayOfWeek = new Date(curr);
          const day = curr.getDay();
          const diff = curr.getDate() - day + (day === 0 ? -6 : 1); 
          firstDayOfWeek.setDate(diff);

          const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
          const computedData = daysOfWeek.map((dayName, index) => {
            const targetDate = new Date(firstDayOfWeek);
            targetDate.setDate(firstDayOfWeek.getDate() + index);
            const dateStr = targetDate.toISOString().split("T")[0];
            
            const count = activityMap[dateStr] || 0;
            const progress = Math.min(100, count * 20);

            return { day: dayName, progress };
          });

          setWeeklyData(computedData);
        }
      } catch (err) {
        console.error("Error fetching weekly progress:", err);
      }
    };

    fetchWeeklyProgress();
  }, []);

  return (
    <div className="graph-card dashboard-card">
      <h2>Weekly Progress</h2>
      
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={210}>
          <LineChart 
            data={weeklyData}
            margin={{ top: 15, right: 25, left: -10, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#27272A"
            />

            <XAxis dataKey="day" stroke="#9CA3AF" tick={{ fontSize: 12 }} />

            <YAxis stroke="#9CA3AF" domain={[0, 100]} tick={{ fontSize: 12 }} />

           <Tooltip 
              contentStyle={{ 
                backgroundColor: "#FFFFFF", 
                border: "1px solid #7C3AED", 
                borderRadius: "12px", 
                color: "#0F172A",
                fontSize: "12px",
                boxShadow: "0px 10px 25px rgba(124, 58, 237, 0.15)"
              }} 
            />

            <Line
              type="monotone"
              dataKey="progress"
              stroke="#8B5CF6"
              strokeWidth={3}
              dot={{
                fill: "#8B5CF6",
                r: 5
              }}
              activeDot={{ r: 7, fill: "#8B5CF6" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default WeeklyProgress;