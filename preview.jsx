import { useState, useRef } from "react";

export default function Home() {
  const [folderLink, setFolderLink] = useState("");
  const [step, setStep] = useState("idle"); // idle | validating | ready | error
  const [errorMsg, setErrorMsg] = useState("");
  const [albumName, setAlbumName] = useState("");
  const inputRef = useRef(null);

  const isGooglePhotosLink = (url) =>
    /photos\.google\.com\/(album|share|u\/\d+\/album)/.test(url);

  const handleAnalyze = () => {
    if (!folderLink.trim()) {
      setStep("error");
      setErrorMsg("Please paste a Google Photos album link first.");
      return;
    }
    if (!isGooglePhotosLink(folderLink)) {
      setStep("error");
      setErrorMsg("That doesn't look like a Google Photos album link. It should contain photos.google.com/album/…");
      return;
    }
    setStep("validating");
    setErrorMsg("");
    setTimeout(() => {
      const parts = folderLink.split("/");
      const slug = parts[parts.length - 1]?.slice(0, 16) || "Album";
      setAlbumName("Album · " + slug + "…");
      setStep("ready");
    }, 1400);
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") handleAnalyze(); };

  const handleReset = () => {
    setStep("idle");
    setFolderLink("");
    setAlbumName("");
    setErrorMsg("");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0b0c10",
      color: "#eeeef0",
      fontFamily: "'DM Mono', 'Courier New', monospace",
      position: "relative",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@400;500&display=swap');
        @keyframes drift { from { transform: translate(0,0) scale(1); } to { transform: translate(-40px,60px) scale(1.12); } }
        @keyframes drift2 { from { transform: translate(0,0) scale(1); } to { transform: translate(30px,-50px) scale(1.08); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(232,255,71,0.4); }
          50% { opacity: 0.7; box-shadow: 0 0 0 5px rgba(232,255,71,0); }
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .glow1 {
          position:fixed; width:520px; height:520px; border-radius:50%;
          filter:blur(120px); pointer-events:none; opacity:0.15;
          background:#e8ff47; top:-160px; right:-120px;
          animation: drift 14s ease-in-out infinite alternate;
        }
        .glow2 {
          position:fixed; width:340px; height:340px; border-radius:50%;
          filter:blur(100px); pointer-events:none; opacity:0.09;
          background:#4bf0ff; bottom:-80px; left:-80px;
          animation: drift2 18s ease-in-out infinite alternate;
        }
        input:focus { border-color: rgba(232,255,71,0.45) !important; box-shadow: 0 0 0 3px rgba(232,255,71,0.07) !important; }
        input::placeholder { color: #2e323c; }
        .btn-analyze:hover:not(:disabled) { background: #c6d93a !important; transform: translateY(-1px); }
        .btn-analyze:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-start:hover { background: #e8ff47 !important; color: #0b0c10 !important; }
        .step-item:hover { opacity: 0.9 !important; }
        .footer-link:hover { color: #eeeef0 !important; }
        .fade-in { animation: fadeIn 0.3s ease forwards; }
        .spinner {
          width:14px; height:14px; border:2px solid #252830;
          border-top-color:#e8ff47; border-radius:50%;
          animation: spin 0.7s linear infinite; flex-shrink:0;
        }
        .pulse-dot {
          width:8px; height:8px; background:#e8ff47; border-radius:50%;
          flex-shrink:0; animation: pulse 2s ease-in-out infinite;
        }
      `}</style>

      <div className="glow1" />
      <div className="glow2" />

      {/* Header */}
      <header style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"28px 36px 20px", borderBottom:"1px solid #252830",
        position:"relative", zIndex:10,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{
            width:32, height:32, background:"#e8ff47", borderRadius:8,
            display:"grid", placeItems:"center", flexShrink:0,
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="7" cy="7" r="4" stroke="#0b0c10" strokeWidth="1.6" />
              <circle cx="12" cy="12" r="3.2" stroke="#0b0c10" strokeWidth="1.6" />
              <path d="M10 7h4M9 11v-4" stroke="#0b0c10" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <span style={{ fontSize:13, fontWeight:500, letterSpacing:"0.06em", textTransform:"uppercase" }}>
            FaceSort
          </span>
        </div>
        <span style={{
          fontSize:10, letterSpacing:"0.1em", background:"#111318",
          border:"1px solid #252830", color:"#6b7280",
          borderRadius:99, padding:"4px 10px", textTransform:"uppercase",
        }}>Beta</span>
      </header>

      {/* Main */}
      <main style={{
        flex:1, display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
        padding:"80px 24px", position:"relative", zIndex:10,
      }}>
        {/* Eyebrow */}
        <div style={{
          fontSize:11, letterSpacing:"0.2em", color:"#e8ff47",
          textTransform:"uppercase", marginBottom:20,
          display:"flex", alignItems:"center", gap:8,
        }}>
          <span style={{ width:28, height:1, background:"rgba(232,255,71,0.5)", display:"block" }} />
          AI · Face Detection
          <span style={{ width:28, height:1, background:"rgba(232,255,71,0.5)", display:"block" }} />
        </div>

        {/* Heading */}
        <h1 style={{
          fontFamily:"'Instrument Serif', Georgia, serif",
          fontSize:"clamp(42px, 7vw, 72px)",
          fontWeight:400, lineHeight:1.0, textAlign:"center",
          color:"#eeeef0", marginBottom:16, maxWidth:680,
        }}>
          Find every{" "}
          <em style={{ fontStyle:"italic", color:"#e8ff47" }}>face</em>
          <br />in your photos
        </h1>

        <p style={{
          fontSize:13, color:"#6b7280", textAlign:"center",
          lineHeight:1.7, maxWidth:400, marginBottom:52, letterSpacing:"0.01em",
        }}>
          Paste a Google Photos album link — FaceSort scans each photo,
          identifies unique people, and picks the best portrait for each.
        </p>

        {/* Card */}
        <div style={{
          width:"100%", maxWidth:560,
          background:"#111318",
          border:"1px solid #252830",
          borderRadius:14, padding:28,
          position:"relative",
          boxShadow:"0 0 0 1px rgba(232,255,71,0.06), 0 24px 60px rgba(0,0,0,0.5)",
        }}>
          <label style={{
            fontSize:10, letterSpacing:"0.15em", textTransform:"uppercase",
            color:"#6b7280", marginBottom:10, display:"block",
          }}>
            Google Photos Album URL
          </label>
          <div style={{ display:"flex", gap:10 }}>
            <input
              ref={inputRef}
              type="text"
              placeholder="https://photos.google.com/album/…"
              value={folderLink}
              onChange={(e) => {
                setFolderLink(e.target.value);
                if (step === "error" || step === "ready") setStep("idle");
              }}
              onKeyDown={handleKeyDown}
              disabled={step === "validating" || step === "ready"}
              autoFocus
              style={{
                flex:1, background:"#191c23",
                border:"1px solid #252830", borderRadius:8,
                padding:"13px 16px",
                fontFamily:"inherit", fontSize:12,
                color:"#eeeef0", outline:"none",
                transition:"border-color 0.2s, box-shadow 0.2s",
                minWidth:0,
              }}
            />
            <button
              className="btn-analyze"
              onClick={handleAnalyze}
              disabled={step === "validating" || step === "ready"}
              style={{
                background:"#e8ff47", color:"#0b0c10",
                border:"none", borderRadius:8,
                padding:"13px 22px",
                fontFamily:"inherit", fontSize:12, fontWeight:500,
                letterSpacing:"0.05em", cursor:"pointer",
                whiteSpace:"nowrap",
                transition:"background 0.18s, transform 0.12s",
              }}
            >
              {step === "validating" ? "Checking…" : "Analyze"}
            </button>
          </div>

          {/* Error */}
          {step === "error" && (
            <div className="fade-in" style={{
              marginTop:12, fontSize:11, color:"#ff5e5e",
              display:"flex", alignItems:"flex-start", gap:7, lineHeight:1.5,
            }}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ flexShrink:0, marginTop:1 }}>
                <circle cx="6.5" cy="6.5" r="5.5" stroke="#ff5e5e" strokeWidth="1.2" />
                <path d="M6.5 4v3M6.5 8.5v.5" stroke="#ff5e5e" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              {errorMsg}
            </div>
          )}

          {/* Validating */}
          {step === "validating" && (
            <div className="fade-in" style={{
              marginTop:16, borderTop:"1px solid #252830", paddingTop:16,
              display:"flex", alignItems:"center", gap:10,
              fontSize:11, color:"#6b7280",
            }}>
              <div className="spinner" />
              Connecting to album…
            </div>
          )}

          {/* Ready */}
          {step === "ready" && (
            <div className="fade-in" style={{
              marginTop:16, borderTop:"1px solid #252830", paddingTop:16,
              display:"flex", alignItems:"center", gap:10, fontSize:11,
            }}>
              <div className="pulse-dot" />
              <span style={{ color:"#6b7280" }}>
                Album connected —{" "}
                <span style={{ color:"#eeeef0" }}>{albumName}</span>
              </span>
              <button
                className="btn-start"
                onClick={() => alert("Next: scan & detect faces!")}
                style={{
                  marginLeft:"auto", background:"transparent",
                  border:"1px solid #e8ff47", borderRadius:6,
                  padding:"5px 14px", fontFamily:"inherit",
                  fontSize:11, color:"#e8ff47", cursor:"pointer",
                  letterSpacing:"0.05em",
                  transition:"background 0.18s, color 0.18s",
                }}
              >
                Start Scan →
              </button>
              <button
                onClick={handleReset}
                style={{
                  background:"transparent", border:"none",
                  fontFamily:"inherit", fontSize:11,
                  color:"#6b7280", cursor:"pointer",
                  textDecoration:"underline", letterSpacing:"0.04em",
                }}
              >
                reset
              </button>
            </div>
          )}
        </div>

        {/* Steps */}
        <div style={{
          display:"flex", gap:0, marginTop:52,
          justifyContent:"center", flexWrap:"wrap",
          alignItems:"center",
        }}>
          {[
            { n:"01", label:"Paste album link" },
            { n:"02", label:"Scan all photos" },
            { n:"03", label:"Detect faces" },
            { n:"04", label:"Export portraits" },
          ].map((s, i, arr) => (
            <div key={s.n} style={{ display:"flex", alignItems:"center" }}>
              <div
                className="step-item"
                style={{
                  display:"flex", flexDirection:"column",
                  alignItems:"center", gap:8, textAlign:"center",
                  maxWidth:110, opacity:0.45,
                  transition:"opacity 0.2s", padding:"0 8px",
                }}
              >
                <span style={{
                  fontSize:10, letterSpacing:"0.15em", color:"#e8ff47",
                  border:"1px solid rgba(232,255,71,0.3)",
                  width:28, height:28, display:"grid",
                  placeItems:"center", borderRadius:6,
                }}>{s.n}</span>
                <span style={{ fontSize:11, color:"#6b7280", lineHeight:1.5 }}>{s.label}</span>
              </div>
              {i < arr.length - 1 && (
                <div style={{ width:32, height:1, background:"#252830", flexShrink:0 }} />
              )}
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop:"1px solid #252830", padding:"20px 36px",
        display:"flex", alignItems:"center", justifyContent:"space-between",
        fontSize:10, color:"#6b7280", letterSpacing:"0.06em",
        textTransform:"uppercase", position:"relative", zIndex:10,
      }}>
        <span>© 2026 FaceSort</span>
        <div style={{ display:"flex", gap:20 }}>
          {["Docs","Privacy","GitHub"].map(l => (
            <a key={l} className="footer-link" href="#"
              style={{ color:"#6b7280", textDecoration:"none", transition:"color 0.2s" }}>
              {l}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}
