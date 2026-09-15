import React from "react";
import { useNavigate } from "react-router-dom";

function StatsCard({ title, value, change, icon: Icon, color, path }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => path && navigate(path)} 
      style={{
        backgroundColor: "#161622",
        border: "1px solid #2E2E42",
        borderRadius: "16px",
        padding: "24px",
        boxShadow: "0px 20px 40px rgba(0,0,0,0.4)",
        cursor: path ? "pointer" : "default",
        transition: "transform 0.2s ease, border-color 0.2s ease",
      }}
      onMouseEnter={(e) => {
        if (path) {
          e.currentTarget.style.transform = "translateY(-4px)";
          e.currentTarget.style.borderColor = "#7C3AED";
        }
      }}
      onMouseLeave={(e) => {
        if (path) {
          e.currentTarget.style.transform = "translateY(0px)";
          e.currentTarget.style.borderColor = "#2E2E42";
        }
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
        <div style={{ padding: "10px", backgroundColor: color, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {Icon && <Icon size={20} color="#A78BFA" />}
        </div>
        <span style={{ fontSize: "14px", color: "#9CA3AF", fontWeight: "500" }}>{title}</span>
      </div>

      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <h3 style={{ fontSize: "28px", fontWeight: "700", color: "#FFFFFF", margin: 0 }}>{value}</h3>
        <span style={{ fontSize: "13px", color: "#34D399", fontWeight: "600" }}>{change}</span>
      </div>
    </div>
  );
}

export default StatsCard;