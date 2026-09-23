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
import "./Landing.css";

function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0B0B12", color: "#FFFFFF", opacity: 1 }} className="landing-container">
      {/* Top Navigation */}
      <header className="landing-header">
        <div className="brand-logo" onClick={() => navigate("/")}>
          <div className="brand-icon">
            <Cat size={22} color="#8B5CF6" />
          </div>
          <span style={{ color: "#FFFFFF", opacity: 1, fontSize: "20px", fontWeight: 700 }}>
            CareerTrack <span style={{ color: "#8B5CF6" }}>AI</span>
          </span>
        </div>

        <div className="auth-nav">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="btn-signin"
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => navigate("/signup")}
            className="btn-primary"
          >
            Get Started <ArrowRight size={15} />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="pill-tag">
          <Sparkles size={14} color="#8B5CF6" /> Placement Readiness & AI Roadmap Suite
        </div>

        <h1 style={{ color: "#FFFFFF", opacity: 1 }} className="hero-title">
          Master Technical Roadmaps. <br />
          Track DSA.{" "}
          <span className="hero-gradient">
            Land the Role.
          </span>
        </h1>

        <p style={{ color: "#F1F5F9", opacity: 1, fontSize: "16px", lineHeight: "1.65", maxWidth: "680px", margin: "0 auto 38px auto" }}>
          Stop second-guessing your placement preparation. CareerTrack AI compares your
          target software role with your current skills, plots milestone roadmaps, and
          measures your career readiness in one cohesive dashboard.
        </p>

        <div className="hero-cta-group">
          <button
            type="button"
            onClick={() => navigate("/signup")}
            className="btn-hero-primary"
          >
            Build Your Roadmap Free <ArrowRight size={17} />
          </button>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="btn-hero-secondary"
          >
            Explore Dashboard
          </button>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="feature-section">
        <div className="feature-grid">
          {/* Card 1 */}
          <div className="feature-card" style={{ backgroundColor: "#13101E", opacity: 1 }}>
            <div className="feature-icon-box">
              <Compass size={22} color="#8B5CF6" />
            </div>
            <h3 style={{ color: "#FFFFFF", opacity: 1, fontSize: "18px", fontWeight: 700, margin: 0 }}>
              Tailored Roadmaps
            </h3>
            <p style={{ color: "#F1F5F9", opacity: 1, fontSize: "14px", lineHeight: 1.6, margin: 0 }}>
              Benchmarked directly against standard industry expectations for Full-Stack,
              Backend, Frontend, and Machine Learning engineering roles.
            </p>
          </div>

          {/* Card 2 */}
          <div className="feature-card" style={{ backgroundColor: "#13101E", opacity: 1 }}>
            <div className="feature-icon-box">
              <Code2 size={22} color="#8B5CF6" />
            </div>
            <h3 style={{ color: "#FFFFFF", opacity: 1, fontSize: "18px", fontWeight: 700, margin: 0 }}>
              DSA & Consistency Tracker
            </h3>
            <p style={{ color: "#F1F5F9", opacity: 1, fontSize: "14px", lineHeight: 1.6, margin: 0 }}>
              Log algorithm milestones, track practice streaks, and maintain problem-solving
              momentum across LeetCode and HackerRank workflows.
            </p>
          </div>

          {/* Card 3 */}
          <div className="feature-card" style={{ backgroundColor: "#13101E", opacity: 1 }}>
            <div className="feature-icon-box">
              <Trophy size={22} color="#8B5CF6" />
            </div>
            <h3 style={{ color: "#FFFFFF", opacity: 1, fontSize: "18px", fontWeight: 700, margin: 0 }}>
              Career Readiness Score
            </h3>
            <p style={{ color: "#F1F5F9", opacity: 1, fontSize: "14px", lineHeight: 1.6, margin: 0 }}>
              Instantly identify profile gaps across your projects, credentials, and resume
              documentation before applying to technical positions.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="bottom-cta-banner">
        <div style={{ maxWidth: "620px", margin: "0 auto" }}>
          <h2 style={{ color: "#FFFFFF", opacity: 1, fontSize: "24px", fontWeight: 700, marginBottom: "12px" }}>
            Ready to streamline your placement journey?
          </h2>
          <p style={{ color: "#F1F5F9", opacity: 1, fontSize: "14px", marginBottom: "24px" }}>
            Join developers using CareerTrack AI to organize their milestone roadmaps and interview preparation.
          </p>
          <button
            type="button"
            onClick={() => navigate("/signup")}
            className="btn-primary"
            style={{ margin: "0 auto" }}
          >
            Create Your Account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#F1F5F9", opacity: 1 }}>
          <Cat size={16} color="#8B5CF6" />
          <span>© {new Date().getFullYear()} CareerTrack AI. All rights reserved.</span>
        </div>
        <div style={{ color: "#F1F5F9", opacity: 1 }}>
          <span>Designed for engineers targeting top-tier tech roles.</span>
        </div>
      </footer>
    </div>
  );
}

export default Landing;