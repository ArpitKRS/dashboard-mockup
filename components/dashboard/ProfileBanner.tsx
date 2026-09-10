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
    /** The skill names behind overallMatch's skill half — the "biggest gap"
     *  and "skills you've built" bento tiles are built straight from these.
     *  Empty arrays (not null) when there's no role profile, matching
     *  adjacentRoles' own empty-array convention. */
    skillsMatched: string[]
    skillsGaps: string[]
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

function joinSkills(skills: string[]): string {
    if (skills.length === 1) return skills[0]
    if (skills.length === 2) return `${skills[0]} and ${skills[1]}`
    return `${skills.slice(0, -1).join(', ')}, and ${skills[skills.length - 1]}`
}

const FORK_WIDTH = 560
const FORK_HEIGHT = 220
const FORK_START_X = 28
const FORK_X = 168
const FORK_END_X = 470
const FORK_SPACING = 76

/**
 * The "adjacent paths" visual — a single trunk from where the user is now,
 * forking at one decision point into the current goal (thick, solid,
 * primary-colored) and up to two adjacent goals (thinner, dashed) branching
 * off the same fork. This is the literal metaphor Giriraj and Poh Moi Kau
 * used for this bucket in the Sep 2, 2026 sandbox — "predicting what is the
 * nearby other end goal," "the term adjacent" — drawn as an actual fork in
 * the road rather than three cards that all repeat the same ring shape.
 */
