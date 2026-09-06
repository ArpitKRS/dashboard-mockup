'use client'

import { useEffect, useState } from 'react'
import {
    Pencil,
    Check,
    Star,
    MessageCircle,
    Puzzle,
    Users,
    Wind,
    Crown,
    Cpu,
    TrendingUp,
    Sprout,
    type LucideIcon,
} from 'lucide-react'
import {
    getScaleQuestions,
    getChoiceQuestions,
    type CapabilityAnswers,
    type CapabilityAnswer,
    type CapabilityCategory,
    type CapabilityScaleQuestion,
    type CapabilityChoiceQuestion,
} from '@/lib/capabilityForm'
import {
    CATEGORY_ACCENTS,
    CATEGORY_VISUAL_KIND,
    CATEGORY_TINTS,
    WORKING_STYLE_TINTS,
    TIER_BY_VALUE,
    type CapabilityVisualKind,
} from '@/lib/capabilityVisuals'

interface CapabilityGraphGridProps {
    answers: CapabilityAnswers
    onAnswerChange: (questionId: string, answer: CapabilityAnswer) => void
}

/** Six different chart metaphors, one per category, so the grid doesn't read
 *  as the same shape six times over — CATEGORY_VISUAL_KIND (shared with the
 *  PDF export, so the two never draw a category differently) says which
 *  category currently uses which. */
type VisualKind = CapabilityVisualKind

interface CategoryMeta {
    icon: LucideIcon
    accent: string
    tint: string
    visual: VisualKind
}

const CATEGORY_META: Record<CapabilityCategory, CategoryMeta> = {
    Communication: { icon: MessageCircle, accent: CATEGORY_ACCENTS.Communication, tint: CATEGORY_TINTS.Communication, visual: CATEGORY_VISUAL_KIND.Communication },
    'Problem-Solving': { icon: Puzzle, accent: CATEGORY_ACCENTS['Problem-Solving'], tint: CATEGORY_TINTS['Problem-Solving'], visual: CATEGORY_VISUAL_KIND['Problem-Solving'] },
    Collaboration: { icon: Users, accent: CATEGORY_ACCENTS.Collaboration, tint: CATEGORY_TINTS.Collaboration, visual: CATEGORY_VISUAL_KIND.Collaboration },
    Adaptability: { icon: Wind, accent: CATEGORY_ACCENTS.Adaptability, tint: CATEGORY_TINTS.Adaptability, visual: CATEGORY_VISUAL_KIND.Adaptability },
    Leadership: { icon: Crown, accent: CATEGORY_ACCENTS.Leadership, tint: CATEGORY_TINTS.Leadership, visual: CATEGORY_VISUAL_KIND.Leadership },
    'Technical Confidence': { icon: Cpu, accent: CATEGORY_ACCENTS['Technical Confidence'], tint: CATEGORY_TINTS['Technical Confidence'], visual: CATEGORY_VISUAL_KIND['Technical Confidence'] },
}

interface VisualProps {
    value: number | null
    min: number
    max: number
    accent: string
    mounted: boolean
}

/** A number readout, shared by every visual so the layouts stay aligned even
 *  though the graphic beside it differs. */
function ValueReadout({ value, max }: { value: number | null; max: number }) {
    return (
        <span className="text-sm font-bold text-pod-text tabular-nums whitespace-nowrap">
            {value ?? '–'} <span className="text-pod-muted font-medium">/ {max}</span>
        </span>
    )
}

function RingVisual({ value, min, max, accent, mounted }: VisualProps) {
    const radius = 30
    const circumference = 2 * Math.PI * radius
    const pct = max > min && value != null ? (value - min + 1) / (max - min + 1) : 0
    const offset = circumference - (mounted ? pct : 0) * circumference

    return (
        <div className="relative h-16 w-16 shrink-0">
            <svg viewBox="0 0 80 80" className="h-16 w-16 -rotate-90">
                <circle cx="40" cy="40" r={radius} fill="none" stroke="#EEF0EF" strokeWidth="8" />
                <circle
                    cx="40" cy="40" r={radius} fill="none"
                    stroke={accent} strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={circumference} strokeDashoffset={offset}
                    className="transition-[stroke-dashoffset] duration-700 ease-out"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-sm font-extrabold text-pod-text tabular-nums">
                {value ?? '–'}
            </div>
        </div>
    )
}

