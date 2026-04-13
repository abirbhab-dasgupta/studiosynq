"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthLayout } from "@/components/auth/auth-layout";
import {
    LeftTag,
    LeftHeadline,
    LeftSub,
    FeatureList,
    LeftDivider,
    SocialProof,
} from "@/components/auth/auth-left-parts";
import {
    OAuthRow,
    OrDivider,
    Field,
    SubmitButton,
    Terms,
} from "@/components/auth/auth-form-parts";
import { authClient } from "@/lib/auth-client";

const FEATURES = [
    {
        icon: "⚡",
        title: "Five AI agents, always on",
        desc: "CodeBuddy, ResearchBot, DesignExpert & more live in your room",
    },
    {
        icon: "🔒",
        title: "Secure with BetterAuth",
        desc: "OAuth + session-based auth, zero friction to get back in",
    },
    {
        icon: "🏠",
        title: "Your rooms, your rules",
        desc: "Live collaboration, Kanban boards, and focus sessions",
    },
];



function SignInLeft() {
    return (
        <>
            <LeftTag label="Back to your workspace" />

            <LeftHeadline
                lines={[
                    { text: "Welcome back to " },
                    { text: "SyncSpace.", italic: true },
                ]}
            />

            <LeftSub>
                Your team&apos;s rooms, tasks and AI agents are waiting. Pick up right
                where you left off.
            </LeftSub>

            <FeatureList items={FEATURES} />
            <LeftDivider />

            <SocialProof
                label={
                    <>
                        <strong style={{ color: "var(--text, #EDE8DF)", fontWeight: 500 }}>
                            200+ teams
                        </strong>{" "}
                        collaborating in SyncSpace today
                    </>
                }
            />
        </>
    );
}

export default function SignInPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        try {
            const { data, error: authError } = await authClient.signIn.email({
                email,
                password,
            });

            if (authError) {
                setError(authError.message ?? "Invalid email or password.");
                setLoading(false);
                return;
            }

            if (data) {
                router.push("/dashboard");
            }
        } catch (err) {
            setError("An unexpected error occurred. Please try again.");
            setLoading(false);
        }
    };

    return (
        <AuthLayout leftContent={<SignInLeft />} activePage="sign-in">
            <div style={{ width: "100%", maxWidth: 384 }}>

                {/* Eyebrow */}
                <p style={{
                    fontFamily: "var(--font-mono, 'DM Mono', monospace)",
                    fontSize: 10,
                    fontWeight: 500,
                    color: "var(--amber, #D97706)",
                    letterSpacing: "0.09em",
                    textTransform: "uppercase",
                    marginBottom: 10,
                }}>
                    Sign in
                </p>

                {/* Headline */}
                <h1 style={{
                    fontFamily: "var(--font-serif, 'Instrument Serif', Georgia, serif)",
                    fontSize: 30,
                    fontWeight: 400,
                    lineHeight: 1.18,
                    letterSpacing: "-0.015em",
                    color: "var(--text, #EDE8DF)",
                    marginBottom: 7,
                }}>
                    Good to see you again
                </h1>

                {/* Sub */}
                <p style={{ fontSize: 13, color: "var(--text-2, #9E9589)", lineHeight: 1.55, marginBottom: 28 }}>
                    No account yet?{" "}
                    <Link href="/auth/sign-up" style={{ color: "var(--amber, #D97706)", fontWeight: 500, textDecoration: "none" }}>
                        Create one free →
                    </Link>
                </p>

                {/* Error message */}
                {error && (
                    <div style={{
                        padding: "10px 14px",
                        marginBottom: 16,
                        borderRadius: 10,
                        background: "rgba(239, 68, 68, 0.08)",
                        border: "0.5px solid rgba(239, 68, 68, 0.2)",
                        fontSize: 13,
                        color: "#EF4444",
                        fontFamily: "var(--font-sans, 'DM Sans', sans-serif)",
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <OAuthRow />
                    <OrDivider />

                    <Field
                        label="Email address"
                        type="email"
                        name="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        required
                    />

                    <Field
                        label="Password"
                        type="password"
                        name="password"
                        autoComplete="current-password"
                        placeholder="••••••••"
                        required
                        rightLabel={
                            <Link href="/forgot-password" style={{ fontSize: 12, color: "var(--amber, #D97706)", fontWeight: 500, textDecoration: "none" }}>
                                Forgot password?
                            </Link>
                        }
                    />

                    <SubmitButton loading={loading}>Sign in to SyncSpace →</SubmitButton>
                    <Terms action="signing in," />
                </form>

            </div>
        </AuthLayout>
    );
}