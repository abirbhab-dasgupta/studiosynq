import { createGroq } from "@ai-sdk/groq";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createMistral } from "@ai-sdk/mistral";
import { streamText, generateText, LanguageModel } from "ai";

export type ChatMessage = { role: "user" | "assistant"; content: string };

// ── Provider enum ──────────────────────────────────────────────────────────

export type ModelProvider = "groq" | "gemini" | "mistral";

export type ModelId =
    // Groq models
    | "groq/openai/gpt-oss-120b"
    | "groq/llama-3.3-70b-versatile"
    | "groq/meta-llama/llama-4-scout-17b-16e-instruct"
    | "groq/groq/compound"
    | "groq/llama-3.1-8b-instant"
    // Gemini models
    | "gemini/gemini-1.5-pro"
    | "gemini/gemini-1.5-flash"
    | "gemini/gemini-2.0-flash"
    // Mistral models
    | "mistral/mistral-large-latest"
    | "mistral/mistral-small-latest"
    | "mistral/codestral-latest";

export interface ModelOption {
    id: ModelId;
    provider: ModelProvider;
    providerLabel: string;
    label: string;
    description: string;
    badge: string;
    badgeColor: string;
    providerColor: string;
    requiresKey: string; // env var name
}

export const ALL_MODELS: ModelOption[] = [
    // ── Groq ──────────────────────────────────────────────────────────────
    {
        id: "groq/openai/gpt-oss-120b",
        provider: "groq",
        providerLabel: "Groq",
        label: "GPT-OSS 120B",
        description: "Highest quality on Groq. Best for complex reasoning and code.",
        badge: "Best",
        badgeColor: "#10b981",
        providerColor: "#f97316",
        requiresKey: "GROQ_API_KEY",
    },
    {
        id: "groq/groq/compound",
        provider: "groq",
        providerLabel: "Groq",
        label: "Groq Compound",
        description: "Groq's agentic model. Optimised for tool use and multi-step tasks.",
        badge: "Agentic",
        badgeColor: "#6366f1",
        providerColor: "#f97316",
        requiresKey: "GROQ_API_KEY",
    },
    {
        id: "groq/llama-3.3-70b-versatile",
        provider: "groq",
        providerLabel: "Groq",
        label: "Llama 3.3 70B",
        description: "Balanced quality and speed. Great all-rounder for everyday tasks.",
        badge: "Default",
        badgeColor: "#D97706",
        providerColor: "#f97316",
        requiresKey: "GROQ_API_KEY",
    },
    {
        id: "groq/meta-llama/llama-4-scout-17b-16e-instruct",
        provider: "groq",
        providerLabel: "Groq",
        label: "Llama 4 Scout 17B",
        description: "Newer Llama 4 architecture. Fast with strong instruction following.",
        badge: "New",
        badgeColor: "#ec4899",
        providerColor: "#f97316",
        requiresKey: "GROQ_API_KEY",
    },
    {
        id: "groq/llama-3.1-8b-instant",
        provider: "groq",
        providerLabel: "Groq",
        label: "Llama 3.1 8B",
        description: "Fastest responses. Best for simple tasks and quick lookups.",
        badge: "Fast",
        badgeColor: "#3b82f6",
        providerColor: "#f97316",
        requiresKey: "GROQ_API_KEY",
    },

    // ── Gemini ────────────────────────────────────────────────────────────
    {
        id: "gemini/gemini-2.0-flash",
        provider: "gemini",
        providerLabel: "Gemini",
        label: "Gemini 2.0 Flash",
        description: "Google's latest fast model. Excellent reasoning and multimodal understanding.",
        badge: "Latest",
        badgeColor: "#10b981",
        providerColor: "#4285f4",
        requiresKey: "GEMINI_API_KEY",
    },
    {
        id: "gemini/gemini-1.5-pro",
        provider: "gemini",
        providerLabel: "Gemini",
        label: "Gemini 1.5 Pro",
        description: "Google's most capable model. Best for long documents and complex tasks.",
        badge: "Pro",
        badgeColor: "#6366f1",
        providerColor: "#4285f4",
        requiresKey: "GEMINI_API_KEY",
    },
    {
        id: "gemini/gemini-1.5-flash",
        provider: "gemini",
        providerLabel: "Gemini",
        label: "Gemini 1.5 Flash",
        description: "Fast and efficient. Great balance of quality and speed.",
        badge: "Fast",
        badgeColor: "#3b82f6",
        providerColor: "#4285f4",
        requiresKey: "GEMINI_API_KEY",
    },

    // ── Mistral ───────────────────────────────────────────────────────────
    {
        id: "mistral/mistral-large-latest",
        provider: "mistral",
        providerLabel: "Mistral",
        label: "Mistral Large",
        description: "Mistral's most capable model. Strong reasoning and multilingual support.",
        badge: "Best",
        badgeColor: "#10b981",
        providerColor: "#ff7000",
        requiresKey: "MISTRAL_API_KEY",
    },
    {
        id: "mistral/codestral-latest",
        provider: "mistral",
        providerLabel: "Mistral",
        label: "Codestral",
        description: "Mistral's code-specialist model. Optimised for code generation and debugging.",
        badge: "Code",
        badgeColor: "#ec4899",
        providerColor: "#ff7000",
        requiresKey: "MISTRAL_API_KEY",
    },
    {
        id: "mistral/mistral-small-latest",
        provider: "mistral",
        providerLabel: "Mistral",
        label: "Mistral Small",
        description: "Lightweight and fast. Good for simple tasks with low latency.",
        badge: "Fast",
        badgeColor: "#3b82f6",
        providerColor: "#ff7000",
        requiresKey: "MISTRAL_API_KEY",
    },
];

