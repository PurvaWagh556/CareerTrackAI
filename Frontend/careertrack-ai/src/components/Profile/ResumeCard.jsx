import React, { useState, useRef, useEffect } from "react";
import { FaFilePdf, FaCloudUploadAlt, FaDownload } from "react-icons/fa";

function ResumeCard() {
  const [resume, setResume] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${API_URL}/api/resume`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          if (data.fileUrl) {
            setResume(data);
          } else if (data.resume && data.resume.fileUrl) {
            setResume(data.resume);
          }
        }
      })
      .catch((err) => console.error("Error fetching resume:", err));
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("resume", file);

    const token = localStorage.getItem("token");
    setUploading(true);

    try {
      const res = await fetch(`${API_URL}/api/resume/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        const uploadedData = data.resume || data;
        if (uploadedData && uploadedData.fileUrl) {
          setResume(uploadedData);
        }
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/api/resume/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to download file");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = resume?.fileName || "Resume.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
    }
  };

  return (
    <div className="profile-card resume-card-container">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
        accept=".pdf,.doc,.docx"
      />

      <div style={styles.header}>
        <div style={styles.titleWrapper}>
          <FaFilePdf size={18} color="#c084fc" />
          <span className="resume-title-text" style={styles.title}>Resume</span>
        </div>

        <button
          className="resume-action-btn"
          style={styles.headerActionBtn}
          onClick={() => fileInputRef.current.click()}
          disabled={uploading}
        >
          <FaCloudUploadAlt size={14} />
          {uploading
            ? "Uploading..."
            : resume
              ? "Update Resume"
              : "Upload Resume"}
        </button>
      </div>

      {resume ? (
        <div className="resume-file-card" style={styles.fileCard}>
          <div style={styles.fileInfoRow}>
            <div className="resume-icon-box" style={styles.fileIconBox}>
              <FaFilePdf size={20} color="#f43f5e" />
            </div>
            <div>
              <div className="resume-file-name" style={styles.fileName}>
                {resume.fileName || "Resume.pdf"}
              </div>
              <div className="resume-file-sub" style={styles.fileSub}>
                Uploaded on {resume.uploadDate || "Today"} •{" "}
                {resume.size || "2 MB"}
              </div>
            </div>
          </div>

          <button onClick={handleDownload} className="resume-download-btn" style={styles.downloadBtn}>
            <FaDownload size={14} /> Download Resume
          </button>
        </div>
      ) : (
        <div
          className="resume-empty-state"
          style={styles.emptyStateContainer}
          onClick={() => fileInputRef.current.click()}
        >
          <FaCloudUploadAlt
            size={32}
            color="#7C3AED"
            style={{ marginBottom: "8px" }}
          />
          <p className="resume-empty-text" style={styles.emptyText}>No resume uploaded yet</p>
          <span className="resume-empty-sub" style={styles.emptySubText}>
            Click here to browse and upload your PDF resume
          </span>
        </div>
      )}
    </div>
  );
}

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  titleWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  title: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#ffffff",
  },
  headerActionBtn: {
    backgroundColor: "#1a1c29",
    border: "1px solid #2a2d3d",
    color: "#c084fc",
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  fileCard: {
    backgroundColor: "#1a1c29",
    border: "1px solid #2a2d3d",
    borderRadius: "12px",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  fileInfoRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  fileIconBox: {
    width: "40px",
    height: "40px",
    borderRadius: "8px",
    backgroundColor: "rgba(42, 45, 61, 0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #2a2d3d",
  },
  fileName: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#ffffff",
  },
  fileSub: {
    fontSize: "11px",
    color: "#9ca3af",
    marginTop: "2px",
  },
  downloadBtn: {
    backgroundColor: "#12131a",
    border: "1px solid #2a2d3d",
    color: "#ffffff",
    padding: "10px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    textAlign: "center",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    cursor: "pointer",
  },
  emptyStateContainer: {
    border: "2px dashed #2a2d3d",
    borderRadius: "12px",
    padding: "24px",
    textAlign: "center",
    cursor: "pointer",
    backgroundColor: "rgba(26, 28, 41, 0.25)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#ffffff",
    margin: "0 0 4px 0",
  },
  emptySubText: {
    fontSize: "11px",
    color: "#9ca3af",
    margin: 0,
  },
};

export default ResumeCard;