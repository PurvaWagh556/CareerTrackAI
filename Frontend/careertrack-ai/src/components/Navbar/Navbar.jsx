import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  CheckCircle2,
  BookOpen,
  HelpCircle,
  MessageSquare,
  FileText,
  X,
  Code2,
  Briefcase,
  Layers,
  Sparkles,
  ExternalLink,
  Cat,
} from "lucide-react";
import { RiMenu2Fill } from "react-icons/ri";
import { GoQuestion } from "react-icons/go";
import { FaChevronDown } from "react-icons/fa";
import { FaAnglesRight } from "react-icons/fa6";

import "./navbar.css";
import ThemeToggle from "../ThemeToggle";
import dsaQuestionsData from "../../dsaProblems";

function Navbar({ sidebarOpen, toggleSidebar }) {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showBellDropdown, setShowBellDropdown] = useState(false);
  const [showHelpDropdown, setShowHelpDropdown] = useState(false);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const [allSkills, setAllSkills] = useState([]);

  const [username, setUsername] = useState("User");
  const [userHeadline, setUserHeadline] = useState("Artificial Intelligence");
  const [currentPic, setCurrentPic] = useState("");

  const [notifications, setNotifications] = useState([]);

  const profileRef = useRef(null);
  const bellRef = useRef(null);
  const helpRef = useRef(null);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  const safeDsaArray = Array.isArray(dsaQuestionsData)
    ? dsaQuestionsData
    : dsaQuestionsData?.default || [];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setShowBellDropdown(false);
      }
      if (helpRef.current && !helpRef.current.contains(event.target)) {
        setShowHelpDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSkillsForSearch = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/api/skills`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setAllSkills(data.skills || []);
        }
      } catch (err) {
        console.error("Error fetching skills for search:", err);
      }
    };
    fetchSkillsForSearch();
  }, [API_URL]);

  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    const q = query.toLowerCase();

    const mockDatabaseItems = [
      {
        title: "Dashboard Overview",
        type: "Page",
        route: "/dashboard",
        icon: Layers,
      },
      {
        title: "AI Career Roadmap",
        type: "Feature",
        route: "/roadmap",
        icon: Sparkles,
      },
      {
        title: "DSA Tracker & Problems",
        type: "Feature",
        route: "/dsa",
        icon: Code2,
      },
      {
        title: "Projects & Portfolio",
        type: "Feature",
        route: "/projects",
        icon: Briefcase,
      },
      {
        title: "User Profile & Settings",
        type: "Page",
        route: "/profile",
        icon: User,
      },
      {
        title: "AI Study Recommendations",
        type: "AI Feature",
        route: "/dashboard",
        icon: BookOpen,
      },
      { title: "FAQs & Guides", type: "Help", route: "/faqs", icon: FileText },
      {
        title: "Contact Support",
        type: "Help",
        route: "/contact",
        icon: MessageSquare,
      },
    ];

    const filteredPages = mockDatabaseItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q),
    );

    // Filter matching skills from user profile
    const filteredSkills = allSkills
      .filter((s) => s.name.toLowerCase().includes(q))
      .map((s) => ({
        title: s.name,
        type: "Skill Documentation",
        isExternalDoc: true,
        route: `https://www.google.com/search?q=${encodeURIComponent(s.name + " official documentation")}`,
        icon: Code2,
      }));

    const filteredDsa = safeDsaArray
      .filter((p) => p?.title?.toLowerCase().includes(q))
      .map((p) => ({
        title: p.title,
        type: `DSA Problem • ${p.difficulty}`,
        isExternalDoc: true,
        route: p.link,
        icon: BookOpen,
      }));

    setSearchResults([...filteredPages, ...filteredSkills, ...filteredDsa]);
    setShowSearchDropdown(true);
  }, [query, allSkills, safeDsaArray]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch(`${API_URL}/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications || []);
        }
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    fetchNotifications();
    window.addEventListener("focus", fetchNotifications);
    return () => window.removeEventListener("focus", fetchNotifications);
  }, [API_URL]);

  const handleClearAllNotifications = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/api/notifications`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setNotifications([]);
      } else {
        console.error("Failed to clear notifications on server");
      }
    } catch (err) {
      console.error("Error clearing notifications:", err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${API_URL}/api/user/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success !== false) {
          if (data.fullName) {
            setUsername(data.fullName.trim().split(" ")[0]);
          } else if (data.username) {
            setUsername(data.username.trim().split(" ")[0]);
          }
          if (data.headline) {
            setUserHeadline(data.headline);
          }
          if (data.profilePic) {
            setCurrentPic(data.profilePic);
          }
        }
      })
      .catch((err) =>
        console.error("Error fetching navbar profile data:", err),
      );
  }, [API_URL]);

  useEffect(() => {
    const updatePic = (e) => {
      if (e?.detail) {
        setCurrentPic(e.detail);
      }
    };

    window.addEventListener("profilePicUpdated", updatePic);
    return () => {
      window.removeEventListener("profilePicUpdated", updatePic);
    };
  }, []);

  const getImageSrc = () => {
    if (!currentPic) return "default-avatar.png";
    if (
      currentPic.startsWith("http") ||
      currentPic.startsWith("blob:") ||
      currentPic.startsWith("data:")
    ) {
      return currentPic;
    }
    return `${API_URL}/${currentPic}`;
  };

  const getTimeAgo = (dateString) => {
    const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " mins ago";
    return "Just now";
  };

  return (
    <div
      className="navbar"
      style={{
        left: sidebarOpen ? "280px" : "0px",
        width: sidebarOpen ? "calc(100% - 280px)" : "100%",
      }}
    >
      <div
        className="navbar-left"
        style={{ display: "flex", alignItems: "center" }}
      >
        <button
          className="sidebar-toggle"
          onClick={toggleSidebar}
          title={sidebarOpen ? "Close Sidebar" : "Expand Sidebar"}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            display: "flex",
          }}
        >
          {sidebarOpen ? (
            <RiMenu2Fill size={28} />
          ) : (
            <Cat size={28} color="#A78BFA" />
          )}
        </button>
      </div>

      <div className="navbar-center" ref={searchRef}>
        <div className="search" style={{ position: "relative" }}>
          <Search size={18} />
          <input
            type="text"
            placeholder="Search for skills, topics, resources..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (query.trim()) setShowSearchDropdown(true);
            }}
          />
          {query && (
            <button
              className="clear-btn"
              onClick={() => {
                setQuery("");
                setShowSearchDropdown(false);
              }}
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}

          {showSearchDropdown && (
            <div
              className="search-dropdown-menu"
              style={{ maxHeight: "300px", overflowY: "auto" }}
            >
              {searchResults.length === 0 ? (
                <div
                  style={{
                    padding: "14px",
                    textAlign: "center",
                    color: "#9CA3AF",
                    fontSize: "13px",
                  }}
                >
                  No matching resources found.
                </div>
              ) : (
                searchResults.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <div
                      key={index}
                      onClick={() => {
                        if (item.isExternalDoc) {
                          window.open(
                            item.route,
                            "_blank",
                            "noopener,noreferrer",
                          );
                        } else {
                          navigate(item.route);
                        }
                        setShowSearchDropdown(false);
                        setQuery("");
                      }}
                      className="search-dropdown-item"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 16px",
                        cursor: "pointer",
                        borderBottom:
                          index < searchResults.length - 1
                            ? "1px solid #2E2E42"
                            : "none",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <div
                          style={{
                            color: "#A78BFA",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <IconComponent size={16} />
                        </div>
                        <div
                          style={{ display: "flex", flexDirection: "column" }}
                        >
                          <span
                            style={{
                              fontSize: "13px",
                              fontWeight: "600",
                              color: "#FFFFFF",
                            }}
                          >
                            {item.title}
                          </span>
                          <span
                            style={{
                              fontSize: "11px",
                              color: item.type.includes("DSA")
                                ? item.type.includes("Easy")
                                  ? "#14b8a6"
                                  : item.type.includes("Medium")
                                    ? "#d97706"
                                    : "#dc2626"
                                : "#9CA3AF",
                            }}
                          >
                            {item.type}
                          </span>
                        </div>
                      </div>
                      {item.isExternalDoc && (
                        <span
                          style={{
                            fontSize: "11px",
                            color: "#A78BFA",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <ExternalLink size={10} />
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      <div className="right">
        <ThemeToggle />

        <div
          className="bell-wrapper"
          ref={bellRef}
          style={{ position: "relative" }}
        >
          <button
            className="bell-btn"
            onClick={() => {
              setShowBellDropdown(!showBellDropdown);
              setShowProfileDropdown(false);
              setShowHelpDropdown(false);
              setShowSearchDropdown(false);
            }}
          >
            <Bell size={20} />
            {notifications.length > 0 && <span className="bell-badge"></span>}
          </button>

          {showBellDropdown && (
            <div
              className="bell-dropdown-menu"
              style={{ maxHeight: "320px", overflowY: "auto" }}
            >
              <div className="bell-header">
                <h4>Notifications</h4>
                <span
                  className="mark-read"
                  onClick={handleClearAllNotifications}
                  style={{ cursor: "pointer" }}
                >
                  Clear all
                </span>
              </div>
              <div className="bell-items-list">
                {notifications.length === 0 ? (
                  <div
                    style={{
                      padding: "20px",
                      textAlign: "center",
                      color: "#9CA3AF",
                      fontSize: "13px",
                    }}
                  >
                    No new notifications.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      className="bell-item"
                      key={n._id}
                      style={{
                        alignItems: "flex-start",
                        gap: "10px",
                        padding: "10px 0",
                        borderBottom: "1px solid #2E2E42",
                      }}
                    >
                      <div
                        className="bell-icon-wrapper purple"
                        style={{ marginTop: "2px" }}
                      >
                        {n.type === "dsa" ? (
                          <Code2 size={16} />
                        ) : (
                          <Sparkles size={16} />
                        )}
                      </div>
                      <div className="bell-text" style={{ flex: 1 }}>
                        <p
                          style={{
                            margin: "0 0 2px 0",
                            fontWeight: "600",
                            fontSize: "13px",
                            color: "#FFFFFF",
                          }}
                        >
                          {n.title}
                        </p>
                        <p
                          style={{
                            margin: "0 0 4px 0",
                            fontSize: "12px",
                            color: "#9CA3AF",
                          }}
                        >
                          {n.message}
                        </p>
                        <span style={{ fontSize: "10px", color: "#A78BFA" }}>
                          {getTimeAgo(n.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div
          className="help-wrapper"
          ref={helpRef}
          style={{ position: "relative" }}
        >
          <button
            className="help-btn"
            onClick={() => {
              setShowHelpDropdown(!showHelpDropdown);
              setShowBellDropdown(false);
              setShowProfileDropdown(false);
              setShowSearchDropdown(false);
            }}
          >
            <GoQuestion className="doubt" size={22} />
          </button>

          {showHelpDropdown && (
            <div className="help-dropdown-menu">
              <button
                className="dropdown-item"
                onClick={() => {
                  setShowHelpDropdown(false);
                  navigate("/about");
                }}
              >
                <HelpCircle size={16} />
                <span>About</span>
              </button>
              <button
                className="dropdown-item"
                onClick={() => {
                  setShowHelpDropdown(false);
                  navigate("/faqs");
                }}
              >
                <FileText size={16} />
                <span>FAQs & Guides</span>
              </button>
              <div className="dropdown-divider"></div>
              <button
                className="dropdown-item"
                onClick={() => {
                  setShowHelpDropdown(false);
                  navigate("/contact");
                }}
              >
                <MessageSquare size={16} />
                <span>Contact Support</span>
              </button>
            </div>
          )}
        </div>

        <div
          className="profile-section-wrapper"
          ref={profileRef}
          style={{ position: "relative" }}
        >
          <div
            className="nav-profile"
            onClick={() => {
              setShowProfileDropdown(!showProfileDropdown);
              setShowBellDropdown(false);
              setShowHelpDropdown(false);
              setShowSearchDropdown(false);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              padding: "4px 8px",
            }}
          >
            <img
              src={getImageSrc()}
              alt="User Avatar"
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
            <div
              className="profile-info"
              style={{
                display: "flex",
                flexDirection: "column",
                lineHeight: "1.2",
              }}
            >
              <span
                className="profile-name"
                style={{ fontSize: "13px", fontWeight: "600" }}
              >
                Hi, {username}!
              </span>
              <span
                className="profile-role"
                style={{ fontSize: "10px", color: "#A78BFA" }}
              >
                {userHeadline}
              </span>
            </div>
            <FaChevronDown className="profile-arrow" size={12} />
          </div>

          {showProfileDropdown && (
            <div className="profile-dropdown-menu">
              <button
                className="dropdown-item"
                onClick={() => {
                  setShowProfileDropdown(false);
                  navigate("/profile");
                }}
              >
                <User size={16} />
                <span>View Profile</span>
              </button>
              <button
                className="dropdown-item"
                onClick={() => {
                  setShowProfileDropdown(false);
                  navigate("/settings");
                }}
              >
                <Settings size={16} />
                <span>Settings</span>
              </button>
              <div className="dropdown-divider"></div>
              <button
                className="dropdown-item logout"
                onClick={() => {
                  setShowProfileDropdown(false);

                  const currentTheme = localStorage.getItem("theme");

                  localStorage.clear();

                  if (currentTheme) {
                    localStorage.setItem("theme", currentTheme);
                  }

                  navigate("/login");
                }}
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Navbar;
