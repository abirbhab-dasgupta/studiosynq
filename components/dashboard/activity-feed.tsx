"use client";

import { Ico, P } from "./icons";
import { Theme } from "./tokens";

const activity = [
    { text: "CodeBuddy resolved a merge conflict", time: "2m ago", live: true },
    { text: "ClarityAgent updated task breakdown", time: "10m ago", live: false },
    { text: "ResearchBot compiled competitor analysis", time: "1h ago", live: false },
    { text: "DocWriter generated sprint report", time: "3h ago", live: false },
];

type Props = { T: Theme };

export function ActivityFeed({ T }: Props) {
    const s = (obj: React.CSSProperties): React.CSSProperties => obj;

    return (
        <div>
            <div style={{
                display: "flex", alignItems: "center",
                justifyContent: "space-between", marginBottom: 12,
            }}>
                <span style={s({ fontSize: 14, fontWeight: 500, color: T.text })}>Activity</span>
                <Ico d={P.activity} size={14} stroke={T.text3} />
            </div>
            <div style={s({
                background: T.bg3, border: `1px solid ${T.border}`,
                borderRadius: 12, overflow: "hidden",
            })}>
                {activity.map((a, i) => (
                    <div key={i} style={s({
                        display: "flex", alignItems: "flex-start", gap: 10,
                        padding: "12px 16px",
                        borderBottom: i < activity.length - 1
                            ? `1px solid ${T.border}` : "none",
                    })}>
                        <div style={{
                            width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                            marginTop: 5, background: a.live ? "#10b981" : T.bg4,
                        }} />
                        <div>
                            <p style={s({
                                fontSize: 13, color: T.text2, lineHeight: 1.5, margin: 0,
                            })}>{a.text}</p>
                            <span style={s({
                                fontSize: 11, color: T.text3,
                                fontFamily: "'DM Mono',monospace",
                                display: "block", marginTop: 3,
                            })}>{a.time}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}