'use client'

import { useState } from 'react'
import { Check, AlertTriangle, ChevronDown, BookOpen, ClipboardCheck, ListChecks, Layers, Calendar, type LucideIcon } from 'lucide-react'

export interface CategoryCounts {
    completed: number
    inProgress: number
    unavailable?: boolean
}

export interface ProgressSection {
    id: string
    title: string
    icon: LucideIcon
    counts: CategoryCounts
    /** How this category's completed/in-progress activity is actually moving
     *  the member toward their submitted future goal (see mockCapabilityAnswers.ts
     *  + DashboardClient's submittedGoal/futureVisionArchetype — "Senior Software
     *  Engineer" via "The Expert"). Mocked analysis, same convention as every
     *  other mock*Data file in this project: fixed content, no live model behind it. */
    positives: string[]
    growthAreas: string[]
}

/**
 * Adapted from osmosis/app/pod/[subdomain]/explore/dashboard/ProgressCountsPanel.tsx:
 * the real component fetches courses/assessments/self-tests counts from live
 * endpoints. This mock-up has no backend, so the counts are hardcoded.
 * Surveys and Polls are deliberately not part of this workspace's summary —
 * dropped per product decision, not because the underlying features don't
 * exist. `counts` is kept even though the web card below no longer displays
 * it, purely because DashboardPdfDocument's own always-expanded summary still
 * reads it — see that file's ProgressSection.
 */
export const SECTIONS: ProgressSection[] = [
    {
        id: 'courses',
        title: 'Learning Paths',
        icon: BookOpen,
        counts: { completed: 9, inProgress: 42 },
        positives: [
            'The paths you’re browsing lean toward systems and cloud-architecture topics, which builds directly toward the Cloud Architecture and System Design gaps named in your Future Role roadmap.',
            'A good share are hands-on, project-based paths rather than pure lecture-style content — that format compounds fastest into the Deep Technical Mastery the Expert track expects.',
        ],
        growthAreas: [
            'Few of the paths in your list touch CI/CD or automated testing specifically — a named roadmap gap this category could close directly.',
            'Several paths are general-interest rather than tied to a specific gap — swapping a couple for Mentoring- or Documentation-focused content would map more directly to the Expert track.',
        ],
    },
    {
        id: 'assessments',
        title: 'Assessments',
        icon: ClipboardCheck,
        counts: { completed: 0, inProgress: 0 },
        positives: [
            'There’s no weak result sitting on record for any assessment type — a clean slate to start from.',
        ],
        growthAreas: [
            'None of the available assessment types — System Design case studies, TypeScript proficiency checks — have been explored yet, so none of your self-reported skills have a validated result behind them.',
            'A System Design or TypeScript-flavored assessment specifically would turn "I know this" into evidence a reviewer can trust.',
        ],
    },
    {
        id: 'self-tests',
        title: 'Self-Tests',
        icon: ListChecks,
        counts: { completed: 1, inProgress: 2 },
        positives: [
            'The self-test type you’ve explored is a general technical-readiness benchmark — a reasonable first step before a formal Assessment.',
        ],
        growthAreas: [
            'The other self-test types available sit adjacent to, rather than squarely inside, your named gaps (System Design, Cloud Architecture) — worth exploring the ones that map directly to the roadmap instead.',
            'Self-tests are a practice format, not a verifiable record the way an Assessment is.',
        ],
    },
    {
        id: 'assets',
        title: 'Assets',
        icon: Layers,
        counts: { completed: 12, inProgress: 3 },
        positives: [
            'Your most-browsed asset types are reference guides and documentation-style content — exactly what feeds the Documentation and Best Practices requirements of the Expert archetype.',
            'This is the most actively browsed category in your workspace overall, a strong general reading habit.',
        ],
        growthAreas: [
            'These are all passive-reading formats — pairing this reading with a hands-on Assessment would convert it into demonstrated, provable capability.',
        ],
    },
    {
        id: 'events',
        title: 'Events',
        icon: Calendar,
        counts: { completed: 2, inProgress: 1 },
        positives: [
            'The event types you’ve engaged with are peer/community-format sessions, which build the collaborative, cross-team exposure that supports the Mentoring gap on your roadmap.',
        ],
        growthAreas: [
            'This category is light on technical-deep-dive or leadership-track event types specifically — seeking those out would build the Leadership visibility the target role expects, more directly than general community sessions.',
        ],
    },
]

function BulletList({ items, icon: Icon, tone }: { items: string[]; icon: typeof Check; tone: 'positive' | 'growth' }) {
    return (
        <ul className="space-y-2">
            {items.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-pod-text leading-relaxed">
                    <Icon
                        aria-hidden
                        className={`mt-0.5 h-4 w-4 shrink-0 ${tone === 'positive' ? 'text-emerald-600' : 'text-amber-600'}`}
                    />
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    )
}

/** One row inside the shared card below — header + expanded body sit inside
 *  the same wrapping element so the outer divide-y border lands between
 *  whole rows, collapsed or not. Each row keeps its own open state (rather
 *  than one shared "which id is open" toggle) so more than one can be
 *  compared side by side at once. */
function ProgressRow({ section }: { section: ProgressSection }) {
    const [open, setOpen] = useState(false)
    const Icon = section.icon

    return (
        <div>
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                aria-expanded={open}
                className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-pod-bg-soft transition-colors"
            >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-pod-primary-light text-pod-primary">
                    <Icon className="h-4.5 w-4.5" aria-hidden />
                </span>
                <span className="flex-1 text-base font-semibold text-pod-text">{section.title}</span>
                <ChevronDown aria-hidden className={`h-5 w-5 shrink-0 text-pod-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="space-y-4 bg-pod-bg-soft px-5 py-4">
                    <div>
                        <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-emerald-700">Working in your favor</p>
                        <BulletList items={section.positives} icon={Check} tone="positive" />
                    </div>
                    <div className="border-t border-pod-border pt-3">
                        <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-amber-700">Not moving the needle yet</p>
                        <BulletList items={section.growthAreas} icon={AlertTriangle} tone="growth" />
                    </div>
                </div>
            )}
        </div>
    )
}

/** One card holding every category as an internally-divided row — matches
 *  how the rest of the page groups related sections (e.g. Authenticated
 *  Capability's Testimonials + Achievements) into a single bordered card,
 *  rather than five separate boxes stacked with gaps between them. */
export default function ProgressCountsPanel() {
    return (
        <div>
            <h2 className="text-lg font-semibold text-pod-text mb-1">Status & Progress</h2>
            <p className="text-xs text-pod-muted mb-3">
                What your activity in each area is — and isn&apos;t — doing for your progress toward your future goal.
            </p>
            <div className="rounded-2xl border border-pod-border bg-white shadow-sm divide-y divide-pod-border overflow-hidden">
                {SECTIONS.map(section => (
                    <ProgressRow key={section.id} section={section} />
                ))}
            </div>
        </div>
    )
}
