"use client";

import { Ico, P } from "./icons";
import { Theme } from "./tokens";

const agents = [
    { name: "CodeBuddy", icon: P.code, accent: "#10b981" },
    { name: "ClarityAgent", icon: P.chat, accent: "#6366f1" },
    { name: "ResearchBot", icon: P.search, accent: "#D97706" },
    { name: "DesignExpert", icon: P.star, accent: "#ec4899" },
    { name: "DocWriter", icon: P.book, accent: "#3b82f6" },
];

type Props = { T: Theme };

export function QuickLaunch({ T }: Props) {
    const s = (obj: React.CSSProperties): React.CSSProperties => obj;

    return (
        <div>
            <div style={{ marginBottom: 12 }}>
                <span style={s({ fontSize: 14, fontWeight: 500, color: T.text })}>
                    Quick launch
                </span>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {agents.map(ag => (
                    <button key={ag.name} style={s({
                        display: "flex", alignItems: "center", gap: 7,
                        height: 32, padding: "0 14px",
                        background: T.surface, border: `1px solid ${T.border}`,
                        borderRadius: 8, fontSize: 13, color: T.text2,
                        cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
                    })}>
                        <Ico d={ag.icon} size={13} stroke={ag.accent} />
                        {ag.name}
                    </button>
                ))}
            </div>
        </div>
    );
}