export const DEFAULT_MODEL_ID: ModelId = "groq/llama-3.3-70b-versatile";

// ── Model resolver ─────────────────────────────────────────────────────────

function resolveModel(modelId: ModelId): LanguageModel {
    const [provider, ...rest] = modelId.split("/");
    const modelName = rest.join("/"); // handles nested slashes like openai/gpt-oss-120b

    switch (provider) {
        case "groq": {
            if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY not set");
            const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });
            return groq(modelName);
        }
        case "gemini": {
            if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not set");
            const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });
            return google(modelName);
        }
        case "mistral": {
            if (!process.env.MISTRAL_API_KEY) throw new Error("MISTRAL_API_KEY not set");
            const mistral = createMistral({ apiKey: process.env.MISTRAL_API_KEY });
            return mistral(modelName);
        }
        default:
            throw new Error(`Unknown provider: ${provider}`);
    }
}

// Fallback chain when preferred model fails
function getFallbackModels(preferredId: ModelId): LanguageModel[] {
    const fallbacks: ModelId[] = [
        "groq/llama-3.3-70b-versatile",
        "gemini/gemini-1.5-flash",
        "mistral/mistral-small-latest",
    ].filter(id => id !== preferredId) as ModelId[];

    const models: LanguageModel[] = [];
    for (const id of fallbacks) {
        try {
            models.push(resolveModel(id));
        } catch {
            // API key not set — skip this fallback
        }
    }
    return models;
}

// ── Stream ─────────────────────────────────────────────────────────────────

export async function routeStream(
    systemPrompt: string,
    userMessage: string,
    history: ChatMessage[] = [],
    modelId: ModelId = DEFAULT_MODEL_ID
): Promise<Response> {
    const allMessages: ChatMessage[] = [...history, { role: "user", content: userMessage }];

    // Try preferred model first, then fallbacks
    const modelsToTry: LanguageModel[] = [];
    try { modelsToTry.push(resolveModel(modelId)); } catch { /* key not set */ }
    modelsToTry.push(...getFallbackModels(modelId));

    if (modelsToTry.length === 0) {
        throw new Error("No LLM provider configured. Add at least one API key to .env.local.");
    }

    let lastError: unknown;
    for (const model of modelsToTry) {
        try {
            const result = streamText({
                model,
                system: systemPrompt,
                messages: allMessages,
                maxOutputTokens: 2048,
            });
            return result.toUIMessageStreamResponse();
        } catch (err) {
            lastError = err;
            continue;
        }
    }
    throw lastError;
}

// ── Full (ResearchBot) ─────────────────────────────────────────────────────

export async function routeFull(
    systemPrompt: string,
    userMessage: string,
    history: ChatMessage[] = [],
    modelId: ModelId = DEFAULT_MODEL_ID
): Promise<string> {
    const allMessages: ChatMessage[] = [...history, { role: "user", content: userMessage }];

    const modelsToTry: LanguageModel[] = [];
    try { modelsToTry.push(resolveModel(modelId)); } catch { /* key not set */ }
    modelsToTry.push(...getFallbackModels(modelId));

    if (modelsToTry.length === 0) {
        throw new Error("No LLM provider configured. Add at least one API key to .env.local.");
    }

    let lastError: unknown;
    for (const model of modelsToTry) {
        try {
            const result = await generateText({
                model,
                system: systemPrompt,
                messages: allMessages,
                maxOutputTokens: 2048,
            });
            return result.text;
        } catch (err) {
            lastError = err;
            continue;
        }
    }
    throw lastError;
}