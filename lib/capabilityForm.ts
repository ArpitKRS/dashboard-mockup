/**
 * Question catalog and pure helpers for the Dashboard's "Capability Building"
 * questionnaire. This is the single source of truth for both the wizard
 * (CapabilityBuildingForm) and the post-completion chart (CapabilityInsightsCharts),
 * so a question's category name never drifts between the two.
 *
 * Copied verbatim from osmosis/lib/capabilityForm.ts.
 */

import { PROFICIENCY_RADAR_LABELS } from './capabilityVisuals'

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

/** A free-text question — not chartable, so it's excluded from both
 *  getScaleQuestions and getChoiceQuestions. `optional` lets the wizard show
 *  a "(optional)" hint and an explicit Next/Skip control instead of the
 *  select-to-advance pattern the other two types use. */
export interface CapabilityTextQuestion {
    id: string
    type: 'text'
    prompt: string
    optional?: boolean
    placeholder?: string
}

/** One row of a multi-scale question's table (e.g. "Curiosity Drive"'s four
 *  dimensions) — `focus` is the row's "Assessment Focus" description, shown
 *  alongside its own 1..max score, since a single number can't stand in for
 *  the whole row on its own. `emoji` badges the row in the wizard. */
export interface CapabilityDimension {
    id: string
    label: string
    focus: string
    emoji: string
}

/** A composite question scored per-dimension rather than once overall (the
 *  real "Curiosity Drive" section: one category, four independently-rated
 *  facets, each with its own assessment focus) — not chartable the same way
 *  a CapabilityScaleQuestion is, so it's excluded from getScaleQuestions
 *  until its own multi-axis visual exists. */
export interface CapabilityMultiScaleQuestion {
    id: string
    type: 'multi-scale'
    category: CapabilityCategory
    title: string
    description: string
    min: number
    max: number
    /** Anchor points along the scale, e.g. [{value:1,label:'Low'},
     *  {value:5,label:'Medium'},{value:10,label:'High'}] — driven off this
     *  rather than hardcoded so a different multi-scale question can use a
     *  different range without touching the wizard's rendering. */
    scaleLegend: { value: number; label: string }[]
    dimensions: CapabilityDimension[]
}

/** A free-text row inside a diagnostic panel (e.g. "Work That Energizes
 *  You") — always optional, since it asks for an open-ended written list
 *  rather than a single rateable fact. */
export interface CapabilityDiagnosticTextRow {
    id: string
    type: 'text'
    label: string
    description: string
    emoji: string
    placeholder?: string
}

/** A "select all that apply" row inside a diagnostic panel (e.g. "Autonomy
 *  Level Preference") — the source doc draws these as checkboxes, not a
 *  single-pick radio group, so more than one option can be active at once. */
export interface CapabilityDiagnosticChoiceRow {
    id: string
    type: 'multi-choice'
    label: string
    emoji: string
    options: { id: string; label: string }[]
}

export type CapabilityDiagnosticRow = CapabilityDiagnosticTextRow | CapabilityDiagnosticChoiceRow

/** A whole diagnostic section rendered as one wizard step (e.g. "Energy
 *  Dynamics & Operational Drive"): a mix of open-ended lists and multi-select
 *  preference checklists, none of which reduce to a single rateable number —
 *  unlike CapabilityScaleQuestion/CapabilityMultiScaleQuestion this has no
 *  `category`, since it doesn't feed the 6-category self-rating system. */
export interface CapabilityDiagnosticQuestion {
    id: string
    type: 'diagnostic-panel'
    title: string
    emoji: string
    description: string
    rows: CapabilityDiagnosticRow[]
}

/** One rankable item in a CapabilityRankQuestion (e.g. one of the 7 "driver"
 *  archetypes) — `description` is the "Core Professional Value" copy shown
 *  alongside it, since the option's name alone doesn't carry enough to rank
 *  it against the others. */
export interface CapabilityRankOption {
    id: string
    label: string
    description: string
}

