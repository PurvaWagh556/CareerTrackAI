import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Award,
  AlertCircle,
  UploadCloud,
  Trash2,
  CheckCircle2,
} from "lucide-react";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

function Certifications() {
  const navigate = useNavigate();
  const [certificatesList, setCertificatesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [certToDelete, setCertToDelete] = useState(null);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      const data = await res.json();
      if (data && data.certificates) {
        setCertificatesList(data.certificates);
      }
    } catch (err) {
      console.error("Error fetching certificates:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!certToDelete) return;
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(
        `${API_URL}/api/certificates/${certToDelete}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setCertificatesList(data.certificates || []);
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
        navigate("/login");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/certificates/view/${certId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        navigate("/login");
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

  if (loading) {
    return (
      <div
        style={{
          padding: "60px",
          textAlign: "center",
          color: "#fff",
          fontFamily: "Inter, sans-serif",
        }}
      >
        Loading your credentials...
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "32px",
        width: "100%",
        boxSizing: "border-box",
        color: "#FFFFFF",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <button
        type="button"
        onClick={() => navigate(-1)}
        style={{
          backgroundColor: "transparent",
          border: "1px solid #2E2E42",
          color: "#9CA3AF",
          borderRadius: "8px",
          padding: "8px 16px",
          fontWeight: "600",
          fontSize: "13px",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "24px",
          transition: "all 0.2s ease",
        }}
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div style={{ marginBottom: "32px" }}>
        <h2
          style={{
            fontSize: "28px",
            fontWeight: "700",
            margin: "0 0 8px 0",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <Award size={28} color="#34D399" /> Professional Certifications
        </h2>
        <p style={{ fontSize: "14px", color: "#9CA3AF", margin: 0 }}>
          Track all your earned credentials, cloud badges, and technical completions.
        </p>
      </div>

      <div
        style={{
          ...cardStyle,
          marginBottom: "28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <span
            style={{
              fontSize: "13px",
              color: "#9CA3AF",
              display: "block",
              marginBottom: "4px",
            }}
          >
            Total Credentials Earned
          </span>
          <h3
            style={{
              fontSize: "36px",
              fontWeight: "700",
              margin: 0,
              color: "#FFFFFF",
            }}
          >
            {certificatesList.length}
          </h3>
        </div>
        <div>
          <span
            style={{
              fontSize: "13px",
              color: "#34D399",
              fontWeight: "600",
              backgroundColor: "rgba(52, 211, 153, 0.15)",
              padding: "6px 12px",
              borderRadius: "8px",
            }}
          >
            {certificatesList.length > 0
              ? "Synced with Profile"
              : "No Certifications Yet"}
          </span>
        </div>
      </div>

      {certificatesList.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "20px",
          }}
        >
          {certificatesList.map((cert, index) => (
            <div
              key={cert._id || index}
              style={{
                ...cardStyle,
                position: "relative",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "12px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      backgroundColor: "rgba(52, 211, 153, 0.15)",
                      color: "#34D399",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontWeight: "600",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <CheckCircle2 size={12} /> Verified
                  </span>

                  <button
                    onClick={() => setCertToDelete(cert._id)}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: "#9CA3AF",
                      padding: "4px",
                      borderRadius: "6px",
                    }}
                    title="Delete certificate"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#FFFFFF",
                    marginBottom: "6px",
                  }}
                >
                  {cert.name}
                </h3>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#A78BFA",
                    margin: "0 0 16px 0",
                    fontWeight: "500",
                  }}
                >
                  {cert.issuer || cert.year || "2023"}
                </p>
              </div>

              {cert._id ? (
                <button
                  onClick={() => handleViewPdf(cert._id)}
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
          ))}
        </div>
      ) : (
        <div
          style={{ ...cardStyle, textAlign: "center", padding: "60px 20px" }}
        >
          <AlertCircle
            size={48}
            color="#F87171"
            style={{ marginBottom: "16px" }}
          />
          <h3
            style={{
              fontSize: "20px",
              fontWeight: "600",
              marginBottom: "8px",
              color: "#FFFFFF",
            }}
          >
            No Certifications Uploaded
          </h3>
          <p
            style={{
              fontSize: "14px",
              color: "#9CA3AF",
              marginBottom: "24px",
              maxWidth: "400px",
              margin: "0 auto 24px auto",
            }}
          >
            You haven't added any professional certificates to your profile yet.
            Head over to your profile section to upload your credentials.
          </p>
          <button
            type="button"
            onClick={() => navigate("/profile")}
            style={{
              backgroundColor: "#7C3AED",
              border: "none",
              color: "#FFFFFF",
              borderRadius: "8px",
              padding: "10px 20px",
              fontWeight: "600",
              fontSize: "14px",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <UploadCloud size={16} /> Go to Profile to Upload
          </button>
        </div>
      )}

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
              <div style={warningCircleStyle}>!</div>
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
              Are you sure you want to delete this certificate? This action cannot
              be undone.
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <button onClick={() => setCertToDelete(null)} style={cancelBtnStyle}>
                Cancel
              </button>
              <button onClick={handleDeleteConfirmed} style={confirmBtnStyle}>
                Delete
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
  maxWidth: "400px",
  boxShadow: "0px 25px 50px rgba(0,0,0,0.8)",
  boxSizing: "border-box",
};

const warningCircleStyle = {
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
};

const cancelBtnStyle = {
  flex: 1,
  backgroundColor: "transparent",
  border: "1px solid #2E2E42",
  color: "#9CA3AF",
  borderRadius: "10px",
  padding: "10px",
  fontWeight: "600",
  fontSize: "13px",
  cursor: "pointer",
};

const confirmBtnStyle = {
  flex: 1,
  backgroundColor: "#7C3AED",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "10px",
  padding: "10px",
  fontWeight: "600",
  fontSize: "13px",
  cursor: "pointer",
  boxShadow: "0px 4px 12px rgba(124, 58, 237, 0.3)",
};

export default Certifications;