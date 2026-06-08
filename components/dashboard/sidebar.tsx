"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Ico, P } from "./icons";
import { Theme } from "./tokens";
import Image from "next/image";

const agents = [
    { name: "CodeBuddy", icon: P.code, accent: "#10b981", runs: 3 },
    { name: "ClarityAgent", icon: P.chat, accent: "#6366f1", runs: 1 },
    { name: "ResearchBot", icon: P.search, accent: "#D97706", runs: 2 },
    { name: "DesignExpert", icon: P.star, accent: "#ec4899", runs: 1 },
    { name: "DocWriter", icon: P.book, accent: "#3b82f6", runs: 0 },
];

const navItems = [
    { label: "Dashboard", icon: P.home },
    { label: "Rooms", icon: P.grid },
    { label: "Tasks", icon: P.check },
    { label: "Focus", icon: P.shield },
    { label: "Profile", icon: P.user },
];

type Props = {
    T: Theme;
    activeNav: string;
    setActiveNav: (label: string) => void;
    user: { name: string; email: string } | null;
};

export function Sidebar({ T, activeNav, setActiveNav, user }: Props) {
    const router = useRouter();
    // Controls whether the confirmation dialog is visible
    const [showConfirm, setShowConfirm] = useState(false);
    const [signingOut, setSigningOut] = useState(false);

    // Only called after user confirms in the dialog
    async function handleSignOut() {
        setSigningOut(true);
        await authClient.signOut();
        router.push("/auth/sign-in");
    }

    const s = (obj: React.CSSProperties): React.CSSProperties => obj;
    const initials = user?.name?.charAt(0).toUpperCase() ?? "?";

    return (
        <>
            {showConfirm && (
                <div style={s({
                    position: "fixed", inset: 0, zIndex: 100,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: "rgba(0,0,0,0.5)",
                    backdropFilter: "blur(4px)",
                })}>
                    <div style={s({
                        background: T.bg2, border: `1px solid ${T.borderM}`,
                        borderRadius: 16, padding: "28px 28px 24px",
                        width: 320, display: "flex", flexDirection: "column", gap: 8,
                        boxShadow: "0 24px 48px rgba(0,0,0,0.3)",
                    })}>
                        {/* Dialog header */}
                        <div style={s({
                            width: 36, height: 36, borderRadius: 10,
                            background: "rgba(239,68,68,0.1)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            marginBottom: 4,
                        })}>
                            <Ico d={P.logout} size={16} stroke="#ef4444" />
                        </div>

                        <div style={s({
                            fontSize: 15, fontWeight: 500, color: T.text,
                            fontFamily: "'DM Sans',sans-serif",
                        })}>Sign out?</div>

                        <div style={s({
                            fontSize: 12, color: T.text2, lineHeight: 1.5,
                            fontFamily: "'DM Sans',sans-serif", marginBottom: 8,
                        })}>
                            You&apos;ll be signed out of your workspace. Any unsaved progress will be lost.
                        </div>

                        {/* Action buttons */}
                        <div style={{ display: "flex", gap: 8 }}>
                            {/* Cancel — just closes the dialog, nothing happens */}
                            <button
                                onClick={() => setShowConfirm(false)}
                                style={s({
                                    flex: 1, height: 34,
                                    background: T.surface, border: `1px solid ${T.border}`,
                                    borderRadius: 8, fontSize: 12, fontWeight: 500,
                                    color: T.text2, cursor: "pointer",
                                    fontFamily: "'DM Sans',sans-serif",
                                })}>
                                Cancel
                            </button>

                            {/* Confirm — actually signs out */}
                            <button
                                onClick={handleSignOut}
                                disabled={signingOut}
                                style={s({
                                    flex: 1, height: 34,
                                    background: "#ef4444", border: "none",
                                    borderRadius: 8, fontSize: 12, fontWeight: 600,
                                    color: "#fff", cursor: signingOut ? "not-allowed" : "pointer",
                                    fontFamily: "'DM Sans',sans-serif",
                                    opacity: signingOut ? 0.7 : 1,
                                })}>
                                {signingOut ? "Signing out..." : "Yes, sign out"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <aside style={s({
                width: 200, flexShrink: 0, display: "flex", flexDirection: "column",
                background: T.bg2, borderRight: `1px solid ${T.border}`, height: "100%",
            })}>
                {/* Logo */}
                <div style={s({
                    height: 52, display: "flex", alignItems: "center", gap: 9,
                    padding: "0 16px", borderBottom: `1px solid ${T.border}`, flexShrink: 0,
                })}>
                    <div style={s({
                        width: 22, height: 22, borderRadius: 5, background: T.amber,
                        color: "#fff", fontSize: 11, fontWeight: 700,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: "'DM Mono',monospace",
                    })}>
                        <Image src="/studiosynq-logo.jpg" alt="Logo" width={22} height={22} />
                    </div>
                    <span style={s({ fontSize: 13, fontWeight: 500, color: T.text, letterSpacing: "-.2px" })}>
                        SyncSpace
                    </span>
                </div>

                {/* Nav */}
                <nav style={s({ flex: 1, overflowY: "auto", padding: "12px 10px" })}>
                    <div style={s({
                        fontSize: 9, fontWeight: 600, textTransform: "uppercase",
                        letterSpacing: ".1em", color: T.text3, padding: "0 8px 8px", marginTop: 4,
                    })}>Workspace</div>

                    {navItems.map(item => {
                        const active = activeNav === item.label;
                        return (
                            <button key={item.label} onClick={() => {
                                if (item.label === "Profile") {
                                    router.push("/profile");
                                } else {
                                    setActiveNav(item.label);
                                }
                            }}
                                style={s({
                                    display: "flex", alignItems: "center", gap: 8,
                                    padding: "6px 8px", borderRadius: 8, width: "100%", textAlign: "left",
                                    fontSize: 12, fontWeight: active ? 500 : 400,
                                    fontFamily: "'DM Sans',sans-serif",
                                    color: active ? T.text : T.text2,
                                    background: active ? T.surfaceH : "transparent",
                                    border: "none", cursor: "pointer", transition: "all .15s",
                                })}>
                                <Ico d={item.icon} size={13} stroke={active ? T.amber : T.text2} />
                                {item.label}
                            </button>
                        );
                    })}
                    <div style={s({
                        fontSize: 9, fontWeight: 600, textTransform: "uppercase",
                        letterSpacing: ".1em", color: T.text3, padding: "0 8px 8px", marginTop: 14,
                    })}>Agents</div>

                    {agents.map(ag => (
                        <button key={ag.name} style={s({
                            display: "flex", alignItems: "center", gap: 8,
                            padding: "6px 8px", borderRadius: 8, width: "100%", textAlign: "left",
                            fontSize: 12, fontWeight: 400, fontFamily: "'DM Sans',sans-serif",
                            color: T.text2, background: "transparent", border: "none", cursor: "pointer",
                            transition: "all .15s",
                        })}>
                            <Ico d={ag.icon} size={12} stroke={ag.accent} />
                            <span style={{ flex: 1 }}>{ag.name}</span>
                            {ag.runs > 0 && (
                                <span style={s({
                                    fontSize: 9, fontWeight: 600, fontFamily: "'DM Mono',monospace",
                                    background: ag.accent + "18", color: ag.accent,
                                    padding: "1px 5px", borderRadius: 4,
                                })}>{ag.runs}</span>
                            )}
                        </button>
                    ))}
                </nav>

                {/* User + Sign out */}
                <div style={s({ padding: "10px 12px", borderTop: `1px solid ${T.border}`, flexShrink: 0 })}>
                    <div style={s({ display: "flex", alignItems: "center", gap: 8, padding: "4px 6px" })}>
                        <div style={s({
                            width: 26, height: 26, borderRadius: "50%",
                            background: T.amberFaint, color: T.amber,
                            fontSize: 11, fontWeight: 600, display: "flex",
                            alignItems: "center", justifyContent: "center",
                            fontFamily: "'DM Mono',monospace", border: `1px solid ${T.amberBorder}`,
                        })}>{initials}</div>
                        <div style={{ flex: 1 }}>
                            <div style={s({ fontSize: 12, fontWeight: 500, color: T.text })}>
                                {user?.name ?? "User"}
                            </div>
                           
                        </div>
                    </div>

                    {/* Clicking this now opens the dialog instead of signing out immediately */}
                    <button onClick={() => setShowConfirm(true)} style={s({
                        display: "flex", alignItems: "center", gap: 6,
                        width: "100%", padding: "6px 8px", marginTop: 4,
                        color: "#ef4444", border: "none", borderRadius: 8,
                        fontSize: 11, background: "transparent", cursor: "pointer",
                        fontFamily: "'DM Sans',sans-serif", transition: "all .15s",
                    })}>
                        <Ico d={P.logout} size={12} stroke="#ef4444" />
                        Sign out
                    </button>
                </div>
            </aside>
        </>
    );
}