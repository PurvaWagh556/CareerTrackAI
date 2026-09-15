import React, { useState, useEffect } from "react";
import { FaShareAlt, FaLinkedinIn, FaInstagram, FaWhatsapp, FaCopy, FaCheck, FaTimes, FaEdit } from "react-icons/fa";
import "./ProfileHeader.css";

function ProfileHeader({ profile, onEditClick }) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [currentPic, setCurrentPic] = useState(profile?.profilePic || "");

  const profileUrl = window.location.href;
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  useEffect(() => {
    if (profile?.profilePic) {
      setCurrentPic(profile.profilePic);
    }
  }, [profile]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getInitials = (name) => {
    if (!name) return "PW";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const fullName = profile?.fullName || profile?.username || "Purva Wagh";
  const headline = profile?.headline || "Computer Engineering Student & Developer";
  const location = profile?.location || "Nagpur, India";
  const initials = getInitials(fullName);

  const getImageSrc = () => {
    if (!currentPic) return "";
    if (currentPic.startsWith("http") || currentPic.startsWith("blob:") || currentPic.startsWith("data:")) {
      return currentPic;
    }
    return `${API_URL}/${currentPic}`;
  };

  return (
    <div style={styles.headerCard}>
      <div style={styles.userInfo}>
        <div style={styles.avatarContainer}>
          {currentPic ? (
            <img 
              src={getImageSrc()} 
              alt="Profile Avatar" 
              style={styles.avatarImg}
            />
          ) : (
            <div style={styles.avatarInitials}>{initials}</div>
          )}
        </div>
        <div>
          <h2 style={styles.name}>{fullName}</h2>
          <p style={styles.title}>{headline}</p>
          <span style={styles.location}>📍 {location}</span>
        </div>
      </div>

      <div style={styles.actionButtons}>
        <button style={styles.editBtn} onClick={onEditClick}>
          <FaEdit size={14} /> Edit Profile
        </button>
        <button className="share-profile-btn" style={styles.shareBtn} onClick={() => setShowShareModal(true)}>
          <FaShareAlt size={14} /> Share Profile
        </button>
      </div>

      {showShareModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h4 style={{ margin: 0, color: "#ffffff", fontSize: "16px" }}>Share Profile</h4>
              <button onClick={() => setShowShareModal(false)} style={styles.closeBtn}>
                <FaTimes size={14} />
              </button>
            </div>
            <p style={styles.modalSub}>Spread your developer portfolio across your network.</p>

            <div style={styles.platformGrid}>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...styles.platformCard, backgroundColor: "#0077b5" }}
              >
                <FaLinkedinIn size={18} color="#ffffff" />
                <span style={styles.platformText}>LinkedIn</span>
              </a>

              <a
                href={`https://www.instagram.com/`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...styles.platformCard, background: "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)" }}
              >
                <FaInstagram size={18} color="#ffffff" />
                <span style={styles.platformText}>Instagram</span>
              </a>

              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent("Check out my developer profile: " + profileUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...styles.platformCard, backgroundColor: "#25d366" }}
              >
                <FaWhatsapp size={18} color="#ffffff" />
                <span style={styles.platformText}>WhatsApp</span>
              </a>
            </div>

            <div style={styles.copyBox}>
              <input type="text" readOnly value={profileUrl} style={styles.copyInput} />
              <button onClick={handleCopyLink} style={styles.copyActionBtn}>
                {copied ? <><FaCheck color="#10b981" /> Copied!</> : <><FaCopy /> Copy Link</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  headerCard: {
    backgroundColor: "#12131a",
    border: "1px solid #2a2d3d",
    borderRadius: "16px",
    padding: "24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "20px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
    boxSizing: "border-box",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  avatarContainer: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    overflow: "hidden",
    flexShrink: 0,
    border: "2px solid #7C3AED",
    backgroundColor: "#1a1c29",
  },
  avatarImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  avatarInitials: {
    width: "100%",
    height: "100%",
    backgroundColor: "#7C3AED",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    fontWeight: "bold",
  },
  name: {
    margin: 0,
    fontSize: "22px",
    fontWeight: "700",
    color: "#ffffff",
  },
  title: {
    margin: "4px 0",
    color: "#9ca3af",
    fontSize: "13px",
  },
  location: {
    fontSize: "12px",
    color: "#6b7280",
  },
  actionButtons: {
    display: "flex",
    gap: "12px",
  },
  editBtn: {
    backgroundColor: "#1a1c29",
    border: "1px solid #2a2d3d",
    color: "#ffffff",
    padding: "10px 16px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  shareBtn: {
    backgroundColor: "#7C3AED",
    border: "none",
    color: "#ffffff",
    padding: "10px 18px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    boxShadow: "0 4px 12px rgba(124, 58, 237, 0.4)",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modalCard: {
    width: "380px",
    backgroundColor: "#12131a",
    border: "1px solid #2a2d3d",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 25px 50px rgba(0,0,0,0.6)",
    boxSizing: "border-box",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "6px",
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: "#9ca3af",
  },
  modalSub: {
    fontSize: "12px",
    color: "#9ca3af",
    marginBottom: "20px",
  },
  platformGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "20px",
  },
  platformCard: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    padding: "10px",
    borderRadius: "10px",
    color: "#ffffff",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "600",
    transition: "opacity 0.2s",
  },
  platformText: {
    color: "#ffffff",
  },
  copyBox: {
    display: "flex",
    backgroundColor: "#1a1c29",
    border: "1px solid #2a2d3d",
    borderRadius: "10px",
    overflow: "hidden",
    padding: "4px",
  },
  copyInput: {
    flex: 1,
    backgroundColor: "transparent",
    border: "none",
    color: "#9ca3af",
    fontSize: "12px",
    padding: "8px",
    outline: "none",
  },
  copyActionBtn: {
    backgroundColor: "#7C3AED",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    padding: "6px 12px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
};

export default ProfileHeader;