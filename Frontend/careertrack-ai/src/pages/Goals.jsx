import React, { useState, useEffect } from "react";
import {
  Target,
  Plus,
  X,
  Award,
  CheckCircle2,
  Trophy,
  Trash2,
} from "lucide-react";
import "./Goals.css";

function Goals() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("All");

  const [goalData, setGoalData] = useState({
    title: "",
    category: "DSA & Coding",
    status: "In Progress",
  });

  const [goalsList, setGoalsList] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [goalToDeleteId, setGoalToDeleteId] = useState(null);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/goals", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setGoalsList(data);
      }
    } catch (error) {
      console.error("Error fetching goals:", error);
    }
  };

  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!goalData.title.trim()) return;

    try {
      const response = await fetch("http://localhost:8080/api/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(goalData),
      });

      const savedGoal = await response.json();

      if (response.ok) {
        setGoalsList([savedGoal, ...goalsList]);
        setGoalData({
          title: "",
          category: "DSA & Coding",
          status: "In Progress",
        });
        setIsModalOpen(false);
      } else {
        alert(savedGoal.error || "Failed to save goal");
      }
    } catch (error) {
      console.error("Network error saving goal:", error);
    }
  };

  const handleToggleGoalStatus = async (id, currentStatus) => {
    const newStatus =
      currentStatus === "Completed" ? "In Progress" : "Completed";

    try {
      const response = await fetch(`http://localhost:8080/api/goals/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const updatedGoal = await response.json();

      if (response.ok) {
        setGoalsList(
          goalsList.map((g) => (g._id === id || g.id === id ? updatedGoal : g)),
        );
      }
    } catch (error) {
      console.error("Error toggling goal status:", error);
    }
  };

  const confirmDeleteGoal = (id) => {
    setGoalToDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteGoal = async () => {
    if (!goalToDeleteId) return;

    try {
      const response = await fetch(
        `http://localhost:8080/api/goals/${goalToDeleteId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );

      if (response.ok) {
        setGoalsList(
          goalsList.filter((g) => (g._id || g.id) !== goalToDeleteId),
        );
        setIsDeleteModalOpen(false);
        setGoalToDeleteId(null);
      } else {
        alert("Failed to delete goal");
      }
    } catch (error) {
      console.error("Error deleting goal:", error);
    }
  };

  const filteredGoals = goalsList.filter((g) => {
    if (activeTab === "In Progress") return g.status === "In Progress";
    if (activeTab === "Completed") return g.status === "Completed";
    return true;
  });

  const totalActive = goalsList.length;
  const completedCount = goalsList.filter(
    (g) => g.status === "Completed",
  ).length;
  const successRate =
    totalActive > 0 ? Math.round((completedCount / totalActive) * 100) : 0;

  return (
    <div className="goals-page">
      <div className="goals-header">
        <div>
          <h2>Career & Placement Goals</h2>
          <p>Set, monitor, and achieve your technical and professional milestones.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="btn-add-goal"
        >
          <Plus size={16} /> Add New Goal
        </button>
      </div>

      <div className="goals-stats-grid">
        <div className="goals-stat-card">
          <div className="stat-icon-wrapper purple">
            <Target size={20} />
          </div>
          <div>
            <span className="stat-title">Total Active Goals</span>
            <span className="stat-value">{totalActive}</span>
          </div>
        </div>

        <div className="goals-stat-card">
          <div className="stat-icon-wrapper green">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span className="stat-title">Completed Milestones</span>
            <span className="stat-value">{completedCount}</span>
          </div>
        </div>

        <div className="goals-stat-card">
          <div className="stat-icon-wrapper yellow">
            <Trophy size={20} />
          </div>
          <div>
            <span className="stat-title">Overall Success Rate</span>
            <span className="stat-value">{successRate}%</span>
          </div>
        </div>
      </div>

      <div className="goals-toolbar">
        {["All", "In Progress", "Completed"].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`filter-btn ${activeTab === tab ? "active" : ""}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {filteredGoals.length > 0 ? (
        <div className="goals-grid">
          {filteredGoals.map((goal) => (
            <div key={goal._id || goal.id} className="goal-card">
              <div className="goal-card-top">
                <span className="goal-category">{goal.category}</span>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span
                    onClick={() =>
                      handleToggleGoalStatus(goal._id || goal.id, goal.status)
                    }
                    className={`goal-status ${
                      goal.status === "Completed" ? "completed" : "in-progress"
                    }`}
                    style={{ cursor: "pointer", userSelect: "none" }}
                    title="Click to toggle status"
                  >
                    {goal.status}
                  </span>

                  <button
                    onClick={() => confirmDeleteGoal(goal._id || goal.id)}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: "#9CA3AF",
                      padding: "4px",
                    }}
                    title="Delete Goal"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <h3 className="goal-title">{goal.title}</h3>
            </div>
          ))}
        </div>
      ) : (
        <div className="goals-empty-state">
          No goals found under &quot;{activeTab}&quot;. Click &quot;Add New Goal&quot; to set your targets.
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content-box">
            <div className="modal-header">
              <h3 className="modal-title-text">
                <Award size={20} color="#A78BFA" /> Add New Goal
              </h3>
              <button
                type="button"
                className="close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddGoal} className="modal-form">
              <div>
                <label className="modal-label">Goal Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Complete 150 LeetCode Problems"
                  value={goalData.title}
                  onChange={(e) =>
                    setGoalData({ ...goalData, title: e.target.value })
                  }
                  className="modal-input"
                />
              </div>

              <div>
                <label className="modal-label">Category</label>
                <select
                  value={goalData.category}
                  onChange={(e) =>
                    setGoalData({ ...goalData, category: e.target.value })
                  }
                  className="modal-input"
                >
                  <option value="DSA & Coding">DSA & Coding</option>
                  <option value="Cloud & DevOps">Cloud & DevOps</option>
                  <option value="Full-Stack">Full-Stack</option>
                  <option value="Mock Interviews">Mock Interviews</option>
                </select>
              </div>

              <div>
                <label className="modal-label">Status</label>
                <select
                  value={goalData.status}
                  onChange={(e) =>
                    setGoalData({ ...goalData, status: e.target.value })
                  }
                  className="modal-input"
                >
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-cancel"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content-box delete-box">
            <div className="modal-header">
              <span></span>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="close-btn"
              >
                <X size={20} />
              </button>
            </div>

            <div className="delete-body">
              <h3 className="modal-title-text">Delete Goal?</h3>
              <p className="modal-desc">
                Are you sure you want to delete this goal? This action cannot be undone.
              </p>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="btn-cancel"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteGoal}
                className="btn-submit"
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

export default Goals;