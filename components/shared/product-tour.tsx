"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { X, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TourStep {
    id: string;
    targetSelector?: string;
    title: string;
    description: string;
    position?: "top" | "bottom" | "left" | "right";
    isModal?: boolean;
}

interface SpotlightRect {
    top: number; left: number; width: number; height: number;
}

interface Props {
    onComplete: () => void;
    onSkip: () => void;
}

// ─── Steps ────────────────────────────────────────────────────────────────────

const STEPS: TourStep[] = [
    {
        id: "welcome",
        isModal: true,
        title: "Welcome to Studiosynq",
        description: "Your collaborative AI workspace. Rooms, tasks, focus sessions, and five AI agents — all in one place. Let's take a quick tour.",
    },
    {
        id: "rooms",
        targetSelector: "[data-tour='nav-rooms']",
        position: "right",
        title: "Rooms",
        description: "Rooms are your team's shared workspace. Create a room, invite teammates, and chat in real time with AI agents inline.",
    },
    {
        id: "tasks",
        targetSelector: "[data-tour='nav-tasks']",
        position: "right",
        title: "Task Boards",
        description: "Every room has a Kanban board. Drag tasks across Todo → In Progress → Done and stay on top of what needs to get done.",
    },
    {
        id: "focus",
        targetSelector: "[data-tour='nav-focus']",
        position: "right",
        title: "Focus Timer",
        description: "A shared Pomodoro timer for your room. 25 min focus, 5 min break. Your team sees when you're in focus mode.",
    },
    {
        id: "agents",
        targetSelector: "[data-tour='nav-agents']",
        position: "right",
        title: "Five AI Agents",
        description: "CodeBuddy, ClarityAgent, ResearchBot, DesignExpert, EmailWriter — each built for a different job. Use them standalone or call them in a room with @AgentName.",
    },
    {
        id: "stats",
        targetSelector: "[data-tour='dashboard-stats']",
        position: "bottom",
        title: "Your Activity",
        description: "Active rooms, open tasks, focus minutes, and agent runs — all tracked automatically as you work.",
    },
    {
        id: "done",
        isModal: true,
        title: "You're all set",
        description: "Create your first room, invite a teammate, and call an agent to get started. Everything works better together.",
    },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function ProductTour({ onComplete, onSkip }: Props) {
    const router = useRouter();
    const [step, setStep]                   = useState(0);
    const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);
    const [tooltipStyle, setTooltipStyle]   = useState<React.CSSProperties>({});
    const [visible, setVisible]             = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);

    const currentStep  = STEPS[step];
    const isFirst      = step === 0;
    const isLast       = step === STEPS.length - 1;
    // Progress excludes the two modals (welcome + done)
    const spotlightSteps = STEPS.filter(s => !s.isModal);
    const spotlightIndex = spotlightSteps.findIndex(s => s.id === currentStep.id);
    const progress = spotlightIndex >= 0
        ? Math.round(((spotlightIndex + 1) / spotlightSteps.length) * 100)
        : isLast ? 100 : 0;

    const updateSpotlight = useCallback(() => {
        if (!currentStep.targetSelector || currentStep.isModal) {
            setSpotlightRect(null);
            return;
        }

        const el = document.querySelector(currentStep.targetSelector) as HTMLElement;
        if (!el) { setSpotlightRect(null); return; }

        const rect    = el.getBoundingClientRect();
        const padding = 8;

        setSpotlightRect({
            top:    rect.top    - padding,
            left:   rect.left   - padding,
            width:  rect.width  + padding * 2,
            height: rect.height + padding * 2,
        });

        // Position tooltip next to spotlight
        const tooltipWidth  = 280;
        const tooltipHeight = 180;
        const margin        = 14;
        const vw            = window.innerWidth;
        const vh            = window.innerHeight;
        const pos           = currentStep.position ?? "right";

        let top  = 0;
        let left = 0;

        if (pos === "right") {
            left = rect.right  + margin;
            top  = rect.top + rect.height / 2 - tooltipHeight / 2;
        } else if (pos === "left") {
            left = rect.left   - tooltipWidth - margin;
            top  = rect.top + rect.height / 2 - tooltipHeight / 2;
        } else if (pos === "bottom") {
            top  = rect.bottom + margin;
            left = rect.left + rect.width / 2 - tooltipWidth / 2;
        } else if (pos === "top") {
            top  = rect.top    - tooltipHeight - margin;
            left = rect.left + rect.width / 2 - tooltipWidth / 2;
        }

        // Clamp inside viewport
        left = Math.max(12, Math.min(left, vw - tooltipWidth  - 12));
        top  = Math.max(12, Math.min(top,  vh - tooltipHeight - 12));

        setTooltipStyle({ position: "fixed", top, left, width: tooltipWidth });
    }, [currentStep]);

    // Animate in on step change
    useEffect(() => {
        setVisible(false);
        const t = setTimeout(() => { updateSpotlight(); setVisible(true); }, 80);
        return () => clearTimeout(t);
    }, [step, updateSpotlight]);

    useEffect(() => {
        window.addEventListener("resize", updateSpotlight);
        return () => window.removeEventListener("resize", updateSpotlight);
    }, [updateSpotlight]);

    // Keyboard nav
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === "ArrowRight" || e.key === "Enter") next();
            if (e.key === "ArrowLeft") prev();
            if (e.key === "Escape") onSkip();
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step]);

    function next() {
        if (isLast) { onComplete(); router.push("/rooms"); }
        else setStep(s => s + 1);
    }
    function prev() {
        if (!isFirst) setStep(s => s - 1);
    }

    return (
        <>
            {/* ── Overlay with cutout spotlight ── */}
            <div className="tour-overlay" aria-hidden="true">
                {spotlightRect && (
                    <div
                        className="tour-spotlight"
                        style={{
                            top:    spotlightRect.top,
                            left:   spotlightRect.left,
                            width:  spotlightRect.width,
                            height: spotlightRect.height,
                        }}
                    />
                )}
            </div>

            {/* ── Center modal (welcome / done) ── */}
            {currentStep.isModal && (
                <div className="tour-modal-wrap" role="dialog" aria-modal="true" aria-label={currentStep.title}>
                    <div className={`tour-modal${visible ? " tour-visible" : ""}`}>

                        <button className="tour-close-btn" onClick={onSkip} aria-label="Skip tour">
                            <X size={14} />
                        </button>

                        {/* Icon */}
                        <div className="tour-modal-icon">
                            <Sparkles size={20} strokeWidth={1.5} color="var(--amber)" />
                        </div>

                        <h2 className="tour-modal-title">{currentStep.title}</h2>
                        <p  className="tour-modal-desc">{currentStep.description}</p>

                        {/* Step dots */}
                        <div className="tour-dots">
                            {STEPS.map((_, i) => (
                                <button
                                    key={i}
                                    className={`tour-dot${i === step ? " active" : i < step ? " done" : ""}`}
                                    onClick={() => setStep(i)}
                                    aria-label={`Go to step ${i + 1}`}
                                />
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="tour-modal-actions">
                            {!isFirst && (
                                <button className="tour-btn-ghost" onClick={prev}>
                                    <ArrowLeft size={14} /> Back
                                </button>
                            )}
                            <button className="tour-btn-primary" onClick={next}>
                                {isLast ? "Create first room" : "Start tour"}
                                <ArrowRight size={14} />
                            </button>
                        </div>

                        {isFirst && (
                            <button className="tour-skip-text" onClick={onSkip}>
                                Skip tour
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* ── Spotlight tooltip ── */}
            {!currentStep.isModal && (
                <div
                    ref={tooltipRef}
                    className={`tour-tooltip${visible ? " tour-visible" : ""}`}
                    style={tooltipStyle}
                    role="dialog"
                    aria-modal="true"
                    aria-label={currentStep.title}
                >
                    <div className="tour-tooltip-header">
                        <span className="tour-step-counter">
                            {spotlightIndex + 1} of {spotlightSteps.length}
                        </span>
                        <button className="tour-tooltip-close" onClick={onSkip} aria-label="Skip tour">
                            <X size={12} />
                        </button>
                    </div>

                    <h3 className="tour-tooltip-title">{currentStep.title}</h3>
                    <p  className="tour-tooltip-desc">{currentStep.description}</p>

                    <div className="tour-progress-track">
                        <div className="tour-progress-fill" style={{ width: `${progress}%` }} />
                    </div>

                    <div className="tour-tooltip-nav">
                        <button className="tour-btn-ghost tour-btn-sm" onClick={prev}>
                            <ArrowLeft size={13} /> Back
                        </button>
                        <button className="tour-btn-primary tour-btn-sm" onClick={next}>
                            {step === STEPS.length - 2 ? "Finish" : "Next"} <ArrowRight size={13} />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}