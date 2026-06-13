import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { rooms, roomMembers } from "@/lib/db/index";
import { and, eq } from "drizzle-orm";
import { TaskBoard } from "@/components/tasks/task-board";

type Props = {
    params: Promise<{ roomId: string }>;
};

export default async function TaskBoardPage({ params }: Props) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect("/auth/sign-in");

    const { roomId } = await params;

    // Verify room exists
    const [room] = await db
        .select({ id: rooms.id })
        .from(rooms)
        .where(eq(rooms.id, roomId))
        .limit(1);

    if (!room) notFound();

    // Verify user is a member
    const [membership] = await db
        .select({ userId: roomMembers.userId })
        .from(roomMembers)
        .where(and(eq(roomMembers.roomId, roomId), eq(roomMembers.userId, session.user.id)))
        .limit(1);

    if (!membership) notFound();

    return <TaskBoard roomId={roomId} user={session.user} />;
}