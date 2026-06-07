import { auth } from "@/lib/auth";
import { db, agentLogs } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import { headers } from "next/headers";

export async function GET() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const logs = await db
        .select({
            id: agentLogs.id,
            agentName: agentLogs.agentName,
            prompt: agentLogs.prompt,
            createdAt: agentLogs.createdAt,
        })
        .from(agentLogs)
        .where(eq(agentLogs.userId, session.user.id))
        .orderBy(desc(agentLogs.createdAt))
        .limit(8);

    return Response.json(logs);
}