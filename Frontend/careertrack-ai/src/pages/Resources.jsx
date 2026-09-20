import React, { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  Sparkles,
  Loader,
  Search,
  ExternalLink,
  Download,
  History,
  Clock,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import jsPDF from "jspdf";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

function Resources() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("Fetching history... Token present:", !!token);

      const response = await fetch(`${API_URL}/api/resources/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log("History API Response Data:", data);

      if (response.ok && data.success) {
        setHistory(data.data || []);
      } else {
        console.error("Failed to load history:", data.error);
      }
    } catch (err) {
      console.error("Network or parsing error while fetching history:", err);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError("");
    setResult("");

    try {
      const response = await fetch(`${API_URL}/api/resources/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ topic }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data.data);
        fetchHistory(); 
      } else {
        setError(data.error || "Failed to generate resources.");
      }
    } catch (err) {
      console.error("Error generating resources:", err);
      setError("Network error: Unable to connect to the AI service.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHistoryItem = (item) => {
    setTopic(item.topic);
    setResult(item.generatedContent);
    setShowHistory(false); 
  };

  const downloadPDF = () => {
    if (!result) return;

    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const maxLineWidth = pageWidth - margin * 2;

      pdf.setFont("Helvetica", "normal");
      pdf.setFontSize(11);

      const cleanText = result
        .replace(/#{1,6}\s?/g, "")
        .replace(/\*\*/g, "")
        .replace(/\*/g, "")
        .replace(/```[a-z]*\n?/g, "");

      const lines = pdf.splitTextToSize(cleanText, maxLineWidth);

      let cursorY = margin;
      const lineHeight = 6;

      pdf.setFont("Helvetica", "bold");
      pdf.setFontSize(16);
      pdf.text(`${topic.toUpperCase()} - STUDY NOTES`, margin, cursorY);

      cursorY += 12;
      pdf.setFont("Helvetica", "normal");
      pdf.setFontSize(10);

      for (let i = 0; i < lines.length; i++) {
        if (cursorY > pageHeight - margin) {
          pdf.addPage();
          cursorY = margin;
        }
        pdf.text(lines[i], margin, cursorY);
        cursorY += lineHeight;
      }

      pdf.save(`${topic.toLowerCase().replace(/\s+/g, "-")}-study-notes.pdf`);
    } catch (err) {
      console.error("Error generating lightweight PDF:", err);
      alert("Failed to download PDF.");
    }
  };

  const notesPart = result.includes("# 2. Recommended References")
    ? result.split("# 2. Recommended References")[0]
    : result;

  const referencesPart = result.includes("# 2. Recommended References")
    ? "# 2. Recommended References" +
      result.split("# 2. Recommended References")[1]
    : "";

  return (
    <div
      style={{
        padding: "32px",
        maxWidth: "1100px",
        margin: "0 auto",
        boxSizing: "border-box",
      }}
    >
      {/* Header Section with History Toggle Button */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "32px",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "700",
              color: "#F9FAFB",
              margin: "0 0 6px 0",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <BookOpen color="#A78BFA" size={28} /> AI Notes & Book Finder
          </h2>
          <p style={{ fontSize: "14px", color: "#9CA3AF", margin: 0 }}>
            Generate comprehensive multi-page study notes, direct reference
            links, and downloadable resources for any topic.
          </p>
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          style={{
            backgroundColor: showHistory ? "#7C3AED" : "#7C3AED",
            color: "#F9FAFB",
            border: "1px solid #374151",
            borderRadius: "10px",
            padding: "10px 16px",
            fontSize: "13px",
            fontWeight: "600",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            whiteSpace: "nowrap",
            flexShrink: 0,
            transition: "all 0.2s ease",
          }}
        >
          <History size={16} />{" "}
          {showHistory ? "Hide History" : `Past Searches (${history.length})`}
        </button>
      </div>

      {/* History Drawer Panel */}
      {showHistory && (
        <div
          style={{
            ...cardStyle,
            marginBottom: "24px",
            backgroundColor: "#1F2937",
            border: "1px solid #5f6369",
          }}
        >
          <h3
            style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "#FFF",
              margin: "0 0 12px 0",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Clock color="#7C3AED" size={18} /> Your Generated Notes History
          </h3>
          {history.length === 0 ? (
            <p style={{ fontSize: "13px", color: "#6B7280", margin: 0 }}>
              No past searches found yet. Generate your first topic above!
            </p>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                maxHeight: "250px",
                overflowY: "auto",
              }}
            >
              {history.map((item) => (
                <div
                  key={item._id}
                  onClick={() => handleSelectHistoryItem(item)}
                  style={{
                    padding: "10px 14px",
                    backgroundColor: "#111827",
                    border: "1px solid #545860",
                    borderRadius: "8px",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = "#7C3AED")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor = "#E5E7EB")
                  }
                >
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#FFF",
                    }}
                  >
                    {item.topic}
                  </span>
                  <span style={{ fontSize: "12px", color: "#9CA3AF" }}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quick Links Toolbar */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        <a
          href="https://leetcode.com"
          target="_blank"
          rel="noopener noreferrer"
          style={quickLinkStyle}
        >
          LeetCode <ExternalLink size={13} />
        </a>
        <a
          href="https://neetcode.io"
          target="_blank"
          rel="noopener noreferrer"
          style={quickLinkStyle}
        >
          NeetCode.io <ExternalLink size={13} />
        </a>
        <a
          href="https://www.geeksforgeeks.org"
          target="_blank"
          rel="noopener noreferrer"
          style={quickLinkStyle}
        >
          GeeksforGeeks <ExternalLink size={13} />
        </a>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          style={quickLinkStyle}
        >
          GitHub Repos <ExternalLink size={13} />
        </a>
      </div>

      {/* Search/Input Section */}
      <div style={cardStyle}>
        <form
          onSubmit={handleGenerate}
          style={{ display: "flex", gap: "12px", alignItems: "center" }}
        >
          <div style={{ position: "relative", flex: 1 }}>
            <Search
              size={18}
              color="#9CA3AF"
              style={{
                position: "absolute",
                left: "16px",
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />
            <input
              type="text"
              placeholder="e.g., 'Dijkstra's Algorithm', 'Event Loop', or 'Dynamic Programming'"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              style={{
                width: "100%",
                padding: "14px 14px 14px 48px",
                backgroundColor: "#111827",
                border: "1px solid #D1D5DB",
                borderRadius: "12px",
                color: "#FFFFFF",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box",
              }}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading || !topic.trim()}
            style={{
              backgroundColor: loading || !topic.trim() ? "#C4B5FD" : "#7C3AED",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "12px",
              padding: "14px 24px",
              fontWeight: "600",
              fontSize: "14px",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              cursor: loading || !topic.trim() ? "not-allowed" : "pointer",
              boxShadow:
                loading || !topic.trim()
                  ? "none"
                  : "0px 4px 12px rgba(124, 58, 237, 0.3)",
              whiteSpace: "nowrap",
              flexShrink: 0,
              transition: "all 0.2s ease",
            }}
          >
            {loading ? (
              <Loader className="spinner" size={16} />
            ) : (
              <Sparkles size={16} />
            )}
            {loading ? "Generating..." : "Generate Resources"}
          </button>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div
          style={{
            marginTop: "24px",
            padding: "16px",
            backgroundColor: "#FEF2F2",
            border: "1px solid #FCA5A5",
            borderRadius: "10px",
            color: "#EF4444",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}

      {/* Output Section with PDF Export Action */}
      {result && (
        <div style={{ marginTop: "24px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: "10px",
            }}
          >
            <button
              onClick={downloadPDF}
              style={{
                backgroundColor: "#111827",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "8px",
                padding: "8px 16px",
                fontSize: "13px",
                fontWeight: "600",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
                boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <Download color="#A78BFA" size={15} /> Download Complete Notes
              (PDF)
            </button>
          </div>

          {/* Core Deep Study Notes Card */}
          <div
            ref={contentRef}
            style={{
              ...cardStyle,
              padding: "32px",
              backgroundColor: "#1F2937",
              color: "#F9FAFB",
              marginBottom: "20px",
            }}
          >
            <div
              className="markdown-body"
              style={{ color: "#D1D5DB", lineHeight: "1.7", fontSize: "15px" }}
            >
              <ReactMarkdown>{notesPart}</ReactMarkdown>
            </div>
          </div>

          {/* Isolated Bottom Reference & Live Link Section */}
          {referencesPart && (
            <div
              style={{
                ...cardStyle,
                padding: "24px",
                backgroundColor: "#1F2937",
                border: "1px dashed #374151",
              }}
            >
              <h4
                style={{
                  margin: "0 0 12px 0",
                  color: "#F9FAFB",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <ExternalLink color="#A78BFA" size={18} /> Recommended
                References, Books & Live Articles
              </h4>
              <p
                style={{
                  fontSize: "13px",
                  color: "#9CA3AF",
                  marginBottom: "16px",
                }}
              >
                Click any live reference or book source below to explore
                external documentation and deepen your mastery:
              </p>
              <div
                className="markdown-body"
                style={{ color: "#D1D5DB", fontSize: "14px" }}
              >
                <ReactMarkdown
                  components={{
                    a: ({ node, ...props }) => (
                      <a
                        {...props}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "#A78BFA",
                          textDecoration: "underline",
                          fontWeight: "500",
                        }}
                      />
                    ),
                  }}
                >
                  {referencesPart}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!result && !loading && !error && (
        <div
          style={{ textAlign: "center", padding: "64px 0", color: "#9CA3AF" }}
        >
          <BookOpen
            size={48}
            color="#D1D5DB"
            style={{ margin: "0 auto 16px auto", display: "block" }}
          />
          <p style={{ fontSize: "15px", fontWeight: "500", color: "#4B5563" }}>
            What would you like to master today?
          </p>
          <p style={{ fontSize: "13px", marginTop: "4px" }}>
            Enter a topic above to generate masterclass notes, live links, and
            exportable PDFs.
          </p>
        </div>
      )}

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .spinner { animation: spin 1s linear infinite; }
        .markdown-body h1, .markdown-body h2, .markdown-body h3 { color: #F9FAFB; margin-top: 1.5em; margin-bottom: 0.5em; font-weight: 600; }
        .markdown-body h2 { border-bottom: 1px solid #374151; padding-bottom: 8px; }
        .markdown-body p { margin-bottom: 1em; color: #D1D5DB; }
        .markdown-body ul, .markdown-body ol { margin-bottom: 1em; padding-left: 24px; color: #D1D5DB; }
        .markdown-body li { margin-bottom: 0.5em; }
        .markdown-body strong { color: #A78BFA; }
        .markdown-body code { background-color: #111827; padding: 2px 6px; border-radius: 4px; font-family: monospace; color: #F87171; border: 1px solid #374151; }

        /* --- Elegant Print & PDF Styles --- */
        @media print {
          body {
            font-family: 'Inter', -apple-system, sans-serif;
            color: #111827;
            background-color: #FFFFFF;
            line-height: 1.6;
          }
          pre, blockquote, table, .card {
            page-break-inside: avoid;
          }
          h1, h2, h3 {
            page-break-after: avoid;
            color: #111827;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 16px 0;
            font-size: 13px;
          }
          th, td {
            border: 1px solid #E5E7EB;
            padding: 8px 12px;
            text-align: left;
          }
          th {
            background-color: #F3F4F6;
            font-weight: 600;
          }
        }
      `}</style>
    </div>
  );
}

const cardStyle = {
  backgroundColor: "#1F2937",
  border: "1px solid #374151",
  borderRadius: "16px",
  padding: "24px",
  boxShadow: "0px 4px 6px -1px rgba(0, 0, 0, 0.2)",
  boxSizing: "border-box",
};

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  backgroundColor: "#111827",
  border: "1px solid #374151",
  borderRadius: "10px",
  color: "#F9FAFB",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
};

const quickLinkStyle = {
  backgroundColor: "#1F2937",
  color: "#D1D5DB",
  padding: "6px 12px",
  borderRadius: "8px",
  fontSize: "12px",
  fontWeight: "600",
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  gap: "5px",
  border: "1px solid #374151",
  transition: "all 0.2s ease",
};

export default Resources;
