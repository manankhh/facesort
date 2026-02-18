"use client";

import { useState, useRef } from "react";

type Step = "idle" | "validating" | "ready" | "error";

export default function Home() {
  const [folderLink, setFolderLink] = useState("");
  const [step, setStep] = useState<Step>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [albumName, setAlbumName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const isGooglePhotosLink = (url: string) => {
    // Accept both full URLs and short links
    return /photos\.(google\.com\/(album|share|u\/\d+\/album)|app\.goo\.gl)/.test(url);
  };

  const handleAnalyze = () => {
    if (!folderLink.trim()) {
      setStep("error");
      setErrorMsg("Please paste a Google Photos album link first.");
      return;
    }
    if (!isGooglePhotosLink(folderLink)) {
      setStep("error");
      setErrorMsg(
        "That doesn't look like a Google Photos album link. It should look like photos.google.com/album/... or photos.app.goo.gl/..."
      );
      return;
    }
    setStep("validating");
    setErrorMsg("");
    // Simulate async validation
    setTimeout(() => {
      // Extract a pseudo album name from URL for demo
      const parts = folderLink.split("/");
      const slug = parts[parts.length - 1]?.slice(0, 16) || "Album";
      setAlbumName("Album · " + slug + "…");
      setStep("ready");
    }, 1400);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleAnalyze();
  };

  const handleReset = () => {
    setStep("idle");
    setFolderLink("");
    setAlbumName("");
    setErrorMsg("");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@400;500&display=swap');

        :root {
          --bg: #0b0c10;
          --surface: #111318;
          --surface-2: #191c23;
          --border: #252830;
          --accent: #e8ff47;
          --accent-muted: #c6d93a;
          --text: #eeeef0;
          --muted: #6b7280;
          --error: #ff5e5e;
          --radius: 14px;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: var(--bg);
          color: var(--text);
          font-family: 'DM Mono', monospace;
          min-height: 100vh;
          overflow-x: hidden;
        }

        .grain {
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 100;
          opacity: 0.45;
        }

        .glow-blob {
          position: fixed;
          width: 520px;
          height: 520px;
          border-radius: 50%;
          filter: blur(120px);
          pointer-events: none;
          opacity: 0.18;
          background: var(--accent);
          top: -160px;
          right: -120px;
          animation: drift 14s ease-in-out infinite alternate;
        }

        .glow-blob-2 {
          position: fixed;
          width: 340px;
          height: 340px;
          border-radius: 50%;
          filter: blur(100px);
          pointer-events: none;
          opacity: 0.10;
          background: #4bf0ff;
          bottom: -80px;
          left: -80px;
          animation: drift2 18s ease-in-out infinite alternate;
        }

        @keyframes drift {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(-40px, 60px) scale(1.12); }
        }
        @keyframes drift2 {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(30px, -50px) scale(1.08); }
        }

        .wrapper {
          min-height: 100vh;
          display: grid;
          grid-template-rows: auto 1fr auto;
          padding: 0 24px;
        }

        /* ─── Header ─── */
        header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 28px 0 20px;
          border-bottom: 1px solid var(--border);
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }

        .logo-mark {
          width: 32px;
          height: 32px;
          background: var(--accent);
          border-radius: 8px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
        }

        .logo-mark svg { display: block; }

        .logo-name {
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.06em;
          color: var(--text);
          text-transform: uppercase;
        }

        .badge {
          font-size: 10px;
          letter-spacing: 0.1em;
          background: var(--surface-2);
          border: 1px solid var(--border);
          color: var(--muted);
          border-radius: 99px;
          padding: 4px 10px;
          text-transform: uppercase;
        }

        /* ─── Main ─── */
        main {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 0;
          gap: 0;
        }

        .eyebrow {
          font-size: 11px;
          letter-spacing: 0.2em;
          color: var(--accent);
          text-transform: uppercase;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .eyebrow::before,
        .eyebrow::after {
          content: '';
          display: block;
          width: 28px;
          height: 1px;
          background: var(--accent);
          opacity: 0.5;
        }

        h1 {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(42px, 7vw, 78px);
          font-weight: 400;
          line-height: 1.0;
          text-align: center;
          color: var(--text);
          margin-bottom: 16px;
          max-width: 700px;
        }

        h1 em {
          font-style: italic;
          color: var(--accent);
        }

        .subtitle {
          font-size: 13px;
          color: var(--muted);
          text-align: center;
          line-height: 1.7;
          max-width: 420px;
          margin-bottom: 56px;
          letter-spacing: 0.01em;
        }

        /* ─── Card ─── */
        .card {
          width: 100%;
          max-width: 560px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 28px;
          position: relative;
        }

        .card::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: calc(var(--radius) + 1px);
          padding: 1px;
          background: linear-gradient(135deg, rgba(232,255,71,0.2) 0%, transparent 60%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: destination-out;
          mask-composite: exclude;
          pointer-events: none;
        }

        .field-label {
          font-size: 10px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 10px;
          display: block;
        }

        .input-row {
          display: flex;
          gap: 10px;
        }

        input[type="text"] {
          flex: 1;
          background: var(--surface-2);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 13px 16px;
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          color: var(--text);
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          min-width: 0;
        }

        input[type="text"]:focus {
          border-color: rgba(232,255,71,0.4);
          box-shadow: 0 0 0 3px rgba(232,255,71,0.07);
        }

        input[type="text"]::placeholder {
          color: #3a3e49;
        }

        .btn-analyze {
          background: var(--accent);
          color: #0b0c10;
          border: none;
          border-radius: 8px;
          padding: 13px 22px;
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.05em;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.18s, transform 0.12s;
          position: relative;
          overflow: hidden;
        }

        .btn-analyze:hover {
          background: var(--accent-muted);
          transform: translateY(-1px);
        }

        .btn-analyze:active {
          transform: translateY(0);
        }

        .btn-analyze:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .error-msg {
          margin-top: 12px;
          font-size: 11px;
          color: var(--error);
          display: flex;
          align-items: flex-start;
          gap: 7px;
          line-height: 1.5;
        }

        /* ─── Status states ─── */
        .status-bar {
          margin-top: 16px;
          border-top: 1px solid var(--border);
          padding-top: 16px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 11px;
        }

        .spinner {
          width: 14px;
          height: 14px;
          border: 2px solid var(--border);
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .status-validating { color: var(--muted); }

        .status-ready {
          color: var(--accent);
        }

        .dot-ready {
          width: 8px;
          height: 8px;
          background: var(--accent);
          border-radius: 50%;
          flex-shrink: 0;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(232,255,71,0.4); }
          50%       { opacity: 0.7; box-shadow: 0 0 0 5px rgba(232,255,71,0); }
        }

        .btn-start {
          margin-left: auto;
          background: transparent;
          border: 1px solid var(--accent);
          border-radius: 6px;
          padding: 5px 14px;
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          color: var(--accent);
          cursor: pointer;
          letter-spacing: 0.05em;
          transition: background 0.18s, color 0.18s;
        }

        .btn-start:hover {
          background: var(--accent);
          color: #0b0c10;
        }

        .btn-reset {
          margin-left: auto;
          background: transparent;
          border: none;
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          color: var(--muted);
          cursor: pointer;
          text-decoration: underline;
          letter-spacing: 0.04em;
        }

        .btn-reset:hover { color: var(--text); }

        /* ─── Steps hint ─── */
        .steps {
          display: flex;
          gap: 32px;
          margin-top: 52px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .step-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          text-align: center;
          max-width: 120px;
          opacity: 0.5;
          transition: opacity 0.2s;
        }

        .step-item:hover { opacity: 0.9; }

        .step-num {
          font-size: 10px;
          letter-spacing: 0.15em;
          color: var(--accent);
          border: 1px solid rgba(232,255,71,0.3);
          width: 28px;
          height: 28px;
          display: grid;
          place-items: center;
          border-radius: 6px;
        }

        .step-text {
          font-size: 11px;
          color: var(--muted);
          line-height: 1.5;
        }

        .step-connector {
          width: 32px;
          height: 1px;
          background: var(--border);
          align-self: center;
          margin-top: -18px;
          flex-shrink: 0;
        }

        /* ─── Footer ─── */
        footer {
          border-top: 1px solid var(--border);
          padding: 20px 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 10px;
          color: var(--muted);
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .footer-links {
          display: flex;
          gap: 20px;
        }

        .footer-links a {
          color: var(--muted);
          text-decoration: none;
          transition: color 0.2s;
        }
        .footer-links a:hover { color: var(--text); }

        /* ─── Responsive ─── */
        @media (max-width: 520px) {
          .input-row { flex-direction: column; }
          .steps { gap: 12px; }
          .step-connector { display: none; }
        }
      `}</style>

      <div className="grain" />
      <div className="glow-blob" />
      <div className="glow-blob-2" />

      <div className="wrapper">
        {/* Header */}
        <header>
          <a href="/" className="logo">
            <span className="logo-mark">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="7" cy="7" r="4" stroke="#0b0c10" strokeWidth="1.6" />
                <circle cx="12" cy="12" r="3.2" stroke="#0b0c10" strokeWidth="1.6" />
                <path d="M10 7h4M9 11v-4" stroke="#0b0c10" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </span>
            <span className="logo-name">FaceSort</span>
          </a>
          <span className="badge">Beta</span>
        </header>

        {/* Main */}
        <main>
          <span className="eyebrow">AI · Face Detection</span>

          <h1>
            Find every <em>face</em>
            <br />in your photos
          </h1>

          <p className="subtitle">
            Paste a Google Photos album link — FaceSort scans each photo,
            identifies unique people, and picks the best portrait for each.
          </p>

          {/* Input Card */}
          <div className="card">
            <label className="field-label" htmlFor="folder-link">
              Google Photos Album URL
            </label>
            <div className="input-row">
              <input
                ref={inputRef}
                id="folder-link"
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
              />
              <button
                className="btn-analyze"
                onClick={handleAnalyze}
                disabled={step === "validating" || step === "ready"}
              >
                {step === "validating" ? "Checking…" : "Analyze"}
              </button>
            </div>

            {/* Error */}
            {step === "error" && (
              <div className="error-msg">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 13 13"
                  fill="none"
                  style={{ flexShrink: 0, marginTop: 1 }}
                >
                  <circle cx="6.5" cy="6.5" r="5.5" stroke="#ff5e5e" strokeWidth="1.2" />
                  <path
                    d="M6.5 4v3M6.5 8.5v.5"
                    stroke="#ff5e5e"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
                {errorMsg}
              </div>
            )}

            {/* Validating */}
            {step === "validating" && (
              <div className="status-bar status-validating">
                <span className="spinner" />
                Connecting to album…
              </div>
            )}

            {/* Ready */}
            {step === "ready" && (
              <div className="status-bar status-ready">
                <span className="dot-ready" />
                <span style={{ color: "var(--muted)" }}>
                  Album connected —{" "}
                  <span style={{ color: "var(--text)" }}>{albumName}</span>
                </span>
                <button className="btn-start" onClick={() => alert("Next: scan & detect faces!")}>
                  Start Scan →
                </button>
                <button className="btn-reset" onClick={handleReset}>
                  reset
                </button>
              </div>
            )}
          </div>

          {/* Steps */}
          <div className="steps">
            {[
              { n: "01", label: "Paste album link" },
              { n: "02", label: "Scan all photos" },
              { n: "03", label: "Detect faces" },
              { n: "04", label: "Export portraits" },
            ].map((s, i, arr) => (
              <>
                <div className="step-item" key={s.n}>
                  <span className="step-num">{s.n}</span>
                  <span className="step-text">{s.label}</span>
                </div>
                {i < arr.length - 1 && (
                  <div className="step-connector" key={`c${i}`} />
                )}
              </>
            ))}
          </div>
        </main>

        {/* Footer */}
        <footer>
          <span>© 2026 FaceSort</span>
          <div className="footer-links">
            <a href="#">Docs</a>
            <a href="#">Privacy</a>
            <a href="#">GitHub</a>
          </div>
        </footer>
      </div>
    </>
  );
}
