import { auth } from "@/lib/auth";
import { db, notifications } from "@/lib/db";
import { eq, and, gte } from "drizzle-orm";
import { headers } from "next/headers";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export async function GET() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const cutoff = new Date(Date.now() - THIRTY_DAYS_MS);

    const data = await db
        .select()
        .from(notifications)
        .where(and(
            eq(notifications.userId, session.user.id),
            gte(notifications.createdAt, cutoff)
        ))
        .orderBy(notifications.createdAt);

    return Response.json(data.reverse()); // newest first
}