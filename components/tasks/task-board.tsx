"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
    closestCorners,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useQuery } from "@tanstack/react-query";

import { TaskColumn } from "./task-column";
import { TaskColumnMobile } from "./task-column-mobile";
import { TaskCard } from "./task-card";
import { CreateTaskModal } from "./create-task-modal";
import {
    useTasks,
    useCreateTask,
    useUpdateTask,
    useDeleteTask,
} from "@/hooks/useTasks";
import type { Task, TaskStatus } from "@/hooks/useTasks";
import { Ico } from "@/components/dashboard/icons";

type Member = {
    userId: string;
    name: string;
    image: string | null;
    avatarColor: string | null;
    joinedAt: string;
};

type Room = {
    id: string;
    name: string;
    createdBy: string;
    members: Member[];
};

type Props = {
    roomId: string;
    user: { id: string; name: string; email: string };
};

const STATUSES: TaskStatus[] = ["todo", "in_progress", "done"];

export function TaskBoard({ roomId, user }: Props) {
    const router = useRouter();
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState<TaskStatus>("todo");
    const [editTask, setEditTask] = useState<Task | null>(null);
    const [dragTasks, setDragTasks] = useState<Task[] | null>(null);

    const { data: serverTasks = [] } = useTasks(roomId);
    const { data: room, isLoading: roomLoading } = useQuery<Room>({
        queryKey: ["room", roomId],
        queryFn: () => fetch(`/api/rooms/${roomId}`).then(r => r.json()),
        refetchInterval: 5000,
    });

    const createTask = useCreateTask(roomId);
    const updateTask = useUpdateTask(roomId);
    const deleteTask = useDeleteTask(roomId);

    const displayTasks = dragTasks ?? serverTasks;

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    );

    function getTasksByStatus(status: TaskStatus) {
        return displayTasks.filter(t => t.status === status);
    }

    function handleDragStart(event: DragStartEvent) {
        const task = serverTasks.find(t => t.id === String(event.active.id));
        if (task) {
            setActiveTask(task);
            setDragTasks(serverTasks.map(t => ({ ...t })));
        }
    }

    function handleDragOver(event: DragOverEvent) {
        const { active, over } = event;
        if (!over || !dragTasks) return;

        const activeId = String(active.id);
        const overId = String(over.id);
        if (activeId === overId) return;

        setDragTasks(prev => {
            if (!prev) return prev;
            const next = prev.map(t => ({ ...t }));
            const aIdx = next.findIndex(t => t.id === activeId);
            if (aIdx === -1) return prev;

            if (STATUSES.includes(overId as TaskStatus)) {
                next[aIdx] = { ...next[aIdx], status: overId as TaskStatus };
                return next;
            }

            const oIdx = next.findIndex(t => t.id === overId);
            if (oIdx === -1) return prev;

            if (next[aIdx].status !== next[oIdx].status) {
                next[aIdx] = { ...next[aIdx], status: next[oIdx].status };
            }
            return arrayMove(next, aIdx, oIdx);
        });
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active } = event;
        const activeId = String(active.id);
        setActiveTask(null);

        if (!dragTasks) return;

        const draggedTask = dragTasks.find(t => t.id === activeId);
        const originalTask = serverTasks.find(t => t.id === activeId);

        if (!draggedTask || !originalTask) {
            setDragTasks(null);
            return;
        }

        if (draggedTask.status !== originalTask.status) {
            updateTask.mutate(
                { taskId: activeId, input: { status: draggedTask.status } },
                {
                    onSuccess: () => setDragTasks(null),
                    onError: () => setDragTasks(null),
                }
            );
        } else {
            setDragTasks(null);
        }
    }

    // Mobile: move task to next/prev status via button
    function handleMoveTask(taskId: string, newStatus: TaskStatus) {
        updateTask.mutate({ taskId, input: { status: newStatus } });
    }

    function handleAddTask(status: TaskStatus) {
        setModalStatus(status);
        setEditTask(null);
        setShowModal(true);
    }

    function handleEditTask(task: Task) {
        setEditTask(task);
        setShowModal(true);
    }

    function handleDeleteTask(taskId: string) {
        deleteTask.mutate(taskId);
    }

    function handleModalSubmit(data: {
        title: string;
        description: string;
        priority: Task["priority"];
        assigneeId: string | null;
        estimatedMinutes: number | null;
        status: TaskStatus;
    }) {
        if (editTask) {
            updateTask.mutate({
                taskId: editTask.id,
                input: {
                    title: data.title,
                    description: data.description,
                    status: data.status,
                    priority: data.priority,
                    assigneeId: data.assigneeId,
                    estimatedMinutes: data.estimatedMinutes,
                },
            }, { onSuccess: () => setShowModal(false) });
        } else {
            createTask.mutate({
                title: data.title,
                description: data.description || undefined,
                priority: data.priority,
                assigneeId: data.assigneeId ?? undefined,
                status: data.status,
                estimatedMinutes: data.estimatedMinutes ?? undefined,
            }, { onSuccess: () => setShowModal(false) });
        }
    }

    const members = room?.members ?? [];
    const totalTasks = displayTasks.length;
    const doneTasks = displayTasks.filter(t => t.status === "done").length;

    return (
        <div className="task-board-shell">
            {/* Header */}
            <div className="task-board-header">
                <div className="flex items-center gap-3">
                    <button
                        className="room-workspace-back"
                        onClick={() => router.push("/tasks")}
                    >
                        <Ico d="M19 12H5 M12 19l-7-7 7-7" size={13} stroke="var(--text-2)" />
                    </button>
                    <div>
                        <p className="room-workspace-title">
                            {roomLoading ? "Loading…" : (room?.name ?? "Task Board")}
                        </p>
                        <p className="room-workspace-subtitle">
                            {totalTasks > 0
                                ? `${doneTasks}/${totalTasks} done`
                                : "No tasks yet"
                            }
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => handleAddTask("todo")}
                    className="rooms-create-btn"
                    style={{ height: 32, fontSize: 12 }}
                >
                    <svg width={12} height={12} viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    <span className="hidden sm:inline">New task</span>
                    <span className="sm:hidden">New</span>
                </button>
            </div>

            {/* ── Desktop board (hidden on mobile) ── */}
            <div className="task-board-desktop">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                >
                    <div className="task-board-columns">
                        {STATUSES.map(status => (
                            <TaskColumn
                                key={status}
                                status={status}
                                tasks={getTasksByStatus(status)}
                                members={members}
                                currentUserId={user.id}
                                onAddTask={handleAddTask}
                                onEdit={handleEditTask}
                                onDelete={handleDeleteTask}
                            />
                        ))}
                    </div>

                    <DragOverlay dropAnimation={null}>
                        {activeTask && (
                            <div style={{ transform: "rotate(1.5deg)", opacity: 0.9, width: 280 }}>
                                <TaskCard
                                    task={activeTask}
                                    members={members}
                                    currentUserId={user.id}
                                    onEdit={() => {}}
                                    onDelete={() => {}}
                                />
                            </div>
                        )}
                    </DragOverlay>
                </DndContext>
            </div>

            {/* ── Mobile accordion (hidden on desktop) ── */}
            <div className="task-board-mobile">
                {STATUSES.map(status => (
                    <TaskColumnMobile
                        key={status}
                        status={status}
                        tasks={getTasksByStatus(status)}
                        members={members}
                        currentUserId={user.id}
                        onAddTask={handleAddTask}
                        onEdit={handleEditTask}
                        onDelete={handleDeleteTask}
                        onMove={handleMoveTask}
                    />
                ))}
            </div>

            {showModal && (
                <CreateTaskModal
                    initialStatus={modalStatus}
                    editTask={editTask}
                    members={members}
                    currentUserId={user.id}
                    onSubmit={handleModalSubmit}
                    onClose={() => setShowModal(false)}
                    isLoading={createTask.isPending || updateTask.isPending}
                />
            )}
        </div>
    );
}