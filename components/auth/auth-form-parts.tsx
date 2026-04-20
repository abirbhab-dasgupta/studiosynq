"use client";

import { InputHTMLAttributes, ReactNode, forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

/* ─── Google SVG ─── */
function GoogleIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
    );
}

/* ─── GitHub SVG ─── */
function GitHubIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
        </svg>
    );
}

const oauthBtnBase: React.CSSProperties = {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "10px 14px",
    borderRadius: 10,
    border: "0.5px solid var(--border-m, rgba(255,255,255,0.11))",
    background: "var(--bg2, #131210)",
    fontSize: 13,
    fontWeight: 500,
    color: "var(--text, #EDE8DF)",
    cursor: "pointer",
    fontFamily: "var(--font-sans, 'DM Sans', sans-serif)",
    transition: "background 0.15s, border-color 0.15s",
};

/* ─── OAuth row ─── */
export function OAuthRow() {
    const enter = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.currentTarget.style.background = "var(--bg3, #1A1814)";
        e.currentTarget.style.borderColor = "var(--amber-border, rgba(217,119,6,0.18))";
    };
    const leave = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.currentTarget.style.background = "var(--bg2, #131210)";
        e.currentTarget.style.borderColor = "var(--border-m, rgba(255,255,255,0.11))";
    };
    return (
        <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
            <button type="button" style={oauthBtnBase} onMouseEnter={enter} onMouseLeave={leave}>
                <GoogleIcon /> Google
            </button>
            <button type="button" style={oauthBtnBase} onMouseEnter={enter} onMouseLeave={leave}>
                <GitHubIcon /> GitHub
            </button>
        </div>
    );
}

/* ─── OR divider ─── */
export function OrDivider() {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <div style={{ flex: 1, height: "0.5px", background: "var(--border, rgba(255,255,255,0.07))" }} />
            <span style={{
                fontSize: 11,
                color: "var(--text-3, #524E46)",
                fontFamily: "var(--font-mono, 'DM Mono', monospace)",
                letterSpacing: "0.04em",
            }}>
                or
            </span>
            <div style={{ flex: 1, height: "0.5px", background: "var(--border, rgba(255,255,255,0.07))" }} />
        </div>
    );
}

/* ─── Field ─── */
interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    rightLabel?: ReactNode;
}

export const Field = forwardRef<HTMLInputElement, FieldProps>(
    ({ label, rightLabel, type, onFocus, onBlur, style, ...rest }, ref) => {
        // Password visibility state — only active when type="password"
        const isPassword = type === "password";
        const [visible, setVisible] = useState(false);
        const inputType = isPassword ? (visible ? "text" : "password") : type;

        const ToggleIcon = visible ? EyeOff : Eye;

        return (
            <div style={{ marginBottom: 14 }}>
                {/* Label row */}
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 6,
                }}>
                    <label style={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: "var(--text-2, #9E9589)",
                        letterSpacing: "0.01em",
                        fontFamily: "var(--font-sans, 'DM Sans', sans-serif)",
                    }}>
                        {label}
                    </label>
                    {rightLabel}
                </div>

                {/* Input wrapper */}
                <div style={{ position: "relative" }}>
                    <input
                        ref={ref}
                        type={inputType}
                        {...rest}
                        style={{
                            width: "100%",
                            padding: isPassword ? "10px 40px 10px 13px" : "10px 13px",
                            borderRadius: 10,
                            border: "0.5px solid var(--border-m, rgba(255,255,255,0.11))",
                            background: "var(--bg2, #131210)",
                            color: "var(--text, #EDE8DF)",
                            fontSize: 14,
                            fontFamily: "var(--font-sans, 'DM Sans', sans-serif)",
                            outline: "none",
                            transition: "border-color 0.15s, box-shadow 0.15s",
                            WebkitAppearance: "none",
                            boxSizing: "border-box",
                            ...style,
                        }}
                        onFocus={(e) => {
                            e.currentTarget.style.borderColor = "var(--amber, #D97706)";
                            e.currentTarget.style.boxShadow = "0 0 0 3px var(--amber-faint, rgba(217,119,6,0.07))";
                            onFocus?.(e);
                        }}
                        onBlur={(e) => {
                            e.currentTarget.style.borderColor = "var(--border-m, rgba(255,255,255,0.11))";
                            e.currentTarget.style.boxShadow = "none";
                            onBlur?.(e);
                        }}
                    />

                    {/* Eye toggle — only rendered for password fields */}
                    {isPassword && (
                        <button
                            type="button"
                            aria-label={visible ? "Hide password" : "Show password"}
                            onClick={() => setVisible((v) => !v)}
                            style={{
                                position: "absolute",
                                right: 12,
                                top: "50%",
                                transform: "translateY(-50%)",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                padding: 2,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "var(--text-3, #524E46)",
                                transition: "color 0.15s",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.color = "var(--text-2, #9E9589)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color = "var(--text-3, #524E46)";
                            }}
                        >
                            <ToggleIcon size={15} strokeWidth={1.75} />
                        </button>
                    )}
                </div>
            </div>
        );
    }
);
Field.displayName = "Field";

/* ─── Submit button ─── */
export function SubmitButton({
    children,
    loading = false,
}: {
    children: ReactNode;
    loading?: boolean;
}) {
    return (
        <>
            <style>{`@keyframes ss-spin { to { transform: rotate(360deg); } }`}</style>
            <button
                type="submit"
                disabled={loading}
                style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: "12px 20px",
                    borderRadius: 10,
                    background: "var(--amber, #D97706)",
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 600,
                    fontFamily: "var(--font-sans, 'DM Sans', sans-serif)",
                    letterSpacing: "-0.01em",
                    border: "none",
                    cursor: loading ? "not-allowed" : "pointer",
                    marginTop: 6,
                    opacity: loading ? 0.7 : 1,
                    transition: "background 0.15s, transform 0.1s",
                }}
                onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "var(--amber-lt, #F59E0B)"; }}
                onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "var(--amber, #D97706)"; }}
                onMouseDown={(e) => { e.currentTarget.style.transform = "translateY(1px)"; }}
                onMouseUp={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
            >
                {loading ? (
                    <>
                        <span style={{
                            width: 14, height: 14,
                            border: "2px solid rgba(255,255,255,0.3)",
                            borderTopColor: "#fff",
                            borderRadius: "50%",
                            animation: "ss-spin 0.65s linear infinite",
                            display: "inline-block",
                        }} />
                        Processing…
                    </>
                ) : children}
            </button>
        </>
    );
}

/* ─── Terms ─── */
export function Terms({ action }: { action: string }) {
    const ls: React.CSSProperties = {
        color: "var(--text-2, #9E9589)",
        textDecoration: "none",
        transition: "color 0.15s",
    };
    const enter = (e: React.MouseEvent<HTMLAnchorElement>) =>
        (e.currentTarget.style.color = "var(--amber, #D97706)");
    const leave = (e: React.MouseEvent<HTMLAnchorElement>) =>
        (e.currentTarget.style.color = "var(--text-2, #9E9589)");
    return (
        <p style={{
            fontSize: 11,
            color: "var(--text-3, #524E46)",
            textAlign: "center",
            marginTop: 14,
            lineHeight: 1.55,
        }}>
            By {action} you agree to our{" "}
            <a href="#" style={ls} onMouseEnter={enter} onMouseLeave={leave}>Terms of Service</a>{" "}
            and{" "}
            <a href="#" style={ls} onMouseEnter={enter} onMouseLeave={leave}>Privacy Policy</a>.
        </p>
    );
}