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

    const s = (obj: React.CSSProperties): React.CSSProperties => obj;

    return (
        <div style={{
            display: "grid",
            // 2 columns on mobile, 4 on desktop
            gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)",
            gap: 12,
        }}>
            {STAT_CONFIG.map(st => (
                <div key={st.label} style={s({
                    background: T.bg3, border: `1px solid ${T.border}`,
                    borderRadius: 14, padding: "20px 20px",
                    cursor: "default", transition: "border-color .2s",
                })}>
                    <div style={{
                        display: "flex", alignItems: "flex-start",
                        justifyContent: "space-between", marginBottom: 16,
                    }}>
                        <div style={s({
                            width: 34, height: 34, borderRadius: 9,
                            background: T.surface, display: "flex",
                            alignItems: "center", justifyContent: "center",
                        })}>
                            <Ico d={st.icon} size={15} stroke={st.accent} />
                        </div>
                    </div>
                    {/* Larger number — was 28px, now 32px */}
                    <div style={s({
                        fontSize: 32, fontWeight: 500, letterSpacing: "-1.5px",
                        fontFamily: "'DM Mono',monospace", color: T.text, marginBottom: 5,
                    })}>{data?.[st.key] ?? "—"}</div>
                    {/* Larger label — was 11px, now 13px */}
                    <div style={s({ fontSize: 13, color: T.text2 })}>{st.label}</div>
                </div>
            ))}
        </div>
    );
}