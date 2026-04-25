import { auth } from "@/lib/auth";
import { db, rooms, roomMembers } from "@/lib/db";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    // Fetch the room details
    const room = await db
        .select()
        .from(rooms)
        .where(eq(rooms.id, id))
        .limit(1);

    if (!room.length) {
        return Response.json({ error: "Room not found" }, { status: 404 });
    }


    const members = await db
        .select({
            userId: roomMembers.userId,
            joinedAt: roomMembers.joinedAt,
        })
        .from(roomMembers)
        .where(eq(roomMembers.roomId, id));

    return Response.json({
        ...room[0],
        members,
    });
}