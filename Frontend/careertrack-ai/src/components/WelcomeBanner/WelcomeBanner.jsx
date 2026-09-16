import React, { useRef, useState, useEffect } from "react";
import {
  Cat,
  BriefcaseBusiness,
  Award,
  Code2,
  ChevronLeft,
  ChevronRight,
  X,
  Sun,
  Sunrise,
  Sunset,
  Moon,
  Terminal,
  Trophy,
  Flame,
  Sparkles,
  FolderGit2,
  FileText,
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis } from "recharts";

import "./WelcomeBanner.css";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

function WelcomeBanner() {
  const scrollRef = useRef(null);
  const popupRef = useRef(null);
  const iconRef = useRef(null);

  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const [username, setUsername] = useState("Purva");
  const [readinessScore, setReadinessScore] = useState(0);

  const [showPopup, setShowPopup] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [currentThought, setCurrentThought] = useState("");

  const professionalThoughts = [
    "Consistency compounds into massive career success. Keep building!",
    "Every line of code brings you closer to your target role.",
    "Focus on system architecture and clean execution today.",
    "Small daily progress adds up to remarkable results.",
    "Maintain momentum and write resilient code.",
    "Structured problem-solving solves any technical challenge.",
    "Keep refining your portfolio and optimizing your workflow.",
    "Mastering fundamentals is the key to scaling complex systems.",
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target) &&
        iconRef.current &&
        !iconRef.current.contains(event.target)
      ) {
        setShowPopup(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let timer;
    if (showPopup) {
      const updateClock = () => {
        const now = new Date();
        setCurrentTime(now.toLocaleTimeString());
      };
      updateClock();
      timer = setInterval(updateClock, 1000);

      const random =
        professionalThoughts[
          Math.floor(Math.random() * professionalThoughts.length)
        ];
      setCurrentThought(random);
    }
    return () => clearInterval(timer);
  }, [showPopup]);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch(`${API_URL}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();

          if (data.fullName || data.name || data.username) {
            const rawName = data.fullName || data.name || data.username;
            const firstName = rawName.trim().split(" ")[0];
            setUsername(firstName);
          }

          let basePoints = 10;

          const skillsArray = data.skills || data.userSkills || [];
          let skillsCount = skillsArray.length;
          let skillsPoints = Math.min((skillsCount / 3) * 15, 15);

          const projectsArray = data.projects || data.userProjects || [];
          let projectsCount = projectsArray.length;
          let projectsPoints = Math.min((projectsCount / 2) * 20, 20);

          let hasContactOrBio = Boolean(
            data.bio ||
            data.github ||
            data.linkedin ||
            data.phone ||
            data.headline ||
            data.email,
          );
          let profilePoints = hasContactOrBio ? 10 : 0;

          const certsArray = data.certificates || data.userCertificates || [];
          let certsCount = certsArray.length;
          let certsPoints = Math.min((certsCount / 2) * 15, 15);

          let hasResume = Boolean(
            data.resumePath ||
            data.resume ||
            data.resumeUrl ||
            data.resumeFile ||
            data.resumeName ||
            data.cv ||
            data.document ||
            data.file,
          );
          let resumePoints = hasResume ? 15 : 0;

          const dsaCount = data.dsaSolvedCount || data.dsaSolved || 0;
          let dsaPoints = Math.min((dsaCount / 50) * 15, 15);

          const totalScore = Math.round(
            basePoints +
              skillsPoints +
              projectsPoints +
              profilePoints +
              certsPoints +
              resumePoints +
              dsaPoints,
          );

          setReadinessScore(Math.min(totalScore, 100));
        }
      } catch (error) {
        console.error("Error fetching banner profile data:", error);
      }
    };

    fetchUserData();
    window.addEventListener("focus", fetchUserData);
    return () => window.removeEventListener("focus", fetchUserData);
  }, []);

  const [metrics, setMetrics] = useState([]);

  useEffect(() => {
    const fetchMetrics = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch(`${API_URL}/api/metrics`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          const fetchedMetrics = Array.isArray(data)
            ? data
            : data.metrics || [];

          const formattedMetrics = fetchedMetrics.map((m, index) => {
            let badgeTitle = m.title;
            let badgeSubtitle = m.statusText;

            if (m.category === "Resume") {
              badgeTitle = "Peak ATS Score";
              badgeSubtitle = "AI Compatibility Verified ✨";
            } else if (m.category === "Streak") {
              badgeTitle = "Consistency Streak";
              badgeSubtitle = "Daily Activity Record 🔥";
            } else if (m.category === "DSA") {
              badgeTitle = "Problem Solver";
              badgeSubtitle = "Algorithm Proficiency 🚀";
            } else if (m.category === "Certificates") {
              badgeTitle = "Verified Credentials";
              badgeSubtitle = "Professional Certification 🌟";
            } else if (m.category === "Projects") {
              badgeTitle = "Registered Projects";
              badgeSubtitle = "Full-Stack Web Apps Deployed 🚀";
            }

            return {
              id: m._id || m.id || String(index),
              title: badgeTitle,
              value: m.value || "0",
              statusText: badgeSubtitle,
              category: m.category || "projects",
              data: m.data || [
                { value: 15 },
                { value: 28 },
                { value: 20 },
                { value: 42 },
                { value: 35 },
                { value: 60 },
              ],
            };
          });

          setMetrics(formattedMetrics);
        }
      } catch (err) {
        console.error("Error fetching automatic metrics:", err);
      }
    };

    fetchMetrics();
    window.addEventListener("focus", fetchMetrics);
    return () => window.removeEventListener("focus", fetchMetrics);
  }, []);

  const getTimeIcon = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return <Sunrise size={24} color="#FBBF24" />;
    } else if (hour >= 12 && hour < 17) {
      return <Sun size={24} color="#F59E0B" />;
    } else if (hour >= 17 && hour < 21) {
      return <Sunset size={24} color="#F97316" />;
    } else {
      return <Moon size={24} color="#A78BFA" />;
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(Math.ceil(scrollLeft) + clientWidth < scrollWidth);
    }
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const cardWidth =
        scrollRef.current.querySelector(".banner-card")?.offsetWidth + 20 ||
        250;
      const scrollAmount = direction === "left" ? -cardWidth : cardWidth;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const getCardStyleInfo = (cat) => {
    if (cat === "DSA" || cat === "dsa") {
      return {
        icon: <Code2 size={20} />,
        colorClass: "green",
        strokeColor: "#22C55E",
      };
    } else if (cat === "Certificates" || cat === "certificates") {
      return {
        icon: <Award size={20} />,
        colorClass: "blue",
        strokeColor: "#3B82F6",
      };
    } else if (cat === "Streak" || cat === "streak") {
      return {
        icon: <Flame size={20} />,
        colorClass: "purple",
        strokeColor: "#C084FC",
      };
    } else if (cat === "Projects" || cat === "projects") {
      return {
        icon: <FolderGit2 size={20} />, 
        colorClass: "violet",
        strokeColor: "#7C3AED",
      };
    } else if (cat === "Resume" || cat === "resume") {
      return {
        icon: <FileText size={20} />, 
        colorClass: "orange",
        strokeColor: "#F97316",
      };
    } else {
      return {
        icon: <Sparkles size={20} />,
        colorClass: "orange",
        strokeColor: "#F97316",
      };
    }
  };

  return (
    <div
      className="welcome-banner"
      style={{ position: "relative", marginBottom: "0px" }}
    >
      <div className="banner-header" style={{ marginBottom: "12px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            position: "relative",
          }}
        >
          <div
            ref={iconRef}
            onClick={() => setShowPopup((prev) => !prev)}
            style={{
              padding: "10px",
              backgroundColor: "rgba(245, 158, 11, 0.12)",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "transform 0.2s ease, background-color 0.2s ease",
            }}
            title="Click to view live time"
          >
            {getTimeIcon()}
          </div>

          <div>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: "700",
                color: "#FFFFFF",
                margin: "0 0 2px 0",
              }}
            >
              {(() => {
                const hour = new Date().getHours();
                const timeGreeting =
                  hour < 12
                    ? "Good Morning"
                    : hour < 17
                      ? "Good Afternoon"
                      : "Good Evening";
                return `${timeGreeting}, ${username || "Purva"}!`;
              })()}
            </h2>
            <p style={{ fontSize: "13px", color: "#9CA3AF", margin: 0 }}>
              Stay consistent. You&apos;re{" "}
              <strong style={{ color: "#A78BFA" }}>{readinessScore}%</strong>{" "}
              career-ready.
            </p>
          </div>

          {showPopup && (
            <div
              ref={popupRef}
              style={{
                position: "absolute",
                top: "60px",
                left: "0px",
                backgroundColor: "#13101E",
                border: "1px solid rgba(192, 132, 252, 0.35)",
                borderRadius: "16px",
                padding: "20px 18px 14px 18px",
                boxShadow:
                  "0 12px 32px rgba(0, 0, 0, 0.55), 0 0 20px rgba(192, 132, 252, 0.15)",
                width: "100%",
                maxWidth: "270px",
                boxSizing: "border-box",
                zIndex: 100,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  backgroundColor: "#191528",
                  border: "2px solid #C084FC",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "-42px auto 10px auto",
                  boxShadow: "0 0 18px rgba(192, 132, 252, 0.4)",
                }}
              >
                <Cat size={24} color="#C084FC" />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "11px",
                    fontWeight: "600",
                    color: "#C084FC",
                    letterSpacing: "0.8px",
                    textTransform: "uppercase",
                  }}
                >
                  <Terminal size={13} /> Live Time
                </div>
                <button
                  type="button"
                  onClick={() => setShowPopup(false)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#9CA3AF",
                    cursor: "pointer",
                    padding: "2px",
                    display: "flex",
                    alignItems: "center",
                    transition: "color 0.2s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#FFFFFF")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "#9CA3AF")
                  }
                >
                  <X size={14} />
                </button>
              </div>

              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#FFFFFF",
                  marginBottom: "10px",
                  letterSpacing: "0.5px",
                  textAlign: "left",
                }}
              >
                {currentTime}
              </div>

              <div
                style={{
                  borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                  paddingTop: "10px",
                  fontSize: "12px",
                  color: "#9CA3AF",
                  lineHeight: "1.5",
                  textAlign: "left",
                }}
              >
                {currentThought}
              </div>
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          backgroundColor: "#12121A",
          border: "1px solid rgba(124, 58, 237, 0.25)",
          borderRadius: "16px",
          padding: "14px 16px",
          boxShadow: "0px 10px 25px rgba(0,0,0,0.4)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "10px",
            paddingLeft: "2px",
            paddingRight: "2px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div
              style={{
                padding: "4px",
                backgroundColor: "rgba(124, 58, 237, 0.15)",
                borderRadius: "6px",
                color: "#A78BFA",
              }}
            >
              <Trophy size={14} />
            </div>
            <h3
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#FFFFFF",
                margin: 0,
                letterSpacing: "0.2px",
              }}
            >
              Milestones & Badges
            </h3>
          </div>
          <span
            style={{ fontSize: "11px", color: "#C084FC", fontWeight: "500" }}
          >
            Live Sync Active ⚡
          </span>
        </div>

        <div className="carousel-wrapper">
          {showLeftArrow && (
            <button className="scroll-btn left" onClick={() => scroll("left")}>
              <ChevronLeft size={20} />
            </button>
          )}

          <div className="banner-cards" ref={scrollRef} onScroll={handleScroll}>
            {metrics.length === 0 ? (
              <div
                style={{
                  padding: "12px",
                  color: "#9CA3AF",
                  fontSize: "12px",
                  textAlign: "center",
                  width: "100%",
                }}
              >
                Syncing milestones...
              </div>
            ) : (
              metrics.map((card) => {
                const { icon, colorClass, strokeColor } = getCardStyleInfo(
                  card.category,
                );
                return (
                  <div
                    className="banner-card"
                    key={card.id}
                    style={{
                      position: "relative",
                      padding: "18px 20px",
                      border: "1px solid rgba(167, 139, 250, 0.15)",
                    }}
                  >
                    <div
                      className="card-header"
                      style={{ marginBottom: "6px" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "38px",
                          height: "38px",
                          borderRadius: "10px",
                          backgroundColor:
                            colorClass === "purple"
                              ? "rgba(192, 132, 252, 0.12)"
                              : colorClass === "violet"
                                ? "rgba(124, 58, 237, 0.12)"
                                : colorClass === "blue"
                                  ? "rgba(59, 130, 246, 0.12)"
                                  : colorClass === "green"
                                    ? "rgba(34, 197, 94, 0.12)"
                                    : "rgba(249, 115, 22, 0.12)",
                          color: strokeColor,
                          flexShrink: 0,
                        }}
                      >
                        {icon}
                      </div>
                      <h4 style={{ fontSize: "14px", color: "#F3F4F6" }}>
                        {card.title}
                      </h4>
                    </div>
                    <h1
                      style={{
                        fontSize: "22px",
                        margin: "4px 0",
                        color: "#FFFFFF",
                      }}
                    >
                      {card.value}
                    </h1>
                    <p
                      style={{
                        fontSize: "12px",
                        marginBottom: "8px",
                        color: "#A78BFA",
                      }}
                    >
                      {card.statusText}
                    </p>

                    <ResponsiveContainer width="100%" height={50}>
                      <LineChart data={card.data}>
                        <XAxis hide />
                        <YAxis hide />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke={strokeColor}
                          strokeWidth={2.5}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                );
              })
            )}
          </div>

          {showRightArrow && metrics.length > 0 && (
            <button
              className="scroll-btn right"
              onClick={() => scroll("right")}
            >
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default WelcomeBanner;
