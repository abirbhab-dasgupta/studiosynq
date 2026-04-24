import { auth } from "@/lib/auth";
import { db, rooms, roomMembers, tasks, focusSessions, agentLogs } from "@/lib/db";
import { eq, and, gte, count, sum } from "drizzle-orm";
import { headers } from "next/headers";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ userId: string }> }
) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { userId } = await params;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Active rooms
    const activeRooms = await db
        .select({ count: count() })
        .from(roomMembers)
        .where(eq(roomMembers.userId, userId));

    // Open tasks
    const openTasks = await db
        .select({ count: count() })
        .from(tasks)
        .where(eq(tasks.userId, userId));

    // Focus minutes today
    const focusResult = await db
        .select({ total: sum(focusSessions.durationMinutes) })
        .from(focusSessions)
        .where(
            and(
                eq(focusSessions.userId, userId),
                gte(focusSessions.startedAt, today)
            )
        );

    // Agent runs today
    const agentResult = await db
        .select({ count: count() })
        .from(agentLogs)
        .where(
            and(
                eq(agentLogs.userId, userId),
                gte(agentLogs.createdAt, today)
            )
        );

    return Response.json({
        activeRooms: activeRooms[0].count,
        openTasks: openTasks[0].count,
        focusMinutes: focusResult[0].total ?? 0,
        agentRuns: agentResult[0].count,
    });
}