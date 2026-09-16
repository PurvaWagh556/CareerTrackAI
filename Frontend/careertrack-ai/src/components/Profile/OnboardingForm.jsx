import React, { useState, useRef, useEffect } from "react";
import {
  User,
  GraduationCap,
  Code,
  Share2,
  FileText,
  Search,
  X,
} from "lucide-react";
import "./OnboardingForm.css";
import ProfilePhotoSelector from "./ProfilePhotoSelector";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

function OnboardingForm({ initialData, onSubmitSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    fullName: "",
    headline: "",
    location: "",
    gender: "Female",
    email: "",
    dob: "",
    phone: "",
    nationality: "Indian",
    college: "",
    cgpa: "",
    degree: "B.Tech",
    graduationYear: "",
    branch: "",
    educationLevel: "Undergraduate",
    github: "",
    linkedin: "",
    portfolio: "",
    leetcode: "",
    skills: [],
    profilePic: "",
  });

  const [resumeFile, setResumeFile] = useState(null);
  const [skillInput, setSkillInput] = useState("");
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const skillDropdownRef = useRef(null);

  const availableSkills = [
    "Python", "Java", "C++", "JavaScript", "C", "HTML & CSS", "Git & GitHub", "OOP", 
    "React", "Node.js", "SQL", "Machine Learning", "TypeScript", "MongoDB", "Express.js",
    "C#", "Go", "Rust", "Ruby", "PHP", "Swift", "Kotlin", "Scala", "R", "MySQL",
    "PostgreSQL", "Redis", "GraphQL", "REST APIs", "Docker", "Kubernetes", "AWS", "Azure",
    "GCP", "CI/CD", "Linux", "Data Structures & Algorithms (DSA)", "Artificial Intelligence",
    "Deep Learning", "TensorFlow", "PyTorch", "Data Science", "Cybersecurity", "Tailwind CSS",
    "Next.js", "Vue.js", "Angular", "Spring Boot", "Flask", "Django"
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (skillDropdownRef.current && !skillDropdownRef.current.contains(event.target)) {
        setShowSkillDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (initialData) {
      const rawSkills = initialData.skills || [];
      const formattedSkills = rawSkills.map(s => typeof s === 'string' ? s : (s.name || ""));

      setFormData({
        fullName: initialData.fullName || "",
        headline: initialData.headline || "",
        location: initialData.location || "",
        gender: initialData.gender || "Female",
        email: initialData.email || "",
        dob: initialData.dob || "",
        phone: initialData.phone || "",
        nationality: initialData.nationality || "Indian",
        college: initialData.college || "",
        cgpa: initialData.cgpa || "",
        degree: initialData.degree || "B.Tech",
        graduationYear: initialData.graduationYear || "",
        branch: initialData.branch || "",
        educationLevel: initialData.educationLevel || "Undergraduate",
        github: initialData.github || "",
        linkedin: initialData.linkedin || "",
        portfolio: initialData.portfolio || "",
        leetcode: initialData.leetcode || "",
        skills: formattedSkills,
        profilePic: initialData.profilePic || "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddSkill = (skillToAdd) => {
    const trimmed = skillToAdd.trim();
    if (trimmed && !formData.skills.includes(trimmed)) {
      setFormData({
        ...formData,
        skills: [...formData.skills, trimmed],
      });
    }
    setSkillInput("");
    setShowSkillDropdown(false);
  };

  const removeSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skillToRemove),
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && skillInput) {
      e.preventDefault();
      handleAddSkill(skillInput);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Authentication token missing. Please log in again.");
      return;
    }

    const data = new FormData();
    
    Object.keys(formData).forEach((key) => {
      if (key === "skills") {
        data.append("skills", JSON.stringify(formData.skills));
      } else if (formData[key] !== null && formData[key] !== undefined) {
        data.append(key, formData[key]);
      }
    });

    if (resumeFile) {
      data.append("resume", resumeFile);
    }

    try {
      const res = await fetch(`${API_URL}/api/profile`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      const result = await res.json();

      if (res.ok && result.success) {
        if (onSubmitSuccess) onSubmitSuccess(result);
      } else {
        alert(result.error || "Failed to save profile details.");
      }
    } catch (err) {
      console.error("Network error during profile submission:", err);
      alert("Network error while saving profile.");
    }
  };

  const filteredSkills = availableSkills.filter(
    (s) => s.toLowerCase().includes(skillInput.toLowerCase()) && !formData.skills.includes(s)
  );

  return (
    <div className="onboarding-container">
      <div className="onboarding-card" style={{ position: "relative" }}>
        <button
          type="button"
          onClick={() => {
            if (typeof onCancel === "function") {
              onCancel();
            } else {
              window.location.reload();
            }
          }}
          style={{
            position: "absolute",
            top: "24px",
            right: "24px",
            backgroundColor: "#1a1c29",
            border: "1px solid #2a2d3d",
            color: "#ffffff",
            padding: "6px 12px",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            zIndex: 10,
          }}
        >
          ✕ Cancel Edit
        </button>

        <div className="onboarding-header">
          <h2>Welcome to Your Dashboard!</h2>
          <p>Please complete your profile details to get started.</p>
        </div>

        <form onSubmit={handleSubmit} className="onboarding-form">
          <ProfilePhotoSelector
            currentPic={formData.profilePic}
            onSelect={(picPath) => {
              setFormData((prev) => ({ ...prev, profilePic: picPath }));
            }}
          />
          
          <div className="form-section">
            <h3 className="section-title">
              <User size={18} /> Personal Information
            </h3>
            <div className="form-grid">
              <div>
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="Jane"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Professional Headline / Bio</label>
                <input
                  type="text"
                  name="headline"
                  required
                  placeholder="Artificial Intelligence"
                  value={formData.headline}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Location</label>
                <input
                  type="text"
                  name="location"
                  placeholder="Nagpur, India"
                  value={formData.location}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="jane.doe@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="form-input"
                  style={{ colorScheme: "dark" }}
                />
              </div>
              <div>
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Nationality</label>
                <input
                  type="text"
                  name="nationality"
                  placeholder="Indian"
                  value={formData.nationality}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">
              <GraduationCap size={18} /> Academic Details
            </h3>
            <div className="form-grid">
              <div>
                <label className="form-label">College / University</label>
                <input
                  type="text"
                  name="college"
                  placeholder="College Name"
                  value={formData.college}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">CGPA</label>
                <input
                  type="text"
                  name="cgpa"
                  placeholder="9.10 / 10"
                  value={formData.cgpa}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Degree</label>
                <select
                  name="degree"
                  value={formData.degree}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="B.Tech">B.Tech</option>
                  <option value="B.E.">B.E.</option>
                  <option value="BCA">BCA</option>
                  <option value="B.Sc">B.Sc</option>
                  <option value="B.Com">B.Com</option>
                  <option value="B.A.">B.A.</option>
                  <option value="MCA">MCA</option>
                  <option value="M.Tech">M.Tech</option>
                  <option value="M.Sc">M.Sc</option>
                  <option value="MBA">MBA</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="form-label">Graduation Year</label>
                <input
                  type="text"
                  name="graduationYear"
                  placeholder="2027"
                  value={formData.graduationYear}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Branch / Major</label>
                <input
                  type="text"
                  name="branch"
                  placeholder="Computer Engineering"
                  value={formData.branch}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Education Level</label>
                <select
                  name="educationLevel"
                  value={formData.educationLevel}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="Undergraduate">Undergraduate</option>
                  <option value="Postgraduate">Postgraduate</option>
                  <option value="High School">High School</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section" ref={skillDropdownRef}>
            <h3 className="section-title" style={{ marginBottom: "4px" }}>
              <Code size={18} /> Skills
            </h3>
            <p style={{ fontSize: "13px", color: "#9CA3AF", marginBottom: "12px" }}>
              Please add your skills
            </p>

            <div
              style={{
                backgroundColor: "#12121a",
                border: "1px solid #2a2d3d",
                borderRadius: "10px",
                padding: "10px 14px",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "8px",
                minHeight: "52px",
                cursor: "text",
                position: "relative"
              }}
              onClick={() => setShowSkillDropdown(true)}
            >
              {formData.skills.map((skill, index) => (
                <div
                  key={index}
                  style={{
                    backgroundColor: "#1e2030",
                    border: "1px solid #32354a",
                    color: "#ffffff",
                    padding: "4px 10px",
                    borderRadius: "20px",
                    fontSize: "13px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSkill(skill);
                    }}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#9CA3AF",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      padding: 0,
                    }}
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}

              <div style={{ display: "flex", alignItems: "center", flex: 1, minWidth: "140px" }}>
                <input
                  type="text"
                  placeholder={formData.skills.length === 0 ? "Add a skill..." : ""}
                  value={skillInput}
                  onChange={(e) => {
                    setSkillInput(e.target.value);
                    setShowSkillDropdown(true);
                  }}
                  onFocus={() => setShowSkillDropdown(true)}
                  onKeyDown={handleKeyDown}
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    color: "#ffffff",
                    fontSize: "14px",
                    outline: "none",
                    width: "100%",
                    padding: "4px 0"
                  }}
                />
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "auto", color: "#9CA3AF" }}>
                  <Search size={16} />
                  <span style={{ fontSize: "12px" }}>▼</span>
                </div>
              </div>

              {showSkillDropdown && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    marginTop: "6px",
                    backgroundColor: "#161622",
                    border: "1px solid #2a2d3d",
                    borderRadius: "10px",
                    maxHeight: "220px",
                    overflowY: "auto",
                    zIndex: 99,
                    boxShadow: "0 10px 25px rgba(0,0,0,0.5)"
                  }}
                >
                  {filteredSkills.length > 0 ? (
                    filteredSkills.map((s, i) => (
                      <div
                        key={i}
                        onClick={() => handleAddSkill(s)}
                        style={{
                          padding: "12px 16px",
                          fontSize: "14px",
                          color: "#ffffff",
                          cursor: "pointer",
                          borderBottom: "1px solid #1f2233",
                          transition: "background 0.2s"
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1f2233")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        {s}
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: "12px 16px", fontSize: "13px", color: "#9CA3AF" }}>
                      Press Enter to add "{skillInput}"
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">
              <Share2 size={18} /> Social Links & Resume
            </h3>
            <div className="form-grid">
              <div>
                <label className="form-label">GitHub URL</label>
                <input
                  type="text"
                  name="github"
                  placeholder="github.com/username"
                  value={formData.github}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">LinkedIn URL</label>
                <input
                  type="text"
                  name="linkedin"
                  placeholder="linkedin.com/in/username"
                  value={formData.linkedin}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Portfolio Website</label>
                <input
                  type="text"
                  name="portfolio"
                  placeholder="portfolio.dev"
                  value={formData.portfolio}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">LeetCode URL</label>
                <input
                  type="text"
                  name="leetcode"
                  placeholder="leetcode.com/username"
                  value={formData.leetcode}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="resume-upload-box">
              <label className="form-label">
                <FileText size={14} /> Upload Resume (PDF)
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setResumeFile(e.target.files[0])}
                className="form-input file-input"
              />
            </div>
          </div>

          <button type="submit" className="submit-profile-btn">
            Save Profile & Launch Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}

export default OnboardingForm;