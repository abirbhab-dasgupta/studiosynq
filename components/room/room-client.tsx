"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DARK, LIGHT } from "@/components/dashboard/tokens";
import { Ico, P } from "@/components/dashboard/icons";

type Member = {
    userId: string;
    joinedAt: string;
};

type Room = {
    id: string;
    name: string;
    isActive: boolean;
    createdBy: string;
    members: Member[];
};

type Props = {
    roomId: string;
    user: { id: string; name: string; email: string };
};

export function RoomClient({ roomId, user }: Props) {
    const router = useRouter();
    const [theme] = useState<"dark" | "light">("dark");
    const T = theme === "dark" ? DARK : LIGHT;


    const { data: room, isLoading } = useQuery<Room>({
        queryKey: ["room", roomId],
        queryFn: () => fetch(`/api/rooms/${roomId}`).then(r => r.json()),
        refetchInterval: 5000,
    });

    const s = (obj: React.CSSProperties): React.CSSProperties => obj;

    if (isLoading) {
        return (
            <div style={s({
                height: "100vh", display: "flex", alignItems: "center",
                justifyContent: "center", background: T.bg, color: T.text2,
                fontFamily: "'DM Sans',sans-serif", fontSize: 14,
            })}>
                Loading room...
            </div>
        );
    }

    if (!room || (room as any).error) {
        return (
            <div style={s({
                height: "100vh", display: "flex", alignItems: "center",
                justifyContent: "center", background: T.bg, color: T.text2,
                fontFamily: "'DM Sans',sans-serif", fontSize: 14,
            })}>
                Room not found.
            </div>
        );
    }

    return (
        <div style={s({
            height: "100vh", display: "flex", flexDirection: "column",
            background: T.bg, color: T.text, fontFamily: "'DM Sans',sans-serif",
            overflow: "hidden",
        })}>

            {/* ── Top bar ── */}
            <header style={s({
                height: 56, flexShrink: 0, display: "flex", alignItems: "center",
                justifyContent: "space-between", padding: "0 24px",
                background: T.bg2, borderBottom: `1px solid ${T.border}`,
            })}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {/* Back button — goes back to dashboard */}
                    <button
                        onClick={() => router.push("/dashboard")}
                        style={s({
                            width: 32, height: 32, borderRadius: 8,
                            background: T.surface, border: `1px solid ${T.border}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer",
                        })}>
                        <Ico d="M19 12H5 M12 19l-7-7 7-7" size={14} stroke={T.text2} />
                    </button>

                    {/* Room name */}
                    <div>
                        <div style={s({
                            fontSize: 15, fontWeight: 500, color: T.text,
                            fontFamily: "'DM Sans',sans-serif",
                        })}>{room.name}</div>
                        <div style={s({
                            fontSize: 11, color: T.text3,
                            fontFamily: "'DM Mono',monospace",
                        })}>
                            {room.members.length} member{room.members.length !== 1 ? "s" : ""}
                        </div>
                    </div>
                </div>

                {/* Live indicator */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{
                            width: 7, height: 7, borderRadius: "50%",
                            background: "#10b981",
                            // Pulse animation via box-shadow
                            boxShadow: "0 0 0 2px rgba(16,185,129,0.2)",
                        }} />
                        <span style={s({
                            fontSize: 12, color: T.text2,
                            fontFamily: "'DM Mono',monospace",
                        })}>Live</span>
                    </div>
                </div>
            </header>

            {/* ── Main content ── */}
            <div style={s({
                flex: 1, overflow: "hidden", display: "flex",
                flexDirection: "column", padding: "24px",
                gap: 20,
            })}>

                {/* Section label */}
                <div style={s({
                    fontSize: 10, fontWeight: 600, textTransform: "uppercase",
                    letterSpacing: ".12em", color: T.text3,
                    fontFamily: "'DM Mono',monospace",
                })}>Members</div>

                {/* Member grid */}
                <div style={{
                    display: "flex", flexWrap: "wrap", gap: 12,
                }}>
                    {room.members.map((member) => {
                        // Check if this member is the current logged-in user
                        const isYou = member.userId === user.id;

                        return (
                            <div key={member.userId} style={s({
                                display: "flex", alignItems: "center", gap: 10,
                                padding: "10px 14px",
                                background: T.bg3, border: `1px solid ${T.border}`,
                                borderRadius: 12,
                            })}>
                                {/* Avatar circle with first letter of userId */}
                                <div style={s({
                                    width: 32, height: 32, borderRadius: "50%",
                                    background: isYou
                                        ? "rgba(217,119,6,0.1)"
                                        : T.surface,
                                    border: `1px solid ${isYou
                                        ? "rgba(217,119,6,0.3)"
                                        : T.border}`,
                                    color: isYou ? "#D97706" : T.text2,
                                    fontSize: 12, fontWeight: 600,
                                    display: "flex", alignItems: "center",
                                    justifyContent: "center",
                                    fontFamily: "'DM Mono',monospace",
                                })}>
                                    {member.userId.charAt(0).toUpperCase()}
                                </div>

                                <div>
                                    <div style={s({
                                        fontSize: 13, fontWeight: 500, color: T.text,
                                        fontFamily: "'DM Sans',sans-serif",
                                    })}>
                                        {isYou ? user.name : "Member"}
                                        {isYou && (
                                            <span style={s({
                                                fontSize: 10, color: T.text3,
                                                marginLeft: 6,
                                                fontFamily: "'DM Mono',monospace",
                                            })}>you</span>
                                        )}
                                    </div>
                                    <div style={s({
                                        fontSize: 11, color: T.text3,
                                        fontFamily: "'DM Mono',monospace",
                                    })}>
                                        {/* Show how long they've been in the room */}
                                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                                    </div>
                                </div>

                                {/* Online indicator */}
                                <div style={{
                                    width: 7, height: 7, borderRadius: "50%",
                                    background: "#10b981", marginLeft: 4,
                                }} />
                            </div>
                        );
                    })}
                </div>

                {/* Placeholder sections for features coming next */}
                <div style={{
                    display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 12, marginTop: 8,
                }}>
                    {["Task Board", "Room Chat", "AI Agents"].map(feature => (
                        <div key={feature} style={s({
                            border: `1px dashed ${T.border}`, borderRadius: 12,
                            padding: "32px 20px",
                            display: "flex", flexDirection: "column",
                            alignItems: "center", justifyContent: "center",
                            gap: 8,
                        })}>
                            <div style={s({
                                fontSize: 13, fontWeight: 500, color: T.text3,
                                fontFamily: "'DM Sans',sans-serif",
                            })}>{feature}</div>
                            <div style={s({
                                fontSize: 11, color: T.text3,
                                fontFamily: "'DM Mono',monospace",
                            })}>Coming soon</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}