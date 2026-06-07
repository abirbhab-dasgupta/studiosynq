import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { agentSessions } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";

// PATCH /api/agent-sessions/[agentName]/[id] — update session
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ agentName: string; id: string }> }
) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { title, messages } = await req.json();

    const existing = await db
        .select()
        .from(agentSessions)
        .where(and(
            eq(agentSessions.id, id),
            eq(agentSessions.userId, session.user.id)
        ))
        .limit(1);

    if (!existing.length) {
        return Response.json({ error: "Not found" }, { status: 404 });
    }

    const [updated] = await db
        .update(agentSessions)
        .set({
            ...(title !== undefined && { title }),
            ...(messages !== undefined && { messages: JSON.stringify(messages) }),
        })
        .where(eq(agentSessions.id, id))
        .returning();

    return Response.json({ ...updated, messages: JSON.parse(updated.messages) });
}

// DELETE /api/agent-sessions/[agentName]/[id] — delete session
export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ agentName: string; id: string }> }
) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const existing = await db
        .select()
        .from(agentSessions)
        .where(and(
            eq(agentSessions.id, id),
            eq(agentSessions.userId, session.user.id)
        ))
        .limit(1);

    if (!existing.length) {
        return Response.json({ error: "Not found" }, { status: 404 });
    }

    await db.delete(agentSessions).where(eq(agentSessions.id, id));
    return new Response(null, { status: 204 });
}