import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Lock,
  Eye,
  EyeOff,
  ShieldAlert,
  KeyRound,
} from "lucide-react";
import "./Settings.css";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

function Settings() {
  const navigate = useNavigate();

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState({ type: "", text: "" });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!passwords.currentPassword) {
      setMessage({ type: "error", text: "Please enter your current password." });
      return;
    }
    if (!passwords.newPassword) {
      setMessage({ type: "error", text: "Please enter a new password." });
      return;
    }
    if (passwords.newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "New password must be at least 6 characters long.",
      });
      return;
    }
    if (passwords.currentPassword === passwords.newPassword) {
      setMessage({
        type: "error",
        text: "New password cannot be identical to your current password.",
      });
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage({
        type: "error",
        text: "New password and confirmation password do not match.",
      });
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/user/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update password.");
      }

      setMessage({ type: "success", text: "Password updated successfully." });
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error("Password change error:", err);
      setMessage({
        type: "error",
        text: err.message || "Network error while changing password.",
      });
    }
  };

  const handleDeleteAccount = async () => {
  const confirmDelete = window.confirm("Are you sure you want to delete your account? This action cannot be undone!");
  if (!confirmDelete) return;

  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/user/account`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (data.success) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    } else {
      alert(data.error || "Failed to delete account");
    }
  } catch (err) {
    console.error("Error deleting account:", err);
  }
};

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h2>Settings</h2>
        <p>Manage your account security credentials and account lifecycle.</p>
      </div>

      {message.text && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "20px",
            backgroundColor:
              message.type === "error"
                ? "rgba(239, 68, 68, 0.1)"
                : "rgba(34, 197, 94, 0.1)",
            border: `1px solid ${
              message.type === "error"
                ? "rgba(239, 68, 68, 0.3)"
                : "rgba(34, 197, 94, 0.3)"
            }`,
            color: message.type === "error" ? "#EF4444" : "#22C55E",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSavePassword} className="settings-form">
        <div className="settings-card">
          <div className="card-section-header">
            <Lock size={20} color="#C084FC" />
            <h3>Change Password</h3>
          </div>

          <div className="form-group">
            <label>Current Password</label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <input
                type={showCurrentPassword ? "text" : "password"}
                name="currentPassword"
                placeholder="Enter current password"
                value={passwords.currentPassword}
                onChange={handlePasswordChange}
                style={{ width: "100%", paddingRight: "40px" }}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  background: "transparent",
                  border: "none",
                  color: "#9CA3AF",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>New Password</label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <input
                type={showNewPassword ? "text" : "password"}
                name="newPassword"
                placeholder="Minimum 6 characters"
                value={passwords.newPassword}
                onChange={handlePasswordChange}
                style={{ width: "100%", paddingRight: "40px" }}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  background: "transparent",
                  border: "none",
                  color: "#9CA3AF",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Confirm New Password</label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Re-enter new password"
                value={passwords.confirmPassword}
                onChange={handlePasswordChange}
                style={{ width: "100%", paddingRight: "40px" }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  background: "transparent",
                  border: "none",
                  color: "#9CA3AF",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end" }}>
            <button
              type="submit"
              className="save-btn"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 18px",
                borderRadius: "8px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <KeyRound size={16} /> Update Password
            </button>
          </div>
        </div>
      </form>

      <div
        className="settings-card"
        style={{ marginTop: "24px", borderColor: "rgba(239, 68, 68, 0.35)" }}
      >
        <div className="card-section-header" style={{ color: "#EF4444" }}>
          <ShieldAlert size={20} />
          <h3>Danger Zone</h3>
        </div>
        <p style={{ fontSize: "13px", color: "#9CA3AF", marginBottom: "14px" }}>
          Permanently delete your CareerTrack AI account and wipe all personal data,
          stored progress, and milestones from the server.
        </p>
        <button
          type="button"
          onClick={handleDeleteAccount}
          style={{
            backgroundColor: "rgba(239, 68, 68, 0.12)",
            color: "#EF4444",
            border: "1px solid rgba(239, 68, 68, 0.4)",
            padding: "8px 16px",
            borderRadius: "8px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "background-color 0.2s ease",
          }}
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}

export default Settings;