import React, { useState, useEffect } from "react";
import { Terminal, Code2, X, Sparkles, ExternalLink, Search } from "lucide-react";

const getDocumentationLink = (name) => {
  const lower = name.toLowerCase().trim();
  
  if (lower === "python") return "https://docs.python.org/3/";
  if (lower === "java" || lower.includes("java language")) return "https://dev.java/learn/";
  if (lower === "c++") return "https://en.cppreference.com/w/";
  if (lower === "javascript" || lower === "js") return "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide";
  if (lower === "c") return "https://en.cppreference.com/w/c";
  if (lower.includes("html") || lower.includes("css")) return "https://developer.mozilla.org/en-US/docs/Web/HTML";
  if (lower.includes("git")) return "https://git-scm.com/doc";
  if (lower.includes("oop")) return "https://www.geeksforgeeks.org/object-oriented-programming-in-cpp/";
  if (lower === "react") return "https://react.dev/learn";
  if (lower === "node.js" || lower === "node") return "https://nodejs.org/en/docs";
  if (lower === "express.js" || lower === "express") return "https://expressjs.com/";
  if (lower === "typescript") return "https://www.typescriptlang.org/docs/";
  if (lower === "mongodb") return "https://www.mongodb.com/docs/";
  if (lower.includes("sql") && !lower.includes("mysql") && !lower.includes("postgre")) return "https://dev.mysql.com/doc/";
  if (lower === "mysql") return "https://dev.mysql.com/doc/";
  if (lower === "postgresql") return "https://www.postgresql.org/docs/";
  if (lower === "redis") return "https://redis.io/docs/";
  if (lower === "graphql") return "https://graphql.org/learn/";
  if (lower.includes("rest api")) return "https://restfulapi.net/";
  if (lower === "docker") return "https://docs.docker.com/";
  if (lower === "kubernetes") return "https://kubernetes.io/docs/";
  if (lower === "aws") return "https://docs.aws.amazon.com/";
  if (lower === "azure") return "https://learn.microsoft.com/en-us/azure/";
  if (lower === "gcp") return "https://cloud.google.com/docs";
  if (lower.includes("ci/cd")) return "https://docs.gitlab.com/ci/";
  if (lower === "linux") return "https://www.kernel.org/doc/html/latest/";
  if (lower.includes("dsa") || lower.includes("data structures")) return "https://leetcode.com/explore/";
  if (lower === "machine learning") return "https://scikit-learn.org/stable/user_guide.html";
  if (lower === "artificial intelligence") return "https://ai.meta.com/research/";
  if (lower === "deep learning") return "https://www.deeplearning.ai/resources/";
  if (lower === "tensorflow") return "https://www.tensorflow.org/learn";
  if (lower === "pytorch") return "https://pytorch.org/docs/stable/index.html";
  if (lower === "data science") return "https://www.datacamp.com/tutorial";
  if (lower === "cybersecurity") return "https://owasp.org/www-project-top-ten/";
  if (lower === "tailwind css") return "https://tailwindcss.com/docs";
  if (lower === "next.js") return "https://nextjs.org/docs";
  if (lower === "vue.js" || lower === "vue") return "https://vuejs.org/guide/introduction.html";
  if (lower === "angular") return "https://angular.io/docs";
  if (lower === "spring boot") return "https://spring.io/guides";
  if (lower === "flask") return "https://flask.palletsprojects.com/";
  if (lower === "django") return "https://docs.djangoproject.com/";
  if (lower === "c#") return "https://learn.microsoft.com/en-us/dotnet/csharp/";
  if (lower === "go") return "https://golang.org/doc/";
  if (lower === "rust") return "https://doc.rust-lang.org/book/";
  if (lower === "ruby") return "https://www.ruby-lang.org/en/documentation/";
  if (lower === "php") return "https://www.php.net/manual/en/";
  if (lower === "swift") return "https://swift.org/documentation/";
  if (lower === "kotlin") return "https://kotlinlang.org/docs/home.html";
  if (lower === "scala") return "https://docs.scala-lang.org/";
  if (lower === "r") return "https://cran.r-project.org/manuals.html";
  return `https://www.google.com/search?q=${encodeURIComponent(name + " official documentation guide")}`;
};

