"use client";

import { useState, useEffect } from "react";
import { DARK, LIGHT } from "./tokens";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { StatsCards } from "./stats-cards";
import { RoomsGrid } from "./rooms-grid";
import { ActivityFeed } from "./activity-feed";
import { QuickLaunch } from "./quick-launch";

type Props = {
    user: { id: string; name: string; email: string };
};

export function DashboardClient({ user }: Props) {
    const [theme, setTheme] = useState<"dark" | "light">("dark");
    const [activeNav, setActiveNav] = useState("Dashboard");
    // sidebarOpen controls mobile drawer — on desktop sidebar is always visible
    const [sidebarOpen, setSidebarOpen] = useState(false);
    // isMobile tracks whether we're on a narrow screen
    const [isMobile, setIsMobile] = useState(false);
    const T = theme === "dark" ? DARK : LIGHT;

    // Listen for screen width changes and update isMobile accordingly
    // This runs only on the client so no SSR mismatch
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    return (
        <div style={{
            display: "flex", height: "100vh", width: "100%", overflow: "hidden",
            fontFamily: "'DM Sans',sans-serif", background: T.bg, color: T.text,
            transition: "background .3s, color .3s",
        }}>
            {/* Mobile overlay — tapping it closes the sidebar */}
            {isMobile && sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    style={{
                        position: "fixed", inset: 0, zIndex: 40,
                        background: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)",
                    }}
                />
            )}

            {/* Sidebar — fixed drawer on mobile, static column on desktop */}
            <div style={{
                position: isMobile ? "fixed" : "relative",
                left: isMobile ? (sidebarOpen ? 0 : -220) : 0,
                top: 0, bottom: 0, zIndex: 50,
                transition: "left .25s ease",
                flexShrink: 0,
            }}>
                <Sidebar
                    T={T}
                    activeNav={activeNav}
                    setActiveNav={(label) => {
                        setActiveNav(label);
                        setSidebarOpen(false);
                    }}
                    user={user}
                />
            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <Topbar
                    T={T}
                    theme={theme}
                    setTheme={setTheme}
                    isMobile={isMobile}
                    onMenuClick={() => setSidebarOpen(true)}
                />

                <main style={{
                    flex: 1, overflowY: "auto",
                    padding: isMobile ? "20px 16px 36px" : "28px 28px 48px",
                    display: "flex", flexDirection: "column", gap: 24,
                }}>
                    {/* Greeting */}
                    <div>
                        <div style={{
                            fontSize: 11, fontWeight: 600, textTransform: "uppercase",
                            letterSpacing: ".12em", color: T.text3,
                            fontFamily: "'DM Mono',monospace", marginBottom: 8,
                        }}>Overview</div>
                        <h1 style={{
                            fontSize: isMobile ? 22 : 26, fontWeight: 400,
                            fontFamily: "'Instrument Serif',Georgia,serif",
                            color: T.text, letterSpacing: "-.3px",
                        }}>Welcome back, {user.name} 👋</h1>
                    </div>

                    <StatsCards T={T} userId={user.id} isMobile={isMobile} />

                    {/* Rooms + Activity — stack on mobile, side by side on desktop */}
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr",
                        gap: 16,
                    }}>
                        <RoomsGrid T={T} isMobile={isMobile} />
                        <ActivityFeed T={T} />
                    </div>

                    <QuickLaunch T={T} />
                </main>
            </div>
        </div>
    );
}