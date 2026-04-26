"use client";

import { useEffect, useState } from "react";
import { StatsCards } from "./stats-cards";
import { RoomsGrid } from "./rooms-grid";
import { ActivityFeed } from "./activity-feed";
import { QuickLaunch } from "./quick-launch";
import { DARK, LIGHT } from "./tokens";

type Props = {
    user: { id: string; name: string; email: string };
};

export function DashboardClient({ user }: Props) {
    const [isMobile, setIsMobile] = useState(false);
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
        // Read initial theme from html class
        const isLight = document.documentElement.classList.contains("light");
        setTheme(isLight ? "light" : "dark");

        // Watch for theme changes made by AppShell's toggle button
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

    return (
        <div className="dashboard-content">

            {/* Greeting */}
            <div>
                <p style={{
                    fontSize: 11, fontWeight: 600, textTransform: "uppercase",
                    letterSpacing: ".12em", color: "var(--text-3)",
                    fontFamily: "var(--font-mono)", marginBottom: 8,
                }}>Overview</p>
                <h1 style={{
                    fontSize: isMobile ? 22 : 26, fontWeight: 400,
                    fontFamily: "var(--font-serif)",
                    color: "var(--text)", letterSpacing: "-.3px",
                }}>Welcome back, {user.name} 👋</h1>
            </div>

            {/* Stats */}
            <StatsCards T={T} userId={user.id} isMobile={isMobile} />

            {/* Rooms + Activity */}
            <div style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr",
                gap: 16,
            }}>
                <RoomsGrid T={T} isMobile={isMobile} />
                <ActivityFeed T={T} />
            </div>

            {/* Quick launch */}
            <QuickLaunch T={T} />
        </div>
    );
}