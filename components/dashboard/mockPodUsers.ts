/**
 * Stands in for a real "search users in this pod" endpoint, used by the
 * Testimonials section's "Invite peers" flow. Same convention as every
 * other mock*Data file: fixed content, no backend. A few names overlap with
 * mockTestimonialsData.ts (Priya Nair, Marcus Chen, Devika Rao) since those
 * are plausibly the same pod members who already left a testimonial.
 */
export interface PodUser {
    id: string
    name: string
    role: string
}

export const MOCK_POD_USERS: PodUser[] = [
    { id: 'user-1', name: 'Priya Nair', role: 'Team Lead' },
    { id: 'user-2', name: 'Marcus Chen', role: 'Peer Reviewer' },
    { id: 'user-3', name: 'Devika Rao', role: 'Mentor' },
    { id: 'user-4', name: 'Sam Okafor', role: 'Product Manager' },
    { id: 'user-5', name: 'Lena Fischer', role: 'Engineering Manager' },
    { id: 'user-6', name: 'Raj Patel', role: 'Backend Engineer' },
    { id: 'user-7', name: 'Aiko Tanaka', role: 'UX Designer' },
]
