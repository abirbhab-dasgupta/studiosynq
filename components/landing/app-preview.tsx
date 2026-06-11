export default function AppPreview() {
  return (
    <div
      style={{
        borderRadius: 14,
        border: "1px solid var(--border)",
        background: "var(--bg2)",
        overflow: "hidden",
        boxShadow: "0 40px 80px rgba(0,0,0,0.5), inset 0 1px 0 var(--border-m)",
      }}
    >
      {/* ── Chrome bar ── */}
      <div
        style={{
          height: 34,
          background: "var(--bg3)",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          padding: "0 14px",
          gap: 7,
        }}
      >
        <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#ff5f57" }} />
        <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#febc2e" }} />
        <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#28c840" }} />
        <div
          style={{
            flex: 1,
            height: 18,
            margin: "0 10px",
            background: "var(--bg4)",
            borderRadius: 4,
            display: "flex",
            alignItems: "center",
            padding: "0 9px",
            fontFamily: "var(--font-mono)",
            fontSize: 9.5,
            color: "var(--text-3)",
            letterSpacing: "0.01em",
            overflow: "hidden",
            whiteSpace: "nowrap",
          }}
        >
          studiosynq.app / room / design-sprint
        </div>
      </div>

      {/* ── Body ── */}
      {/* 
        Responsive columns:
        - Mobile  (< 640px): dashboard only (1 col)
        - Tablet  (640-899px): sidebar + dashboard (2 col)  
        - Desktop (≥ 900px): sidebar + dashboard + agents (3 col)
        We implement this with a single grid and hide columns via CSS classes
      */}
      <div className="preview-grid">
        {/* ── Sidebar ── */}
        <div className="preview-sidebar" style={{ background: "var(--bg3)", borderRight: "1px solid var(--border)" }}>
          <SidebarContent />
        </div>

        {/* ── Dashboard ── */}
        <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 11, overflow: "hidden", background: "var(--bg2)" }}>
          {/* Top bar */}
          <div
            style={{
              height: 26,
              background: "var(--bg3)",
              borderRadius: 6,
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              padding: "0 10px",
              gap: 6,
            }}
          >
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--amber)", opacity: 0.65 }} />
            <div style={{ flex: 1, height: 4, borderRadius: 2, background: "var(--border)" }} />
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 7 }}>
            <StatCard value="3" label="Active rooms" highlight />
            <StatCard value="12" label="Open tasks" />
            <StatCard value="7" label="Agent runs" />
          </div>

          {/* Rooms */}
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <RoomRow color="#4ade80" badge="live" />
            <RoomRow color="var(--amber)" badge="2 online" />
            <RoomRow color="#6b7280" />
          </div>
        </div>

        {/* ── Agent panel — hidden below 900px via CSS ── */}
        <div
          className="preview-agents"
          style={{
            background: "var(--bg)",
            borderLeft: "1px solid var(--border)",
            padding: 11,
            display: "flex",
            flexDirection: "column",
            gap: 6,
            overflow: "hidden",
          }}
        >
          <AgentPanelContent />
        </div>
      </div>

      {/* Inline responsive CSS — scoped to this component */}
      <style>{`
        .preview-grid {
          display: grid;
          grid-template-columns: 188px 1fr 214px;
          height: clamp(240px, 38vw, 344px);
        }
        .preview-sidebar { display: flex; flex-direction: column; gap: 2px; padding: 12px 8px; overflow: hidden; }
        @media (max-width: 899px) {
          .preview-grid { grid-template-columns: 160px 1fr; }
          .preview-agents { display: none !important; }
        }
        @media (max-width: 560px) {
          .preview-grid { grid-template-columns: 1fr; }
          .preview-sidebar { display: none !important; }
        }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────
   Sub-components
   ───────────────────────────────────────── */

function SidebarContent() {
  const items = [
    { label: "Dashboard", active: true, amber: true },
    { label: "Rooms", active: false, amber: false },
    { label: "Tasks", active: false, amber: false },
    { label: "Focus", active: false, amber: false },
  ];
  const agents = ["CodeBuddy", "ClarityAgent", "ResearchBot", "DesignExpert", "EmailWriter"];

  return (
    <>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "0 6px 10px", borderBottom: "1px solid var(--border)", marginBottom: 6 }}>
        <div style={{ width: 18, height: 18, borderRadius: 5, background: "var(--amber)", flexShrink: 0 }} />
        <span style={{ fontSize: 11, fontWeight: 500, color: "var(--text)", letterSpacing: "-0.015em" }}>Studiosynq</span>
      </div>

      <SideSection label="Workspace" />
      {items.map((item) => (
        <SideItem key={item.label} {...item} />
      ))}

      <SideSection label="Agents" />
      {agents.map((name) => (
        <SideItem key={name} label={name} amber />
      ))}
    </>
  );
}

function SideSection({ label }: { label: string }) {
  return (
    <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--text-3)", padding: "7px 7px 3px", letterSpacing: "0.07em", textTransform: "uppercase" }}>
      {label}
    </div>
  );
}

function SideItem({ label, active = false, amber = false }: { label: string; active?: boolean; amber?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 7,
        padding: "5px 7px",
        borderRadius: 5,
        fontSize: 10.5,
        color: active ? "var(--text)" : "var(--text-2)",
        background: active ? "var(--surface-h)" : "transparent",
      }}
    >
      <div style={{ width: 12, height: 12, borderRadius: 3, background: amber ? "rgba(217,119,6,0.3)" : "var(--border)", flexShrink: 0 }} />
      {label}
    </div>
  );
}

function StatCard({ value, label, highlight = false }: { value: string; label: string; highlight?: boolean }) {
  return (
    <div
      style={{
        background: highlight ? "var(--amber-faint)" : "var(--bg3)",
        border: `1px solid ${highlight ? "var(--amber-border)" : "var(--border)"}`,
        borderRadius: 8,
        padding: "9px 10px",
      }}
    >
      <div style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(14px, 2.5vw, 19px)", fontWeight: 500, color: highlight ? "var(--amber)" : "var(--text)" }}>
        {value}
      </div>
      <div style={{ fontSize: 8, color: "var(--text-3)", marginTop: 2, letterSpacing: "0.03em" }}>
        {label}
      </div>
    </div>
  );
}

function RoomRow({ color, badge }: { color: string; badge?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg3)" }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0 }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
        <div style={{ width: 80, height: 6, background: "var(--text-3)", borderRadius: 2, opacity: 0.35 }} />
        <div style={{ width: 52, height: 4, background: "var(--border)", borderRadius: 2 }} />
      </div>
      {badge && (
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 7.5, padding: "2px 6px", borderRadius: 99, border: "1px solid var(--amber-border)", color: "var(--amber)", background: "var(--amber-faint)", flexShrink: 0 }}>
          {badge}
        </div>
      )}
    </div>
  );
}

function AgentPanelContent() {
  return (
    <>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 500, color: "var(--text)", paddingBottom: 7, borderBottom: "1px solid var(--border)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
        AI Agents
      </div>

      {[
        { id: "CB", name: "CodeBuddy", sub: "code · debug · review", active: true },
        { id: "RB", name: "ResearchBot", sub: "live web search", active: false },
        { id: "EW", name: "EmailWriter", sub: "draft · improve · reply", active: false },
      ].map((agent) => (
        <div
          key={agent.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "6px 7px",
            borderRadius: 7,
            border: `1px solid ${agent.active ? "var(--amber-border)" : "var(--border)"}`,
            background: agent.active ? "var(--amber-faint)" : "var(--bg2)",
          }}
        >
          <div style={{ width: 22, height: 22, borderRadius: 5, background: "var(--bg3)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: 8, fontWeight: 500, color: "var(--amber)", flexShrink: 0 }}>
            {agent.id}
          </div>
          <div style={{ fontSize: 9, color: "var(--text-2)", lineHeight: 1.4 }}>
            <div style={{ fontWeight: 500, color: "var(--text)", fontSize: 10, letterSpacing: "-0.01em" }}>{agent.name}</div>
            {agent.sub}
          </div>
        </div>
      ))}

      {/* Chat bubbles */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5, overflow: "hidden", marginTop: 2 }}>
        {[
          { text: "Paste your code and I'll find the bug.", user: false },
          { text: "Here's my auth middleware…", user: true },
          { text: "Found it — line 24, missing await on…", user: false },
        ].map((b, i) => (
          <div
            key={i}
            style={{
              alignSelf: b.user ? "flex-end" : "flex-start",
              padding: "6px 8px",
              borderRadius: 7,
              fontSize: 8,
              lineHeight: 1.55,
              maxWidth: "92%",
              color: b.user ? "var(--amber)" : "var(--text-2)",
              background: b.user ? "var(--amber-faint)" : "var(--bg2)",
              border: `1px solid ${b.user ? "var(--amber-border)" : "var(--border)"}`,
            }}
          >
            {b.text}
          </div>
        ))}
      </div>

      {/* Input row */}
      <div style={{ height: 24, background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 5, marginTop: "auto", display: "flex", alignItems: "center", padding: "0 7px", gap: 5 }}>
        <div style={{ flex: 1, height: 4, background: "var(--border)", borderRadius: 2 }} />
        <div style={{ width: 14, height: 14, borderRadius: 3, background: "var(--amber)", flexShrink: 0 }} />
      </div>
    </>
  );
}
