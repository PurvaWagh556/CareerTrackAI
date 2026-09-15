import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LifeBuoy, Send } from "lucide-react";

function Support() {
  const navigate = useNavigate();

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Environment variable for API routing
  const API_URL = import.meta.env?.VITE_API_URL || "http://localhost:8080";

  // Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/support`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, source: "Support Page" }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Support ticket submitted and emailed successfully.");
        setName("");
        setEmail("");
        setMessage("");
      } else {
        alert("Failed to send support ticket. Please try again.");
      }
    } catch (err) {
      console.error("Connection error:", err);
      alert("Error connecting to the support server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="about-page"
      style={{
        padding: "32px",
        maxWidth: "800px",
        margin: "0 auto",
        boxSizing: "border-box",
      }}
    >
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

      {/* Support Form Card */}
      <div className="about-content-card">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              padding: "10px",
              backgroundColor: "rgba(124, 58, 237, 0.15)",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LifeBuoy size={24} color="#A78BFA" />
          </div>
          <h2 className="about-title">Customer Support</h2>
        </div>

        <p className="about-desc">
          Need assistance with your placement roadmap, profile settings, or
          project deployments? Submit a support ticket below and our team will
          get back to you promptly.
        </p>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            marginTop: "8px",
          }}
        >
          {/* Name Field */}
          <div>
            <label
              className="about-feature-title"
              style={{ display: "block", marginBottom: "6px" }}
            >
              Your Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="support-textarea"
              placeholder="Enter your name"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Email Field */}
          <div>
            <label
              className="about-feature-title"
              style={{ display: "block", marginBottom: "6px" }}
            >
              Your Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="support-textarea"
              placeholder="e.g., name@example.com"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Message Field */}
          <div>
            <label
              className="about-feature-title"
              style={{ display: "block", marginBottom: "6px" }}
            >
              Your Issue or Inquiry
            </label>
            <textarea
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="support-textarea"
              placeholder="Describe your issue or question in detail..."
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: "#7C3AED",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "10px",
              padding: "12px 20px",
              fontWeight: "600",
              fontSize: "14px",
              cursor: loading ? "not-allowed" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxShadow: "0px 4px 12px rgba(124, 58, 237, 0.3)",
              width: "100%",
              opacity: loading ? 0.7 : 1,
            }}
          >
            <Send size={16} />
            {loading ? "Sending..." : "Submit Support Ticket"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Support;