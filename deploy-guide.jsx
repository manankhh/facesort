import { useState } from "react";

const steps = [
  {
    id: "google",
    num: "01",
    title: "Google Cloud Setup",
    icon: "🔑",
    time: "8 min",
    color: "#4285F4",
    tasks: [
      { id: "gc1", label: "Create a new Google Cloud project named facesort" },
      { id: "gc2", label: "Enable Google Photos Library API" },
      { id: "gc3", label: "Enable People API (for user profile)" },
      { id: "gc4", label: 'Create OAuth 2.0 Client ID (type: "Web application")' },
      { id: "gc5", label: "Add http://localhost:3000/api/auth/callback as redirect URI" },
      { id: "gc6", label: "Add https://YOUR-APP.vercel.app/api/auth/callback as redirect URI" },
      { id: "gc7", label: "Configure OAuth consent screen + add yourself as test user" },
      { id: "gc8", label: "Copy Client ID and Client Secret" },
    ],
    snippet: null,
    tip: "While your app is unverified, only accounts listed as 'Test users' can sign in. Add yourself immediately.",
  },
  {
    id: "neon",
    num: "02",
    title: "Neon Database",
    icon: "🐘",
    time: "5 min",
    color: "#00e599",
    tasks: [
      { id: "n1", label: "Create Neon project (choose region closest to iad1 / us-east)" },
      { id: "n2", label: "Copy the connection string (DATABASE_URL)" },
      { id: "n3", label: "Run migration: npx drizzle-kit push" },
      { id: "n4", label: "Verify 5 tables exist: users, albums, scans, persons, face_detections" },
    ],
    snippet: `# Option A — Drizzle push (easiest)
npx drizzle-kit push

# Option B — Raw SQL
psql "$DATABASE_URL" -f drizzle/0000_init.sql`,
    tip: "Neon free tier projects auto-suspend after 5 min idle. First request after sleep takes ~1-2s — totally normal.",
  },
  {
    id: "local",
    num: "03",
    title: "Local Dev Setup",
    icon: "💻",
    time: "3 min",
    color: "#e8ff47",
    tasks: [
      { id: "l1", label: "Copy .env.example to .env.local" },
      { id: "l2", label: "Fill in DATABASE_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET" },
      { id: "l3", label: "Set GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback" },
      { id: "l4", label: "Run npm run dev and test sign-in at /auth" },
      { id: "l5", label: "Confirm a row appears in the users table in Neon" },
    ],
    snippet: `# .env.local
DATABASE_URL=postgresql://...@ep-xxx.neon.tech/db?sslmode=require
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback
NEXT_PUBLIC_APP_URL=http://localhost:3000`,
    tip: null,
  },
  {
    id: "github",
    num: "04",
    title: "GitHub Repository",
    icon: "🐙",
    time: "3 min",
    color: "#a78bfa",
    tasks: [
      { id: "gh1", label: "Create new GitHub repo named facesort" },
      { id: "gh2", label: "Push local code to main branch" },
      { id: "gh3", label: "Add GitHub Secret: DATABASE_URL" },
      { id: "gh4", label: "Add GitHub Secret: GOOGLE_CLIENT_ID" },
      { id: "gh5", label: "Add GitHub Secret: GOOGLE_CLIENT_SECRET" },
    ],
    snippet: `git init && git add .
git commit -m "feat: initial FaceSort app"
git remote add origin https://github.com/YOU/facesort.git
git branch -M main && git push -u origin main`,
    tip: "GitHub Secrets (Settings → Secrets → Actions) are used by the CI workflow to run build checks on every PR.",
  },
  {
    id: "vercel",
    num: "05",
    title: "Vercel Deployment",
    icon: "▲",
    time: "5 min",
    color: "#ffffff",
    tasks: [
      { id: "v1", label: "Import GitHub repo at vercel.com → New Project" },
      { id: "v2", label: "Add env var: DATABASE_URL (all environments)" },
      { id: "v3", label: "Add env var: GOOGLE_CLIENT_ID (all environments)" },
      { id: "v4", label: "Add env var: GOOGLE_CLIENT_SECRET (all environments)" },
      { id: "v5", label: "Add env var: GOOGLE_REDIRECT_URI (production URL)" },
      { id: "v6", label: "Add env var: NEXT_PUBLIC_APP_URL (production URL)" },
      { id: "v7", label: "Deploy and copy your production URL" },
      { id: "v8", label: "Add production URL to Google Cloud OAuth redirect URIs" },
      { id: "v9", label: "Test full sign-in flow on live URL" },
    ],
    snippet: null,
    tip: "Preview deployments get unique URLs (facesort-abc.vercel.app). Add https://*.vercel.app/api/auth/callback as a wildcard redirect URI in Google Cloud to make OAuth work on previews.",
  },
];

