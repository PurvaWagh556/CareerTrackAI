import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./LearningRoadmap.css";
import { ArrowRight } from "lucide-react";

function LearningRoadmap() {
  const [roadmapData, setRoadmapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const API_URL = import.meta.env?.VITE_API_URL || "http://localhost:8080";

  useEffect(() => {
    const fetchActiveRoadmap = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/roadmap/active`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setRoadmapData(data.roadmap);
        }
      } catch (err) {
        console.error("Error fetching active dashboard roadmap:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveRoadmap();
  }, [API_URL]);

  const phases = roadmapData?.phases || [];

  return (
    <section className="roadmap-card">
      <div className="roadmap-header">
        <div>
          <h2>AI Learning Roadmap</h2>
          {roadmapData?.track && (
            <span style={{ fontSize: "12px", color: "#A78BFA", fontWeight: "600" }}>
              Active Track: {roadmapData.track}
            </span>
          )}
        </div>
        <button 
          type="button"
          onClick={() => navigate("/ai-roadmap")}
          style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", background: "none", border: "none", color: "#A78BFA" }}
        >
          View Full Roadmap
          <ArrowRight size={18} />
        </button>
      </div>

      {loading ? (
        <div style={{ color: "#9CA3AF", padding: "20px", textAlign: "center", fontSize: "14px" }}>
          Loading your active roadmap...
        </div>
      ) : phases.length === 0 ? (
        <div style={{ color: "#9CA3AF", padding: "20px", textAlign: "center", fontSize: "14px" }}>
          No roadmap active yet. Generate a track on the AI Roadmap page!
        </div>
      ) : (
        <div className="roadmap-line">
          {phases.map((item, index) => {
            const bulletItems = item.topics && item.topics.length > 0
              ? item.topics
              : ["Core Concepts", "Practical Implementation", "Milestone Project"];

            return (
              <div className="roadmap-step" key={index}>
                <div className="circle">{index + 1}</div>
                <div className="step-card">
                  <h4 style={{ margin: "0 0 2px 0", fontSize: "14px", color: "#A78BFA" }}>{item.phase}</h4>
                  {item.title && (
                    <p style={{ fontSize: "13px", fontWeight: "600", color: "#FFFFFF", marginBottom: "6px", lineHeight: "1.3" }}>
                      {item.title}
                    </p>
                  )}
                  <ul style={{ paddingLeft: "16px", margin: 0, color: "#9CA3AF", fontSize: "12px" }}>
                    {bulletItems.map((topic, tIndex) => (
                      <li key={tIndex} style={{ marginBottom: "3px" }}>{topic}</li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default LearningRoadmap;