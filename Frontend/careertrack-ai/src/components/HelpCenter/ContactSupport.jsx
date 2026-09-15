import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageSquare, Send } from "lucide-react";

function ContactSupport() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env?.VITE_API_URL || "http://localhost:8080";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/support`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, source: "Contact Support Page" }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Message delivered successfully!");
        setName("");
        setEmail("");
        setMessage("");
      } else {
        alert("Failed to send message. Please try again.");
      }
    } catch (err) {
      console.error("Connection error:", err);
      alert("Error connecting to the backend server.");
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
            <MessageSquare size={24} color="#A78BFA" />
          </div>
          <h2 className="about-title">Reach Out to Me</h2>
        </div>

        <p className="about-desc">
          Have any questions, feedback, or suggestions about my platform? Drop a message below and it will come straight to my inbox!
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

          <div>
            <label
              className="about-feature-title"
              style={{ display: "block", marginBottom: "6px" }}
            >
              Message
            </label>
            <textarea
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="support-textarea"
              placeholder="What's on your mind?"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                boxSizing: "border-box",
              }}
            />
          </div>

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
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ContactSupport;