const envVars = [
  { name: "DATABASE_URL", secret: true, example: "postgresql://user:pass@ep-xxx.neon.tech/db?sslmode=require", note: "From Neon dashboard → Connection Details" },
  { name: "GOOGLE_CLIENT_ID", secret: true, example: "123456789-abc.apps.googleusercontent.com", note: "From Google Cloud → Credentials" },
  { name: "GOOGLE_CLIENT_SECRET", secret: true, example: "GOCSPX-xxxxxxxxxxxxxxxx", note: "From Google Cloud → Credentials" },
  { name: "GOOGLE_REDIRECT_URI", secret: false, example: "https://your-app.vercel.app/api/auth/callback", note: "Must match exactly what's in Google Cloud Console" },
  { name: "NEXT_PUBLIC_APP_URL", secret: false, example: "https://your-app.vercel.app", note: "No trailing slash" },
];

const errors = [
  { code: "redirect_uri_mismatch", fix: "GOOGLE_REDIRECT_URI env var doesn't match exactly what's registered in Google Cloud. Check for trailing slashes, http vs https." },
  { code: "DATABASE_URL not set", fix: "Env var isn't reaching Vercel runtime. Confirm it's set for Production environment and redeploy." },
  { code: "Test user error", fix: "Your Google account isn't listed as a test user. Google Cloud → OAuth consent screen → Test users → Add yourself." },
  { code: "Works local, fails Vercel", fix: "Add your Vercel URL as an authorized redirect URI in Google Cloud Console, then redeploy." },
];