function SkillsOverview() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  useEffect(() => {
    const fetchSkills = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch(`${API_URL}/api/skills`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setSkills(data.skills || []);
        }
      } catch (err) {
        console.error("Error loading profile skills:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  const filteredModalSkills = skills.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div style={{ color: "#9CA3AF", padding: "20px", textAlign: "center" }}>Loading your skills hub...</div>;
  }

  return (
    <>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #13101E;
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #2E2E42;
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #7C3AED;
        }
      `}</style>

      <div style={{ backgroundColor: "#161622", border: "1px solid #2E2E42", borderRadius: "16px", padding: "24px", color: "#FFFFFF" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>Skills & Documentation Hub</h3>
          <button 
            onClick={() => setIsModalOpen(true)}
            style={{ background: "#2E2E42", border: "none", color: "#A78BFA", padding: "6px 14px", borderRadius: "8px", fontSize: "12px", cursor: "pointer", fontWeight: "600" }}
          >
            View All ({skills.length})
          </button>
        </div>

        {skills.length === 0 ? (
          <div style={{ color: "#9CA3AF", fontSize: "13px", textAlign: "center", padding: "20px 0" }}>
            No skills found in profile.
          </div>
        ) : (
          <div 
            style={{ 
              display: "flex", 
              flexDirection: "column", 
              gap: "10px", 
              maxHeight: "260px", 
              overflowY: "auto", 
              paddingRight: "6px" 
            }}
            className="custom-scrollbar"
          >
            {skills.slice(0, 6).map((skill, index) => (
              <a 
                key={index} 
                href={getDocumentationLink(skill.name)} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "space-between", 
                  backgroundColor: "#13101E", 
                  border: "1px solid #2E2E42", 
                  borderRadius: "10px", 
                  padding: "10px 14px",
                  textDecoration: "none",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = "#7C3AED"}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = "#2E2E42"}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "10px", color: "#FFFFFF", fontWeight: "500", fontSize: "13px" }}>
                  {skill.icon === "Terminal" ? <Terminal size={15} color="#A78BFA" /> : <Code2 size={15} color="#34D399" />}
                  {skill.name}
                </span>
                <span style={{ fontSize: "11px", color: "#A78BFA", background: "#1F1F2E", padding: "3px 8px", borderRadius: "6px", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                  Docs <ExternalLink size={11} />
                </span>
              </a>
            ))}
            {skills.length > 6 && (
              <button 
                onClick={() => setIsModalOpen(true)}
                style={{ background: "transparent", border: "1px dashed #2E2E42", color: "#9CA3AF", padding: "10px", borderRadius: "10px", fontSize: "12px", cursor: "pointer", textAlign: "center", fontWeight: "500" }}
              >
                + {skills.length - 6} more skills (Click to view full catalog)
              </button>
            )}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0, 0, 0, 0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(6px)", padding: "20px" }}>
          <div style={{ backgroundColor: "#161622", border: "1px solid #2E2E42", borderRadius: "16px", padding: "24px", width: "100%", maxWidth: "650px", maxHeight: "85vh", display: "flex", flexDirection: "column", boxShadow: "0px 20px 40px rgba(0,0,0,0.6)", boxSizing: "border-box" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Sparkles size={18} color="#A78BFA" />
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "#FFFFFF" }}>Complete Skills & Documentation Catalog ({skills.length})</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "#9CA3AF", cursor: "pointer", padding: "4px" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ position: "relative", marginBottom: "16px" }}>
              <Search size={16} color="#9CA3AF" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
              <input 
                type="text"
                placeholder="Search across your profile skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  backgroundColor: "#13101E",
                  border: "1px solid #2E2E42",
                  borderRadius: "10px",
                  padding: "10px 10px 10px 38px",
                  color: "#FFFFFF",
                  fontSize: "13px",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "10px", overflowY: "auto", paddingRight: "4px", flex: 1 }} className="custom-scrollbar">
              {filteredModalSkills.map((skill, index) => (
                <a 
                  key={index} 
                  href={getDocumentationLink(skill.name)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ backgroundColor: "#13101E", border: "1px solid #2E2E42", borderRadius: "10px", padding: "10px 12px", color: "#D1D5DB", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "space-between", textDecoration: "none", transition: "all 0.2s ease" }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = "#7C3AED"}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = "#2E2E42"}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "6px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {skill.icon === "Terminal" ? <Terminal size={13} color="#A78BFA" /> : <Code2 size={13} color="#34D399" />}
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{skill.name}</span>
                  </span>
                  <ExternalLink size={11} color="#A78BFA" style={{ flexShrink: 0 }} />
                </a>
              ))}
              {filteredModalSkills.length === 0 && (
                <div style={{ color: "#9CA3AF", fontSize: "13px", textAlign: "center", gridColumn: "1 / -1", padding: "20px" }}>
                  No matching skills found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SkillsOverview;