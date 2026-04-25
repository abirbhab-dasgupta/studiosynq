import { auth } from "@/lib/auth";
import { db, user } from "@/lib/db";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function GET() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const profile = await db
        .select({
            id: user.id,
            name: user.name,
            email: user.email,
            username: user.username,
            image: user.image,
            bio: user.bio,
            avatarColor: user.avatarColor,
        })
        .from(user)
        .where(eq(user.id, session.user.id))
        .limit(1);

    if (!profile.length) {
        return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json(profile[0]);
}

export async function PATCH(req: Request) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    const allowedFields = ["name", "username", "bio", "image", "avatarColor"];
    const updates: Record<string, string> = {};

    for (const key of allowedFields) {
        if (body[key] !== undefined) {
            updates[key] = body[key];
        }
    }

    if (Object.keys(updates).length === 0) {
        return Response.json({ error: "No valid fields to update" }, { status: 400 });
    }

    await db
        .update(user)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(user.id, session.user.id));

    return Response.json({ success: true });
}