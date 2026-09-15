import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, LogIn, KeyRound } from "lucide-react";

function SignupSigninPage() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", code: "", newPassword: "" });

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get("token");

    if (token) {
      localStorage.setItem("token", token);

      try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
        const decodedData = JSON.parse(jsonPayload);

        if (decodedData.userId || decodedData.id) {
          localStorage.setItem("userId", decodedData.userId || decodedData.id);
        }
        if (decodedData.username) {
          localStorage.setItem("username", decodedData.username);
        } else if (decodedData.email) {
          localStorage.setItem("username", decodedData.email.split("@")[0]);
        }
      } catch (error) {
        console.error("Error decoding token:", error);
      }

      navigate("/dashboard", { replace: true });
    }

    // Reliable theme persistence check
    const savedTheme = localStorage.getItem("theme");
    
    if (savedTheme === "light") {
      document.documentElement.classList.remove("dark");
      document.body.classList.add("light-mode");
    } else {
      document.documentElement.classList.add("dark");
      document.body.classList.remove("light-mode");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }

    if (isForgot) {
      if (forgotStep === 1) {
        try {
          const response = await fetch(`${API_URL}/api/forgot-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: formData.email }),
          });
          const data = await response.json();
          if (response.ok) {
            alert("Verification code sent to your email!");
            setForgotStep(2);
          } else {
            alert(data.error || "Failed to send reset code");
          }
        } catch (error) {
          console.error("Error:", error);
          alert("Network error.");
        }
      } else {
        try {
          const response = await fetch(`${API_URL}/api/reset-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: formData.email,
              code: formData.code,
              newPassword: formData.newPassword,
            }),
          });
          const data = await response.json();
          if (response.ok) {
            alert("Password updated successfully. Please sign in!");
            setIsForgot(false);
            setForgotStep(1);
          } else {
            alert(data.error || "Password reset failed");
          }
        } catch (error) {
          console.error("Error:", error);
          alert("Network error.");
        }
      }
      return;
    }

    const endpoint = isSignUp 
      ? `${API_URL}/api/register` 
      : `${API_URL}/api/login`;

    const payload = isSignUp 
      ? { username: formData.name, email: formData.email, password: formData.password }
      : { email: formData.email, password: formData.password };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.token) {
          localStorage.setItem("token", data.token);
          
          const activeUserId = data.user?._id || data.userId || data.user?.id;
          if (activeUserId) {
            localStorage.setItem("userId", activeUserId);
          }

          if (data.user && data.user.username) {
            localStorage.setItem("username", data.user.username);
          } else if (formData.name) {
            localStorage.setItem("username", formData.name);
          }

          // --- PRESERVE THEME STATE UPON LOGIN ---
          const savedTheme = localStorage.getItem("theme");
          if (savedTheme === "light") {
            document.body.classList.add("light-mode");
            document.documentElement.classList.remove("dark");
          } else {
            document.body.classList.remove("light-mode");
            document.documentElement.classList.add("dark");
          }

          navigate("/dashboard");
        } else {
          alert("Account created successfully. Please sign in.");
          setIsSignUp(false);
        }
      } else {
        alert(data.error || "Authentication failed");
      }
    } catch (error) {
      console.error("Network error during auth:", error);
      alert("Unable to connect to the server.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", backgroundColor: "#0D0D14" }}>
      <div 
        style={{
          width: "100%",
          maxWidth: "480px",
          backgroundColor: "#161622",
          border: "1px solid #2E2E42",
          borderRadius: "16px",
          padding: "32px",
          boxShadow: "0px 20px 40px rgba(0,0,0,0.3)",
          color: "#FFFFFF",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: "600", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
            {isForgot ? <KeyRound size={24} color="#A78BFA" /> : isSignUp ? <UserPlus size={24} color="#A78BFA" /> : <LogIn size={24} color="#A78BFA" />}
            {isForgot ? "Reset Password" : isSignUp ? "Create Account" : "Welcome Back"}
          </h2>
          
          <button
            type="button"
            onClick={() => {
              setIsForgot(false);
              setIsSignUp(!isSignUp);
              setForgotStep(1);
            }}
            style={{ background: "transparent", border: "none", color: "#A78BFA", fontSize: "13px", cursor: "pointer", fontWeight: "600" }}
          >
            {isForgot ? "Back to Sign In" : isSignUp ? "Existing user? Sign In" : "New here? Sign Up"}
          </button>
        </div>
        
        <p style={{ fontSize: "14px", lineHeight: "1.6", marginBottom: "24px", color: "#9CA3AF" }}>
          {isForgot 
            ? (forgotStep === 1 ? "Enter your registered email to receive a verification code, myau!" : "Enter the code sent to your email and your new password.")
            : (isSignUp ? "Sign up to start tracking your career milestones and full-stack projects." : "Log in to your account to continue tracking your roadmap goals.")}
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {isSignUp && !isForgot && (
            <div>
              <label style={{ fontSize: "13px", display: "block", marginBottom: "6px", fontWeight: "500", color: "#E5E7EB" }}>Full Name</label>
              <input
                type="text"
                required={isSignUp}
                placeholder="Enter your name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={dynamicInputStyle}
              />
            </div>
          )}

          {(!isForgot || forgotStep === 1) && (
            <div>
              <label style={{ fontSize: "13px", display: "block", marginBottom: "6px", fontWeight: "500", color: "#E5E7EB" }}>Email Address</label>
              <input
                type="email"
                required
                placeholder="e.g., name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={dynamicInputStyle}
              />
            </div>
          )}

          {!isForgot && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label style={{ fontSize: "13px", fontWeight: "500", color: "#E5E7EB" }}>Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgot(true);
                    setForgotStep(1);
                  }}
                  style={{ background: "transparent", border: "none", color: "#A78BFA", fontSize: "12px", cursor: "pointer", padding: 0, fontWeight: "600" }}
                >
                  Forgot Password?
                </button>
              </div>
              <input
                type="password"
                required
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                style={dynamicInputStyle}
              />
            </div>
          )}

          {isForgot && forgotStep === 2 && (
            <>
              <div>
                <label style={{ fontSize: "13px", display: "block", marginBottom: "6px", fontWeight: "500", color: "#E5E7EB" }}>Verification Code</label>
                <input
                  type="text"
                  required
                  placeholder="Enter 6-digit code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  style={dynamicInputStyle}
                />
              </div>
              <div>
                <label style={{ fontSize: "13px", display: "block", marginBottom: "6px", fontWeight: "500", color: "#E5E7EB" }}>New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Enter new password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  style={dynamicInputStyle}
                />
              </div>
            </>
          )}

          <button
            type="submit"
            style={{
              width: "100%",
              backgroundColor: "#7C3AED",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "10px",
              padding: "12px",
              fontWeight: "600",
              fontSize: "14px",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxShadow: "0px 4px 12px rgba(124, 58, 237, 0.3)",
              marginTop: "8px"
            }}
          >
            {isForgot ? <KeyRound size={16} /> : isSignUp ? <UserPlus size={16} /> : <LogIn size={16} />}
            {isForgot ? (forgotStep === 1 ? "Send Reset Code" : "Reset Password") : (isSignUp ? "Sign Up" : "Sign In")}
          </button>

          {!isForgot && (
            <>
              <div style={{ display: "flex", alignItems: "center", margin: "8px 0" }}>
                <div style={{ flex: 1, height: "1px", backgroundColor: "#2E2E42" }} />
                <span style={{ padding: "0 12px", color: "#9CA3AF", fontSize: "12px" }}>or</span>
                <div style={{ flex: 1, height: "1px", backgroundColor: "#2E2E42" }} />
              </div>

              <button
                type="button"
                onClick={() => window.location.href = `${API_URL}/api/google`}
                style={{
                  width: "100%",
                  backgroundColor: "#0D0D14",
                  border: "1px solid #2E2E42",
                  borderRadius: "10px",
                  padding: "12px",
                  color: "#FFFFFF",
                  fontWeight: "600",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  cursor: "pointer",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                Continue with Google
              </button>
            </>
          )}

          {isForgot && (
            <button
              type="button"
              onClick={() => setIsForgot(false)}
              style={{ background: "transparent", border: "none", color: "#9CA3AF", fontSize: "13px", cursor: "pointer", marginTop: "4px" }}
            >
              Cancel / Return to Sign In
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

const dynamicInputStyle = {
  width: "100%",
  padding: "12px 14px",
  backgroundColor: "#0D0D14",
  border: "1px solid #2E2E42",
  color: "#FFFFFF",
  borderRadius: "10px",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
};

export default SignupSigninPage;