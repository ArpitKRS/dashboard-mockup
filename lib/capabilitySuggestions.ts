import { deriveScaleChartData, type CapabilityAnswers, type CapabilityCategory } from './capabilityForm'

/**
 * Mock "AI" capability-building suggestion for the Profile Banner's AI
 * button: finds the lowest self-rated category from the Capability Building
 * questionnaire and returns a canned nudge for it. Nothing here calls a real
 * model — small canned copy per category, same spirit as futureRole.ts's
 * mock role-matching table.
 */

const SUGGESTION_COPY: Record<CapabilityCategory, { title: string; message: string }> = {
    Communication: {
        title: 'Sharpen your Communication',
        message: "Try explaining a recent project to someone outside your team, or write a short summary of a complex topic — small reps build big confidence.",
    },
    'Problem-Solving': {
        title: 'Grow your Problem-Solving',
        message: 'Pick one open-ended challenge this week without looking up the answer first — sitting with ambiguity is the skill itself.',
    },
    Collaboration: {
        title: 'Strengthen your Collaboration',
        message: 'Ask a teammate for feedback on something you shipped recently, and offer feedback in return — both directions count.',
    },
    Adaptability: {
        title: 'Build your Adaptability',
        message: 'Volunteer for a task outside your usual routine or toolset this month — comfort with the unfamiliar grows with exposure.',
    },
    Leadership: {
        title: 'Develop your Leadership',
        message: 'Take ownership of one small decision end-to-end this sprint, even if it is not formally "yours" to own.',
    },
    'Technical Confidence': {
        title: 'Boost your Technical Confidence',
        message: 'Revisit a fundamental you rarely use day-to-day — refreshing the basics often unlocks confidence in the advanced work.',
    },
}

export interface CapabilitySuggestion {
    category: CapabilityCategory
    title: string
    message: string
    currentLevel: number
}

/** Picks the lowest-rated category (ties broken by question order, so the
 *  result is stable across renders) and returns its canned suggestion. Null
 *  when there's nothing to rate yet. */
export function getCapabilitySuggestion(answers: CapabilityAnswers): CapabilitySuggestion | null {
    const points = deriveScaleChartData(answers)
    if (points.length === 0) return null

    const weakest = points.reduce((min, point) => (point.value < min.value ? point : min), points[0])
    const category = weakest.category as CapabilityCategory
    const copy = SUGGESTION_COPY[category]

    return { category, title: copy.title, message: copy.message, currentLevel: weakest.value }
}
