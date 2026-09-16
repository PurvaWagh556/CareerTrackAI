import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

function OnboardingRouteGuard({ children }) {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkOnboarding = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          if (
            data.isProfileComplete === false &&
            location.pathname !== "/profile"
          ) {
            navigate("/profile");
          }
        }
      } catch (err) {
        console.error("Error checking onboarding status:", err);
      } finally {
        setLoading(false);
      }
    };

    checkOnboarding();
  }, [location.pathname, navigate]);

  if (loading) return null;

  return children;
}

export default OnboardingRouteGuard;
