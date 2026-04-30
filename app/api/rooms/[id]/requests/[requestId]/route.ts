import { auth } from "@/lib/auth";
import { db, rooms, roomJoinRequests, roomMembers } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string; requestId: string }> }
) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { id: roomId, requestId } = await params;
    const { action } = await req.json();

    if (!["approve", "reject"].includes(action)) {
        return Response.json({ error: "Invalid action" }, { status: 400 });
    }

    // Verify room owner
    const room = await db
        .select()
        .from(rooms)
        .where(and(eq(rooms.id, roomId), eq(rooms.createdBy, session.user.id)))
        .limit(1);

    if (!room.length) {
        return Response.json({ error: "Not authorized" }, { status: 403 });
    }

    // Get the request
    const request = await db
        .select()
        .from(roomJoinRequests)
        .where(eq(roomJoinRequests.id, requestId))
        .limit(1);

    if (!request.length) {
        return Response.json({ error: "Request not found" }, { status: 404 });
    }

    if (action === "approve") {
        // Check if already a member to prevent duplicates
        const alreadyMember = await db
            .select()
            .from(roomMembers)
            .where(and(
                eq(roomMembers.roomId, roomId),
                eq(roomMembers.userId, request[0].userId)
            ))
            .limit(1);

        if (!alreadyMember.length) {
            await db.insert(roomMembers).values({
                id: crypto.randomUUID(),
                roomId,
                userId: request[0].userId,
            });
        }

        await db
            .update(roomJoinRequests)
            .set({ status: "approved", updatedAt: new Date() })
            .where(eq(roomJoinRequests.id, requestId));

        return Response.json({ success: true, action: "approved" });
    }

    await db
        .update(roomJoinRequests)
        .set({ status: "rejected", updatedAt: new Date() })
        .where(eq(roomJoinRequests.id, requestId));

    return Response.json({ success: true, action: "rejected" });
}