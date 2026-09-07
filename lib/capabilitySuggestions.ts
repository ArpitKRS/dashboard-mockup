import { deriveNumericSelfRatingPoints, type CapabilityAnswers } from './capabilityForm'

/**
 * Mock "AI" capability-building suggestion for the Profile Banner's AI
 * button: finds the lowest self-rated area across the questionnaire's two
 * numeric questions (Curiosity Drive, the Proficiency Matrix — see
 * deriveNumericSelfRatingPoints) and returns a canned nudge for it. Nothing
 * here calls a real model — small canned copy per label, same spirit as
 * futureRole.ts's mock role-matching table.
 */

const SUGGESTION_MESSAGES: Record<string, string> = {
    Technical: 'Try a hands-on deep dive into a system or tool you don’t fully understand yet — reverse-engineering something is one of the fastest ways to build technical intuition.',
    Empathic: 'In your next few conversations, try naming what you think the other person is feeling before you respond — it sharpens your read on unspoken context.',
    Systemic: 'Next time you spot a recurring issue, trace it back to its root cause before proposing a fix — connecting the dots is a practiced skill.',
    'Self-Curiosity': 'Ask a trusted colleague what they think triggers your best and worst reactions — outside perspective speeds up self-awareness.',
    Results: 'Pick one goal this week and define exactly what "done" looks like before you start — clear finish lines drive follow-through.',
    Decisiveness: 'Next time you’re stuck between two good options, give yourself a 10-minute timer to decide — practice deciding under time pressure.',
    Accountability: 'Volunteer to own one deliverable end-to-end this sprint, mistakes included — ownership is built by doing, not observing.',
    'Self-Awareness': 'Before your next 1:1, jot down what you think the other person cares about most right now, then check it against how the conversation actually goes.',
    Confidence: 'Speak up with your actual opinion in the next meeting where you’d normally stay quiet, even if you’re not fully sure.',
    'Stress Mgmt': 'Notice the next moment you feel rushed or provoked, and pause for one full breath before responding.',
    Credibility: 'Follow through on one small commitment today, on time, without being reminded — credibility compounds from small, consistent moments.',
    Flexibility: 'Next time you’re attached to an approach, ask someone to argue the opposite case — practice holding your position loosely.',
}

export interface CapabilitySuggestion {
    category: string
    title: string
    message: string
    currentLevel: number
    max: number
}

/** Picks the lowest-rated area (ties broken by question order, so the result
 *  is stable across renders) and returns its canned suggestion. Null when
 *  there isn't enough rated yet to compare. */
export function getCapabilitySuggestion(answers: CapabilityAnswers): CapabilitySuggestion | null {
    const points = deriveNumericSelfRatingPoints(answers)
    if (points.length < 2) return null

    const weakest = points.reduce((min, point) => (point.value < min.value ? point : min), points[0])
    const message = SUGGESTION_MESSAGES[weakest.label]
        ?? 'This came out as your lowest self-rating right now — a good candidate for deliberate practice this month.'

    return { category: weakest.label, title: `Build your ${weakest.label}`, message, currentLevel: weakest.value, max: 10 }
}