/** "Rank your top N" — a fixed-size ordering drawn from a larger option set
 *  (e.g. pick and order the top 3 of 7 drivers), not a single-pick or
 *  select-all-that-apply. Each rank (1..topN) can belong to at most one
 *  option at a time; picking a rank already held elsewhere moves it rather
 *  than duplicating it, so completion is just "topN options are ranked". */
export interface CapabilityRankQuestion {
    id: string
    type: 'rank'
    prompt: string
    topN: number
    options: CapabilityRankOption[]
}

/** One numbered behavioral statement inside a proficiency-matrix competency
 *  (e.g. "Develops challenging but achievable goals.") — rated on the same
 *  1..max scale as every other indicator in the question. */
export interface CapabilityProficiencyIndicator {
    id: string
    label: string
}

/** One competency group of a proficiency matrix (e.g. "Results
 *  Orientation") — a short definition plus its own set of rateable
 *  indicators, shown one competency at a time in the wizard so a
 *  41-indicator matrix never dumps everything on screen at once. */
export interface CapabilityProficiencyCompetency {
    id: string
    title: string
    description: string
    indicators: CapabilityProficiencyIndicator[]
}

/** A large self-rating matrix organized into competency groups, each with
 *  several 1..max-rated behavioral indicators — structurally like several
 *  CapabilityMultiScaleQuestions stacked together, but too big to show at
 *  once, so the wizard paginates through `competencies` internally (its own
 *  section-to-section stepper) rather than exposing 40+ items in one step.
 *  No `category`: this doesn't feed the 6-category radar system. */
export interface CapabilityProficiencyMatrixQuestion {
    id: string
    type: 'proficiency-matrix'
    title: string
    sectionLabel: string
    min: number
    max: number
    scaleLegend: { value: number; label: string }[]
    competencies: CapabilityProficiencyCompetency[]
}

/** One of the shared frequency levels a habit-checklist item is rated
 *  against (e.g. "Is 2nd Nature" .. "Not at all") — shared across every item
 *  in the question, unlike a CapabilityChoiceQuestion's options which belong
 *  to just one question. */
export interface CapabilityFrequencyOption {
    id: string
    label: string
    emoji: string
}

/** One row of a habit checklist (e.g. "Proactive Time Management") — just a
 *  label/emoji; the actual answer is which shared CapabilityFrequencyOption
 *  applies to it. */
export interface CapabilityHabitItem {
    id: string
    label: string
    emoji: string
}

/** A set of habit/soft-skill items each rated via a single pick from the
 *  same shared frequency scale — shown one item at a time (auto-advancing
 *  on pick, like the base choice/scale questions do) rather than all at once
 *  like CapabilityDiagnosticQuestion, since each item needs only one tap. */
export interface CapabilityHabitChecklistQuestion {
    id: string
    type: 'habit-checklist'
    title: string
    description: string
    options: CapabilityFrequencyOption[]
    items: CapabilityHabitItem[]
}

export type CapabilityQuestion =
    | CapabilityChoiceQuestion
    | CapabilityScaleQuestion
    | CapabilityTextQuestion
    | CapabilityMultiScaleQuestion
    | CapabilityDiagnosticQuestion
    | CapabilityRankQuestion
    | CapabilityProficiencyMatrixQuestion
    | CapabilityHabitChecklistQuestion

export type CapabilityAnswer =
    | { type: 'choice'; optionId: string }
    | { type: 'scale'; value: number }
    | { type: 'text'; value: string }
    | { type: 'multi-scale'; scores: Record<string, { value?: number }> }
    | { type: 'diagnostic-panel'; rows: Record<string, { text?: string; optionIds?: string[] }> }
    | { type: 'rank'; ranking: Record<string, number> }
    | { type: 'proficiency-matrix'; scores: Record<string, number> }
    | { type: 'habit-checklist'; selections: Record<string, string> }

export type CapabilityAnswers = Record<string, CapabilityAnswer>

