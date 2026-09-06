'use client'

import { useState } from 'react'
import {
    FileUp,
    Sparkles,
    Check,
    Pencil,
    Plus,
    X,
    Clock3,
} from 'lucide-react'
import TagInput from '@/components/ui/TagInput'
import { Spinner } from '@/components/ui/spinner'
import CapabilityInsightsCharts from './CapabilityInsightsCharts'
import CareerPathMap from './CareerPathMap'
import { getRoleSkillProfile, computeSkillGap, computeCapabilityGap } from '@/lib/futureRole'
import type { CapabilityAnswers } from '@/lib/capabilityForm'
import type { ResumeRoleSummary } from './mockResumeData'

// How long the mocked "generating required skills" state lasts before the
// path map appears — mirrors DashboardClient's resume-mock delay.
const MOCK_GOAL_GENERATION_MS = 900

interface CareerPathSectionProps {
    completionPct: number
    resumeUploaded: boolean
    resumeFileName: string | null
    capabilityCompleted: boolean
    capabilityAnswers: CapabilityAnswers
    onUploadResumeClick: () => void
    onCapabilityFormClick: () => void

    firstName: string
    skills: string[]
    interests: string[]
    resumeSummary: string | null
    resumeRoles: ResumeRoleSummary[] | null
    isEditing: boolean
    onToggleEditing: () => void
    onSkillsChange: (skills: string[]) => void
    onInterestsChange: (interests: string[]) => void
    onSummaryChange: (summary: string) => void
    onRolesChange: (roles: ResumeRoleSummary[]) => void
}

function SkillChip({ label }: { label: string }) {
    return (
        <span className="inline-flex items-center rounded-full border border-pod-border bg-pod-bg-soft px-3 py-1 text-xs font-medium text-pod-text">
            {label}
        </span>
    )
}

const EMPTY_ROLE: ResumeRoleSummary = { title: '', description: '', duration: '' }

/**
 * "Career Path" — one combined card replacing the old separate
 * ProfileCompletionHero + SkillsPanel cards, laid out as a single top-to-
 * bottom story rather than squeezed side-by-side columns: Current Role first
 * (full width, its own two-column split once complete — profile on the
 * left, capability chart on the right), then Future Goal below it. Two
 * steps (resume + capability questionnaire) still define the current-role
 * profile and its 0–100% completion; the goal field is independent of that
 * percentage and stays visible either way. Once a goal is submitted,
 * CareerPathMap compares it against BOTH the resume-derived technical
 * skills and the capability questionnaire's soft-skill self-ratings — not
 * technical skills alone. All AI-sounding output is mocked.
 */
