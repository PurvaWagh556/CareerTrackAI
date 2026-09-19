import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import ViewProfile from "./pages/ViewProfile";

import "./components/LightMode.css";
import DSATracker from "./pages/DSATracker";
import Projects from "./pages/Projects";
import Goals from "./pages/Goals";
import AiRoadmap from "./pages/AIRoadmap";
import Resources from "./pages/Resources";
import Settings from "./pages/Settings";
import About from "./components/HelpCenter/About";
import FAQsAndGuides from "./components/HelpCenter/FAQsAndGuides";
import ContactSupport from "./components/HelpCenter/ContactSupport";
import SignupSigninPage from "./components/LoginPage/SignupSigninPage";
import PrivacyPolicy from "./components/Footer/PrivacyPolicy";
import TermsOfService from "./components/Footer/TermsOfService";
import Support from "./components/Footer/Support";
import ResumeDetails from "./components/StatsCard/ResumeDetails";
import Certifications from "./components/StatsCard/Certifications";
import StreakDetails from "./components/StatsCard/StreakDetails";
import AIRecommendationsPage from "./components/AISuggestions/AIRecommendationsPage";
import OnboardingRouteGuard from "./OnboardingrouteGuard";
import Landing from "./pages/Landing";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

function App() {
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
    if (!token) return;

    let timer = null;

    const startTracking = () => {
      if (timer) return;

      timer = setInterval(() => {
        if (document.visibilityState !== "visible") return;

        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        const todayKey = `${year}-${month}-${day}`;
        
        fetch(`${API_URL}/api/track-time`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            date: todayKey,
            minutes: 1,
          }),
        }).catch((err) => console.error("DB time tracking error:", err));
      }, 60000);
    };

    const stopTracking = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };

    if (document.visibilityState === "visible") {
      startTracking();
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        startTracking();
      } else {
        stopTracking();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stopTracking();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white text-black dark:bg-[#09090b] dark:text-white">
      <BrowserRouter>
        <Routes>
          {/* Public Routes - Not restricted by Onboarding Guard */}
          <Route path="/home" element={<Landing />} />
          <Route path="/login" element={<SignupSigninPage />} />
          <Route path="/signup" element={<SignupSigninPage />} />

          {/* Protected Routes - Guarded by OnboardingRouteGuard */}
          <Route
            element={
              <OnboardingRouteGuard>
                <DashboardLayout />
              </OnboardingRouteGuard>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/dsa-tracker" element={<DSATracker />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/ai-roadmap" element={<AiRoadmap />} />
            <Route path="/roadmap" element={<AiRoadmap />} />
            <Route path="/profile" element={<ViewProfile />} />
            <Route path="/settings" element={<Settings />} />

            <Route path="/about" element={<About />} />
            <Route path="/faqs" element={<FAQsAndGuides />} />
            <Route path="/contact" element={<ContactSupport />} />

            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/support" element={<Support />} />

            <Route path="/resume-details" element={<ResumeDetails />} />
            <Route path="/certifications" element={<Certifications />} />
            <Route path="/streak-details" element={<StreakDetails />} />
            <Route
              path="/recommendations"
              element={<AIRecommendationsPage />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
