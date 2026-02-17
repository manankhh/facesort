"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const ERROR_MESSAGES: Record<string, string> = {
  missing_code:   "Authorization was cancelled. Please try again.",
  access_denied:  "Access was denied. FaceSort needs photo read permission to work.",
  server_error:   "Something went wrong on our end. Please try again.",
};

function AuthContent() {
  const searchParams = useSearchParams();
  const errorKey = searchParams.get("error");
  const errorMsg = errorKey ? (ERROR_MESSAGES[errorKey] ?? "An unknown error occurred.") : null;

  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If already authenticated, redirect home
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then(({ user }) => {
        if (user) window.location.href = "/";
        else setChecking(false);
      })
      .catch(() => setChecking(false));
  }, []);

  if (checking) {
    return (
      <div style={{ display: "grid", placeItems: "center", height: "100vh" }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="wrapper">
      {/* Ambient blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="grain" />

      <div className="center-col">
        {/* Logo */}
        <div className="logo">
          <div className="logo-mark">
            <svg width="22" height="22" viewBox="0 0 18 18" fill="none">
              <circle cx="7" cy="7" r="4" stroke="#0b0c10" strokeWidth="1.6" />
              <circle cx="12" cy="12" r="3.2" stroke="#0b0c10" strokeWidth="1.6" />
              <path d="M10 7h4M9 11v-4" stroke="#0b0c10" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <span className="logo-name">FaceSort</span>
        </div>

        {/* Card */}
        <div className="card">
          <div className="card-top">
            <p className="card-eyebrow">Step 1 of 4</p>
            <h1 className="card-title">Connect your<br />Google Photos</h1>
            <p className="card-subtitle">
              FaceSort needs read-only access to your photos library to scan
              albums and detect faces. No photos are stored permanently.
            </p>
          </div>

          {/* Permissions list */}
          <ul className="perms">
            {[
              { icon: "👁", label: "View your albums", sub: "Read-only. We never modify your library." },
              { icon: "🔒", label: "Encrypted token storage", sub: "Tokens stored securely in Neon DB." },
              { icon: "🚫", label: "No photo uploads", sub: "Images are processed in-memory only." },
            ].map((p) => (
              <li key={p.label} className="perm-item">
                <span className="perm-icon">{p.icon}</span>
                <div>
                  <span className="perm-label">{p.label}</span>
                  <span className="perm-sub">{p.sub}</span>
                </div>
              </li>
            ))}
          </ul>

          {/* Error */}
          {errorMsg && (
            <div className="error-banner">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" stroke="#ff5e5e" strokeWidth="1.3" />
                <path d="M7 4.5v3M7 9.5v.2" stroke="#ff5e5e" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              {errorMsg}
            </div>
          )}

          {/* CTA */}
          <a
            href="/api/auth/login"
            className={`btn-google ${loading ? "loading" : ""}`}
            onClick={() => setLoading(true)}
          >
            {loading ? (
              <span className="btn-spinner" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
            )}
            {loading ? "Redirecting…" : "Continue with Google"}
          </a>

          <p className="card-fine">
            By continuing, you agree to our{" "}
            <a href="#" className="link">Terms</a> and{" "}
            <a href="#" className="link">Privacy Policy</a>.
            FaceSort only requests{" "}
            <code className="code">photoslibrary.readonly</code> scope.
          </p>
        </div>

        {/* Bottom note */}
        <p className="bottom-note">
          Already authorized?{" "}
          <a href="/" className="link">Back to app →</a>
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #0b0c10;
          color: #eeeef0;
          font-family: 'DM Mono', monospace;
        }

        .wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          position: relative;
          overflow: hidden;
        }

        .blob {
          position: fixed;
          border-radius: 50%;
          filter: blur(110px);
          pointer-events: none;
        }

        .blob-1 {
          width: 480px; height: 480px;
          background: #e8ff47;
          top: -180px; right: -140px;
          opacity: 0.12;
          animation: drift1 14s ease-in-out infinite alternate;
        }

        .blob-2 {
          width: 300px; height: 300px;
          background: #47b0ff;
          bottom: -100px; left: -80px;
          opacity: 0.08;
          animation: drift2 18s ease-in-out infinite alternate;
        }

        @keyframes drift1 { to { transform: translate(-30px, 50px) scale(1.1); } }
        @keyframes drift2 { to { transform: translate(20px, -40px) scale(1.07); } }

        .grain {
          position: fixed; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none; z-index: 0; opacity: 0.4;
        }

        .center-col {
          position: relative; z-index: 10;
          display: flex; flex-direction: column;
          align-items: center; gap: 20px;
          width: 100%; max-width: 440px;
        }

        /* Logo */
        .logo {
          display: flex; align-items: center; gap: 10px;
          text-decoration: none; margin-bottom: 8px;
        }
        .logo-mark {
          width: 38px; height: 38px; background: #e8ff47;
          border-radius: 10px; display: grid; place-items: center;
        }
        .logo-name {
          font-size: 14px; font-weight: 500;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: #eeeef0;
        }

        /* Card */
        .card {
          width: 100%; background: #111318;
          border: 1px solid #252830; border-radius: 16px;
          padding: 32px;
          box-shadow: 0 0 0 1px rgba(232,255,71,0.05), 0 24px 60px rgba(0,0,0,0.5);
          position: relative;
        }

        .card::before {
          content: '';
          position: absolute; inset: -1px;
          border-radius: 17px; padding: 1px;
          background: linear-gradient(135deg, rgba(232,255,71,0.18) 0%, transparent 55%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: destination-out;
          mask-composite: exclude;
          pointer-events: none;
        }

        .card-top { margin-bottom: 24px; }

        .card-eyebrow {
          font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase;
          color: #e8ff47; margin-bottom: 12px;
        }

        .card-title {
          font-family: 'Instrument Serif', serif;
          font-size: 32px; font-weight: 400; line-height: 1.1;
          color: #eeeef0; margin-bottom: 12px;
        }

        .card-subtitle {
          font-size: 12px; color: #6b7280;
          line-height: 1.7; letter-spacing: 0.01em;
        }

        /* Permissions */
        .perms {
          list-style: none; margin-bottom: 24px;
          display: flex; flex-direction: column; gap: 14px;
        }

        .perm-item {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 14px; background: #191c23;
          border: 1px solid #252830; border-radius: 10px;
        }

        .perm-icon { font-size: 16px; flex-shrink: 0; line-height: 1; margin-top: 1px; }

        .perm-label {
          display: block; font-size: 12px; color: #d1d5db;
          font-weight: 500; margin-bottom: 2px;
        }

        .perm-sub { font-size: 11px; color: #4b5563; display: block; line-height: 1.4; }

        /* Error */
        .error-banner {
          display: flex; align-items: center; gap: 9px;
          background: rgba(255,94,94,0.08);
          border: 1px solid rgba(255,94,94,0.2);
          border-radius: 8px; padding: 12px 14px;
          font-size: 12px; color: #ff5e5e;
          margin-bottom: 18px; line-height: 1.5;
        }

        /* Google button */
        .btn-google {
          display: flex; align-items: center; justify-content: center;
          gap: 10px; width: 100%;
          background: #eeeef0; color: #0b0c10;
          border: none; border-radius: 10px;
          padding: 15px 20px;
          font-family: 'DM Mono', monospace;
          font-size: 13px; font-weight: 500;
          letter-spacing: 0.04em;
          cursor: pointer; text-decoration: none;
          transition: background 0.18s, transform 0.12s, opacity 0.18s;
          margin-bottom: 16px;
          position: relative;
        }

        .btn-google:hover:not(.loading) {
          background: #fff;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.25);
        }

        .btn-google.loading { opacity: 0.7; pointer-events: none; }

        .btn-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(11,12,16,0.2);
          border-top-color: #0b0c10;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        /* Spinner for checking session */
        .spinner {
          width: 20px; height: 20px;
          border: 2px solid #252830;
          border-top-color: #e8ff47;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        .card-fine {
          font-size: 10px; color: #4b5563; line-height: 1.7;
          text-align: center; letter-spacing: 0.01em;
        }

        .link { color: #9ca3af; text-decoration: underline; }
        .link:hover { color: #e8ff47; }

        .code {
          font-family: 'DM Mono', monospace;
          font-size: 9px; background: #191c23;
          border: 1px solid #252830; border-radius: 4px;
          padding: 1px 5px; color: #e8ff47;
        }

        .bottom-note {
          font-size: 11px; color: #4b5563;
          letter-spacing: 0.02em;
        }
      `}</style>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthContent />
    </Suspense>
  );
}
