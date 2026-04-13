"use client";

import { ReactNode } from "react";

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
                marginBottom: 22,
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
export function LeftHeadline({ lines }: { lines: Array<{ text: string; italic?: boolean }> }) {
    return (
        <h1
            style={{
                fontFamily: "var(--font-serif, 'Instrument Serif', Georgia, serif)",
                fontSize: 38,
                lineHeight: 1.12,
                letterSpacing: "-0.015em",
                color: "var(--text, #EDE8DF)",
                marginBottom: 16,
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
                fontSize: 14,
                lineHeight: 1.65,
                color: "var(--text-2, #9E9589)",
                marginBottom: 36,
                maxWidth: 360,
            }}
        >
            {children}
        </p>
    );
}

/* ─── Feature item ─── */
interface Feature {
    icon: string;
    title: string;
    desc: string;
}

export function FeatureList({ items }: { items: Feature[] }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {items.map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 13 }}>
                    {/* Icon box */}
                    <div
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            border: "0.5px solid var(--border, rgba(255,255,255,0.07))",
                            background: "var(--bg3, #1A1814)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 15,
                            flexShrink: 0,
                        }}
                    >
                        {item.icon}
                    </div>
                    <div>
                        <div
                            style={{
                                fontSize: 13,
                                fontWeight: 500,
                                color: "var(--text, #EDE8DF)",
                                lineHeight: 1.3,
                                marginBottom: 2,
                            }}
                        >
                            {item.title}
                        </div>
                        <div
                            style={{
                                fontSize: 12,
                                color: "var(--text-2, #9E9589)",
                                lineHeight: 1.5,
                            }}
                        >
                            {item.desc}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ─── Horizontal rule ─── */
export function LeftDivider() {
    return (
        <div
            style={{
                height: "0.5px",
                background: "var(--border, rgba(255,255,255,0.07))",
                margin: "30px 0",
            }}
        />
    );
}

/* ─── Social proof row ─── */
const AVATARS = [
    { initials: "AB", bg: "#3b2d1a", color: "#e8a84a" },
    { initials: "CR", bg: "#1e2e1e", color: "#5cb85c" },
    { initials: "MK", bg: "#1a2035", color: "#6b90cc" },
    { initials: "VS", bg: "#2e1a2e", color: "#b06bb0" },
];

export function SocialProof({ label }: { label: ReactNode }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Stacked avatars */}
            <div style={{ display: "flex", alignItems: "center" }}>
                {AVATARS.map((av, i) => (
                    <div
                        key={i}
                        style={{
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            border: "1.5px solid var(--bg2, #131210)",
                            background: av.bg,
                            color: av.color,
                            fontSize: 9,
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginLeft: i === 0 ? 0 : -9,
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
                }}
            >
                {label}
            </div>
        </div>
    );
}