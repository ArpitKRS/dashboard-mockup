'use client'

import { useState } from 'react'
import { ArrowRight, Clock3 } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import AccordionPanel from '@/components/ui/AccordionPanel'
import CapabilityGraphGrid from './CapabilityGraphGrid'
import CareerRoadmapMap from './CareerRoadmapMap'
import { getRoleSkillProfile, getArchetypeProfile, mergeRoleAndArchetype, computeSkillGap, computeCapabilityGap } from '@/lib/futureRole'
import type { CapabilityAnswers, CapabilityAnswer } from '@/lib/capabilityForm'
import type { ResumeRoleSummary } from './mockResumeData'

type PanelId = 'current-role' | 'future-role'

/** Single-select "which archetype describes your 5-10 year vision" prompt at
 *  the top of Future Role & Roadmap — the two manual reflection fields below
 *  it only appear once one of these is picked, since writing a vision
 *  statement makes more sense once there's already a starting shape for it. */
const FUTURE_ARCHETYPES = [
    { id: 'leader', emoji: '👑', title: 'The Leader', description: 'Inspire teams, drive strategy, and shape culture' },
    { id: 'innovator', emoji: '🚀', title: 'The Innovator', description: 'Build new things, push boundaries, and disrupt' },
    { id: 'expert', emoji: '🎓', title: 'The Expert', description: 'Master your craft and become a go-to authority' },
    { id: 'creator', emoji: '🎨', title: 'The Creator', description: 'Design, build, and bring ideas to life' },
    { id: 'connector', emoji: '🤝', title: 'The Connector', description: 'Build relationships, bridge gaps, and unite people' },
    { id: 'changemaker', emoji: '✨', title: 'The Changemaker', description: 'Transform systems, challenge norms, and create impact' },
]

interface ProfileCapabilityReflectionProps {
    completionPct: number
    capabilityCompleted: boolean
    capabilityAnswers: CapabilityAnswers
    skills: string[]
    interests: string[]
    resumeRoles: ResumeRoleSummary[] | null
    /** Lifted to DashboardClient (rather than owned here) so the PDF export —
     *  which needs the same role/skill-gap data — can derive it too, without
     *  threading a callback back up just to hand the computed value over. */
    submittedGoal: string | null
    onGoalSubmit: (goal: string) => void
    /** Manually-typed reflections (not derived from anything) for the Future
     *  Role & Roadmap tab — also lifted to DashboardClient for the same
     *  future-PDF-parity reason as submittedGoal. */
    personalVisionStatement: string
    onPersonalVisionStatementChange: (value: string) => void
    sixTwelveMonthPlan: string
    onSixTwelveMonthPlanChange: (value: string) => void
    /** Which FUTURE_ARCHETYPES id is picked, if any — gates whether the two
     *  fields above are shown at all. */
    futureVisionArchetype: string | null
    onFutureVisionArchetypeSelect: (archetypeId: string) => void
    onAnswerChange: (questionId: string, answer: CapabilityAnswer) => void
}

/** Small header-sized completion ring — replaces the old linear "Profile
 *  completion" bar, sitting in the accordion title row itself so the status
 *  reads at a glance even while collapsed. Grey (not the pod accent color)
 *  at exactly 0%, since a colored ring at zero progress reads as "some
 *  progress", not "none yet". */
