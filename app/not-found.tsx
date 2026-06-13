"use client";

import { useRouter } from "next/navigation";

export default function NotFound() {
    const router = useRouter();

    return (
        <div style={{
            minHeight: "100vh",
            background: "var(--bg)",
            color: "var(--text)",
            fontFamily: "var(--font-sans)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            flexDirection: "column",
            gap: 0,
        }}>
            {/* ── Illustration ── */}
            <svg
                width="320"
                height="200"
                viewBox="0 0 320 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ marginBottom: 8 }}
            >
                {/* Ground line */}
                <line x1="40" y1="170" x2="280" y2="170" stroke="var(--border-m)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 4" />

                {/* Shadow ellipse */}
                <ellipse cx="160" cy="173" rx="52" ry="6" fill="var(--bg3)" />

                {/* Astronaut body */}
                <ellipse cx="160" cy="128" rx="28" ry="34" fill="var(--bg3)" stroke="var(--border-m)" strokeWidth="1.5" />

                {/* Helmet */}
                <circle cx="160" cy="88" r="22" fill="var(--bg2)" stroke="var(--border-m)" strokeWidth="1.5" />
                {/* Visor */}
                <path d="M148 83 Q160 96 172 83" fill="var(--amber-faint)" stroke="var(--amber-border)" strokeWidth="1" />
                <circle cx="160" cy="86" r="13" fill="var(--amber-faint)" opacity="0.5" />

                {/* Helmet reflection */}
                <circle cx="153" cy="80" r="3" fill="white" opacity="0.12" />

                {/* Left arm */}
                <path d="M133 118 Q118 124 116 138" stroke="var(--bg3)" strokeWidth="10" strokeLinecap="round" />
                <path d="M133 118 Q118 124 116 138" stroke="var(--border)" strokeWidth="1.5" strokeLinecap="round" />
                {/* Left hand */}
                <circle cx="116" cy="140" r="5" fill="var(--bg3)" stroke="var(--border)" strokeWidth="1.5" />

                {/* Right arm */}
                <path d="M187 118 Q202 124 204 138" stroke="var(--bg3)" strokeWidth="10" strokeLinecap="round" />
                <path d="M187 118 Q202 124 204 138" stroke="var(--border)" strokeWidth="1.5" strokeLinecap="round" />
                {/* Right hand */}
                <circle cx="204" cy="140" r="5" fill="var(--bg3)" stroke="var(--border)" strokeWidth="1.5" />

                {/* Legs */}
                <path d="M148 158 Q144 168 140 170" stroke="var(--bg3)" strokeWidth="10" strokeLinecap="round" />
                <path d="M148 158 Q144 168 140 170" stroke="var(--border)" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M172 158 Q176 168 180 170" stroke="var(--bg3)" strokeWidth="10" strokeLinecap="round" />
                <path d="M172 158 Q176 168 180 170" stroke="var(--border)" strokeWidth="1.5" strokeLinecap="round" />

                {/* Boots */}
                <ellipse cx="139" cy="171" rx="10" ry="5" fill="var(--bg4)" stroke="var(--border)" strokeWidth="1" />
                <ellipse cx="181" cy="171" rx="10" ry="5" fill="var(--bg4)" stroke="var(--border)" strokeWidth="1" />

                {/* Backpack */}
                <rect x="175" y="112" width="16" height="22" rx="4" fill="var(--bg4)" stroke="var(--border)" strokeWidth="1.5" />

                {/* Chest badge */}
                <rect x="153" y="122" width="14" height="10" rx="2" fill="var(--amber-faint)" stroke="var(--amber-border)" strokeWidth="1" />

                {/* Stars */}
                <circle cx="52" cy="32" r="1.5" fill="var(--text-3)" opacity="0.6" />
                <circle cx="88" cy="18" r="1" fill="var(--text-3)" opacity="0.4" />
                <circle cx="240" cy="24" r="1.5" fill="var(--text-3)" opacity="0.6" />
                <circle cx="272" cy="44" r="1" fill="var(--text-3)" opacity="0.4" />
                <circle cx="68" cy="58" r="1" fill="var(--text-3)" opacity="0.3" />
                <circle cx="256" cy="62" r="1.5" fill="var(--text-3)" opacity="0.5" />
                <circle cx="44" cy="96" r="1" fill="var(--text-3)" opacity="0.3" />
                <circle cx="290" cy="88" r="1" fill="var(--text-3)" opacity="0.4" />
                <circle cx="120" cy="22" r="1" fill="var(--text-3)" opacity="0.35" />
                <circle cx="200" cy="14" r="1.5" fill="var(--text-3)" opacity="0.45" />

                {/* Floating small planet */}
                <circle cx="72" cy="76" r="10" fill="var(--bg3)" stroke="var(--border)" strokeWidth="1" />
                <ellipse cx="72" cy="76" rx="16" ry="4" fill="none" stroke="var(--border-m)" strokeWidth="1" />

                {/* Question mark floating */}
                <text
                    x="234"
                    y="72"
                    fontFamily="var(--font-mono)"
                    fontSize="28"
                    fontWeight="600"
                    fill="var(--amber)"
                    opacity="0.25"
                >?</text>
            </svg>

            {/* ── Text ── */}
            <p style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11, fontWeight: 600,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "var(--amber)",
                marginBottom: 12,
            }}>
                404
            </p>

            <h1 style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(26px, 4vw, 36px)",
                fontWeight: 400,
                color: "var(--text)",
                letterSpacing: "-0.02em",
                lineHeight: 1.15,
                marginBottom: 12,
                textAlign: "center",
            }}>
                Lost in space
            </h1>

            <p style={{
                fontSize: 14,
                color: "var(--text-2)",
                lineHeight: 1.7,
                fontWeight: 300,
                marginBottom: 32,
                textAlign: "center",
                maxWidth: 320,
            }}>
                This page doesn&apos;t exist or has drifted out of orbit.
            </p>

            {/* ── Back button ── */}
            <button
                onClick={() => router.back()}
                style={{
                    height: 38, padding: "0 22px",
                    background: "var(--amber-faint)",
                    border: "1px solid var(--amber-border)",
                    borderRadius: 9,
                    fontSize: 13, fontWeight: 500,
                    color: "var(--amber)",
                    cursor: "pointer",
                    fontFamily: "var(--font-sans)",
                    display: "flex", alignItems: "center", gap: 7,
                    transition: "all 0.15s",
                }}
                onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = "var(--amber)";
                    (e.currentTarget as HTMLButtonElement).style.color = "#fff";
                }}
                onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = "var(--amber-faint)";
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--amber)";
                }}
            >
                <svg width={13} height={13} viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Go back
            </button>

            {/* ── Footer ── */}
            <p style={{
                marginTop: 48,
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "var(--text-3)",
                letterSpacing: "0.05em",
            }}>
                studiosynq.vercel.app
            </p>
        </div>
    );
}