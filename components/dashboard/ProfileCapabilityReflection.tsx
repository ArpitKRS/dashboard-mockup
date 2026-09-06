'use client'

import { useState } from 'react'
import { FileUp, ClipboardList, Check, ArrowRight, Clock3, type LucideIcon } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import CapabilityGraphGrid from './CapabilityGraphGrid'
import CareerRoadmapMap from './CareerRoadmapMap'
import { getRoleSkillProfile, computeSkillGap, computeCapabilityGap } from '@/lib/futureRole'
import type { CapabilityAnswers, CapabilityAnswer } from '@/lib/capabilityForm'
import type { ResumeRoleSummary } from './mockResumeData'

type PanelId = 'current-role' | 'future-role'

interface ProfileCapabilityReflectionProps {
    completionPct: number
    resumeUploaded: boolean
    resumeFileName: string | null
    capabilityCompleted: boolean
    capabilityAnswers: CapabilityAnswers
    skills: string[]
    interests: string[]
    resumeSummary: string | null
    resumeRoles: ResumeRoleSummary[] | null
    /** Lifted to DashboardClient (rather than owned here) so the PDF export —
     *  which needs the same role/skill-gap data — can derive it too, without
     *  threading a callback back up just to hand the computed value over. */
    submittedGoal: string | null
    onGoalSubmit: (goal: string) => void
    onUploadResumeClick: () => void
    onCapabilityFormClick: () => void
    onAnswerChange: (questionId: string, answer: CapabilityAnswer) => void
}

function TagChip({ label }: { label: string }) {
    return (
        <span className="inline-flex items-center rounded-full border border-pod-border bg-pod-bg-soft px-3 py-1 text-xs font-medium text-pod-text">
            {label}
        </span>
    )
}

/** The resume-derived half of the profile, read-only here — editing lives on
 *  the Capability Building Form / re-upload flow, not inline in this view. */
