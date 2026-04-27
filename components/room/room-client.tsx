"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { DARK, LIGHT } from "@/components/dashboard/tokens";
import { Ico } from "@/components/dashboard/icons";

type Member = {
    userId: string;
    joinedAt: string;
    name: string;
    image: string | null;
    avatarColor: string | null;
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
    const [theme, setTheme] = useState<"dark" | "light">(() => {
        if (typeof window === "undefined") return "dark";
        return (localStorage.getItem("theme") as "dark" | "light") ?? "dark";
    });
    const T = theme === "dark" ? DARK : LIGHT;

    useEffect(() => {
        const isLight = document.documentElement.classList.contains("light");
        setTheme(isLight ? "light" : "dark");

        const observer = new MutationObserver(() => {
            const isLight = document.documentElement.classList.contains("light");
            setTheme(isLight ? "light" : "dark");
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });

        return () => observer.disconnect();
    }, []);

    const { data: room, isLoading } = useQuery<Room>({
        queryKey: ["room", roomId],
        queryFn: () => fetch(`/api/rooms/${roomId}`).then(r => r.json()),
        refetchInterval: 5000,
    });

    const s = (obj: React.CSSProperties): React.CSSProperties => obj;

    if (isLoading) {
        return (
            <div style={s({
                flex: 1, display: "flex", alignItems: "center",
                justifyContent: "center", background: "var(--bg)",
                color: "var(--text-2)", fontFamily: "var(--font-sans)", fontSize: 14,
            })}>
                Loading room...
            </div>
        );
    }

    if (!room || (room as any).error) {
        return (
            <div style={s({
                flex: 1, display: "flex", alignItems: "center",
                justifyContent: "center", background: "var(--bg)",
                color: "var(--text-2)", fontFamily: "var(--font-sans)", fontSize: 14,
            })}>
                Room not found.
            </div>
        );
    }

    return (

        <div style={{
            height: "100%", display: "flex", flexDirection: "column",
            background: "var(--bg)", color: "var(--text)",
            fontFamily: "var(--font-sans)", overflow: "hidden",
        }}>

            {/* ── Room title bar ── */}
            <div style={{
                height: 52, flexShrink: 0, display: "flex", alignItems: "center",
                justifyContent: "space-between", padding: "0 24px",
                borderBottom: "1px solid var(--border)",
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <button
                        onClick={() => router.back()}
                        style={{
                            width: 28, height: 28, borderRadius: 7,
                            background: "var(--surface)",
                            border: "1px solid var(--border)",
                            display: "flex", alignItems: "center",
                            justifyContent: "center", cursor: "pointer",
                        }}>
                        <Ico d="M19 12H5 M12 19l-7-7 7-7" size={13} stroke="var(--text-2)" />
                    </button>
                    <div>
                        <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>
                            {room.name}
                        </p>
                        <p style={{
                            fontSize: 11, color: "var(--text-3)",
                            fontFamily: "var(--font-mono)",
                        }}>
                            {room.members.length} member{room.members.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{
                        width: 7, height: 7, borderRadius: "50%",
                        background: "#10b981",
                        boxShadow: "0 0 0 2px rgba(16,185,129,0.2)",
                    }} />
                    <span style={{
                        fontSize: 12, color: "var(--text-2)",
                        fontFamily: "var(--font-mono)",
                    }}>Live</span>
                </div>
            </div>

            {/* ── Main content ── */}
            <div style={{
                flex: 1, overflow: "auto", padding: "24px",
                display: "flex", flexDirection: "column", gap: 20,
            }}>
                <div style={{
                    fontSize: 10, fontWeight: 600, textTransform: "uppercase",
                    letterSpacing: ".12em", color: "var(--text-3)",
                    fontFamily: "var(--font-mono)",
                }}>Members</div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                    {room.members.map((member) => {
                        const isYou = member.userId === user.id;
                        const color = member.avatarColor ?? "#D97706";

                        return (
                            <div key={member.userId} style={{
                                display: "flex", alignItems: "center", gap: 10,
                                padding: "10px 14px",
                                background: "var(--bg3)",
                                border: "1px solid var(--border)",
                                borderRadius: 12,
                            }}>
                                {member.image ? (
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        style={{
                                            width: 32, height: 32, borderRadius: "50%",
                                            objectFit: "cover",
                                            border: "2px solid var(--border)",
                                            flexShrink: 0,
                                        }}
                                    />
                                ) : (
                                    <div style={{
                                        width: 32, height: 32, borderRadius: "50%",
                                        background: color + "22",
                                        border: `2px solid ${color}55`,
                                        color: color,
                                        fontSize: 12, fontWeight: 600,
                                        display: "flex", alignItems: "center",
                                        justifyContent: "center",
                                        fontFamily: "var(--font-mono)",
                                        flexShrink: 0,
                                    }}>
                                        {(member.name ?? "?").charAt(0).toUpperCase()}
                                    </div>
                                )}

                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>
                                        {member.name ?? "Member"}
                                        {isYou && (
                                            <span style={{
                                                fontSize: 10, color: "var(--text-3)",
                                                marginLeft: 6, fontFamily: "var(--font-mono)",
                                            }}>you</span>
                                        )}
                                    </div>
                                    <div style={{
                                        fontSize: 11, color: "var(--text-3)",
                                        fontFamily: "var(--font-mono)",
                                    }}>
                                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                                    </div>
                                </div>

                                <div style={{
                                    width: 7, height: 7, borderRadius: "50%",
                                    background: "#10b981", marginLeft: 4, flexShrink: 0,
                                }} />
                            </div>
                        );
                    })}
                </div>

                {/* Placeholder sections */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 12, marginTop: 8,
                }}>
                    {["Task Board", "Room Chat", "AI Agents"].map(feature => (
                        <div key={feature} style={{
                            border: "1px dashed var(--border)",
                            borderRadius: 12, padding: "32px 20px",
                            display: "flex", flexDirection: "column",
                            alignItems: "center", justifyContent: "center",
                            gap: 8,
                        }}>
                            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-3)" }}>
                                {feature}
                            </div>
                            <div style={{
                                fontSize: 11, color: "var(--text-3)",
                                fontFamily: "var(--font-mono)",
                            }}>Coming soon</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

}