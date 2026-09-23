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

  const checkAuthAndNavigate = (defaultRoute) => {
    const token = localStorage.getItem("token") || localStorage.getItem("user");
    if (token) {
      navigate("/dashboard");
    } else {
      navigate(defaultRoute);
    }
  };

  return (
    <div className="landing-container">
      {/* Top Navigation */}
      <header className="landing-header">
        <div className="brand-logo" onClick={() => navigate("/")}>
          <div className="brand-icon">
            <Cat size={22} color="#8B5CF6" />
          </div>
          <span className="brand-title" style={{ color: "#FFFFFF" }}>
            CareerTrack <span style={{ color: "#8B5CF6", fontWeight: "750" }}>AI</span>
          </span>
        </div>

        <div className="auth-nav">
          <button
            type="button"
            onClick={() => checkAuthAndNavigate("/login")}
            className="btn-signin"
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => checkAuthAndNavigate("/signup")}
            className="btn-primary"
          >
            Get Started <ArrowRight size={15} />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="pill-tag">
          <Sparkles size={14} color="#8B5CF6" /> AI-Powered Placement Suite
        </div>

        <h1 className="hero-title">
          Master Roadmaps. <br />
          Track DSA.{" "}
          <span className="hero-gradient">
            Land the Role.
          </span>
        </h1>

        <p className="hero-subtitle">
          Your personal dashboard to track coding consistency, bridge skill gaps, and prep for tech roles.
        </p>

        <div className="hero-cta-group">
          <button
            type="button"
            onClick={() => checkAuthAndNavigate("/signup")}
            className="btn-hero-primary"
          >
            Get Started Free <ArrowRight size={17} />
          </button>

          <button
            type="button"
            onClick={() => checkAuthAndNavigate("/dashboard")}
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
          <div className="feature-card">
            <div className="feature-icon-box">
              <Compass size={22} color="#8B5CF6" />
            </div>
            <h3>Smart Roadmaps</h3>
            <p>
              Step-by-step tech paths built for Full-Stack, Backend, and AI/ML roles.
            </p>
          </div>

          {/* Card 2 */}
          <div className="feature-card">
            <div className="feature-icon-box">
              <Code2 size={22} color="#8B5CF6" />
            </div>
            <h3>DSA & Streaks</h3>
            <p>
              Log your algorithm progress and maintain daily problem-solving momentum.
            </p>
          </div>

          {/* Card 3 */}
          <div className="feature-card">
            <div className="feature-icon-box">
              <Trophy size={22} color="#8B5CF6" />
            </div>
            <h3>Readiness Score</h3>
            <p>
              Check your profile and resume gaps before applying to companies.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="bottom-cta-banner">
        <div className="bottom-cta-content">
          <h2>Ready to start building?</h2>
          <p>
            Organize your interview prep and roadmap in one place.
          </p>
          <button
            type="button"
            onClick={() => checkAuthAndNavigate("/signup")}
            className="btn-primary cta-center-btn"
          >
            Create Account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-left">
          <Cat size={16} color="#8B5CF6" />
          <span>© {new Date().getFullYear()} CareerTrack AI. All rights reserved.</span>
        </div>
        <div className="footer-right">
          <span>Built for developers & AI enthusiasts.</span>
        </div>
      </footer>
    </div>
  );
}

export default Landing;