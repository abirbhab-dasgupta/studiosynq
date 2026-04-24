import { auth } from "@/lib/auth";
import { db, roomMembers } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { id: roomId } = await params;

    // Check if already a member
    const existing = await db
        .select()
        .from(roomMembers)
        .where(
            and(
                eq(roomMembers.roomId, roomId),
                eq(roomMembers.userId, session.user.id)
            )
        );

    if (existing.length > 0) {
        return Response.json({ message: "Already a member" }, { status: 200 });
    }

    await db.insert(roomMembers).values({
        id: crypto.randomUUID(),
        roomId,
        userId: session.user.id,
    });

    return Response.json({ message: "Joined successfully" }, { status: 201 });
}