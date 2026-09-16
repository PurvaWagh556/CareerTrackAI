import React, { useState } from "react";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

function ProfilePhotoSelector({ currentPic, onSelect }) {
  const [preview, setPreview] = useState(currentPic || localStorage.getItem("profilePic") || "");


  const handleSelectAvatar = async (avatarPath) => {
    setPreview(avatarPath);
    localStorage.setItem("profilePic", avatarPath);
    if (onSelect) onSelect(avatarPath);
    window.dispatchEvent(new Event("profilePicUpdated"));

    const token = localStorage.getItem("token");
    try {
      await fetch(`${API_URL}/api/profile/select-avatar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ avatarUrl: avatarPath })
      });
    } catch (err) {
      console.error("Error saving avatar:", err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profilePic", file);

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/api/profile/photo`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        const fullPath = `${API_URL}/${data.profilePic}`;
        setPreview(fullPath);
        localStorage.setItem("profilePic", fullPath);
        if (onSelect) onSelect(data.profilePic);
        window.dispatchEvent(new Event("profilePicUpdated"));
      }
    } catch (err) {
      console.error("Error uploading photo:", err);
    }
  };

  const presetAvatars = [
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Lily",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Noah",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Mason",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver"
  ];

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Profile Photo</h3>
      <p style={styles.subtitle}>Update your profile photo or choose an avatar</p>

      <div style={styles.uploadRow}>
        <div style={styles.avatarCircle}>
          <img 
            src={preview || "https://api.dicebear.com/7.x/avataaars/svg?seed=Default"} 
            alt="Profile Preview" 
            style={styles.avatarImg} 
          />
        </div>

        <label style={styles.dropZone}>
          <input 
            type="file" 
            accept="image/*" 
            style={{ display: "none" }} 
            onChange={handleFileUpload} 
          />
          <span style={styles.uploadIcon}>⬆️</span>
          <span style={styles.uploadText}>Click to Upload or Drag & Drop</span>
        </label>
      </div>

      <p style={styles.dividerText}>Or choose an avatar</p>

      <div style={styles.avatarsGrid}>
        {presetAvatars.map((avatar, idx) => (
          <img
            key={idx}
            src={avatar}
            alt={`Preset Avatar ${idx + 1}`}
            style={styles.presetAvatarImg}
            onClick={() => handleSelectAvatar(avatar)}
          />
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: "#161821",
    border: "1px solid #2a2d3d",
    borderRadius: "16px",
    padding: "24px",
    color: "#ffffff",
    marginBottom: "24px",
    boxSizing: "border-box",
  },
  title: { fontSize: "18px", fontWeight: "700", color: "#ffffff", margin: "0 0 4px 0" },
  subtitle: { fontSize: "13px", color: "#9ca3af", marginBottom: "20px" },
  uploadRow: { display: "flex", alignItems: "center", gap: "20px", marginBottom: "20px" },
  avatarCircle: { 
    width: "80px", 
    height: "80px", 
    borderRadius: "50%", 
    overflow: "hidden", 
    flexShrink: 0, 
    border: "2px solid #7C3AED",
    backgroundColor: "#12131a"
  },
  avatarImg: { width: "100%", height: "100%", objectFit: "cover" },
  dropZone: {
    flex: 1,
    border: "2px dashed #7C3AED",
    borderRadius: "12px",
    padding: "20px",
    textAlign: "center",
    cursor: "pointer",
    backgroundColor: "#12131a",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
    transition: "background 0.2s",
  },
  uploadIcon: { fontSize: "18px" },
  uploadText: { fontSize: "13px", color: "#a78bfa", fontWeight: "600" },
  dividerText: { textAlign: "center", fontSize: "13px", color: "#9ca3af", marginBottom: "16px" },
  avatarsGrid: { 
    display: "flex", 
    flexWrap: "wrap", 
    justifyContent: "center", 
    gap: "12px",
    maxHeight: "140px",
    overflowY: "auto",
    padding: "4px"
  },
  presetAvatarImg: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    objectFit: "cover",
    cursor: "pointer",
    border: "2px solid #2a2d3d",
    backgroundColor: "#12131a",
    transition: "transform 0.2s, border-color 0.2s",
  }
};

export default ProfilePhotoSelector;