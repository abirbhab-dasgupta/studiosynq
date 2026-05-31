"use client";

import { useState } from "react";
import type { Task, TaskStatus } from "@/hooks/useTasks";
import Image from "next/image";

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
    onMove: (taskId: string, newStatus: TaskStatus) => void;
};

const COLUMN_CONFIG: Record<TaskStatus, {
    label: string;
    dot: string;
    color: string;
    bg: string;
    border: string;
}> = {
    todo:        { label: "To Do",       dot: "var(--text-3)", color: "var(--text-2)", bg: "var(--surface)",          border: "var(--border)"            },
    in_progress: { label: "In Progress", dot: "#D97706",       color: "#D97706",       bg: "rgba(217,119,6,0.07)",    border: "rgba(217,119,6,0.18)"     },
    done:        { label: "Done",        dot: "#10b981",       color: "#10b981",       bg: "rgba(16,185,129,0.07)",   border: "rgba(16,185,129,0.18)"    },
};

const STATUS_ORDER: TaskStatus[] = ["todo", "in_progress", "done"];

const PRIORITY_CONFIG = {
    high:   { label: "High",   color: "#ef4444", bg: "rgba(239,68,68,0.08)",  border: "rgba(239,68,68,0.2)"  },
    medium: { label: "Medium", color: "#D97706", bg: "rgba(217,119,6,0.08)",  border: "rgba(217,119,6,0.2)"  },
    low:    { label: "Low",    color: "#10b981", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.2)" },
};

