import { createGroq } from "@ai-sdk/groq";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createMistral } from "@ai-sdk/mistral";
import { streamText, generateText, LanguageModel } from "ai";

export type ChatMessage = { role: "user" | "assistant"; content: string };

export type ModelProvider = "groq" | "gemini" | "mistral";

export type ModelId =
    | "groq/openai/gpt-oss-120b"
    | "groq/llama-3.3-70b-versatile"
    | "gemini/gemini-2.0-flash"
    | "gemini/gemini-1.5-pro"
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
    {
        id: "groq/openai/gpt-oss-120b",
        provider: "groq",
        providerLabel: "Groq",
        label: "GPT-OSS 120B",
        description: "Highest quality on Groq. Best for complex reasoning and code.",
        badge: "Default",
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
        badge: "Fast",
        badgeColor: "#D97706",
        providerColor: "#f97316",
        requiresKey: "GROQ_API_KEY",
    },
    {
        id: "gemini/gemini-2.0-flash",
        provider: "gemini",
        providerLabel: "Gemini",
        label: "Gemini 2.0 Flash",
        description: "Google's latest fast model. Excellent reasoning and multimodal understanding.",
        badge: "Flash",
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

export const DEFAULT_MODEL_ID: ModelId = "groq/openai/gpt-oss-120b";

// ── Fallback chain ─────────────────────────────────────────────────────────
// Order: GPT-OSS 120B → Llama 3.3 70B → Gemini Flash → Mistral Large
// All three provider keys are available, so all four slots are active.

const FALLBACK_CHAIN: ModelId[] = [
    "groq/openai/gpt-oss-120b",
    "mistral/mistral-large-latest",
    "gemini/gemini-2.0-flash",
    "groq/llama-3.3-70b-versatile",
];

// ── Model resolver ─────────────────────────────────────────────────────────

function resolveModel(modelId: ModelId): LanguageModel {
    const [provider, ...rest] = modelId.split("/");
    const modelName = rest.join("/");

    switch (provider) {
        case "groq": {
            if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY not set");
            return createGroq({ apiKey: process.env.GROQ_API_KEY })(modelName);
        }
        case "gemini": {
            if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not set");
            return createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY })(modelName);
        }
        case "mistral": {
            if (!process.env.MISTRAL_API_KEY) throw new Error("MISTRAL_API_KEY not set");
            return createMistral({ apiKey: process.env.MISTRAL_API_KEY })(modelName);
        }
        default:
            throw new Error(`Unknown provider: ${provider}`);
    }
}

// Build ordered model list: preferred first, then fallbacks (no duplicates)
function buildModelList(preferredId: ModelId): LanguageModel[] {
    const order = [
        preferredId,
        ...FALLBACK_CHAIN.filter(id => id !== preferredId),
    ];

    const models: LanguageModel[] = [];
    for (const id of order) {
        try { models.push(resolveModel(id)); } catch { /* key not set — skip */ }
    }
    return models;
}

// ── routeFull — generateText with working fallback ─────────────────────────
// generateText awaits the full response, so quota/auth errors throw
// synchronously and the catch block can try the next model.

export async function routeFull(
    systemPrompt: string,
    userMessage: string,
    history: ChatMessage[] = [],
    modelId: ModelId = DEFAULT_MODEL_ID
): Promise<string> {
    const messages: ChatMessage[] = [...history, { role: "user", content: userMessage }];
    const models = buildModelList(modelId);

    if (models.length === 0) {
        throw new Error("No LLM provider configured. Add at least one API key.");
    }

    let lastError: unknown;
    for (const model of models) {
        try {
            const result = await generateText({
                model,
                system: systemPrompt,
                messages,
                maxOutputTokens: 2048,
            });
            return result.text;
        } catch (err) {
            lastError = err;
            continue; // try next model
        }
    }
    throw lastError;
}

export async function routeStream(
    systemPrompt: string,
    userMessage: string,
    history: ChatMessage[] = [],
    modelId: ModelId = DEFAULT_MODEL_ID
): Promise<Response> {
    const messages: ChatMessage[] = [...history, { role: "user", content: userMessage }];
    const models = buildModelList(modelId);

    if (models.length === 0) {
        return Response.json(
            { error: "No LLM provider configured. Add at least one API key." },
            { status: 503 }
        );
    }

    for (const model of models) {
        try {
            // Probe: verify the model responds before committing to a stream.
            await generateText({
                model,
                system: "Reply with one word: ok",
                messages: [{ role: "user", content: "ok" }],
                maxOutputTokens: 5,
            });

            // Probe passed — stream with the same model.
            const result = streamText({
                model,
                system: systemPrompt,
                messages,
                maxOutputTokens: 2048,
            });
            return result.toUIMessageStreamResponse();
        } catch {
            continue; // probe failed — try next model
        }
    }

    return Response.json(
        { error: "All providers failed. Please try again later." },
        { status: 503 }
    );
}