export default function CareerPathSection({
    completionPct,
    resumeUploaded,
    resumeFileName,
    capabilityCompleted,
    capabilityAnswers,
    onUploadResumeClick,
    onCapabilityFormClick,
    firstName,
    skills,
    interests,
    resumeSummary,
    resumeRoles,
    isEditing,
    onToggleEditing,
    onSkillsChange,
    onInterestsChange,
    onSummaryChange,
    onRolesChange,
}: CareerPathSectionProps) {
    const isFullyComplete = completionPct === 100

    const [futureGoalInput, setFutureGoalInput] = useState('')
    const [submittedGoal, setSubmittedGoal] = useState<string | null>(null)
    const [isGenerating, setIsGenerating] = useState(false)

    const roleProfile = submittedGoal ? getRoleSkillProfile(submittedGoal) : null
    const skillGap = roleProfile ? computeSkillGap(skills, roleProfile.requiredSkills) : null
    const capabilityGap = roleProfile ? computeCapabilityGap(capabilityAnswers, roleProfile.requiredCapabilities) : null

    const handleGenerate = () => {
        const goal = futureGoalInput.trim()
        if (!goal || isGenerating) return
        setIsGenerating(true)
        setTimeout(() => {
            setSubmittedGoal(goal)
            setIsGenerating(false)
        }, MOCK_GOAL_GENERATION_MS)
    }

    const hasResumeSummary = Boolean(resumeSummary) || Boolean(resumeRoles && resumeRoles.length > 0)
    const hasSkillsOrInterests = skills.length > 0 || interests.length > 0

    const updateRole = (index: number, next: ResumeRoleSummary) => {
        onRolesChange((resumeRoles || []).map((role, i) => (i === index ? next : role)))
    }
    const removeRole = (index: number) => {
        onRolesChange((resumeRoles || []).filter((_, i) => i !== index))
    }
    const addRole = () => {
        onRolesChange([...(resumeRoles || []), EMPTY_ROLE])
    }

    return (
        <article className="rounded-2xl border border-pod-border bg-white shadow-sm p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <h2 className="text-lg font-semibold text-pod-text">Career Path</h2>

                <div className="flex flex-wrap items-center gap-2">
                    {isFullyComplete && (
                        <>
                            <button
                                type="button"
                                onClick={onUploadResumeClick}
                                title={resumeFileName || 'Resume'}
                                className="inline-flex items-center gap-2 rounded-full border border-pod-border bg-pod-bg-soft pl-3 pr-4 py-1.5 text-xs font-medium text-pod-text hover:border-pod-primary-medium transition-colors"
                            >
                                <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                <span className="truncate max-w-40">{resumeFileName || 'Resume'}</span>
                                <span className="text-pod-primary font-semibold">Edit</span>
                            </button>
                            <button
                                type="button"
                                onClick={onCapabilityFormClick}
                                className="inline-flex items-center gap-2 rounded-full border border-pod-border bg-pod-bg-soft pl-3 pr-4 py-1.5 text-xs font-medium text-pod-text hover:border-pod-primary-medium transition-colors"
                            >
                                <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                Capability Questionnaire
                                <span className="text-pod-primary font-semibold">Edit</span>
                            </button>
                        </>
                    )}
                    <span className="text-sm font-bold text-pod-primary">{completionPct}% complete</span>
                </div>
            </div>

            <p className="text-sm text-pod-muted mb-4">
                Build your current profile, then map it against where you want to go next.
            </p>

            {!isFullyComplete && (
                <div className="h-2 w-full rounded-full bg-pod-primary/10 overflow-hidden mb-6">
                    <div
                        className="h-full rounded-full bg-pod-primary transition-all duration-500"
                        style={{ width: `${Math.min(completionPct, 100)}%` }}
                    />
                </div>
            )}

            {/* Current Role */}
            <section>
                <h3 className="text-xs font-bold uppercase tracking-widest text-pod-muted mb-4">Current Role</h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-5 min-w-0">
                        {!resumeUploaded ? (
                            <div className="flex items-start gap-3 rounded-xl border border-pod-border bg-pod-bg-soft p-4">
                                <div className="mt-0.5 h-8 w-8 shrink-0 rounded-lg flex items-center justify-center bg-pod-primary-light text-pod-primary">
                                    <FileUp className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-pod-text">Upload your resume</p>
                                    <p className="text-xs text-pod-muted mb-2">
                                        We&apos;ll pull out your skills, interests and a role summary automatically.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={onUploadResumeClick}
                                        className="text-xs font-semibold text-pod-primary hover:text-pod-primary-hover transition-colors"
                                    >
                                        Upload resume →
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                            {(hasResumeSummary || isEditing) && (
                                <div>
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        <p className="text-sm font-semibold text-pod-text">
                                            {firstName ? `${firstName}'s Resume Summary` : 'Resume Summary'}
                                        </p>
                                        {!isEditing && hasResumeSummary && (
                                            <button
                                                type="button"
                                                onClick={onToggleEditing}
                                                className="inline-flex items-center gap-1 text-xs font-semibold text-pod-muted hover:text-pod-text transition-colors"
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                                Edit
                                            </button>
                                        )}
                                    </div>

                                    {isEditing ? (
                                        <textarea
                                            value={resumeSummary || ''}
                                            onChange={e => onSummaryChange(e.target.value)}
                                            rows={3}
                                            placeholder="A short summary about your resume…"
                                            className="w-full rounded-lg border border-pod-border bg-pod-bg-soft px-3 py-2 text-sm text-pod-text mb-3 resize-none focus:outline-none focus:ring-2 focus:ring-pod-primary/50"
                                        />
                                    ) : (
                                        resumeSummary && <p className="text-sm text-pod-muted mb-3">{resumeSummary}</p>
                                    )}

                                    <div className="space-y-3">
                                        {(resumeRoles || []).map((role, i) => (
                                            isEditing ? (
                                                <div key={i} className="rounded-xl border border-pod-border bg-pod-bg-soft p-4 space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            value={role.title}
                                                            onChange={e => updateRole(i, { ...role, title: e.target.value })}
                                                            placeholder="Role title"
                                                            className="flex-1 min-w-0 rounded-md border border-pod-border bg-white px-3 py-1.5 text-sm font-semibold text-pod-text focus:outline-none focus:ring-2 focus:ring-pod-primary/50"
                                                        />
                                                        <input
                                                            value={role.duration}
                                                            onChange={e => updateRole(i, { ...role, duration: e.target.value })}
                                                            placeholder="Duration"
                                                            className="w-28 shrink-0 rounded-md border border-pod-border bg-white px-2 py-1.5 text-xs text-pod-text focus:outline-none focus:ring-2 focus:ring-pod-primary/50"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeRole(i)}
                                                            aria-label="Remove role"
                                                            className="shrink-0 text-pod-muted hover:text-red-600 transition-colors"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                    <textarea
                                                        value={role.description}
                                                        onChange={e => updateRole(i, { ...role, description: e.target.value })}
                                                        rows={2}
                                                        placeholder="What did this role involve?"
                                                        className="w-full rounded-md border border-pod-border bg-white px-3 py-1.5 text-xs text-pod-text resize-none focus:outline-none focus:ring-2 focus:ring-pod-primary/50"
                                                    />
                                                </div>
                                            ) : (
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
                                            )
                                        ))}
                                    </div>

                                    {isEditing && (
                                        <button
                                            type="button"
                                            onClick={addRole}
                                            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-pod-primary hover:text-pod-primary-hover transition-colors"
                                        >
                                            <Plus className="h-3.5 w-3.5" /> Add role
                                        </button>
                                    )}
                                </div>
                            )}

                            <div>
                                <div className="flex items-center justify-between gap-2 mb-3">
                                    <p className="text-sm font-semibold text-pod-text">Skills &amp; Interests</p>
                                    {!isEditing && (
                                        <button
                                            type="button"
                                            onClick={onToggleEditing}
                                            className="inline-flex items-center gap-1 text-xs font-semibold text-pod-muted hover:text-pod-text transition-colors"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                            Edit
                                        </button>
                                    )}
                                </div>

                                {isEditing ? (
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-xs font-bold text-pod-muted uppercase tracking-widest mb-2">Skills</p>
                                            <TagInput value={skills} onChange={onSkillsChange} label="Skills" placeholder="Add a skill and hit Enter" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-pod-muted uppercase tracking-widest mb-2">Interests</p>
                                            <TagInput value={interests} onChange={onInterestsChange} label="Interests" placeholder="Add an interest and hit Enter" />
                                        </div>
                                        <div className="flex justify-end">
                                            <button
                                                type="button"
                                                onClick={onToggleEditing}
                                                className="px-5 py-2 rounded-lg bg-pod-primary text-pod-primary-foreground text-sm font-bold hover:bg-pod-primary-hover transition"
                                            >
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                ) : hasSkillsOrInterests ? (
                                    <div className="space-y-3">
                                        {skills.length > 0 && (
                                            <div>
                                                <p className="text-xs font-bold text-pod-muted uppercase tracking-widest mb-2">Skills</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {skills.map(skill => <SkillChip key={skill} label={skill} />)}
                                                </div>
                                            </div>
                                        )}
                                        {interests.length > 0 && (
                                            <div>
                                                <p className="text-xs font-bold text-pod-muted uppercase tracking-widest mb-2">Interests</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {interests.map(interest => <SkillChip key={interest} label={interest} />)}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-sm text-pod-muted">No skills or interests yet.</p>
                                )}
                            </div>
                            </>
                        )}
                    </div>

                    <div className="min-w-0">
                        {capabilityCompleted ? (
                            <CapabilityInsightsCharts answers={capabilityAnswers} />
                        ) : (
                            <div className="flex items-start gap-3 rounded-xl border border-pod-border bg-pod-bg-soft p-4">
                                <div className="mt-0.5 h-8 w-8 shrink-0 rounded-lg flex items-center justify-center bg-pod-primary-light text-pod-primary">
                                    <Sparkles className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-pod-text">Capability Building Questionnaire</p>
                                    <p className="text-xs text-pod-muted mb-2">
                                        A few quick questions, charted into your capability snapshot.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={onCapabilityFormClick}
                                        className="text-xs font-semibold text-pod-primary hover:text-pod-primary-hover transition-colors"
                                    >
                                        Start questionnaire →
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <div className="my-8 border-t border-pod-border" />

            {/* Future Goal */}
            <section>
                <h3 className="text-xs font-bold uppercase tracking-widest text-pod-muted mb-4">Future Goal</h3>

                <div className="max-w-xl">
                    <label htmlFor="future-goal-input" className="sr-only">Future goal</label>
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
                            aria-label={submittedGoal ? 'Regenerate required skills' : 'Generate required skills'}
                            className="shrink-0 inline-flex items-center justify-center rounded-lg bg-pod-primary px-3.5 text-pod-primary-foreground hover:bg-pod-primary-hover transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isGenerating ? <Spinner size="sm" tone="inherit" className="text-white" /> : <Sparkles className="h-4 w-4" />}
                        </button>
                    </div>
                    <p className="mt-1.5 text-xs text-pod-muted">
                        Tell us the role you&apos;re working toward and we&apos;ll map it against your resume skills and your Capability Questionnaire.
                    </p>
                </div>

                {roleProfile && skillGap && capabilityGap && (
                    <div className="mt-5">
                        <CareerPathMap roleTitle={roleProfile.roleTitle} skillGap={skillGap} capabilityGap={capabilityGap} />
                    </div>
                )}
            </section>
        </article>
    )
}
