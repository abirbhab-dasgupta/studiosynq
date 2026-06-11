"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bot, Lightbulb, Search, Palette, MailIcon } from "lucide-react";
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
    { icon: MailIcon, name: "EmailWriter", role: "draft · improve · reply" },
];

function SignUpLeft() {
    return (
        <>
            <LeftTag label="Now in Open Beta" />
            <LeftHeadline
                lines={[
                    { text: "One room where AI handles " },
                    { text: "the tedious parts.", italic: true },
                ]}
            />
            <LeftSub>
                Five specialized agents live inside every room — always available,
                never in the way.
            </LeftSub>
            <AgentList agents={AGENTS} />
        </>
    );
}

export default function SignUpPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const firstName = formData.get("firstName") as string;
        const lastName = formData.get("lastName") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        try {
            const { data, error: authError } = await authClient.signUp.email({
                name: `${firstName} ${lastName}`.trim(),
                email,
                password,
            });
            if (authError) {
                setError(authError.message ?? "Something went wrong. Please try again.");
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
        <AuthLayout leftContent={<SignUpLeft />} activePage="sign-up">
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
                    Create account
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
                    Start building together
                </h1>

                <p style={{ fontSize: 13, color: "var(--text-2, #9E9589)", lineHeight: 1.55, marginBottom: 28 }}>
                    Already have an account?{" "}
                    <Link href="/auth/sign-in" style={{ color: "var(--amber, #D97706)", fontWeight: 500, textDecoration: "none" }}>
                        Sign in →
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

                    <div style={{ display: "flex", gap: 10 }}>
                        <div style={{ flex: 1 }}>
                            <Field label="First name" type="text" name="firstName" autoComplete="given-name" placeholder="First name" required />
                        </div>
                        <div style={{ flex: 1 }}>
                            <Field label="Last name" type="text" name="lastName" autoComplete="family-name" placeholder="Last name" required />
                        </div>
                    </div>

                    <Field label="Work email" type="email" name="email" autoComplete="email" placeholder="you@example.com" required />
                    <Field label="Password" type="password" name="password" autoComplete="new-password" placeholder="Min. 8 characters" minLength={8} required />

                    <SubmitButton loading={loading}>Create your workspace →</SubmitButton>
                    <Terms action="creating an account," />
                </form>

            </div>
        </AuthLayout>
    );
}