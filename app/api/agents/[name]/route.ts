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

function cacheKey(agent: string, message: string, modelId: string): string {
    const safe = `${modelId}:${message}`.slice(0, 220).replace(/\s+/g, " ").trim();
    return `agent:${agent}:${Buffer.from(safe).toString("base64").slice(0, 64)}`;
}

type Part  = { type: string; text?: string };
type UIMsg = { role: string; parts?: Part[]; content?: string };

function extractMessage(body: Record<string, unknown>): string {
    if (typeof body.message === "string" && body.message.trim()) return body.message.trim();
    if (body.message && typeof body.message === "object") {
        const m = body.message as UIMsg;
        if (Array.isArray(m.parts)) {
            const t = m.parts.filter((p): p is { type: "text"; text: string } =>
                p.type === "text" && typeof p.text === "string").map(p => p.text).join("");
            if (t.trim()) return t.trim();
        }
        if (typeof m.content === "string" && m.content.trim()) return m.content.trim();
    }
    if (Array.isArray(body.messages)) {
        const msgs = body.messages as UIMsg[];
        for (let i = msgs.length - 1; i >= 0; i--) {
            const m = msgs[i]; if (m.role !== "user") continue;
            if (Array.isArray(m.parts)) {
                const t = m.parts.filter((p): p is { type: "text"; text: string } =>
                    p.type === "text" && typeof p.text === "string").map(p => p.text).join("");
                if (t.trim()) return t.trim();
            }
            if (typeof m.content === "string" && m.content.trim()) return m.content.trim();
        }
    }
    return "";
}

function extractHistory(body: Record<string, unknown>): ChatMessage[] {
    if (Array.isArray(body.messages) && body.messages.length > 1) {
        return (body.messages as UIMsg[]).slice(0, -1)
            .filter(m => m.role === "user" || m.role === "assistant")
            .map(m => {
                const role = m.role as "user" | "assistant";
                if (Array.isArray(m.parts)) {
                    const content = m.parts.filter((p): p is { type: "text"; text: string } =>
                        p.type === "text" && typeof p.text === "string").map(p => p.text).join("");
                    return { role, content };
                }
                return { role, content: typeof m.content === "string" ? m.content : "" };
            }).filter(m => m.content.trim() !== "");
    }
    if (Array.isArray(body.history)) {
        return (body.history as Array<{ role: string; content: string }>)
            .filter(m => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
            .map(m => ({ role: m.role as "user" | "assistant", content: m.content }));
    }
    return [];
}

function extractModelId(body: Record<string, unknown>): ModelId {
    const id = body.modelId;
    if (typeof id === "string" && ALL_MODELS.find(m => m.id === id)) return id as ModelId;
    return DEFAULT_MODEL_ID;
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ name: string }> }
) {
    const { name } = await params;
    const agentName = name.toLowerCase() as AgentName;

    if (!AGENT_CONFIG[agentName]) {
        return new Response(JSON.stringify({ error: `Unknown agent: ${name}` }),
            { status: 404, headers: { "Content-Type": "application/json" } });
    }

    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }),
            { status: 401, headers: { "Content-Type": "application/json" } });
    }
    const userId = session.user.id;

    let body: Record<string, unknown>;
    try { body = await req.json(); }
    catch {
        return new Response(JSON.stringify({ error: "Invalid JSON body" }),
            { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const message = extractMessage(body);
    if (!message) {
        return new Response(JSON.stringify({ error: "message is required" }),
            { status: 400, headers: { "Content-Type": "application/json" } });
    }

    if (redis) {
        const rl = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(20, "1 m"), prefix: `rl:agent:${agentName}` });
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
    const history = extractHistory(body);
    const modelId = extractModelId(body);

    if (redis && ttl > 0 && history.length === 0) {
        const key    = cacheKey(agentName, message, modelId);
        const cached = await redis.get<string>(key);
        if (cached) {
            logAgent(userId, agentName, message).catch(console.error);
            return new Response(JSON.stringify({ text: cached, cached: true, webSearch: false }),
                { headers: { "Content-Type": "application/json" } });
        }
    }

    // ResearchBot (non-streaming)
    if (!config.stream) {
        try {
            let prompt    = config.prompt;
            let webSearch = false;
            if (process.env.TAVILY_API_KEY) {
                try {
                    const { tavilySearch, formatSearchContext } = await import("@/lib/agents/travily");
                    const results = await tavilySearch(message);
                    if (results && results.results.length > 0) {
                        prompt    = `${config.prompt}\n\n${formatSearchContext(message, results)}`;
                        webSearch = true;
                    }
                } catch (e) { console.warn("[agents] Tavily failed:", e); }
            }
            const text = await routeFull(prompt, message, history, modelId);
            if (redis && ttl > 0 && history.length === 0) {
                await redis.set(cacheKey(agentName, message, modelId), text, { ex: ttl });
            }
            logAgent(userId, agentName, message).catch(console.error);
            return new Response(JSON.stringify({ text, webSearch }),
                { headers: { "Content-Type": "application/json" } });
        } catch (err) {
            console.error(`[agents/${agentName}] Error:`, err);
            return new Response(JSON.stringify({ error: "LLM request failed. Check your API keys." }),
                { status: 502, headers: { "Content-Type": "application/json" } });
        }
    }

    // Streaming
    try {
        const response = await routeStream(config.prompt, message, history, modelId);
        logAgent(userId, agentName, message).catch(console.error);
        return response;
    } catch (err) {
        console.error(`[agents/${agentName}] Stream error:`, err);
        return new Response(JSON.stringify({ error: "LLM request failed. Check your API keys." }),
            { status: 502, headers: { "Content-Type": "application/json" } });
    }
}

async function logAgent(userId: string, agentName: AgentName, prompt: string) {
    try {
        await db.insert(agentLogs).values({ userId, agentName, prompt: prompt.slice(0, 1000) });
    } catch (err) { console.error("[agentLog]", err); }
}