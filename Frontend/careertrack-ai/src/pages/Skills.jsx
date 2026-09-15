import React, { useState, useEffect } from "react";
import { Plus, X, Code, Server, Award, Database, Cpu, Wrench, Trash2 } from "lucide-react";

function Skills() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [skillToDeleteId, setSkillToDeleteId] = useState(null);
  
  const [skillData, setSkillData] = useState({
    name: "",
    category: "Frontend",
    level: "Intermediate",
  });

  const [skillsList, setSkillsList] = useState([]);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/skills", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setSkillsList(data);
      }
    } catch (error) {
      console.error("Error fetching skills:", error);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!skillData.name.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8080/api/skills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(skillData),
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error("Non-JSON response from server:", text);
        alert("Server returned an invalid response. Check your backend console.");
        return;
      }

      if (response.ok) {
        setSkillsList((prev) => (Array.isArray(prev) ? [...prev, data] : [data]));
        setSkillData({ name: "", category: "Frontend", level: "Intermediate" });
        setIsModalOpen(false);
      } else {
        alert(data.error || data.message || "Failed to save skill");
      }
    } catch (error) {
      console.error("Network error saving skill:", error);
      alert("Network error: Unable to connect to backend server on port 8080.");
    }
  };

  const confirmDeleteSkill = (id) => {
    setSkillToDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteSkill = async () => {
    if (!skillToDeleteId) return;

    try {
      const response = await fetch(`http://localhost:8080/api/skills/${skillToDeleteId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setSkillsList(skillsList.filter((skill) => (skill._id || skill.id) !== skillToDeleteId));
        setIsDeleteModalOpen(false);
        setSkillToDeleteId(null);
      } else {
        alert(data.error || "Failed to delete skill");
      }
    } catch (error) {
      console.error("Error deleting skill:", error);
    }
  };

  const categories = [
    ...new Set(
      (Array.isArray(skillsList) ? skillsList : [])
        .map((s) => s?.category)
        .filter(Boolean)
    ),
  ];

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Frontend": return <Code size={20} color="#A78BFA" />;
      case "Backend": return <Server size={20} color="#A78BFA" />;
      case "Database": return <Database size={20} color="#A78BFA" />;
      case "DSA": return <Cpu size={20} color="#A78BFA" />;
      default: return <Wrench size={20} color="#A78BFA" />;
    }
  };

  return (
    <div style={{ padding: "32px", maxWidth: "1100px", margin: "0 auto", boxSizing: "border-box" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#FFFFFF", margin: "0 0 6px 0" }}>Skills & Competencies</h2>
          <p style={{ fontSize: "14px", color: "#9CA3AF", margin: 0 }}>Manage and track your technical stack and proficiency levels.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
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
            boxShadow: "0px 4px 12px rgba(124, 58, 237, 0.3)",
          }}
        >
          <Plus size={16} /> Add Skill
        </button>
      </div>

      {categories.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "24px" }}>
          {categories.map((cat) => {
            const categorySkills = skillsList.filter((s) => s.category === cat);
            return (
              <div key={cat} className="skill-card" style={cardStyle}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                  <div style={{ padding: "10px", backgroundColor: "rgba(124, 58, 237, 0.15)", borderRadius: "10px" }}>
                    {getCategoryIcon(cat)}
                  </div>
                  <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#FFFFFF", margin: 0 }}>{cat}</h3>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {categorySkills.map((skill) => (
                    <div key={skill._id || skill.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "12px", borderBottom: "1px solid #2E2E42" }}>
                      <span style={{ fontSize: "14px", color: "#E5E7EB", fontWeight: "500" }}>{skill.name}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "11px", backgroundColor: "rgba(52, 211, 153, 0.15)", color: "#34D399", padding: "4px 10px", borderRadius: "6px", fontWeight: "600" }}>{skill.level}</span>
                        <button
                          type="button"
                          onClick={() => confirmDeleteSkill(skill._id || skill.id)}
                          style={{ background: "transparent", border: "none", cursor: "pointer", color: "#9CA3AF", padding: "4px", display: "inline-flex", alignItems: "center" }}
                          title="Delete Skill"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "48px 0", color: "#9CA3AF", fontSize: "15px" }}>
          No skills added yet. Click &quot;Add Skill&quot; to get started.
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay" style={overlayStyle}>
          <div className="modal-content-box" style={modalBoxStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#FFFFFF", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <Award size={20} color="#A78BFA" /> Add New Skill
              </h3>
              <button
                type="button"
                className="close-btn"
                onClick={() => setIsModalOpen(false)}
                style={{ background: "transparent", border: "none", color: "#9CA3AF", cursor: "pointer", padding: "4px" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSkill} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "13px", display: "block", marginBottom: "6px", color: "#9CA3AF", fontWeight: "500" }}>Skill Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Arrays & Strings, Redux, PostgreSQL"
                  value={skillData.name}
                  onChange={(e) => setSkillData({ ...skillData, name: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ fontSize: "13px", display: "block", marginBottom: "6px", color: "#9CA3AF", fontWeight: "500" }}>Category</label>
                <select
                  value={skillData.category}
                  onChange={(e) => setSkillData({ ...skillData, category: e.target.value })}
                  style={inputStyle}
                >
                  <option value="Frontend">Frontend</option>
                  <option value="Backend">Backend</option>
                  <option value="Database">Database</option>
                  <option value="DSA">DSA</option>
                  <option value="Tools">Tools & DevOps</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "13px", display: "block", marginBottom: "6px", color: "#9CA3AF", fontWeight: "500" }}>Proficiency Level</label>
                <select
                  value={skillData.level}
                  onChange={(e) => setSkillData({ ...skillData, level: e.target.value })}
                  style={inputStyle}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ flex: 1, backgroundColor: "transparent", border: "1px solid #2E2E42", color: "#9CA3AF", borderRadius: "10px", padding: "12px", fontWeight: "600", fontSize: "14px", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, backgroundColor: "#7C3AED", color: "#FFFFFF", border: "none", borderRadius: "10px", padding: "12px", fontWeight: "600", fontSize: "14px", cursor: "pointer", boxShadow: "0px 4px 12px rgba(124, 58, 237, 0.3)" }}
                >
                  Save Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="modal-overlay" style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          backdropFilter: "blur(4px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
        }}>
          <div className="modal-content-box" style={{
            backgroundColor: "#161622",
            border: "1px solid #2E2E42",
            borderRadius: "16px",
            padding: "28px",
            width: "100%",
            maxWidth: "400px",
            boxShadow: "0px 25px 50px rgba(0,0,0,0.8)",
            boxSizing: "border-box",
            textAlign: "center"
          }}>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "4px" }}>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                style={{ background: "transparent", border: "none", color: "#9CA3AF", cursor: "pointer", padding: "4px" }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: "0 0 24px 0" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#FFFFFF", marginBottom: "8px" }}>Delete Skill?</h3>
              <p style={{ fontSize: "14px", color: "#9CA3AF", margin: 0, lineHeight: "1.5" }}>
                Are you sure you want to delete this skill? This action cannot be undone.
              </p>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                style={{ flex: 1, backgroundColor: "transparent", border: "1px solid #2E2E42", color: "#9CA3AF", borderRadius: "10px", padding: "12px", fontWeight: "600", fontSize: "14px", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSkill}
                style={{ flex: 1, backgroundColor: "#7C3AED", color: "#FFFFFF", border: "none", borderRadius: "10px", padding: "12px", fontWeight: "600", fontSize: "14px", cursor: "pointer", boxShadow: "0px 4px 12px rgba(124, 58, 237, 0.3)" }}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const cardStyle = {
  backgroundColor: "#161622",
  border: "1px solid #2E2E42",
  borderRadius: "16px",
  padding: "24px",
  boxShadow: "0px 20px 40px rgba(0,0,0,0.4)",
  boxSizing: "border-box",
};

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0, 0, 0, 0.7)",
  backdropFilter: "blur(4px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalBoxStyle = {
  backgroundColor: "#161622",
  border: "1px solid #2E2E42",
  borderRadius: "16px",
  padding: "28px",
  width: "100%",
  maxWidth: "420px",
  boxShadow: "0px 25px 50px rgba(0,0,0,0.8)",
  boxSizing: "border-box",
};

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  backgroundColor: "#0D0D14",
  border: "1px solid #2E2E42",
  borderRadius: "10px",
  color: "#FFFFFF",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
};

export default Skills;