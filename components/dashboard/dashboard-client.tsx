"use client";

import { useEffect, useState, useSyncExternalStore, Component, type ReactNode } from "react";
import { StatsCards } from "./stats-cards";
import { RoomsGrid } from "./rooms-grid";
import { ActivityFeed } from "./activity-feed";
import { QuickLaunch } from "./quick-launch";
import { DARK, LIGHT } from "./tokens";
import { ProductTour } from "@/components/shared/product-tour";
import { useTour } from "@/hooks/useTour";

type Props = {
  user: { id: string; name: string; email: string };
};

// ── Error Boundary ────────────────────────────────────────────────────────────

class DashboardErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", gap: 12, padding: "60px 24px", textAlign: "center",
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
          }}>⚠</div>
          <p style={{ fontSize: 15, fontWeight: 500, color: "var(--text)", fontFamily: "var(--font-sans)" }}>
            Dashboard failed to load
          </p>
          <p style={{ fontSize: 13, color: "var(--text-2)", fontFamily: "var(--font-sans)", maxWidth: 320, lineHeight: 1.5 }}>
            Something went wrong while loading your dashboard. Try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              height: 34, padding: "0 18px", background: "var(--amber)", border: "none",
              borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#fff",
              cursor: "pointer", fontFamily: "var(--font-sans)",
            }}
          >
            Refresh page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function DashboardSkeleton({ isMobile }: { isMobile: boolean }) {
  return (
    <div className="dashboard-content">
      {/* Greeting skeleton */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div className="skeleton" style={{ width: 80, height: 12, borderRadius: 4 }} />
        <div className="skeleton" style={{ width: 240, height: 28, borderRadius: 6 }} />
      </div>

      {/* Stats skeleton */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 12 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{
            height: 80, borderRadius: 12, border: "1px solid var(--border)",
            background: "var(--bg3)", padding: "16px",
            display: "flex", flexDirection: "column", gap: 8,
          }}>
            <div className="skeleton" style={{ width: 32, height: 20, borderRadius: 4 }} />
            <div className="skeleton" style={{ width: 80, height: 10, borderRadius: 3 }} />
          </div>
        ))}
      </div>

      {/* Rooms + activity skeleton */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div className="skeleton" style={{ width: 100, height: 14, borderRadius: 4 }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton" style={{ height: 90, borderRadius: 12 }} />
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div className="skeleton" style={{ width: 80, height: 14, borderRadius: 4 }} />
          {[1, 2, 3].map((i) => (
            <div key={i} style={{
              height: 52, borderRadius: 10, border: "1px solid var(--border)",
              background: "var(--bg3)", padding: "10px 14px",
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <div className="skeleton" style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0 }} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
                <div className="skeleton" style={{ width: "70%", height: 10, borderRadius: 3 }} />
                <div className="skeleton" style={{ width: "40%", height: 8, borderRadius: 3 }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick launch skeleton */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div className="skeleton" style={{ width: 100, height: 14, borderRadius: 4 }} />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton" style={{ width: 110, height: 32, borderRadius: 8 }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function DashboardClient({ user }: Props) {
  const [isMobile, setIsMobile] = useState(false);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window === "undefined") return "dark";
    if (document.documentElement.classList.contains("light")) return "light";
    return (localStorage.getItem("theme") as "dark" | "light") ?? "dark";
  });
  const { shouldShow, completeTour, skipTour } = useTour();
  const T = theme === "dark" ? DARK : LIGHT;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const isLight = document.documentElement.classList.contains("light");
      setTheme(isLight ? "light" : "dark");
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  if (!mounted) return <DashboardSkeleton isMobile={false} />;

  return (
    <DashboardErrorBoundary>
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
            fontFamily: "var(--font-serif)", color: "var(--text)", letterSpacing: "-.3px",
          }}>Welcome back, {user.name} 👋</h1>
        </div>

        {/* Stats — tour target */}
        <div data-tour="dashboard-stats">
          <StatsCards T={T} userId={user.id} isMobile={isMobile} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr", gap: 16 }}>
          <RoomsGrid T={T} isMobile={isMobile} />
          <ActivityFeed T={T} />
        </div>

        {/* Quick launch — tour target */}
        <div data-tour="quick-launch">
          <QuickLaunch T={T} />
        </div>
      </div>

      {/* Tour — only on first login */}
      {shouldShow && (
        <ProductTour onComplete={completeTour} onSkip={skipTour} />
      )}
    </DashboardErrorBoundary>
  );
}