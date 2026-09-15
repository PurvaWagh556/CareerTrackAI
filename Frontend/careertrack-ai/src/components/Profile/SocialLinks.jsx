import React from "react";
import { FaGithub, FaLinkedin, FaGlobe, FaCode } from "react-icons/fa";

function SocialLinks({ profile }) {
  if (!profile) return null;

  const links = [
    { label: "GitHub", url: profile.github, icon: <FaGithub size={16} color="#7C3AED" /> },
    { label: "LinkedIn", url: profile.linkedin, icon: <FaLinkedin size={16} color="#3b82f6" /> },
    { label: "Portfolio", url: profile.portfolio, icon: <FaGlobe size={16} color="#10b981" /> },
    { label: "LeetCode", url: profile.leetcode, icon: <FaCode size={16} color="#f59e0b" /> },
  ].filter(link => link.url);

  return (
    <div className="profile-card social-links-card" style={styles.cardContainer}>
      <h3 style={styles.cardTitle}>Social Links</h3>

      <div style={styles.linksList}>
        {links.length === 0 ? (
          <p style={{ fontSize: "12px", color: "#9ca3af", margin: 0 }}>No social links added yet.</p>
        ) : (
          links.map((item, idx) => (
            <div key={idx} className="social-link-row" style={styles.linkRow}>
              <div style={styles.linkLeft}>
                <span style={styles.iconWrapper}>{item.icon}</span>
                <span className="social-link-label" style={styles.linkLabel}>{item.label}</span>
              </div>

              <a 
                href={item.url.startsWith("http") ? item.url : `https://${item.url}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="social-link-url"
                style={styles.linkUrl}
                title={item.url}
              >
                {item.url.replace(/^https?:\/\/(www\.)?/, "")}
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  cardContainer: {
    backgroundColor: "#12131a",
    border: "1px solid #2a2d3d",
    borderRadius: "16px",
    padding: "20px",
    color: "#ffffff",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
    boxSizing: "border-box",
    marginBottom: "24px",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: "700",
    margin: "0 0 16px 0",
    color: "#ffffff",
  },
  linksList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  linkRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1a1c29",
    border: "1px solid #2a2d3d",
    borderRadius: "10px",
    padding: "10px 14px",
    gap: "12px",
    overflow: "hidden",
  },
  linkLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexShrink: 0,
  },
  iconWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  linkLabel: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#ffffff",
  },
  linkUrl: {
    fontSize: "13px",
    color: "#a78bfa",
    textDecoration: "none",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: "180px",
    transition: "color 0.2s",
  },
};

export default SocialLinks;