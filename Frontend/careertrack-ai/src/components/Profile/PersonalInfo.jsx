import React from "react";
import "./PersonalInfo.css";
import { User } from "lucide-react";

function PersonalInfo({ profile }) {
  return (
    <div className="profile-card info-card">
      <div className="card-header-flex">
        <User size={18} className="card-icon personal-icon" />
        <h3>Personal Information</h3>
      </div>
      <div className="info-grid">
        <div className="info-item">
          <span className="info-label">Full Name</span>
          <span className="info-value">{profile?.fullName || "N/A"}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Gender</span>
          <span className="info-value">{profile?.gender || "N/A"}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Email</span>
          <span className="info-value">{profile?.email || "N/A"}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Date of Birth</span>
          <span className="info-value">{profile?.dob || "N/A"}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Phone</span>
          <span className="info-value">{profile?.phone || "N/A"}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Nationality</span>
          <span className="info-value">{profile?.nationality || "N/A"}</span>
        </div>
      </div>
    </div>
  );
}

export default PersonalInfo;