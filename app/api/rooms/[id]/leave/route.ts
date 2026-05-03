import { auth } from "@/lib/auth";
import { db, rooms, roomMembers, roomJoinRequests, notifications } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { id: roomId } = await params;

    // Room owner cannot leave — must delete the room
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

    // Remove from room members
    await db
        .delete(roomMembers)
        .where(and(
            eq(roomMembers.roomId, roomId),
            eq(roomMembers.userId, session.user.id)
        ));

    // Clean up join request so they can re-request after leaving
    await db
        .delete(roomJoinRequests)
        .where(and(
            eq(roomJoinRequests.roomId, roomId),
            eq(roomJoinRequests.userId, session.user.id)
        ));

    // Nullify roomId on approved notifications so Go to room stops working
    await db
        .update(notifications)
        .set({ roomId: null })
        .where(and(
            eq(notifications.userId, session.user.id),
            eq(notifications.type, "approved"),
            eq(notifications.roomId, roomId)
        ));

    return Response.json({ success: true });
}