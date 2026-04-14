"use client";

import { ReactNode, ComponentType } from "react";
import type { LucideProps } from "lucide-react";

/* ─── Tag pill ─── */
export function LeftTag({ label }: { label: string }) {
    return (
        <div
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                padding: "5px 13px",
                borderRadius: 999,
                border: "0.5px solid var(--border-m, rgba(255,255,255,0.11))",
                background: "var(--surface, rgba(255,255,255,0.032))",
                fontFamily: "var(--font-mono, 'DM Mono', monospace)",
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: "0.07em",
                textTransform: "uppercase" as const,
                color: "var(--text-2, #9E9589)",
                marginBottom: 28,
            }}
        >
            <span
                className="pulse-dot"
                style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "var(--amber, #D97706)",
                    display: "inline-block",
                    flexShrink: 0,
                }}
            />
            {label}
        </div>
    );
}

/* ─── Main headline ─── */
export function LeftHeadline({
    lines,
}: {
    lines: Array<{ text: string; italic?: boolean }>;
}) {
    return (
        <h1
            style={{
                fontFamily: "var(--font-serif, 'Instrument Serif', Georgia, serif)",
                fontSize: 40,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                color: "var(--text, #EDE8DF)",
                marginBottom: 18,
                fontWeight: 400,
            }}
        >
            {lines.map((line, i) =>
                line.italic ? (
                    <em
                        key={i}
                        style={{ fontStyle: "italic", color: "var(--amber, #D97706)" }}
                    >
                        {line.text}
                    </em>
                ) : (
                    <span key={i}>{line.text}</span>
                )
            )}
        </h1>
    );
}

/* ─── Sub paragraph ─── */
export function LeftSub({ children }: { children: ReactNode }) {
    return (
        <p
            style={{
                fontSize: 15,
                lineHeight: 1.7,
                color: "var(--text-2, #9E9589)",
                marginBottom: 48,
                maxWidth: 340,
                fontFamily: "var(--font-sans, 'DM Sans', sans-serif)",
            }}
        >
            {children}
        </p>
    );
}

/* ─── Agent list — Lucide icons ─── */
export interface Agent {
    icon: ComponentType<LucideProps>;
    name: string;
    role: string;
}

export function AgentList({ agents }: { agents: Agent[] }) {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                borderTop: "0.5px solid var(--border, rgba(255,255,255,0.07))",
            }}
        >
            {agents.map((agent, i) => {
                const Icon = agent.icon;
                return (
                    <div
                        key={i}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: "12px 0",
                            borderBottom: "0.5px solid var(--border, rgba(255,255,255,0.07))",
                        }}
                    >
                        {/* Icon box */}
                        <div
                            style={{
                                width: 30,
                                height: 30,
                                borderRadius: 8,
                                border: "0.5px solid var(--border, rgba(255,255,255,0.07))",
                                background: "var(--bg3, #1A1814)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                            }}
                        >
                            <Icon
                                size={14}
                                strokeWidth={1.5}
                                color="var(--amber, #D97706)"
                            />
                        </div>

                        {/* Name */}
                        <span
                            style={{
                                flex: 1,
                                fontSize: 13,
                                fontWeight: 500,
                                color: "var(--text, #EDE8DF)",
                                fontFamily: "var(--font-sans, 'DM Sans', sans-serif)",
                                letterSpacing: "-0.01em",
                            }}
                        >
                            {agent.name}
                        </span>

                        {/* Role tag */}
                        <span
                            style={{
                                fontSize: 11,
                                color: "var(--text-3, #524E46)",
                                fontFamily: "var(--font-mono, 'DM Mono', monospace)",
                                letterSpacing: "0.03em",
                            }}
                        >
                            {agent.role}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

/* ─── Divider ─── */
export function LeftDivider() {
    return (
        <div
            style={{
                height: "0.5px",
                background: "var(--border, rgba(255,255,255,0.07))",
                margin: "32px 0",
            }}
        />
    );
}

/* ─── Social proof ─── */
const AVATARS = [
    { initials: "AB", bg: "#3b2d1a", color: "#e8a84a" },
    { initials: "CR", bg: "#1e2e1e", color: "#5cb85c" },
    { initials: "MK", bg: "#1a2035", color: "#6b90cc" },
    { initials: "VS", bg: "#2e1a2e", color: "#b06bb0" },
];

export function SocialProof({ label }: { label: ReactNode }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center" }}>
                {AVATARS.map((av, i) => (
                    <div
                        key={i}
                        style={{
                            width: 26,
                            height: 26,
                            borderRadius: "50%",
                            border: "1.5px solid var(--bg2, #131210)",
                            background: av.bg,
                            color: av.color,
                            fontSize: 9,
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginLeft: i === 0 ? 0 : -8,
                            fontFamily: "var(--font-mono, 'DM Mono', monospace)",
                            flexShrink: 0,
                            letterSpacing: "0.02em",
                        }}
                    >
                        {av.initials}
                    </div>
                ))}
            </div>
            <div
                style={{
                    fontSize: 12,
                    color: "var(--text-2, #9E9589)",
                    lineHeight: 1.5,
                    fontFamily: "var(--font-sans, 'DM Sans', sans-serif)",
                }}
            >
                {label}
            </div>
        </div>
    );
}