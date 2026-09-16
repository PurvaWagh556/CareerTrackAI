import React, { useState } from "react";
import "./Certificates.css";
import {
  Award,
  X,
  Search,
  ExternalLink,
  Plus,
  FileText,
  Trash2,
} from "lucide-react";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

function Certificates({ certificates = [], onCertificateAdded }) {
  const [isViewAllOpen, setIsViewAllOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [certToDelete, setCertToDelete] = useState(null);

  const [certName, setCertName] = useState("");
  const [certIssuer, setCertIssuer] = useState("");
  const [certFile, setCertFile] = useState(null);

  const handleAddCertificate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("name", certName);
    formData.append("issuer", certIssuer);
    if (certFile) {
      formData.append("certificatePdf", certFile);
    }

    try {
      const res = await fetch(`${API_URL}/api/certificates`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setCertName("");
        setCertIssuer("");
        setCertFile(null);
        setIsAddOpen(false);
        if (onCertificateAdded) onCertificateAdded(data.certificates);
      } else {
        alert("Failed to upload certificate file.");
      }
    } catch (err) {
      console.error("Error uploading certificate:", err);
      alert("Network error while uploading certificate.");
    }
  };

  const confirmDeleteCertificate = (certId) => {
    setCertToDelete(certId);
  };

  const handleDeleteConfirmed = async () => {
    if (!certToDelete) return;

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `${API_URL}/api/certificates/${certToDelete}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        if (onCertificateAdded) onCertificateAdded(data.certificates);
        setCertToDelete(null);
      } else {
        alert("Failed to delete certificate.");
      }
    } catch (err) {
      console.error("Error deleting certificate:", err);
      alert("Network error while deleting certificate.");
    }
  };

  const handleViewPdf = async (certId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch(
        `${API_URL}/api/certificates/view/${certId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to load certificate PDF");
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
    } catch (err) {
      console.error("Error viewing certificate:", err);
      alert("Could not open certificate PDF.");
    }
  };

  const displayCerts =
    certificates && certificates.length > 0 ? certificates : [];

  const filteredCerts = displayCerts.filter(
    (cert) =>
      cert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.issuer.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getViewUrl = (link) => {
    if (!link) return "#";
    const filename = link.split("/").pop();
    return `${API_URL}/api/certificates/view/${filename}`;
  };

  return (
    <div className="profile-card certificates-card">
      <div className="certificates-header-row">
        <div
          className="card-header-flex"
          style={{ backgroundColor: "transparent" }}
        >
          <Award size={18} className="card-icon certificates-icon" />
          <h3>Certificates</h3>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button className="add-btn" onClick={() => setIsAddOpen(true)} style={styles.addCertBtn}>
            <Plus size={14} /> Add PDF
          </button>
          {displayCerts.length > 0 && (
            <span
              className="view-all-link"
              onClick={() => setIsViewAllOpen(true)}
              style={{ cursor: "pointer" }}
            >
              View All →
            </span>
          )}
        </div>
      </div>

      <div className="certificates-grid">
        {displayCerts.length === 0 ? (
          <p
            style={{
              fontSize: "13px",
              color: "#9ca3af",
              gridColumn: "span 2",
              textAlign: "center",
              padding: "16px 0",
            }}
          >
            No certificates added yet. Upload your PDF achievements.
          </p>
        ) : (
          displayCerts.slice(0, 4).map((cert, index) => (
            <div
              className="cert-box"
              key={cert._id || index}
              style={{ position: "relative" }}
            >
              <div className="cert-info-top">
                <div
                  className="cert-badge-icon"
                  style={{
                    backgroundColor: "rgba(124, 58, 237, 0.15)",
                    color: "#7c3aed",
                  }}
                >
                  <Award size={18} />
                </div>
                <div className="cert-text">
                  <span className="cert-title">{cert.name}</span>
                  <span className="cert-issuer">{cert.issuer}</span>
                </div>
              </div>

              <button
                onClick={() => confirmDeleteCertificate(cert._id)}
                style={styles.deleteCertBtn}
                title="Delete certificate"
              >
                <Trash2 size={14} color="#9ca3af" />
              </button>

              {cert._id ? (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleViewPdf(cert._id);
                  }}
                  className="btn-view-cert"
                  style={{
                    textAlign: "center",
                    backgroundColor: "rgba(124, 58, 237, 0.1)",
                    border: "1px solid rgba(124, 58, 237, 0.2)",
                    color: "#A78BFA",
                    padding: "10px",
                    borderRadius: "8px",
                    fontWeight: "600",
                    fontSize: "13px",
                    width: "100%",
                    cursor: "pointer",
                    marginTop: "16px",
                  }}
                >
                  View Certificate
                </button>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    color: "#F87171",
                    fontSize: "13px",
                    marginTop: "16px",
                  }}
                >
                  No Document Attached
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {certToDelete && (
        <div style={overlayStyle}>
          <div style={modalBoxStyle}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "16px",
              }}
            >
              <div style={styles.warningCircle}>!</div>
              <h3 style={{ margin: 0, fontSize: "16px", color: "#ffffff" }}>
                Delete Certificate?
              </h3>
            </div>
            <p
              style={{
                fontSize: "13px",
                color: "#9ca3af",
                marginBottom: "24px",
                lineHeight: "1.5",
              }}
            >
              Are you sure you want to delete this certificate? This action
              cannot be undone.
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <button
                onClick={() => setCertToDelete(null)}
                style={cancelBtnStyle}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirmed}
                style={styles.confirmDeleteBtn}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {isAddOpen && (
        <div className="modal-overlay" style={overlayStyle}>
          <div className="modal-content-box" style={modalBoxStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#FFFFFF",
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Award size={20} color="#A78BFA" /> Upload Certificate PDF
              </h3>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#9CA3AF",
                  cursor: "pointer",
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleAddCertificate}
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              <div>
                <label style={labelStyle}>Certificate Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., AWS Cloud Practitioner"
                  value={certName}
                  onChange={(e) => setCertName(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Issuer / Date</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Issued Jun 2024"
                  value={certIssuer}
                  onChange={(e) => setCertIssuer(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>
                  <FileText size={14} /> Upload PDF File
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  required
                  onChange={(e) => setCertFile(e.target.files[0])}
                  style={{ ...inputStyle, padding: "8px", cursor: "pointer" }}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  style={cancelBtnStyle}
                >
                  Cancel
                </button>
                <button type="submit" style={submitBtnStyle}>
                  Upload & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isViewAllOpen && (
        <div className="modal-overlay" style={overlayStyle}>
          <div className="modal-content-box" style={modalBoxStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#FFFFFF",
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Award size={20} color="#A78BFA" /> All Earned Certificates (
                {displayCerts.length})
              </h3>
              <button
                type="button"
                onClick={() => setIsViewAllOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#9CA3AF",
                  cursor: "pointer",
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ position: "relative", marginBottom: "20px" }}>
              <Search
                size={16}
                color="#9CA3AF"
                style={{ position: "absolute", top: "14px", left: "14px" }}
              />
              <input
                type="text"
                placeholder="Search certificates or issuers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ ...inputStyle, paddingLeft: "40px" }}
              />
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                maxHeight: "360px",
                overflowY: "auto",
                paddingRight: "4px",
              }}
            >
              {filteredCerts.length > 0 ? (
                filteredCerts.map((cert, index) => (
                  <div
                    key={cert._id || index}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px 16px",
                      backgroundColor: "#0D0D14",
                      border: "1px solid #2E2E42",
                      borderRadius: "10px",
                    }}
                  >
                    <div>
                      <strong
                        style={{
                          color: "#FFFFFF",
                          fontSize: "14px",
                          display: "block",
                        }}
                      >
                        {cert.name}
                      </strong>
                      <span style={{ color: "#9CA3AF", fontSize: "12px" }}>
                        {cert.issuer}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      {cert._id && (
                        <button
                          onClick={() => handleViewPdf(cert._id)}
                          style={{
                            backgroundColor: "rgba(124, 58, 237, 0.2)",
                            color: "#A78BFA",
                            padding: "8px 12px",
                            borderRadius: "8px",
                            fontWeight: "600",
                            fontSize: "12px",
                            border: "none",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          View PDF <ExternalLink size={12} />
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setIsViewAllOpen(false);
                          confirmDeleteCertificate(cert._id);
                        }}
                        style={{
                          backgroundColor: "transparent",
                          border: "none",
                          color: "#9ca3af",
                          cursor: "pointer",
                          padding: "6px",
                          borderRadius: "6px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        title="Delete certificate"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p
                  style={{
                    textAlign: "center",
                    color: "#9CA3AF",
                    fontSize: "14px",
                    padding: "20px 0",
                  }}
                >
                  No certificates found.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  addCertBtn: {
    backgroundColor: "#7C3AED",
    border: "none",
    color: "#FFFFFF",
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
  },
  deleteCertBtn: {
    position: "absolute",
    top: "12px",
    right: "12px",
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "6px",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.2s",
  },
  confirmDeleteBtn: {
    flex: 1,
    backgroundColor: "#7C3AED",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "10px",
    padding: "12px",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
    boxShadow: "0px 4px 12px rgba(124, 58, 237, 0.3)",
  },
  warningCircle: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    backgroundColor: "#7C3AED",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: "14px",
  },
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
  maxWidth: "400px",
  boxShadow: "0px 25px 50px rgba(0,0,0,0.8)",
  boxSizing: "border-box",
};

const labelStyle = {
  fontSize: "13px",
  display: "block",
  marginBottom: "6px",
  color: "#9CA3AF",
  fontWeight: "500",
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

const cancelBtnStyle = {
  flex: 1,
  backgroundColor: "transparent",
  border: "1px solid #2E2E42",
  color: "#9CA3AF",
  borderRadius: "10px",
  padding: "12px",
  fontWeight: "600",
  fontSize: "14px",
  cursor: "pointer",
};

const submitBtnStyle = {
  flex: 1,
  backgroundColor: "#7C3AED",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "10px",
  padding: "12px",
  fontWeight: "600",
  fontSize: "14px",
  cursor: "pointer",
  boxShadow: "0px 4px 12px rgba(124, 58, 237, 0.3)",
};

export default Certificates;