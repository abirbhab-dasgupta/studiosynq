import { auth } from "@/lib/auth";
import { db, messages, roomMembers } from "@/lib/db";
import { eq, and, asc } from "drizzle-orm";
import { headers } from "next/headers";
import Pusher from "pusher";
import { routeFull, DEFAULT_MODEL_ID } from "@/lib/agents/llm-router";
import {
    codeBuddyPrompt, clarityAgentPrompt, researchBotPrompt,
    designExpertPrompt, docWriterPrompt,
} from "@/lib/agents/prompts";

const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID!,
    key: process.env.PUSHER_KEY!,
    secret: process.env.PUSHER_SECRET!,
    cluster: process.env.PUSHER_CLUSTER!,
    useTLS: true,
});

type AgentSlug = "codebuddy" | "clarityagent" | "researchbot" | "designexpert" | "docwriter";

const AGENT_PROMPTS: Record<AgentSlug, string> = {
    codebuddy:     codeBuddyPrompt,
    clarityagent:  clarityAgentPrompt,
    researchbot:   researchBotPrompt,
    designexpert:  designExpertPrompt,
    docwriter:     docWriterPrompt,
};

const AGENT_DISPLAY: Record<AgentSlug, string> = {
    codebuddy:     "CodeBuddy",
    clarityagent:  "ClarityAgent",
    researchbot:   "ResearchBot",
    designexpert:  "DesignExpert",
    docwriter:     "DocWriter",
};

const VALID_AGENTS = Object.keys(AGENT_PROMPTS) as AgentSlug[];

// GET /api/rooms/[id]/messages
export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { id: roomId } = await params;

    const membership = await db
        .select()
        .from(roomMembers)
        .where(and(eq(roomMembers.roomId, roomId), eq(roomMembers.userId, session.user.id)))
        .limit(1);

    if (!membership.length) {
        return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const roomMessages = await db
        .select()
        .from(messages)
        .where(eq(messages.roomId, roomId))
        .orderBy(asc(messages.createdAt))
        .limit(100);

    return Response.json(roomMessages);
}

// POST /api/rooms/[id]/messages
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { id: roomId } = await params;

    const membership = await db
        .select()
        .from(roomMembers)
        .where(and(eq(roomMembers.roomId, roomId), eq(roomMembers.userId, session.user.id)))
        .limit(1);

    if (!membership.length) {
        return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const { content } = await req.json();
    if (!content?.trim()) {
        return Response.json({ error: "Content required" }, { status: 400 });
    }

    // Save user message
    const [userMessage] = await db
        .insert(messages)
        .values({
            roomId,
            userId: session.user.id,
            content: content.trim(),
        })
        .returning();

    // Broadcast user message to all room members via Pusher
    await pusher.trigger(`room-${roomId}`, "new-message", {
        ...userMessage,
        senderName: session.user.name,
        senderImage: session.user.image ?? null,
    });

    // Detect @mention — matches first @AgentName in message
    const mentionMatch = content.match(/@([A-Za-z]+)/);
    if (mentionMatch) {
        const mentionedSlug = mentionMatch[1].toLowerCase() as AgentSlug;

        if (VALID_AGENTS.includes(mentionedSlug)) {
            // Strip @mention prefix, remainder is the agent prompt
            const agentPrompt = content.replace(/@\w+\s*/, "").trim() || content.trim();

            try {
                // Always use routeFull — we need a complete string to save + broadcast
                // routeStream returns a UI stream not suitable for DB storage
                const agentResponseText = await routeFull(
                    AGENT_PROMPTS[mentionedSlug],
                    agentPrompt,
                    [],
                    DEFAULT_MODEL_ID
                );

                if (agentResponseText.trim()) {
                    const [agentMessage] = await db
                        .insert(messages)
                        .values({
                            roomId,
                            userId: session.user.id,
                            content: agentResponseText.trim(),
                            agentName: mentionedSlug,
                            parentId: userMessage.id,
                        })
                        .returning();

                    // Broadcast agent response to all room members
                    await pusher.trigger(`room-${roomId}`, "new-message", {
                        ...agentMessage,
                        senderName: AGENT_DISPLAY[mentionedSlug],
                        senderImage: null,
                    });
                }
            } catch (err) {
                console.error(`[room-chat] Agent ${mentionedSlug} failed:`, err);
                // Don't fail — user message already saved and broadcast
            }
        }
    }

    return Response.json(userMessage, { status: 201 });
}