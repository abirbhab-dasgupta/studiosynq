"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Ico } from "@/components/dashboard/icons";
import { RoomMembers } from "./room-members";
import { RoomPlaceholders } from "./room-placeholders";
import { RoomInvite } from "./room-invite";
import { RoomRequests } from "./room-requests";

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
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
    const [leaving, setLeaving] = useState(false);

    const [theme, setTheme] = useState<"dark" | "light">(() => {
        if (typeof window === "undefined") return "dark";
        return (localStorage.getItem("theme") as "dark" | "light") ?? "dark";
    });

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

    async function handleLeave() {
        setLeaving(true);
        await fetch(`/api/rooms/${roomId}/leave`, { method: "DELETE" });
        router.push("/rooms");
    }

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center text-[14px] text-var(--text-2)">
                Loading room...
            </div>
        );
    }

    if (!room) {
        return (
            <div style={{
                flex: 1, display: "flex", alignItems: "center",
                justifyContent: "center",
            }}>
                <p style={{ fontSize: 14, color: "var(--text-2)" }}>Loading...</p>
            </div>
        );
    }

    if ((room as any).error === "You do not have access to this room") {
        return (
            <div style={{
                flex: 1, display: "flex", flexDirection: "column", marginTop: 100,
                alignItems: "center", justifyContent: "center", gap: 16,
            }}>
                <div style={{
                    width: 48, height: 48, borderRadius: 14,
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <svg width={20} height={20} viewBox="0 0 24 24" fill="none"
                        stroke="#ef4444" strokeWidth="1.6"
                        strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                </div>
                <div style={{ textAlign: "center" }}>
                    <p style={{
                        fontSize: 15, fontWeight: 500,
                        color: "var(--text)",
                        fontFamily: "var(--font-sans)",
                        marginBottom: 6,
                    }}>
                        Access denied
                    </p>
                    <p style={{
                        fontSize: 13, color: "var(--text-2)",
                        fontFamily: "var(--font-sans)",
                    }}>
                        You are not a member of this room.
                    </p>
                </div>
                <button
                    onClick={() => router.push("/rooms")}
                    style={{
                        height: 34, padding: "0 16px",
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        borderRadius: 8, fontSize: 13,
                        color: "var(--text-2)", cursor: "pointer",
                        fontFamily: "var(--font-sans)",
                    }}
                >
                    Back to rooms
                </button>
            </div>
        );
    }

    if ((room as any).error) {
        return (
            <div style={{
                flex: 1, display: "flex", alignItems: "center",
                justifyContent: "center",
            }}>
                <p style={{ fontSize: 14, color: "var(--text-2)" }}>Room not found.</p>
            </div>
        );
    }

    return (
        <div className="room-workspace">

            {/* Leave confirmation dialog */}
            {showLeaveConfirm && (
                <div style={{
                    position: "fixed", inset: 0, zIndex: 100,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: "rgba(0,0,0,0.5)",
                    backdropFilter: "blur(4px)",
                }}>
                    <div style={{
                        background: "var(--bg2)", border: "1px solid var(--border-m)",
                        borderRadius: 16, padding: "28px 28px 24px",
                        width: 320, display: "flex", flexDirection: "column" as const, gap: 8,
                        boxShadow: "0 24px 48px rgba(0,0,0,0.3)",
                    }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: "rgba(239,68,68,0.1)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            marginBottom: 4,
                        }}>
                            <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
                                stroke="#ef4444" strokeWidth="1.6"
                                strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9" />
                            </svg>
                        </div>

                        <div style={{
                            fontSize: 15, fontWeight: 500, color: "var(--text)",
                            fontFamily: "'DM Sans',sans-serif",
                        }}>Leave room?</div>

                        <div style={{
                            fontSize: 12, color: "var(--text-2)", lineHeight: 1.5,
                            fontFamily: "'DM Sans',sans-serif", marginBottom: 8,
                        }}>
                            You&apos;ll be removed from <strong>{room.name}</strong>. You&apos;ll need a new invite to rejoin.
                        </div>

                        <div style={{ display: "flex", gap: 8 }}>
                            <button
                                onClick={() => setShowLeaveConfirm(false)}
                                style={{
                                    flex: 1, height: 34,
                                    background: "var(--surface)", border: "1px solid var(--border)",
                                    borderRadius: 8, fontSize: 12, fontWeight: 500,
                                    color: "var(--text-2)", cursor: "pointer",
                                    fontFamily: "'DM Sans',sans-serif",
                                }}>
                                Cancel
                            </button>
                            <button
                                onClick={handleLeave}
                                disabled={leaving}
                                style={{
                                    flex: 1, height: 34,
                                    background: "#ef4444", border: "none",
                                    borderRadius: 8, fontSize: 12, fontWeight: 600,
                                    color: "#fff", cursor: leaving ? "not-allowed" : "pointer",
                                    fontFamily: "'DM Sans',sans-serif",
                                    opacity: leaving ? 0.7 : 1,
                                }}>
                                {leaving ? "Leaving..." : "Yes, leave"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="room-workspace-header">
                <div className="flex items-center gap-3">
                    <button
                        className="room-workspace-back"
                        onClick={() => router.back()}
                    >
                        <Ico d="M19 12H5 M12 19l-7-7 7-7" size={13} stroke="var(--text-2)" />
                    </button>
                    <div>
                        <p className="room-workspace-title">{room.name}</p>
                        <p className="room-workspace-subtitle">
                            {room.members.length} member{room.members.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    {/* Invite — owner only */}
                    {room.createdBy === user.id && (
                        <RoomInvite roomId={room.id} />
                    )}

                    {/* Leave — non-owners only */}
                    {room.createdBy !== user.id && (
                        <button
                            className="room-leave-btn"
                            onClick={() => setShowLeaveConfirm(true)}
                        >
                            Leave room
                        </button>
                    )}

                    <div className="room-workspace-live">
                        <div className="room-workspace-live-dot" />
                        <span className="room-workspace-live-label">Live</span>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="room-workspace-body">
                {room.createdBy === user.id && (
                    <RoomRequests roomId={room.id} />
                )}
                <RoomMembers members={room.members} currentUserId={user.id} />
                <RoomPlaceholders />
            </div>
        </div>
    );
}