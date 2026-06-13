import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { rooms, roomMembers } from "@/lib/db/index";
import { and, eq } from "drizzle-orm";
import { RoomClient } from "@/components/room/room-client";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function RoomPage({ params }: Props) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect("/auth/sign-in");

    const { id } = await params;

    // Verify room exists
    const [room] = await db
        .select({ id: rooms.id })
        .from(rooms)
        .where(eq(rooms.id, id))
        .limit(1);

    if (!room) notFound();

    // Verify user is a member
    const [membership] = await db
        .select({ userId: roomMembers.userId })
        .from(roomMembers)
        .where(and(eq(roomMembers.roomId, id), eq(roomMembers.userId, session.user.id)))
        .limit(1);

    if (!membership) notFound();

    return <RoomClient roomId={id} user={session.user} />;
}