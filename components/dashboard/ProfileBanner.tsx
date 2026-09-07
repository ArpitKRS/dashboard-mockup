'use client'

import { useState } from 'react'
import { Sparkles, X, Download, FileUp, ClipboardList, Check, type LucideIcon } from 'lucide-react'
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
    resumeUploaded: boolean
    resumeFileName: string | null
    capabilityCompleted: boolean
    onUploadResumeClick: () => void
    onCapabilityFormClick: () => void
    /** Actual PDF generation (@react-pdf/renderer) lives in DashboardClient,
     *  which already owns/derives every field the document needs — this
     *  component only renders the button and reports clicks. */
    onExportClick: () => void
    isExporting: boolean
}

/** `compact` shrinks the card once both steps are done — at that point it's
 *  no longer the thing asking for attention, just a quiet "redo this?"
 *  affordance, so its `title` doubles as that hint on hover. Moved here from
 *  ProfileCapabilityReflection along with the two buttons it renders — both
 *  are identity/setup actions, so they belong with the rest of the banner. */
function StepCard({
    label,
    done,
    compact,
    icon: Icon,
    onClick,
    title,
}: {
    label: string
    done: boolean
    compact: boolean
    icon: LucideIcon
    onClick: () => void
    title?: string
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={`relative flex items-center gap-3 rounded-xl border text-left transition-all duration-200 ${
                compact ? 'px-3 py-2.5' : 'px-4 py-4'
            } ${
                done
                    ? 'border-pod-primary-medium bg-pod-primary-light'
                    : 'border-pod-border bg-pod-bg-soft hover:border-pod-primary-medium'
            }`}
        >
            <div
                className={`shrink-0 rounded-lg flex items-center justify-center transition-all duration-200 ${compact ? 'h-7 w-7' : 'h-9 w-9'} ${
                    done ? 'bg-pod-primary text-pod-primary-foreground' : 'bg-white text-pod-primary'
                }`}
            >
                <Icon className={compact ? 'h-3.5 w-3.5' : 'h-4.5 w-4.5'} />
            </div>
            <span className={`flex-1 min-w-0 truncate font-semibold text-pod-text ${compact ? 'text-xs' : 'text-sm'}`}>{label}</span>
            {done && (
                <span
                    className={`ml-auto shrink-0 rounded-full bg-pod-primary text-pod-primary-foreground flex items-center justify-center transition-all duration-200 ${
                        compact ? 'h-4 w-4' : 'h-5 w-5'
                    }`}
                >
                    <Check className={compact ? 'h-2.5 w-2.5' : 'h-3 w-3'} />
                </span>
            )}
        </button>
    )
}

/**
 * A simple identity card: avatar, name + email, and the Export/AI actions on
 * one plain row — no cover-photo strip, no overlapping avatar. The two setup
 * entry points (Resume upload, Capability Building Form) live below it, since
 * they're identity/setup actions too.
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
    resumeUploaded,
    resumeFileName,
    capabilityCompleted,
    onUploadResumeClick,
    onCapabilityFormClick,
    onExportClick,
    isExporting,
}: ProfileBannerProps) {
    const fullName = [firstName, lastName].filter(Boolean).join(' ').trim() || 'Welcome'
    const isUnlocked = completionPct >= 50
    const canExport = completionPct >= 50
    const [showSuggestion, setShowSuggestion] = useState(false)

    const suggestion = isUnlocked ? getCapabilitySuggestion(capabilityAnswers) : null

    return (
        <article className="rounded-2xl border border-pod-border bg-white shadow-sm overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-4 p-6">
                <div className="flex items-center gap-4">
                    <UserAvatar name={fullName} size={56} />
                    <div>
                        <h1 className="text-xl font-bold text-pod-text">{fullName}</h1>
                        {email && <p className="text-sm text-pod-muted">{email}</p>}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => canExport && !isExporting && onExportClick()}
                        disabled={!canExport || isExporting}
                        title={canExport ? 'Download a PDF snapshot of your dashboard' : 'Complete at least 50% of your profile to export'}
                        className={`inline-flex items-center gap-1.5 h-11 rounded-full px-4 text-xs font-bold shadow-sm transition-colors ${
                            canExport
                                ? 'bg-white text-pod-text border border-pod-border hover:border-pod-primary-medium hover:text-pod-primary'
                                : 'bg-pod-bg-soft text-pod-muted cursor-not-allowed'
                        }`}
                    >
                        {isExporting ? <Spinner size="sm" tone="inherit" /> : <Download className="h-3.5 w-3.5" />}
                        {isExporting ? 'Preparing PDF…' : 'Export Profile'}
                    </button>
                    <button
                        type="button"
                        onClick={() => isUnlocked && setShowSuggestion(true)}
                        disabled={!isUnlocked}
                        title={isUnlocked ? 'Get an AI capability suggestion' : 'Complete at least 50% of your profile to unlock AI suggestions'}
                        className={`h-11 w-11 rounded-full flex items-center justify-center text-xs font-bold shadow-sm transition-colors ${
                            isUnlocked
                                ? 'bg-pod-primary text-pod-primary-foreground hover:bg-pod-primary-hover'
                                : 'bg-pod-bg-soft text-pod-muted cursor-not-allowed'
                        }`}
                    >
                        AI
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-pod-border p-6">
                <StepCard
                    label={resumeUploaded ? (resumeFileName ?? 'Resume uploaded') : 'Resume upload'}
                    done={resumeUploaded}
                    compact={completionPct === 100}
                    icon={FileUp}
                    onClick={onUploadResumeClick}
                    title={completionPct === 100 ? 'Want to upload a new resume?' : (resumeFileName ?? undefined)}
                />
                <StepCard
                    label="Capability Building Form"
                    done={capabilityCompleted}
                    compact={completionPct === 100}
                    icon={ClipboardList}
                    onClick={onCapabilityFormClick}
                    title={completionPct === 100 ? 'Want to re-fill the form?' : undefined}
                />
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
                                        Based on your {suggestion.category} self-rating ({suggestion.currentLevel.toFixed(1)}/{suggestion.max})
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
