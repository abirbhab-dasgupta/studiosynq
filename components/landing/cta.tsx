"use client";

export default function Cta() {
  return (
    <section
      id="cta"
      className="relative overflow-hidden text-center"
      style={{ padding: "112px 20px" }}
    >
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="absolute pointer-events-none"
        style={{
          width: 560,
          height: 280,
          background:
            "radial-gradient(ellipse, rgba(217,119,6,0.07) 0%, transparent 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      <h2
        className="reveal relative"
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "clamp(32px, 4.8vw, 64px)",
          fontWeight: 400,
          lineHeight: 1.08,
          letterSpacing: "-0.025em",
          color: "var(--text)",
          maxWidth: 640,
          margin: "0 auto 20px",
        }}
      >
        Your workspace,
        <br />
        <em style={{ fontStyle: "italic", color: "var(--amber)" }}>supercharged.</em>
      </h2>

      <p
        className="reveal reveal-d1 relative"
        style={{
          fontSize: 16,
          fontWeight: 300,
          color: "var(--text-2)",
          marginBottom: 36,
          maxWidth: 400,
          marginLeft: "auto",
          marginRight: "auto",
          lineHeight: 1.78,
        }}
      >
        Join teams who&apos;ve stopped context-switching and started actually
        finishing things.
      </p>

      <div
        className="reveal reveal-d2 relative flex flex-wrap justify-center"
        style={{ gap: 12 }}
      >
        <a
          href="/auth/sign-up"
          className="inline-flex items-center gap-2 font-medium transition-all duration-200 no-underline bg-(--amber) text-white hover:opacity-85"
          style={{
            padding: "11px 26px",
            borderRadius: 999,
            fontSize: 14,
            letterSpacing: "-0.015em",
          }}
        >
          Start free — no card needed →
        </a>
      </div>
    </section>
  );
}