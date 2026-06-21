"use client";
import { useState, useEffect } from "react";
import { useLang } from "@/contexts/LangContext";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: (email: string) => void;
}

export default function SignInModal({ open, onClose, onSuccess }: Props) {
  const { t } = useLang();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"signin" | "register">("signin");

  useEffect(() => {
    if (!open) { setError(""); setEmail(""); setPassword(""); }
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Please enter email and password."); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess(email);
      onClose();
    }, 800);
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: "#fff", borderRadius: 10, padding: "32px 36px",
        width: 400, boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        position: "relative",
      }}>
        <button onClick={onClose} style={{
          position: "absolute", top: 14, right: 16, background: "none", border: "none",
          fontSize: 20, color: "#94a3b8", cursor: "pointer", lineHeight: 1,
        }}>×</button>

        <div style={{ marginBottom: 24 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 7, background: "#1e3a5f",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 800, color: "#fff", marginBottom: 14,
          }}>AF</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#0f172a" }}>{t("signin_title")}</div>
          <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{t("signin_sub")}</div>
        </div>

        <form onSubmit={submit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 5 }}>
              {t("email")}
            </label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{
                width: "100%", height: 40, padding: "0 12px",
                border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 14,
                color: "#0f172a", background: "#f8fafc", outline: "none",
                fontFamily: "inherit",
              }}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 5 }}>
              {t("password")}
            </label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: "100%", height: 40, padding: "0 12px",
                border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 14,
                color: "#0f172a", background: "#f8fafc", outline: "none",
                fontFamily: "inherit",
              }}
            />
          </div>

          {error && (
            <div style={{ fontSize: 12, color: "#dc2626", marginBottom: 12, padding: "8px 10px", background: "#fef2f2", borderRadius: 5, border: "1px solid #fca5a5" }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            width: "100%", height: 42, borderRadius: 7, fontSize: 14, fontWeight: 600,
            background: loading ? "#94a3b8" : "#1e3a5f", color: "#fff", border: "none",
            cursor: loading ? "default" : "pointer", fontFamily: "inherit",
            transition: "background 0.15s",
          }}>
            {loading ? "..." : t("signin_btn")}
          </button>
        </form>

        <div style={{ marginTop: 16, textAlign: "center", fontSize: 12, color: "#64748b" }}>
          {t("no_account")}{" "}
          <button onClick={() => setMode(m => m === "signin" ? "register" : "signin")}
            style={{ color: "#1d4ed8", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 600 }}>
            {t("register")}
          </button>
        </div>
        <div style={{ marginTop: 10, textAlign: "center", fontSize: 11, color: "#94a3b8" }}>
          {t("demo_hint")}
        </div>
      </div>
    </div>
  );
}
