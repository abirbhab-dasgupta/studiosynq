"use client";

import { useQuery } from "@tanstack/react-query";
import { Ico, P } from "./icons";
import { Theme } from "./tokens";

const STAT_CONFIG = [
    { label: "Active rooms", icon: P.grid, accent: "#D97706", key: "activeRooms" },
    { label: "Open tasks", icon: P.check, accent: "#6366f1", key: "openTasks" },
    { label: "Focus mins", icon: P.shield, accent: "#10b981", key: "focusMinutes" },
    { label: "Agent runs", icon: P.zap, accent: "#ec4899", key: "agentRuns" },
];

type Props = {
    T: Theme;
    userId: string;
    isMobile: boolean;
};

export function StatsCards({ T, userId, isMobile }: Props) {
    const { data } = useQuery({
        queryKey: ["stats", userId],
        queryFn: () => fetch(`/api/stats/${userId}`).then(r => r.json()),
    });

    return (
        <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)",
            gap: 12,
        }}>
            {STAT_CONFIG.map(st => (
                <div key={st.label} style={{
                    background: T.bg3,
                    border: `1px solid ${T.border}`,
                    borderRadius: 14,
                    padding: "20px",
                    cursor: "default",
                    transition: "border-color .2s",
                }}>
                    <div style={{
                        width: 34, height: 34, borderRadius: 9,
                        background: T.surface,
                        display: "flex", alignItems: "center",
                        justifyContent: "center", marginBottom: 16,
                    }}>
                        <Ico d={st.icon} size={15} stroke={st.accent} />
                    </div>
                    <div style={{
                        fontSize: 32, fontWeight: 500, letterSpacing: "-1.5px",
                        fontFamily: "var(--font-mono)",
                        color: "var(--text)", marginBottom: 5,
                    }}>{data?.[st.key] ?? "—"}</div>
                    <div style={{
                        fontSize: 13, color: "var(--text-2)",
                    }}>{st.label}</div>
                </div>
            ))}
        </div>
    );
}