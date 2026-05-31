"use client";

import { useState, useEffect } from "react";
import type { Task, TaskPriority, TaskStatus } from "@/hooks/useTasks";

type Member = {
    userId: string;
    name: string;
    image: string | null;
    avatarColor: string | null;
};

type Props = {
    initialStatus?: TaskStatus;
    editTask?: Task | null;
    members: Member[];
    currentUserId: string;
    onSubmit: (data: {
        title: string;
        description: string;
        priority: TaskPriority;
        assigneeId: string | null;
        estimatedMinutes: number | null;
        status: TaskStatus;
    }) => void;
    onClose: () => void;
    isLoading?: boolean;
};

const PRIORITIES: { value: TaskPriority; label: string; color: string }[] = [
    { value: "low",    label: "Low",    color: "#10b981" },
    { value: "medium", label: "Medium", color: "#D97706" },
    { value: "high",   label: "High",   color: "#ef4444" },
];

const STATUSES: { value: TaskStatus; label: string }[] = [
    { value: "todo",        label: "To Do"       },
    { value: "in_progress", label: "In Progress" },
    { value: "done",        label: "Done"        },
];

export function CreateTaskModal({
    initialStatus = "todo",
    editTask,
    members,
    currentUserId,
    onSubmit,
    onClose,
    isLoading,
}: Props) {
    const isEdit = !!editTask;

    const [title, setTitle] = useState(editTask?.title ?? "");
    const [description, setDescription] = useState(editTask?.description ?? "");
    const [priority, setPriority] = useState<TaskPriority>(editTask?.priority ?? "medium");
    const [assigneeId, setAssigneeId] = useState<string>(editTask?.assigneeId ?? "");
    const [estimatedMinutes, setEstimatedMinutes] = useState<string>(
        editTask?.estimatedMinutes ? String(editTask.estimatedMinutes) : ""
    );
    const [status, setStatus] = useState<TaskStatus>(editTask?.status ?? initialStatus);

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    function handleSubmit() {
        if (!title.trim()) return;
        onSubmit({
            title: title.trim(),
            description: description.trim(),
            priority,
            assigneeId: assigneeId || null,
            estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes) : null,
            status,
        });
    }

    return (
        <div className="rooms-modal-backdrop" onClick={onClose}>
            <div
                className="rooms-modal"
                style={{ maxWidth: 480, gap: 14 }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between">
                    <p className="rooms-modal-title">
                        {isEdit ? "Edit task" : "New task"}
                    </p>
                    <button
                        onClick={onClose}
                        style={{
                            width: 28, height: 28, borderRadius: 7,
                            background: "var(--surface)",
                            border: "1px solid var(--border)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer",
                        }}
                    >
                        <svg width={12} height={12} viewBox="0 0 24 24" fill="none"
                            stroke="var(--text-3)" strokeWidth="2.5"
                            strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Title */}
                <div className="flex flex-col gap-1.5">
                    <label className="task-modal-label">Title *</label>
                    <input
                        className="rooms-modal-input"
                        placeholder="What needs to be done?"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        autoFocus
                        onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSubmit()}
                    />
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1.5">
                    <label className="task-modal-label">Description</label>
                    <textarea
                        className="rooms-modal-input"
                        placeholder="Add more context…"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        rows={3}
                        style={{ height: "auto", resize: "none", padding: "10px 12px", lineHeight: 1.5 }}
                    />
                </div>

                {/* Priority + Status row */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                        <label className="task-modal-label">Priority</label>
                        <div className="flex gap-1.5">
                            {PRIORITIES.map(p => (
                                <button
                                    key={p.value}
                                    onClick={() => setPriority(p.value)}
                                    style={{
                                        flex: 1, height: 32,
                                        borderRadius: 7, fontSize: 11, fontWeight: 600,
                                        border: priority === p.value
                                            ? `1px solid ${p.color}`
                                            : "1px solid var(--border)",
                                        background: priority === p.value
                                            ? `${p.color}14`
                                            : "var(--surface)",
                                        color: priority === p.value ? p.color : "var(--text-3)",
                                        cursor: "pointer",
                                        fontFamily: "var(--font-sans)",
                                        transition: "all .12s",
                                    }}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="task-modal-label">Status</label>
                        <select
                            value={status}
                            onChange={e => setStatus(e.target.value as TaskStatus)}
                            className="rooms-modal-input"
                            style={{ height: 32, padding: "0 10px", fontSize: 12 }}
                        >
                            {STATUSES.map(s => (
                                <option key={s.value} value={s.value}
                                    style={{ background: "var(--bg2)", color: "var(--text)" }}>
                                    {s.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Assignee + Estimated time row */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                        <label className="task-modal-label">Assignee</label>
                        <select
                            value={assigneeId}
                            onChange={e => setAssigneeId(e.target.value)}
                            className="rooms-modal-input"
                            style={{ height: 32, padding: "0 10px", fontSize: 12 }}
                        >
                            <option value="" style={{ background: "var(--bg2)", color: "var(--text)" }}>
                                Unassigned
                            </option>
                            {members.map(m => (
                                <option
                                    key={m.userId}
                                    value={m.userId}
                                    style={{ background: "var(--bg2)", color: "var(--text)" }}
                                >
                                    {m.name}{m.userId === currentUserId ? " (you)" : ""}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="task-modal-label">Est. minutes</label>
                        <input
                            type="number"
                            min={1}
                            max={9999}
                            className="rooms-modal-input"
                            placeholder="e.g. 30"
                            value={estimatedMinutes}
                            onChange={e => setEstimatedMinutes(e.target.value)}
                            style={{ height: 32, padding: "0 10px", fontSize: 12 }}
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="rooms-modal-actions" style={{ marginTop: 4 }}>
                    <button
                        onClick={onClose}
                        className="rooms-modal-cancel"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!title.trim() || isLoading}
                        className="rooms-modal-confirm"
                    >
                        {isLoading
                            ? (isEdit ? "Saving…" : "Creating…")
                            : (isEdit ? "Save changes" : "Create task")
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}