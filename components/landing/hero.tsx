"use client";

import AppPreview from "@/components/landing/app-preview";

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden top-16"
      style={{ padding: "80px 20px 64px" }}
    >
      {/* Dot grid */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage:
            "radial-gradient(ellipse 72% 64% at 50% 42%, black 0%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 72% 64% at 50% 42%, black 0%, transparent 100%)",
        }}
      />

      {/* Amber glow */}
      <div
        aria-hidden="true"
        className="absolute pointer-events-none"
        style={{
          width: 560,
          height: 280,
          background:
            "radial-gradient(ellipse, rgba(217,119,6,0.09) 0%, transparent 70%)",
          top: "38%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Badge */}
      <div
        className="anim-0 relative inline-flex items-center gap-2"
        style={{
          padding: "5px 14px",
          marginBottom: 30,
          borderRadius: 999,
          border: "1px solid var(--amber-border)",
          background: "var(--amber-faint)",
          color: "var(--amber)",
          fontSize: 10.5,
          fontWeight: 500,
          letterSpacing: "0.065em",
          textTransform: "uppercase",
        }}
      >
        <span
          className="pulse-dot shrink-0"
          style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--amber)", display: "inline-block" }}
        />
        Now in open beta
      </div>

      {/* Headline */}
      <h1
        className="anim-1 relative"
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "clamp(44px, 7.5vw, 90px)",
          fontWeight: 400,
          lineHeight: 1.04,
          letterSpacing: "-0.02em",
          color: "var(--text)",
          maxWidth: 840,
        }}
      >
        One room where AI
        <br />
        handles{" "}
        <em style={{ fontStyle: "italic", color: "var(--amber)" }}>
          the tedious parts.
        </em>
      </h1>

      {/* Subheading */}
      <p
        className="anim-2 relative"
        style={{
          marginTop: 22,
          maxWidth: 460,
          fontWeight: 300,
          lineHeight: 1.78,
          letterSpacing: "0.005em",
          fontSize: "clamp(14px, 1.7vw, 17px)",
          color: "var(--text-2)",
        }}
      >
        Studiosynq gives your whole team — developers, designers, writers — five
        AI agents that live right inside your workspace.
      </p>

      {/* CTAs */}
      <div className="anim-3 relative flex flex-wrap items-center justify-center gap-3" style={{ marginTop: 38 }}>
        <a
          href="/dashboard"
          className="inline-flex items-center gap-2 font-medium transition-all duration-200 no-underline"
          style={{
            padding: "11px 26px",
            borderRadius: 999,
            background: "var(--amber)",
            color: "#fff",
            fontSize: 14,
            letterSpacing: "-0.015em",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.86")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
        >
          Start your workspace →
        </a>
        <a
          href="#agents"
          className="inline-flex items-center gap-2 font-normal transition-all duration-200 no-underline backdrop-blur"
          style={{
            padding: "11px 22px",
            borderRadius: 999,
            border: "1px solid var(--border)",
            background: "var(--surface)",
            color: "var(--text-2)",
            fontSize: 14,
            letterSpacing: "-0.01em",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.borderColor = "var(--border-m)";
            el.style.color = "var(--text)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.borderColor = "var(--border)";
            el.style.color = "var(--text-2)";
          }}
        >
          <span style={{ fontSize: 10, opacity: 0.7 }}>▶</span>
          Explore agents
        </a>
      </div>

      {/* Social proof */}
      <div
        className="anim-4 relative flex items-center gap-3"
        style={{ marginTop: 44, color: "var(--text-3)", fontSize: 12 }}
      >
        {/* Avatar stack */}
        <div className="flex">
          {(["AB", "CR", "MK", "+9"] as const).map((init, i) => (
            <div
              key={init}
              className="flex items-center justify-center font-medium rounded-full"
              style={{
                width: 24,
                height: 24,
                fontSize: i === 3 ? 8 : 9,
                background: "var(--bg3)",
                color: "var(--text-2)",
                border: "2px solid var(--bg)",
                marginLeft: i === 0 ? 0 : -6,
              }}
            >
              {init}
            </div>
          ))}
        </div>
        <span>
          Used by 200+ teams &nbsp;·&nbsp;{" "}
          <span style={{ color: "var(--amber)" }}>★★★★★</span>
        </span>
      </div>

      {/* App preview */}
      <div
        className="anim-5 relative w-full"
        style={{ maxWidth: 960, marginTop: 60 }}
      >
        {/* Glow halo behind window */}
        <div
          aria-hidden="true"
          className="absolute pointer-events-none"
          style={{
            inset: -1,
            borderRadius: 14,
            boxShadow:
              "0 0 80px rgba(217,119,6,0.10), 0 0 160px rgba(217,119,6,0.05)",
            zIndex: -1,
          }}
        />
        <AppPreview />
      </div>
    </section>
  );
}
