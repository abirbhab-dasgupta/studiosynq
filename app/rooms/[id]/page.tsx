import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { RoomClient } from "@/components/room/room-client";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function RoomPage({ params }: Props) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect("/auth/sign-in");

    const { id } = await params;

    return <RoomClient roomId={id} user={session.user} />;
}