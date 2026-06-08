"use client";

export default function LandingLoader() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        animation: "ss-fadeIn 0.25s ease",
      }}
    >
      {/* Ambient amber glow */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          width: 480,
          height: 240,
          background:
            "radial-gradient(ellipse, rgba(217,119,6,0.10) 0%, transparent 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
        }}
      />

      {/* Dot grid */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle, rgba(128,128,128,0.08) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage:
            "radial-gradient(ellipse 60% 60% at 50% 50%, black 0%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 60% 60% at 50% 50%, black 0%, transparent 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Wordmark */}
      <p
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "clamp(22px, 4vw, 32px)",
          fontWeight: 400,
          letterSpacing: "-0.02em",
          color: "var(--text)",
          margin: "0 0 20px 0",
        }}
      >
        studio
        <em style={{ fontStyle: "italic", color: "var(--amber)" }}>synq</em>
      </p>

      {/* Liquid loader */}
      <div className="ss-liquid-loader">
        <div className="ss-loading-text">
          Loading
          <span className="ss-dot">.</span>
          <span className="ss-dot">.</span>
          <span className="ss-dot">.</span>
        </div>
        <div className="ss-loader-track">
          <div className="ss-liquid-fill" />
        </div>
      </div>

      <style>{`
        /* ── Entrance ── */
        @keyframes ss-fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        /* ── Liquid fill progress ── */
        @keyframes ss-fillProgress {
          0%   { width: 4px; }
          25%  { width: 25%; }
          50%  { width: 50%; }
          75%  { width: 75%; }
          100% { width: calc(100% - 4px); }
        }

        /* ── Subtle amber shimmer on fill ── */
        @keyframes ss-shimmer {
          0%   { filter: brightness(1); }
          50%  { filter: brightness(1.15); }
          100% { filter: brightness(1); }
        }

        /* ── Text glow (amber-tinted) ── */
        @keyframes ss-textGlow {
          0%, 100% {
            opacity: 0.6;
            text-shadow: 0 0 8px rgba(217, 119, 6, 0.2);
          }
          50% {
            opacity: 1;
            text-shadow: 0 0 16px rgba(217, 119, 6, 0.5);
          }
        }

        /* ── Dot blink ── */
        @keyframes ss-blink {
          0%, 50%  { opacity: 1; }
          51%, 100% { opacity: 0; }
        }

        /* ── Loader shell ── */
        .ss-liquid-loader {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        /* ── "Loading..." text ── */
        .ss-loading-text {
          color: var(--text-2);
          font-family: var(--font-sans);
          font-size: 13px;
          font-weight: 400;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          animation: ss-textGlow 1.6s ease-in-out infinite;
        }

        /* ── Dots ── */
        .ss-dot {
          margin-left: 1px;
          color: var(--amber);
          animation: ss-blink 1.5s infinite;
        }
        .ss-dot:nth-of-type(1) { animation-delay: 0s; }
        .ss-dot:nth-of-type(2) { animation-delay: 0.3s; }
        .ss-dot:nth-of-type(3) { animation-delay: 0.6s; }

        /* ── Track ── */
        .ss-loader-track {
          position: relative;
          width: 180px;
          height: 28px;
          background: var(--bg3);
          border-radius: 14px;
          overflow: hidden;
          box-shadow:
            inset 0 2px 4px rgba(0, 0, 0, 0.35),
            0 1px 0 var(--border);
        }

        /* ── Liquid fill ── */
        .ss-liquid-fill {
          position: absolute;
          top: 2px;
          left: 2px;
          height: calc(100% - 4px);
          background: linear-gradient(
            90deg,
            var(--amber) 0%,
            var(--amber-lt) 50%,
            var(--amber) 100%
          );
          border-radius: 12px;
          animation:
            ss-fillProgress 3s ease-out infinite,
            ss-shimmer 2s ease-in-out infinite;
          box-shadow:
            0 0 14px rgba(217, 119, 6, 0.35),
            inset 0 1px 2px rgba(255, 255, 255, 0.15);
        }
      `}</style>
    </div>
  );
}