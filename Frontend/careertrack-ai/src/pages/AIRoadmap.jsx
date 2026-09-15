import React, { useState, useEffect } from "react";
import { Sparkles, CheckCircle2, Clock, X, Bot, Loader2, Plus, Trash2, AlertTriangle } from "lucide-react";
import "./AIRoadmap.css";

function AIRoadmap() {
  const [roadmaps, setRoadmaps] = useState({});
  const [selectedTrack, setSelectedTrack] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [trackInput, setTrackInput] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roadmapToDelete, setRoadmapToDelete] = useState(null);

  const fetchUserRoadmaps = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/roadmaps", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await response.json();
      if (response.ok && data.success && data.roadmaps) {
        const map = {};
        let activeTrackName = "";

        data.roadmaps.forEach((item) => {
          map[item.track] = { id: item._id, phases: item.phases, isActive: item.isActive };
          if (item.isActive) {
            activeTrackName = item.track;
          }
        });
        setRoadmaps(map);

        const trackKeys = Object.keys(map);
        if (trackKeys.length > 0) {
          if (activeTrackName && map[activeTrackName]) {
            setSelectedTrack(activeTrackName);
          } else if (!selectedTrack || !map[selectedTrack]) {
            setSelectedTrack(trackKeys[0]);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching roadmaps:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRoadmaps();
  }, []);

  const handleSelectTrack = async (trackName, trackId) => {
    setSelectedTrack(trackName);
    try {
      await fetch(`http://localhost:8080/api/roadmap/${trackId}/activate`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
    } catch (err) {
      console.error("Error setting active track:", err);
    }
  };

  const handleGenerateRoadmap = async (e) => {
    e.preventDefault();
    setIsGenerating(true);

    const targetTrack = trackInput.trim() || "Full-Stack Developer";

    try {
      const response = await fetch("http://localhost:8080/api/roadmap/regenerate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ track: targetTrack, prompt: customPrompt })
      });

      const data = await response.json();

      if (response.ok && data.roadmap) {
        await fetchUserRoadmaps();
        setSelectedTrack(targetTrack);
        setIsModalOpen(false);
        setTrackInput("");
        setCustomPrompt("");
      } else {
        alert(data.error || "Failed to generate roadmap");
      }
    } catch (error) {
      console.error("Network error generating roadmap:", error);
      alert("Network error while connecting to AI service.");
    } finally {
      setIsGenerating(false);
    }
  };

  const confirmDelete = async () => {
    if (!roadmapToDelete) return;

    try {
      const response = await fetch(`http://localhost:8080/api/roadmap/${roadmapToDelete.id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });

      if (response.ok) {
        await fetchUserRoadmaps();
        setSelectedTrack("");
        setIsDeleteModalOpen(false);
        setRoadmapToDelete(null);
      } else {
        alert("Failed to delete roadmap");
      }
    } catch (error) {
      console.error("Error deleting roadmap:", error);
    }
  };

  const activeTracks = Object.keys(roadmaps);
  const currentData = roadmaps[selectedTrack] || { id: null, phases: [] };
  const currentPhases = currentData.phases;

  return (
    <div className="roadmap-page">
      <div className="roadmap-header">
        <div>
          <h2>AI Career Roadmap</h2>
          <p>Your personalized, AI-optimized path to landing a top software engineering role.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="btn-regenerate"
        >
          <Plus size={16} /> Generate New Roadmap
        </button>
      </div>

      {activeTracks.length > 0 && (
        <div className="roadmap-tracks-bar">
          <div className="roadmap-tracks">
            {activeTracks.map((track) => {
              const isSelected = selectedTrack === track;
              const trackInfo = roadmaps[track];
              return (
                <button
                  key={track}
                  type="button"
                  onClick={() => handleSelectTrack(track, trackInfo.id)}
                  className={`track-btn ${isSelected ? "active" : ""}`}
                >
                  {track}
                </button>
              );
            })}
          </div>

          {selectedTrack && currentData.id && (
            <button
              type="button"
              onClick={() => {
                setRoadmapToDelete({ id: currentData.id, track: selectedTrack });
                setIsDeleteModalOpen(true);
              }}
              className="btn-delete-track"
            >
              <Trash2 size={14} /> Delete Track &quot;{selectedTrack}&quot;
            </button>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="roadmap-loading">
          <Loader2 className="animate-spin" size={32} />
          <p>Loading your roadmaps from MongoDB...</p>
        </div>
      ) : activeTracks.length === 0 ? (
        <div className="roadmap-empty-card">
          <Bot size={40} color="#A78BFA" style={{ marginBottom: "12px" }} />
          <h3 style={{ fontSize: "18px", color: "#FFFFFF", marginBottom: "8px" }}>No Roadmaps Generated Yet</h3>
          <p style={{ fontSize: "14px", color: "#9CA3AF", marginBottom: "20px" }}>
            You haven't created any AI roadmaps yet. Click below to build your first custom career path!
          </p>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="btn-regenerate"
          >
            <Sparkles size={16} /> Create Roadmap
          </button>
        </div>
      ) : (
        <div className="roadmap-timeline">
          {currentPhases.map((item, index) => {
            const progressValue = item.progress || "0%";
            return (
              <div key={index} className="roadmap-card">
                <div className="roadmap-card-header">
                  <div className="phase-badge-wrapper">
                    <span className="phase-name">{item.phase}</span>
                    <span
                      className={`roadmap-status ${
                        item.status === "Completed"
                          ? "completed"
                          : item.status === "In Progress"
                          ? "in-progress"
                          : "upcoming"
                      }`}
                    >
                      {item.status === "Completed" ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      {item.status}
                    </span>
                  </div>
                  <span className="roadmap-progress-text">{progressValue} Completed</span>
                </div>

                <h3 className="roadmap-title">{item.title}</h3>
                
                <p className="roadmap-desc">
                  {item.description || (item.topics ? item.topics.join(", ") : "Master foundational concepts and hands-on implementation.")}
                </p>

                <div className="roadmap-progress-bar-bg">
                  <div 
                    className="roadmap-progress-bar-fill"
                    style={{ width: progressValue }} 
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content-box">
            <div className="modal-header-box" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#FFFFFF", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <Bot size={20} color="#A78BFA" /> Generate AI Roadmap
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="close-btn"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleGenerateRoadmap} className="modal-form">
              <div>
                <label className="modal-label">Career Track / Role Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Full-Stack Developer, DevOps Engineer..."
                  value={trackInput}
                  onChange={(e) => setTrackInput(e.target.value)}
                  className="modal-input"
                />
              </div>

              <div>
                <label className="modal-label">Custom Focus / Target Goals</label>
                <textarea
                  rows="3"
                  placeholder="e.g., Focus heavily on System Design, Docker, and Microservices..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className="modal-input"
                  style={{ resize: "vertical" }}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-cancel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="btn-submit"
                  style={{ opacity: isGenerating ? 0.7 : 1 }}
                >
                  {isGenerating ? "Generating..." : "Generate & Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content-box delete-box" style={{ maxWidth: "400px", textAlign: "center" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "rgba(124, 58, 237, 0.15)", color: "#A78BFA", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto" }}>
              <AlertTriangle size={24} />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#FFFFFF", marginBottom: "8px" }}>Delete Roadmap Track?</h3>
            <p className="modal-desc" style={{ marginBottom: "24px", lineHeight: "1.5" }}>
              Are you sure you want to delete <strong style={{ color: "#FFFFFF" }}>&quot;{roadmapToDelete?.track}&quot;</strong>? This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setRoadmapToDelete(null);
                }}
                className="btn-cancel"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="btn-submit"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AIRoadmap;