import "@/app/globals.css";
import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
    title: "Auth — Studiosynq",
    description: "Sign in or create your Studiosynq workspace.",
};

export default function AuthGroupLayout({ children }: { children: ReactNode }) {
    return <>{children}</>;
}