"use client";

import { useQuery } from "@tanstack/react-query";
import { Ico, P } from "./icons";
import { Theme } from "./tokens";

const AGENT_CONFIG: Record<string, { label: string; color: string }> = {
    codebuddy:    { label: "CodeBuddy",    color: "#10b981" },
    clarityagent: { label: "ClarityAgent", color: "#6366f1" },
    researchbot:  { label: "ResearchBot",  color: "#D97706" },
    designexpert: { label: "DesignExpert", color: "#ec4899" },
    emailwriter:  { label: "EmailWriter",  color: "#3b82f6" },
};

type LogEntry = {
    id: string;
    agentName: string;
    prompt: string;
    createdAt: string;
};

function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
}

function truncatePrompt(prompt: string, max = 48): string {
    return prompt.length > max ? prompt.slice(0, max).trimEnd() + "…" : prompt;
}

type Props = { T: Theme };

export function ActivityFeed({ T }: Props) {
    const s = (obj: React.CSSProperties): React.CSSProperties => obj;

    const { data: logs = [], isLoading } = useQuery<LogEntry[]>({
        queryKey: ["activity"],
        queryFn: () => fetch("/api/activity").then(r => r.json()),
        refetchInterval: 30_000,
        staleTime: 0,
    });

    return (
        <div>
            <div style={{
                display: "flex", alignItems: "center",
                justifyContent: "space-between", marginBottom: 12,
            }}>
                <span style={s({ fontSize: 14, fontWeight: 500, color: T.text })}>
                    Activity
                </span>
                <Ico d={P.activity} size={14} stroke={T.text3} />
            </div>

            <div style={s({
                background: T.bg3, border: `1px solid ${T.border}`,
                borderRadius: 12, overflow: "hidden",
            })}>
                {isLoading ? (
                    <div style={s({ padding: "16px", textAlign: "center" })}>
                        <p style={s({ fontSize: 12, color: T.text3 })}>Loading…</p>
                    </div>
                ) : logs.length === 0 ? (
                    <div style={s({
                        padding: "24px 16px", textAlign: "center",
                        display: "flex", flexDirection: "column",
                        alignItems: "center", gap: 6,
                    })}>
                        <Ico d={P.zap} size={16} stroke={T.text3} />
                        <p style={s({ fontSize: 12, color: T.text3, lineHeight: 1.5 })}>
                            No agent activity yet.<br />
                            Call an agent to get started.
                        </p>
                    </div>
                ) : (
                    logs.map((log, i) => {
                        const agent = AGENT_CONFIG[log.agentName];
                        const isLatest = i === 0;
                        return (
                            <div key={log.id} style={s({
                                display: "flex", alignItems: "flex-start", gap: 10,
                                padding: "12px 16px",
                                borderBottom: i < logs.length - 1
                                    ? `1px solid ${T.border}` : "none",
                            })}>
                                {/* Colored dot */}
                                <div style={{
                                    width: 7, height: 7, borderRadius: "50%",
                                    flexShrink: 0, marginTop: 5,
                                    background: isLatest
                                        ? (agent?.color ?? "#10b981")
                                        : T.bg4,
                                }} />
                                <div style={{ minWidth: 0 }}>
                                    <p style={s({
                                        fontSize: 13, color: T.text2,
                                        lineHeight: 1.5, margin: 0,
                                    })}>
                                        <span style={{
                                            color: agent?.color ?? T.text,
                                            fontWeight: 500,
                                        }}>
                                            {agent?.label ?? log.agentName}
                                        </span>
                                        {" — "}
                                        {truncatePrompt(log.prompt)}
                                    </p>
                                    <span style={s({
                                        fontSize: 11, color: T.text3,
                                        fontFamily: "'DM Mono',monospace",
                                        display: "block", marginTop: 3,
                                    })}>
                                        {timeAgo(log.createdAt)}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}