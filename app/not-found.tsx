import Link from "next/link";

export default function NotFound() {
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
        }}>
            <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                gap: "0",
                maxWidth: 420,
            }}>
                {/* Logo mark */}
                <div style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: "var(--amber-faint)",
                    border: "1px solid var(--amber-border)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginBottom: 28,
                }}>
                    <svg width={22} height={22} viewBox="0 0 24 24" fill="none"
                        stroke="var(--amber)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                    </svg>
                </div>

                {/* 404 */}
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

                {/* Heading */}
                <h1 style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "clamp(28px, 5vw, 38px)",
                    fontWeight: 400,
                    color: "var(--text)",
                    letterSpacing: "-0.02em",
                    lineHeight: 1.15,
                    marginBottom: 14,
                }}>
                    Page not found
                </h1>

                {/* Subtext */}
                <p style={{
                    fontSize: 14,
                    color: "var(--text-2)",
                    lineHeight: 1.7,
                    fontWeight: 300,
                    marginBottom: 32,
                }}>
                    The page you&apos;re looking for doesn&apos;t exist or has been moved.
                    Head back to your workspace.
                </p>

                {/* Actions */}
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
                    <Link href="/dashboard" style={{
                        height: 38, padding: "0 20px",
                        background: "var(--amber)",
                        border: "none", borderRadius: 9,
                        fontSize: 13, fontWeight: 600,
                        color: "#fff", cursor: "pointer",
                        fontFamily: "var(--font-sans)",
                        display: "flex", alignItems: "center", gap: 7,
                        textDecoration: "none",
                        transition: "opacity 0.15s",
                    }}>
                        <svg width={13} height={13} viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                        Go to Dashboard
                    </Link>

                    <Link href="/rooms" style={{
                        height: 38, padding: "0 20px",
                        background: "transparent",
                        border: "1px solid var(--border-m)",
                        borderRadius: 9,
                        fontSize: 13, fontWeight: 500,
                        color: "var(--text-2)", cursor: "pointer",
                        fontFamily: "var(--font-sans)",
                        display: "flex", alignItems: "center",
                        textDecoration: "none",
                        transition: "all 0.15s",
                    }}>
                        Rooms
                    </Link>
                </div>

                {/* Bottom mono tag */}
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
        </div>
    );
}