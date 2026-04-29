import { auth } from "@/lib/auth";
import { db, rooms, roomInvites } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { id: roomId } = await params;
    const body = await req.json().catch(() => ({}));
    const mode = body.mode ?? "request";

    // Verify the requester is the room owner
    const room = await db
        .select()
        .from(rooms)
        .where(and(eq(rooms.id, roomId), eq(rooms.createdBy, session.user.id)))
        .limit(1);

    if (!room.length) {
        return Response.json({ error: "Room not found or not authorized" }, { status: 403 });
    }

    // Check if an active invite already exists for this room
    const existing = await db
        .select()
        .from(roomInvites)
        .where(and(eq(roomInvites.roomId, roomId), eq(roomInvites.isActive, true)))
        .limit(1);

    if (existing.length) {
        return Response.json({ token: existing[0].token, mode: existing[0].mode });
    }

    // Generate a unique token — 32 random characters
    const token = crypto.randomUUID().replace(/-/g, "").slice(0, 24);

    await db.insert(roomInvites).values({
        roomId,
        token,
        createdBy: session.user.id,
        mode,
    });

    return Response.json({ token, mode });
}

// Deactivate invite link
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { id: roomId } = await params;

    await db
        .update(roomInvites)
        .set({ isActive: false })
        .where(and(
            eq(roomInvites.roomId, roomId),
            eq(roomInvites.createdBy, session.user.id)
        ));

    return Response.json({ success: true });
}