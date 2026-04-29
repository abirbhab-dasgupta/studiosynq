import { auth } from "@/lib/auth";
import { db, rooms, roomJoinRequests, user } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { id: roomId } = await params;

    // Only room owner can see requests
    const room = await db
        .select()
        .from(rooms)
        .where(and(eq(rooms.id, roomId), eq(rooms.createdBy, session.user.id)))
        .limit(1);

    if (!room.length) {
        return Response.json({ error: "Not authorized" }, { status: 403 });
    }

    // Get pending requests with user details
    const requests = await db
        .select({
            id: roomJoinRequests.id,
            userId: roomJoinRequests.userId,
            status: roomJoinRequests.status,
            createdAt: roomJoinRequests.createdAt,
            name: user.name,
            email: user.email,
            image: user.image,
            avatarColor: user.avatarColor,
        })
        .from(roomJoinRequests)
        .innerJoin(user, eq(roomJoinRequests.userId, user.id))
        .where(and(
            eq(roomJoinRequests.roomId, roomId),
            eq(roomJoinRequests.status, "pending")
        ));

    return Response.json(requests);
}