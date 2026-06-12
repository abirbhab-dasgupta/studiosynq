import { createGroq } from "@ai-sdk/groq";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createMistral } from "@ai-sdk/mistral";
import { streamText, generateText, LanguageModel } from "ai";

export type ChatMessage = { role: "user" | "assistant"; content: string };

// ── Provider enum ──────────────────────────────────────────────────────────

export type ModelProvider = "groq" | "gemini" | "mistral";

export type ModelId =
    // Groq
    | "groq/openai/gpt-oss-120b"
    | "groq/llama-3.3-70b-versatile"
    // Gemini
    | "gemini/gemini-2.0-flash"
    | "gemini/gemini-1.5-pro"
    // Mistral
    | "mistral/mistral-large-latest"
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
    requiresKey: string;
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
        id: "groq/llama-3.3-70b-versatile",
        provider: "groq",
        providerLabel: "Groq",
        label: "Llama 3.3 70B",
        description: "Balanced quality and speed. Great all-rounder for everyday tasks.",
        badge: "Basic",
        badgeColor: "#D97706",
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
        badge: "Default",
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
];

export const DEFAULT_MODEL_ID: ModelId = "gemini/gemini-2.0-flash";

// ── Model resolver ─────────────────────────────────────────────────────────

function resolveModel(modelId: ModelId): LanguageModel {
    const [provider, ...rest] = modelId.split("/");
    const modelName = rest.join("/");

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

// ── Fallback chain ─────────────────────────────────────────────────────────

function getFallbackModels(preferredId: ModelId): LanguageModel[] {
    const fallbacks: ModelId[] = [
        "groq/llama-3.3-70b-versatile",
        "gemini/gemini-2.0-flash",
        "mistral/mistral-large-latest",
    ].filter(id => id !== preferredId) as ModelId[];

    const models: LanguageModel[] = [];
    for (const id of fallbacks) {
        try {
            models.push(resolveModel(id));
        } catch {
            // API key not set — skip
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

// ── Full (ResearchBot + room chat agents) ──────────────────────────────────

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