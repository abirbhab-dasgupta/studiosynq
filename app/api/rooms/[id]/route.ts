import { auth } from "@/lib/auth";
import { db, rooms, roomMembers, user } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const room = await db
        .select()
        .from(rooms)
        .where(eq(rooms.id, id))
        .limit(1);

    if (!room.length) {
        return Response.json({ error: "Room not found" }, { status: 404 });
    }

    // Check membership — owner always has access
    const isMember = await db
        .select()
        .from(roomMembers)
        .where(and(
            eq(roomMembers.roomId, id),
            eq(roomMembers.userId, session.user.id)
        ))
        .limit(1);

    const isOwner = room[0].createdBy === session.user.id;

    if (!isOwner && !isMember.length) {
        return Response.json({ error: "You do not have access to this room" }, { status: 403 });
    }

    const members = await db
        .select({
            userId: roomMembers.userId,
            joinedAt: roomMembers.joinedAt,
            name: user.name,
            image: user.image,
            avatarColor: user.avatarColor,
        })
        .from(roomMembers)
        .innerJoin(user, eq(roomMembers.userId, user.id))
        .where(eq(roomMembers.roomId, id));

    return Response.json({
        ...room[0],
        members,
    });
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { name } = await req.json();

    if (!name) return Response.json({ error: "Name required" }, { status: 400 });

    const room = await db
        .select()
        .from(rooms)
        .where(and(eq(rooms.id, id), eq(rooms.createdBy, session.user.id)))
        .limit(1);

    if (!room.length) {
        return Response.json({ error: "Not authorized" }, { status: 403 });
    }

    await db.update(rooms).set({ name, updatedAt: new Date() }).where(eq(rooms.id, id));

    return Response.json({ success: true });
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const room = await db
        .select()
        .from(rooms)
        .where(and(eq(rooms.id, id), eq(rooms.createdBy, session.user.id)))
        .limit(1);

    if (!room.length) {
        return Response.json({ error: "Not authorized" }, { status: 403 });
    }

    await db.delete(rooms).where(eq(rooms.id, id));

    return Response.json({ success: true });
}