export default function DeployGuide() {
  const [checked, setChecked] = useState({});
  const [activeStep, setActiveStep] = useState("google");
  const [copiedSnippet, setCopiedSnippet] = useState(null);

  const toggle = (id) => setChecked(c => ({ ...c, [id]: !c[id] }));

  const totalTasks = steps.flatMap(s => s.tasks).length;
  const doneTasks = Object.values(checked).filter(Boolean).length;
  const progress = Math.round((doneTasks / totalTasks) * 100);

  const copySnippet = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const activeData = steps.find(s => s.id === activeStep);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0b0c10",
      color: "#eeeef0",
      fontFamily: "'DM Mono','Courier New',monospace",
      display: "flex",
      flexDirection: "column",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #111318; }
        ::-webkit-scrollbar-thumb { background: #252830; border-radius: 2px; }
        .step-tab:hover { background: #191c23 !important; }
        .step-tab.active { background: #191c23 !important; border-left-color: var(--c) !important; }
        .task-row:hover { background: rgba(255,255,255,0.02) !important; }
        .copy-btn:hover { background: #252830 !important; }
        .err-row:hover { background: #191c23 !important; }
        .env-row:hover td { background: rgba(255,255,255,0.02) !important; }
      `}</style>

      {/* Header */}
      <div style={{
        borderBottom: "1px solid #252830",
        padding: "20px 28px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 32, height: 32, background: "#e8ff47",
            borderRadius: 8, display: "grid", placeItems: "center", flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="7" cy="7" r="4" stroke="#0b0c10" strokeWidth="1.6"/>
              <circle cx="12" cy="12" r="3.2" stroke="#0b0c10" strokeWidth="1.6"/>
              <path d="M10 7h4M9 11v-4" stroke="#0b0c10" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>FaceSort</div>
            <div style={{ fontSize: 10, color: "#6b7280", letterSpacing: "0.05em" }}>Deployment Guide</div>
          </div>
        </div>

        {/* Progress */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "#6b7280" }}>{doneTasks}/{totalTasks} tasks done</div>
            <div style={{ fontSize: 10, color: progress === 100 ? "#e8ff47" : "#6b7280" }}>
              {progress === 100 ? "🎉 Ready to ship!" : `${progress}% complete`}
            </div>
          </div>
          <div style={{ width: 80, height: 4, background: "#252830", borderRadius: 2, overflow: "hidden" }}>
            <div style={{
              height: "100%", background: "#e8ff47", borderRadius: 2,
              width: `${progress}%`, transition: "width 0.3s ease",
            }} />
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* Sidebar */}
        <div style={{
          width: 220, flexShrink: 0, borderRight: "1px solid #252830",
          padding: "16px 0", display: "flex", flexDirection: "column", gap: 2,
          overflowY: "auto",
        }}>
          {steps.map(s => {
            const done = s.tasks.filter(t => checked[t.id]).length;
            const isActive = activeStep === s.id;
            const allDone = done === s.tasks.length;
            return (
              <button
                key={s.id}
                className={`step-tab${isActive ? " active" : ""}`}
                onClick={() => setActiveStep(s.id)}
                style={{
                  "--c": s.color,
                  background: isActive ? "#191c23" : "transparent",
                  border: "none",
                  borderLeft: `3px solid ${isActive ? s.color : "transparent"}`,
                  padding: "12px 16px",
                  cursor: "pointer", textAlign: "left",
                  transition: "all 0.15s",
                  display: "flex", alignItems: "center", gap: 10,
                }}
              >
                <span style={{ fontSize: 16, flexShrink: 0 }}>{s.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 11, color: isActive ? "#eeeef0" : "#9ca3af",
                    fontWeight: 500, letterSpacing: "0.02em",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>{s.title}</div>
                  <div style={{ fontSize: 10, color: allDone ? s.color : "#4b5563", marginTop: 2 }}>
                    {allDone ? "✓ Done" : `${done}/${s.tasks.length} · ${s.time}`}
                  </div>
                </div>
              </button>
            );
          })}

          <div style={{ margin: "12px 16px 0", height: 1, background: "#252830" }} />

          {/* Jump to env vars */}
          <button
            className="step-tab"
            onClick={() => setActiveStep("envref")}
            style={{
              background: activeStep === "envref" ? "#191c23" : "transparent",
              border: "none",
              borderLeft: `3px solid ${activeStep === "envref" ? "#6b7280" : "transparent"}`,
              padding: "12px 16px",
              cursor: "pointer", textAlign: "left",
              display: "flex", alignItems: "center", gap: 10,
            }}
          >
            <span style={{ fontSize: 16 }}>📋</span>
            <div style={{ fontSize: 11, color: "#9ca3af" }}>Env Var Reference</div>
          </button>
          <button
            className="step-tab"
            onClick={() => setActiveStep("errors")}
            style={{
              background: activeStep === "errors" ? "#191c23" : "transparent",
              border: "none",
              borderLeft: `3px solid ${activeStep === "errors" ? "#6b7280" : "transparent"}`,
              padding: "12px 16px",
              cursor: "pointer", textAlign: "left",
              display: "flex", alignItems: "center", gap: 10,
            }}
          >
            <span style={{ fontSize: 16 }}>🐛</span>
            <div style={{ fontSize: 11, color: "#9ca3af" }}>Troubleshooting</div>
          </button>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px", maxWidth: 700 }}>

          {/* Step view */}
          {activeData && (
            <div>
              {/* Step header */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                  <span style={{
                    fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase",
                    color: activeData.color, fontWeight: 500,
                  }}>Step {activeData.num}</span>
                  <span style={{ fontSize: 10, color: "#4b5563", letterSpacing: "0.1em" }}>· {activeData.time}</span>
                </div>
                <h2 style={{
                  fontFamily: "'Instrument Serif',Georgia,serif",
                  fontSize: 30, fontWeight: 400, color: "#eeeef0",
                }}>{activeData.title}</h2>
              </div>

              {/* Tasks */}
              <div style={{
                background: "#111318", border: "1px solid #252830",
                borderRadius: 12, marginBottom: 20, overflow: "hidden",
              }}>
                {activeData.tasks.map((t, i) => (
                  <div
                    key={t.id}
                    className="task-row"
                    onClick={() => toggle(t.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "13px 18px",
                      borderBottom: i < activeData.tasks.length - 1 ? "1px solid #1a1d24" : "none",
                      cursor: "pointer", transition: "background 0.15s",
                    }}
                  >
                    <div style={{
                      width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                      border: checked[t.id] ? "none" : "1.5px solid #3a3e49",
                      background: checked[t.id] ? activeData.color : "transparent",
                      display: "grid", placeItems: "center",
                      transition: "all 0.15s",
                    }}>
                      {checked[t.id] && (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5l2.5 2.5L8 3" stroke="#0b0c10" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span style={{
                      fontSize: 12, color: checked[t.id] ? "#4b5563" : "#d1d5db",
                      lineHeight: 1.4, letterSpacing: "0.01em",
                      textDecoration: checked[t.id] ? "line-through" : "none",
                      transition: "all 0.15s",
                    }}>{t.label}</span>
                  </div>
                ))}
              </div>

              {/* Code snippet */}
              {activeData.snippet && (
                <div style={{
                  background: "#111318", border: "1px solid #252830",
                  borderRadius: 12, marginBottom: 20, overflow: "hidden",
                }}>
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 16px", borderBottom: "1px solid #1a1d24",
                  }}>
                    <span style={{ fontSize: 10, color: "#6b7280", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                      Commands
                    </span>
                    <button
                      className="copy-btn"
                      onClick={() => copySnippet(activeData.snippet, activeData.id)}
                      style={{
                        background: "transparent", border: "1px solid #252830",
                        borderRadius: 5, padding: "3px 10px",
                        fontFamily: "inherit", fontSize: 10,
                        color: copiedSnippet === activeData.id ? "#e8ff47" : "#6b7280",
                        cursor: "pointer", transition: "all 0.15s",
                      }}
                    >
                      {copiedSnippet === activeData.id ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <pre style={{
                    padding: "16px 18px", fontSize: 11, lineHeight: 1.7,
                    color: "#9ca3af", overflowX: "auto", whiteSpace: "pre-wrap",
                  }}>{activeData.snippet}</pre>
                </div>
              )}

              {/* Tip */}
              {activeData.tip && (
                <div style={{
                  background: "rgba(232,255,71,0.05)",
                  border: "1px solid rgba(232,255,71,0.15)",
                  borderRadius: 10, padding: "14px 16px",
                  display: "flex", gap: 10, alignItems: "flex-start",
                }}>
                  <span style={{ fontSize: 14, flexShrink: 0 }}>💡</span>
                  <p style={{ fontSize: 11, color: "#9ca3af", lineHeight: 1.7 }}>{activeData.tip}</p>
                </div>
              )}

              {/* Nav buttons */}
              <div style={{
                display: "flex", justifyContent: "space-between",
                marginTop: 32, paddingTop: 20, borderTop: "1px solid #252830",
              }}>
                {steps.findIndex(s => s.id === activeStep) > 0 ? (
                  <button
                    onClick={() => setActiveStep(steps[steps.findIndex(s => s.id === activeStep) - 1].id)}
                    style={{
                      background: "transparent", border: "1px solid #252830",
                      borderRadius: 8, padding: "9px 16px",
                      fontFamily: "inherit", fontSize: 11, color: "#6b7280",
                      cursor: "pointer",
                    }}
                  >← Previous</button>
                ) : <div />}
                {steps.findIndex(s => s.id === activeStep) < steps.length - 1 && (
                  <button
                    onClick={() => setActiveStep(steps[steps.findIndex(s => s.id === activeStep) + 1].id)}
                    style={{
                      background: "#e8ff47", border: "none",
                      borderRadius: 8, padding: "9px 16px",
                      fontFamily: "inherit", fontSize: 11,
                      color: "#0b0c10", fontWeight: 500, cursor: "pointer",
                    }}
                  >Next Step →</button>
                )}
              </div>
            </div>
          )}

          {/* Env Var Reference */}
          {activeStep === "envref" && (
            <div>
              <div style={{ marginBottom: 28 }}>
                <h2 style={{
                  fontFamily: "'Instrument Serif',Georgia,serif",
                  fontSize: 30, fontWeight: 400, marginBottom: 8,
                }}>Environment Variables</h2>
                <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.6 }}>
                  All vars go in <code style={{ color: "#e8ff47" }}>.env.local</code> (local) and Vercel Settings → Environment Variables (production).
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {envVars.map(v => (
                  <div key={v.name} style={{
                    background: "#111318", border: "1px solid #252830",
                    borderRadius: 10, padding: "16px 18px",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <code style={{
                        fontSize: 12, color: "#e8ff47", fontFamily: "inherit",
                        background: "rgba(232,255,71,0.08)", padding: "2px 7px",
                        borderRadius: 4,
                      }}>{v.name}</code>
                      {v.secret && (
                        <span style={{
                          fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase",
                          color: "#ff5e5e", border: "1px solid rgba(255,94,94,0.3)",
                          borderRadius: 4, padding: "1px 6px",
                        }}>Secret</span>
                      )}
                    </div>
                    <div style={{
                      fontSize: 11, color: "#4b5563", fontFamily: "inherit",
                      marginBottom: 4,
                    }}>{v.example}</div>
                    <div style={{ fontSize: 11, color: "#6b7280" }}>↳ {v.note}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Troubleshooting */}
          {activeStep === "errors" && (
            <div>
              <div style={{ marginBottom: 28 }}>
                <h2 style={{
                  fontFamily: "'Instrument Serif',Georgia,serif",
                  fontSize: 30, fontWeight: 400, marginBottom: 8,
                }}>Troubleshooting</h2>
                <p style={{ fontSize: 12, color: "#6b7280" }}>Common deployment errors and their fixes.</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {errors.map(e => (
                  <div key={e.code} className="err-row" style={{
                    background: "#111318", border: "1px solid #252830",
                    borderRadius: 10, padding: "16px 18px",
                    transition: "background 0.15s",
                  }}>
                    <code style={{
                      display: "block", fontSize: 11, color: "#ff5e5e",
                      fontFamily: "inherit", marginBottom: 8,
                    }}>Error: {e.code}</code>
                    <p style={{ fontSize: 11, color: "#9ca3af", lineHeight: 1.6 }}>{e.fix}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
