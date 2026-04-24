import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export default async function DashboardPage() {
    // This runs on the server — no loading state needed
    // If no session, redirect to sign-in immediately
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect("/auth/sign-in");

    return <DashboardClient user={session.user} />;
}