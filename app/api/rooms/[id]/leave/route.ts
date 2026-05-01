import { auth } from "@/lib/auth";
import { db, rooms, roomMembers } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { id: roomId } = await params;

    // Room owner cannot leave their own room — they must delete it
    const room = await db
        .select()
        .from(rooms)
        .where(eq(rooms.id, roomId))
        .limit(1);

    if (!room.length) {
        return Response.json({ error: "Room not found" }, { status: 404 });
    }

    if (room[0].createdBy === session.user.id) {
        return Response.json({
            error: "You are the owner. Delete the room instead of leaving."
        }, { status: 403 });
    }

    // Remove from room_members
    await db
        .delete(roomMembers)
        .where(and(
            eq(roomMembers.roomId, roomId),
            eq(roomMembers.userId, session.user.id)
        ));

    return Response.json({ success: true });
}