import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { rooms, roomMembers, tasks, focusSessions, agentLogs } from "@/lib/db";
import { eq, and, gte, count, sum } from "drizzle-orm";
import { headers } from "next/headers";



export async function GET(
    req: Request,
    { params }: { params: Promise<{ userId: string }> }
) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    // Always use the verified session ID — never trust the URL param
    const uid = session.user.id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeRooms = await db
        .select({ count: count() })
        .from(roomMembers)
        .where(eq(roomMembers.userId, uid));

    const openTasks = await db
        .select({ count: count() })
        .from(tasks)
       .where(eq(tasks.creatorId, uid));

    const focusResult = await db
        .select({ total: sum(focusSessions.durationMinutes) })
        .from(focusSessions)
        .where(and(eq(focusSessions.userId, uid), gte(focusSessions.startedAt, today)));

    // All-time count, not just today
    const agentResult = await db
        .select({ count: count() })
        .from(agentLogs)
        .where(eq(agentLogs.userId, uid));

    return Response.json({
        activeRooms: activeRooms[0].count,
        openTasks: openTasks[0].count,
        focusMinutes: focusResult[0].total ?? 0,
        agentRuns: agentResult[0].count,
    });
}