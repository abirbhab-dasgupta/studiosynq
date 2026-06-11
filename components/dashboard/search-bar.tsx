"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Ico, P } from "@/components/dashboard/icons";

const PAGES = [
    { label: "Dashboard", href: "/dashboard", icon: P.home },
    { label: "Rooms",     href: "/rooms",     icon: P.grid },
    { label: "Tasks",     href: "/tasks",     icon: P.check },
    { label: "Focus",     href: "/focus",     icon: P.shield },
    { label: "Profile",   href: "/profile",   icon: P.user },
];

const AGENTS = [
    { name: "CodeBuddy",    slug: "codebuddy",    icon: P.code,   accent: "#10b981" },
    { name: "ClarityAgent", slug: "clarityagent", icon: P.chat,   accent: "#6366f1" },
    { name: "ResearchBot",  slug: "researchbot",  icon: P.search, accent: "#D97706" },
    { name: "DesignExpert", slug: "designexpert", icon: P.star,   accent: "#ec4899" },
   { name: "EmailWriter",  slug: "emailwriter",  icon: P.mail,   accent: "#3b82f6" },
];

type Room = { id: string; name: string; isActive: boolean };

type Result =
    | { kind: "page";  label: string; href: string; icon: string }
    | { kind: "agent"; label: string; href: string; icon: string; accent: string }
    | { kind: "room";  label: string; href: string };

export function SearchBar() {
    const router = useRouter();
    const [query, setQuery]   = useState("");
    const [open, setOpen]     = useState(false);
    const [cursor, setCursor] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const boxRef   = useRef<HTMLDivElement>(null);

    const { data: rooms = [] } = useQuery<Room[]>({
        queryKey: ["rooms"],
        queryFn: () => fetch("/api/rooms").then(r => r.json()),
    });

    // Build flat results list filtered by query
    const results: Result[] = useCallback(() => {
        const q = query.trim().toLowerCase();
        if (!q) return [];

        const out: Result[] = [];

        PAGES.forEach(p => {
            if (p.label.toLowerCase().includes(q))
                out.push({ kind: "page", label: p.label, href: p.href, icon: p.icon });
        });

        AGENTS.forEach(a => {
            if (a.name.toLowerCase().includes(q))
                out.push({ kind: "agent", label: a.name, href: `/agents/${a.slug}`, icon: a.icon, accent: a.accent });
        });

        rooms.forEach((r: Room) => {
            if (r.name.toLowerCase().includes(q))
                out.push({ kind: "room", label: r.name, href: `/rooms/${r.id}` });
        });

        return out;
    }, [query, rooms])();  // eslint-disable-line react-hooks/exhaustive-deps

    // Reset cursor when results change

        const activeCursor = results.length > 0 ? Math.min(cursor, results.length - 1) : 0;

    // Close on outside click
    useEffect(() => {
        function handler(e: MouseEvent) {
            if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    function navigate(href: string) {
        router.push(href);
        setQuery("");
        setOpen(false);
        inputRef.current?.blur();
    }

    function handleKey(e: React.KeyboardEvent) {
        if (!open || results.length === 0) return;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setCursor(c => Math.min(c + 1, results.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setCursor(c => Math.max(c - 1, 0));
        } else if (e.key === "Enter") {
            e.preventDefault();
                navigate(results[activeCursor].href);
        } else if (e.key === "Escape") {
            setOpen(false);
            inputRef.current?.blur();
        }
    }

    const kindLabel: Record<string, string> = { page: "Page", agent: "Agent", room: "Room" };
    const kindIcon: Record<string, string>  = { room: P.grid };

    return (
        <div ref={boxRef} style={{ position: "relative", flex: 1, maxWidth: 260 }}>
            {/* Input */}
            <span style={{
                position: "absolute", left: 10, top: "50%",
                transform: "translateY(-50%)", pointerEvents: "none",
            }}>
                <Ico d={P.search} size={13} stroke="var(--text-3)" />
            </span>

            <input
                ref={inputRef}
                type="text"
                value={query}
                placeholder="Search workspace…"
                onChange={e => { setQuery(e.target.value); setOpen(true); }}
                onFocus={() => { if (query.trim()) setOpen(true); }}
                onKeyDown={handleKey}
                style={{
                    width: "100%", height: 32,
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: open && results.length > 0 ? "8px 8px 0 0" : 8,
                    padding: "0 10px 0 30px",
                    fontSize: 13, color: "var(--text)",
                    fontFamily: "var(--font-sans)", outline: "none",
                    transition: "border-color .15s",
                }}
            />

            {/* Dropdown */}
            {open && results.length > 0 && (
                <div style={{
                    position: "absolute", top: "100%", left: 0, right: 0, zIndex: 200,
                    background: "var(--bg2)",
                    border: "1px solid var(--border)",
                    borderTop: "none",
                    borderRadius: "0 0 10px 10px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
                    overflow: "hidden",
                    maxHeight: 320,
                    overflowY: "auto",
                }}>
                    {results.map((r, i) => (
                        <button
                            key={`${r.kind}-${r.href}`}
                            onMouseEnter={() => setCursor(i)}
                            onMouseDown={e => { e.preventDefault(); navigate(r.href); }}
                            style={{
                                display: "flex", alignItems: "center", gap: 9,
                                width: "100%", padding: "8px 12px",
                                    background: activeCursor === i ? "var(--surface-h)" : "transparent",
                                border: "none", cursor: "pointer",
                                fontFamily: "var(--font-sans)",
                                textAlign: "left",
                                transition: "background .1s",
                                borderBottom: i < results.length - 1 ? "1px solid var(--border)" : "none",
                            }}
                        >
                            {/* Icon */}
                            <span style={{
                                width: 26, height: 26, borderRadius: 6, flexShrink: 0,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                background: r.kind === "agent"
                                    ? `${(r as { accent: string }).accent}18`
                                    : "var(--surface)",
                            }}>
                                {r.kind === "room"
                                    ? <Ico d={kindIcon.room} size={12} stroke="var(--text-2)" />
                                    : <Ico
                                        d={(r as { icon: string }).icon}
                                        size={12}
                                        stroke={r.kind === "agent" ? (r as { accent: string }).accent : "var(--text-2)"}
                                      />
                                }
                            </span>

                            {/* Label */}
                            <span style={{ flex: 1, fontSize: 13, color: "var(--text)", fontWeight: 400 }}>
                                {r.label}
                            </span>

                            {/* Kind badge */}
                            <span style={{
                                fontSize: 10, color: "var(--text-3)",
                                fontFamily: "var(--font-mono)",
                                textTransform: "uppercase", letterSpacing: ".08em",
                            }}>
                                {kindLabel[r.kind]}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {/* No results */}
            {open && query.trim() && results.length === 0 && (
                <div style={{
                    position: "absolute", top: "100%", left: 0, right: 0, zIndex: 200,
                    background: "var(--bg2)",
                    border: "1px solid var(--border)",
                    borderTop: "none",
                    borderRadius: "0 0 10px 10px",
                    padding: "12px 14px",
                    fontSize: 12, color: "var(--text-3)",
                    fontFamily: "var(--font-sans)",
                }}>
                    No results for &ldquo;{query}&rdquo;
                </div>
            )}
        </div>
    );
}