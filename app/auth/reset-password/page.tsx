"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthLayout } from "@/components/auth/auth-layout";
import { LeftTag, LeftHeadline, LeftSub } from "@/components/auth/auth-left-parts";
import { Field, SubmitButton } from "@/components/auth/auth-form-parts";
import { authClient } from "@/lib/auth-client";

function ResetLeft() {
    return (
        <>
            <LeftTag label="Account recovery" />
            <LeftHeadline lines={[{ text: "Set a new " }, { text: "password.", italic: true }]} />
            <LeftSub>
                Choose something strong — at least 8 characters. You'll be signed in
                automatically after resetting.
            </LeftSub>
        </>
    );
}

function ResetForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Invalid / expired token guard
    useEffect(() => {
        const tokenError = searchParams.get("error");
        if (tokenError === "INVALID_TOKEN") {
            setError("This reset link is invalid or has expired. Please request a new one.");
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!token) {
            setError("Missing reset token. Please request a new reset link.");
            return;
        }

        const formData = new FormData(e.currentTarget);
        const newPassword = formData.get("newPassword") as string;
        const confirm = formData.get("confirmPassword") as string;

        if (newPassword !== confirm) {
            setError("Passwords don't match.");
            return;
        }

        setError(null);
        setLoading(true);

        try {
            const { error: authError } = await authClient.resetPassword({
                newPassword,
                token,
            });

            if (authError) {
                setError(authError.message ?? "Failed to reset password. The link may have expired.");
                return;
            }

            setDone(true);
            setTimeout(() => router.push("/auth/sign-in"), 2500);
        } catch {
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ width: "100%", maxWidth: 384 }}>

            <p style={{
                fontFamily: "var(--font-mono, 'DM Mono', monospace)",
                fontSize: 10, fontWeight: 500,
                color: "var(--amber, #D97706)",
                letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 10,
            }}>
                Reset password
            </p>

            <h1 style={{
                fontFamily: "var(--font-serif, 'Instrument Serif', Georgia, serif)",
                fontSize: 30, fontWeight: 400, lineHeight: 1.18,
                letterSpacing: "-0.015em",
                color: "var(--text, #EDE8DF)", marginBottom: 7,
            }}>
                {done ? "Password updated" : "Choose a new password"}
            </h1>

            {done ? (
                <p style={{ fontSize: 14, color: "var(--text-2, #9E9589)", lineHeight: 1.65 }}>
                    You're all set. Redirecting you to sign in…
                </p>
            ) : (
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
                            {error}{" "}
                            {error.includes("expired") && (
                                <Link href="/auth/forgot-password" style={{ color: "#EF4444", fontWeight: 500 }}>
                                    Request a new link →
                                </Link>
                            )}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <Field
                            label="New password"
                            type="password" name="newPassword"
                            autoComplete="new-password"
                            placeholder="Min. 8 characters"
                            minLength={8} required
                        />
                        <Field
                            label="Confirm password"
                            type="password" name="confirmPassword"
                            autoComplete="new-password"
                            placeholder="Repeat your password"
                            minLength={8} required
                        />
                        <SubmitButton loading={loading}>Update password →</SubmitButton>
                    </form>
                </>
            )}

        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <AuthLayout leftContent={<ResetLeft />} activePage="sign-in">
            {/* Suspense required because useSearchParams() needs it in Next.js App Router */}
            <Suspense fallback={<div style={{ color: "var(--text-2, #9E9589)", fontSize: 14 }}>Loading…</div>}>
                <ResetForm />
            </Suspense>
        </AuthLayout>
    );
}