'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, Star, Sparkles, CheckCircle2 } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import ScorePillRow from './ScorePillRow'
import {
    CAPABILITY_QUESTIONS,
    type CapabilityAnswers,
    type CapabilityAnswer,
    isCapabilityFormComplete,
} from '@/lib/capabilityForm'
import { RANK_MEDALS } from '@/lib/capabilityVisuals'

type Phase = 'splash' | 'taking' | 'submitting' | 'done' | 'error'

interface CapabilityBuildingFormProps {
    initialAnswers: CapabilityAnswers
    /** Used for the first question's "Hello {firstName}!" greeting. */
    firstName: string
    /** Resume-derived — shown as a read-only recap next to the greeting, not
     *  asked as a question. Null until a resume has been uploaded. */
    resumeEducation: string | null
    onClose: () => void
    onCompleted: (answers: CapabilityAnswers) => void
}

// Long enough to see the selection highlight and star pop before the view
// moves on, short enough that the flow still feels immediate.
const AUTO_ADVANCE_DELAY_MS = 500

/** Purely decorative reaction to a multi-scale score — mirrors the star-pop
 *  on every other question type, just as an emoji instead of a fixed icon. */
function moodEmojiFor(value: number): string {
    if (value <= 2) return '😴'
    if (value <= 4) return '🙂'
    if (value <= 6) return '😊'
    if (value <= 8) return '😃'
    return '🤩'
}

/** Medal-tinted card background for a ranked option — unranked options stay
 *  on the plain neutral card used everywhere else in the wizard. */
function rankCardClasses(rank: number | undefined): string {
    if (rank === 1) return 'border-amber-300 bg-amber-50'
    if (rank === 2) return 'border-slate-300 bg-slate-50'
    if (rank === 3) return 'border-orange-300 bg-orange-50'
    return 'border-pod-border bg-pod-bg-soft'
}

// Podium step order is visual (2nd-1st-3rd, tallest in the middle), not
// numeric — the classic racing/awards-stand arrangement.
const PODIUM_STEPS = [
    { rank: 2, height: 'h-16', base: 'bg-slate-300' },
    { rank: 1, height: 'h-24', base: 'bg-amber-400' },
    { rank: 3, height: 'h-11', base: 'bg-orange-400' },
]

/** Live "who's on the podium right now" preview for a rank question — an
 *  empty step just shows a dash until that rank gets assigned below. */
