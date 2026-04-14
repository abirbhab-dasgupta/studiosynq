"use client";

import Link from "next/link";
import Image from "next/image";
import { ReactNode, useEffect, useState } from "react";

interface AuthLayoutProps {
    children: ReactNode;
    leftContent: ReactNode;
    activePage: "sign-in" | "sign-up";
}

export function AuthLayout({ children, leftContent, activePage }: AuthLayoutProps) {
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        // Sync with the html class already set by the app's theme system
        const html = document.documentElement;
        setIsDark(!html.classList.contains("light"));
    }, []);

    const toggleTheme = () => {
        const html = document.documentElement;
        if (isDark) {
            html.classList.add("light");
        } else {
            html.classList.remove("light");
        }
        setIsDark(!isDark);
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                background: "var(--bg, #0C0B09)",
                color: "var(--text, #EDE8DF)",
                fontFamily: "var(--font-sans, 'DM Sans', sans-serif)",
            }}
        >
            <nav
                className="nav-bar"
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 20px",
                    height: 52,
                    flexShrink: 0,
                    borderBottom: "0.5px solid var(--border, rgba(255,255,255,0.07))",
                    background: "rgba(12, 11, 9, 0.80)",
                    backdropFilter: "blur(14px)",
                    WebkitBackdropFilter: "blur(14px)",
                    position: "sticky",
                    top: 0,
                    zIndex: 50,
                }}
            >
                {/* Logo */}
                <Link
                    href="/"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 9,
                        textDecoration: "none",
                        flexShrink: 0,
                    }}
                >
                    <Image
                        src="/syncspace-logo.jpg"
                        alt="SyncSpace Logo"
                        width={26}
                        height={26}
                        className="shrink-0"
                        style={{ borderRadius: 7 }}
                    />
                    <span
                        style={{
                            fontSize: 15,
                            fontWeight: 500,
                            letterSpacing: "-0.02em",
                            color: "var(--text, #EDE8DF)",
                            fontFamily: "var(--font-sans, 'DM Sans', sans-serif)",
                        }}
                    >
                        SyncSpace
                    </span>
                </Link>

                {/* Right side: Sign in / Sign up buttons + theme toggle */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {/* Sign in button */}
                    <Link
                        href="/auth/sign-in"
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "7px 16px",
                            borderRadius: 8,
                            border: `0.5px solid ${activePage === "sign-in"
                                ? "var(--amber-border, rgba(217,119,6,0.18))"
                                : "var(--border-m, rgba(255,255,255,0.11))"}`,
                            background: activePage === "sign-in"
                                ? "var(--surface-h, rgba(255,255,255,0.058))"
                                : "transparent",
                            fontSize: 13,
                            fontWeight: 500,
                            color: activePage === "sign-in"
                                ? "var(--text, #EDE8DF)"
                                : "var(--text-2, #9E9589)",
                            textDecoration: "none",
                            fontFamily: "var(--font-sans, 'DM Sans', sans-serif)",
                            transition: "all 0.15s",
                            letterSpacing: "-0.01em",
                        }}
                    >
                        Sign in
                    </Link>

                    {/* Sign up button — amber filled */}
                    <Link
                        href="/auth/sign-up"
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "7px 16px",
                            borderRadius: 8,
                            background: activePage === "sign-up"
                                ? "var(--amber, #D97706)"
                                : "var(--surface, rgba(255,255,255,0.032))",
                            border: `0.5px solid ${activePage === "sign-up"
                                ? "var(--amber, #D97706)"
                                : "var(--border-m, rgba(255,255,255,0.11))"}`,
                            fontSize: 13,
                            fontWeight: 500,
                            color: activePage === "sign-up" ? "#fff" : "var(--text-2, #9E9589)",
                            textDecoration: "none",
                            fontFamily: "var(--font-sans, 'DM Sans', sans-serif)",
                            transition: "all 0.15s",
                            letterSpacing: "-0.01em",
                        }}
                    >
                        Sign up
                    </Link>

                    {/* Theme toggle — matches landing page moon/sun pill */}
                    <button
                        onClick={toggleTheme}
                        aria-label="Toggle theme"
                        style={{
                            width: 34,
                            height: 34,
                            borderRadius: 8,
                            border: "0.5px solid var(--border-m, rgba(255,255,255,0.11))",
                            background: "var(--surface, rgba(255,255,255,0.032))",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            fontSize: 15,
                            transition: "background 0.15s, border-color 0.15s",
                            color: "var(--text-2, #9E9589)",
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
                        {isDark ? "☀" : "☾"}
                    </button>
                </div>
            </nav>

            {/* ════════════════════════════
          BODY — split layout
          ════════════════════════════ */}
            <div style={{ display: "flex", flex: 1 }}>

                {/* ── LEFT PANEL ── */}
                <div
                    className="auth-left-panel"
                    style={{
                        width: "46%",
                        flexShrink: 0,
                        background: "var(--bg2, #131210)",
                        borderRight: "0.5px solid var(--border, rgba(255,255,255,0.07))",
                        padding: "56px 52px 56px 52px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        position: "relative",
                        overflow: "hidden",
                        minHeight: "calc(100vh - 52px)",
                    }}
                >
                    {/* Dot grid — same as landing page hero */}
                    <div
                        aria-hidden
                        style={{
                            position: "absolute",
                            inset: 0,
                            pointerEvents: "none",
                            backgroundImage: "radial-gradient(circle, var(--text-3, #524E46) 1px, transparent 1px)",
                            backgroundSize: "32px 32px",
                            opacity: 0.4,
                        }}
                    />
                    {/* Amber glow — bottom left */}
                    <div
                        aria-hidden
                        style={{
                            position: "absolute",
                            bottom: -80,
                            left: -60,
                            width: 400,
                            height: 400,
                            borderRadius: "50%",
                            background: "var(--amber-faint, rgba(217,119,6,0.07))",
                            filter: "blur(80px)",
                            pointerEvents: "none",
                        }}
                    />
                    {/* Amber glow — top right */}
                    <div
                        aria-hidden
                        style={{
                            position: "absolute",
                            top: -40,
                            right: -40,
                            width: 220,
                            height: 220,
                            borderRadius: "50%",
                            background: "var(--amber-faint, rgba(217,119,6,0.04))",
                            filter: "blur(60px)",
                            pointerEvents: "none",
                        }}
                    />

                    <div style={{ position: "relative", zIndex: 1, maxWidth: 420 }}>
                        {leftContent}
                    </div>
                </div>

                {/* ── RIGHT PANEL — form ── */}
                <div
                    style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "52px 32px",
                        background: "var(--bg, #0C0B09)",
                    }}
                >
                    {children}
                </div>
            </div>

            <style>{`
        html.light .nav-bar {
          background: rgba(249, 248, 245, 0.85) !important;
        }
        @media (max-width: 900px) {
          .auth-left-panel { display: none !important; }
        }
      `}</style>
        </div>
    );
}