"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, signOut, authClient } from "@/lib/auth-client";

/* ─────────────────────────────────
   Shared inline-style constants
   ───────────────────────────────── */
const fonts = {
    sans: "var(--font-sans, 'DM Sans', sans-serif)",
    serif: "var(--font-serif, 'Instrument Serif', Georgia, serif)",
    mono: "var(--font-mono, 'DM Mono', monospace)",
};

const cardStyle: React.CSSProperties = {
    background: "var(--bg2, #131210)",
    border: "0.5px solid var(--border-m, rgba(255,255,255,0.11))",
    borderRadius: 14,
    padding: "28px 28px",
    position: "relative",
    overflow: "hidden",
};

const labelStyle: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 500,
    fontFamily: fonts.mono,
    color: "var(--text-3, #524E46)",
    letterSpacing: "0.09em",
    textTransform: "uppercase",
    marginBottom: 4,
};

const valueStyle: React.CSSProperties = {
    fontSize: 13,
    fontFamily: fonts.mono,
    color: "var(--text, #EDE8DF)",
    wordBreak: "break-all",
};

const detailCellStyle: React.CSSProperties = {
    background: "var(--bg3, #1A1814)",
    borderRadius: 10,
    padding: "14px 16px",
};

const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 13px",
    borderRadius: 10,
    border: "0.5px solid var(--border-m, rgba(255,255,255,0.11))",
    background: "var(--bg3, #1A1814)",
    color: "var(--text, #EDE8DF)",
    fontSize: 14,
    fontFamily: fonts.sans,
    outline: "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
};

/* ─────────────────────────────────
   Component
   ───────────────────────────────── */
