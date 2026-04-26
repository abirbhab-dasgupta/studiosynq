import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export default async function DashboardPage() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect("/auth/sign-in");

    return <DashboardClient user={session.user} />;
}