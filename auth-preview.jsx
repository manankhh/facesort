import { useState } from "react";

const ERROR_MESSAGES = {
  missing_code:  "Authorization was cancelled. Please try again.",
  access_denied: "Access was denied. FaceSort needs photo read permission to work.",
  server_error:  "Something went wrong on our end. Please try again.",
};

export default function AuthPage() {
  const [loading, setLoading] = useState(false);
  // Simulate error state for demo — toggle to see error UI
  const [showError, setShowError] = useState(false);

  return (
    <div style={{
      minHeight:"100vh", background:"#0b0c10", color:"#eeeef0",
      fontFamily:"'DM Mono','Courier New',monospace",
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:"40px 20px", position:"relative", overflow:"hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@400;500&display=swap');
        @keyframes drift1 { to { transform: translate(-30px,50px) scale(1.1); } }
        @keyframes drift2 { to { transform: translate(20px,-40px) scale(1.07); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .card-anim { animation: fadeIn 0.5s ease forwards; }
        .btn-g:hover:not(.loading) {
          background:#fff !important;
          transform:translateY(-1px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.3) !important;
        }
        .link-hover:hover { color:#e8ff47 !important; }
        .perm-row:hover { border-color:#333740 !important; }
      `}</style>

      {/* Blobs */}
      <div style={{
        position:"fixed", width:480, height:480, borderRadius:"50%",
        filter:"blur(110px)", background:"#e8ff47",
        top:-180, right:-140, opacity:0.12, pointerEvents:"none",
        animation:"drift1 14s ease-in-out infinite alternate",
      }} />
      <div style={{
        position:"fixed", width:300, height:300, borderRadius:"50%",
        filter:"blur(100px)", background:"#47b0ff",
        bottom:-100, left:-80, opacity:0.08, pointerEvents:"none",
        animation:"drift2 18s ease-in-out infinite alternate",
      }} />

      {/* Center column */}
      <div style={{
        position:"relative", zIndex:10,
        display:"flex", flexDirection:"column",
        alignItems:"center", gap:20,
        width:"100%", maxWidth:440,
      }}>
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
          <div style={{
            width:38, height:38, background:"#e8ff47",
            borderRadius:10, display:"grid", placeItems:"center",
          }}>
            <svg width="22" height="22" viewBox="0 0 18 18" fill="none">
              <circle cx="7" cy="7" r="4" stroke="#0b0c10" strokeWidth="1.6"/>
              <circle cx="12" cy="12" r="3.2" stroke="#0b0c10" strokeWidth="1.6"/>
              <path d="M10 7h4M9 11v-4" stroke="#0b0c10" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span style={{ fontSize:14, fontWeight:500, letterSpacing:"0.08em", textTransform:"uppercase" }}>
            FaceSort
          </span>
        </div>

        {/* Card */}
        <div className="card-anim" style={{
          width:"100%", background:"#111318",
          border:"1px solid #252830", borderRadius:16, padding:32,
          boxShadow:"0 0 0 1px rgba(232,255,71,0.05), 0 24px 60px rgba(0,0,0,0.5)",
          position:"relative",
        }}>
          {/* Gradient border highlight */}
          <div style={{
            position:"absolute", inset:-1, borderRadius:17,
            background:"linear-gradient(135deg, rgba(232,255,71,0.18) 0%, transparent 55%)",
            WebkitMask:"linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite:"destination-out",
            maskComposite:"exclude", pointerEvents:"none",
          }} />

          {/* Header */}
          <div style={{ marginBottom:24 }}>
            <p style={{
              fontSize:10, letterSpacing:"0.18em", textTransform:"uppercase",
              color:"#e8ff47", marginBottom:12,
            }}>Step 1 of 4</p>
            <h1 style={{
              fontFamily:"'Instrument Serif',Georgia,serif",
              fontSize:32, fontWeight:400, lineHeight:1.1,
              color:"#eeeef0", marginBottom:12,
            }}>
              Connect your<br/>Google Photos
            </h1>
            <p style={{ fontSize:12, color:"#6b7280", lineHeight:1.7, letterSpacing:"0.01em" }}>
              FaceSort needs read-only access to your photos library to scan albums and detect faces. No photos are stored permanently.
            </p>
          </div>

          {/* Permissions */}
          <div style={{ marginBottom:24, display:"flex", flexDirection:"column", gap:10 }}>
            {[
              { icon:"👁", label:"View your albums", sub:"Read-only. We never modify your library." },
              { icon:"🔒", label:"Encrypted token storage", sub:"Tokens stored securely in Neon DB." },
              { icon:"🚫", label:"No photo uploads", sub:"Images are processed in-memory only." },
            ].map((p) => (
              <div key={p.label} className="perm-row" style={{
                display:"flex", alignItems:"flex-start", gap:12,
                padding:14, background:"#191c23",
                border:"1px solid #252830", borderRadius:10,
                transition:"border-color 0.2s",
              }}>
                <span style={{ fontSize:16, flexShrink:0, marginTop:1 }}>{p.icon}</span>
                <div>
                  <span style={{ display:"block", fontSize:12, color:"#d1d5db", fontWeight:500, marginBottom:2 }}>
                    {p.label}
                  </span>
                  <span style={{ fontSize:11, color:"#4b5563", lineHeight:1.4 }}>{p.sub}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Error (demo toggle) */}
          {showError && (
            <div style={{
              display:"flex", alignItems:"center", gap:9,
              background:"rgba(255,94,94,0.08)",
              border:"1px solid rgba(255,94,94,0.2)",
              borderRadius:8, padding:"12px 14px",
              fontSize:12, color:"#ff5e5e", marginBottom:18, lineHeight:1.5,
            }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink:0 }}>
                <circle cx="7" cy="7" r="6" stroke="#ff5e5e" strokeWidth="1.3"/>
                <path d="M7 4.5v3M7 9.5v.2" stroke="#ff5e5e" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              {ERROR_MESSAGES.access_denied}
            </div>
          )}

          {/* CTA */}
          <button
            className={`btn-g${loading ? " loading" : ""}`}
            onClick={() => setLoading(l => !l)}
            style={{
              display:"flex", alignItems:"center", justifyContent:"center",
              gap:10, width:"100%",
              background:"#eeeef0", color:"#0b0c10",
              border:"none", borderRadius:10, padding:"15px 20px",
              fontFamily:"inherit", fontSize:13, fontWeight:500,
              letterSpacing:"0.04em", cursor:"pointer",
              transition:"background 0.18s, transform 0.12s, box-shadow 0.18s",
              marginBottom:16, opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <div style={{
                width:16, height:16,
                border:"2px solid rgba(11,12,16,0.2)",
                borderTopColor:"#0b0c10",
                borderRadius:"50%",
                animation:"spin 0.7s linear infinite",
              }} />
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
            )}
            {loading ? "Redirecting to Google…" : "Continue with Google"}
          </button>

          <p style={{ fontSize:10, color:"#4b5563", lineHeight:1.7, textAlign:"center", letterSpacing:"0.01em" }}>
            By continuing you agree to our{" "}
            <a href="#" className="link-hover" style={{ color:"#9ca3af", transition:"color 0.2s" }}>Terms</a> and{" "}
            <a href="#" className="link-hover" style={{ color:"#9ca3af", transition:"color 0.2s" }}>Privacy Policy</a>.
            {" "}FaceSort only requests{" "}
            <code style={{
              fontFamily:"inherit", fontSize:9, background:"#191c23",
              border:"1px solid #252830", borderRadius:4, padding:"1px 5px", color:"#e8ff47",
            }}>photoslibrary.readonly</code> scope.
          </p>
        </div>

        {/* Demo toggle */}
        <button
          onClick={() => setShowError(e => !e)}
          style={{
            background:"transparent", border:"1px solid #252830",
            borderRadius:6, padding:"5px 14px", fontFamily:"inherit",
            fontSize:10, color:"#6b7280", cursor:"pointer",
            letterSpacing:"0.06em", textTransform:"uppercase",
          }}
        >
          {showError ? "Hide" : "Preview"} error state
        </button>

        <p style={{ fontSize:11, color:"#4b5563", letterSpacing:"0.02em" }}>
          Already authorized?{" "}
          <a href="#" className="link-hover" style={{ color:"#9ca3af", transition:"color 0.2s" }}>
            Back to app →
          </a>
        </p>
      </div>
    </div>
  );
}
