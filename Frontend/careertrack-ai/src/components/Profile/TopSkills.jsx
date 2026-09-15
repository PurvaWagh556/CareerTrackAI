import React from "react";
import { FaCode, FaJava, FaPython, FaJs, FaReact, FaNodeJs, FaHtml5, FaCss3Alt } from "react-icons/fa";
import { SiCplusplus, SiC, SiTypescript, SiMongodb, SiExpress } from "react-icons/si";

function TopSkills({ skills = [] }) {
  const userSkills = Array.isArray(skills) ? skills : [];

  const getSkillIcon = (skillName) => {
    const name = skillName.toLowerCase().trim();
    if (name.includes("java") && !name.includes("script")) return <FaJava size={16} color="#f89820" />;
    if (name.includes("c++") || name.includes("cpp")) return <SiCplusplus size={16} color="#00599c" />;
    if (name === "c") return <SiC size={16} color="#A8B9CC" />;
    if (name.includes("javascript") || name.includes("js")) return <FaJs size={16} color="#f7df1e" />;
    if (name.includes("typescript") || name.includes("ts")) return <SiTypescript size={16} color="#3178c6" />;
    if (name.includes("react")) return <FaReact size={16} color="#61dafb" />;
    if (name.includes("node")) return <FaNodeJs size={16} color="#68a063" />;
    if (name.includes("express")) return <SiExpress size={16} color="#7C3AED" />;
    if (name.includes("python")) return <FaPython size={16} color="#306998" />;
    if (name.includes("mongo") || name.includes("database")) return <SiMongodb size={16} color="#47a248" />;
    if (name.includes("html")) return <FaHtml5 size={16} color="#e34f26" />;
    if (name.includes("css")) return <FaCss3Alt size={16} color="#1572b6" />;
    
    return <FaCode size={16} color="#7C3AED" />;
  };

  return (
    <div className="profile-card top-skills-card">
      <div style={styles.header}>
        <FaCode size={18} color="#7C3AED" />
        <span className="top-skills-title" style={styles.title}>Top Skills</span>
      </div>

      {userSkills.length === 0 ? (
        <p className="top-skills-empty" style={styles.emptyText}>No skills added yet!</p>
      ) : (
        <div style={styles.skillsGrid}>
          {userSkills.map((skill, index) => {
            const skillName = typeof skill === "string" ? skill : (skill.name || skill.skillName || "Skill");
            return (
              <div key={index} className="top-skill-badge" style={styles.skillBadge}>
                {getSkillIcon(skillName)}
                <span className="top-skill-text">{skillName}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  header: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "16px",
  },
  title: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#ffffff",
  },
  skillsGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },
  skillBadge: {
    backgroundColor: "#1a1c29",
    border: "1px solid #2a2d3d",
    color: "#ffffff",
    padding: "8px 14px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: "600",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
  },
  emptyText: {
    fontSize: "13px",
    color: "#9ca3af",
    margin: 0,
  },
};

export default TopSkills;