function StarsVisual({ value, min, max, accent }: VisualProps) {
    const count = max - min + 1
    const filled = value != null ? value - min + 1 : 0
    return (
        <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1">
                {Array.from({ length: count }).map((_, i) => (
                    <Star
                        key={i}
                        className="h-5 w-5 transition-transform duration-200"
                        style={{ transform: i < filled ? 'scale(1)' : 'scale(0.85)' }}
                        fill={i < filled ? accent : 'none'}
                        stroke={i < filled ? accent : '#D1D5DB'}
                    />
                ))}
            </div>
            <ValueReadout value={value} max={max} />
        </div>
    )
}

/** Half-circle speedometer arc — pathLength=100 turns the arc's fractional
 *  fill into a plain 0-100 dash offset regardless of the arc's real length. */
function GaugeVisual({ value, min, max, accent, mounted }: VisualProps) {
    const pct = max > min && value != null ? (value - min) / (max - min) : 0
    const dash = 100
    const offset = dash - (mounted ? pct : 0) * dash
    const arcPath = 'M 8 46 A 34 34 0 0 1 76 46'

    return (
        <div className="relative h-14 w-21 shrink-0">
            <svg viewBox="0 0 84 50" className="h-14 w-21">
                <path d={arcPath} fill="none" stroke="#EEF0EF" strokeWidth="8" strokeLinecap="round" pathLength={100} />
                <path
                    d={arcPath} fill="none" stroke={accent} strokeWidth="8" strokeLinecap="round"
                    pathLength={100} strokeDasharray={dash} strokeDashoffset={offset}
                    className="transition-[stroke-dashoffset] duration-700 ease-out"
                />
            </svg>
            <div className="absolute inset-x-0 bottom-0 text-center text-sm font-extrabold text-pod-text tabular-nums">
                {value ?? '–'}
            </div>
        </div>
    )
}

function BatteryVisual({ value, min, max, accent, mounted }: VisualProps) {
    const pct = max > min && value != null ? ((value - min + 1) / (max - min + 1)) * 100 : 0
    return (
        <div className="flex items-center gap-3">
            <div className="relative h-14 w-6 rounded-full border-2 overflow-hidden shrink-0 bg-white" style={{ borderColor: `${accent}66` }}>
                <div
                    className="absolute bottom-0 left-0 right-0 transition-[height] duration-700 ease-out"
                    style={{ height: mounted ? `${pct}%` : '0%', backgroundColor: accent }}
                />
            </div>
            <ValueReadout value={value} max={max} />
        </div>
    )
}

function BarsVisual({ value, min, max, accent, mounted }: VisualProps) {
    const steps = max - min + 1
    const filled = value != null ? value - min + 1 : 0
    return (
        <div className="flex items-center gap-3">
            <div className="flex items-end gap-1 h-10">
                {Array.from({ length: steps }).map((_, i) => {
                    const targetPct = 35 + (i / Math.max(steps - 1, 1)) * 65
                    return (
                        <div
                            key={i}
                            className="w-2.5 rounded-sm transition-all ease-out"
                            style={{
                                height: mounted ? `${targetPct}%` : '10%',
                                backgroundColor: i < filled ? accent : '#E5E7EB',
                                transitionDuration: '500ms',
                                transitionDelay: `${i * 60}ms`,
                            }}
                        />
                    )
                })}
            </div>
            <ValueReadout value={value} max={max} />
        </div>
    )
}

function NodesVisual({ value, min, max, accent, mounted }: VisualProps) {
    const steps = max - min + 1
    const filled = value != null ? value - min + 1 : 0
    const fillPct = steps > 1 ? ((filled - 1) / (steps - 1)) * 100 : 0
    return (
        <div className="flex items-center gap-3">
            <div className="relative w-28 h-5">
                <div className="absolute top-1/2 left-2 right-2 h-0.5 -translate-y-1/2 bg-gray-200" />
                <div
                    className="absolute top-1/2 left-2 h-0.5 -translate-y-1/2 transition-all duration-700 ease-out"
                    style={{ width: mounted ? `calc(${fillPct}% * 0.92)` : '0%', backgroundColor: accent }}
                />
                <div className="relative flex justify-between">
                    {Array.from({ length: steps }).map((_, i) => (
                        <div
                            key={i}
                            className="h-4 w-4 rounded-full border-2 transition-colors duration-300 bg-white"
                            style={{ borderColor: i < filled ? accent : '#D1D5DB', backgroundColor: i < filled ? accent : '#FFFFFF' }}
                        />
                    ))}
                </div>
            </div>
            <ValueReadout value={value} max={max} />
        </div>
    )
}

const VISUALS: Record<VisualKind, (props: VisualProps) => React.ReactElement> = {
    ring: RingVisual,
    stars: StarsVisual,
    gauge: GaugeVisual,
    battery: BatteryVisual,
    bars: BarsVisual,
    nodes: NodesVisual,
}

