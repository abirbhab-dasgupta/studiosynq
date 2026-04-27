import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { RoomsPageClient } from "@/components/room/rooms-page-client";

export default async function RoomsPage() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect("/auth/sign-in");

    return <RoomsPageClient user={session.user} />;
}