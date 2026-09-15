import React from "react";
import "./AcademicDetails.css";
import { GraduationCap } from "lucide-react";

function AcademicDetails({ profile }) {
  return (
    <div className="profile-card info-card">
      <div className="card-header-flex">
        <GraduationCap size={18} className="card-icon academic-icon" />
        <h3>Academic Details</h3>
      </div>
      <div className="info-grid">
        <div className="info-item">
          <span className="info-label">College</span>
          <span className="info-value">{profile?.college || "N/A"}</span>
        </div>
        <div className="info-item">
          <span className="info-label">CGPA</span>
          <span className="info-value">{profile?.cgpa || "N/A"}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Degree</span>
          <span className="info-value">{profile?.degree || "N/A"}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Graduation Year</span>
          <span className="info-value">{profile?.graduationYear || "N/A"}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Branch</span>
          <span className="info-value">{profile?.branch || "N/A"}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Education Level</span>
          <span className="info-value">{profile?.educationLevel || "N/A"}</span>
        </div>
      </div>
    </div>
  );
}

export default AcademicDetails;