function ResumeSnapshot({
    summary,
    roles,
    skills,
    interests,
}: {
    summary: string | null
    roles: ResumeRoleSummary[] | null
    skills: string[]
    interests: string[]
}) {
    const hasRoles = Boolean(roles && roles.length > 0)
    const hasTags = skills.length > 0 || interests.length > 0
    if (!summary && !hasRoles && !hasTags) return null

    return (
        <div className="space-y-5">
            {summary && (
                <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-pod-muted mb-2">Summary</p>
                    <p className="text-sm text-pod-text leading-relaxed">{summary}</p>
                </div>
            )}

            {hasRoles && (
                <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-pod-muted mb-2.5">Experience</p>
                    <div className="space-y-3">
                        {roles!.map((role, i) => (
                            <div key={i} className="rounded-xl border border-pod-border bg-pod-bg-soft p-4">
                                <div className="flex items-center justify-between gap-3 mb-1">
                                    <p className="text-sm font-semibold text-pod-text">{role.title}</p>
                                    <span className="inline-flex items-center gap-1 shrink-0 rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-pod-muted">
                                        <Clock3 aria-hidden className="h-3 w-3" />
                                        {role.duration}
                                    </span>
                                </div>
                                <p className="text-xs text-pod-muted">{role.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {hasTags && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {skills.length > 0 && (
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-pod-muted mb-2">Skills</p>
                            <div className="flex flex-wrap gap-2">
                                {skills.map(skill => <TagChip key={skill} label={skill} />)}
                            </div>
                        </div>
                    )}
                    {interests.length > 0 && (
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-pod-muted mb-2">Interests</p>
                            <div className="flex flex-wrap gap-2">
                                {interests.map(interest => <TagChip key={interest} label={interest} />)}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

// How long the mocked "matching your goal" state lasts before the roadmap
// appears — mirrors DashboardClient's resume-mock delay.
const MOCK_GOAL_GENERATION_MS = 900

/** `compact` shrinks the card once both steps are done — at that point it's
 *  no longer the thing asking for attention, just a quiet "redo this?"
 *  affordance, so its `title` doubles as that hint on hover. */
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
 * "Profile Capability Reflection" — a left-nav / right-panel layout
 * (Current Role, and Future Role & Roadmap once the profile is complete),
 * replacing the old single-scroll Career Path card. Current Role tracks the
 * same two-step completion (resume + Capability Building Form) the rest of
 * the app already uses; only the presentation changes here. Future Role &
 * Roadmap stays locked until that reaches 100%, since there's no capability
 * self-rating to compare a goal against before then.
 */
export default function ProfileCapabilityReflection({
    completionPct,
    resumeUploaded,
    resumeFileName,
    capabilityCompleted,
    capabilityAnswers,
    skills,
    interests,
    resumeSummary,
    resumeRoles,
    submittedGoal,
    onGoalSubmit,
    onUploadResumeClick,
    onCapabilityFormClick,
    onAnswerChange,
}: ProfileCapabilityReflectionProps) {
    const isFullyComplete = completionPct === 100
    const [panel, setPanel] = useState<PanelId>('current-role')

    const [futureGoalInput, setFutureGoalInput] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)

    const roleProfile = submittedGoal ? getRoleSkillProfile(submittedGoal) : null
    const skillGap = roleProfile ? computeSkillGap(skills, roleProfile.requiredSkills) : null
    const capabilityGap = roleProfile ? computeCapabilityGap(capabilityAnswers, roleProfile.requiredCapabilities) : null

    const handleGenerate = () => {
        const goal = futureGoalInput.trim()
        if (!goal || isGenerating) return
        setIsGenerating(true)
        setTimeout(() => {
            onGoalSubmit(goal)
            setIsGenerating(false)
        }, MOCK_GOAL_GENERATION_MS)
    }

    const selectPanel = (id: PanelId) => {
        if (id === 'future-role' && !isFullyComplete) return
        setPanel(id)
    }

    return (
        <article className="rounded-2xl border border-pod-border bg-white shadow-sm overflow-hidden">
            <div className="px-6 pt-6 pb-5">
                <h2 className="text-lg font-semibold text-pod-text">Profile Capability Reflection</h2>
                <p className="text-sm text-pod-muted mt-1">
                    Build your current profile, then map it against where you want to go next.
                </p>
            </div>

            <div className="flex flex-col md:flex-row border-t border-pod-border">
                <nav className="md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-pod-border p-3 flex md:flex-col gap-1">
                    <button
                        type="button"
                        onClick={() => selectPanel('current-role')}
                        className={`flex-1 md:flex-none text-left px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                            panel === 'current-role' ? 'text-pod-primary' : 'text-pod-text hover:bg-pod-bg-soft'
                        }`}
                    >
                        Current Role
                    </button>
                    <button
                        type="button"
                        onClick={() => selectPanel('future-role')}
                        disabled={!isFullyComplete}
                        title={!isFullyComplete ? 'Complete your profile to unlock' : undefined}
                        className={`flex-1 md:flex-none text-left px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                            !isFullyComplete
                                ? 'text-pod-muted/50 cursor-not-allowed'
                                : panel === 'future-role' ? 'text-pod-primary' : 'text-pod-text hover:bg-pod-bg-soft'
                        }`}
                    >
                        Future Role &amp; Roadmap
                    </button>
                </nav>

                <div className="flex-1 min-w-0 p-6">
                    {panel === 'current-role' ? (
                        <div className="space-y-6">
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-sm font-semibold text-pod-text">Profile completion</span>
                                    <span className="text-sm font-bold text-pod-primary">{completionPct}%</span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-pod-primary/10 overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-pod-primary transition-all duration-500"
                                        style={{ width: `${completionPct}%` }}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                            {resumeUploaded && (
                                <ResumeSnapshot summary={resumeSummary} roles={resumeRoles} skills={skills} interests={interests} />
                            )}

                            {capabilityCompleted && (
                                <CapabilityGraphGrid answers={capabilityAnswers} onAnswerChange={onAnswerChange} />
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="max-w-xl">
                                <label htmlFor="future-goal-input" className="sr-only">Future role</label>
                                <div className="flex gap-2">
                                    <input
                                        id="future-goal-input"
                                        type="text"
                                        value={futureGoalInput}
                                        onChange={e => setFutureGoalInput(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter') handleGenerate() }}
                                        placeholder="e.g. Senior Software Engineer"
                                        className="flex-1 min-w-0 rounded-lg border border-pod-border bg-pod-bg-soft px-3 py-2.5 text-sm text-pod-text outline-none transition focus:border-transparent focus:ring-2 focus:ring-pod-primary"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleGenerate}
                                        disabled={!futureGoalInput.trim() || isGenerating}
                                        aria-label={submittedGoal ? 'Re-map required skills' : 'Map required skills'}
                                        className="shrink-0 inline-flex items-center justify-center rounded-lg bg-pod-primary px-3.5 text-pod-primary-foreground hover:bg-pod-primary-hover transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isGenerating ? <Spinner size="sm" tone="inherit" className="text-white" /> : <ArrowRight className="h-4 w-4" />}
                                    </button>
                                </div>
                                <p className="mt-1.5 text-xs text-pod-muted">
                                    Tell us the role you&apos;re working toward and we&apos;ll map it against your resume skills and your Capability Questionnaire.
                                </p>
                            </div>

                            {roleProfile && skillGap && capabilityGap && (
                                <CareerRoadmapMap roleTitle={roleProfile.roleTitle} skillGap={skillGap} capabilityGap={capabilityGap} />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </article>
    )
}
