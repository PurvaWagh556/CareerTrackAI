import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";

function PrivacyPolicy() {
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

      {/* Privacy Policy Content */}
      <div className="about-content-card">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ padding: "10px", backgroundColor: "rgba(124, 58, 237, 0.15)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Shield size={24} color="#A78BFA" />
          </div>
          <h2 className="about-title">Privacy Policy</h2>
        </div>
        
        <p className="about-desc">
          Your privacy is important to us. This Privacy Policy explains how your information is collected, used, and safeguarded within your placement readiness and career tracking dashboard.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "8px" }}>
          <div>
            <h4 className="about-feature-title">1. Information We Collect</h4>
            <p className="about-feature-text" style={{ marginTop: "4px" }}>
              We collect profile data, resume uploads, certificate details, and activity metrics that you manually input or track within your dashboard to support your career progression.
            </p>
          </div>

          <div>
            <h4 className="about-feature-title">2. How We Use Your Information</h4>
            <p className="about-feature-text" style={{ marginTop: "4px" }}>
              Your information is used strictly to display your personal achievements, calculate placement readiness scores, and manage your full-stack project portfolio within the application.
            </p>
          </div>

          <div>
            <h4 className="about-feature-title">3. Data Security</h4>
            <p className="about-feature-text" style={{ marginTop: "4px" }}>
              We implement standard secure routing mechanisms and data encryption practices to ensure your personal data remains protected and private to your account session.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;