import "@/app/globals.css";
import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
    title: "Auth — SyncSpace",
    description: "Sign in or create your SyncSpace workspace.",
};

export default function AuthGroupLayout({ children }: { children: ReactNode }) {
    return <>{children}</>;
}