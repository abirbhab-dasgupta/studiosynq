"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Ico, P } from "@/components/dashboard/icons";
import { DARK, LIGHT } from "@/components/dashboard/tokens";
import { NotificationBell } from "@/components/dashboard/notification-bell";
import { SearchBar } from "@/components/dashboard/search-bar";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";

const MENU = "M3 12h18 M3 6h18 M3 18h18";

const navItems = [
    { label: "Dashboard", icon: P.home,   href: "/dashboard" },
    { label: "Rooms",     icon: P.grid,   href: "/rooms",    tourId: "nav-rooms" },
    { label: "Tasks",     icon: P.check,  href: "/tasks",    tourId: "nav-tasks" },
    { label: "Focus",     icon: P.shield, href: "/focus",    tourId: "nav-focus" },
    { label: "Profile",   icon: P.user,   href: "/profile" },
];

const agents = [
    { name: "CodeBuddy",    slug: "codebuddy",    icon: P.code,   accent: "#10b981" },
    { name: "ClarityAgent", slug: "clarityagent", icon: P.chat,   accent: "#6366f1" },
    { name: "ResearchBot",  slug: "researchbot",  icon: P.search, accent: "#D97706" },
    { name: "DesignExpert", slug: "designexpert", icon: P.star,   accent: "#ec4899" },
    { name: "EmailWriter",  slug: "emailwriter",  icon: P.mail,   accent: "#3b82f6" },
];

type Props = {
    user: { id: string; name: string; email: string };
    children: React.ReactNode;
};