// 6 self-rating scale questions (become the radar chart's axes) interleaved
// with 3 lighter choice questions that add texture but aren't charted.
export const CAPABILITY_QUESTIONS: CapabilityQuestion[] = [
    {
        id: 'future-study-plans',
        type: 'text',
        prompt: 'What are your future study plans?',
        optional: true,
        placeholder: 'e.g. A certification in cloud architecture, or a master’s degree in...',
    },
    {
        id: 'curiosity-drive',
        type: 'multi-scale',
        category: 'Adaptability',
        title: 'Curiosity Drive',
        description: 'This predicts your rate of growth and adaptability.',
        min: 1,
        max: 10,
        scaleLegend: [
            { value: 1, label: 'Low' },
            { value: 5, label: 'Medium' },
            { value: 10, label: 'High' },
        ],
        dimensions: [
            {
                id: 'technical',
                label: 'Technical (Craft)',
                focus: 'Drive to understand "how things work" (e.g., deep diving into data, self-taught skills).',
                emoji: '🛠️',
            },
            {
                id: 'empathic',
                label: 'Empathic (Social)',
                focus: "Drive to understand \"how people feel / think\" (e.g., asking about others' perspectives).",
                emoji: '🤝',
            },
            {
                id: 'systemic',
                label: 'Systemic (Strategic)',
                focus: 'Drive to understand "how it all connects" (e.g., questioning status quo, looking for root causes, connecting the dots).',
                emoji: '🧠',
            },
            {
                id: 'self-curiosity',
                label: 'Self-Curiosity (Internal)',
                focus: 'Drive to understand "why I react this way" (e.g., seeking feedback, examining failures).',
                emoji: '🔍',
            },
        ],
    },
    {
        id: 'energy-dynamics',
        type: 'diagnostic-panel',
        title: 'Energy Dynamics & Operational Drive',
        emoji: '🔋',
        description: 'This identifies "in-the-flow" activities and the burnout risks that come with your work-style preferences.',
        rows: [
            {
                id: 'energizing-work',
                type: 'text',
                label: 'Work That Energizes You',
                description: 'List the work activities where time disappears and you feel fulfilled (flow).',
                emoji: '⚡',
                placeholder: 'e.g. Deep-diving into a gnarly data problem, mentoring a teammate, designing a new feature end-to-end…',
            },
            {
                id: 'draining-work',
                type: 'text',
                label: 'Work That Drains You',
                description: 'List the work activities that tend to de-motivate you (drained).',
                emoji: '🪫',
                placeholder: 'e.g. Long status-update meetings, repetitive manual QA, chasing approvals across teams…',
            },
            {
                id: 'autonomy-preference',
                type: 'multi-choice',
                label: 'Autonomy Level Preference',
                emoji: '🧭',
                options: [
                    { id: 'freedom', label: 'Freedom to plan your own work and try your own ideas' },
                    { id: 'resourceful', label: 'Resourceful in solving problems with limited resources' },
                    { id: 'guided', label: 'Preference for guided instructions' },
                ],
            },
            {
                id: 'cognitive-style-preference',
                type: 'multi-choice',
                label: 'Cognitive Style Preference',
                emoji: '🧩',
                options: [
                    { id: 'theoretical', label: 'Preference for Theoretical / Abstract Work' },
                    { id: 'strategic', label: 'Preference for Strategic / High-Stakes Decisions' },
                    { id: 'data-driven', label: 'Preference for Written / Data-Driven Communication' },
                ],
            },
            {
                id: 'organisational-scale-preference',
                type: 'multi-choice',
                label: 'Organisational Scale Preference',
                emoji: '🏢',
                options: [
                    { id: 'people-centric', label: 'Preference for People-Centric / Social Work' },
                    { id: 'small-fast-moving', label: 'Preference for Small / Fast-Moving Organizations' },
                    { id: 'large-established', label: 'Preference for Large / Established Organizations with clear structure and deep institutional history' },
                ],
            },
            {
                id: 'interactions-preference',
                type: 'multi-choice',
                label: 'Interactions Preference',
                emoji: '🧑‍🤝‍🧑',
                options: [
                    { id: 'people', label: 'Preference to work with People' },
                    { id: 'tools', label: 'Preference to work with Tools / Things' },
                    { id: 'process', label: 'Preference to work with Process' },
                    { id: 'technical-systems', label: 'Preference to work with Technical systems and data handling' },
                    { id: 'one-on-one', label: 'Interaction on a one-on-one basis' },
                    { id: 'small-groups', label: 'Interaction with small groups' },
                    { id: 'bigger-groups', label: 'Interaction with bigger groups' },
                ],
            },
        ],
    },
    {
        id: 'top-drivers',
        type: 'rank',
        prompt: 'Rank your top three drivers in the list below (1 being your highest driver).',
        topN: 3,
        options: [
            {
                id: 'clarity-of-vision',
                label: 'Clarity of Vision',
                description: 'Providing insight, defining ethical direction, and articulating strategic integrity.',
            },
            {
                id: 'administration',
                label: 'Administration',
                description: 'Establishing order, building efficient systems, and managing logistical excellence.',
            },
            {
                id: 'teaching',
                label: 'Teaching',
                description: 'Simplifying complex information and ensuring clear, foundational understanding and knowledge transfer.',
            },
            {
                id: 'exhortation',
                label: 'Exhortation',
                description: 'Providing direct, challenging counsel to push individuals and teams toward peak performance.',
            },
            {
                id: 'giving',
                label: 'Giving',
                description: 'Resource allocation, financial stewardship, and strategic deployment of assets to meet organizational needs.',
            },
            {
                id: 'service',
                label: 'Service',
                description: 'Providing practical, hands-on help, meeting immediate needs, and tangible assistance.',
            },
            {
                id: 'empathy',
                label: 'Empathy',
                description: 'Offering unconditional support, easing burdens, and fostering relational harmony and care.',
            },
        ],
    },
    {
        id: 'capability-proficiency-matrix',
        type: 'proficiency-matrix',
        title: 'Capability Proficiency Matrix',
        sectionLabel: 'Competencies Dealing with Self-Management',
        min: 1,
        max: 10,
        scaleLegend: [
            { value: 1, label: 'Low' },
            { value: 5, label: 'Medium' },
            { value: 10, label: 'High' },
        ],
        competencies: [
            {
                id: 'results-orientation',
                title: 'Results Orientation',
                description: "The ability to focus on the desired result of one's own or team's work, setting challenging goals, focusing effort on the goals, and meeting or exceeding them.",
                indicators: [
                    { id: 'ro-1', label: 'Develops challenging but achievable goals.' },
                    { id: 'ro-2', label: 'Develops clear goals for projects.' },
                    { id: 'ro-3', label: 'Maintains commitment to goals in the face of obstacles and frustrations.' },
                    { id: 'ro-4', label: 'Finds or creates ways to measure performance against goals.' },
                    { id: 'ro-5', label: 'Exerts unusual effort over time to achieve a goal.' },
                    { id: 'ro-6', label: 'Has a strong sense of urgency about solving problems and getting work done.' },
                    { id: 'ro-7', label: 'Keeps both long-term and short-term needs in mind, ensuring business continuity at all times.' },
                ],
            },
            {
                id: 'decisiveness',
                title: 'Decisiveness',
                description: 'The ability to make difficult decisions in a timely manner.',
                indicators: [
                    { id: 'dec-1', label: 'Is willing to make decisions in difficult or ambiguous situations when time is critical.' },
                    { id: 'dec-2', label: 'Takes charge of a group when necessary to facilitate change, overcome an impasse, face issues, or ensure decisions are made.' },
                ],
            },
            {
                id: 'accountability',
                title: 'Accountability',
                description: 'The ability to consistently demonstrate integrity and trustworthiness even under pressure.',
                indicators: [
                    { id: 'acc-1', label: 'Acts with a strong moral compass, earning the trust of peers and leaders.' },
                    { id: 'acc-2', label: 'Takes responsibility for actions and results, demonstrating reliability, integrity, and a commitment to quality.' },
                ],
            },
            {
                id: 'self-interpersonal-awareness',
                title: 'Self-Awareness and Interpersonal Awareness',
                description: "The ability to notice, interpret, and anticipate own and others' concerns and feelings, and to communicate this awareness empathetically to others.",
                indicators: [
                    { id: 'sia-1', label: 'Understands the interests and important concerns of oneself and others.' },
                    { id: 'sia-2', label: "Notices and accurately interprets what oneself and others are feeling, based on one's own thoughts (self-talk), others' choice of words, tone of voice, expressions, and other nonverbal behaviour." },
                    { id: 'sia-3', label: 'Anticipates how oneself and others might react to a situation.' },
                    { id: 'sia-4', label: "Listens attentively to one's own and others' ideas and concerns." },
                    { id: 'sia-5', label: 'Understands both the strengths and weaknesses of oneself and others.' },
                    { id: 'sia-6', label: 'Observes and processes the unspoken meaning in a situation.' },
                    { id: 'sia-7', label: "Says or does things to address one's own and others' concerns." },
                    { id: 'sia-8', label: 'Finds non-threatening ways to approach others about sensitive issues while balancing self-care.' },
                    { id: 'sia-9', label: 'Makes others feel comfortable by responding in ways that convey interest in what they have to say, without resentment, internal conflict, or double standards.' },
                ],
            },
            {
                id: 'self-confidence',
                title: 'Self-Confidence',
                description: "Faith in one's own ideas and capability to be successful; willingness to take an independent position in the face of opposition.",
                indicators: [
                    { id: 'sc-1', label: "Is confident in one's own ability to accomplish goals." },
                    { id: 'sc-2', label: 'Presents oneself crisply and impressively.' },
                    { id: 'sc-3', label: 'Is willing to speak up to the right person or group at the right time, when one disagrees with a decision or strategy.' },
                    { id: 'sc-4', label: 'Approaches challenging tasks with a "can-do" attitude.' },
                ],
            },
            {
                id: 'stress-management',
                title: 'Stress Management',
                description: 'The ability to keep functioning effectively when under pressure and maintain self-control in the face of hostility or provocation.',
                indicators: [
                    { id: 'sm-1', label: "Is confident in one's own ability to accomplish goals." },
                    { id: 'sm-2', label: 'Remains calm under stress.' },
                    { id: 'sm-3', label: 'Can effectively handle several problems or tasks at once.' },
                    { id: 'sm-4', label: "Controls one's response when criticized, attacked, or provoked." },
                    { id: 'sm-5', label: 'Maintains a sense of humour under difficult circumstances.' },
                    { id: 'sm-6', label: 'Manages own behaviour to prevent or reduce feelings of stress.' },
                ],
            },
            {
                id: 'personal-credibility',
                title: 'Personal Credibility',
                description: 'Demonstrated concern that one be perceived as responsible, reliable, and trustworthy.',
                indicators: [
                    { id: 'pc-1', label: 'Does what one commits to doing.' },
                    { id: 'pc-2', label: 'Respects the confidentiality of information or concerns shared by others.' },
                    { id: 'pc-3', label: 'Is honest and forthright with people.' },
                    { id: 'pc-4', label: "Carries one's fair share of the workload." },
                    { id: 'pc-5', label: 'Takes responsibility for own mistakes; does not blame others.' },
                ],
            },
            {
                id: 'flexibility-agility',
                title: 'Flexibility / Agility',
                description: "Openness to different and new ways of doing things; willingness to modify one's preferred way of doing things.",
                indicators: [
                    { id: 'fa-1', label: "Is able to see the merits of perspectives other than one's own." },
                    { id: 'fa-2', label: 'Demonstrates openness to change.' },
                    { id: 'fa-3', label: 'Switches to a different strategy when an initially selected one is unsuccessful.' },
                    { id: 'fa-4', label: 'Demonstrates willingness to modify a strongly held position in the face of contrary evidence.' },
                    { id: 'fa-5', label: 'Learns continuously, making a better version of self with each passing day.' },
                    { id: 'fa-6', label: "Teachable / Coachability: speed of discarding old rules and learning new ones; ability to absorb correction and integrate feedback without defensiveness." },
                ],
            },
        ],
    },
    {
        id: 'values-and-habits',
        type: 'habit-checklist',
        title: 'Values & Habits Check',
        description: 'This tracks your desired soft skills and how consistently you practice them.',
        options: [
            { id: 'second-nature', label: 'Is 2nd Nature', emoji: '⭐' },
            { id: 'often', label: 'Often', emoji: '👍' },
            { id: 'regularly', label: 'Regularly', emoji: '🔁' },
            { id: 'sometimes', label: 'Sometimes', emoji: '😐' },
            { id: 'not-at-all', label: 'Not at all', emoji: '🚫' },
        ],
        items: [
            { id: 'proactive-time-management', label: 'Proactive Time Management', emoji: '⏰' },
            { id: 'proactive-expectation-management', label: 'Proactive Expectation Management', emoji: '🗣️' },
            { id: 'completion-of-tasks-on-time', label: 'Completion of Tasks on Time', emoji: '✅' },
            { id: 'accurate-thorough-analysis', label: 'Accurate / Thorough Analysis in Problem Definition', emoji: '🔍' },
            { id: 'verify-assumptions', label: 'Makes Effort to Verify Assumptions', emoji: '🧐' },
            { id: 'use-job-aids', label: 'Uses Job Aids to Help Oneself', emoji: '🧰' },
            { id: 'others-centric', label: 'Is Others Centric', emoji: '🤝' },
            { id: 'ask-probing-questions', label: 'Asks Probing Questions', emoji: '❓' },
            { id: 'outcome-focused', label: 'Is Outcome Focused', emoji: '🎯' },
            { id: 'critical-independent-thinking', label: 'Critical Independent Thinking', emoji: '🧠' },
            { id: 'managing-conflict', label: "Managing Conflict", emoji: '⚖️' },
            { id: 'managing-own-growth', label: "Managing One's Own Growth", emoji: '🌱' },
        ],
    },
    {
        id: 'growth-goals-alignment',
        type: 'diagnostic-panel',
        title: 'Growth Goals & Alignment',
        emoji: '🌱',
        description: 'This identifies the gaps for action — self-tracking for growth as you consider the next organisation you plan to join.',
        rows: [
            {
                id: 'attitudes-and-values',
                type: 'text',
                label: 'Attitudes and Values',
                description: "Attitudes and values you've developed, or are in the process of developing.",
                emoji: '🧭',
                placeholder: 'e.g. Leading with empathy, holding a high bar for quality, staying curious under pressure…',
            },
            {
                id: 'known-strengths',
                type: 'text',
                label: 'Known Areas of Strength',
                description: 'Strengths as observed by yourself and others.',
                emoji: '💪',
                placeholder: 'e.g. Clear written communication, staying calm during incidents…',
            },
            {
                id: 'known-weaknesses',
                type: 'text',
                label: 'Known Areas of Weakness / Baggage',
                description: 'Areas to improve, as observed by yourself and others.',
                emoji: '🧳',
                placeholder: 'e.g. Delegating earlier, being more concise in meetings…',
            },
            {
                id: 'past-responsibilities',
                type: 'text',
                label: 'Past Responsibilities',
                description: "Indicate which responsibilities you've had, and which you'd like to have more or less of.",
                emoji: '📋',
                placeholder: 'e.g. Owned the onboarding flow rewrite, ran weekly stand-ups…',
            },
            {
                id: 'responsibilities-more-of',
                type: 'text',
                label: "Responsibilities You'd Like More Of",
                description: "More of the responsibilities you'd like to take on next.",
                emoji: '📈',
                placeholder: 'e.g. Mentoring, cross-team architecture decisions…',
            },
            {
                id: 'responsibilities-less-of',
                type: 'text',
                label: "Responsibilities You'd Like Less Of",
                description: "Responsibilities you'd like to hand off or do less of.",
                emoji: '📉',
                placeholder: 'e.g. Manual QA sign-off, routine status reporting…',
            },
        ],
    },
]

