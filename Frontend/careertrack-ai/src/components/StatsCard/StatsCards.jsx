import React, { useState, useEffect } from "react";
import {
  FileText,
  Code2,
  Award,
  Flame
} from "lucide-react";

import StatsCard from "./StatsCard";
import "./StatsCards.css";

function StatsCards() {
  const [resumeScore, setResumeScore] = useState("Loading...");
  const [certCount, setCertCount] = useState("0");
  const [dsaSolvedCount, setDsaSolvedCount] = useState("0");
  const [streakCount, setStreakCount] = useState("0");
  const [dsaRecentChange, setDsaRecentChange] = useState("+0");
  const [streakChange, setStreakChange] = useState("+0");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setResumeScore("0 / 100");
      setCertCount("0");
      setDsaSolvedCount("0");
      setStreakCount("0");
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    fetch("http://localhost:8080/api/resume/ats-score", { headers })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.hasResume) {
          setResumeScore(`${data.score} / 100`);
        } else {
          setResumeScore("No Resume");
        }
      })
      .catch((err) => console.error("Error fetching resume score:", err));

    fetch("http://localhost:8080/api/user/profile", { headers })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.certificates) {
          setCertCount(data.certificates.length.toString());
        } else {
          setCertCount("0");
        }
      })
      .catch((err) => console.error("Error fetching profile certificates:", err));

    fetch("http://localhost:8080/api/problems", { headers })
      .then((res) => res.json())
      .then((problems) => {
        if (Array.isArray(problems)) {
          const solvedList = problems.filter((p) => p.status === "Solved");
          
          const now = new Date();
          const year = now.getFullYear();
          const month = String(now.getMonth() + 1).padStart(2, '0');
          const day = String(now.getDate()).padStart(2, '0');
          const todayKey = `${year}-${month}-${day}`;

          const solvedToday = solvedList.filter((p) => {
            const timestamp = p.updatedAt || p.createdAt;
            if (!timestamp) return false;
            const d = new Date(timestamp);
            const pKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            return pKey === todayKey;
          }).length;

          setDsaSolvedCount(`+${solvedToday}`);
          setDsaRecentChange("Till Now");
        }
      })
      .catch((err) => console.error("Error fetching DSA problems:", err));

    fetch("http://localhost:8080/api/streak", { headers })
      .then((res) => res.json())
      .then((streakData) => {
        if (streakData && streakData.streak !== undefined) {
          setStreakCount(streakData.streak.toString());
          
          const todayKey = new Date().toISOString().split("T")[0];
          const todayRecord = streakData.checkedDays?.[todayKey];
          if (todayRecord) {
            setStreakChange("Active");
          } else {
            setStreakChange("Current");
          }
        }
      })
      .catch((err) => console.error("Error fetching streak data:", err));
  }, []);

  const stats = [
    {
      title: "Resume Score",
      value: resumeScore,
      change: "Live",
      icon: FileText,
      color: "rgba(139,92,246,.15)",
      path: "/resume-details",
    },
    {
      title: "Certifications",
      value: certCount,
      change: "Updated",
      icon: Award,
      color: "rgba(34,197,94,.15)",
      path: "/certifications",
    },
    {
      title: "DSA Solved",
      value: dsaSolvedCount,
      change: dsaRecentChange,
      icon: Code2,
      color: "rgba(59,130,246,.15)",
      path: "/dsa-tracker",
    },
    {
      title: "Current Streak",
      value: streakCount,
      change: streakChange,
      icon: Flame,
      color: "rgba(249,115,22,.15)",
      path: "/streak-details",
    },
  ];

  return (
    <div className="stats-grid">
      {stats.map((item, index) => (
        <StatsCard
          key={index}
          {...item}
        />
      ))}
    </div>
  );
}

export default StatsCards;