export function AppShell({ user, children }: Props) {
    const router   = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile,    setIsMobile]    = useState(false);
    const [showSignOut, setShowSignOut] = useState(false);
    const [signingOut,  setSigningOut]  = useState(false);
    const [theme, setTheme] = useState<"dark" | "light">(() => {
        if (typeof window === "undefined") return "dark";
        return (localStorage.getItem("theme") as "dark" | "light") ?? "dark";
    });

    const T = theme === "dark" ? DARK : LIGHT;

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    useEffect(() => {
        const html = document.documentElement;
        theme === "light" ? html.classList.add("light") : html.classList.remove("light");
        localStorage.setItem("theme", theme);
    }, [theme]);

    async function handleSignOut() {
        setSigningOut(true);
        await authClient.signOut();
        router.push("/auth/sign-in");
    }

    const { data: profile } = useQuery({
        queryKey: ["profile"],
        queryFn:  () => fetch("/api/profile").then(r => r.json()),
    });

    const initials = user.name.charAt(0).toUpperCase();
    const s = (obj: React.CSSProperties): React.CSSProperties => obj;

    return (
        <div style={s({
            display: "flex", height: "100vh", width: "100%",
            overflow: "hidden", background: "var(--bg)", color: "var(--text)",
            fontFamily: "var(--font-sans)", transition: "background .3s, color .3s",
        })}>

            {/* ── Sign out confirmation ── */}
            {showSignOut && (
                <div style={s({
                    position: "fixed", inset: 0, zIndex: 100,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
                })}>
                    <div style={s({
                        background: "var(--bg2)", border: "1px solid var(--border-m)",
                        borderRadius: 16, padding: "28px 28px 24px",
                        width: 320, display: "flex", flexDirection: "column", gap: 8,
                        boxShadow: "0 24px 48px rgba(0,0,0,0.3)",
                    })}>
                        <div style={s({
                            width: 36, height: 36, borderRadius: 10,
                            background: "rgba(239,68,68,0.1)",
                            display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4,
                        })}>
                            <Ico d={P.logout} size={16} stroke="#ef4444" />
                        </div>
                        <p style={s({ fontSize: 15, fontWeight: 500, color: "var(--text)" })}>Sign out?</p>
                        <p style={s({ fontSize: 12, color: "var(--text-2)", lineHeight: 1.5, marginBottom: 8 })}>
                            You&apos;ll be signed out of your workspace.
                        </p>
                        <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={() => setShowSignOut(false)} style={s({
                                flex: 1, height: 34, background: "var(--surface)",
                                border: "1px solid var(--border)", borderRadius: 8,
                                fontSize: 12, fontWeight: 500, color: "var(--text-2)",
                                cursor: "pointer", fontFamily: "var(--font-sans)",
                            })}>Cancel</button>
                            <button onClick={handleSignOut} disabled={signingOut} style={s({
                                flex: 1, height: 34, background: "#ef4444", border: "none",
                                borderRadius: 8, fontSize: 12, fontWeight: 600, color: "#fff",
                                cursor: "pointer", fontFamily: "var(--font-sans)",
                                opacity: signingOut ? 0.7 : 1,
                            })}>{signingOut ? "Signing out..." : "Yes, sign out"}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Mobile overlay ── */}
            {isMobile && sidebarOpen && (
                <div onClick={() => setSidebarOpen(false)} style={s({
                    position: "fixed", inset: 0, zIndex: 40,
                    background: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)",
                })} />
            )}

            {/* ── Sidebar ── */}
            <aside style={s({
                width: 200, flexShrink: 0, display: "flex", flexDirection: "column",
                background: "var(--bg2)", borderRight: "1px solid var(--border)", height: "100%",
                position: isMobile ? "fixed" : "relative",
                left: isMobile ? (sidebarOpen ? 0 : -220) : 0,
                top: 0, bottom: 0, zIndex: 50, transition: "left .25s ease",
            })}>
                {/* Logo */}
                <div style={s({
                    height: 52, display: "flex", alignItems: "center", gap: 9,
                    padding: "0 16px", borderBottom: "1px solid var(--border)", flexShrink: 0,
                })}>
                    <Image src="/studiosynq-logo.jpg" alt="Studiosynq" width={22} height={22}
                        style={{ borderRadius: 5, objectFit: "cover" }} />
                    <span style={s({ fontSize: 13, fontWeight: 500, color: "var(--text)", letterSpacing: "-.2px" })}>
                        Studiosynq
                    </span>
                </div>

                {/* Nav */}
                <nav style={s({ flex: 1, overflowY: "auto", padding: "12px 10px" })}>
                    <div style={s({
                        fontSize: 9, fontWeight: 600, textTransform: "uppercase",
                        letterSpacing: ".1em", color: "var(--text-3)",
                        padding: "0 8px 8px", marginTop: 4,
                    })}>Workspace</div>

                    {navItems.map(item => {
                        const active = pathname === item.href ||
                            (item.href !== "/dashboard" && pathname.startsWith(item.href));
                        return (
                            <button
                                key={item.label}
                                data-tour={item.tourId}
                                onClick={() => { router.push(item.href); setSidebarOpen(false); }}
                                style={s({
                                    display: "flex", alignItems: "center", gap: 8,
                                    padding: "6px 8px", borderRadius: 8,
                                    width: "100%", textAlign: "left",
                                    fontSize: 13, fontWeight: active ? 500 : 400,
                                    fontFamily: "var(--font-sans)",
                                    color: active ? "var(--text)" : "var(--text-2)",
                                    background: active ? "var(--surface-h)" : "transparent",
                                    border: "none", cursor: "pointer", transition: "all .15s",
                                })}>
                                <Ico d={item.icon} size={13} stroke={active ? "var(--amber)" : "var(--text-2)"} />
                                {item.label}
                            </button>
                        );
                    })}

                    <div
                        data-tour="nav-agents"
                        style={s({
                            fontSize: 9, fontWeight: 600, textTransform: "uppercase",
                            letterSpacing: ".1em", color: "var(--text-3)",
                            padding: "0 8px 8px", marginTop: 14,
                        })}
                    >Agents</div>

                    {agents.map(ag => {
                        const agentActive = pathname.startsWith(`/agents/${ag.slug}`);
                        return (
                            <button
                                key={ag.name}
                                onClick={() => { router.push(`/agents/${ag.slug}`); setSidebarOpen(false); }}
                                style={s({
                                    display: "flex", alignItems: "center", gap: 8,
                                    padding: "6px 8px", borderRadius: 8,
                                    width: "100%", textAlign: "left",
                                    fontSize: 13, fontWeight: agentActive ? 500 : 400,
                                    fontFamily: "var(--font-sans)",
                                    color: agentActive ? "var(--text)" : "var(--text-2)",
                                    background: agentActive ? "var(--surface-h)" : "transparent",
                                    border: "none", cursor: "pointer", transition: "all .15s",
                                })}>
                                <Ico d={ag.icon} size={12} stroke={ag.accent} />
                                <span style={{ flex: 1 }}>{ag.name}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* User + sign out */}
                <div style={s({ padding: "10px 12px", borderTop: "1px solid var(--border)", flexShrink: 0 })}>
                    <div style={{ flex: 1 }}>
                        <div style={s({ display: "flex", alignItems: "center", gap: 8, padding: "4px 6px" })}>
                            {profile?.image ? (
                                <Image src={profile.image} alt="avatar" width={26} height={26} style={{
                                    borderRadius: "50%", objectFit: "cover",
                                    border: "1px solid var(--amber-border)", flexShrink: 0,
                                }} />
                            ) : (
                                <div style={{
                                    width: 26, height: 26, borderRadius: "50%",
                                    background: "var(--amber-faint)", color: "var(--amber)",
                                    fontSize: 11, fontWeight: 600,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontFamily: "var(--font-mono)", border: "1px solid var(--amber-border)", flexShrink: 0,
                                }}>{initials}</div>
                            )}
                            <div style={{ flex: 1 }}>
                                <div style={s({ fontSize: 12, fontWeight: 500, color: "var(--text)" })}>{user.name}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <button onClick={() => setShowSignOut(true)} style={s({
                    display: "flex", alignItems: "center", gap: 6,
                    width: "100%", padding: "6px 8px", marginTop: 4,
                    background: "transparent", border: "none", borderRadius: 8,
                    fontSize: 11, color: "#ef4444", cursor: "pointer",
                    fontFamily: "var(--font-sans)", transition: "all .15s",
                })}>
                    <Ico d={P.logout} size={12} stroke="#ef4444" />
                    Sign out
                </button>
            </aside>

            {/* ── Main area ── */}
            <div style={s({ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 })}>
                {/* Topbar */}
                <header style={s({
                    height: 52, flexShrink: 0, background: "var(--bg2)",
                    borderBottom: "1px solid var(--border)",
                    display: "flex", alignItems: "center", gap: 10, padding: "0 20px",
                })}>
                    {isMobile && (
                        <button onClick={() => setSidebarOpen(true)} style={s({
                            width: 32, height: 32, borderRadius: 8, background: "var(--surface)",
                            border: "1px solid var(--border)", display: "flex",
                            alignItems: "center", justifyContent: "center", cursor: "pointer",
                        })}>
                            <Ico d={MENU} size={15} stroke="var(--text-2)" />
                        </button>
                    )}

                    {!isMobile && <SearchBar />}

                    <div style={s({ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" })}>
                        <NotificationBell T={T} />
                        <button onClick={() => setTheme(t => t === "dark" ? "light" : "dark")} style={s({
                            width: 32, height: 32, borderRadius: 8, background: "var(--surface)",
                            border: "1px solid var(--border)", display: "flex",
                            alignItems: "center", justifyContent: "center", cursor: "pointer",
                        })}>
                            <Ico d={theme === "dark" ? P.sun : P.moon} size={13} stroke="var(--text-2)" />
                        </button>
                    </div>
                </header>

                {/* Page content */}
                <main style={s({ flex: 1, overflow: "auto", minWidth: 0 })}>
                    {children}
                </main>
            </div>
        </div>
    );
}