export function isCapabilityFormComplete(answers: CapabilityAnswers): boolean {
    return CAPABILITY_QUESTIONS.every(q => {
        if (q.type === 'text' && q.optional) return true
        if (q.type === 'multi-scale') {
            const answer = answers[q.id]
            return answer?.type === 'multi-scale' && q.dimensions.every(d => answer.scores[d.id]?.value != null)
        }
        if (q.type === 'diagnostic-panel') {
            const answer = answers[q.id]
            // The free-text rows are optional reflections — only the
            // multi-choice rows (a real "select all that apply") gate
            // completion, and each needs at least one option picked.
            return q.rows.every(row => {
                if (row.type === 'text') return true
                const picked = answer?.type === 'diagnostic-panel' ? answer.rows[row.id]?.optionIds : undefined
                return Boolean(picked && picked.length > 0)
            })
        }
        if (q.type === 'rank') {
            const answer = answers[q.id]
            return answer?.type === 'rank' && Object.keys(answer.ranking).length === q.topN
        }
        if (q.type === 'proficiency-matrix') {
            const answer = answers[q.id]
            return q.competencies.every(c => c.indicators.every(
                ind => answer?.type === 'proficiency-matrix' && answer.scores[ind.id] != null
            ))
        }
        if (q.type === 'habit-checklist') {
            const answer = answers[q.id]
            return q.items.every(item => answer?.type === 'habit-checklist' && answer.selections[item.id] != null)
        }
        return answers[q.id] != null
    })
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

export interface CompetencyAverage {
    competencyId: string
    title: string
    /** Mean of this competency's answered indicators, or null if none are
     *  answered yet — never zero-filled, same reasoning as deriveScaleChartData. */
    average: number | null
    indicatorCount: number
    answeredCount: number
}

/** One average per competency group (not per indicator — 41 individual
 *  points would be unreadable) for the Capability Proficiency Matrix's radar
 *  chart, shared by the web snapshot and the PDF export. */
export function deriveProficiencyCompetencyAverages(
    question: CapabilityProficiencyMatrixQuestion,
    answers: CapabilityAnswers
): CompetencyAverage[] {
    const answer = answers[question.id]
    return question.competencies.map(c => {
        const scores = c.indicators
            .map(ind => (answer?.type === 'proficiency-matrix' ? answer.scores[ind.id] : undefined))
            .filter((v): v is number => v != null)
        const average = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null
        return { competencyId: c.id, title: c.title, average, indicatorCount: c.indicators.length, answeredCount: scores.length }
    })
}

export interface NumericSelfRatingPoint {
    label: string
    value: number
}

/** Pools every 1..10 numeric self-rating in the questionnaire — Curiosity
 *  Drive's 4 dimensions and the Proficiency Matrix's 8 competency averages —
 *  into one flat list. Single source for "strongest/weakest area" logic
 *  (the Capability Snapshot's insight banner in both the web grid and the
 *  PDF, and the Profile Banner's AI suggestion), which otherwise silently
 *  drift out of sync across three separate reimplementations. */
export function deriveNumericSelfRatingPoints(answers: CapabilityAnswers): NumericSelfRatingPoint[] {
    const points: NumericSelfRatingPoint[] = []

    const multiScaleQuestion = CAPABILITY_QUESTIONS.find((q): q is CapabilityMultiScaleQuestion => q.type === 'multi-scale')
    if (multiScaleQuestion) {
        const answer = answers[multiScaleQuestion.id]
        multiScaleQuestion.dimensions.forEach(d => {
            const v = answer?.type === 'multi-scale' ? answer.scores[d.id]?.value : undefined
            if (v != null) points.push({ label: d.label.split(' (')[0], value: v })
        })
    }

    const matrixQuestion = CAPABILITY_QUESTIONS.find((q): q is CapabilityProficiencyMatrixQuestion => q.type === 'proficiency-matrix')
    if (matrixQuestion) {
        deriveProficiencyCompetencyAverages(matrixQuestion, answers).forEach(a => {
            if (a.average != null) points.push({ label: PROFICIENCY_RADAR_LABELS[a.competencyId] ?? a.title, value: a.average })
        })
    }

    return points
}

