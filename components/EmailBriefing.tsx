"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";

const LANGUAGES = ["English","Spanish","French","German","Portuguese","Italian","Japanese","Chinese","Korean","Arabic"];

export default function EmailBriefing() {
  const { data: session } = useSession();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState("English");
  const [count, setCount] = useState(10);

  const analyze = async () => {
    setLoading(true);
    setError(null);
    setResults([]);
    try {
      const emailRes = await fetch(`/api/emails?count=${count}`, {
        headers: { Authorization: `Bearer ${(session as any).accessToken}` },
      });
      const { emails } = await emailRes.json();

      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails, language }),
      });
      const data = await analyzeRes.json();
      setResults(data);
    } catch (e) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const importanceColor = (label: string) => {
    switch (label) {
      case "Critical": return { bar: "#ef4444", badge: "rgba(239,68,68,0.15)", text: "#ef4444" };
      case "High":     return { bar: "#f97316", badge: "rgba(249,115,22,0.15)", text: "#f97316" };
      case "Medium":   return { bar: "#eab308", badge: "rgba(234,179,8,0.15)",  text: "#eab308" };
      default:         return { bar: "#6b7280", badge: "rgba(107,114,128,0.15)", text: "#9ca3af" };
    }
  };
  const urgencyIcon = (u: string) => ({"Immediate":"🔴","Today":"🟠","This Week":"🟡","No Rush":"🟢"}[u] || "⚪");

  return (
    <div style={{ minHeight: "100vh", background: "#0a0d14", color: "#e8e6e1", fontFamily: "Georgia, serif" }}>
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "28px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.02)" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#c9a84c", boxShadow: "0 0 12px #c9a84c" }} />
            <span style={{ fontFamily: "monospace", fontSize: "11px", letterSpacing: "0.2em", color: "#c9a84c", textTransform: "uppercase" }}>Inbox Intelligence</span>
          </div>
          <h1 style={{ margin: "6px 0 0", fontSize: "28px", fontWeight: 400, color: "#f5f0e8" }}>Email Priority Briefing</h1>
        </div>
        {session && (
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span style={{ fontSize: "12px", color: "#5a6070", fontFamily: "monospace" }}>{session.user?.email}</span>
            <button onClick={() => signOut()} style={{ background: "transparent", color: "#5a6070", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px", padding: "8px 16px", fontSize: "12px", cursor: "pointer", fontFamily: "monospace" }}>Sign Out</button>
          </div>
        )}
      </div>

      <div style={{ padding: "40px 48px", maxWidth: "960px", margin: "0 auto" }}>
        {!session ? (
          <div style={{ textAlign: "center", paddingTop: "80px" }}>
            <p style={{ color: "#8b8680", marginBottom: "32px", fontSize: "15px", lineHeight: 1.7 }}>
              Connect your Gmail account to automatically fetch and rank your emails by priority.
            </p>
            <button onClick={() => signIn("google")} style={{ background: "#c9a84c", color: "#0a0d14", border: "none", borderRadius: "6px", padding: "14px 36px", fontSize: "14px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", fontFamily: "monospace" }}>
              Connect Gmail
            </button>
          </div>
        ) : results.length === 0 ? (
          <div>
            <p style={{ fontSize: "15px", color: "#8b8680", lineHeight: 1.7, marginBottom: "28px" }}>
              Fetch your latest unread emails and let Claude rank them by priority.
            </p>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <button onClick={analyze} disabled={loading} style={{ background: loading ? "rgba(201,168,76,0.3)" : "#c9a84c", color: "#0a0d14", border: "none", borderRadius: "6px", padding: "13px 32px", fontSize: "13px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", cursor: loading ? "not-allowed" : "pointer", fontFamily: "monospace" }}>
                {loading ? "Analyzing..." : "Fetch & Analyze"}
              </button>
              <select value={count} onChange={e => setCount(+e.target.value)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#a09890", padding: "13px 16px", fontSize: "12px", fontFamily: "monospace", cursor: "pointer", outline: "none" }}>
                {[5,10,20,30].map(n => <option key={n} value={n} style={{ background: "#0a0d14" }}>{n} emails</option>)}
              </select>
              <select value={language} onChange={e => setLanguage(e.target.value)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#a09890", padding: "13px 16px", fontSize: "12px", fontFamily: "monospace", cursor: "pointer", outline: "none" }}>
                {LANGUAGES.map(l => <option key={l} value={l} style={{ background: "#0a0d14" }}>{l}</option>)}
              </select>
            </div>
            {error && <div style={{ marginTop: "16px", color: "#ef4444", fontSize: "13px", fontFamily: "monospace" }}>⚠ {error}</div>}
            {loading && (
              <div style={{ marginTop: "32px", display: "flex", gap: "8px", alignItems: "center" }}>
                {[0,1,2].map(i => <div key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#c9a84c", animation: `pulse 1.2s ease-in-out ${i*0.2}s infinite` }} />)}
                <span style={{ color: "#5a6070", fontSize: "12px", fontFamily: "monospace", marginLeft: "8px" }}>Reading your inbox...</span>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
              <div>
                <div style={{ fontSize: "11px", color: "#c9a84c", letterSpacing: "0.2em", fontFamily: "monospace", marginBottom: "6px" }}>PRIORITY RANKING</div>
                <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 400, color: "#f5f0e8" }}>{results.length} emails analyzed</h2>
              </div>
              <button onClick={() => setResults([])} style={{ background: "transparent", color: "#5a6070", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px", padding: "10px 18px", fontSize: "12px", letterSpacing: "0.08em", cursor: "pointer", fontFamily: "monospace" }}>← New Analysis</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {results.map((email, i) => {
                const colors = importanceColor(email.importanceLabel);
                return (
                  <div key={i} style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderLeft: `3px solid ${colors.bar}`, borderRadius: "8px", padding: "24px 28px" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.045)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.025)")}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                      <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                        <span style={{ fontSize: "28px", fontWeight: 300, color: "rgba(255,255,255,0.15)", fontFamily: "monospace", minWidth: "36px" }}>#{email.rank}</span>
                        <div>
                          <div style={{ fontSize: "16px", fontWeight: 600, color: "#f0ece4", marginBottom: "2px" }}>{email.subject}</div>
                          <div style={{ fontSize: "12px", color: "#6b7280", fontFamily: "monospace" }}>{email.sender}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <span>{urgencyIcon(email.urgency)}</span>
                        <span style={{ fontSize: "11px", fontFamily: "monospace", padding: "4px 10px", borderRadius: "20px", background: colors.badge, color: colors.text }}>{email.importanceLabel}</span>
                        <span style={{ fontSize: "11px", fontFamily: "monospace", padding: "4px 10px", borderRadius: "20px", background: "rgba(255,255,255,0.05)", color: "#6b7280" }}>{email.category}</span>
                      </div>
                    </div>
                    <div style={{ marginBottom: "16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                        <span style={{ fontSize: "10px", color: "#4a5060", fontFamily: "monospace", letterSpacing: "0.1em" }}>IMPORTANCE SCORE</span>
                        <span style={{ fontSize: "11px", color: colors.text, fontFamily: "monospace" }}>{email.importance}/10</span>
                      </div>
                      <div style={{ height: "3px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${email.importance * 10}%`, background: colors.bar, borderRadius: "2px" }} />
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                      <div>
                        <div style={{ fontSize: "10px", color: "#4a5060", fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: "6px" }}>SUMMARY</div>
                        <p style={{ margin: 0, fontSize: "13px", color: "#a09890", lineHeight: 1.7 }}>{email.summary}</p>
                      </div>
                      <div>
                        <div style={{ fontSize: "10px", color: "#c9a84c", fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: "6px" }}>✦ HOW TO RESPOND</div>
                        <p style={{ margin: 0, fontSize: "13px", color: "#c4b89a", lineHeight: 1.7 }}>{email.responseAdvice}</p>
                      </div>
                    </div>
                    <div style={{ marginTop: "14px", paddingTop: "14px", borderTop: "1px solid rgba(255,255,255,0.05)", fontSize: "11px", color: "#4a5060", fontFamily: "monospace" }}>
                      {urgencyIcon(email.urgency)} RESPOND: {email.urgency?.toUpperCase()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:.3;transform:scale(.8)} 50%{opacity:1;transform:scale(1.2)} }`}</style>
    </div>
  );
}