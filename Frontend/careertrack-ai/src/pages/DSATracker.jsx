import React, { useState, useEffect } from "react";
import { Code2, CheckCircle2, Clock, AlertCircle, ExternalLink, ArrowLeft, Search, RotateCcw } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
function DSATracker() {
  const [activeTopic, setActiveTopic] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("name");
  const [problemsList, setProblemsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`${API_URL}/api/problems`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then(async res => {
        const text = await res.text();
        try {
          const json = JSON.parse(text);
          if (!res.ok) throw new Error(json.error || "Failed to fetch from server");
          return json;
        } catch (e) {
          console.error("Received non-JSON response:", text);
          throw new Error("Server returned HTML instead of JSON. Check backend route or port.");
        }
      })
      .then(data => {
        if (Array.isArray(data)) {
          setProblemsList(data);
        } else {
          setErrorMsg("Received invalid data format from server.");
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching problems:", err);
        setErrorMsg(err.message);
        setLoading(false);
      });
  }, []);

  const totalQuestions = problemsList.length;
  const totalSolved = problemsList.filter(p => p.status === "Solved").length;
  const totalToDo = problemsList.filter(p => p.status === "To Do").length;
  const overallPercentage = Math.round((totalSolved / (totalQuestions || 1)) * 100);

  const handleToggleStatus = (id) => {
    const targetProblem = problemsList.find(p => p._id === id);
    if (!targetProblem) return;

    let nextStatus = "In Progress";
    if (targetProblem.status === "To Do") nextStatus = "In Progress";
    else if (targetProblem.status === "In Progress") nextStatus = "Solved";
    else if (targetProblem.status === "Solved") nextStatus = "To Do";

    setProblemsList(prev =>
      prev.map(p => (p._id === id ? { ...p, status: nextStatus } : p))
    );

    const token = localStorage.getItem("token");
    fetch(`${API_URL}/api/problems/${id}/status`, {
      method: "PATCH",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ status: nextStatus })
    }).catch(err => console.error("Error syncing with database:", err));
  };

  if (loading) {
    return <div style={{ padding: "40px", color: "#FFFFFF", textAlign: "center" }}>Loading your tracker data from database...</div>;
  }

  if (errorMsg) {
    return (
      <div style={{ padding: "40px", color: "#EF4444", textAlign: "center", fontFamily: "sans-serif" }}>
        <h3>Error loading tracker: {errorMsg}</h3>
        <p style={{ color: "#9CA3AF", fontSize: "14px", marginTop: "8px" }}>Make sure your backend server is running on port 8080 and you are logged in.</p>
      </div>
    );
  }

  if (activeTopic) {
    const topicProblems = problemsList.filter(
      p => p.category === activeTopic && p.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const totalTopicCount = problemsList.filter(p => p.category === activeTopic).length;
    const solvedCount = problemsList.filter(p => p.category === activeTopic && p.status === "Solved").length;
    
    const easyCount = problemsList.filter(p => p.category === activeTopic && p.difficulty === "Easy" && p.status === "Solved").length;
    const easyTotal = problemsList.filter(p => p.category === activeTopic && p.difficulty === "Easy").length;
    
    const medCount = problemsList.filter(p => p.category === activeTopic && p.difficulty === "Medium" && p.status === "Solved").length;
    const medTotal = problemsList.filter(p => p.category === activeTopic && p.difficulty === "Medium").length;
    
    const hardCount = problemsList.filter(p => p.category === activeTopic && p.difficulty === "Hard" && p.status === "Solved").length;
    const hardTotal = problemsList.filter(p => p.category === activeTopic && p.difficulty === "Hard").length;

    const rEasy = 50, rMed = 41, rHard = 32;
    const circEasy = 2 * Math.PI * rEasy;
    const circMed = 2 * Math.PI * rMed;
    const circHard = 2 * Math.PI * rHard;

    const offsetEasy = circEasy - (circEasy * easyCount) / (easyTotal || 1);
    const offsetMed = circMed - (circMed * medCount) / (medTotal || 1);
    const offsetHard = circHard - (circHard * hardCount) / (hardTotal || 1);

    return (
      <div style={{ padding: "32px", maxWidth: "1200px", margin: "0 auto", boxSizing: "border-box", backgroundColor: "#0D0D14", minHeight: "100vh", color: "#FFFFFF", fontFamily: "sans-serif" }}>
        <button 
          onClick={() => { setActiveTopic(null); setSearchQuery(""); }} 
          style={{ background: "transparent", border: "none", color: "#A78BFA", fontSize: "14px", fontWeight: "600", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}
        >
          <ArrowLeft size={16} /> Back to Topics
        </button>

        <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "24px" }}>
          <div style={{ backgroundColor: "#161622", border: "1px solid #2E2E42", borderRadius: "16px", padding: "24px", boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#A78BFA", margin: "0 0 24px 0" }}>DSA Sheet Progress</h2>

            <div style={{ position: "relative", width: "120px", height: "120px", marginBottom: "28px" }}>
              <svg width="120" height="120" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="60" cy="60" r={rEasy} stroke="#1E1E2F" strokeWidth="6" fill="none" />
                <circle cx="60" cy="60" r={rEasy} stroke="#14b8a6" strokeWidth="6" strokeDasharray={circEasy} strokeDashoffset={offsetEasy} strokeLinecap="round" fill="none" />
                <circle cx="60" cy="60" r={rMed} stroke="#1E1E2F" strokeWidth="6" fill="none" />
                <circle cx="60" cy="60" r={rMed} stroke="#d97706" strokeWidth="6" strokeDasharray={circMed} strokeDashoffset={offsetMed} strokeLinecap="round" fill="none" />
                <circle cx="60" cy="60" r={rHard} stroke="#1E1E2F" strokeWidth="6" fill="none" />
                <circle cx="60" cy="60" r={rHard} stroke="#dc2626" strokeWidth="6" strokeDasharray={circHard} strokeDashoffset={offsetHard} strokeLinecap="round" fill="none" />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                <span style={{ fontSize: "18px", fontWeight: "700", color: "#FFFFFF", lineHeight: 1 }}>{solvedCount}/{totalTopicCount}</span>
                <span style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "4px" }}>Solved</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ color: "#14b8a6", fontWeight: "600" }}>Easy</span>
                <span style={{ color: "#9CA3AF" }}>{easyCount}/{easyTotal}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ color: "#d97706", fontWeight: "600" }}>Medium</span>
                <span style={{ color: "#9CA3AF" }}>{medCount}/{medTotal}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ color: "#dc2626", fontWeight: "600" }}>Hard</span>
                <span style={{ color: "#9CA3AF" }}>{hardCount}/{hardTotal}</span>
              </div>
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div style={{ position: "relative", width: "100%", maxWidth: "350px" }}>
                <Search size={16} style={{ position: "absolute", left: "14px", top: "14px", color: "#9CA3AF" }} />
                <input 
                  type="text" 
                  placeholder="Search questions" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: "100%", padding: "12px 14px 12px 40px", backgroundColor: "#161622", border: "1px solid #2E2E42", borderRadius: "10px", color: "#FFFFFF", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {topicProblems.map((prob) => (
                <div key={prob._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#161622", border: "1px solid #2E2E42", borderRadius: "12px", padding: "16px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <CheckCircle2 size={18} color={prob.status === "Solved" ? "#34D399" : "#6B7280"} />
                    <span style={{ color: "#FFFFFF", fontWeight: "600", fontSize: "14px" }}>{prob.title}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                    <span style={{ fontSize: "12px", fontWeight: "600", color: prob.difficulty === "Easy" ? "#14b8a6" : prob.difficulty === "Medium" ? "#d97706" : "#dc2626" }}>{prob.difficulty}</span>
                    <button onClick={() => handleToggleStatus(prob._id)} style={{ backgroundColor: "rgba(124, 58, 237, 0.15)", color: "#A78BFA", border: "none", borderRadius: "8px", padding: "6px 12px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>
                      {prob.status}
                    </button>
                    {prob.link && (
                      <a href={prob.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "#A78BFA", display: "flex", alignItems: "center" }}>
                        <ExternalLink size={16} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const uniqueTopics = [...new Set(problemsList.map(p => p.category))];
  let topicsData = uniqueTopics.map(topic => {
    const topicProbs = problemsList.filter(p => p.category === topic);
    const count = topicProbs.length;
    const solved = topicProbs.filter(p => p.status === "Solved").length;
    const todo = topicProbs.filter(p => p.status === "To Do").length;
    const percentage = Math.round((solved / (count || 1)) * 100);
    return { name: topic, count, solved, todo, percentage };
  });

  if (statusFilter === "Solved") {
    topicsData = topicsData.filter(t => t.solved > 0);
  } else if (statusFilter === "To Do") {
    topicsData = topicsData.filter(t => t.todo > 0);
  }

  topicsData.sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "count") return b.count - a.count;
    if (sortBy === "progress") return b.percentage - a.percentage;
    return 0;
  });

  return (
    <div style={{ padding: "32px", maxWidth: "1200px", margin: "0 auto", boxSizing: "border-box", backgroundColor: "#0D0D14", minHeight: "100vh", color: "#FFFFFF", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#FFFFFF", margin: "0 0 6px 0" }}>DSA Topics</h2>
          <p style={{ fontSize: "14px", color: "#9CA3AF", margin: 0 }}>Explore problems grouped by core data structures and algorithms.</p>
        </div>

        <div style={{ display: "flex", gap: "16px", backgroundColor: "#161622", border: "1px solid #2E2E42", borderRadius: "12px", padding: "12px 20px" }}>
          <div>
            <div style={{ fontSize: "11px", color: "#9CA3AF" }}>Total Questions</div>
            <div style={{ fontSize: "16px", fontWeight: "700", color: "#FFFFFF" }}>{totalQuestions}</div>
          </div>
          <div style={{ width: "1px", backgroundColor: "#2E2E42" }} />
          <div>
            <div style={{ fontSize: "11px", color: "#34D399" }}>Solved</div>
            <div style={{ fontSize: "16px", fontWeight: "700", color: "#34D399" }}>{totalSolved}</div>
          </div>
          <div style={{ width: "1px", backgroundColor: "#2E2E42" }} />
          <div>
            <div style={{ fontSize: "11px", color: "#FBBF24" }}>To Do</div>
            <div style={{ fontSize: "16px", fontWeight: "700", color: "#FBBF24" }}>{totalToDo}</div>
          </div>
          <div style={{ width: "1px", backgroundColor: "#2E2E42" }} />
          <div>
            <div style={{ fontSize: "11px", color: "#A78BFA" }}>Completed</div>
            <div style={{ fontSize: "16px", fontWeight: "700", color: "#A78BFA" }}>{overallPercentage}%</div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          {["All", "Solved", "To Do"].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              style={{
                backgroundColor: statusFilter === filter ? "#A78BFA" : "#161622",
                color: statusFilter === filter ? "#0D0D14" : "#9CA3AF",
                border: "1px solid #2E2E42",
                borderRadius: "8px",
                padding: "6px 14px",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              {filter}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "12px", color: "#9CA3AF" }}>Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              backgroundColor: "#161622",
              color: "#FFFFFF",
              border: "1px solid #2E2E42",
              borderRadius: "8px",
              padding: "6px 12px",
              fontSize: "12px",
              outline: "none",
              cursor: "pointer"
            }}
          >
            <option value="name">Alphabetical</option>
            <option value="count">Question Count</option>
            <option value="progress">Completion %</option>
          </select>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", backgroundColor: "#161622", border: "1px solid #2E2E42", borderRadius: "16px", padding: "28px" }}>
        {topicsData.map((topic) => {
  const isActive = activeTopic === topic.name;
  return (
    <button
      key={topic.name}
      onClick={() => setActiveTopic(topic.name)}
      className={`topic-grid-btn ${isActive ? "active" : ""}`}
      style={{
        border: "1px solid #2E2E42",
        borderRadius: "10px",
        padding: "12px 16px",
        fontSize: "14px",
        fontWeight: "500",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: "12px",
        transition: "all 0.2s ease",
      }}
    >
      <span>{topic.name}</span>
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <span style={{ fontSize: "11px", padding: "2px 6px", borderRadius: "6px" }}>{topic.count}</span>
        <span style={{ fontSize: "11px", fontWeight: "600", color: topic.percentage > 0 ? "#34D399" : "#6B7280" }}>{topic.percentage}%</span>
      </div>
    </button>
  );
})}
      </div>
    </div>
  );
}

export default DSATracker;
