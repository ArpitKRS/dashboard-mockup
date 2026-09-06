'use client'

import { Check, ArrowUpRight, Target } from 'lucide-react'
import { computeOverallMatch, type SkillGap, type CapabilityGap } from '@/lib/futureRole'

interface CareerPathMapProps {
    roleTitle: string
    skillGap: SkillGap
    capabilityGap: CapabilityGap
}

function ScoreRing({ percent }: { percent: number }) {
    const radius = 42
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (percent / 100) * circumference

    return (
        <div className="relative h-28 w-28 shrink-0">
            <svg viewBox="0 0 100 100" className="h-28 w-28 -rotate-90">
                <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--color-pod-primary-light)" strokeWidth="9" />
                <circle
                    cx="50" cy="50" r={radius} fill="none"
                    stroke="var(--color-pod-primary)" strokeWidth="9" strokeLinecap="round"
                    strokeDasharray={circumference} strokeDashoffset={offset}
                    className="transition-[stroke-dashoffset] duration-700 ease-out"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold text-pod-text tabular-nums">{percent}%</span>
                <span className="text-[10px] font-semibold uppercase tracking-wide text-pod-muted">ready</span>
            </div>
        </div>
    )
}

function StatusPill({ label, ok, sublabel }: { label: string; ok: boolean; sublabel?: string }) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${
                ok
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-amber-200 bg-amber-50 text-amber-800'
            }`}
        >
            {ok ? <Check className="h-3 w-3 shrink-0" /> : <ArrowUpRight className="h-3 w-3 shrink-0" />}
            {label}
            {sublabel && <span className="opacity-70">{sublabel}</span>}
        </span>
    )
}

/**
 * The visual heart of the Future Goal section: one wide "here's where you
 * stand" card instead of a squeezed vertical list wedged between two other
 * columns. A score ring leads with the single number that matters, then two
 * grouped rows — the resume-derived technical skills the role wants, and the
 * capability-questionnaire soft skills it wants — each pill flagged green
 * (already there) or amber (still to build).
 */
export default function CareerPathMap({ roleTitle, skillGap, capabilityGap }: CareerPathMapProps) {
    const overallMatch = computeOverallMatch(skillGap, capabilityGap)
    const orderedSkills = [...skillGap.matched, ...skillGap.gaps]
    const orderedCapabilities = [...capabilityGap.matched, ...capabilityGap.gaps]

    return (
        <div className="rounded-2xl border border-pod-border bg-pod-bg-soft p-6">
            <div className="flex flex-wrap items-center gap-5 mb-6">
                <ScoreRing percent={overallMatch} />
                <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-pod-muted mb-1">Path to</p>
                    <div className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-pod-primary shrink-0" />
                        <h3 className="text-xl font-bold text-pod-text">{roleTitle}</h3>
                    </div>
                    <p className="text-sm text-pod-muted mt-1">
                        {skillGap.matched.length + capabilityGap.matched.length} of {orderedSkills.length + orderedCapabilities.length} things this role looks for are already part of your profile.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-pod-muted mb-2.5">Technical Skills</p>
                    <div className="flex flex-wrap gap-2">
                        {orderedSkills.map(skill => (
                            <StatusPill key={skill} label={skill} ok={skillGap.matched.includes(skill)} />
                        ))}
                    </div>
                </div>

                <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-pod-muted mb-2.5">Growth Areas</p>
                    <div className="flex flex-wrap gap-2">
                        {orderedCapabilities.map(entry => (
                            <StatusPill
                                key={entry.category}
                                label={entry.category}
                                ok={entry.currentLevel >= entry.targetLevel}
                                sublabel={`${entry.currentLevel}/${entry.targetLevel}`}
                            />
                        ))}
                    </div>
                    {orderedCapabilities.length === 0 && (
                        <p className="text-xs text-pod-muted">Complete the Capability Questionnaire to see this compared too.</p>
                    )}
                </div>
            </div>
        </div>
    )
}
