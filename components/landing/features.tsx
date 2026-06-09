import { SectionTag } from "@/components/landing/agents";

const FEATURES = [
  {
    num: "01",
    title: "Live rooms with real presence",
    desc: "See who's in the room, what they're working on, and chat in real-time — without leaving your workspace.",
  },
  {
    num: "02",
    title: "Invite your team, instantly",
    desc: "Share a link, and collaborators are in the room. No admin setup, no seat configuration.",
  },
  {
    num: "03",
    title: "Kanban board, built in",
    desc: "Create, assign, and drag tasks across columns — all inside your workspace. No separate tool, no context switching.",
  },
  {
    num: "04",
    title: "Focus timer, built in",
    desc: "Pomodoro-style focus sessions per room. Know exactly where your time goes without leaving your workspace.",
  },
];

export default function Features() {
  return (
    <section id="features" style={{ padding: "80px 20px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        <div className="reveal">
          <SectionTag>Built for real work</SectionTag>
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
          }}
        >
          Everything your team{" "}
          <em style={{ fontStyle: "italic", color: "var(--amber)" }}>actually</em>{" "}
          needs.
        </h2>

        {/* Two-column layout */}
        <div className="features-layout" style={{ marginTop: 56 }}>

          {/* ── Feature list ── */}
          <div className="reveal reveal-d2">
            {FEATURES.map((f, i) => (
              <div
                key={f.num}
                style={{
                  padding: "20px 0",
                  borderTop: i === 0 ? "1px solid var(--border)" : undefined,
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: "var(--text-3)",
                    marginBottom: 6,
                  }}
                >
                  {f.num}
                </div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 500,
                    color: "var(--text)",
                    marginBottom: 6,
                    letterSpacing: "-0.015em",
                  }}
                >
                  {f.title}
                </div>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 300,
                    color: "var(--text-2)",
                    lineHeight: 1.75,
                  }}
                >
                  {f.desc}
                </p>
              </div>
            ))}
          </div>

          {/* ── Visual block ── */}
          <div
            className="features-visual reveal reveal-d3"
            style={{
              background: "var(--bg2)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              aspectRatio: "4 / 3",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "78%",
                height: "78%",
                display: "flex",
                flexDirection: "column",
                gap: 9,
              }}
            >
              {/* Top bar */}
              <div
                style={{
                  height: 28,
                  borderRadius: 7,
                  background: "var(--bg3)",
                  border: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  padding: "0 10px",
                  gap: 7,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "var(--amber)",
                    opacity: 0.7,
                  }}
                />
                <div
                  style={{
                    flex: 1,
                    height: 4,
                    borderRadius: 2,
                    background: "var(--border)",
                  }}
                />
                <div
                  style={{
                    width: 36,
                    height: 4,
                    borderRadius: 2,
                    background: "var(--border)",
                  }}
                />
              </div>

              {/* Grid row 1 */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 7,
                }}
              >
                <div
                  style={{
                    height: 48,
                    borderRadius: 7,
                    border: "1px solid var(--amber-border)",
                    background: "var(--amber-faint)",
                  }}
                />
                <div
                  style={{
                    height: 48,
                    borderRadius: 7,
                    border: "1px solid var(--border)",
                    background: "var(--bg3)",
                  }}
                />
              </div>

              {/* Grid row 2 */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 7,
                }}
              >
                <div
                  style={{
                    height: 48,
                    borderRadius: 7,
                    border: "1px solid var(--border)",
                    background: "var(--bg3)",
                  }}
                />
                <div
                  style={{
                    height: 48,
                    borderRadius: 7,
                    border: "1px solid var(--amber-border)",
                    background: "var(--amber-faint)",
                  }}
                />
              </div>

              {/* Faded bottom bar */}
              <div
                style={{
                  height: 28,
                  borderRadius: 7,
                  background: "var(--bg3)",
                  border: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  padding: "0 10px",
                  gap: 7,
                  opacity: 0.4,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "var(--amber)",
                  }}
                />
                <div
                  style={{
                    width: 36,
                    height: 4,
                    borderRadius: 2,
                    background: "var(--border)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive layout */}
      <style>{`
        .features-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 72px;
          align-items: center;
        }
        @media (max-width: 768px) {
          .features-layout    { grid-template-columns: 1fr; gap: 36px; }
          .features-visual    { display: none !important; }
        }
      `}</style>
    </section>
  );
}