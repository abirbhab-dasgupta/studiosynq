export const dynamic = "force-dynamic";

import { AgentChatPanel } from "@/components/agents/AgentChatPanel";
import { redirect } from "next/navigation";

const VALID_AGENTS = ["codebuddy", "clarityagent", "researchbot", "designexpert", "emailwriter"];

interface Props {
    params: Promise<{ name: string }>;
}

export default async function AgentPage({ params }: Props) {
    const { name } = await params;
    const agentName = name.toLowerCase();

    if (!VALID_AGENTS.includes(agentName)) {
        redirect("/dashboard");
    }

    return (
        <div className="flex justify-center w-full h-full min-h-0">
            <div className="flex flex-col w-full max-w-4xl h-full min-h-0 border-x"
                style={{ borderColor: "var(--border)" }}
            >
                <AgentChatPanel agentName={agentName} />
            </div>
        </div>
    );
}