"use client";

import { useId } from "react";
import { ChevronDown, Clock3 } from "lucide-react";

/**
 * Copied verbatim from osmosis/components/ui/AccordionPanel.tsx: one
 * collapsible section of a page, generic and self-contained.
 */

export interface AccordionPanelProps {
    id?: string
    /** Section name shown on the header row — usually plain text, but a
     *  ReactNode lets a caller prefix it with something like a small status
     *  indicator (e.g. ProfileCapabilityReflection's completion ring). */
    title: React.ReactNode
    /** Whether the body is currently shown. Controlled by the caller. */
    open: boolean
    onToggle: () => void
    /**
     * Renders the panel as an inert header with a note instead of a toggle —
     * for a section that has no content to open yet.
     */
    disabled?: boolean
    /** Text of the inert panel's note. */
    disabledNote?: string
    children?: React.ReactNode
    className?: string
}

export default function AccordionPanel({
    id,
    title,
    open,
    onToggle,
    disabled = false,
    disabledNote = 'Coming soon',
    children,
    className = '',
}: AccordionPanelProps) {
    const bodyId = useId()

    if (disabled) {
        return (
            <section id={id} className={`rounded-xl border border-pod-border bg-white/60 ${className}`}>
                <button
                    type="button"
                    disabled
                    aria-disabled="true"
                    className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left cursor-not-allowed"
                >
                    <h2 className="text-lg font-semibold text-pod-muted">{title}</h2>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-pod-bg-soft px-3 py-1 text-xs font-medium text-pod-muted">
                        <Clock3 aria-hidden className="h-3.5 w-3.5" />
                        {disabledNote}
                    </span>
                </button>
            </section>
        )
    }

    return (
        <section id={id} className={`rounded-xl border border-pod-border bg-white shadow-sm ${className}`}>
            <button
                type="button"
                onClick={onToggle}
                aria-expanded={open}
                aria-controls={bodyId}
                className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left cursor-pointer"
            >
                <h2 className="text-lg font-semibold text-pod-text">{title}</h2>
                <ChevronDown
                    aria-hidden
                    className={`h-5 w-5 shrink-0 text-pod-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                />
            </button>
            <div id={bodyId} hidden={!open} className="border-t border-pod-border">
                {children}
            </div>
        </section>
    )
}
