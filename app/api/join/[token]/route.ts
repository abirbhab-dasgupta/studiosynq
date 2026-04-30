import { auth } from "@/lib/auth";
import { db, roomInvites, rooms, roomJoinRequests, roomMembers } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";



// GET — fetch room info from token (public, no auth required)
export async function GET(
    req: Request,
    { params }: { params: Promise<{ token: string }> }
) {
    const { token } = await params;

    const invite = await db
        .select({
            id: roomInvites.id,
            roomId: roomInvites.roomId,
            mode: roomInvites.mode,
            isActive: roomInvites.isActive,
            expiresAt: roomInvites.expiresAt,
            roomName: rooms.name,
        })
        .from(roomInvites)
        .innerJoin(rooms, eq(roomInvites.roomId, rooms.id))
        .where(eq(roomInvites.token, token))
        .limit(1);
    console.log("Invite found:", invite);
    if (!invite.length || !invite[0].isActive) {
        return Response.json({ error: "Invalid or expired invite link" }, { status: 404 });
    }

    if (invite[0].expiresAt && new Date(invite[0].expiresAt) < new Date()) {
        return Response.json({ error: "Invite link has expired" }, { status: 410 });
    }

    return Response.json({
        roomId: invite[0].roomId,
        roomName: invite[0].roomName,
        mode: invite[0].mode,
    });
}

// POST — submit join request or auto join
export async function POST(
    req: Request,
    { params }: { params: Promise<{ token: string }> }
) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { token } = await params;

    const invite = await db
        .select()
        .from(roomInvites)
        .where(and(eq(roomInvites.token, token), eq(roomInvites.isActive, true)))
        .limit(1);

    if (!invite.length) {
        return Response.json({ error: "Invalid invite" }, { status: 404 });
    }

    const roomId = invite[0].roomId;

    // Check if already a member
    const existing = await db
        .select()
        .from(roomMembers)
        .where(and(
            eq(roomMembers.roomId, roomId),
            eq(roomMembers.userId, session.user.id)
        ))
        .limit(1);

    if (existing.length) {
        return Response.json({ status: "already_member", roomId });
    }

    // Auto join mode — add directly to room
    if (invite[0].mode === "auto") {
        await db.insert(roomMembers).values({
            id: crypto.randomUUID(),
            roomId,
            userId: session.user.id,
        });
        return Response.json({ status: "joined", roomId });
    }

    // Request mode — check if already requested
    const existingRequest = await db
        .select()
        .from(roomJoinRequests)
        .where(and(
            eq(roomJoinRequests.roomId, roomId),
            eq(roomJoinRequests.userId, session.user.id)
        ))
        .limit(1);

    if (existingRequest.length) {
        return Response.json({
            status: existingRequest[0].status,
            roomId,
        });
    }

    // Create join request
    await db.insert(roomJoinRequests).values({
        id: crypto.randomUUID(),
        roomId,
        userId: session.user.id,
    });

    return Response.json({ status: "pending", roomId });
}



