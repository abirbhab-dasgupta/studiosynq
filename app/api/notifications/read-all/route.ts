import { auth } from "@/lib/auth";
import { db, notifications } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";

export async function PATCH() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    await db
        .update(notifications)
        .set({ isRead: true })
        .where(and(
            eq(notifications.userId, session.user.id),
            eq(notifications.isRead, false)
        ));

    return Response.json({ success: true });
}