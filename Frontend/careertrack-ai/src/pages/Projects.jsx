import React, { useState, useEffect } from "react";
import { Plus, X, FolderGit2, ExternalLink, Trash2, Award, Edit3 } from "lucide-react";

function Projects() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDeleteId, setProjectToDeleteId] = useState(null);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [activeTab, setActiveTab] = useState("All");
  
  const [projectData, setProjectData] = useState({
    title: "",
    description: "",
    status: "In Progress",
    techStack: "",
    link: "",
    github: "",
  });

  const [projectsList, setProjectsList] = useState([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/projects", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await response.json();
      if (response.ok) setProjectsList(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const handleOpenEditModal = (project) => {
    setEditingProjectId(project._id || project.id);
    setProjectData({
      title: project.title,
      description: project.description,
      status: project.status,
      techStack: project.techStack || "",
      link: project.link || "",
      github: project.github || "",
    });
    setIsModalOpen(true);
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    if (!projectData.title.trim() || !projectData.description.trim()) return;

    try {
      const url = editingProjectId 
        ? `http://localhost:8080/api/projects/${editingProjectId}`
        : "http://localhost:8080/api/projects";
      
      const method = editingProjectId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(projectData),
      });

      const savedProject = await response.json();

      if (response.ok) {
        if (editingProjectId) {
          setProjectsList(projectsList.map(p => (p._id === editingProjectId || p.id === editingProjectId) ? savedProject : p));
        } else {
          setProjectsList([savedProject, ...projectsList]);
        }
        setProjectData({ title: "", description: "", status: "In Progress", techStack: "", link: "", github: "" });
        setEditingProjectId(null);
        setIsModalOpen(false);
      } else {
        alert(savedProject.error || "Failed to save project");
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "Completed" ? "In Progress" : "Completed";
    try {
      const response = await fetch(`http://localhost:8080/api/projects/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const updatedProject = await response.json();
      if (response.ok) {
        setProjectsList(projectsList.map((p) => (p._id === id || p.id === id) ? updatedProject : p));
      }
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  const confirmDeleteProject = (id) => {
    setProjectToDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteProject = async () => {
    if (!projectToDeleteId) return;

    try {
      const response = await fetch(`http://localhost:8080/api/projects/${projectToDeleteId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if (response.ok) {
        setProjectsList(projectsList.filter((project) => (project._id || project.id) !== projectToDeleteId));
        setIsDeleteModalOpen(false);
        setProjectToDeleteId(null);
      } else {
        alert("Failed to delete project");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const filteredProjects = projectsList.filter((project) => {
    if (activeTab === "All") return true;
    return project.status === activeTab;
  });

  return (
    <div style={{ padding: "32px", maxWidth: "1000px", margin: "0 auto", boxSizing: "border-box" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#FFFFFF", margin: "0 0 6px 0" }}>My Projects</h2>
          <p style={{ fontSize: "14px", color: "#9CA3AF", margin: 0 }}>Showcase and manage your full-stack web applications and engineering projects.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingProjectId(null);
            setProjectData({ title: "", description: "", status: "In Progress", techStack: "", link: "", github: "" });
            setIsModalOpen(true);
          }}
          style={{ backgroundColor: "#7C3AED", color: "#FFFFFF", border: "none", borderRadius: "10px", padding: "10px 18px", fontWeight: "600", fontSize: "14px", display: "inline-flex", alignItems: "center", gap: "8px", cursor: "pointer", boxShadow: "0px 4px 12px rgba(124, 58, 237, 0.3)" }}
        >
          <Plus size={16} /> Add New Project
        </button>
      </div>

      <div style={{ display: "flex", gap: "12px", marginBottom: "32px" }}>
        {["All", "Completed", "In Progress"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{ backgroundColor: activeTab === tab ? "#7C3AED" : "transparent", color: activeTab === tab ? "#FFFFFF" : "#9CA3AF", border: activeTab === tab ? "none" : "1px solid #2E2E42", borderRadius: "10px", padding: "8px 16px", fontWeight: "600", fontSize: "13px", cursor: "pointer" }}
          >
            {tab}
          </button>
        ))}
      </div>

      {filteredProjects.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "24px" }}>
          {filteredProjects.map((project) => (
            <div key={project._id || project.id} style={cardStyle}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ padding: "10px", backgroundColor: "rgba(124, 58, 237, 0.15)", borderRadius: "10px" }}>
                      <FolderGit2 size={20} color="#A78BFA" />
                    </div>
                    <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#FFFFFF", margin: 0 }}>{project.title}</h3>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                      onClick={() => handleToggleStatus(project._id || project.id, project.status)}
                      style={{ fontSize: "11px", backgroundColor: project.status === "Completed" ? "rgba(52, 211, 153, 0.15)" : "rgba(251, 191, 36, 0.15)", color: project.status === "Completed" ? "#34D399" : "#FBBF24", padding: "4px 10px", borderRadius: "6px", fontWeight: "600", cursor: "pointer" }}
                      title="Click to toggle status"
                    >
                      {project.status}
                    </span>
                    <button onClick={() => handleOpenEditModal(project)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#9CA3AF", padding: "4px" }} title="Edit Project & Links">
                      <Edit3 size={16} />
                    </button>
                    <button onClick={() => confirmDeleteProject(project._id || project.id)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#9CA3AF", padding: "4px" }} title="Delete Project">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <p style={{ fontSize: "14px", color: "#9CA3AF", lineHeight: "1.5", marginBottom: "20px" }}>{project.description}</p>

                {project.techStack && (
                  <div style={{ fontSize: "12px", color: "#A78BFA", backgroundColor: "rgba(124, 58, 237, 0.08)", padding: "6px 10px", borderRadius: "8px", marginBottom: "20px", display: "inline-block" }}>
                    <strong>Tech Stack:</strong> {project.techStack}
                  </div>
                )}
              </div>

              {(project.link || project.github) && (
                <div style={{ display: "flex", gap: "16px", paddingTop: "16px", borderTop: "1px solid #2E2E42" }}>
                  {project.link && (
                    <a href={project.link} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#A78BFA", textDecoration: "none", fontWeight: "500" }}>
                      <ExternalLink size={14} /> Live Demo
                    </a>
                  )}
                  {project.github && (
                    <a href={project.github} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#9CA3AF", textDecoration: "none", fontWeight: "500" }}>
                      Source Code
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "48px 0", color: "#9CA3AF", fontSize: "15px" }}>
          No projects found under &quot;{activeTab}&quot;. Click &quot;Add New Project&quot; to build your portfolio.
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay" style={overlayStyle}>
          <div className="modal-content-box" style={modalBoxStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#FFFFFF", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <Award size={20} color="#A78BFA" /> {editingProjectId ? "Edit Project & Links" : "Add New Project"}
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "#9CA3AF", cursor: "pointer", padding: "4px" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProject} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "13px", display: "block", marginBottom: "6px", color: "#9CA3AF", fontWeight: "500" }}>Project Title</label>
                <input type="text" required placeholder="e.g., WanderLust" value={projectData.title} onChange={(e) => setProjectData({ ...projectData, title: e.target.value })} style={inputStyle} />
              </div>

              <div>
                <label style={{ fontSize: "13px", display: "block", marginBottom: "6px", color: "#9CA3AF", fontWeight: "500" }}>Description</label>
                <textarea required rows={3} placeholder="Briefly describe what your project does..." value={projectData.description} onChange={(e) => setProjectData({ ...projectData, description: e.target.value })} style={{ ...inputStyle, resize: "vertical" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "13px", display: "block", marginBottom: "6px", color: "#9CA3AF", fontWeight: "500" }}>Status</label>
                  <select value={projectData.status} onChange={(e) => setProjectData({ ...projectData, status: e.target.value })} style={inputStyle}>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "13px", display: "block", marginBottom: "6px", color: "#9CA3AF", fontWeight: "500" }}>Tech Stack</label>
                  <input type="text" placeholder="e.g., MERN Stack" value={projectData.techStack} onChange={(e) => setProjectData({ ...projectData, techStack: e.target.value })} style={inputStyle} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "13px", display: "block", marginBottom: "6px", color: "#9CA3AF", fontWeight: "500" }}>Live Demo URL</label>
                <input type="url" placeholder="https://myproject.com" value={projectData.link} onChange={(e) => setProjectData({ ...projectData, link: e.target.value })} style={inputStyle} />
              </div>

              <div>
                <label style={{ fontSize: "13px", display: "block", marginBottom: "6px", color: "#9CA3AF", fontWeight: "500" }}>GitHub Repository</label>
                <input type="url" placeholder="https://github.com/username/repo" value={projectData.github} onChange={(e) => setProjectData({ ...projectData, github: e.target.value })} style={inputStyle} />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, backgroundColor: "transparent", border: "1px solid #2E2E42", color: "#9CA3AF", borderRadius: "10px", padding: "12px", fontWeight: "600", fontSize: "14px", cursor: "pointer" }}>Cancel</button>
                <button type="submit" style={{ flex: 1, backgroundColor: "#7C3AED", color: "#FFFFFF", border: "none", borderRadius: "10px", padding: "12px", fontWeight: "600", fontSize: "14px", cursor: "pointer", boxShadow: "0px 4px 12px rgba(124, 58, 237, 0.3)" }}>Save Changes</button>
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
              <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#FFFFFF", marginBottom: "8px" }}>Delete Project?</h3>
              <p style={{ fontSize: "14px", color: "#9CA3AF", margin: 0, lineHeight: "1.5" }}>
                Are you sure you want to delete this project? This action cannot be undone.
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
                onClick={handleDeleteProject}
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

const cardStyle = { backgroundColor: "#161622", border: "1px solid #2E2E42", borderRadius: "16px", padding: "24px", boxShadow: "0px 20px 40px rgba(0,0,0,0.4)", boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "space-between" };
const overlayStyle = { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0, 0, 0, 0.7)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 };
const modalBoxStyle = { backgroundColor: "#161622", border: "1px solid #2E2E42", borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "480px", maxHeight: "90vh", overflowY: "auto", boxShadow: "0px 25px 50px rgba(0,0,0,0.8)", boxSizing: "border-box" };
const inputStyle = { width: "100%", padding: "12px 14px", backgroundColor: "#0D0D14", border: "1px solid #2E2E42", borderRadius: "10px", color: "#FFFFFF", fontSize: "14px", outline: "none", boxSizing: "border-box" };

export default Projects;