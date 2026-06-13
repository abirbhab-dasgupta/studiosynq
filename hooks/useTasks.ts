import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  roomId: string;
  creatorId: string;
  assigneeId: string | null;
  estimatedMinutes: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: TaskPriority;
  assigneeId?: string;
  estimatedMinutes?: number;
  status?: TaskStatus; 
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string | null;
  estimatedMinutes?: number | null;
}



export function useTasks(roomId: string) {
  return useQuery<Task[]>({
    queryKey: ["tasks", roomId],
    queryFn: async () => {
      const res = await fetch(`/api/rooms/${roomId}/tasks`);
      if (!res.ok) throw new Error("Failed to fetch tasks");
      return res.json();
    },
    refetchInterval: 5000,
    staleTime: 2000, 
  });
}


export function useCreateTask(roomId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      const res = await fetch(`/api/rooms/${roomId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Failed to create task");
      return res.json() as Promise<Task>;
    },
    onSuccess: (newTask) => {
      // Directly insert into cache — no invalidation needed
      queryClient.setQueryData<Task[]>(["tasks", roomId], (old) =>
        old ? [...old, newTask] : [newTask]
      );
    },
  });
}



export function useUpdateTask(roomId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, input }: { taskId: string; input: UpdateTaskInput }) => {
      const res = await fetch(`/api/rooms/${roomId}/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Failed to update task");
      return res.json() as Promise<Task>;
    },
    onSuccess: (updatedTask) => {
      
      queryClient.setQueryData<Task[]>(["tasks", roomId], (old) =>
        old?.map((t) => (t.id === updatedTask.id ? updatedTask : t)) ?? []
      );
    },
    onError: () => {
   
      queryClient.invalidateQueries({ queryKey: ["tasks", roomId] });
    },
  });
}



export function useDeleteTask(roomId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const res = await fetch(`/api/rooms/${roomId}/tasks/${taskId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete task");
    },
    onSuccess: (_data, taskId) => {
      queryClient.setQueryData<Task[]>(["tasks", roomId], (old) =>
        old?.filter((t) => t.id !== taskId) ?? []
      );
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", roomId] });
    },
  });
}