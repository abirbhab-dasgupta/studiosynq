"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bot, Lightbulb, Search, Palette, FileText } from "lucide-react";
import { AuthLayout } from "@/components/auth/auth-layout";
import {
    LeftTag,
    LeftHeadline,
    LeftSub,
    AgentList,
    SocialProof,
} from "@/components/auth/auth-left-parts";
import type { Agent } from "@/components/auth/auth-left-parts";
import {
    OAuthRow,
    OrDivider,
    Field,
    SubmitButton,
    Terms,
} from "@/components/auth/auth-form-parts";
import { authClient } from "@/lib/auth-client";

const AGENTS: Agent[] = [
    { icon: Bot, name: "CodeBuddy", role: "code · debug · review" },
    { icon: Lightbulb, name: "ClarityAgent", role: "explain · simplify" },
    { icon: Search, name: "ResearchBot", role: "live web search" },
    { icon: Palette, name: "DesignExpert", role: "ui · feedback · specs" },
    { icon: FileText, name: "DocWriter", role: "readme · jsdoc · guides" },
];

function SignInLeft() {
    return (
        <>
            <LeftTag label="Back to your workspace" />
            <LeftHeadline
                lines={[
                    { text: "Welcome back to " },
                    { text: "Studiosynq.", italic: true },
                ]}
            />
            <LeftSub>
                Your rooms, tasks, and AI agents are exactly where you left them.
            </LeftSub>
            <AgentList agents={AGENTS} />
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
            const { data, error: authError } = await authClient.signIn.email({ email, password });
            if (authError) {
                setError(authError.message ?? "Invalid email or password.");
                return;
            }
            if (data) {
                router.refresh();
                router.push("/dashboard");
            }
        } catch {
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout leftContent={<SignInLeft />} activePage="sign-in">
            <div style={{ width: "100%", maxWidth: 384 }}>

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

                <p style={{ fontSize: 13, color: "var(--text-2, #9E9589)", lineHeight: 1.55, marginBottom: 28 }}>
                    No account yet?{" "}
                    <Link href="/auth/sign-up" style={{ color: "var(--amber, #D97706)", fontWeight: 500, textDecoration: "none" }}>
                        Create one free →
                    </Link>
                </p>

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
                    />

                    <SubmitButton loading={loading}>Sign in to Studiosynq →</SubmitButton>
                    <Terms action="signing in," />
                </form>

            </div>
        </AuthLayout>
    );
}