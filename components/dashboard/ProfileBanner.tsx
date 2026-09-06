'use client'

import { useState } from 'react'
import { Sparkles, X, Download } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import UserAvatar from '@/components/ui/UserAvatar'
import { getCapabilitySuggestion } from '@/lib/capabilitySuggestions'
import type { CapabilityAnswers } from '@/lib/capabilityForm'

interface ProfileBannerProps {
    firstName: string
    lastName: string
    email: string
    completionPct: number
    capabilityAnswers: CapabilityAnswers
    /** Actual PDF generation (@react-pdf/renderer) lives in DashboardClient,
     *  which already owns/derives every field the document needs — this
     *  component only renders the button and reports clicks. */
    onExportClick: () => void
    isExporting: boolean
}

/**
 * LinkedIn-style identity banner: a cover strip, an overlapping avatar, and
 * name + email underneath, plus two buttons — AI (a canned capability
 * suggestion, see lib/capabilitySuggestions.ts, unlocked at 100% since there
 * isn't a full self-rating set to base one on before then) and Export
 * Profile (a real PDF via @react-pdf/renderer, unlocked at 50% — there's
 * enough filled in by then to be worth sharing).
 *
 * Adapted from osmosis/app/pod/[subdomain]/explore/dashboard/ProfileBanner.tsx:
 * `userImage`/`accessToken` are dropped since this mock-up has no auth/session
 * and UserAvatar always renders its fallback icon here.
 */
export default function ProfileBanner({
    firstName,
    lastName,
    email,
    completionPct,
    capabilityAnswers,
    onExportClick,
    isExporting,
}: ProfileBannerProps) {
    const fullName = [firstName, lastName].filter(Boolean).join(' ').trim() || 'Welcome'
    const isUnlocked = completionPct === 100
    const canExport = completionPct >= 50
    const [showSuggestion, setShowSuggestion] = useState(false)

    const suggestion = isUnlocked ? getCapabilitySuggestion(capabilityAnswers) : null

    return (
        <article className="rounded-2xl border border-pod-border bg-white shadow-sm overflow-hidden">
            <div className="relative h-24 bg-gradient-to-r from-pod-primary-light via-pod-primary/20 to-pod-primary-light">
                <div className="absolute top-3 right-3 flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => canExport && !isExporting && onExportClick()}
                        disabled={!canExport || isExporting}
                        title={canExport ? 'Download a PDF snapshot of your dashboard' : 'Complete at least 50% of your profile to export'}
                        className={`inline-flex items-center gap-1.5 h-11 rounded-full px-4 text-xs font-bold shadow-sm transition-colors ${
                            canExport
                                ? 'bg-white text-pod-text border border-pod-border hover:border-pod-primary-medium hover:text-pod-primary'
                                : 'bg-white/70 text-pod-muted cursor-not-allowed'
                        }`}
                    >
                        {isExporting ? <Spinner size="sm" tone="inherit" /> : <Download className="h-3.5 w-3.5" />}
                        {isExporting ? 'Preparing PDF…' : 'Export Profile'}
                    </button>
                    <button
                        type="button"
                        onClick={() => isUnlocked && setShowSuggestion(true)}
                        disabled={!isUnlocked}
                        title={isUnlocked ? 'Get an AI capability suggestion' : 'Complete your profile to unlock AI suggestions'}
                        className={`h-11 w-11 rounded-full flex items-center justify-center text-xs font-bold shadow-sm transition-colors ${
                            isUnlocked
                                ? 'bg-pod-primary text-pod-primary-foreground hover:bg-pod-primary-hover'
                                : 'bg-white/70 text-pod-muted cursor-not-allowed'
                        }`}
                    >
                        AI
                    </button>
                </div>
            </div>
            <div className="px-6 pb-6">
                <div className="-mt-6 flex items-end gap-4">
                    <UserAvatar
                        name={fullName}
                        size={80}
                        className="border-4 border-white shadow-sm"
                    />
                    <div className="pb-1">
                        <h1 className="text-xl font-bold text-pod-text">{fullName}</h1>
                        {email && <p className="text-sm text-pod-muted">{email}</p>}
                    </div>
                </div>
            </div>

            {showSuggestion && (
                <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setShowSuggestion(false)} aria-hidden="true" />
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-label="AI capability suggestion"
                        className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden"
                    >
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-pod-primary">
                                <Sparkles className="h-3.5 w-3.5" /> AI Suggestion
                            </span>
                            <button type="button" onClick={() => setShowSuggestion(false)} aria-label="Close" className="text-pod-muted hover:text-pod-text transition">
                                <X className="w-4.5 h-4.5" />
                            </button>
                        </div>
                        <div className="px-5 py-6">
                            {suggestion ? (
                                <>
                                    <h3 className="text-base font-bold text-pod-text mb-1.5">{suggestion.title}</h3>
                                    <p className="text-sm text-pod-muted leading-relaxed">{suggestion.message}</p>
                                    <p className="mt-4 text-[11px] font-semibold uppercase tracking-widest text-pod-muted">
                                        Based on your {suggestion.category} self-rating ({suggestion.currentLevel}/5)
                                    </p>
                                </>
                            ) : (
                                <p className="text-sm text-pod-muted">Complete your Capability Building Form to get a personalized suggestion.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </article>
    )
}
