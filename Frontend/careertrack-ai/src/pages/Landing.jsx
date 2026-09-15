import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Cat,
  Sparkles,
  Code2,
  Trophy,
  ArrowRight,
  Compass,
} from "lucide-react";

function Landing() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0B0B12", 
        color: "#FFFFFF",
        fontFamily: "system-ui, -apple-system, sans-serif",
        display: "flex",
        flexDirection: "column",
        overflowX: "hidden",
      }}
    >
      {/* Top Navigation */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 44px",
          borderBottom: "1px solid rgba(139, 92, 246, 0.15)",
          backgroundColor: "rgba(11, 11, 18, 0.85)",
          backdropFilter: "blur(14px)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        {/* Brand Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            cursor: "pointer",
          }}
          onClick={() => navigate("/")}
        >
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "12px",
              backgroundColor: "rgba(139, 92, 246, 0.12)",
              border: "1.5px solid #8B5CF6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 16px rgba(139, 92, 246, 0.2)",
            }}
          >
            <Cat size={22} color="#8B5CF6" />
          </div>
          <span
            style={{
              fontSize: "20px",
              fontWeight: "700",
              letterSpacing: "-0.5px",
              color: "#FFFFFF",
            }}
          >
            CareerTrack <span style={{ color: "#8B5CF6" }}>AI</span>
          </span>
        </div>

        {/* Auth Navigation */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <button
            type="button"
            onClick={() => navigate("/login")}
            style={{
              backgroundColor: "transparent",
              color: "#E9D5FF",
              border: "1px solid rgba(139, 92, 246, 0.25)",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              padding: "8px 18px",
              borderRadius: "8px",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#8B5CF6";
              e.currentTarget.style.backgroundColor = "rgba(139, 92, 246, 0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.25)";
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => navigate("/signup")}
            style={{
              backgroundColor: "#7C3AED", 
              color: "#FFFFFF",
              border: "none",
              fontSize: "14px",
              fontWeight: "700",
              cursor: "pointer",
              padding: "9px 20px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 4px 14px rgba(124, 58, 237, 0.4)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.backgroundColor = "#6D28D9";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(124, 58, 237, 0.6)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.backgroundColor = "#7C3AED";
              e.currentTarget.style.boxShadow = "0 4px 14px rgba(124, 58, 237, 0.4)";
            }}
          >
            Get Started <ArrowRight size={15} />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "80px 24px 60px 24px",
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        {/* Purple Pill Tag */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "rgba(139, 92, 246, 0.1)",
            border: "1px solid rgba(139, 92, 246, 0.3)",
            padding: "6px 16px",
            borderRadius: "30px",
            fontSize: "12px",
            fontWeight: "600",
            color: "#C4B5FD",
            letterSpacing: "0.5px",
            marginBottom: "28px",
          }}
        >
          <Sparkles size={14} color="#8B5CF6" /> Placement Readiness & AI Roadmap Suite
        </div>

        {/* Hero Title */}
        <h1
          style={{
            fontSize: "clamp(38px, 5.5vw, 60px)",
            fontWeight: "800",
            lineHeight: "1.12",
            letterSpacing: "-1.2px",
            marginBottom: "22px",
          }}
        >
          Master Technical Roadmaps. <br />
          Track DSA.{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #E9D5FF 0%, #8B5CF6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Land the Role.
          </span>
        </h1>

        <p
          style={{
            fontSize: "16px",
            lineHeight: "1.65",
            color: "#9CA3AF",
            maxWidth: "680px",
            margin: "0 auto 38px auto",
          }}
        >
          Stop second-guessing your placement preparation. CareerTrack AI compares your
          target software role with your current skills, plots milestone roadmaps, and
          measures your career readiness in one cohesive dashboard.
        </p>

        {/* CTA Buttons */}
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
          <button
            type="button"
            onClick={() => navigate("/signup")}
            style={{
              backgroundColor: "#7C3AED", 
              color: "#FFFFFF",
              border: "none",
              padding: "14px 30px",
              borderRadius: "10px",
              fontSize: "15px",
              fontWeight: "700",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 6px 20px rgba(124, 58, 237, 0.35)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.03)";
              e.currentTarget.style.backgroundColor = "#6D28D9";
              e.currentTarget.style.boxShadow = "0 8px 25px rgba(124, 58, 237, 0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.backgroundColor = "#7C3AED";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(124, 58, 237, 0.35)";
            }}
          >
            Build Your Roadmap Free <ArrowRight size={17} />
          </button>

          <button
            type="button"
            onClick={() => navigate("/login")}
            style={{
              backgroundColor: "rgba(139, 92, 246, 0.05)",
              color: "#FFFFFF",
              border: "1px solid rgba(139, 92, 246, 0.3)",
              padding: "14px 26px",
              borderRadius: "10px",
              fontSize: "15px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "border-color 0.2s ease, background-color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#8B5CF6";
              e.currentTarget.style.backgroundColor = "rgba(139, 92, 246, 0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.3)";
              e.currentTarget.style.backgroundColor = "rgba(139, 92, 246, 0.05)";
            }}
          >
            Explore Dashboard
          </button>
        </div>
      </section>

      {/* Feature Grid */}
      <section
        style={{
          padding: "50px 24px 70px 24px",
          maxWidth: "1100px",
          margin: "0 auto",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            display: "grid",
            gap: "24px",
          }}
        >
          {/* Card 1 */}
          <div
            style={{
              backgroundColor: "#13101E", 
              border: "1px solid rgba(139, 92, 246, 0.15)",
              borderRadius: "16px",
              padding: "28px 24px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                backgroundColor: "rgba(139, 92, 246, 0.12)",
                border: "1px solid rgba(139, 92, 246, 0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Compass size={22} color="#8B5CF6" />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#FFFFFF", margin: 0 }}>
              Tailored Roadmaps
            </h3>
            <p style={{ fontSize: "14px", color: "#9CA3AF", lineHeight: "1.6", margin: 0 }}>
              Benchmarked directly against standard industry expectations for Full-Stack,
              Backend, Frontend, and Machine Learning engineering roles.
            </p>
          </div>

          {/* Card 2 */}
          <div
            style={{
              backgroundColor: "#13101E",
              border: "1px solid rgba(139, 92, 246, 0.15)",
              borderRadius: "16px",
              padding: "28px 24px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                backgroundColor: "rgba(139, 92, 246, 0.12)",
                border: "1px solid rgba(139, 92, 246, 0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Code2 size={22} color="#8B5CF6" />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#FFFFFF", margin: 0 }}>
              DSA & Consistency Tracker
            </h3>
            <p style={{ fontSize: "14px", color: "#9CA3AF", lineHeight: "1.6", margin: 0 }}>
              Log algorithm milestones, track practice streaks, and maintain problem-solving
              momentum across LeetCode and HackerRank workflows.
            </p>
          </div>

          {/* Card 3 */}
          <div
            style={{
              backgroundColor: "#13101E",
              border: "1px solid rgba(139, 92, 246, 0.15)",
              borderRadius: "16px",
              padding: "28px 24px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                backgroundColor: "rgba(139, 92, 246, 0.12)",
                border: "1px solid rgba(139, 92, 246, 0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Trophy size={22} color="#8B5CF6" />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#FFFFFF", margin: 0 }}>
              Career Readiness Score
            </h3>
            <p style={{ fontSize: "14px", color: "#9CA3AF", lineHeight: "1.6", margin: 0 }}>
              Instantly identify profile gaps across your projects, credentials, and resume
              documentation before applying to technical positions.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section
        style={{
          padding: "50px 24px",
          backgroundColor: "rgba(11, 11, 18, 0.6)",
          borderTop: "1px solid rgba(139, 92, 246, 0.1)",
          borderBottom: "1px solid rgba(139, 92, 246, 0.1)",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "620px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "12px", color: "#FFFFFF" }}>
            Ready to streamline your placement journey?
          </h2>
          <p style={{ fontSize: "14px", color: "#9CA3AF", marginBottom: "24px" }}>
            Join developers using CareerTrack AI to organize their milestone roadmaps and interview preparation.
          </p>
          <button
            type="button"
            onClick={() => navigate("/signup")}
            style={{
              backgroundColor: "#7C3AED",
              color: "#FFFFFF",
              border: "none",
              padding: "12px 26px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "700",
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(124, 58, 237, 0.3)",
              transition: "background-color 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#6D28D9")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#7C3AED")}
          >
            Create Your Account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: "30px 44px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "13px",
          color: "#6B7280",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Cat size={16} color="#8B5CF6" />
          <span>© {new Date().getFullYear()} CareerTrack AI. All rights reserved.</span>
        </div>
        <div>
          <span>Designed for engineers targeting top-tier tech roles.</span>
        </div>
      </footer>
    </div>
  );
}

export default Landing;