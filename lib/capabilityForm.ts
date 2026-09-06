/**
 * Question catalog and pure helpers for the Dashboard's "Capability Building"
 * questionnaire. This is the single source of truth for both the wizard
 * (CapabilityBuildingForm) and the post-completion chart (CapabilityInsightsCharts),
 * so a question's category name never drifts between the two.
 *
 * Copied verbatim from osmosis/lib/capabilityForm.ts.
 */

export type CapabilityCategory =
    | 'Communication'
    | 'Problem-Solving'
    | 'Collaboration'
    | 'Adaptability'
    | 'Leadership'
    | 'Technical Confidence'

export interface CapabilityChoiceOption {
    id: string
    label: string
    emoji: string
}

export interface CapabilityChoiceQuestion {
    id: string
    type: 'choice'
    prompt: string
    options: CapabilityChoiceOption[]
}

export interface CapabilityScaleQuestion {
    id: string
    type: 'scale'
    category: CapabilityCategory
    prompt: string
    min: number
    max: number
    /** One label per point on the scale (index 0 = min), e.g.
     *  ['Still learning', ..., 'Very comfortable'] — rendered as labeled
     *  pills rather than bare numbers. */
    labels: string[]
}

export type CapabilityQuestion = CapabilityChoiceQuestion | CapabilityScaleQuestion

export type CapabilityAnswer =
    | { type: 'choice'; optionId: string }
    | { type: 'scale'; value: number }

export type CapabilityAnswers = Record<string, CapabilityAnswer>

// 6 self-rating scale questions (become the radar chart's axes) interleaved
// with 3 lighter choice questions that add texture but aren't charted.
export const CAPABILITY_QUESTIONS: CapabilityQuestion[] = [
    {
        id: 'learning-style',
        type: 'choice',
        prompt: 'What best describes how you like to learn something new?',
        options: [
            { id: 'hands-on', label: 'Hands-on practice', emoji: '🛠️' },
            { id: 'demo', label: 'Watching a demo', emoji: '🎥' },
            { id: 'docs', label: 'Reading docs', emoji: '📖' },
            { id: 'discuss', label: 'Talking it through', emoji: '💬' },
        ],
    },
    {
        id: 'communication',
        type: 'scale',
        category: 'Communication',
        prompt: 'How comfortable are you explaining a complex idea to someone new to the topic?',
        min: 1,
        max: 5,
        labels: ['Still learning', 'Building confidence', 'Comfortable', 'Confident', 'Very comfortable'],
    },
    {
        id: 'problem-solving',
        type: 'scale',
        category: 'Problem-Solving',
        prompt: 'When facing an unfamiliar problem, how confident are you in figuring out a path forward?',
        min: 1,
        max: 5,
        labels: ['Not confident', 'Somewhat confident', 'Confident', 'Very confident', 'Extremely confident'],
    },
    {
        id: 'change-response',
        type: 'choice',
        prompt: 'When plans change at the last minute, you usually…',
        options: [
            { id: 'roll-with-it', label: 'Roll with it', emoji: '🌊' },
            { id: 'pause-adjust', label: 'Take a moment, then adjust', emoji: '🧘' },
            { id: 'thrown-off', label: 'Feel thrown off but manage', emoji: '😅' },
            { id: 'heads-up', label: 'Prefer a heads-up', emoji: '📅' },
        ],
    },
    {
        id: 'collaboration',
        type: 'scale',
        category: 'Collaboration',
        prompt: 'How comfortable are you giving and receiving feedback in a team setting?',
        min: 1,
        max: 5,
        labels: ['Still learning', 'Building confidence', 'Comfortable', 'Confident', 'Very comfortable'],
    },
    {
        id: 'adaptability',
        type: 'scale',
        category: 'Adaptability',
        prompt: 'How do you feel about jumping into a new tool or process with little guidance?',
        min: 1,
        max: 5,
        labels: ['Prefer guidance', 'Need some support', 'Adaptable', 'Very adaptable', 'Totally fine'],
    },
    {
        id: 'motivation',
        type: 'choice',
        prompt: 'What motivates you most day-to-day?',
        options: [
            { id: 'tricky', label: 'Solving something tricky', emoji: '🧩' },
            { id: 'learning', label: 'Learning something new', emoji: '🌱' },
            { id: 'helping', label: 'Helping someone else succeed', emoji: '🤝' },
            { id: 'progress', label: 'Seeing visible progress', emoji: '📈' },
        ],
    },
    {
        id: 'leadership',
        type: 'scale',
        category: 'Leadership',
        prompt: "How comfortable are you taking ownership of a task or project's outcome?",
        min: 1,
        max: 5,
        labels: ['Rather support', 'Occasionally lead', 'Comfortable leading', 'Confident leading', 'Very comfortable'],
    },
    {
        id: 'technical-confidence',
        type: 'scale',
        category: 'Technical Confidence',
        prompt: 'How confident are you applying your core skills to a new situation?',
        min: 1,
        max: 5,
        labels: ['Not confident', 'Somewhat confident', 'Confident', 'Very confident', 'Extremely confident'],
    },
]

export function isCapabilityFormComplete(answers: CapabilityAnswers): boolean {
    return CAPABILITY_QUESTIONS.every(q => answers[q.id] != null)
}

export interface CapabilityChartPoint {
    category: string
    value: number
}

/** Groups scale-question answers by category for the radar chart. Choice
 *  answers and unanswered questions are skipped rather than zero-filled, so a
 *  partial answer set never shows as "0 confidence" for a category. */
export function deriveScaleChartData(
    answers: CapabilityAnswers,
    questions: CapabilityQuestion[] = CAPABILITY_QUESTIONS
): CapabilityChartPoint[] {
    return questions.reduce<CapabilityChartPoint[]>((acc, q) => {
        if (q.type !== 'scale') return acc
        const answer = answers[q.id]
        if (answer?.type !== 'scale') return acc
        acc.push({ category: q.category, value: answer.value })
        return acc
    }, [])
}
