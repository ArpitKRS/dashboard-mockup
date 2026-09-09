'use client'

import { X } from 'lucide-react'

interface ModalProps {
    title: string
    subtitle?: string
    icon?: React.ReactNode
    onClose: () => void
    children: React.ReactNode
    footer?: React.ReactNode
    /** Tailwind max-w-* class for the dialog's width. */
    maxWidth?: string
}

/**
 * Shared "big" dialog shell — header (icon + title/subtitle + close),
 * scrollable body, optional footer bar. Extracted from the shape
 * CapabilityBuildingForm already used inline, so every popup added after it
 * (Achievements, Certificates, Letters of Recommendation, Invite Peers,
 * Predictive Recommendation) shares one visual language instead of each
 * hand-rolling its own header/close button — same header-icon-box +
 * title/subtitle pattern osmosis's SurveyAssignModal uses.
 */
export default function Modal({ title, subtitle, icon, onClose, children, footer, maxWidth = 'max-w-lg' }: ModalProps) {
    return (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
            <div
                role="dialog"
                aria-modal="true"
                aria-label={title}
                className={`relative flex w-full ${maxWidth} max-h-[88vh] flex-col overflow-hidden rounded-2xl bg-white shadow-xl`}
            >
                <div className="flex shrink-0 items-center gap-3 px-6 py-4 border-b border-gray-100">
                    {icon && (
                        <div className="w-9 h-9 rounded-lg bg-pod-primary-light flex items-center justify-center shrink-0">
                            {icon}
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <h2 className="text-base font-bold text-pod-text leading-tight">{title}</h2>
                        {subtitle && <p className="text-xs text-pod-muted mt-0.5">{subtitle}</p>}
                    </div>
                    <button type="button" onClick={onClose} aria-label="Close" className="text-pod-muted hover:text-pod-text transition shrink-0">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
                    {children}
                </div>

                {footer && (
                    <div className="flex shrink-0 items-center justify-end gap-3 px-6 py-4 border-t border-pod-border bg-pod-bg-soft">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    )
}
