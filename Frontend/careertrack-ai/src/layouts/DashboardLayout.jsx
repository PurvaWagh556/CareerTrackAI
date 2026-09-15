import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar/Sidebar";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";

import "./DashboardLayout.css";

function DashboardLayout() {
  const navigate = useNavigate();
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      document.body.classList.add("light-mode");
      document.documentElement.classList.remove("dark");
    } else {
      document.body.classList.remove("light-mode");
      document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const savedState = localStorage.getItem("sidebarOpen");
    return savedState !== null ? JSON.parse(savedState) : false;
  });

  const toggleSidebar = () => {
    setSidebarOpen((prev) => {
      const newState = !prev;
      localStorage.setItem("sidebarOpen", JSON.stringify(newState));
      return newState;
    });
  };

  return (
    <div 
      className="dashboard-layout" 
      style={{ display: "flex", minHeight: "100vh", width: "100%", boxSizing: "border-box", margin: 0, padding: 0 }}
    >
      <Sidebar isOpen={sidebarOpen} />

      <div
        className={`main-section ${
          sidebarOpen ? "sidebar-open" : "sidebar-closed"
        }`}
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: "100vh",
          boxSizing: "border-box",
        }}
      >
        <Navbar
          sidebarOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
        />

        <div className="dashboard-content" style={{ flex: 1, boxSizing: "border-box" }}>
          <Outlet />
        </div>
        
        <Footer />
      </div>
    </div>
  );
}

export default DashboardLayout;