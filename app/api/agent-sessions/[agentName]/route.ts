import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { agentSessions } from "@/lib/db";
import { eq, and, desc } from "drizzle-orm";
import { headers } from "next/headers";

// GET /api/agent-sessions/[agentName] — list all sessions
export async function GET(
    _req: Request,
    { params }: { params: Promise<{ agentName: string }> }
) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { agentName } = await params;

    const sessions = await db
        .select()
        .from(agentSessions)
        .where(and(
            eq(agentSessions.userId, session.user.id),
            eq(agentSessions.agentName, agentName as "codebuddy" | "clarityagent" | "researchbot" | "designexpert" | "emailwriter")
        ))
        .orderBy(desc(agentSessions.updatedAt))
        .limit(20);

    return Response.json(sessions.map(s => ({
        ...s,
        messages: JSON.parse(s.messages),
    })));
}

// POST /api/agent-sessions/[agentName] — create new session
export async function POST(
    req: Request,
    { params }: { params: Promise<{ agentName: string }> }
) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { agentName } = await params;
    const { title = "New chat", messages = [] } = await req.json();
    const typedAgentName = agentName as "codebuddy" | "clarityagent" | "researchbot" | "designexpert" | "emailwriter";

    const [created] = await db
        .insert(agentSessions)
        .values({
            userId: session.user.id,
            agentName: typedAgentName,
            title,
            messages: JSON.stringify(messages),
        })
        .returning();

    return Response.json({ ...created, messages: JSON.parse(created.messages) }, { status: 201 });
}