"use client";

import { useState } from "react";

// ─── SVG Icon primitive ───────────────────────────────────────────────────────
const Ico = ({ d, size = 16, stroke = "currentColor" }: {
    d: string; size?: number; stroke?: string;
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d={d} />
    </svg>
);

// ─── Icon paths ───────────────────────────────────────────────────────────────
const P = {
    home: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
    grid: "M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z",
    check: "M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
    shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10",
    user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8",
    code: "M16 18l6-6-6-6 M8 6l-6 6 6 6",
    chat: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
    search: "M21 21l-4.35-4.35 M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0",
    bell: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0",
    plus: "M12 5v14 M5 12h14",
    sun: "M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42 M12 7a5 5 0 1 0 0 10A5 5 0 0 0 12 7z",
    moon: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",
    chevR: "M9 18l6-6-6-6",
    activity: "M22 12h-4l-3 9L9 3l-3 9H2",
    zap: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
    star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
    book: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
};

// ─── Tokens — mirrors globals.css exactly ─────────────────────────────────────
const DARK = {
    bg: "#0C0B09", bg2: "#131210", bg3: "#1A1814", bg4: "#222019",
    surface: "rgba(255,255,255,0.032)", surfaceH: "rgba(255,255,255,0.058)",
    border: "rgba(255,255,255,0.07)", borderM: "rgba(255,255,255,0.11)",
    text: "#EDE8DF", text2: "#9E9589", text3: "#524E46",
    amber: "#D97706", amberLt: "#F59E0B",
    amberFaint: "rgba(217,119,6,0.07)", amberBorder: "rgba(217,119,6,0.18)",
};
const LIGHT = {
    bg: "#F9F8F5", bg2: "#F2F0EB", bg3: "#E9E6DF", bg4: "#DDD9D0",
    surface: "rgba(0,0,0,0.025)", surfaceH: "rgba(0,0,0,0.05)",
    border: "rgba(0,0,0,0.07)", borderM: "rgba(0,0,0,0.12)",
    text: "#1C1A16", text2: "#6B6357", text3: "#A09790",
    amber: "#B45309", amberLt: "#D97706",
    amberFaint: "rgba(180,100,0,0.06)", amberBorder: "rgba(180,100,0,0.16)",
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const stats = [
    { label: "Active rooms", val: "3", icon: P.grid, delta: "+1", accent: "#D97706" },
    { label: "Open tasks", val: "12", icon: P.check, delta: "+4", accent: "#6366f1" },
    { label: "Focus mins", val: "48", icon: P.shield, delta: "+12", accent: "#10b981" },
    { label: "Agent runs", val: "7", icon: P.zap, delta: "+3", accent: "#ec4899" },
];
const rooms = [
    { name: "Frontend Sprint", members: ["A", "B", "C"], dot: "#10b981" },
    { name: "API Design", members: ["D", "E"], dot: "#D97706" },
    { name: "Design System", members: ["A"], dot: "#6366f1" },
];
const activity = [
    { text: "CodeBuddy resolved a merge conflict", time: "2m ago", live: true },
    { text: "ClarityAgent updated task breakdown", time: "10m ago", live: false },
    { text: "ResearchBot compiled competitor analysis", time: "1h ago", live: false },
    { text: "DocWriter generated sprint report", time: "3h ago", live: false },
];
const agents = [
    { name: "CodeBuddy", icon: P.code, accent: "#10b981", runs: 3 },
    { name: "ClarityAgent", icon: P.chat, accent: "#6366f1", runs: 1 },
    { name: "ResearchBot", icon: P.search, accent: "#D97706", runs: 2 },
    { name: "DesignExpert", icon: P.star, accent: "#ec4899", runs: 1 },
    { name: "DocWriter", icon: P.book, accent: "#3b82f6", runs: 0 },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Dashboard() {
    const [theme, setTheme] = useState<"dark" | "light">("dark");
    const [activeNav, setActiveNav] = useState("Dashboard");
    const T = theme === "dark" ? DARK : LIGHT;

    const navItems = [
        { label: "Dashboard", icon: P.home },
        { label: "Rooms", icon: P.grid },
        { label: "Tasks", icon: P.check },
        { label: "Focus", icon: P.shield },
        { label: "Profile", icon: P.user },
    ];

    const s = (obj: React.CSSProperties): React.CSSProperties => obj;

    return (
        <div style={s({
            display: "flex", height: "100vh", width: "100%", overflow: "hidden",
            fontFamily: "'DM Sans',sans-serif", background: T.bg, color: T.text,
            transition: "background .3s, color .3s",
        })}>

            {/* ── Sidebar ── */}
            <aside style={s({
                width: 200, flexShrink: 0, display: "flex", flexDirection: "column",
                background: T.bg2, borderRight: `1px solid ${T.border}`, height: "100%",
            })}>

                {/* Logo */}
                <div style={s({
                    height: 52, display: "flex", alignItems: "center", gap: 9,
                    padding: "0 16px", borderBottom: `1px solid ${T.border}`, flexShrink: 0,
                })}>
                    <div style={s({
                        width: 22, height: 22, borderRadius: 5, background: T.amber,
                        color: "#fff", fontSize: 11, fontWeight: 700,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: "'DM Mono',monospace",
                    })}>S</div>
                    <span style={s({ fontSize: 13, fontWeight: 500, color: T.text, letterSpacing: "-.2px" })}>
                        SyncSpace
                    </span>
                </div>

                {/* Nav */}
                <nav style={s({ flex: 1, overflowY: "auto", padding: "12px 10px" })}>
                    <div style={s({
                        fontSize: 9, fontWeight: 600, textTransform: "uppercase",
                        letterSpacing: ".1em", color: T.text3, padding: "0 8px 8px", marginTop: 4,
                    })}>Workspace</div>

                    {navItems.map(item => {
                        const active = activeNav === item.label;
                        return (
                            <button key={item.label} onClick={() => setActiveNav(item.label)}
                                style={s({
                                    display: "flex", alignItems: "center", gap: 8,
                                    padding: "6px 8px", borderRadius: 8, width: "100%", textAlign: "left",
                                    fontSize: 12, fontWeight: active ? 500 : 400,
                                    fontFamily: "'DM Sans',sans-serif",
                                    color: active ? T.text : T.text2,
                                    background: active ? T.surfaceH : "transparent",
                                    border: "none", cursor: "pointer", transition: "all .15s",
                                })}>
                                <Ico d={item.icon} size={13} stroke={active ? T.amber : T.text2} />
                                {item.label}
                            </button>
                        );
                    })}

                    <div style={s({
                        fontSize: 9, fontWeight: 600, textTransform: "uppercase",
                        letterSpacing: ".1em", color: T.text3, padding: "0 8px 8px", marginTop: 14,
                    })}>Agents</div>

                    {agents.map(ag => (
                        <button key={ag.name} style={s({
                            display: "flex", alignItems: "center", gap: 8,
                            padding: "6px 8px", borderRadius: 8, width: "100%", textAlign: "left",
                            fontSize: 12, fontWeight: 400, fontFamily: "'DM Sans',sans-serif",
                            color: T.text2, background: "transparent", border: "none", cursor: "pointer",
                            transition: "all .15s",
                        })}>
                            <Ico d={ag.icon} size={12} stroke={ag.accent} />
                            <span style={{ flex: 1 }}>{ag.name}</span>
                            {ag.runs > 0 && (
                                <span style={s({
                                    fontSize: 9, fontWeight: 600, fontFamily: "'DM Mono',monospace",
                                    background: ag.accent + "18", color: ag.accent,
                                    padding: "1px 5px", borderRadius: 4,
                                })}>{ag.runs}</span>
                            )}
                        </button>
                    ))}
                </nav>

                {/* User */}
                <div style={s({ padding: "10px 12px", borderTop: `1px solid ${T.border}`, flexShrink: 0 })}>
                    <div style={s({ display: "flex", alignItems: "center", gap: 8, padding: "4px 6px" })}>
                        <div style={s({
                            width: 26, height: 26, borderRadius: "50%",
                            background: T.amberFaint, color: T.amber,
                            fontSize: 11, fontWeight: 600, display: "flex",
                            alignItems: "center", justifyContent: "center",
                            fontFamily: "'DM Mono',monospace", border: `1px solid ${T.amberBorder}`,
                        })}>A</div>
                        <div>
                            <div style={s({ fontSize: 12, fontWeight: 500, color: T.text })}>Abirbhab</div>
                            <div style={s({ fontSize: 10, color: T.text3 })}>Free plan</div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* ── Main column ── */}
            <div style={s({ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" })}>

                {/* Topbar */}
                <header style={s({
                    height: 52, flexShrink: 0,
                    background: T.bg2, borderBottom: `1px solid ${T.border}`,
                    display: "flex", alignItems: "center", gap: 10, padding: "0 20px",
                })}>
                    <div style={s({ position: "relative", flex: 1, maxWidth: 240 })}>
                        <span style={s({ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" })}>
                            <Ico d={P.search} size={12} stroke={T.text3} />
                        </span>
                        <input type="text" placeholder="Search workspace…" style={s({
                            width: "100%", height: 30,
                            background: T.surface, border: `1px solid ${T.border}`,
                            borderRadius: 8, padding: "0 10px 0 28px",
                            fontSize: 12, color: T.text,
                            fontFamily: "'DM Sans',sans-serif", outline: "none",
                            transition: "border-color .15s",
                        })} />
                    </div>

                    <div style={s({ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" })}>
                        <button style={s({
                            display: "flex", alignItems: "center", gap: 6,
                            height: 30, padding: "0 12px",
                            background: T.amber, color: "#fff",
                            border: "none", borderRadius: 8,
                            fontSize: 12, fontWeight: 600, cursor: "pointer",
                            fontFamily: "'DM Sans',sans-serif",
                        })}>
                            <Ico d={P.plus} size={11} stroke="#fff" />
                            New Room
                        </button>

                        <button
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            style={s({
                                width: 30, height: 30,
                                background: T.surface, border: `1px solid ${T.border}`,
                                borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                                cursor: "pointer", color: T.text2, transition: "border-color .15s",
                            })}>
                            <Ico d={theme === "dark" ? P.sun : P.moon} size={13} stroke={T.text2} />
                        </button>
                    </div>
                </header>

                {/* Scrollable content */}
                <main style={s({
                    flex: 1, overflowY: "auto", padding: "24px 24px 36px",
                    display: "flex", flexDirection: "column", gap: 22,
                })}>

                    {/* Greeting */}
                    <div>
                        <div style={s({
                            fontSize: 9, fontWeight: 600, textTransform: "uppercase",
                            letterSpacing: ".12em", color: T.text3,
                            fontFamily: "'DM Mono',monospace", marginBottom: 6,
                        })}>Overview</div>
                        <h1 style={s({
                            fontSize: 22, fontWeight: 400,
                            fontFamily: "'Instrument Serif',Georgia,serif",
                            color: T.text, letterSpacing: "-.3px",
                        })}>Welcome back, Abirbhab 👋</h1>
                    </div>

                    {/* Stats grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
                        {stats.map(st => (
                            <div key={st.label} style={s({
                                background: T.bg3, border: `1px solid ${T.border}`,
                                borderRadius: 14, padding: "18px 20px", cursor: "default",
                                position: "relative", overflow: "hidden", transition: "border-color .2s",
                            })}>
                                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                                    <div style={s({
                                        width: 32, height: 32, borderRadius: 8,
                                        background: T.surface, display: "flex", alignItems: "center", justifyContent: "center",
                                    })}>
                                        <Ico d={st.icon} size={14} stroke={st.accent} />
                                    </div>
                                    <span style={s({
                                        fontSize: 10, fontWeight: 600, fontFamily: "'DM Mono',monospace",
                                        background: st.accent + "18", color: st.accent,
                                        padding: "2px 7px", borderRadius: 999,
                                    })}>{st.delta}</span>
                                </div>
                                <div style={s({
                                    fontSize: 28, fontWeight: 500, letterSpacing: "-1.5px",
                                    fontFamily: "'DM Mono',monospace", color: T.text, marginBottom: 3,
                                })}>{st.val}</div>
                                <div style={s({ fontSize: 11, color: T.text2 })}>{st.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Rooms + Activity */}
                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>

                        {/* Rooms */}
                        <div>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                                <span style={s({ fontSize: 12, fontWeight: 500, color: T.text })}>Active Rooms</span>
                                <button style={s({
                                    fontSize: 11, color: T.text2, background: "none",
                                    border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 2,
                                    fontFamily: "'DM Sans',sans-serif",
                                })}>
                                    View all <Ico d={P.chevR} size={11} stroke={T.text2} />
                                </button>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                                {rooms.map(r => (
                                    <div key={r.name} style={s({
                                        background: T.bg3, border: `1px solid ${T.border}`,
                                        borderRadius: 12, padding: "14px 16px", cursor: "pointer",
                                        transition: "border-color .2s",
                                    })}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                                            <div>
                                                <div style={{ height: 8, borderRadius: 99, background: T.surface, width: 70, marginBottom: 5 }} />
                                                <div style={{ height: 6, borderRadius: 99, background: T.surface, width: 48 }} />
                                            </div>
                                            <div style={{ width: 7, height: 7, borderRadius: "50%", background: r.dot, marginTop: 3 }} />
                                        </div>
                                        <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
                                            {r.members.map((m, i) => (
                                                <div key={i} style={s({
                                                    width: 22, height: 22, borderRadius: "50%",
                                                    background: T.bg4, color: T.text2,
                                                    fontSize: 9, fontWeight: 500, display: "flex",
                                                    alignItems: "center", justifyContent: "center",
                                                    fontFamily: "'DM Mono',monospace",
                                                })}>{m}</div>
                                            ))}
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                            <span style={s({
                                                fontSize: 11, color: T.text2, overflow: "hidden",
                                                textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 80,
                                            })}>{r.name}</span>
                                            <button style={s({
                                                fontSize: 10, fontWeight: 500,
                                                background: T.surface, border: `1px solid ${T.border}`,
                                                borderRadius: 6, padding: "3px 10px", color: T.text2,
                                                cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
                                            })}>Open</button>
                                        </div>
                                    </div>
                                ))}
                                {/* Create room */}
                                <div style={s({
                                    border: `1px dashed ${T.border}`, borderRadius: 12,
                                    display: "flex", flexDirection: "column", alignItems: "center",
                                    justifyContent: "center", gap: 7, minHeight: 110, cursor: "pointer",
                                })}>
                                    <div style={s({
                                        width: 26, height: 26, borderRadius: "50%",
                                        border: `1px solid ${T.border}`,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                    })}>
                                        <Ico d={P.plus} size={12} stroke={T.text3} />
                                    </div>
                                    <span style={s({ fontSize: 11, color: T.text3 })}>Create room</span>
                                </div>
                            </div>
                        </div>

                        {/* Activity */}
                        <div>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                                <span style={s({ fontSize: 12, fontWeight: 500, color: T.text })}>Activity</span>
                                <Ico d={P.activity} size={13} stroke={T.text3} />
                            </div>
                            <div style={s({ background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" })}>
                                {activity.map((a, i) => (
                                    <div key={i} style={s({
                                        display: "flex", alignItems: "flex-start", gap: 10,
                                        padding: "10px 14px", cursor: "default",
                                        borderBottom: i < activity.length - 1 ? `1px solid ${T.border}` : "none",
                                    })}>
                                        <div style={{
                                            width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                                            marginTop: 4, background: a.live ? "#10b981" : T.bg4,
                                        }} />
                                        <div>
                                            <p style={s({ fontSize: 11, color: T.text2, lineHeight: 1.45 })}>{a.text}</p>
                                            <span style={s({
                                                fontSize: 10, color: T.text3, fontFamily: "'DM Mono',monospace",
                                                display: "block", marginTop: 2,
                                            })}>{a.time}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Quick launch */}
                    <div>
                        <div style={{ marginBottom: 10 }}>
                            <span style={s({ fontSize: 12, fontWeight: 500, color: T.text })}>Quick launch</span>
                        </div>
                        <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                            {agents.map(ag => (
                                <button key={ag.name} style={s({
                                    display: "flex", alignItems: "center", gap: 6,
                                    height: 28, padding: "0 10px",
                                    background: T.surface, border: `1px solid ${T.border}`,
                                    borderRadius: 8, fontSize: 11, color: T.text2,
                                    cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
                                })}>
                                    <Ico d={ag.icon} size={11} stroke={ag.accent} />
                                    {ag.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}