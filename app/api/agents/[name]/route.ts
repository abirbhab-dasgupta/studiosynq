import { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "@/lib/redis";
import { routeStream, routeFull, ChatMessage } from "@/lib/agents/llm-router";
import {
    codeBuddyPrompt,
    clarityAgentPrompt,
    researchBotPrompt,
    designExpertPrompt,
    docWriterPrompt,
} from "@/lib/agents/prompts";
import { db } from "@/lib/db";
import { agentLogs } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

type AgentName = "codebuddy" | "clarityagent" | "researchbot" | "designexpert" | "docwriter";

const AGENT_CONFIG: Record<AgentName, { prompt: string; stream: boolean }> = {
    codebuddy: { prompt: codeBuddyPrompt, stream: true },
    clarityagent: { prompt: clarityAgentPrompt, stream: true },
    researchbot: { prompt: researchBotPrompt, stream: false },
    designexpert: { prompt: designExpertPrompt, stream: true },
    docwriter: { prompt: docWriterPrompt, stream: true },
};

const CACHE_TTL: Record<AgentName, number> = {
    codebuddy: 0,
    clarityagent: 0,
    researchbot: 1800,
    designexpert: 0,
    docwriter: 0,
};

function cacheKey(agentName: string, message: string): string {
    const safe = message.slice(0, 200).replace(/\s+/g, " ").trim();
    return `agent:${agentName}:${Buffer.from(safe).toString("base64").slice(0, 64)}`;
}

type UIMessagePart = { type: string; text?: string };
type UIMessage = { role: string; parts?: UIMessagePart[]; content?: string };

function extractLastUserMessage(body: Record<string, unknown>): string {
    // Shape A — ResearchBot direct fetch: { message: "..." }
    if (typeof body.message === "string" && body.message.trim()) {
        return body.message.trim();
    }

    // Shape B — DefaultChatTransport prepareSendMessagesRequest: { message: UIMessage }
    if (body.message && typeof body.message === "object") {
        const msg = body.message as UIMessage;
        if (Array.isArray(msg.parts)) {
            const text = msg.parts
                .filter((p): p is { type: "text"; text: string } => p.type === "text" && typeof p.text === "string")
                .map(p => p.text)
                .join("");
            if (text.trim()) return text.trim();
        }
        if (typeof msg.content === "string" && msg.content.trim()) {
            return msg.content.trim();
        }
    }

    // Shape C — messages array: { messages: UIMessage[] }
    if (Array.isArray(body.messages) && body.messages.length > 0) {
        const msgs = body.messages as UIMessage[];
        for (let i = msgs.length - 1; i >= 0; i--) {
            const msg = msgs[i];
            if (msg.role !== "user") continue;
            if (Array.isArray(msg.parts)) {
                const text = msg.parts
                    .filter((p): p is { type: "text"; text: string } => p.type === "text" && typeof p.text === "string")
                    .map(p => p.text)
                    .join("");
                if (text.trim()) return text.trim();
            }
            if (typeof msg.content === "string" && msg.content.trim()) {
                return msg.content.trim();
            }
        }
    }

    return "";
}

function extractHistory(body: Record<string, unknown>): ChatMessage[] {
    // From messages array — all except the last (which is the current message)
    if (Array.isArray(body.messages) && body.messages.length > 1) {
        const prior = (body.messages as UIMessage[]).slice(0, -1);
        return prior
            .filter(m => m.role === "user" || m.role === "assistant")
            .map(m => {
                const role = m.role as "user" | "assistant";
                if (Array.isArray(m.parts)) {
                    const content = m.parts
                        .filter((p): p is { type: "text"; text: string } => p.type === "text" && typeof p.text === "string")
                        .map(p => p.text)
                        .join("");
                    return { role, content };
                }
                return { role, content: typeof m.content === "string" ? m.content : "" };
            })
            .filter(m => m.content.trim() !== "");
    }

    // From researchMessages passed directly: { history: [{role, content}[]] }
    if (Array.isArray(body.history)) {
        return (body.history as Array<{ role: string; content: string }>)
            .filter(m => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
            .map(m => ({ role: m.role as "user" | "assistant", content: m.content }));
    }

    return [];
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ name: string }> }
) {
    const { name } = await params;
    const agentName = name.toLowerCase() as AgentName;

    if (!AGENT_CONFIG[agentName]) {
        return new Response(
            JSON.stringify({ error: `Unknown agent: ${name}` }),
            { status: 404, headers: { "Content-Type": "application/json" } }
        );
    }

    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
        return new Response(
            JSON.stringify({ error: "Unauthorized" }),
            { status: 401, headers: { "Content-Type": "application/json" } }
        );
    }
    const userId = session.user.id;

    let body: Record<string, unknown>;
    try {
        body = await req.json();
    } catch {
        return new Response(
            JSON.stringify({ error: "Invalid JSON body" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }

    const message = extractLastUserMessage(body);
    if (!message) {
        console.error("[agents] Could not extract message from body:", JSON.stringify(body).slice(0, 500));
        return new Response(
            JSON.stringify({ error: "message is required" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }

    // Rate limiting
    if (redis) {
        const ratelimit = new Ratelimit({
            redis,
            limiter: Ratelimit.slidingWindow(20, "1 m"),
            prefix: `rl:agent:${agentName}`,
        });
        const { success, limit, remaining, reset } = await ratelimit.limit(userId);
        if (!success) {
            return new Response(
                JSON.stringify({ error: "Rate limit exceeded. Try again in a moment." }),
                {
                    status: 429,
                    headers: {
                        "Content-Type": "application/json",
                        "X-RateLimit-Limit": String(limit),
                        "X-RateLimit-Remaining": String(remaining),
                        "X-RateLimit-Reset": String(reset),
                    },
                }
            );
        }
    }

    const config = AGENT_CONFIG[agentName];
    const ttl = CACHE_TTL[agentName];
    const history = extractHistory(body);

    // Cache check (ResearchBot only, skip if there's history — followups should not be cached)
    if (redis && ttl > 0 && history.length === 0) {
        const key = cacheKey(agentName, message);
        const cached = await redis.get<string>(key);
        if (cached) {
            logAgentInteraction(userId, agentName, message).catch(console.error);
            return new Response(
                JSON.stringify({ text: cached, cached: true, webSearch: false }),
                { headers: { "Content-Type": "application/json" } }
            );
        }
    }

    // ── ResearchBot: Tavily web search + LLM synthesis ──────────────────────
    if (!config.stream) {
        try {
            let systemPrompt = config.prompt;
            let usedWebSearch = false;

            if (process.env.TAVILY_API_KEY) {
                try {
                    const { tavilySearch, formatSearchContext } = await import("@/lib/agents/travily");
                    const searchResults = await tavilySearch(message);
                    if (searchResults && searchResults.results.length > 0) {
                        systemPrompt = `${config.prompt}\n\n${formatSearchContext(message, searchResults)}`;
                        usedWebSearch = true;
                    }
                } catch (tavilyErr) {
                    console.warn("[agents/researchbot] Tavily failed, falling back to LLM only:", tavilyErr);
                }
            }

            const text = await routeFull(systemPrompt, message, history);

            // Only cache first-turn responses (no history), not followups
            if (redis && ttl > 0 && history.length === 0) {
                const key = cacheKey(agentName, message);
                await redis.set(key, text, { ex: ttl });
            }

            logAgentInteraction(userId, agentName, message).catch(console.error);
            return new Response(
                JSON.stringify({ text, webSearch: usedWebSearch }),
                { headers: { "Content-Type": "application/json" } }
            );
        } catch (err) {
            console.error(`[agents/${agentName}] LLM error:`, err);
            return new Response(
                JSON.stringify({ error: "LLM request failed. Check your API keys." }),
                { status: 502, headers: { "Content-Type": "application/json" } }
            );
        }
    }

    // ── Streaming agents ────────────────────────────────────────────────────
    try {
        const response = await routeStream(config.prompt, message, history);
        logAgentInteraction(userId, agentName, message).catch(console.error);
        return response;
    } catch (err) {
        console.error(`[agents/${agentName}] Stream error:`, err);
        return new Response(
            JSON.stringify({ error: "LLM request failed. Check your API keys." }),
            { status: 502, headers: { "Content-Type": "application/json" } }
        );
    }
}

async function logAgentInteraction(userId: string, agentName: AgentName, prompt: string) {
    try {
        await db.insert(agentLogs).values({
            userId,
            agentName,
            prompt: prompt.slice(0, 1000),
        });
    } catch (err) {
        console.error("[agentLog] Failed to write log:", err);
    }
}