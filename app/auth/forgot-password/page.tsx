"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthLayout } from "@/components/auth/auth-layout";
import { LeftTag, LeftHeadline, LeftSub } from "@/components/auth/auth-left-parts";
import { Field, SubmitButton } from "@/components/auth/auth-form-parts";
import { authClient } from "@/lib/auth-client";

function ForgotLeft() {
    return (
        <>
            <LeftTag label="Account recovery" />
            <LeftHeadline lines={[{ text: "Reset your " }, { text: "password.", italic: true }]} />
            <LeftSub>
                Enter the email address linked to your account and we'll send you a
                reset link. It expires in 1 hour.
            </LeftSub>
        </>
    );
}

export default function ForgotPasswordPage() {
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const email = new FormData(e.currentTarget).get("email") as string;

        try {
            const { error: authError } = await authClient.requestPasswordReset({
                email,
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (authError) {
                setError(authError.message ?? "Something went wrong. Try again.");
                return;
            }

            setSent(true); // show confirmation — don't reveal if email exists
        } catch {
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout leftContent={<ForgotLeft />} activePage="sign-in">
            <div style={{ width: "100%", maxWidth: 384 }}>

                <p style={{
                    fontFamily: "var(--font-mono, 'DM Mono', monospace)",
                    fontSize: 10, fontWeight: 500,
                    color: "var(--amber, #D97706)",
                    letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 10,
                }}>
                    Forgot password
                </p>

                <h1 style={{
                    fontFamily: "var(--font-serif, 'Instrument Serif', Georgia, serif)",
                    fontSize: 30, fontWeight: 400, lineHeight: 1.18,
                    letterSpacing: "-0.015em",
                    color: "var(--text, #EDE8DF)", marginBottom: 7,
                }}>
                    {sent ? "Check your inbox" : "Recover your account"}
                </h1>

                {sent ? (
                    /* ── Success state ── */
                    <>
                        <p style={{ fontSize: 14, color: "var(--text-2, #9E9589)", lineHeight: 1.65, marginBottom: 28 }}>
                            If that email is registered, a reset link is on its way. Check
                            your spam folder if it doesn't arrive within a minute.
                        </p>
                        <Link
                            href="/sign-in"
                            style={{
                                display: "block", width: "100%", padding: "12px 20px",
                                borderRadius: 10, background: "var(--amber, #D97706)",
                                color: "#fff", fontSize: 14, fontWeight: 600,
                                fontFamily: "var(--font-sans, 'DM Sans', sans-serif)",
                                textAlign: "center", textDecoration: "none",
                                letterSpacing: "-0.01em",
                            }}
                        >
                            Back to sign in
                        </Link>
                    </>
                ) : (
                    /* ── Request form ── */
                    <>
                        <p style={{ fontSize: 13, color: "var(--text-2, #9E9589)", lineHeight: 1.55, marginBottom: 28 }}>
                            Remembered it?{" "}
                            <Link href="/auth/sign-in" style={{ color: "var(--amber, #D97706)", fontWeight: 500, textDecoration: "none" }}>
                                Sign in →
                            </Link>
                        </p>

                        {error && (
                            <div style={{
                                padding: "10px 14px", marginBottom: 16, borderRadius: 10,
                                background: "rgba(239,68,68,0.08)",
                                border: "0.5px solid rgba(239,68,68,0.2)",
                                fontSize: 13, color: "#EF4444",
                                fontFamily: "var(--font-sans, 'DM Sans', sans-serif)",
                            }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <Field
                                label="Email address"
                                type="email" name="email"
                                autoComplete="email"
                                placeholder="you@example.com"
                                required
                            />
                            <SubmitButton loading={loading}>Send reset link →</SubmitButton>
                        </form>
                    </>
                )}

            </div>
        </AuthLayout>
    );
}