function PathForkDiagram({ mainRoleTitle, overallMatch, adjacentRoles }: { mainRoleTitle: string; overallMatch: number; adjacentRoles: AdjacentRoleMatch[] }) {
    const branches = adjacentRoles.slice(0, 2).map(r => ({ title: r.roleTitle, percent: r.percent, primary: false }))
    const primaryNode = { title: mainRoleTitle, percent: overallMatch, primary: true }
    const splitAt = Math.floor(branches.length / 2)
    const nodes = [...branches.slice(0, splitAt), primaryNode, ...branches.slice(splitAt)]

    const trunkY = FORK_HEIGHT / 2
    const totalSpan = FORK_SPACING * (nodes.length - 1)
    const firstY = trunkY - totalSpan / 2

    return (
        <div className="overflow-x-auto">
            <svg
                viewBox={`0 0 ${FORK_WIDTH} ${FORK_HEIGHT}`}
                width="100%"
                height={FORK_HEIGHT}
                style={{ minWidth: 420 }}
                role="img"
                aria-label={`From your current profile toward ${mainRoleTitle}${branches.length ? `, with ${branches.length} adjacent path${branches.length > 1 ? 's' : ''} within reach` : ''}`}
            >
                <line x1={FORK_START_X} y1={trunkY} x2={FORK_X} y2={trunkY} stroke="var(--color-pod-border)" strokeWidth={3} strokeLinecap="round" />
                <circle cx={FORK_START_X} cy={trunkY} r={5} fill="var(--color-pod-muted)" />
                <foreignObject x={FORK_START_X - 20} y={trunkY + 12} width={40} height={16}>
                    <p className="text-center text-[9px] font-bold uppercase tracking-widest text-pod-muted">You</p>
                </foreignObject>
                <circle cx={FORK_X} cy={trunkY} r={4} fill="var(--color-pod-border)" />

                {nodes.map((node, i) => {
                    const endY = firstY + i * FORK_SPACING
                    const c1x = FORK_X + (FORK_END_X - FORK_X) * 0.55
                    const path = `M ${FORK_X} ${trunkY} C ${c1x} ${trunkY}, ${c1x} ${endY}, ${FORK_END_X} ${endY}`
                    const r = node.primary ? 30 : 22
                    return (
                        <g key={node.title}>
                            <path
                                d={path}
                                fill="none"
                                stroke={node.primary ? 'var(--color-pod-primary)' : 'var(--color-pod-border)'}
                                strokeWidth={node.primary ? 3.5 : 2.5}
                                strokeDasharray={node.primary ? undefined : '5 5'}
                            />
                            <circle
                                cx={FORK_END_X} cy={endY} r={r}
                                fill={node.primary ? 'var(--color-pod-primary)' : '#FFFFFF'}
                                stroke={node.primary ? 'var(--color-pod-primary)' : 'var(--color-pod-border)'}
                                strokeWidth={2.5}
                            />
                            <foreignObject x={FORK_END_X - r} y={endY - r} width={r * 2} height={r * 2}>
                                <div className="flex h-full w-full items-center justify-center">
                                    <span className={`font-extrabold tabular-nums ${node.primary ? 'text-sm text-white' : 'text-[11px] text-pod-text'}`}>{node.percent}%</span>
                                </div>
                            </foreignObject>
                            <foreignObject x={FORK_END_X - 74} y={endY + r + 4} width={148} height={32}>
                                <p
                                    className={`text-center leading-tight ${node.primary ? 'text-[11px] font-bold text-pod-text' : 'text-[10px] font-semibold text-pod-muted'}`}
                                    title={node.title}
                                >
                                    {node.title}
                                </p>
                            </foreignObject>
                        </g>
                    )
                })}
            </svg>
        </div>
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
    skillsMatched,
    skillsGaps,
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
                    maxWidth="max-w-2xl"
                >
                    {!mainRoleTitle ? (
                        <p className="text-sm text-pod-muted">
                            Set a future goal in Personal Career Reflection to unlock a predictive recommendation.
                        </p>
                    ) : (
                        <>
                            {/* Bento layout: one big tile carries the actual
                                recommendation (the fork), two smaller tiles
                                below carry the gap it's based on — size signals
                                importance instead of every fact getting an
                                identically-sized card. */}
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                <div className="rounded-xl border border-pod-border bg-pod-bg-soft p-4 sm:col-span-3">
                                    <p className="mb-1 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-pod-muted">
                                        <TrendingUp className="h-3.5 w-3.5" /> Where this could take you
                                    </p>
                                    <PathForkDiagram mainRoleTitle={mainRoleTitle} overallMatch={overallMatch} adjacentRoles={adjacentRoles} />
                                </div>

                                <div className="rounded-xl border border-pod-border bg-emerald-50 p-4 sm:col-span-1">
                                    <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-700">Skills you&apos;ve built</p>
                                    <p className="mt-1 text-3xl font-extrabold text-emerald-700 tabular-nums">{skillsMatched.length}</p>
                                    {skillsMatched.length > 0 && (
                                        <p className="mt-1 text-xs text-emerald-800/80">{joinSkills(skillsMatched.slice(0, 3))}{skillsMatched.length > 3 ? ', …' : ''}</p>
                                    )}
                                </div>

                                <div className="rounded-xl border border-pod-border bg-amber-50 p-4 sm:col-span-2">
                                    <p className="text-[11px] font-bold uppercase tracking-widest text-amber-700">Biggest gap toward {mainRoleTitle}</p>
                                    {skillsGaps.length > 0 ? (
                                        <>
                                            <p className="mt-1 text-lg font-extrabold text-amber-800">{skillsGaps[0]}</p>
                                            {skillsGaps.length > 1 && (
                                                <p className="mt-1 text-xs text-amber-800/80">Also would help: {joinSkills(skillsGaps.slice(1, 3))}</p>
                                            )}
                                        </>
                                    ) : (
                                        <p className="mt-1 text-sm font-semibold text-amber-800">None — every required skill is already covered.</p>
                                    )}
                                </div>
                            </div>

                            {adjacentRoles.length > 0 && (
                                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    {adjacentRoles.slice(0, 2).map(role => (
                                        <div key={role.roleTitle} className="rounded-xl border border-pod-border bg-white p-4">
                                            <p className="text-[11px] font-bold uppercase tracking-widest text-pod-muted">{role.roleTitle}</p>
                                            {role.carriedSkills.length > 0 && (
                                                <p className="mt-1.5 text-xs text-pod-text">
                                                    <span className="font-semibold text-emerald-700">Carries forward:</span> {joinSkills(role.carriedSkills)}
                                                </p>
                                            )}
                                            {role.neededSkills.length > 0 && (
                                                <p className="mt-1 text-xs text-pod-text">
                                                    <span className="font-semibold text-amber-700">To learn for the shift:</span> {joinSkills(role.neededSkills)}
                                                </p>
                                            )}
                                        </div>
                                    ))}
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
