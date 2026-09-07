/**
 * Stands in for real testimonials other members would leave on this profile.
 * Same convention as mockResumeData.ts — fixed content, no backend.
 */
export interface Testimonial {
    name: string
    relationship: string
    quote: string
}

export const MOCK_TESTIMONIALS: Testimonial[] = [
    {
        name: 'Priya Nair',
        relationship: 'Team Lead',
        quote: 'Jordan picks up new tools fast and always ships the reliable version, not just the quick one. A dependable person to have on any sprint.',
    },
    {
        name: 'Marcus Chen',
        relationship: 'Peer Reviewer',
        quote: 'Every code review comment I left came back thought through, not just fixed. Jordan asks the right follow-up questions before writing a line.',
    },
    {
        name: 'Devika Rao',
        relationship: 'Mentor',
        quote: 'What stands out is the follow-through — Jordan turns feedback into a concrete next step within the week, every time.',
    },
]