export function TaskColumnMobile({
    status, tasks, members, currentUserId,
    onAddTask, onEdit, onDelete, onMove,
}: Props) {
    const [open, setOpen] = useState(status === "todo");
    const config = COLUMN_CONFIG[status];
    const currentIndex = STATUS_ORDER.indexOf(status);
    const prevStatus = currentIndex > 0 ? STATUS_ORDER[currentIndex - 1] : null;
    const nextStatus = currentIndex < STATUS_ORDER.length - 1 ? STATUS_ORDER[currentIndex + 1] : null;

    return (
        <div className="task-mobile-column">
            {/* Accordion header */}
            <button
                className="task-mobile-column-header"
                onClick={() => setOpen(p => !p)}
            >
                <div className="flex items-center gap-2.5">
                    <div style={{
                        width: 8, height: 8, borderRadius: "50%",
                        background: config.dot, flexShrink: 0,
                    }} />
                    <span className="task-mobile-column-label">{config.label}</span>
                    <span style={{
                        fontSize: 10, fontWeight: 600,
                        color: config.color,
                        background: config.bg,
                        border: `1px solid ${config.border}`,
                        borderRadius: 99, padding: "1px 7px",
                        fontFamily: "var(--font-mono)",
                    }}>
                        {tasks.length}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={e => { e.stopPropagation(); onAddTask(status); }}
                        className="task-column-add-btn"
                        title={`Add to ${config.label}`}
                    >
                        <svg width={11} height={11} viewBox="0 0 24 24" fill="none"
                            stroke="var(--text-3)" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                    </button>
                    <svg
                        width={14} height={14} viewBox="0 0 24 24" fill="none"
                        stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round"
                        style={{
                            transform: open ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform .2s ease",
                            flexShrink: 0,
                        }}
                    >
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </div>
            </button>

            {/* Accordion body */}
            {open && (
                <div className="task-mobile-column-body">
                    {tasks.length === 0 ? (
                        <div className="task-mobile-empty">
                            <p>No tasks here</p>
                        </div>
                    ) : (
                        tasks.map(task => (
                            <MobileTaskCard
                                key={task.id}
                                task={task}
                                members={members}
                                currentUserId={currentUserId}
                                prevStatus={prevStatus}
                                nextStatus={nextStatus}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onMove={onMove}
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

function MobileTaskCard({
    task, members, currentUserId,
    prevStatus, nextStatus,
    onEdit, onDelete, onMove,
}: {
    task: Task;
    members: Member[];
    currentUserId: string;
    prevStatus: TaskStatus | null;
    nextStatus: TaskStatus | null;
    onEdit: (task: Task) => void;
    onDelete: (taskId: string) => void;
    onMove: (taskId: string, status: TaskStatus) => void;
}) {
    const [showMenu, setShowMenu] = useState(false);
    const priority = PRIORITY_CONFIG[task.priority];
    const assignee = members.find(m => m.userId === task.assigneeId);
    const isCreator = task.creatorId === currentUserId;

    const PREV_LABEL: Record<TaskStatus, string> = {
        todo: "",
        in_progress: "← To Do",
        done: "← In Progress",
    };
    const NEXT_LABEL: Record<TaskStatus, string> = {
        todo: "In Progress →",
        in_progress: "Done →",
        done: "",
    };

    return (
        <div className="task-mobile-card">
            {/* Top row */}
            <div className="flex items-center justify-between mb-2">
                <span style={{
                    fontSize: 9, fontWeight: 600,
                    textTransform: "uppercase" as const,
                    letterSpacing: ".06em",
                    color: priority.color,
                    background: priority.bg,
                    border: `1px solid ${priority.border}`,
                    borderRadius: 4, padding: "2px 6px",
                    fontFamily: "var(--font-mono)",
                }}>
                    {priority.label}
                </span>

                {/* Menu */}
                <div className="relative">
                    <button
                        className="task-menu-btn"
                        onClick={() => setShowMenu(p => !p)}
                    >
                        <svg width={13} height={13} viewBox="0 0 24 24" fill="none"
                            stroke="var(--text-3)" strokeWidth="2.5" strokeLinecap="round">
                            <circle cx="12" cy="5"  r="1" />
                            <circle cx="12" cy="12" r="1" />
                            <circle cx="12" cy="19" r="1" />
                        </svg>
                    </button>
                    {showMenu && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                            <div className="task-dropdown">
                                <button
                                    className="task-dropdown-btn"
                                    style={{ color: "var(--text-2)" }}
                                    onMouseDown={e => { e.preventDefault(); onEdit(task); setShowMenu(false); }}
                                >
                                    <svg width={11} height={11} viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                    Edit
                                </button>
                                {isCreator && (
                                    <button
                                        className="task-dropdown-btn"
                                        style={{ color: "#ef4444" }}
                                        onMouseDown={e => { e.preventDefault(); onDelete(task.id); setShowMenu(false); }}
                                    >
                                        <svg width={11} height={11} viewBox="0 0 24 24" fill="none"
                                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="3 6 5 6 21 6" />
                                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                            <path d="M10 11v6M14 11v6" />
                                        </svg>
                                        Delete
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Title */}
            <p className="task-card-title">{task.title}</p>

            {/* Description */}
            {task.description && (
                <p className="task-card-desc">{task.description}</p>
            )}

            {/* Footer: assignee + time */}
            <div className="flex items-center justify-between mt-2 pt-2 task-card-footer">
                {task.estimatedMinutes ? (
                    <span className="task-card-meta">
                        <svg width={10} height={10} viewBox="0 0 24 24" fill="none"
                            stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                        {task.estimatedMinutes}m
                    </span>
                ) : <span />}

                {assignee && (
                    <div title={assignee.name} style={{
                        width: 22, height: 22, borderRadius: "50%",
                        background: assignee.avatarColor ?? "var(--amber-faint)",
                        border: "1px solid var(--border-m)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 10, fontWeight: 600, color: "#fff",
                        fontFamily: "var(--font-mono)", flexShrink: 0, overflow: "hidden",
                    }}>
                        {assignee.image ? (
                            <Image src={assignee.image} alt={assignee.name}
                                width={22} height={22}
                                style={{ objectFit: "cover", borderRadius: "50%" }} />
                        ) : assignee.name.charAt(0).toUpperCase()}
                    </div>
                )}
            </div>

            {/* Move buttons */}
            {(prevStatus || nextStatus) && (
                <div className="task-mobile-move-row">
                    {prevStatus && (
                        <button
                            className="task-mobile-move-btn"
                            onClick={() => onMove(task.id, prevStatus)}
                        >
                            {PREV_LABEL[task.status]}
                        </button>
                    )}
                    {nextStatus && (
                        <button
                            className="task-mobile-move-btn task-mobile-move-btn-primary"
                            onClick={() => onMove(task.id, nextStatus)}
                        >
                            {NEXT_LABEL[task.status]}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}