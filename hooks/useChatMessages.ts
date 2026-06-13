import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface ChatMessage {
    id: string;
    roomId: string;
    userId: string;
    content: string;
    agentName: string | null;
    parentId: string | null;
    createdAt: string;
    senderName?: string;
    senderImage?: string | null;
}

export function useChatMessages(roomId: string) {
    return useQuery<ChatMessage[]>({
        queryKey: ["messages", roomId],
        queryFn: async () => {
            const res = await fetch(`/api/rooms/${roomId}/messages`);
            if (!res.ok) throw new Error("Failed to fetch messages");
            return res.json();
        },
        staleTime: Infinity, 
    });
}

export function useSendMessage(roomId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (content: string) => {
            const res = await fetch(`/api/rooms/${roomId}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content }),
            });
            if (!res.ok) throw new Error("Failed to send message");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["messages", roomId] });
        },
    });
}