"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { TaskCard } from "./task-card";
import type { Task, TaskStatus } from "@/hooks/useTasks";

type Member = {
    userId: string;
    name: string;
    image: string | null;
    avatarColor: string | null;
};

type Props = {
    status: TaskStatus;
    tasks: Task[];
    members: Member[];
    currentUserId: string;
    onAddTask: (status: TaskStatus) => void;
    onEdit: (task: Task) => void;
    onDelete: (taskId: string) => void;
};

const COLUMN_CONFIG: Record<TaskStatus, {
    label: string;
    color: string;
    bg: string;
    border: string;
    dot: string;
}> = {
    todo: {
        label: "To Do",
        color: "var(--text-2)",
        bg: "var(--surface)",
        border: "var(--border)",
        dot: "var(--text-3)",
    },
    in_progress: {
        label: "In Progress",
        color: "#D97706",
        bg: "rgba(217,119,6,0.07)",
        border: "rgba(217,119,6,0.18)",
        dot: "#D97706",
    },
    done: {
        label: "Done",
        color: "#10b981",
        bg: "rgba(16,185,129,0.07)",
        border: "rgba(16,185,129,0.18)",
        dot: "#10b981",
    },
};

export function TaskColumn({
    status, tasks, members, currentUserId, onAddTask, onEdit, onDelete,
}: Props) {
    const config = COLUMN_CONFIG[status];
    const taskIds = tasks.map(t => t.id);

    const { setNodeRef, isOver } = useDroppable({ id: status });

    return (
        <div
            className="task-column"
            style={{
                outline: isOver ? `2px solid ${config.dot}` : "2px solid transparent",
                outlineOffset: 2,
                transition: "outline-color .15s",
            }}
        >
            {/* Column header */}
            <div className="task-column-header">
                <div className="flex items-center gap-2">
                    <div style={{
                        width: 7, height: 7, borderRadius: "50%",
                        background: config.dot, flexShrink: 0,
                    }} />
                    <span className="task-column-label">{config.label}</span>
                    <span style={{
                        fontSize: 10, fontWeight: 600,
                        color: config.color,
                        background: config.bg,
                        border: `1px solid ${config.border}`,
                        borderRadius: 99,
                        padding: "1px 7px",
                        fontFamily: "var(--font-mono)",
                    }}>
                        {tasks.length}
                    </span>
                </div>

                <button
                    onClick={() => onAddTask(status)}
                    className="task-column-add-btn"
                    title={`Add task to ${config.label}`}
                >
                    <svg width={12} height={12} viewBox="0 0 24 24" fill="none"
                        stroke="var(--text-3)" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                </button>
            </div>

            {/* Cards */}
            <div ref={setNodeRef} className="task-column-body">
                <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
                    {tasks.length === 0 ? (
                        <div className="task-column-empty">
                            <p style={{
                                fontSize: 11, color: "var(--text-3)",
                                fontFamily: "var(--font-sans)", textAlign: "center",
                            }}>
                                Drop tasks here
                            </p>
                        </div>
                    ) : (
                        tasks.map(task => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                members={members}
                                currentUserId={currentUserId}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        ))
                    )}
                </SortableContext>
            </div>
        </div>
    );
}