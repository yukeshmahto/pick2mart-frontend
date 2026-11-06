"use client";

import React, { useState } from "react";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import Link from "next/link";
import { KeyRound, Smartphone, Lock, ShieldCheck } from "lucide-react";
import { authService } from "../../services/auth.service";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authService.forgotPassword({ identifier });
      if (res.success) {
        setSuccess(res.message);
        setStep(2);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError(err.message || "Failed to request OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await authService.verifyForgotPasswordOtp({ identifier, otp });
      if (res.success && res.data.resetToken) {
        setResetToken(res.data.resetToken);
        setSuccess("OTP Verified. Please create a new password.");
        setStep(3);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError(err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (newPassword !== confirmNewPassword) {
      return setError("Passwords do not match");
    }
    setLoading(true);
    try {
      const res = await authService.resetPassword({ resetToken, newPassword, confirmNewPassword });
      if (res.success) {
        setSuccess(res.message);
        setTimeout(() => {
          window.location.href = "/login";
        }, 2500);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main style={{ backgroundColor: "#f8fafc", minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 20px" }}>
        <div style={{ backgroundColor: "white", padding: "40px", borderRadius: "24px", boxShadow: "0 10px 40px rgba(0,0,0,0.08)", width: "100%", maxWidth: "450px" }}>
          
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div style={{ width: "60px", height: "60px", backgroundColor: "#fff7ed", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <KeyRound size={30} color="var(--orange)" />
            </div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: "800", color: "#0f172a" }}>Reset Password</h1>
            <p style={{ color: "#64748b", marginTop: "8px" }}>Follow the steps to secure your account</p>
          </div>

          {error && <div style={{ padding: "12px", backgroundColor: "#fef2f2", color: "#ef4444", borderRadius: "8px", marginBottom: "20px", textAlign: "center", border: "1px solid #fecaca" }}>{error}</div>}
          {success && <div style={{ padding: "12px", backgroundColor: "#f0fdf4", color: "#15803d", borderRadius: "8px", marginBottom: "20px", textAlign: "center", border: "1px solid #bbf7d0" }}>{success}</div>}

          {step === 1 && (
            <form onSubmit={handleRequestOtp} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#475569", marginBottom: "8px" }}>Email or Mobile Number</label>
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}><Smartphone size={18} /></div>
                  <input type="text" required value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="Enter email or mobile" style={{ width: "100%", padding: "12px 12px 12px 40px", borderRadius: "12px", border: "1px solid #cbd5e1", outline: "none" }} />
                </div>
              </div>
              <button disabled={loading} type="submit" style={{ padding: "16px", backgroundColor: loading ? "#fdba74" : "var(--orange)", color: "white", border: "none", borderRadius: "12px", fontSize: "1.1rem", fontWeight: "700", cursor: loading ? "not-allowed" : "pointer" }}>
                {loading ? "Sending..." : "Get OTP"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#475569", marginBottom: "8px" }}>Enter 6-Digit OTP</label>
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}><ShieldCheck size={18} /></div>
                  <input type="text" required maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="000000" style={{ width: "100%", padding: "12px 12px 12px 40px", borderRadius: "12px", border: "1px solid #cbd5e1", outline: "none", letterSpacing: "4px", fontSize: "1.2rem" }} />
                </div>
              </div>
              <button disabled={loading} type="submit" style={{ padding: "16px", backgroundColor: loading ? "#fdba74" : "var(--orange)", color: "white", border: "none", borderRadius: "12px", fontSize: "1.1rem", fontWeight: "700", cursor: loading ? "not-allowed" : "pointer" }}>
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#475569", marginBottom: "8px" }}>New Password</label>
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}><Lock size={18} /></div>
                  <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Minimum 8 characters" style={{ width: "100%", padding: "12px 12px 12px 40px", borderRadius: "12px", border: "1px solid #cbd5e1", outline: "none" }} />
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#475569", marginBottom: "8px" }}>Confirm New Password</label>
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}><Lock size={18} /></div>
                  <input type="password" required value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} placeholder="Must match new password" style={{ width: "100%", padding: "12px 12px 12px 40px", borderRadius: "12px", border: "1px solid #cbd5e1", outline: "none" }} />
                </div>
              </div>
              <button disabled={loading} type="submit" style={{ padding: "16px", backgroundColor: loading ? "#14b8a6" : "var(--teal)", color: "white", border: "none", borderRadius: "12px", fontSize: "1.1rem", fontWeight: "700", cursor: loading ? "not-allowed" : "pointer" }}>
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}

          <div style={{ marginTop: "32px", textAlign: "center", borderTop: "1px solid #e2e8f0", paddingTop: "24px" }}>
            <Link href="/login" style={{ color: "#64748b", fontWeight: "500", textDecoration: "none" }}>Back to Login</Link>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