function RankPodium({ options, ranking }: { options: { id: string; label: string }[]; ranking: Record<string, number> }) {
    return (
        <div className="mb-6 flex items-end justify-center gap-3">
            {PODIUM_STEPS.map(({ rank, height, base }) => {
                const option = options.find(o => ranking[o.id] === rank)
                return (
                    <div key={rank} className="flex w-24 flex-col items-center">
                        <span className="text-2xl">{RANK_MEDALS[rank - 1]}</span>
                        <p className="mt-1 h-8 w-full truncate text-center text-xs font-semibold text-pod-text" title={option?.label}>
                            {option?.label ?? '—'}
                        </p>
                        <div className={`mt-1 flex w-full items-center justify-center rounded-t-lg text-lg font-extrabold text-white ${height} ${base}`}>
                            {rank}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

// Index into a habit-checklist question's shared 5-option frequency scale
// (best to worst, matching the source table's own column order) — a
// traffic-light ramp from "this is a strength" (green) to "needs work" (red).
const HABIT_TIER_STYLES = [
    { idle: 'border-emerald-200 bg-emerald-50 hover:border-emerald-400', selected: 'border-emerald-500 bg-emerald-500 text-white' },
    { idle: 'border-teal-200 bg-teal-50 hover:border-teal-400', selected: 'border-teal-500 bg-teal-500 text-white' },
    { idle: 'border-sky-200 bg-sky-50 hover:border-sky-400', selected: 'border-sky-500 bg-sky-500 text-white' },
    { idle: 'border-amber-200 bg-amber-50 hover:border-amber-400', selected: 'border-amber-500 bg-amber-500 text-white' },
    { idle: 'border-rose-200 bg-rose-50 hover:border-rose-400', selected: 'border-rose-500 bg-rose-500 text-white' },
]

/**
 * Single-question-per-step wizard (same interaction shape as the reference
 * onboarding flow: centered card, one question at a time) but picking an
 * answer advances to the next question on its own — there is no separate
 * Continue click. Back still works, for revisiting and changing an answer.
 * The star is a decorative in place of a numeric XP counter — it never feeds
 * a score, it just pops in as positive feedback for answering.
 *
 * Adapted from osmosis/app/pod/[subdomain]/explore/dashboard/CapabilityBuildingForm.tsx:
 * the real submit path is a mocked branch behind a hardcoded flag (the real
 * backend endpoint isn't deployed yet), so this mock-up drops the `useApi`
 * dependency entirely and always takes that mocked path.
 */
export default function CapabilityBuildingForm({ initialAnswers, firstName, resumeEducation, onClose, onCompleted }: CapabilityBuildingFormProps) {
    // Opening this after it's already complete (the StepCard's "Want to
    // re-fill the form?" affordance) must land on the splash → taking flow
    // like any other visit, not skip straight to the "done" screen — the
    // whole point of reopening it is to answer again, prefilled from
    // `initialAnswers`, not to be told it's already finished.
    const alreadyComplete = isCapabilityFormComplete(initialAnswers)
    const [phase, setPhase] = useState<Phase>('splash')
    const [index, setIndex] = useState(0)
    const [answers, setAnswers] = useState<CapabilityAnswers>(initialAnswers)
    const [starKey, setStarKey] = useState(0)
    const [textDraft, setTextDraft] = useState('')
    // Which competency group of a proficiency-matrix question is showing —
    // its own internal stepper, separate from the outer question index, so a
    // 41-indicator matrix is never dumped on screen all at once.
    const [competencyIndex, setCompetencyIndex] = useState(0)
    // Same idea for a habit-checklist question's items — shown and answered
    // one at a time, auto-advancing like a base choice/scale question does.
    const [habitItemIndex, setHabitItemIndex] = useState(0)

    const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const scrollAreaRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        return () => {
            if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current)
        }
    }, [])

    const question = CAPABILITY_QUESTIONS[index]
    const total = CAPABILITY_QUESTIONS.length
    const isLast = index === total - 1
    const currentAnswer = question ? answers[question.id] : undefined

    // A text question's draft lives in local state (not `answers`) until Next
    // is clicked, so an in-progress keystroke never counts as "answered" —
    // re-synced whenever the visible question changes, prefilled from any
    // existing answer (the re-fill flow).
    useEffect(() => {
        if (question?.type === 'text') {
            const existing = answers[question.id]
            setTextDraft(existing?.type === 'text' ? existing.value : '')
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [index])

    // Always lands back on the first section when this question comes into
    // view — including when navigating Back into it from the next question,
    // which re-enters at section 1 rather than resuming the last section
    // visited. Simpler than tracking entry direction, and every answer is
    // still preserved either way (this only resets which section is shown).
    useEffect(() => {
        if (question?.type === 'proficiency-matrix') {
            setCompetencyIndex(0)
        }
        if (question?.type === 'habit-checklist') {
            setHabitItemIndex(0)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [index])

    // Whenever the visible question, competency section, OR habit item
    // changes, land back at the top of the scrollable body — otherwise a
    // long section (e.g. the 9-item Self-Awareness competency) leaves the
    // next, shorter section scrolled to wherever the previous one was.
    useEffect(() => {
        scrollAreaRef.current?.scrollTo({ top: 0 })
    }, [index, competencyIndex, habitItemIndex])

    const submit = useCallback(async (finalAnswers: CapabilityAnswers) => {
        setPhase('submitting')
        await new Promise<void>(resolve => setTimeout(resolve, 500))
        setPhase('done')
        onCompleted(finalAnswers)
    }, [onCompleted])

    const selectAnswer = useCallback((answer: CapabilityAnswer) => {
        if (!question) return
        const nextAnswers = { ...answers, [question.id]: answer }
        setAnswers(nextAnswers)
        setStarKey(k => k + 1)

        if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current)
        advanceTimeoutRef.current = setTimeout(() => {
            if (isLast) {
                submit(nextAnswers)
            } else {
                setIndex(i => i + 1)
            }
        }, AUTO_ADVANCE_DELAY_MS)
    }, [question, answers, isLast, submit])

    const handleBack = () => {
        if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current)
        if (index > 0) setIndex(i => i - 1)
    }

    // Text questions don't auto-advance on keystroke — this is the explicit
    // Next/Skip action. An empty draft on an optional question just moves on
    // without recording an answer, rather than storing an empty string.
    const handleTextNext = useCallback(() => {
        if (!question || question.type !== 'text') return
        const trimmed = textDraft.trim()
        const nextAnswers = trimmed ? { ...answers, [question.id]: { type: 'text' as const, value: trimmed } } : answers
        if (trimmed) {
            setAnswers(nextAnswers)
            setStarKey(k => k + 1)
        }
        if (isLast) {
            submit(nextAnswers)
        } else {
            setIndex(i => i + 1)
        }
    }, [question, textDraft, answers, isLast, submit])

    // Each dimension is independently answerable, so this writes straight
    // into `answers` rather than buffering a draft — unlike text questions,
    // there's no single "commit" moment to wait for.
    const updateMultiScale = useCallback((dimensionId: string, value: number) => {
        if (!question || question.type !== 'multi-scale') return
        setAnswers(prev => {
            const existing = prev[question.id]
            const scores = existing?.type === 'multi-scale' ? { ...existing.scores } : {}
            scores[dimensionId] = { value }
            return { ...prev, [question.id]: { type: 'multi-scale' as const, scores } }
        })
        setStarKey(k => k + 1)
    }, [question])

    const multiScaleAnswer = question?.type === 'multi-scale' ? answers[question.id] : undefined
    const multiScaleRatedCount = question?.type === 'multi-scale'
        ? question.dimensions.filter(d => multiScaleAnswer?.type === 'multi-scale' && multiScaleAnswer.scores[d.id]?.value != null).length
        : 0
    const multiScaleComplete = question?.type === 'multi-scale' && multiScaleRatedCount === question.dimensions.length

    const handleMultiScaleNext = useCallback(() => {
        if (!multiScaleComplete) return
        if (isLast) {
            submit(answers)
        } else {
            setIndex(i => i + 1)
        }
    }, [multiScaleComplete, isLast, submit, answers])

    // The two free-text rows write straight into `answers` on every
    // keystroke — unlike the single text question, they're optional
    // reflections with no "skip" affordance to protect, so there's nothing
    // to buffer.
    const updateDiagnosticText = useCallback((rowId: string, text: string) => {
        if (!question || question.type !== 'diagnostic-panel') return
        setAnswers(prev => {
            const existing = prev[question.id]
            const rows = existing?.type === 'diagnostic-panel' ? { ...existing.rows } : {}
            rows[rowId] = { ...rows[rowId], text }
            return { ...prev, [question.id]: { type: 'diagnostic-panel' as const, rows } }
        })
    }, [question])

    // Toggle, not select — the source doc draws these as checkboxes, so more
    // than one option can be active per row.
    const updateDiagnosticChoice = useCallback((rowId: string, optionId: string) => {
        if (!question || question.type !== 'diagnostic-panel') return
        setAnswers(prev => {
            const existing = prev[question.id]
            const rows = existing?.type === 'diagnostic-panel' ? { ...existing.rows } : {}
            const current = rows[rowId]?.optionIds ?? []
            const next = current.includes(optionId) ? current.filter(id => id !== optionId) : [...current, optionId]
            rows[rowId] = { ...rows[rowId], optionIds: next }
            return { ...prev, [question.id]: { type: 'diagnostic-panel' as const, rows } }
        })
        setStarKey(k => k + 1)
    }, [question])

    const diagnosticAnswer = question?.type === 'diagnostic-panel' ? answers[question.id] : undefined
    const diagnosticChoiceRows = question?.type === 'diagnostic-panel' ? question.rows.filter(row => row.type === 'multi-choice') : []
    const diagnosticAnsweredCount = diagnosticChoiceRows.filter(row => {
        const picked = diagnosticAnswer?.type === 'diagnostic-panel' ? diagnosticAnswer.rows[row.id]?.optionIds : undefined
        return Boolean(picked && picked.length > 0)
    }).length
    const diagnosticComplete = question?.type === 'diagnostic-panel' && diagnosticAnsweredCount === diagnosticChoiceRows.length

    const handleDiagnosticNext = useCallback(() => {
        if (!diagnosticComplete) return
        if (isLast) {
            submit(answers)
        } else {
            setIndex(i => i + 1)
        }
    }, [diagnosticComplete, isLast, submit, answers])

    // Each rank (1..topN) belongs to at most one option — clicking a rank
    // already assigned to this option clears it; clicking a rank held by a
    // different option moves it here instead of leaving a duplicate.
    const updateRank = useCallback((optionId: string, rank: number) => {
        if (!question || question.type !== 'rank') return
        setAnswers(prev => {
            const existing = prev[question.id]
            const ranking = existing?.type === 'rank' ? { ...existing.ranking } : {}
            if (ranking[optionId] === rank) {
                delete ranking[optionId]
            } else {
                for (const key of Object.keys(ranking)) {
                    if (ranking[key] === rank) delete ranking[key]
                }
                ranking[optionId] = rank
            }
            return { ...prev, [question.id]: { type: 'rank' as const, ranking } }
        })
        setStarKey(k => k + 1)
    }, [question])

    const rankAnswer = question?.type === 'rank' ? answers[question.id] : undefined
    const rankedCount = rankAnswer?.type === 'rank' ? Object.keys(rankAnswer.ranking).length : 0
    const rankComplete = question?.type === 'rank' && rankedCount === question.topN

    const handleRankNext = useCallback(() => {
        if (!rankComplete) return
        if (isLast) {
            submit(answers)
        } else {
            setIndex(i => i + 1)
        }
    }, [rankComplete, isLast, submit, answers])

    const updateProficiencyScore = useCallback((indicatorId: string, value: number) => {
        if (!question || question.type !== 'proficiency-matrix') return
        setAnswers(prev => {
            const existing = prev[question.id]
            const scores = existing?.type === 'proficiency-matrix' ? { ...existing.scores } : {}
            scores[indicatorId] = value
            return { ...prev, [question.id]: { type: 'proficiency-matrix' as const, scores } }
        })
        setStarKey(k => k + 1)
    }, [question])

    const proficiencyAnswer = question?.type === 'proficiency-matrix' ? answers[question.id] : undefined
    const currentCompetency = question?.type === 'proficiency-matrix' ? question.competencies[competencyIndex] : undefined
    const proficiencyTotalIndicators = question?.type === 'proficiency-matrix'
        ? question.competencies.reduce((sum, c) => sum + c.indicators.length, 0)
        : 0
    const proficiencyAnsweredTotal = question?.type === 'proficiency-matrix'
        ? question.competencies.reduce((sum, c) => sum + c.indicators.filter(
            ind => proficiencyAnswer?.type === 'proficiency-matrix' && proficiencyAnswer.scores[ind.id] != null
        ).length, 0)
        : 0
    const currentCompetencyComplete = Boolean(currentCompetency?.indicators.every(
        ind => proficiencyAnswer?.type === 'proficiency-matrix' && proficiencyAnswer.scores[ind.id] != null
    ))
    const isLastCompetency = question?.type === 'proficiency-matrix' && competencyIndex === question.competencies.length - 1

    // Back inside a proficiency-matrix question moves to the previous
    // section first, only falling through to the outer question-level Back
    // once already on the matrix's first section.
    const handleProficiencyBack = useCallback(() => {
        if (competencyIndex > 0) {
            setCompetencyIndex(i => i - 1)
        } else {
            if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current)
            if (index > 0) setIndex(i => i - 1)
        }
    }, [competencyIndex, index])

    const handleProficiencyNext = useCallback(() => {
        if (!currentCompetencyComplete || question?.type !== 'proficiency-matrix') return
        if (competencyIndex < question.competencies.length - 1) {
            setCompetencyIndex(i => i + 1)
        } else if (isLast) {
            submit(answers)
        } else {
            setIndex(i => i + 1)
        }
    }, [currentCompetencyComplete, question, competencyIndex, isLast, submit, answers])

    // Picking a level auto-advances to the next item — same interaction as
    // the base choice/scale questions, just scoped to this question's own
    // item stepper instead of the outer question index.
    const handleHabitSelect = useCallback((itemId: string, optionId: string) => {
        if (!question || question.type !== 'habit-checklist') return
        const existing = answers[question.id]
        const selections = existing?.type === 'habit-checklist' ? { ...existing.selections } : {}
        selections[itemId] = optionId
        const nextAnswers = { ...answers, [question.id]: { type: 'habit-checklist' as const, selections } }
        setAnswers(nextAnswers)
        setStarKey(k => k + 1)

        if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current)
        advanceTimeoutRef.current = setTimeout(() => {
            if (habitItemIndex < question.items.length - 1) {
                setHabitItemIndex(i => i + 1)
            } else if (isLast) {
                submit(nextAnswers)
            } else {
                setIndex(i => i + 1)
            }
        }, AUTO_ADVANCE_DELAY_MS)
    }, [question, answers, habitItemIndex, isLast, submit])

    const handleHabitBack = useCallback(() => {
        if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current)
        if (habitItemIndex > 0) {
            setHabitItemIndex(i => i - 1)
        } else if (index > 0) {
            setIndex(i => i - 1)
        }
    }, [habitItemIndex, index])

    return (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/40"
                onClick={phase === 'submitting' ? undefined : onClose}
                aria-hidden="true"
            />
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Capability Building Questionnaire"
                className="relative flex w-full max-w-3xl max-h-[90vh] flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
            >
                <div className="flex shrink-0 items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-pod-text">Capability Building Questionnaire</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="text-pod-muted hover:text-pod-text transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div ref={scrollAreaRef} className="min-h-0 flex-1 overflow-y-auto px-8 py-8">
                    {phase === 'splash' && (
                        <div className="text-center">
                            <div className="mx-auto w-16 h-16 rounded-full bg-pod-primary-light flex items-center justify-center">
                                <Sparkles className="w-7 h-7 text-pod-primary" />
                            </div>
                            <h3 className="mt-4 text-base font-bold text-pod-text">
                                {alreadyComplete ? 'Update your answers' : 'A few quick questions about how you work'}
                            </h3>
                            <p className="mt-2 text-sm text-pod-muted">
                                {alreadyComplete
                                    ? `Go through all ${total} questions again and change anything you'd like — your previous answers are already filled in.`
                                    : `${total} short questions, about 2 minutes. There are no right answers — this just helps us understand you better.`}
                            </p>
                            <button
                                type="button"
                                onClick={() => setPhase('taking')}
                                className="mt-6 px-6 py-2.5 bg-pod-primary text-pod-primary-foreground rounded-lg text-sm font-bold hover:bg-pod-primary-hover transition"
                            >
                                {alreadyComplete ? 'Continue' : 'Begin'}
                            </button>
                        </div>
                    )}

                    {phase === 'taking' && question && (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-semibold text-pod-muted">Question {index + 1} of {total}</span>
                                <div key={starKey} className="relative h-5 w-5">
                                    {currentAnswer && (
                                        <Star
                                            aria-hidden
                                            data-testid="capability-star"
                                            className="h-5 w-5 text-amber-400 fill-amber-400 animate-capability-star-pop"
                                        />
                                    )}
                                </div>
                            </div>

                            {index === 0 && question.type === 'text' && (
                                <div className="mb-4">
                                    <p className="text-lg font-bold text-pod-text">Hello {firstName}! 👋</p>
                                    {resumeEducation && (
                                        <p className="mt-1 text-xs text-pod-muted">
                                            <span className="font-semibold text-pod-text">Educational Qualification:</span> {resumeEducation}
                                        </p>
                                    )}
                                </div>
                            )}

                            {question.type !== 'multi-scale' && question.type !== 'diagnostic-panel' && question.type !== 'proficiency-matrix' && question.type !== 'habit-checklist' && (
                                <h3 className="text-base font-semibold text-pod-text mb-5">
                                    {question.prompt}
                                    {question.type === 'text' && question.optional && (
                                        <span className="ml-1.5 text-xs font-normal text-pod-muted">(optional)</span>
                                    )}
                                </h3>
                            )}

                            {question.type === 'multi-scale' && (
                                <div className="mb-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h3 className="text-base font-semibold text-pod-text">🔥 {question.title}</h3>
                                            <p className="mt-1 text-sm italic text-pod-muted">{question.description}</p>
                                        </div>
                                        <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-pod-primary-light px-3 py-1.5 text-xs font-bold text-pod-primary">
                                            ⚡ {multiScaleRatedCount}/{question.dimensions.length} rated
                                        </span>
                                    </div>

                                    <div className="mt-5 space-y-4">
                                        {question.dimensions.map(dim => {
                                            const scoreEntry = multiScaleAnswer?.type === 'multi-scale' ? multiScaleAnswer.scores[dim.id] : undefined
                                            return (
                                                <div
                                                    key={dim.id}
                                                    className={`rounded-xl border p-4 transition-colors ${
                                                        scoreEntry?.value != null
                                                            ? 'border-pod-primary-medium bg-pod-primary-light/40'
                                                            : 'border-pod-border bg-pod-bg-soft'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-lg">
                                                            {dim.emoji}
                                                        </span>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-sm font-semibold text-pod-text">{dim.label}</p>
                                                            <p className="mt-0.5 text-xs text-pod-muted leading-relaxed">{dim.focus}</p>
                                                        </div>
                                                        {scoreEntry?.value != null && (
                                                            <span key={scoreEntry.value} className="shrink-0 text-2xl animate-capability-star-pop">
                                                                {moodEmojiFor(scoreEntry.value)}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="mt-3">
                                                        <ScorePillRow
                                                            min={question.min}
                                                            max={question.max}
                                                            legend={question.scaleLegend}
                                                            value={scoreEntry?.value}
                                                            onSelect={v => updateMultiScale(dim.id, v)}
                                                        />
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {question.type === 'diagnostic-panel' && (
                                <div className="mb-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h3 className="text-base font-semibold text-pod-text">{question.emoji} {question.title}</h3>
                                            <p className="mt-1 text-sm italic text-pod-muted">{question.description}</p>
                                        </div>
                                        {diagnosticChoiceRows.length > 0 && (
                                            <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-pod-primary-light px-3 py-1.5 text-xs font-bold text-pod-primary">
                                                ⚡ {diagnosticAnsweredCount}/{diagnosticChoiceRows.length} answered
                                            </span>
                                        )}
                                    </div>

                                    <div className="mt-5 space-y-4">
                                        {question.rows.map(row => {
                                            const rowAnswer = diagnosticAnswer?.type === 'diagnostic-panel' ? diagnosticAnswer.rows[row.id] : undefined
                                            const isAnswered = row.type === 'text'
                                                ? Boolean(rowAnswer?.text?.trim())
                                                : Boolean(rowAnswer?.optionIds && rowAnswer.optionIds.length > 0)
                                            return (
                                                <div
                                                    key={row.id}
                                                    className={`rounded-xl border p-4 transition-colors ${
                                                        isAnswered ? 'border-pod-primary-medium bg-pod-primary-light/40' : 'border-pod-border bg-pod-bg-soft'
                                                    }`}
                                                >
                                                    <div className="mb-3 flex items-center gap-3">
                                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-lg">
                                                            {row.emoji}
                                                        </span>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-sm font-semibold text-pod-text">
                                                                {row.label}
                                                                {row.type === 'text' && (
                                                                    <span className="ml-1.5 text-xs font-normal text-pod-muted">(optional)</span>
                                                                )}
                                                            </p>
                                                            {row.type === 'text' && (
                                                                <p className="mt-0.5 text-xs text-pod-muted leading-relaxed">{row.description}</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {row.type === 'text' && (
                                                        <textarea
                                                            value={rowAnswer?.text ?? ''}
                                                            onChange={e => updateDiagnosticText(row.id, e.target.value)}
                                                            placeholder={row.placeholder}
                                                            rows={3}
                                                            className="w-full rounded-lg border border-pod-border bg-white px-3 py-2 text-sm text-pod-text outline-none transition resize-none focus:border-transparent focus:ring-2 focus:ring-pod-primary"
                                                        />
                                                    )}

                                                    {row.type === 'multi-choice' && (
                                                        <div className="flex flex-wrap gap-2">
                                                            {row.options.map(option => {
                                                                const selected = Boolean(rowAnswer?.optionIds?.includes(option.id))
                                                                return (
                                                                    <button
                                                                        key={option.id}
                                                                        type="button"
                                                                        onClick={() => updateDiagnosticChoice(row.id, option.id)}
                                                                        className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium transition-colors ${
                                                                            selected
                                                                                ? 'border-pod-primary bg-pod-primary-light text-pod-text'
                                                                                : 'border-pod-border bg-white text-pod-text hover:border-pod-primary-medium'
                                                                        }`}
                                                                    >
                                                                        {selected ? '✅' : '⬜'} {option.label}
                                                                    </button>
                                                                )
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {question.type === 'rank' && (
                                <div>
                                    <div className="mb-2 flex justify-end">
                                        <span className="inline-flex items-center gap-1 rounded-full bg-pod-primary-light px-3 py-1.5 text-xs font-bold text-pod-primary">
                                            🏆 {rankedCount}/{question.topN} ranked
                                        </span>
                                    </div>
                                    <RankPodium
                                        options={question.options}
                                        ranking={rankAnswer?.type === 'rank' ? rankAnswer.ranking : {}}
                                    />
                                    <div className="space-y-3">
                                        {question.options.map(option => {
                                            const rank = rankAnswer?.type === 'rank' ? rankAnswer.ranking[option.id] : undefined
                                            return (
                                                <div
                                                    key={option.id}
                                                    className={`flex items-center gap-3 rounded-xl border p-3.5 transition-colors ${rankCardClasses(rank)}`}
                                                >
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-semibold text-pod-text">{option.label}</p>
                                                        <p className="mt-0.5 text-xs text-pod-muted leading-relaxed">{option.description}</p>
                                                    </div>
                                                    <div className="flex shrink-0 gap-1.5">
                                                        {Array.from({ length: question.topN }, (_, i) => i + 1).map(rankValue => {
                                                            const selected = rank === rankValue
                                                            return (
                                                                <button
                                                                    key={rankValue}
                                                                    type="button"
                                                                    onClick={() => updateRank(option.id, rankValue)}
                                                                    title={`Rank ${rankValue}`}
                                                                    className={`flex h-9 w-9 items-center justify-center rounded-full text-base transition-all ${
                                                                        selected
                                                                            ? 'bg-white shadow-sm ring-2 ring-pod-primary scale-110 animate-capability-star-pop'
                                                                            : 'border border-pod-border bg-white opacity-50 hover:opacity-100 hover:border-pod-primary-medium'
                                                                    }`}
                                                                >
                                                                    {RANK_MEDALS[rankValue - 1]}
                                                                </button>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {question.type === 'proficiency-matrix' && currentCompetency && (
                                <div>
                                    <p className="text-[11px] font-bold uppercase tracking-widest text-pod-muted">{question.sectionLabel}</p>
                                    <div className="mt-1 flex items-start justify-between gap-3">
                                        <div>
                                            <h3 className="text-base font-semibold text-pod-text">📊 {question.title}</h3>
                                            <p className="mt-1 text-xs font-semibold text-pod-primary">
                                                Section {competencyIndex + 1} of {question.competencies.length}
                                            </p>
                                        </div>
                                        <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-pod-primary-light px-3 py-1.5 text-xs font-bold text-pod-primary">
                                            ⭐ {proficiencyAnsweredTotal}/{proficiencyTotalIndicators} rated
                                        </span>
                                    </div>

                                    <div className="mt-4 rounded-xl border border-pod-primary-medium bg-pod-primary-light p-4">
                                        <p className="text-sm font-bold text-pod-text">{currentCompetency.title}</p>
                                        <p className="mt-1 text-xs text-pod-text/80 leading-relaxed">{currentCompetency.description}</p>
                                    </div>

                                    <div className="mt-4 space-y-3">
                                        {currentCompetency.indicators.map((indicator, i) => {
                                            const value = proficiencyAnswer?.type === 'proficiency-matrix' ? proficiencyAnswer.scores[indicator.id] : undefined
                                            return (
                                                <div
                                                    key={indicator.id}
                                                    className={`rounded-xl border p-3.5 transition-colors ${
                                                        value != null ? 'border-pod-primary-medium bg-pod-primary-light/40' : 'border-pod-border bg-pod-bg-soft'
                                                    }`}
                                                >
                                                    <div className="flex items-start gap-2">
                                                        <p className="flex-1 text-sm text-pod-text">
                                                            <span className="mr-1.5 font-semibold text-pod-muted">{i + 1}.</span>
                                                            {indicator.label}
                                                        </p>
                                                        {value != null && (
                                                            <span key={value} className="shrink-0 text-xl animate-capability-star-pop">
                                                                {moodEmojiFor(value)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="mt-3">
                                                        <ScorePillRow
                                                            min={question.min}
                                                            max={question.max}
                                                            legend={question.scaleLegend}
                                                            value={value}
                                                            onSelect={v => updateProficiencyScore(indicator.id, v)}
                                                        />
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {question.type === 'habit-checklist' && (() => {
                                const habitItem = question.items[habitItemIndex]
                                const habitAnswer = answers[question.id]
                                const answeredCount = habitAnswer?.type === 'habit-checklist'
                                    ? question.items.filter(item => habitAnswer.selections[item.id] != null).length
                                    : 0
                                const selectedOptionId = habitAnswer?.type === 'habit-checklist' ? habitAnswer.selections[habitItem.id] : undefined
                                return (
                                    <div>
                                        <div className="mb-4 flex items-start justify-between gap-3">
                                            <div>
                                                <h3 className="text-base font-semibold text-pod-text">{question.title}</h3>
                                                <p className="mt-1 text-sm italic text-pod-muted">{question.description}</p>
                                            </div>
                                            <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-pod-primary-light px-3 py-1.5 text-xs font-bold text-pod-primary">
                                                🌟 {answeredCount}/{question.items.length} answered
                                            </span>
                                        </div>

                                        <div className="rounded-2xl border border-pod-border bg-pod-bg-soft p-6 text-center">
                                            <p className="text-xs font-semibold text-pod-muted">Item {habitItemIndex + 1} of {question.items.length}</p>
                                            <div className="mx-auto mt-3 flex h-14 w-14 items-center justify-center rounded-full bg-pod-primary-light text-3xl">
                                                {habitItem.emoji}
                                            </div>
                                            <h4 className="mt-3 text-lg font-bold text-pod-text">{habitItem.label}</h4>
                                        </div>

                                        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
                                            {question.options.map((option, i) => {
                                                const selected = selectedOptionId === option.id
                                                const style = HABIT_TIER_STYLES[i] ?? HABIT_TIER_STYLES[HABIT_TIER_STYLES.length - 1]
                                                return (
                                                    <button
                                                        key={option.id}
                                                        type="button"
                                                        onClick={() => handleHabitSelect(habitItem.id, option.id)}
                                                        className={`flex flex-col items-center gap-1.5 rounded-xl border-2 px-2 py-4 text-center transition-all ${
                                                            selected ? `${style.selected} scale-105 shadow-sm animate-capability-star-pop` : style.idle
                                                        }`}
                                                    >
                                                        <span className="text-2xl">{option.emoji}</span>
                                                        <span className="text-xs font-semibold">{option.label}</span>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )
                            })()}

                            {question.type === 'text' && (
                                <textarea
                                    value={textDraft}
                                    onChange={e => setTextDraft(e.target.value)}
                                    placeholder={question.placeholder}
                                    rows={4}
                                    className="w-full rounded-xl border border-pod-border bg-pod-bg-soft px-4 py-3 text-sm text-pod-text outline-none transition resize-none focus:border-transparent focus:ring-2 focus:ring-pod-primary"
                                />
                            )}

                            {question.type === 'choice' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {question.options.map(option => {
                                        const selected = currentAnswer?.type === 'choice' && currentAnswer.optionId === option.id
                                        return (
                                            <button
                                                key={option.id}
                                                type="button"
                                                onClick={() => selectAnswer({ type: 'choice', optionId: option.id })}
                                                className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium text-left transition-colors ${
                                                    selected
                                                        ? 'border-pod-primary bg-pod-primary-light text-pod-text'
                                                        : 'border-pod-border bg-pod-bg-soft text-pod-text hover:border-pod-primary-medium'
                                                }`}
                                            >
                                                <span className="text-lg">{option.emoji}</span>
                                                {option.label}
                                            </button>
                                        )
                                    })}
                                </div>
                            )}

                            {question.type === 'scale' && (
                                <div className="flex flex-wrap gap-2">
                                    {question.labels.map((label, i) => {
                                        const value = question.min + i
                                        const selected = currentAnswer?.type === 'scale' && currentAnswer.value === value
                                        return (
                                            <button
                                                key={value}
                                                type="button"
                                                onClick={() => selectAnswer({ type: 'scale', value })}
                                                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                                                    selected
                                                        ? 'border-pod-primary bg-pod-primary text-pod-primary-foreground'
                                                        : 'border-pod-border bg-pod-bg-soft text-pod-text hover:border-pod-primary-medium'
                                                }`}
                                            >
                                                {label}
                                            </button>
                                        )
                                    })}
                                </div>
                            )}

                            <div className="mt-7 flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={
                                        question.type === 'proficiency-matrix' ? handleProficiencyBack :
                                        question.type === 'habit-checklist' ? handleHabitBack :
                                        handleBack
                                    }
                                    disabled={
                                        question.type === 'proficiency-matrix' ? index === 0 && competencyIndex === 0 :
                                        question.type === 'habit-checklist' ? index === 0 && habitItemIndex === 0 :
                                        index === 0
                                    }
                                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-pod-muted hover:text-pod-text disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="h-4 w-4" /> Back
                                </button>
                                {question.type === 'text' && (
                                    <button
                                        type="button"
                                        onClick={handleTextNext}
                                        className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-bold bg-pod-primary text-pod-primary-foreground hover:bg-pod-primary-hover transition-colors"
                                    >
                                        {textDraft.trim() ? (isLast ? 'Finish' : 'Next') : 'Skip'} <ChevronRight className="h-4 w-4" />
                                    </button>
                                )}
                                {question.type === 'multi-scale' && (
                                    <button
                                        type="button"
                                        onClick={handleMultiScaleNext}
                                        disabled={!multiScaleComplete}
                                        title={!multiScaleComplete ? 'Rate all four dimensions to continue' : undefined}
                                        className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-bold bg-pod-primary text-pod-primary-foreground hover:bg-pod-primary-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        {isLast ? 'Finish' : 'Next'} <ChevronRight className="h-4 w-4" />
                                    </button>
                                )}
                                {question.type === 'diagnostic-panel' && (
                                    <button
                                        type="button"
                                        onClick={handleDiagnosticNext}
                                        disabled={!diagnosticComplete}
                                        title={!diagnosticComplete ? 'Pick at least one option in every preference list to continue' : undefined}
                                        className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-bold bg-pod-primary text-pod-primary-foreground hover:bg-pod-primary-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        {isLast ? 'Finish' : 'Next'} <ChevronRight className="h-4 w-4" />
                                    </button>
                                )}
                                {question.type === 'rank' && (
                                    <button
                                        type="button"
                                        onClick={handleRankNext}
                                        disabled={!rankComplete}
                                        title={!rankComplete ? `Rank your top ${question.topN} to continue` : undefined}
                                        className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-bold bg-pod-primary text-pod-primary-foreground hover:bg-pod-primary-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        {isLast ? 'Finish' : 'Next'} <ChevronRight className="h-4 w-4" />
                                    </button>
                                )}
                                {question.type === 'proficiency-matrix' && (
                                    <button
                                        type="button"
                                        onClick={handleProficiencyNext}
                                        disabled={!currentCompetencyComplete}
                                        title={!currentCompetencyComplete ? 'Rate every item in this section to continue' : undefined}
                                        className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-bold bg-pod-primary text-pod-primary-foreground hover:bg-pod-primary-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        {isLastCompetency ? (isLast ? 'Finish' : 'Next Question') : 'Next Section'} <ChevronRight className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {phase === 'submitting' && (
                        <div className="text-center py-6">
                            <Spinner size="lg" />
                            <p className="mt-3 text-sm text-pod-muted">Saving your answers…</p>
                        </div>
                    )}

                    {phase === 'done' && (
                        <div className="text-center">
                            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                            </div>
                            <h3 className="mt-4 text-base font-bold text-pod-text">Thanks for sharing!</h3>
                            <p className="mt-2 text-sm text-pod-muted">
                                Your reflection is saved — check your Dashboard for your capability snapshot.
                            </p>
                            <button
                                type="button"
                                onClick={onClose}
                                className="mt-6 px-6 py-2.5 bg-pod-primary text-pod-primary-foreground rounded-lg text-sm font-bold hover:bg-pod-primary-hover transition"
                            >
                                Close
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
