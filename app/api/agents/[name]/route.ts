import { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "@/lib/redis";
import {
    routeStream, routeFull,
    ChatMessage, ModelId, DEFAULT_MODEL_ID, ALL_MODELS,
} from "@/lib/agents/llm-router";
import {
    codeBuddyPrompt, clarityAgentPrompt, researchBotPrompt,
    designExpertPrompt, emailWriterPrompt,
} from "@/lib/agents/prompts";
import { db } from "@/lib/db";
import { agentLogs } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

type AgentName = "codebuddy" | "clarityagent" | "researchbot" | "designexpert" | "emailwriter";

const AGENT_CONFIG: Record<AgentName, { prompt: string; stream: boolean }> = {
    codebuddy:    { prompt: codeBuddyPrompt,    stream: true  },
    clarityagent: { prompt: clarityAgentPrompt, stream: true  },
    researchbot:  { prompt: researchBotPrompt,  stream: false },
    designexpert: { prompt: designExpertPrompt, stream: true  },
    emailwriter:  { prompt: emailWriterPrompt,  stream: true  },
};

const CACHE_TTL: Record<AgentName, number> = {
    codebuddy: 0, clarityagent: 0, researchbot: 1800, designexpert: 0, emailwriter: 0,
};

function cacheKey(agent: string, lastMessage: string, modelId: string): string {
    const safe = `${modelId}:${lastMessage}`.slice(0, 220).replace(/\s+/g, " ").trim();
    return `agent:${agent}:${Buffer.from(safe).toString("base64").slice(0, 64)}`;
}

// ── Body parsers ───────────────────────────────────────────────────────────
//
// The AgentChatPanel sends:
//   { messages: [{role, content},...], modelId }
//
// `messages` is the COMPLETE conversation — all prior turns + the new user
// message at the end. We pass this directly to routeStream / routeFull.

type RawMsg = { role: string; content?: string; parts?: Array<{ type: string; text?: string }> };

function parseContent(m: RawMsg): string {
    if (typeof m.content === "string" && m.content.trim()) return m.content.trim();
    if (Array.isArray(m.parts)) {
        return m.parts
            .filter((p): p is { type: "text"; text: string } =>
                p.type === "text" && typeof p.text === "string")
            .map(p => p.text)
            .join("")
            .trim();
    }
    return "";
}

function extractMessages(body: Record<string, unknown>): ChatMessage[] {
    // Primary: new panel format — full messages array
    if (Array.isArray(body.messages) && body.messages.length > 0) {
        return (body.messages as RawMsg[])
            .filter(m => m.role === "user" || m.role === "assistant")
            .map(m => ({ role: m.role as "user" | "assistant", content: parseContent(m) }))
            .filter(m => m.content !== "");
    }
    // Fallback: legacy { message, history } format (room chat, etc.)
    if (typeof body.message === "string" && body.message.trim()) {
        const history = Array.isArray(body.history)
            ? (body.history as RawMsg[])
                .filter(m => m.role === "user" || m.role === "assistant")
                .map(m => ({ role: m.role as "user" | "assistant", content: parseContent(m) }))
                .filter(m => m.content !== "")
            : [];
        return [...history, { role: "user" as const, content: body.message.trim() }];
    }
    return [];
}

function extractModelId(body: Record<string, unknown>): ModelId {
    const id = body.modelId;
    if (typeof id === "string" && ALL_MODELS.find(m => m.id === id)) return id as ModelId;
    return DEFAULT_MODEL_ID;
}

// ── Route handler ──────────────────────────────────────────────────────────

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ name: string }> }
) {
    const { name } = await params;
    const agentName = name.toLowerCase() as AgentName;

    if (!AGENT_CONFIG[agentName]) {
        return Response.json({ error: `Unknown agent: ${name}` }, { status: 404 });
    }

    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    let body: Record<string, unknown>;
    try { body = await req.json(); }
    catch {
        return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const messages = extractMessages(body);
    if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
        return Response.json({ error: "messages must end with a user turn" }, { status: 400 });
    }

    // Rate limit
    if (redis) {
        const rl = new Ratelimit({
            redis,
            limiter: Ratelimit.slidingWindow(20, "1 m"),
            prefix: `rl:agent:${agentName}`,
        });
        const { success, limit, remaining, reset } = await rl.limit(userId);
        if (!success) {
            return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again in a moment." }), {
                status: 429,
                headers: {
                    "Content-Type": "application/json",
                    "X-RateLimit-Limit": String(limit),
                    "X-RateLimit-Remaining": String(remaining),
                    "X-RateLimit-Reset": String(reset),
                },
            });
        }
    }

    const config  = AGENT_CONFIG[agentName];
    const ttl     = CACHE_TTL[agentName];
    const modelId = extractModelId(body);

    // The last user message (for cache key + logging)
    const lastUserMsg = [...messages].reverse().find(m => m.role === "user")!.content;
    const isFirstTurn = messages.filter(m => m.role === "user").length === 1;

    // Cache read (researchbot, first turn only)
    if (redis && ttl > 0 && isFirstTurn) {
        const key    = cacheKey(agentName, lastUserMsg, modelId);
        const cached = await redis.get<string>(key);
        if (cached) {
            logAgent(userId, agentName, lastUserMsg).catch(console.error);
            return Response.json({ text: cached, cached: true, webSearch: false });
        }
    }

    // ── ResearchBot (non-streaming) ──────────────────────────────────────
    if (!config.stream) {
        try {
            let systemPrompt = config.prompt;
            let webSearch    = false;

            if (process.env.TAVILY_API_KEY) {
                try {
                    const { tavilySearch, formatSearchContext } = await import("@/lib/agents/travily");
                    const results = await tavilySearch(lastUserMsg);
                    if (results && Array.isArray(results.results) && results.results.length > 0) {
                        systemPrompt = `${config.prompt}\n\n${formatSearchContext(lastUserMsg, results)}`;
                        webSearch    = true;
                    }
                } catch (e) { console.warn("[agents] Tavily failed:", e); }
            }

            const text = await routeFull(systemPrompt, messages, modelId);

            if (redis && ttl > 0 && isFirstTurn) {
                await redis.set(cacheKey(agentName, lastUserMsg, modelId), text, { ex: ttl });
            }
            logAgent(userId, agentName, lastUserMsg).catch(console.error);
            return Response.json({ text, webSearch });
        } catch (err) {
            console.error(`[agents/${agentName}] Error:`, err);
            return Response.json({ error: "LLM request failed. Check your API keys." }, { status: 502 });
        }
    }

    // ── Streaming ────────────────────────────────────────────────────────
    try {
        const response = await routeStream(config.prompt, messages, modelId);
        logAgent(userId, agentName, lastUserMsg).catch(console.error);
        return response;
    } catch (err) {
        console.error(`[agents/${agentName}] Stream error:`, err);
        return Response.json({ error: "LLM request failed. Check your API keys." }, { status: 502 });
    }
}

async function logAgent(userId: string, agentName: AgentName, prompt: string) {
    try {
        await db.insert(agentLogs).values({ userId, agentName, prompt: prompt.slice(0, 1000) });
    } catch (err) { console.error("[agentLog]", err); }
}