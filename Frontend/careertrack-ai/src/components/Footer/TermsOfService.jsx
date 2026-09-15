import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";

function TermsOfService() {
  const navigate = useNavigate();

  return (
    <div className="about-page" style={{ padding: "32px", maxWidth: "800px", margin: "0 auto", boxSizing: "border-box" }}>
      {/* Back Navigation */}
      <button
        type="button"
        onClick={() => navigate("/dashboard")}
        style={{
          backgroundColor: "#7C3AED",
          color: "#FFFFFF",
          border: "none",
          borderRadius: "10px",
          padding: "10px 18px",
          fontWeight: "600",
          fontSize: "14px",
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          cursor: "pointer",
          marginBottom: "24px",
          boxShadow: "0px 4px 12px rgba(124, 58, 237, 0.3)",
        }}
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      {/* Terms of Service Content Card */}
      <div className="about-content-card">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ padding: "10px", backgroundColor: "rgba(124, 58, 237, 0.15)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FileText size={24} color="#A78BFA" />
          </div>
          <h2 className="about-title">Terms of Service</h2>
        </div>
        
        <p className="about-desc">
          Welcome to your placement readiness and career tracking dashboard. By accessing or using this application, you agree to comply with and be bound by these Terms of Service.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "8px" }}>
          <div>
            <h4 className="about-feature-title">1. Acceptance of Terms</h4>
            <p className="about-feature-text" style={{ marginTop: "4px" }}>
              By logging into or interacting with your dashboard, resume uploads, and project trackers, you accept these terms in full.
            </p>
          </div>

          <div>
            <h4 className="about-feature-title">2. User Responsibilities</h4>
            <p className="about-feature-text" style={{ marginTop: "4px" }}>
              You are responsible for maintaining the confidentiality of your account credentials and ensuring that all data you submit or upload remains accurate and lawful.
            </p>
          </div>

          <div>
            <h4 className="about-feature-title">3. Modifications to Service</h4>
            <p className="about-feature-text" style={{ marginTop: "4px" }}>
              We reserve the right to update, modify, or improve dashboard components, routes, and features at any time without prior notice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TermsOfService;