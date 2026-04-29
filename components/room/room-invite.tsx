"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

type Props = {
    roomId: string;
};

export function RoomInvite({ roomId }: Props) {
    const [showModal, setShowModal] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [mode, setMode] = useState<"request" | "auto">("request");
    const [copied, setCopied] = useState(false);

    const generateInvite = useMutation({
        mutationFn: (selectedMode: "request" | "auto") =>
            fetch(`/api/rooms/${roomId}/invite`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mode: selectedMode }),
            }).then(r => r.json()),
        onSuccess: (data) => {
            setToken(data.token);
        },
    });

    const revokeInvite = useMutation({
        mutationFn: () =>
            fetch(`/api/rooms/${roomId}/invite`, { method: "DELETE" }),
        onSuccess: () => {
            setToken(null);
        },
    });

    function handleOpen() {
        setShowModal(true);
        generateInvite.mutate(mode);
    }

    function handleCopy() {
        const link = `${window.location.origin}/join/${token}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    const inviteLink = token ? `${typeof window !== "undefined" ? window.location.origin : ""}/join/${token}` : "";

    return (
        <>
            <button
                onClick={handleOpen}
                style={{
                    display: "flex", alignItems: "center", gap: 6,
                    height: 30, padding: "0 12px",
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 8, fontSize: 12, fontWeight: 500,
                    color: "var(--text-2)", cursor: "pointer",
                    fontFamily: "var(--font-sans)",
                    transition: "background .15s",
                }}
            >
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none"
                    stroke="var(--text-2)" strokeWidth="1.6"
                    strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                Invite
            </button>

            {showModal && (
                <div style={{
                    position: "fixed", inset: 0, zIndex: 100,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
                }}>
                    <div style={{
                        background: "var(--bg2)",
                        border: "1px solid var(--border-m)",
                        borderRadius: 16, padding: "28px",
                        width: 420, display: "flex",
                        flexDirection: "column", gap: 16,
                        boxShadow: "0 24px 48px rgba(0,0,0,0.3)",
                    }}>
                        {/* Header */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <p style={{ fontSize: 15, fontWeight: 500, color: "var(--text)" }}>
                                Invite people
                            </p>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{
                                    width: 28, height: 28, borderRadius: 6,
                                    background: "var(--surface)",
                                    border: "1px solid var(--border)",
                                    display: "flex", alignItems: "center",
                                    justifyContent: "center", cursor: "pointer",
                                    color: "var(--text-2)", fontSize: 16,
                                }}
                            >×</button>
                        </div>

                        {/* Mode selector */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            <p style={{ fontSize: 12, fontWeight: 500, color: "var(--text-2)" }}>
                                Join mode
                            </p>
                            <div style={{ display: "flex", gap: 8 }}>
                                {(["request", "auto"] as const).map(m => (
                                    <button
                                        key={m}
                                        onClick={() => {
                                            setMode(m);
                                            setToken(null);
                                            generateInvite.mutate(m);
                                        }}
                                        style={{
                                            flex: 1, height: 36,
                                            background: mode === m ? "var(--amber-faint)" : "var(--surface)",
                                            border: `1px solid ${mode === m ? "var(--amber-border)" : "var(--border)"}`,
                                            borderRadius: 8, fontSize: 12,
                                            color: mode === m ? "var(--amber)" : "var(--text-2)",
                                            cursor: "pointer",
                                            fontFamily: "var(--font-sans)",
                                            fontWeight: mode === m ? 500 : 400,
                                            transition: "all .15s",
                                        }}
                                    >
                                        {m === "request" ? "Request approval" : "Auto join"}
                                    </button>
                                ))}
                            </div>
                            <p style={{ fontSize: 11, color: "var(--text-3)", lineHeight: 1.5 }}>
                                {mode === "request"
                                    ? "People need your approval before joining."
                                    : "Anyone with the link can join immediately."}
                            </p>
                        </div>

                        {/* Invite link */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            <p style={{ fontSize: 12, fontWeight: 500, color: "var(--text-2)" }}>
                                Invite link
                            </p>
                            <div style={{ display: "flex", gap: 8 }}>
                                <input
                                    readOnly
                                    value={generateInvite.isPending ? "Generating..." : inviteLink}
                                    style={{
                                        flex: 1, height: 36, padding: "0 12px",
                                        background: "var(--surface)",
                                        border: "1px solid var(--border)",
                                        borderRadius: 8, fontSize: 12,
                                        color: "var(--text-3)",
                                        fontFamily: "var(--font-mono)",
                                        outline: "none",
                                    }}
                                />
                                <button
                                    onClick={handleCopy}
                                    disabled={!token}
                                    style={{
                                        height: 36, padding: "0 16px",
                                        background: copied ? "#10b981" : "var(--amber)",
                                        color: "#fff", border: "none",
                                        borderRadius: 8, fontSize: 12,
                                        fontWeight: 600, cursor: "pointer",
                                        fontFamily: "var(--font-sans)",
                                        transition: "background .2s",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {copied ? "Copied ✓" : "Copy link"}
                                </button>
                            </div>
                        </div>

                        {/* Revoke */}
                        <div style={{
                            borderTop: "1px solid var(--border)",
                            paddingTop: 12,
                            display: "flex", justifyContent: "space-between",
                            alignItems: "center",
                        }}>
                            <p style={{ fontSize: 11, color: "var(--text-3)" }}>
                                Revoke link to prevent new joins
                            </p>
                            <button
                                onClick={() => revokeInvite.mutate()}
                                disabled={!token || revokeInvite.isPending}
                                style={{
                                    height: 28, padding: "0 12px",
                                    background: "transparent",
                                    border: "1px solid rgba(239,68,68,0.3)",
                                    borderRadius: 6, fontSize: 11,
                                    color: "#ef4444", cursor: "pointer",
                                    fontFamily: "var(--font-sans)",
                                }}
                            >
                                {revokeInvite.isPending ? "Revoking..." : "Revoke link"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}