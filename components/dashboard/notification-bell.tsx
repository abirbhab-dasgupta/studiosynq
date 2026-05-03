"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Theme } from "./tokens";

type Notification = {
    id: string;
    type: "approved" | "rejected";
    message: string;
    roomName: string | null;
    roomId: string | null;
    isRead: boolean;
    createdAt: string;
};

type Props = {
    T: Theme;
};

export function NotificationBell({ T }: Props) {
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const queryClient = useQueryClient();
    const overlayRef = useRef<HTMLDivElement>(null);

    const { data: notifs = [] } = useQuery<Notification[]>({
        queryKey: ["notifications"],
        queryFn: () => fetch("/api/notifications").then(r => r.json()),
        refetchInterval: 10000,
    });

    const unreadCount = notifs.filter(n => !n.isRead).length;

    const markAllRead = useMutation({
        mutationFn: () => fetch("/api/notifications/read-all", { method: "PATCH" }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
    });

    useEffect(() => {
        if (open && unreadCount > 0) {
            markAllRead.mutate();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [open]);

    function handleNotifClick(notif: Notification) {
        if (notif.roomId && notif.type === "approved") {
            router.push(`/rooms/${notif.roomId}`);
            setOpen(false);
        }
    }

    function formatTime(dateStr: string) {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        if (mins < 1) return "just now";
        if (mins < 60) return `${mins}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    }

    const s = (obj: React.CSSProperties): React.CSSProperties => obj;

    return (
        <>
            {/* Bell button */}
            <button
                onClick={() => setOpen(true)}
                style={s({
                    position: "relative",
                    width: 34, height: 34,
                    background: T.surface,
                    border: `1px solid ${T.border}`,
                    borderRadius: 8,
                    display: "flex", alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer", flexShrink: 0,
                })}
            >
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
                    stroke={T.text2} strokeWidth="1.6"
                    strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>

                {unreadCount > 0 && (
                    <span style={s({
                        position: "absolute", top: -4, right: -4,
                        minWidth: 16, height: 16,
                        background: T.amber,
                        borderRadius: 999,
                        fontSize: 10, fontWeight: 700,
                        color: "#fff",
                        display: "flex", alignItems: "center",
                        justifyContent: "center",
                        padding: "0 4px",
                        fontFamily: "var(--font-mono)",
                        border: `2px solid ${T.bg2}`,
                    })}>
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Overlay */}
            {open && (
                <div
                    ref={overlayRef}
                    onClick={(e) => { if (e.target === overlayRef.current) setOpen(false); }}
                    style={s({
                        position: "fixed", inset: 0, zIndex: 200,
                        background: "rgba(0,0,0,0.6)",
                        backdropFilter: "blur(6px)",
                        display: "flex", alignItems: "center",
                        justifyContent: "center",
                    })}
                    className="notif-overlay-in"
                >
                    <div
                        style={s({
                            background: T.bg2,
                            border: `1px solid ${T.borderM}`,
                            borderRadius: 20,
                            width: "min(480px, 92vw)",
                            maxHeight: "70vh",
                            display: "flex", flexDirection: "column",
                            boxShadow: "0 32px 64px rgba(0,0,0,0.4)",
                            overflow: "hidden",
                        })}
                        className="notif-panel-in"
                    >
                        {/* Header */}
                        <div style={s({
                            padding: "20px 24px 16px",
                            borderBottom: `1px solid ${T.border}`,
                            display: "flex", alignItems: "center",
                            justifyContent: "space-between",
                            flexShrink: 0,
                        })}>
                            <div style={s({ display: "flex", alignItems: "center", gap: 10 })}>
                                <p style={s({
                                    fontSize: 15, fontWeight: 500,
                                    color: T.text,
                                    fontFamily: "'DM Sans', sans-serif",
                                })}>
                                    Notifications
                                </p>
                                {unreadCount > 0 && (
                                    <span style={s({
                                        height: 20, padding: "0 8px",
                                        background: T.amberFaint,
                                        border: `1px solid ${T.amberBorder}`,
                                        borderRadius: 999,
                                        fontSize: 11, fontWeight: 600,
                                        color: T.amber,
                                        display: "flex", alignItems: "center",
                                        fontFamily: "var(--font-mono)",
                                    })}>
                                        {unreadCount} new
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={() => setOpen(false)}
                                style={s({
                                    width: 28, height: 28, borderRadius: 6,
                                    background: T.surface,
                                    border: `1px solid ${T.border}`,
                                    display: "flex", alignItems: "center",
                                    justifyContent: "center", cursor: "pointer",
                                    color: T.text2, fontSize: 16,
                                    fontFamily: "'DM Sans', sans-serif",
                                })}
                            >×</button>
                        </div>

                        {/* List */}
                        <div style={s({
                            overflowY: "auto", flex: 1,
                            padding: "12px 16px",
                            display: "flex", flexDirection: "column", gap: 8,
                        })}>
                            {notifs.length === 0 ? (
                                <div style={s({
                                    display: "flex", flexDirection: "column",
                                    alignItems: "center", justifyContent: "center",
                                    padding: "48px 0", gap: 12,
                                })}>
                                    <div style={s({
                                        width: 44, height: 44, borderRadius: 12,
                                        background: T.surface,
                                        border: `1px solid ${T.border}`,
                                        display: "flex", alignItems: "center",
                                        justifyContent: "center",
                                    })}>
                                        <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
                                            stroke={T.text3} strokeWidth="1.4"
                                            strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                                        </svg>
                                    </div>
                                    <p style={s({
                                        fontSize: 13, color: T.text3,
                                        fontFamily: "'DM Sans', sans-serif",
                                    })}>
                                        No notifications yet
                                    </p>
                                </div>
                            ) : (
                                notifs.map((notif, i) => {
                                    const isApproved = notif.type === "approved";
                                    const accentColor = isApproved ? "#10b981" : "#ef4444";
                                    const accentBg = isApproved
                                        ? "rgba(16,185,129,0.06)"
                                        : "rgba(239,68,68,0.06)";
                                    const accentBorder = isApproved
                                        ? "rgba(16,185,129,0.2)"
                                        : "rgba(239,68,68,0.2)";
                                    const accentIconBg = isApproved
                                        ? "rgba(16,185,129,0.1)"
                                        : "rgba(239,68,68,0.1)";

                                    return (
                                        <div
                                            key={notif.id}
                                            onClick={() => handleNotifClick(notif)}
                                            className="notif-item-in"
                                            style={s({
                                                animationDelay: `${i * 40}ms`,
                                                padding: "14px 16px",
                                                borderRadius: 12,
                                                background: notif.isRead ? T.surface : accentBg,
                                                border: `1px solid ${notif.isRead ? T.border : accentBorder}`,
                                                cursor: isApproved && notif.roomId ? "pointer" : "default",
                                                display: "flex", gap: 12,
                                                alignItems: "flex-start",
                                                transition: "background .15s",
                                            })}
                                        >
                                            {/* Icon */}
                                            <div style={s({
                                                width: 32, height: 32, borderRadius: 8,
                                                flexShrink: 0,
                                                background: accentIconBg,
                                                display: "flex", alignItems: "center",
                                                justifyContent: "center",
                                            })}>
                                                {isApproved ? (
                                                    <svg width={13} height={13} viewBox="0 0 24 24" fill="none"
                                                        stroke={accentColor} strokeWidth="2.2"
                                                        strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="20 6 9 17 4 12" />
                                                    </svg>
                                                ) : (
                                                    <svg width={13} height={13} viewBox="0 0 24 24" fill="none"
                                                        stroke={accentColor} strokeWidth="2.2"
                                                        strokeLinecap="round" strokeLinejoin="round">
                                                        <line x1="18" y1="6" x2="6" y2="18" />
                                                        <line x1="6" y1="6" x2="18" y2="18" />
                                                    </svg>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div style={s({ flex: 1, minWidth: 0 })}>
                                                <p style={s({
                                                    fontSize: 13, fontWeight: 500,
                                                    color: T.text,
                                                    fontFamily: "'DM Sans', sans-serif",
                                                    lineHeight: 1.4,
                                                })}>
                                                    {notif.message}
                                                </p>
                                                <div style={s({
                                                    display: "flex", alignItems: "center",
                                                    gap: 8, marginTop: 6,
                                                })}>
                                                    <span style={s({
                                                        fontSize: 11, color: T.text3,
                                                        fontFamily: "var(--font-mono)",
                                                    })}>
                                                        {formatTime(notif.createdAt)}
                                                    </span>
                                                    {isApproved && notif.roomId && (
                                                        <span style={s({
                                                            fontSize: 11, fontWeight: 500,
                                                            color: accentColor,
                                                            fontFamily: "'DM Sans', sans-serif",
                                                        })}>
                                                            → Go to room
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Unread dot */}
                                            {!notif.isRead && (
                                                <div style={s({
                                                    width: 6, height: 6,
                                                    borderRadius: "50%",
                                                    background: accentColor,
                                                    flexShrink: 0, marginTop: 4,
                                                })} />
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}