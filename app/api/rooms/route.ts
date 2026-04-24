import { auth } from "@/lib/auth";
import { db, rooms, roomMembers } from "@/lib/db";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function GET() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const userRooms = await db
        .select({
            id: rooms.id,
            name: rooms.name,
            createdBy: rooms.createdBy,
            isActive: rooms.isActive,
            createdAt: rooms.createdAt,
        })
        .from(rooms)
        .innerJoin(roomMembers, eq(rooms.id, roomMembers.roomId))
        .where(eq(roomMembers.userId, session.user.id));

    return Response.json(userRooms);
}

export async function POST(req: Request) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { name } = await req.json();
    if (!name) return Response.json({ error: "Room name required" }, { status: 400 });

    const roomId = crypto.randomUUID();

    await db.insert(rooms).values({
        id: roomId,
        name,
        createdBy: session.user.id,
    });

    await db.insert(roomMembers).values({
        id: crypto.randomUUID(),
        roomId,
        userId: session.user.id,
    });

    return Response.json({ id: roomId, name }, { status: 201 });
}