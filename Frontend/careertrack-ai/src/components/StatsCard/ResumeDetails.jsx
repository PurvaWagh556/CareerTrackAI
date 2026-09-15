import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, AlertCircle, UploadCloud, RefreshCw } from "lucide-react";

function ResumeDetails() {
  const navigate = useNavigate();
  const [atsData, setAtsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rechecking, setRechecking] = useState(false);

  useEffect(() => {
    fetchScore();
  }, []);

  const fetchScore = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    fetch("http://localhost:8080/api/resume/ats-score", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        setAtsData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching resume analysis:", err);
        setLoading(false);
      });
  };

  const handleRecheck = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setRechecking(true);
    try {
      const res = await fetch("http://localhost:8080/api/resume/recheck-score", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAtsData(prev => ({ ...prev, score: data.score, feedback: data.feedback }));
      } else {
        console.error("Recheck failed:", data.error);
        alert(data.error || "Failed to recheck score.");
      }
    } catch (err) {
      console.error("Error rechecking score:", err);
    } finally {
      setRechecking(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "60px", textAlign: "center", color: "#fff", fontFamily: "Inter, sans-serif" }}>
        Analyzing your resume with AI...
      </div>
    );
  }

  return (
    <div style={{ padding: "32px", maxWidth: "1200px", margin: "0 auto", boxSizing: "border-box", color: "#FFFFFF", fontFamily: "Inter, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            backgroundColor: "transparent",
            border: "1px solid #2E2E42",
            color: "#9CA3AF",
            borderRadius: "8px",
            padding: "8px 16px",
            fontWeight: "600",
            fontSize: "13px",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        {atsData && atsData.hasResume && (
          <button
            type="button"
            onClick={handleRecheck}
            disabled={rechecking}
            style={{
              backgroundColor: "#7C3AED",
              border: "none",
              color: "#FFFFFF",
              borderRadius: "8px",
              padding: "8px 16px",
              fontWeight: "600",
              fontSize: "13px",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <RefreshCw size={14} className={rechecking ? "animate-spin" : ""} /> 
            {rechecking ? "Re-analyzing..." : "Recheck Score"}
          </button>
        )}
      </div>

      <div style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "700", margin: "0 0 8px 0", display: "flex", alignItems: "center", gap: "12px" }}>
          <FileText size={28} color="#A78BFA" /> Resume Analysis & Score Breakdown
        </h2>
        <p style={{ fontSize: "14px", color: "#9CA3AF", margin: 0 }}>
          Detailed AI-powered insights, formatting suggestions, and keyword optimizations for your resume.
        </p>
      </div>

      {atsData && atsData.hasResume ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "24px" }}>
          <div style={cardStyle}>
            <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px", color: "#A78BFA" }}>Current Score Overview</h3>
            <div style={{ fontSize: "48px", fontWeight: "700", marginBottom: "8px" }}>
              {atsData.score} <span style={{ fontSize: "20px", color: "#9CA3AF" }}>/ 100</span>
            </div>
            <p style={{ fontSize: "13px", color: "#34D399", fontWeight: "600", margin: 0 }}>AI ATS Compatibility Checked ✨</p>
          </div>

          <div style={cardStyle}>
            <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px", color: "#34D399" }}>AI Feedback & Suggestions</h3>
            <p style={{ margin: 0, color: "#9CA3AF", fontSize: "14px", lineHeight: "1.6" }}>
              {atsData.feedback}
            </p>
          </div>
        </div>
      ) : (
        <div style={{ ...cardStyle, textAlign: "center", padding: "60px 20px" }}>
          <AlertCircle size={48} color="#F87171" style={{ marginBottom: "16px" }} />
          <h3 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "8px", color: "#FFFFFF" }}>No Resume Found</h3>
          <p style={{ fontSize: "14px", color: "#9CA3AF", marginBottom: "24px", maxWidth: "400px", margin: "0 auto 24px auto" }}>
            You haven't uploaded your resume yet. Head over to your profile section to upload your PDF resume so our AI can analyze it.
          </p>
          <button
            onClick={() => navigate("/profile")}
            style={{
              backgroundColor: "#7C3AED",
              border: "none",
              color: "#FFFFFF",
              borderRadius: "8px",
              padding: "10px 20px",
              fontWeight: "600",
              fontSize: "14px",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <UploadCloud size={16} /> Go to Profile to Upload
          </button>
        </div>
      )}
    </div>
  );
}

const cardStyle = {
  backgroundColor: "#161622",
  border: "1px solid #2E2E42",
  borderRadius: "16px",
  padding: "28px",
  boxShadow: "0px 20px 40px rgba(0,0,0,0.4)",
  boxSizing: "border-box",
};

export default ResumeDetails;