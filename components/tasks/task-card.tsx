"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import type { Task } from "@/hooks/useTasks";
import Image from "next/image";

type Member = {
    userId: string;
    name: string;
    image: string | null;
    avatarColor: string | null;
};

type Props = {
    task: Task;
    members: Member[];
    currentUserId: string;
    onEdit: (task: Task) => void;
    onDelete: (taskId: string) => void;
};

const PRIORITY_CONFIG = {
    high:   { label: "High",   color: "#ef4444", bg: "rgba(239,68,68,0.08)",  border: "rgba(239,68,68,0.2)"  },
    medium: { label: "Medium", color: "#D97706", bg: "rgba(217,119,6,0.08)",  border: "rgba(217,119,6,0.2)"  },
    low:    { label: "Low",    color: "#10b981", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.2)" },
};

export function TaskCard({ task, members, currentUserId, onEdit, onDelete }: Props) {
    const [showMenu, setShowMenu] = useState(false);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 999 : undefined,
    };

    const priority = PRIORITY_CONFIG[task.priority];
    const assignee = members.find(m => m.userId === task.assigneeId);
    const isCreator = task.creatorId === currentUserId;
    const assigneeInitial = assignee?.name?.charAt(0).toUpperCase() ?? "?";

    return (
        <div ref={setNodeRef} style={style} className="task-card group">
            {/* Top row: drag handle | priority | menu */}
            <div className="flex items-center justify-between mb-2">
                {/* Drag handle */}
                <div
                    {...attributes}
                    {...listeners}
                    className="task-drag-handle"
                    title="Drag to move"
                >
                    <svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                        <circle cx="9"  cy="5"  r="1.2" fill="var(--text-3)" />
                        <circle cx="9"  cy="12" r="1.2" fill="var(--text-3)" />
                        <circle cx="9"  cy="19" r="1.2" fill="var(--text-3)" />
                        <circle cx="15" cy="5"  r="1.2" fill="var(--text-3)" />
                        <circle cx="15" cy="12" r="1.2" fill="var(--text-3)" />
                        <circle cx="15" cy="19" r="1.2" fill="var(--text-3)" />
                    </svg>
                </div>

                {/* Priority badge */}
                <span style={{
                    fontSize: 9, fontWeight: 600,
                    textTransform: "uppercase" as const,
                    letterSpacing: ".06em",
                    color: priority.color,
                    background: priority.bg,
                    border: `1px solid ${priority.border}`,
                    borderRadius: 4,
                    padding: "2px 6px",
                    fontFamily: "var(--font-mono)",
                }}>
                    {priority.label}
                </span>

                {/* Menu */}
                <div className="relative">
                    <button
                        onClick={() => setShowMenu(p => !p)}
                        className="task-menu-btn opacity-0 group-hover:opacity-100"
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
                            {/* Backdrop to close menu */}
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setShowMenu(false)}
                            />
                            <div className="task-dropdown">
                                <button
                                    className="task-dropdown-btn"
                                    style={{ color: "var(--text-2)" }}
                                    onMouseDown={e => {
                                        e.preventDefault();
                                        onEdit(task);
                                        setShowMenu(false);
                                    }}
                                >
                                    <svg width={11} height={11} viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="2"
                                        strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                    Edit
                                </button>
                                {isCreator && (
                                    <button
                                        className="task-dropdown-btn"
                                        style={{ color: "#ef4444" }}
                                        onMouseDown={e => {
                                            e.preventDefault();
                                            onDelete(task.id);
                                            setShowMenu(false);
                                        }}
                                    >
                                        <svg width={11} height={11} viewBox="0 0 24 24" fill="none"
                                            stroke="currentColor" strokeWidth="2"
                                            strokeLinecap="round" strokeLinejoin="round">
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

            {/* Footer */}
            <div className="flex items-center justify-between mt-3 pt-3 task-card-footer">
                {task.estimatedMinutes ? (
                    <span className="task-card-meta">
                        <svg width={10} height={10} viewBox="0 0 24 24" fill="none"
                            stroke="var(--text-3)" strokeWidth="2"
                            strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                        {task.estimatedMinutes}m
                    </span>
                ) : (
                    <span />
                )}

                {assignee && (
                    <div
                        title={assignee.name}
                        style={{
                            width: 22, height: 22, borderRadius: "50%",
                            background: assignee.avatarColor ?? "var(--amber-faint)",
                            border: "1px solid var(--border-m)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 10, fontWeight: 600, color: "#fff",
                            fontFamily: "var(--font-mono)",
                            flexShrink: 0, overflow: "hidden",
                        }}
                    >
                        {assignee.image ? (
                            <Image
                                src={assignee.image}
                                alt={assignee.name}
                                width={22}
                                height={22}
                                style={{ objectFit: "cover", borderRadius: "50%" }}
                            />
                        ) : (
                            assigneeInitial
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}