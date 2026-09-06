'use client'

import { Clock3, X, Plus, Pencil } from 'lucide-react'
import TagInput from '@/components/ui/TagInput'
import type { ResumeRoleSummary } from './mockResumeData'

interface SkillsPanelProps {
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

/** Copied verbatim from osmosis/app/pod/[subdomain]/explore/dashboard/SkillsPanel.tsx. */
export default function SkillsPanel({
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
}: SkillsPanelProps) {
    const hasSkillsOrInterests = skills.length > 0 || interests.length > 0
    const hasResumeSummary = Boolean(resumeSummary) || Boolean(resumeRoles && resumeRoles.length > 0)

    if (!hasSkillsOrInterests && !hasResumeSummary && !isEditing) {
        return (
            <article className="rounded-2xl border border-pod-border bg-white shadow-sm p-6">
                <h2 className="text-lg font-semibold text-pod-text mb-1">Your Skills</h2>
                <p className="text-sm text-pod-muted">
                    Upload your resume above and we&apos;ll pull your skills and interests in automatically.
                </p>
            </article>
        )
    }

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
            {(hasResumeSummary || isEditing) && (
                <div className="mb-6 pb-6 border-b border-pod-border">
                    <div className="flex items-center justify-between gap-2 mb-2">
                        <h2 className="text-lg font-semibold text-pod-text">
                            {firstName ? `${firstName}'s Resume Summary` : 'Resume Summary'}
                        </h2>
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
                            className="w-full rounded-lg border border-pod-border bg-pod-bg-soft px-3 py-2 text-sm text-pod-text mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-pod-primary/50"
                        />
                    ) : (
                        resumeSummary && <p className="text-sm text-pod-muted mb-4">{resumeSummary}</p>
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

            <h2 className="text-lg font-semibold text-pod-text mb-4">Your Skills</h2>

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
                </div>
            ) : (
                <>
                    {skills.length > 0 && (
                        <div className="mb-4">
                            <p className="text-xs font-bold text-pod-muted uppercase tracking-widest mb-2">Skills</p>
                            <div className="flex flex-wrap gap-2">
                                {skills.map(skill => (
                                    <SkillChip key={skill} label={skill} />
                                ))}
                            </div>
                        </div>
                    )}

                    {interests.length > 0 && (
                        <div>
                            <p className="text-xs font-bold text-pod-muted uppercase tracking-widest mb-2">Interests</p>
                            <div className="flex flex-wrap gap-2">
                                {interests.map(interest => (
                                    <SkillChip key={interest} label={interest} />
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            {isEditing && (
                <div className="mt-6 pt-4 border-t border-pod-border flex justify-end">
                    <button
                        type="button"
                        onClick={onToggleEditing}
                        className="px-5 py-2 rounded-lg bg-pod-primary text-pod-primary-foreground text-sm font-bold hover:bg-pod-primary-hover transition"
                    >
                        Save
                    </button>
                </div>
            )}
        </article>
    )
}
