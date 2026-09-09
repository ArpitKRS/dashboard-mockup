import type { CapabilityAnswers } from '@/lib/capabilityForm'

/**
 * A fully-answered Capability Building Form for the mock member ("Jordan
 * Ellis" — see mockResumeData.ts/mockTestimonialsData.ts for the same
 * persona) — every question below is filled in, so isCapabilityFormComplete
 * returns true out of the box and CapabilityGraphGrid renders every card
 * instead of an empty questionnaire prompt. Scores vary deliberately (not a
 * flat 9/10 everywhere) so the self-rating charts read as an authentic
 * assessment rather than a placeholder.
 */
export const MOCK_CAPABILITY_ANSWERS: CapabilityAnswers = {
    'future-study-plans': {
        type: 'text',
        value: 'Pursuing an AWS Solutions Architect – Professional certification, and exploring a part-time systems design course.',
    },
    'curiosity-drive': {
        type: 'multi-scale',
        scores: {
            technical: { value: 8 },
            empathic: { value: 6 },
            systemic: { value: 7 },
            'self-curiosity': { value: 7 },
        },
    },
    'energy-dynamics': {
        type: 'diagnostic-panel',
        rows: {
            'energizing-work': { text: 'Deep-diving into a gnarly performance bug, mentoring a teammate through their first PR, and designing a new feature end-to-end.' },
            'draining-work': { text: 'Long status-update meetings with no clear decision, and chasing approvals across multiple teams.' },
            'autonomy-preference': { optionIds: ['freedom', 'resourceful'] },
            'cognitive-style-preference': { optionIds: ['strategic', 'data-driven'] },
            'organisational-scale-preference': { optionIds: ['small-fast-moving'] },
            'interactions-preference': { optionIds: ['people', 'technical-systems', 'small-groups'] },
        },
    },
    'top-drivers': {
        type: 'rank',
        ranking: { teaching: 1, 'clarity-of-vision': 2, service: 3 },
    },
    'capability-proficiency-matrix': {
        type: 'proficiency-matrix',
        scores: {
            'ro-1': 8, 'ro-2': 9, 'ro-3': 8, 'ro-4': 7, 'ro-5': 8, 'ro-6': 9, 'ro-7': 7,
            'dec-1': 7, 'dec-2': 6,
            'acc-1': 9, 'acc-2': 9,
            'sia-1': 7, 'sia-2': 8, 'sia-3': 7, 'sia-4': 8, 'sia-5': 7, 'sia-6': 6, 'sia-7': 7, 'sia-8': 6, 'sia-9': 8,
            'sc-1': 8, 'sc-2': 7, 'sc-3': 6, 'sc-4': 8,
            'sm-1': 7, 'sm-2': 6, 'sm-3': 7, 'sm-4': 6, 'sm-5': 8, 'sm-6': 6,
            'pc-1': 9, 'pc-2': 9, 'pc-3': 9, 'pc-4': 8, 'pc-5': 8,
            'fa-1': 8, 'fa-2': 8, 'fa-3': 7, 'fa-4': 7, 'fa-5': 9, 'fa-6': 8,
        },
    },
    'values-and-habits': {
        type: 'habit-checklist',
        selections: {
            'proactive-time-management': 'often',
            'proactive-expectation-management': 'regularly',
            'completion-of-tasks-on-time': 'second-nature',
            'accurate-thorough-analysis': 'often',
            'verify-assumptions': 'regularly',
            'use-job-aids': 'sometimes',
            'others-centric': 'often',
            'ask-probing-questions': 'second-nature',
            'outcome-focused': 'often',
            'critical-independent-thinking': 'regularly',
            'managing-conflict': 'sometimes',
            'managing-own-growth': 'often',
        },
    },
    'growth-goals-alignment': {
        type: 'diagnostic-panel',
        rows: {
            'attitudes-and-values': { text: 'Leading with empathy, holding a high bar for quality, and staying curious under pressure.' },
            'known-strengths': { text: 'Clear written communication, staying calm during incidents, and breaking down ambiguous problems.' },
            'known-weaknesses': { text: 'Delegating earlier, and being more concise in status updates.' },
            'past-responsibilities': { text: 'Owned the onboarding flow rewrite, ran weekly stand-ups, and mentored two junior engineers.' },
            'responsibilities-more-of': { text: 'Cross-team architecture decisions and structured mentoring.' },
            'responsibilities-less-of': { text: 'Manual QA sign-off and routine status reporting.' },
        },
    },
}
