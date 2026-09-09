'use client'

import { useState } from 'react'
import { Sparkles, Download, FileUp, ClipboardList, Check, TrendingUp, ArrowRight, type LucideIcon } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import UserAvatar from '@/components/ui/UserAvatar'
import Modal from '@/components/ui/Modal'
import type { AdjacentRoleMatch } from '@/lib/futureRole'

interface ProfileBannerProps {
    firstName: string
    lastName: string
    email: string
    completionPct: number
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
    /** The three fields the Predictive Recommendation popover needs — all
     *  derived in DashboardClient (same roleProfile/skillGap/capabilityGap
     *  the Roadmap uses) and handed down already computed, so this component
     *  stays a pure renderer rather than re-deriving them itself. */
    mainRoleTitle: string | null
    overallMatch: number
    adjacentRoles: AdjacentRoleMatch[]
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
            className={`relative flex shrink-0 items-center rounded-xl border text-left transition-all duration-200 ${
                compact ? 'gap-2 px-2.5 py-2' : 'gap-3 px-4 py-4'
            } ${
                done
                    ? 'border-pod-primary-medium bg-pod-primary-light'
                    : 'border-pod-border bg-pod-bg-soft hover:border-pod-primary-medium'
            }`}
        >
            <div
                className={`shrink-0 rounded-lg flex items-center justify-center transition-all duration-200 ${compact ? 'h-6 w-6' : 'h-9 w-9'} ${
                    done ? 'bg-pod-primary text-pod-primary-foreground' : 'bg-white text-pod-primary'
                }`}
            >
                <Icon className={compact ? 'h-3 w-3' : 'h-4.5 w-4.5'} />
            </div>
            <span className={`font-semibold text-pod-text ${compact ? 'whitespace-nowrap text-xs' : 'flex-1 min-w-0 truncate text-sm'}`}>{label}</span>
            {done && (
                <span
                    className={`shrink-0 rounded-full bg-pod-primary text-pod-primary-foreground flex items-center justify-center transition-all duration-200 ${
                        compact ? 'h-3.5 w-3.5' : 'ml-auto h-5 w-5'
                    }`}
                >
                    <Check className={compact ? 'h-2 w-2' : 'h-3 w-3'} />
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
    resumeUploaded,
    resumeFileName,
    capabilityCompleted,
    onUploadResumeClick,
    onCapabilityFormClick,
    onExportClick,
    isExporting,
    mainRoleTitle,
    overallMatch,
    adjacentRoles,
}: ProfileBannerProps) {
    const fullName = [firstName, lastName].filter(Boolean).join(' ').trim() || 'Welcome'
    const isUnlocked = completionPct >= 50
    const canExport = completionPct >= 50
    const [showSuggestion, setShowSuggestion] = useState(false)

    return (
        <article className="rounded-2xl border border-pod-border bg-white shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 p-5">
                <div className="flex shrink-0 items-center gap-3">
                    <UserAvatar name={fullName} size={44} />
                    <div>
                        <h1 className="text-lg font-bold text-pod-text whitespace-nowrap">{fullName}</h1>
                        {email && <p className="text-xs text-pod-muted whitespace-nowrap">{email}</p>}
                    </div>
                </div>

                {/* Every banner action — the two setup steps and the two profile
                    actions — lives in this one right-aligned group alongside the
                    identity block above, rather than split into a second row
                    behind a divider. Sized to always fit this one row within the
                    page's max-w-5xl content width, with no horizontal scroll. */}
                <div className="flex shrink-0 items-center gap-1.5 ml-auto">
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
                    <button
                        type="button"
                        onClick={() => canExport && !isExporting && onExportClick()}
                        disabled={!canExport || isExporting}
                        title={canExport ? 'Download a PDF snapshot of your dashboard' : 'Complete at least 50% of your profile to export'}
                        className={`inline-flex shrink-0 items-center gap-1 h-9 rounded-full px-3 text-xs font-bold shadow-sm transition-colors ${
                            canExport
                                ? 'bg-white text-pod-text border border-pod-border hover:border-pod-primary-medium hover:text-pod-primary'
                                : 'bg-pod-bg-soft text-pod-muted cursor-not-allowed'
                        }`}
                    >
                        {isExporting ? <Spinner size="sm" tone="inherit" /> : <Download className="h-3.5 w-3.5" />}
                        {isExporting ? 'Preparing PDF…' : 'Share Visibility'}
                    </button>
                    <button
                        type="button"
                        onClick={() => isUnlocked && setShowSuggestion(true)}
                        disabled={!isUnlocked}
                        title={isUnlocked ? 'Get a predictive recommendation' : 'Complete at least 50% of your profile to unlock predictive recommendations'}
                        className={`inline-flex shrink-0 items-center gap-1 h-9 rounded-full px-3 text-xs font-bold shadow-sm transition-colors ${
                            isUnlocked
                                ? 'bg-pod-primary text-pod-primary-foreground hover:bg-pod-primary-hover'
                                : 'bg-pod-bg-soft text-pod-muted cursor-not-allowed'
                        }`}
                    >
                        <Sparkles className="h-3.5 w-3.5" />
                        Predictive Recommendation
                    </button>
                </div>
            </div>

            {showSuggestion && (
                <Modal
                    title="Predictive Recommendation"
                    icon={<Sparkles className="w-4 h-4 text-pod-primary" />}
                    onClose={() => setShowSuggestion(false)}
                    maxWidth="max-w-md"
                >
                    {!mainRoleTitle ? (
                        <p className="text-sm text-pod-muted">
                            Set a future goal in Personal Career Reflection to unlock a predictive recommendation.
                        </p>
                    ) : (
                        <>
                            <div className="flex items-center gap-3 pb-4 border-b border-pod-border">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-pod-primary-light">
                                    <span className="text-sm font-extrabold text-pod-primary tabular-nums">{overallMatch}%</span>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[11px] font-bold uppercase tracking-widest text-pod-muted">Your goal</p>
                                    <p className="text-sm font-bold text-pod-text truncate">{mainRoleTitle}</p>
                                    <p className="text-xs text-pod-muted">You&apos;re {overallMatch}% of the way there, based on your whole dashboard.</p>
                                </div>
                            </div>

                            {adjacentRoles.length > 0 && (
                                <div className="mt-4">
                                    <p className="mb-2.5 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-pod-muted">
                                        <TrendingUp className="h-3.5 w-3.5" /> Adjacent paths within reach
                                    </p>
                                    <div className="space-y-3">
                                        {adjacentRoles.map(role => (
                                            <div key={role.roleTitle} className="rounded-xl border border-pod-border bg-pod-bg-soft p-3.5">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="text-sm font-semibold text-pod-text">{role.roleTitle}</p>
                                                    <span className="shrink-0 text-xs font-extrabold text-pod-primary tabular-nums">{role.percent}%</span>
                                                </div>
                                                {role.carriedSkills.length > 0 && (
                                                    <p className="mt-1.5 text-[11px] text-pod-muted">
                                                        <span className="font-semibold text-emerald-700">Carries over:</span> {role.carriedSkills.join(', ')}
                                                    </p>
                                                )}
                                                {role.neededSkills.length > 0 && (
                                                    <p className="mt-1 text-[11px] text-pod-muted">
                                                        <span className="font-semibold text-amber-700">To build:</span> {role.neededSkills.join(', ')}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <p className="mt-4 inline-flex items-center gap-1 text-[11px] text-pod-muted">
                                <ArrowRight className="h-3 w-3 shrink-0" /> Map a different goal in Personal Career Reflection to see new adjacent paths.
                            </p>
                        </>
                    )}
                </Modal>
            )}
        </article>
    )
}