function CategoryVisual({ kind, celebrate, ...props }: VisualProps & { kind: VisualKind; celebrate: boolean }) {
    const Visual = VISUALS[kind]
    return (
        <div className="relative inline-flex">
            <Visual {...props} />
            {celebrate && (
                <Star
                    key={Date.now()}
                    aria-hidden
                    className="absolute -top-2 -right-2 h-5 w-5 text-amber-400 fill-amber-400 animate-capability-star-pop"
                />
            )}
        </div>
    )
}

function EditToggleButton({ editing, onClick }: { editing: boolean; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={editing ? 'Cancel edit' : 'Edit this section'}
            className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-white border border-pod-border px-2 py-1 text-[11px] font-semibold text-pod-muted hover:text-pod-primary hover:border-pod-primary-medium transition-colors"
        >
            <Pencil className="h-3 w-3" />
            {editing ? 'Cancel' : 'Edit'}
        </button>
    )
}

/** One self-rating category — its own chart form (see CATEGORY_META) with a
 *  tier badge ("Strength", "Growing"...) when not editing, or the question's
 *  own scale-pill picker when in edit mode. Picking a new value saves
 *  immediately, pops a little star (same motion as the original
 *  questionnaire), then collapses back. */
function ScaleCategoryCard({
    question,
    answer,
    onChange,
}: {
    question: CapabilityScaleQuestion
    answer: CapabilityAnswer | undefined
    onChange: (questionId: string, answer: CapabilityAnswer) => void
}) {
    const [editing, setEditing] = useState(false)
    const [celebrate, setCelebrate] = useState(false)
    const [mounted, setMounted] = useState(false)
    useEffect(() => {
        const frame = requestAnimationFrame(() => setMounted(true))
        return () => cancelAnimationFrame(frame)
    }, [])

    const value = answer?.type === 'scale' ? answer.value : null
    const meta = CATEGORY_META[question.category]
    const Icon = meta.icon
    const tier = value != null ? TIER_BY_VALUE[value] : null

    const pick = (v: number) => {
        onChange(question.id, { type: 'scale', value: v })
        setCelebrate(true)
        setTimeout(() => { setEditing(false); setCelebrate(false) }, 550)
    }

    return (
        <div
            className="group relative rounded-xl border border-pod-border p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
            style={{ backgroundColor: meta.tint }}
        >
            <EditToggleButton editing={editing} onClick={() => setEditing(e => !e)} />
            <div className="flex items-center gap-1.5 mb-3 pr-16">
                <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: meta.accent }} aria-hidden />
                <p className="text-xs font-bold uppercase tracking-widest text-pod-muted">{question.category}</p>
            </div>

            {!editing ? (
                <div className="flex items-center gap-3">
                    <CategoryVisual
                        kind={meta.visual}
                        value={value}
                        min={question.min}
                        max={question.max}
                        accent={meta.accent}
                        mounted={mounted}
                        celebrate={celebrate}
                    />
                    <div className="min-w-0">
                        <p className="text-xs text-pod-muted leading-snug mb-1.5">
                            {value != null ? question.labels[value - question.min] : 'Not answered yet'}
                        </p>
                        {tier && (
                            <span
                                className="inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                                style={{ backgroundColor: tier.bg, color: tier.fg }}
                            >
                                {tier.label}
                            </span>
                        )}
                    </div>
                </div>
            ) : (
                <div>
                    <p className="text-xs text-pod-text mb-2.5">{question.prompt}</p>
                    <div className="flex flex-wrap gap-1.5">
                        {question.labels.map((label, i) => {
                            const v = question.min + i
                            const selected = value === v
                            return (
                                <button
                                    key={v}
                                    type="button"
                                    onClick={() => pick(v)}
                                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                                        selected
                                            ? 'border-pod-primary bg-pod-primary text-pod-primary-foreground'
                                            : 'border-pod-border bg-white text-pod-text hover:border-pod-primary-medium'
                                    }`}
                                >
                                    {label}
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

/** The 3 lighter "texture" questions, combined into one "Working Style"
 *  section — each answer shown as a big emoji badge on its own tint, with
 *  one Edit toggle that expands all three pickers at once. */
function WorkingStyleCard({
    questions,
    answers,
    onChange,
}: {
    questions: CapabilityChoiceQuestion[]
    answers: CapabilityAnswers
    onChange: (questionId: string, answer: CapabilityAnswer) => void
}) {
    const [editing, setEditing] = useState(false)

    return (
        <div className="relative rounded-xl border border-pod-border bg-pod-bg-soft p-4 sm:col-span-2 lg:col-span-3">
            <EditToggleButton editing={editing} onClick={() => setEditing(e => !e)} />
            <p className="text-xs font-bold uppercase tracking-widest text-pod-muted mb-3 pr-16">Working Style</p>

            {!editing ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {questions.map((question, i) => {
                        const answer = answers[question.id]
                        const option = answer?.type === 'choice' ? question.options.find(o => o.id === answer.optionId) : undefined
                        return (
                            <div
                                key={question.id}
                                className="rounded-lg border border-pod-border px-3 py-4 text-center transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-sm"
                                style={{ backgroundColor: WORKING_STYLE_TINTS[i % WORKING_STYLE_TINTS.length] }}
                            >
                                <div className="text-2xl">{option?.emoji ?? '❔'}</div>
                                <p className="text-[11px] font-semibold text-pod-text mt-1.5 leading-snug">{option?.label ?? 'Not answered yet'}</p>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="space-y-4">
                    {questions.map(question => {
                        const answer = answers[question.id]
                        return (
                            <div key={question.id}>
                                <p className="text-xs text-pod-text mb-2">{question.prompt}</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {question.options.map(option => {
                                        const selected = answer?.type === 'choice' && answer.optionId === option.id
                                        return (
                                            <button
                                                key={option.id}
                                                type="button"
                                                onClick={() => onChange(question.id, { type: 'choice', optionId: option.id })}
                                                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                                                    selected
                                                        ? 'border-pod-primary bg-pod-primary-light text-pod-text'
                                                        : 'border-pod-border bg-white text-pod-text hover:border-pod-primary-medium'
                                                }`}
                                            >
                                                <span>{option.emoji}</span>
                                                {option.label}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={() => setEditing(false)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-pod-primary hover:text-pod-primary-hover transition-colors"
                        >
                            <Check className="h-3.5 w-3.5" /> Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

/** "Strongest area" / "Growth focus" — the two extremes of the six
 *  self-ratings, called out above the grid so the snapshot leads with an
 *  actual insight rather than making the reader scan six cards for it. */
function InsightBanner({ answers, questions }: { answers: CapabilityAnswers; questions: CapabilityScaleQuestion[] }) {
    const rated = questions
        .map(q => {
            const answer = answers[q.id]
            return { question: q, value: answer?.type === 'scale' ? answer.value : null }
        })
        .filter((r): r is { question: CapabilityScaleQuestion; value: number } => r.value != null)

    if (rated.length < 2) return null

    const strongest = rated.reduce((best, r) => (r.value > best.value ? r : best), rated[0])
    const weakest = rated.reduce((worst, r) => (r.value < worst.value ? r : worst), rated[0])
    if (strongest.question.category === weakest.question.category) return null

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                <TrendingUp className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                <p className="text-xs text-emerald-900">
                    <span className="font-bold">Strongest area:</span> {strongest.question.category} ({strongest.value}/{strongest.question.max})
                </p>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
                <Sprout className="h-4.5 w-4.5 text-amber-600 shrink-0" />
                <p className="text-xs text-amber-900">
                    <span className="font-bold">Growth focus:</span> {weakest.question.category} ({weakest.value}/{weakest.question.max})
                </p>
            </div>
        </div>
    )
}

/**
 * Replaces the single combined radar/bar/list chart (CapabilityInsightsCharts)
 * with one graph per question section of the Capability Building Form. Each
 * of the 6 self-rating categories gets its own chart *form* — a ring, a
 * speedometer arc, a star row, a battery fill, a signal-bar stack, and a
 * node track — not just the same ring recolored six times (see CATEGORY_META
 * for the mapping), each with a tier badge. The 3 lighter "texture"
 * questions are combined into one Working Style card. An insight banner
 * leads with the strongest/growth-focus categories, and every card carries
 * its own Edit control so a section can be re-answered on its own, without
 * reopening the whole questionnaire.
 */
export default function CapabilityGraphGrid({ answers, onAnswerChange }: CapabilityGraphGridProps) {
    const scaleQuestions = getScaleQuestions()
    const choiceQuestions = getChoiceQuestions()

    return (
        <div>
            <h3 className="text-sm font-semibold text-pod-text mb-1">Your Capability Snapshot</h3>
            <p className="text-xs text-pod-muted mb-4">
                One graph per question section — edit any of them without retaking the whole questionnaire.
            </p>

            <InsightBanner answers={answers} questions={scaleQuestions} />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {scaleQuestions.map(question => (
                    <ScaleCategoryCard
                        key={question.id}
                        question={question}
                        answer={answers[question.id]}
                        onChange={onAnswerChange}
                    />
                ))}
                <WorkingStyleCard questions={choiceQuestions} answers={answers} onChange={onAnswerChange} />
            </div>
        </div>
    )
}
