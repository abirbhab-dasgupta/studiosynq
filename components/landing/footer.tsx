"use client";

import Link from "next/link";

const LINKS = [
  { label: "Agents", href: "#agents" },
  { label: "Pricing", href: "#" },
  { label: "Docs", href: "#" },
  { label: "GitHub", href: "https://github.com/abirbhab-dasgupta/studiosynq" },
  { label: "Privacy", href: "#" },
];

export default function Footer() {
  return (
    <footer
      className="flex flex-wrap items-start sm:items-center justify-between gap-5"
      style={{
        padding: "36px 20px",
        borderTop: "1px solid var(--border)",
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-2 no-underline"
        style={{ color: "var(--text)" }}
      >
        <span
          className="flex items-center justify-center text-[10px] font-semibold text-white shrink-0"
          style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            background: "var(--amber)",
          }}
        >
          S
        </span>
        <span
          className="text-sm font-medium tracking-tight"
          style={{ color: "var(--text)" }}
        >
          Studiosynq
        </span>
      </Link>

      {/* Links */}
      <nav className="flex flex-wrap gap-5" aria-label="Footer">
        {LINKS.map((l) => (
          <a
            key={l.label}
            href={l.href}
            className="text-xs no-underline transition-colors duration-200 text-(--text-3) hover:text-(--text-2)"
          >
            {l.label}
          </a>
        ))}
      </nav>

      {/* Copyright */}
      <span
        className="text-[11px]"
        style={{ color: "var(--text-3)" }}
      >
        © 2025 Studiosynq · Built by Abirbhab
      </span>
    </footer>
  );
}