function CompletionRing({ percent, size = 34 }: { percent: number; size?: number }) {
    const strokeWidth = 3
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const clamped = Math.max(0, Math.min(100, percent))
    const offset = circumference - (clamped / 100) * circumference
    const isZero = clamped === 0
    const trackColor = isZero ? '#E5E7EB' : 'var(--color-pod-primary-light)'
    const progressColor = isZero ? '#9CA3AF' : 'var(--color-pod-primary)'

    return (
        <span className="relative inline-flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden="true">
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={progressColor}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="transition-[stroke-dashoffset] duration-500 ease-out"
                />
            </svg>
            <span className={`absolute text-[9px] font-bold tabular-nums ${isZero ? 'text-gray-500' : 'text-pod-primary'}`}>
                {clamped}%
            </span>
        </span>
    )
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
    roles,
    skills,
    interests,
}: {
    roles: ResumeRoleSummary[] | null
    skills: string[]
    interests: string[]
}) {
    const hasRoles = Boolean(roles && roles.length > 0)
    const hasTags = skills.length > 0 || interests.length > 0
    if (!hasRoles && !hasTags) return null

    return (
        <div className="space-y-5">
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

/**
 * "Personal Career Reflection" — a left-nav / right-panel layout
 * (Current Role, and Future Role & Roadmap once the profile is complete),
 * replacing the old single-scroll Career Path card. Current Role tracks the
 * same two-step completion (resume + Capability Building Form) the rest of
 * the app already uses; only the presentation changes here. Future Role &
 * Roadmap stays locked until that reaches 100%, since there's no capability
 * self-rating to compare a goal against before then.
 */
export default function ProfileCapabilityReflection({
    completionPct,
    capabilityCompleted,
    capabilityAnswers,
    skills,
    interests,
    resumeRoles,
    submittedGoal,
    onGoalSubmit,
    personalVisionStatement,
    onPersonalVisionStatementChange,
    sixTwelveMonthPlan,
    onSixTwelveMonthPlanChange,
    futureVisionArchetype,
    onFutureVisionArchetypeSelect,
    onAnswerChange,
}: ProfileCapabilityReflectionProps) {
    const isFutureRoleUnlocked = completionPct >= 50
    const [panel, setPanel] = useState<PanelId>('current-role')
    const [isOpen, setIsOpen] = useState(true)

    const [futureGoalInput, setFutureGoalInput] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)

    // The roadmap should reflect both the role the user typed AND the
    // archetype they picked above ("Where Do You See Yourself in 5-10
    // Years?") — merged rather than whichever was filled in last, so
    // picking an archetype alone still produces a roadmap, and typing a
    // role after picking an archetype adds to it instead of replacing it.
    const baseRoleProfile = submittedGoal ? getRoleSkillProfile(submittedGoal) : null
    const archetypeProfile = getArchetypeProfile(futureVisionArchetype)
    const roleProfile = mergeRoleAndArchetype(baseRoleProfile, archetypeProfile)
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
        if (id === 'future-role' && !isFutureRoleUnlocked) return
        setPanel(id)
    }

    return (
        <AccordionPanel
            title={
                <span className="inline-flex items-center gap-2.5">
                    <CompletionRing percent={completionPct} />
                    Personal Career Reflection
                </span>
            }
            open={isOpen}
            onToggle={() => setIsOpen(current => !current)}
            className="overflow-hidden"
        >
            <div className="px-6 pt-5 pb-5">
                <p className="text-sm text-pod-muted">
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
                        disabled={!isFutureRoleUnlocked}
                        title={!isFutureRoleUnlocked ? 'Complete at least 50% of your profile to unlock' : undefined}
                        className={`flex-1 md:flex-none text-left px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                            !isFutureRoleUnlocked
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
                            <ResumeSnapshot
                                roles={resumeRoles}
                                skills={skills}
                                interests={interests}
                            />

                            {capabilityCompleted && (
                                <CapabilityGraphGrid answers={capabilityAnswers} onAnswerChange={onAnswerChange} />
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-base font-semibold text-pod-text">Where Do You See Yourself in 5-10 Years?</h3>
                                <p className="mt-1 text-sm text-pod-muted">Pick the archetype that resonates with your vision.</p>
                                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                                    {FUTURE_ARCHETYPES.map(archetype => {
                                        const selected = futureVisionArchetype === archetype.id
                                        return (
                                            <button
                                                key={archetype.id}
                                                type="button"
                                                onClick={() => onFutureVisionArchetypeSelect(archetype.id)}
                                                className={`text-left rounded-xl border p-2.5 transition-colors ${
                                                    selected
                                                        ? 'border-pod-primary bg-pod-primary-light'
                                                        : 'border-pod-border bg-pod-bg-soft hover:border-pod-primary-medium'
                                                }`}
                                            >
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-base leading-none">{archetype.emoji}</span>
                                                    <p className="text-sm font-semibold text-pod-text">{archetype.title}</p>
                                                </div>
                                                <p className="mt-1 text-xs text-pod-muted leading-snug">{archetype.description}</p>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            {futureVisionArchetype && (
                                <div className="space-y-5 max-w-xl">
                                    <div>
                                        <label htmlFor="personal-vision-input" className="block text-sm font-semibold text-pod-text mb-2">
                                            Your personal vision / goal statement <span className="font-normal text-pod-muted">(optional)</span>
                                        </label>
                                        <textarea
                                            id="personal-vision-input"
                                            value={personalVisionStatement}
                                            onChange={e => onPersonalVisionStatementChange(e.target.value)}
                                            placeholder="Summarise what you want to be — your passion and talent…"
                                            rows={3}
                                            className="w-full rounded-lg border border-pod-border bg-pod-bg-soft px-3 py-2.5 text-sm text-pod-text outline-none transition resize-y focus:border-transparent focus:ring-2 focus:ring-pod-primary"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="six-twelve-month-plan-input" className="block text-sm font-semibold text-pod-text mb-2">
                                            Plan for the next 6-12 months <span className="font-normal text-pod-muted">(optional)</span>
                                        </label>
                                        <textarea
                                            id="six-twelve-month-plan-input"
                                            value={sixTwelveMonthPlan}
                                            onChange={e => onSixTwelveMonthPlanChange(e.target.value)}
                                            placeholder="Your continuous, iterative plan in alignment with your vision…"
                                            rows={3}
                                            className="w-full rounded-lg border border-pod-border bg-pod-bg-soft px-3 py-2.5 text-sm text-pod-text outline-none transition resize-y focus:border-transparent focus:ring-2 focus:ring-pod-primary"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="border-t border-pod-border" />

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
        </AccordionPanel>
    )
}
