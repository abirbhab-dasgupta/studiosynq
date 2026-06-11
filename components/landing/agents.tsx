"use client";

const AGENTS = [
  {
    icon: "⚙",
    name: "CodeBuddy",
    role: "for developers",
    desc: "Paste any snippet for instant bug detection, error explanations, and improvement suggestions — no IDE required.",
  },
  {
    icon: "◎",
    name: "ClarityAgent",
    role: "for everyone",
    desc: "Drop in any complex task — writing, design, code, strategy — and get a clear step-by-step breakdown you can act on.",
  },
  {
    icon: "◈",
    name: "ResearchBot",
    role: "live web search",
    desc: "Real-time research with cited sources. Ask anything current and get a structured report back via Tavily search.",
  },
  {
    icon: "▣",
    name: "DesignExpert",
    role: "for designers",
    desc: "UI feedback, presentation structure, and ASCII wireframes — design help that doesn't need design software.",
  },
   {
    icon: "✦",
    name: "EmailWriter",
    role: "draft · improve · reply",
    desc: "Describe the email you need, paste a draft to polish, or drop in a received email to get a sharp professional reply.",
  },
];

const DELAY_CLASS: Record<number, string> = {
  0: "reveal",
  1: "reveal reveal-d1",
  2: "reveal reveal-d2",
  3: "reveal reveal-d3",
  4: "reveal reveal-d4",
};

export default function Agents() {
  return (
    <section
      id="agents"
      className="relative overflow-hidden"
      style={{ background: "var(--bg2)", padding: "80px 20px" }}
    >
      <div style={{ maxWidth: 1140, margin: "0 auto" }}>
        <div className="reveal">
          <SectionTag>Five agents · every user type</SectionTag>
        </div>

        <h2
          className="reveal reveal-d1"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(30px, 3.8vw, 48px)",
            fontWeight: 400,
            lineHeight: 1.12,
            letterSpacing: "-0.02em",
            color: "var(--text)",
            maxWidth: 560,
            marginTop: 0,
          }}
        >
          Your team&apos;s AI,{" "}
          <em style={{ fontStyle: "italic", color: "var(--amber)" }}>built in.</em>
        </h2>

        <p
          className="reveal reveal-d2"
          style={{
            marginTop: 14,
            maxWidth: 460,
            fontWeight: 300,
            lineHeight: 1.8,
            fontSize: 16,
            color: "var(--text-2)",
          }}
        >
          Not a chatbot you switch to. Five specialized agents that live inside
          your workspace — ready the moment you need them.
        </p>

        {/* Grid */}
        <div
          className="agents-grid"
          style={{ marginTop: 48 }}
        >
          {AGENTS.map((agent, i) => (
            <div
              key={agent.name}
              className={`agent-card ${DELAY_CLASS[i]}`}
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: 24,
                transition: "border-color 0.28s, transform 0.28s, box-shadow 0.28s",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "var(--amber-border)";
                el.style.transform = "translateY(-3px)";
                el.style.boxShadow = "0 16px 40px rgba(0,0,0,0.22)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "var(--border)";
                el.style.transform = "translateY(0)";
                el.style.boxShadow = "none";
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  border: "1px solid var(--amber-border)",
                  background: "var(--amber-faint)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  marginBottom: 16,
                }}
              >
                {agent.icon}
              </div>

              {/* Name */}
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 500,
                  color: "var(--text)",
                  marginBottom: 6,
                  letterSpacing: "-0.015em",
                }}
              >
                {agent.name}
              </div>

              {/* Role */}
              <div
                style={{
                  display: "inline-block",
                  fontFamily: "var(--font-mono)",
                  fontSize: 9,
                  color: "var(--amber)",
                  background: "var(--amber-faint)",
                  border: "1px solid var(--amber-border)",
                  padding: "2px 7px",
                  borderRadius: 4,
                  marginBottom: 12,
                }}
              >
                {agent.role}
              </div>

              {/* Desc */}
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 300,
                  color: "var(--text-2)",
                  lineHeight: 1.75,
                }}
              >
                {agent.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Responsive grid CSS */}
      <style>{`
        .agents-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }
        @media (max-width: 900px) {
          .agents-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 560px) {
          .agents-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  );
}

/* ── Shared section tag ── */
export function SectionTag({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "4px 12px",
        marginBottom: 18,
        borderRadius: 999,
        border: "1px solid var(--amber-border)",
        background: "var(--amber-faint)",
        color: "var(--amber)",
        fontSize: 10,
        fontWeight: 500,
        letterSpacing: "0.07em",
        textTransform: "uppercase",
      }}
    >
      {children}
    </div>
  );
}
