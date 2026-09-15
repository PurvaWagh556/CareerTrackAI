import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { LuSparkles } from "react-icons/lu";

import "./AISuggestions.css";

function AISuggestions() {
  const navigate = useNavigate();

  return (
    <div className="ai-card dashboard-card" style={{ 
      padding: "20px", 
      boxSizing: "border-box", 
      height: "auto", 
      minHeight: "unset", 
      overflow: "visible",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between"
    }}>
      <div className="ai-header">
        <div className="title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <LuSparkles size={30} color="#A78BFA" />
            <div className="title-components">
              <h4 style={{ margin: 0, color: "#fff", fontSize: "16px" }}>AI Study Suggestions</h4>
              <p style={{ margin: 0, color: "#9CA3AF", fontSize: "12px" }}>Personalized recommendations for today</p>
            </div>
          </div>
          
          <button 
            type="button"
            onClick={() => navigate("/recommendations")}
            style={{
              fontSize: "12px", 
              background: "#7C3AED", 
              color: "#fff", 
              border: "none", 
              padding: "8px 16px", 
              borderRadius: "8px", 
              cursor: "pointer",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0px 4px 12px rgba(124, 58, 237, 0.3)",
              transition: "background 0.2s ease"
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#6D28D9"}
            onMouseLeave={(e) => e.currentTarget.style.background = "#7C3AED"}
          >
            View Recommendations <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default AISuggestions;