export default function Dashboard() {
    const router = useRouter();
    const { data: session, isPending } = useSession();
    const [mounted, setMounted] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState("");
    const [editImage, setEditImage] = useState("");
    const [updateLoading, setUpdateLoading] = useState(false);
    const [updateError, setUpdateError] = useState("");
    const [updateSuccess, setUpdateSuccess] = useState(false);
    const [signOutLoading, setSignOutLoading] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 30);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        if (!isPending && !session) router.push("/auth/sign-in");
    }, [session, isPending, router]);

    useEffect(() => {
        if (session?.user) {
            setEditName(session.user.name ?? "");
            setEditImage(session.user.image ?? "");
        }
    }, [session]);

    /* ── handlers ── */
    const handleSignOut = async () => {
        setSignOutLoading(true);
        await signOut();
        router.push("/");
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdateError("");
        setUpdateSuccess(false);
        setUpdateLoading(true);
        try {
            await authClient.updateUser({
                name: editName,
                image: editImage || undefined,
            });
            setUpdateSuccess(true);
            setIsEditing(false);
        } catch {
            setUpdateError("Failed to update profile. Please try again.");
        } finally {
            setUpdateLoading(false);
        }
    };

    /* ── Loading state ── */
    if (isPending) {
        return (
            <div style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--bg, #0C0B09)",
            }}>
                <style>{`@keyframes ss-spin{to{transform:rotate(360deg)}}`}</style>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
                    <span style={{
                        width: 28, height: 28,
                        border: "2.5px solid var(--border-m, rgba(255,255,255,0.11))",
                        borderTopColor: "var(--amber, #D97706)",
                        borderRadius: "50%",
                        animation: "ss-spin 0.7s linear infinite",
                        display: "block",
                    }} />
                    <span style={{
                        fontFamily: fonts.mono, fontSize: 11,
                        color: "var(--text-3, #524E46)",
                        letterSpacing: "0.08em", textTransform: "uppercase",
                    }}>
                        Loading…
                    </span>
                </div>
            </div>
        );
    }

    if (!session) return null;

    const user = session.user;
    const initials = user.name
        ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase()
        : user.email?.[0]?.toUpperCase() ?? "?";

    return (
        <div style={{
            minHeight: "100vh",
            background: "var(--bg, #0C0B09)",
            color: "var(--text, #EDE8DF)",
            fontFamily: fonts.sans,
        }}>
            {/* ══════════ Navbar ══════════ */}
            <nav style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 24px",
                height: 56,
                borderBottom: "0.5px solid var(--border, rgba(255,255,255,0.07))",
                background: "rgba(12, 11, 9, 0.80)",
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
                position: "sticky",
                top: 0,
                zIndex: 50,
            }}>
                {/* Logo */}
                <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
                    <div style={{
                        width: 28, height: 28, borderRadius: 7,
                        background: "var(--amber, #D97706)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: fonts.mono, fontSize: 13, fontWeight: 500, color: "#fff",
                    }}>
                        S
                    </div>
                    <span style={{ fontSize: 15, fontWeight: 500, letterSpacing: "-0.02em", color: "var(--text, #EDE8DF)", fontFamily: fonts.sans }}>
                        SyncSpace
                    </span>
                </Link>

                {/* Right side */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {/* User pill */}
                    <div style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "5px 14px 5px 6px",
                        borderRadius: 999,
                        border: "0.5px solid var(--border-m, rgba(255,255,255,0.11))",
                        background: "var(--surface, rgba(255,255,255,0.032))",
                    }}>
                        {user.image ? (
                            <img
                                src={user.image}
                                alt={user.name ?? "User"}
                                style={{ width: 26, height: 26, borderRadius: "50%", objectFit: "cover" }}
                            />
                        ) : (
                            <div style={{
                                width: 26, height: 26, borderRadius: "50%",
                                background: "var(--amber-faint, rgba(217,119,6,0.07))",
                                border: "0.5px solid var(--amber-border, rgba(217,119,6,0.18))",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontFamily: fonts.mono, fontSize: 10, fontWeight: 500,
                                color: "var(--amber, #D97706)",
                            }}>
                                {initials}
                            </div>
                        )}
                        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text, #EDE8DF)" }}>
                            {user.name?.split(" ")[0] ?? "User"}
                        </span>
                    </div>

                    {/* Sign out button */}
                    <button
                        onClick={handleSignOut}
                        disabled={signOutLoading}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "7px 16px",
                            borderRadius: 8,
                            border: "0.5px solid var(--border-m, rgba(255,255,255,0.11))",
                            background: "var(--surface, rgba(255,255,255,0.032))",
                            fontSize: 13,
                            fontWeight: 500,
                            color: "var(--text-2, #9E9589)",
                            cursor: signOutLoading ? "not-allowed" : "pointer",
                            fontFamily: fonts.sans,
                            transition: "all 0.15s",
                            opacity: signOutLoading ? 0.5 : 1,
                        }}
                        onMouseEnter={(e) => {
                            if (!signOutLoading) {
                                e.currentTarget.style.background = "rgba(239,68,68,0.06)";
                                e.currentTarget.style.borderColor = "rgba(239,68,68,0.2)";
                                e.currentTarget.style.color = "#EF4444";
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "var(--surface, rgba(255,255,255,0.032))";
                            e.currentTarget.style.borderColor = "var(--border-m, rgba(255,255,255,0.11))";
                            e.currentTarget.style.color = "var(--text-2, #9E9589)";
                        }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        {signOutLoading ? "Signing out…" : "Sign out"}
                    </button>
                </div>
            </nav>

            {/* ══════════ Dot grid background ══════════ */}
            <div aria-hidden style={{
                position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
                backgroundImage: "radial-gradient(circle, var(--text-3, #524E46) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
                opacity: 0.25,
            }} />

            {/* ══════════ Main content ══════════ */}
            <main style={{
                position: "relative", zIndex: 1,
                maxWidth: 720,
                margin: "0 auto",
                padding: "48px 24px 80px",
                transition: "opacity 0.6s ease, transform 0.6s ease",
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(18px)",
            }}>
                {/* ── Welcome header ── */}
                <div style={{ marginBottom: 36 }}>
                    <p style={{
                        fontFamily: fonts.mono,
                        fontSize: 10,
                        fontWeight: 500,
                        color: "var(--amber, #D97706)",
                        letterSpacing: "0.09em",
                        textTransform: "uppercase",
                        marginBottom: 10,
                    }}>
                        Dashboard
                    </p>
                    <h1 style={{
                        fontFamily: fonts.serif,
                        fontSize: 34,
                        fontWeight: 400,
                        lineHeight: 1.15,
                        letterSpacing: "-0.015em",
                        color: "var(--text, #EDE8DF)",
                        marginBottom: 8,
                    }}>
                        Welcome back, <span style={{ fontStyle: "italic" }}>{user.name?.split(" ")[0] ?? "User"}</span>
                    </h1>
                    <p style={{ fontSize: 14, color: "var(--text-2, #9E9589)", lineHeight: 1.55 }}>
                        Manage your profile and account settings.
                    </p>
                </div>

                {/* ── Profile card ── */}
                <div style={{ ...cardStyle, marginBottom: 20 }}>
                    {/* Amber glow top-right */}
                    <div aria-hidden style={{
                        position: "absolute", top: -40, right: -40,
                        width: 180, height: 180, borderRadius: "50%",
                        background: "var(--amber-faint, rgba(217,119,6,0.07))",
                        filter: "blur(60px)", pointerEvents: "none",
                    }} />

                    {/* Avatar + info row */}
                    <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 24, position: "relative", zIndex: 1 }}>
                        {user.image ? (
                            <img
                                src={user.image}
                                alt={user.name ?? "User"}
                                style={{
                                    width: 64, height: 64, borderRadius: "50%",
                                    objectFit: "cover",
                                    border: "2px solid var(--border-m, rgba(255,255,255,0.11))",
                                }}
                            />
                        ) : (
                            <div style={{
                                width: 64, height: 64, borderRadius: "50%",
                                background: "var(--amber-faint, rgba(217,119,6,0.07))",
                                border: "2px solid var(--amber-border, rgba(217,119,6,0.18))",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontFamily: fonts.mono, fontSize: 22, fontWeight: 500,
                                color: "var(--amber, #D97706)",
                            }}>
                                {initials}
                            </div>
                        )}
                        <div>
                            <h2 style={{
                                fontFamily: fonts.sans,
                                fontSize: 18, fontWeight: 600,
                                color: "var(--text, #EDE8DF)",
                                letterSpacing: "-0.01em",
                                marginBottom: 3,
                            }}>
                                {user.name}
                            </h2>
                            <p style={{ fontSize: 13, color: "var(--text-2, #9E9589)", fontFamily: fonts.mono }}>
                                {user.email}
                            </p>
                        </div>
                    </div>

                    {/* Divider */}
                    <div style={{ height: "0.5px", background: "var(--border, rgba(255,255,255,0.07))", marginBottom: 20 }} />

                    {/* Account detail cells */}
                    <p style={{ ...labelStyle, marginBottom: 12 }}>Account details</p>
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                        gap: 10,
                        marginBottom: 20,
                    }}>
                        <div style={detailCellStyle}>
                            <p style={labelStyle}>User ID</p>
                            <p style={{ ...valueStyle, fontSize: 12 }}>{user.id}</p>
                        </div>
                        <div style={detailCellStyle}>
                            <p style={labelStyle}>Email</p>
                            <p style={valueStyle}>{user.email}</p>
                        </div>
                        <div style={detailCellStyle}>
                            <p style={labelStyle}>Email verified</p>
                            <p style={{
                                ...valueStyle,
                                color: user.emailVerified
                                    ? "#34D399"
                                    : "var(--amber, #D97706)",
                            }}>
                                {user.emailVerified ? "✓ Verified" : "✗ Not verified"}
                            </p>
                        </div>
                        <div style={detailCellStyle}>
                            <p style={labelStyle}>Session expires</p>
                            <p style={valueStyle}>
                                {new Date(session.session.expiresAt).toLocaleDateString("en-US", {
                                    month: "short", day: "numeric", year: "numeric",
                                })}
                            </p>
                        </div>
                    </div>

                    {/* Edit / success feedback */}
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            style={{
                                display: "inline-flex", alignItems: "center", gap: 6,
                                padding: "9px 20px", borderRadius: 10,
                                background: "var(--amber, #D97706)",
                                border: "none", color: "#fff",
                                fontSize: 13, fontWeight: 600,
                                fontFamily: fonts.sans,
                                letterSpacing: "-0.01em",
                                cursor: "pointer",
                                transition: "background 0.15s, transform 0.1s",
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--amber-lt, #F59E0B)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--amber, #D97706)"; }}
                            onMouseDown={(e) => { e.currentTarget.style.transform = "translateY(1px)"; }}
                            onMouseUp={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Edit profile
                        </button>
                    )}

                    {updateSuccess && (
                        <div style={{
                            marginTop: 12, padding: "10px 14px", borderRadius: 10,
                            background: "rgba(52,211,153,0.06)",
                            border: "0.5px solid rgba(52,211,153,0.18)",
                            fontSize: 13, color: "#34D399",
                            fontFamily: fonts.sans,
                        }}>
                            ✓ Profile updated successfully.
                        </div>
                    )}
                </div>

                {/* ── Edit form card ── */}
                {isEditing && (
                    <div style={{ ...cardStyle, marginBottom: 20 }}>
                        <p style={{ ...labelStyle, marginBottom: 18 }}>Edit profile</p>

                        <form onSubmit={handleUpdate}>
                            {updateError && (
                                <div style={{
                                    padding: "10px 14px", marginBottom: 16, borderRadius: 10,
                                    background: "rgba(239,68,68,0.06)",
                                    border: "0.5px solid rgba(239,68,68,0.2)",
                                    fontSize: 13, color: "#EF4444",
                                    fontFamily: fonts.sans,
                                }}>
                                    {updateError}
                                </div>
                            )}

                            {/* Name */}
                            <div style={{ marginBottom: 14 }}>
                                <label style={{
                                    display: "block", fontSize: 12, fontWeight: 500,
                                    color: "var(--text-2, #9E9589)",
                                    fontFamily: fonts.sans, marginBottom: 6,
                                }}>
                                    Full name
                                </label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    style={inputStyle}
                                    placeholder="John Doe"
                                    required
                                    onFocus={(e) => {
                                        e.currentTarget.style.borderColor = "var(--amber, #D97706)";
                                        e.currentTarget.style.boxShadow = "0 0 0 3px var(--amber-faint, rgba(217,119,6,0.07))";
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.style.borderColor = "var(--border-m, rgba(255,255,255,0.11))";
                                        e.currentTarget.style.boxShadow = "none";
                                    }}
                                />
                            </div>

                            {/* Image URL */}
                            <div style={{ marginBottom: 14 }}>
                                <label style={{
                                    display: "block", fontSize: 12, fontWeight: 500,
                                    color: "var(--text-2, #9E9589)",
                                    fontFamily: fonts.sans, marginBottom: 6,
                                }}>
                                    Profile photo URL
                                </label>
                                <input
                                    type="url"
                                    value={editImage}
                                    onChange={(e) => setEditImage(e.target.value)}
                                    style={inputStyle}
                                    placeholder="https://example.com/photo.jpg"
                                    onFocus={(e) => {
                                        e.currentTarget.style.borderColor = "var(--amber, #D97706)";
                                        e.currentTarget.style.boxShadow = "0 0 0 3px var(--amber-faint, rgba(217,119,6,0.07))";
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.style.borderColor = "var(--border-m, rgba(255,255,255,0.11))";
                                        e.currentTarget.style.boxShadow = "none";
                                    }}
                                />
                                <p style={{ fontSize: 11, color: "var(--text-3, #524E46)", fontFamily: fonts.mono, marginTop: 5 }}>
                                    Paste a direct image URL
                                </p>
                            </div>

                            {/* Preview */}
                            {editImage && (
                                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                                    <img
                                        src={editImage}
                                        alt="Preview"
                                        style={{
                                            width: 44, height: 44, borderRadius: "50%",
                                            objectFit: "cover",
                                            border: "0.5px solid var(--border-m, rgba(255,255,255,0.11))",
                                        }}
                                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                                    />
                                    <span style={{ fontSize: 11, fontFamily: fonts.mono, color: "var(--text-3, #524E46)" }}>
                                        Preview
                                    </span>
                                </div>
                            )}

                            {/* Buttons */}
                            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                                <button
                                    type="submit"
                                    disabled={updateLoading}
                                    style={{
                                        padding: "10px 20px", borderRadius: 10,
                                        background: "var(--amber, #D97706)",
                                        border: "none", color: "#fff",
                                        fontSize: 13, fontWeight: 600,
                                        fontFamily: fonts.sans,
                                        cursor: updateLoading ? "not-allowed" : "pointer",
                                        opacity: updateLoading ? 0.6 : 1,
                                        transition: "background 0.15s",
                                    }}
                                    onMouseEnter={(e) => { if (!updateLoading) e.currentTarget.style.background = "var(--amber-lt, #F59E0B)"; }}
                                    onMouseLeave={(e) => { if (!updateLoading) e.currentTarget.style.background = "var(--amber, #D97706)"; }}
                                >
                                    {updateLoading ? "Saving…" : "Save changes"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setUpdateError("");
                                        setEditName(session.user.name ?? "");
                                        setEditImage(session.user.image ?? "");
                                    }}
                                    style={{
                                        padding: "10px 20px", borderRadius: 10,
                                        background: "var(--surface, rgba(255,255,255,0.032))",
                                        border: "0.5px solid var(--border-m, rgba(255,255,255,0.11))",
                                        color: "var(--text-2, #9E9589)",
                                        fontSize: 13, fontWeight: 500,
                                        fontFamily: fonts.sans,
                                        cursor: "pointer",
                                        transition: "all 0.15s",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = "var(--surface-h, rgba(255,255,255,0.058))";
                                        e.currentTarget.style.borderColor = "var(--amber-border, rgba(217,119,6,0.18))";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = "var(--surface, rgba(255,255,255,0.032))";
                                        e.currentTarget.style.borderColor = "var(--border-m, rgba(255,255,255,0.11))";
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ── Footer ── */}
                <div style={{ textAlign: "center", paddingTop: 40, paddingBottom: 12 }}>
                    <p style={{
                        fontSize: 11, fontFamily: fonts.mono,
                        color: "var(--text-3, #524E46)",
                        letterSpacing: "0.04em",
                    }}>
                        Built by{" "}
                        <a
                            href="https://abirbhabdasgupta.vercel.app"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                color: "var(--text-2, #9E9589)",
                                textDecoration: "none",
                                transition: "color 0.15s",
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--amber, #D97706)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-2, #9E9589)"; }}
                        >
                            Abirbhab Dasgupta
                        </a>
                    </p>
                </div>
            </main>
        </div>
    );
}