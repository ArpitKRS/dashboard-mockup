'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { X, ChevronLeft, Star, Sparkles, CheckCircle2 } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import {
    CAPABILITY_QUESTIONS,
    type CapabilityAnswers,
    type CapabilityAnswer,
    isCapabilityFormComplete,
} from '@/lib/capabilityForm'

type Phase = 'splash' | 'taking' | 'submitting' | 'done' | 'error'

interface CapabilityBuildingFormProps {
    initialAnswers: CapabilityAnswers
    onClose: () => void
    onCompleted: (answers: CapabilityAnswers) => void
}

// Long enough to see the selection highlight and star pop before the view
// moves on, short enough that the flow still feels immediate.
const AUTO_ADVANCE_DELAY_MS = 500

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
export default function CapabilityBuildingForm({ initialAnswers, onClose, onCompleted }: CapabilityBuildingFormProps) {
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

    const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        return () => {
            if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current)
        }
    }, [])

    const question = CAPABILITY_QUESTIONS[index]
    const total = CAPABILITY_QUESTIONS.length
    const isLast = index === total - 1
    const currentAnswer = question ? answers[question.id] : undefined

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
                className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden"
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
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

                <div className="px-6 py-7">
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

                            <h3 className="text-base font-semibold text-pod-text mb-5">{question.prompt}</h3>

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

                            <div className="mt-7">
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    disabled={index === 0}
                                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-pod-muted hover:text-pod-text disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="h-4 w-4" /> Back
                                </button>
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
