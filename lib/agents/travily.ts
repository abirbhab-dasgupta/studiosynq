import { tavily } from "@tavily/core";

export interface SearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

export interface TavilySearchResponse {
  results: SearchResult[];
  answer?: string;
}


export async function tavilySearch(query: string): Promise<TavilySearchResponse | null> {
  if (!process.env.TAVILY_API_KEY) {
    console.warn("[tavily] TAVILY_API_KEY not set — skipping web search");
    return null;
  }

  try {
    const client = tavily({ apiKey: process.env.TAVILY_API_KEY });

    const response = await client.search(query, {
      searchDepth: "advanced",
      maxResults: 6,
      includeAnswer: true,
    });

    return {
      results: response.results.map(r => ({
        title: r.title,
        url: r.url,
        content: r.content,
        score: r.score,
      })),
      answer: response.answer ?? undefined,
    };
  } catch (err) {
    console.error("[tavily] Search failed:", err);
    return null;
  }
}


export function formatSearchContext(
  query: string,
  search: TavilySearchResponse
): string {
  const lines: string[] = [
    `## Web Search Results for: "${query}"`,
    `Retrieved ${search.results.length} sources.`,
    "",
  ];

  if (search.answer) {
    lines.push(`**Quick Answer:** ${search.answer}`, "");
  }

  search.results.forEach((r, i) => {
    lines.push(
      `### Source ${i + 1}: ${r.title}`,
      `URL: ${r.url}`,
      r.content.slice(0, 600) + (r.content.length > 600 ? "..." : ""),
      ""
    );
  });

  lines.push(
    "---",
    "Use the above sources to answer the question. Cite sources by their URL where relevant.",
    "If sources are insufficient, say so clearly."
  );

  return lines.join("\n");
}