"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTheme } from "@/components/landing/theme-provider";

const NAV_LINKS = [
  { href: "#agents", label: "Agents" },
  { href: "#features", label: "Features" },
  { href: "#how", label: "How it works" },
];

export default function Navbar() {
  const { theme, toggle } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      if (menuOpen) setMenuOpen(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [menuOpen]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (
        menuOpen &&
        drawerRef.current &&
        navRef.current &&
        !drawerRef.current.contains(e.target as Node) &&
        !navRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [menuOpen]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      {/* ══════════ Main nav ══════════ */}
      <nav
        ref={navRef}
        className="nav-bar fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-center transition-all duration-300 backdrop-blur-xl"
        style={{
          background: "rgba(12, 11, 9, 0.5)",
          borderBottom: scrolled
            ? "1px solid var(--border)"
            : "1px solid transparent",
        }}
      >
        {/* Max-width container — keeps content off the edges */}
        <div className="w-full max-w-7xl mx-auto px-0 flex items-center justify-between">

          {/* ── Logo ── */}
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2.5 no-underline"
          >
            <span
              className="flex items-center justify-center text-xs font-semibold text-white leading-none shrink-0"
              style={{
                width: 26,
                height: 26,
                background: "var(--amber)",
                borderRadius: 7,
              }}
            >
              S
            </span>
            <span
              className="text-[15px] font-medium tracking-tight"
              style={{ color: "var(--text)" }}
            >
              SyncSpace
            </span>
          </Link>

          {/* ── Center nav links ── */}
          <ul className="hidden md:flex items-center gap-8 list-none m-0 p-0">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="text-[13px] font-normal transition-colors duration-200 no-underline"
                  style={{ color: "var(--text-2)" }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.color = "var(--text)")
                  }
                  onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.color =
                    "var(--text-2)")
                  }
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          {/* ── Right cluster ── */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Theme toggle */}
            <button
              onClick={toggle}
              aria-label="Toggle theme"
              className="flex items-center justify-center transition-all duration-200"
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: "1px solid var(--border)",
                background: "var(--surface)",
                color: "var(--text-2)",
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              {theme === "dark" ? "☀" : "☾"}
            </button>

            {/* Sign in */}
            <a
              href="auth/sign-in"
              className="hidden sm:inline-flex items-center transition-all duration-200 no-underline"
              style={{
                padding: "6px 16px",
                borderRadius: 999,
                border: "1px solid var(--border)",
                background: "transparent",
                color: "var(--text-2)",
                fontSize: 12,
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "var(--border-m)";
                el.style.color = "var(--text)";
                el.style.background = "var(--surface-h)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "var(--border)";
                el.style.color = "var(--text-2)";
                el.style.background = "transparent";
              }}
            >
              Sign in
            </a>

            {/* Get started */}
            <a
              href="/auth/sign-up"
              className="hidden sm:inline-flex items-center gap-1 font-medium transition-all duration-200 no-underline"
              style={{
                padding: "6px 16px",
                borderRadius: 999,
                background: "var(--amber)",
                color: "#fff",
                fontSize: 12,
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.opacity = "0.85")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.opacity = "1")
              }
            >
              Get started →
            </a>

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              className="md:hidden flex flex-col justify-center items-center gap-[5px] transition-colors duration-200"
              style={{
                width: 36,
                height: 36,
                borderRadius: 7,
                border: "1px solid var(--border)",
                background: "var(--surface)",
                cursor: "pointer",
              }}
            >
              <span
                className="block rounded transition-transform duration-200"
                style={{
                  width: 16,
                  height: 1.5,
                  background: "var(--text-2)",
                  transform: menuOpen
                    ? "translateY(6.5px) rotate(45deg)"
                    : "none",
                }}
              />
              <span
                className="block rounded transition-all duration-200"
                style={{
                  width: menuOpen ? 0 : 16,
                  height: 1.5,
                  background: "var(--text-2)",
                  opacity: menuOpen ? 0 : 1,
                }}
              />
              <span
                className="block rounded transition-transform duration-200"
                style={{
                  width: 16,
                  height: 1.5,
                  background: "var(--text-2)",
                  transform: menuOpen
                    ? "translateY(-6.5px) rotate(-45deg)"
                    : "none",
                }}
              />
            </button>
          </div>
        </div>
      </nav>

      {/* ══════════ Mobile drawer ══════════ */}
      <div
        ref={drawerRef}
        className="mobile-drawer md:hidden fixed left-0 right-0 z-40 flex flex-col gap-1 px-5 pt-5 pb-6 transition-all duration-200"
        style={{
          top: 64,
          background: "rgba(12, 11, 9, 0.97)",
          backdropFilter: "blur(24px)",
          borderBottom: "1px solid var(--border)",
          transform: menuOpen ? "translateY(0)" : "translateY(-8px)",
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "auto" : "none",
        }}
        role="navigation"
        aria-label="Mobile navigation"
      >
        {NAV_LINKS.map((l) => (
          <a
            key={l.href}
            href={l.href}
            onClick={closeMenu}
            className="block transition-all duration-200 no-underline"
            style={{
              padding: "11px 12px",
              borderRadius: 7,
              fontSize: 15,
              color: "var(--text-2)",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.color = "var(--text)";
              el.style.background = "var(--surface-h)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.color = "var(--text-2)";
              el.style.background = "transparent";
            }}
          >
            {l.label}
          </a>
        ))}

        {/* Divider */}
        <div
          style={{ height: 1, background: "var(--border)", margin: "10px 0" }}
        />

        {/* Action buttons */}
        <div className="flex flex-col gap-2 mt-1">
          <a
            href="/auth/sign-in"
            onClick={closeMenu}
            className="flex items-center justify-center transition-all duration-200 no-underline"
            style={{
              fontSize: 13,
              padding: "10px 16px",
              borderRadius: 999,
              border: "1px solid var(--border)",
              color: "var(--text-2)",
            }}
          >
            Sign in
          </a>

          <a
            href="/auth/sign-up"
            onClick={closeMenu}
            className="flex items-center justify-center font-medium transition-all duration-200 no-underline"
            style={{
              fontSize: 13,
              padding: "10px 16px",
              borderRadius: 999,
              background: "var(--amber)",
              color: "#fff",
            }}
          >
            Get started →
          </a>
        </div>
      </div>
    </>
  );
}