import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Code, Award, MapPin, Cpu } from "lucide-react";
import { FaGithub, FaLinkedin, FaInstagram } from "react-icons/fa";

function About() {
  const navigate = useNavigate();

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

      {/* About Content Card */}
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
            <User size={24} color="#A78BFA" />
          </div>
          <h2 className="about-title">About Me</h2>
        </div>

        <p className="about-desc">
          Hi, I&apos;m Purva Wagh, a final-year Artificial Intelligence student at GHRCEMN and software developer based in Nagpur, India. Passionate about merging scalable full-stack web architecture with intelligent machine learning solutions.
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            marginTop: "8px",
          }}
        >
          {/* Full-Stack & MERN */}
          <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
            <div
              style={{
                padding: "8px",
                backgroundColor: "rgba(52, 211, 153, 0.15)",
                borderRadius: "8px",
                color: "#34D399",
                marginTop: "2px",
                flexShrink: 0,
              }}
            >
              <Code size={18} />
            </div>
            <div>
              <h4 className="about-feature-title">Full-Stack Development & MERN</h4>
              <p className="about-feature-text">
                Skilled in building responsive, robust applications using React, Node.js, Express, and MongoDB, alongside foundational web technologies (HTML, CSS, JavaScript) and core DSA in Java.
              </p>
            </div>
          </div>

          {/* Experience & Certifications */}
          <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
            <div
              style={{
                padding: "8px",
                backgroundColor: "rgba(245, 158, 11, 0.15)",
                borderRadius: "8px",
                color: "#F59E0B",
                marginTop: "2px",
                flexShrink: 0,
              }}
            >
              <Award size={18} />
            </div>
            <div>
              <h4 className="about-feature-title">Certifications & Experience</h4>
              <p className="about-feature-text">
                Completed rigorous Full Stack Development and DSA with Java tracks from <a href="https://www.apnacollege.in" style={{color: "#A78BFA", textDecoration: "none"}}>Apna College</a>, complemented by hands-on industry exposure as a Machine Learning Intern at <a href="https://prodigyinfotech.dev/" style={{color: "#A78BFA", textDecoration: "none"}}>Prodigy InfoTech</a>.
              </p>
            </div>
          </div>

          {/* Key Project Highlights */}
          <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
            <div
              style={{
                padding: "8px",
                backgroundColor: "rgba(167, 139, 250, 0.15)",
                borderRadius: "8px",
                color: "#A78BFA",
                marginTop: "2px",
                flexShrink: 0,
              }}
            >
              <Cpu size={18} />
            </div>
            <div>
              <h4 className="about-feature-title">Projects & AI Focus</h4>
              <p className="about-feature-text">
                Creator of the <a href="https://wanderlust-uksp.onrender.com/listings" style={{color: "#A78BFA", textDecoration: "none"}}>Wanderlust</a> Travel Website featuring category-based filtering and authentication. Actively focusing on integrating intelligent AI features into modern full-stack systems.
              </p>
            </div>
          </div>

          {/* Location & Academic Background */}
          <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
            <div
              style={{
                padding: "8px",
                backgroundColor: "rgba(59, 130, 246, 0.15)",
                borderRadius: "8px",
                color: "#3B82F6",
                marginTop: "2px",
                flexShrink: 0,
              }}
            >
              <MapPin size={18} />
            </div>
            <div>
              <h4 className="about-feature-title">Location & Background</h4>
              <p className="about-feature-text">
                Based in Nagpur, India, studying Artificial Intelligence at GHRCEMN with a strong drive toward building data-driven, scalable digital solutions.
              </p>
            </div>
          </div>
        </div>

        {/* Connect / Social Links Section */}
        <div
          style={{
            marginTop: "12px",
            paddingTop: "20px",
            borderTop: "1px solid #2E2E42",
          }}
        >
          <h4 className="about-feature-title" style={{ marginBottom: "12px" }}>
            Connect With Me
          </h4>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <a
              href="https://github.com/PurvaWagh556"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: "transparent",
                border: "1px solid #2E2E42",
                color: "#A78BFA",
                borderRadius: "10px",
                padding: "10px 16px",
                fontWeight: "600",
                fontSize: "14px",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                textDecoration: "none",
                cursor: "pointer",
                transition: "border-color 0.2s ease"
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = "#A78BFA"}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = "#2E2E42"}
            >
              <FaGithub size={16} /> GitHub
            </a>

            <a
              href="https://www.linkedin.com/in/purva-2808-w/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: "#7C3AED",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "10px",
                padding: "10px 16px",
                fontWeight: "600",
                fontSize: "14px",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                textDecoration: "none",
                cursor: "pointer",
                boxShadow: "0px 4px 12px rgba(124, 58, 237, 0.3)",
                transition: "background-color 0.2s ease"
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#6D28D9"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#7C3AED"}
            >
              <FaLinkedin size={16} /> LinkedIn
            </a>
            <a
              href="https://www.instagram.com/purva_wa_gh/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: "#7C3AED",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "10px",
                padding: "10px 16px",
                fontWeight: "600",
                fontSize: "14px",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                textDecoration: "none",
                cursor: "pointer",
                boxShadow: "0px 4px 12px rgba(124, 58, 237, 0.3)",
                transition: "background-color 0.2s ease"
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#6D28D9"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#7C3AED"}
            >
              <FaInstagram size={16} /> Instagram
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;