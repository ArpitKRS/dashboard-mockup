'use client'

import { CheckCircle2, FileUp, Sparkles, Check } from 'lucide-react'

interface ProfileCompletionHeroProps {
    completionPct: number
    resumeUploaded: boolean
    resumeFileName: string | null
    capabilityCompleted: boolean
    onUploadResumeClick: () => void
    onCapabilityFormClick: () => void
}

/**
 * The "Profile Capability Reflection" card: a recruiting-platform-style
 * completion meter plus the two actions that move it from 0% to 100% — resume
 * upload and the Capability Building Questionnaire.
 *
 * Once both are done, the two full-size step cards are replaced by small
 * "done" pills in the header row, each still reopening its own flow to redo
 * or replace that step. Editing the *populated fields* themselves (resume
 * summary, skills, roles) is a separate Edit/Save control that lives on
 * SkillsPanel, next to the content it actually edits.
 *
 * Copied verbatim from osmosis/app/pod/[subdomain]/explore/dashboard/ProfileCompletionHero.tsx.
 */
export default function ProfileCompletionHero({
    completionPct,
    resumeUploaded,
    resumeFileName,
    capabilityCompleted,
    onUploadResumeClick,
    onCapabilityFormClick,
}: ProfileCompletionHeroProps) {
    const isFullyComplete = completionPct === 100

    return (
        <article className="rounded-2xl border border-pod-border bg-white shadow-sm p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <h2 className="text-lg font-semibold text-pod-text">Profile Capability Reflection</h2>

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

            {!isFullyComplete && (
                <>
                    <p className="text-sm text-pod-muted mb-4">
                        Complete these two steps so we can show you a fuller picture of your skills.
                    </p>

                    <div className="h-2 w-full rounded-full bg-pod-primary/10 overflow-hidden mb-6">
                        <div
                            className="h-full rounded-full bg-pod-primary transition-all duration-500"
                            style={{ width: `${Math.min(completionPct, 100)}%` }}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3 rounded-xl border border-pod-border bg-pod-bg-soft p-4">
                            <div className={`mt-0.5 h-8 w-8 shrink-0 rounded-lg flex items-center justify-center ${
                                resumeUploaded ? 'bg-emerald-100 text-emerald-600' : 'bg-pod-primary-light text-pod-primary'
                            }`}>
                                {resumeUploaded ? <CheckCircle2 className="h-4 w-4" /> : <FileUp className="h-4 w-4" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-pod-text">Upload your resume</p>
                                <p className="text-xs text-pod-muted mb-2 truncate">
                                    {resumeUploaded ? (resumeFileName || 'Resume on file') : 'We\'ll pull out your skills automatically.'}
                                </p>
                                <button
                                    type="button"
                                    onClick={onUploadResumeClick}
                                    className="text-xs font-semibold text-pod-primary hover:text-pod-primary-hover transition-colors"
                                >
                                    {resumeUploaded ? 'Replace resume →' : 'Upload resume →'}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 rounded-xl border border-pod-border bg-pod-bg-soft p-4">
                            <div className={`mt-0.5 h-8 w-8 shrink-0 rounded-lg flex items-center justify-center ${
                                capabilityCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-pod-primary-light text-pod-primary'
                            }`}>
                                {capabilityCompleted ? <CheckCircle2 className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-pod-text">Capability Building Questionnaire</p>
                                <p className="text-xs text-pod-muted mb-2">
                                    {capabilityCompleted ? 'Completed — thanks for sharing!' : 'A few quick questions about how you work.'}
                                </p>
                                <button
                                    type="button"
                                    onClick={onCapabilityFormClick}
                                    className="text-xs font-semibold text-pod-primary hover:text-pod-primary-hover transition-colors"
                                >
                                    {capabilityCompleted ? 'Review answers →' : 'Start questionnaire →'}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </article>
    )
}
