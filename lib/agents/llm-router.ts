import { createGroq } from "@ai-sdk/groq";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createMistral } from "@ai-sdk/mistral";
import { streamText, generateText, LanguageModel } from "ai";

export type ChatMessage = { role: "user" | "assistant"; content: string };

function getProviders(): LanguageModel[] {
    const providers: LanguageModel[] = [];

    if (process.env.GROQ_API_KEY) {
        const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });
        providers.push(groq("llama-3.3-70b-versatile"));
    }

    if (process.env.GEMINI_API_KEY) {
        const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });
        providers.push(google("gemini-1.5-flash"));
    }

    if (process.env.MISTRAL_API_KEY) {
        const mistral = createMistral({ apiKey: process.env.MISTRAL_API_KEY });
        providers.push(mistral("mistral-small-latest"));
    }

    return providers;
}

export async function routeStream(
    systemPrompt: string,
    userMessage: string,
    history: ChatMessage[] = []
): Promise<Response> {
    const providers = getProviders();
    if (providers.length === 0) {
        throw new Error("No LLM provider configured. Add at least one API key to .env.local.");
    }

    const allMessages: ChatMessage[] = [
        ...history,
        { role: "user", content: userMessage },
    ];

    let lastError: unknown;
    for (const model of providers) {
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

export async function routeFull(
    systemPrompt: string,
    userMessage: string,
    history: ChatMessage[] = []
): Promise<string> {
    const providers = getProviders();
    if (providers.length === 0) {
        throw new Error("No LLM provider configured. Add at least one API key to .env.local.");
    }

    const allMessages: ChatMessage[] = [
        ...history,
        { role: "user", content: userMessage },
    ];

    let lastError: unknown;
    for (const model of providers) {
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