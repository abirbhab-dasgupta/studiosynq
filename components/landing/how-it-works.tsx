import { SectionTag } from "@/components/landing/agents";

const STEPS = [
  {
    num: "1",
    title: "Create a room",
    desc: "Name it, set a focus topic, invite your team — or go solo.",
  },
  {
    num: "2",
    title: "Pick your agent",
    desc: "Five agents live in the sidebar. Click one and paste your input.",
  },
  {
    num: "3",
    title: "Ship faster",
    desc: "Get instant output — code review, research report, docs, plan — and keep working.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how"
      className="text-center"
      style={{ background: "var(--bg2)", padding: "80px 20px" }}
    >
      <div style={{ maxWidth: 960, margin: "0 auto" }}>

        <h2
          className="reveal reveal-d1"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(30px, 3.8vw, 48px)",
            fontWeight: 400,
            lineHeight: 1.12,
            letterSpacing: "-0.02em",
            color: "var(--text)",
            margin: "0 auto",
          }}
        >
          Dead simple,{" "}
          <em style={{ fontStyle: "italic", color: "var(--amber)" }}>by design.</em>
        </h2>

        {/* Steps */}
        <div className="steps-row" style={{ marginTop: 56 }}>
          {STEPS.map((step, i) => (
            <div
              key={step.num}
              className={`reveal${i === 1 ? " reveal-d1" : i === 2 ? " reveal-d2" : ""}`}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}
            >
              <div
                style={{
                  position: "relative",
                  zIndex: 1,
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  border: "1px solid var(--border)",
                  background: "var(--bg3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-serif)",
                  fontSize: 24,
                  fontWeight: 400,
                  color: "var(--amber)",
                }}
              >
                {step.num}
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 500,
                  color: "var(--text)",
                  letterSpacing: "-0.015em",
                }}
              >
                {step.title}
              </div>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 300,
                  color: "var(--text-2)",
                  lineHeight: 1.75,
                  maxWidth: 200,
                }}
              >
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .steps-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 28px;
          position: relative;
        }
        /* Connecting line between steps — desktop only */
        .steps-row::before {
          content: '';
          position: absolute;
          top: 30px;
          left: calc(16.66% + 14px);
          right: calc(16.66% + 14px);
          height: 1px;
          background: linear-gradient(90deg, var(--amber-border), rgba(217,119,6,0.06), var(--amber-border));
        }
        @media (max-width: 600px) {
          .steps-row {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .steps-row::before { display: none; }
        }
      `}</style>
    </section>
  );
}
