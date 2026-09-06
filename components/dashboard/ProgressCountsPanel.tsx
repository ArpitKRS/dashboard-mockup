'use client'

import { useState } from 'react'
import AccordionPanel from '@/components/ui/AccordionPanel'

export interface CategoryCounts {
    completed: number
    inProgress: number
    unavailable?: boolean
}

export interface ProgressSection {
    id: string
    title: string
    counts: CategoryCounts
}

/**
 * Adapted from osmosis/app/pod/[subdomain]/explore/dashboard/ProgressCountsPanel.tsx:
 * the real component fetches courses/assessments/surveys/self-tests counts
 * from four live endpoints. This mock-up has no backend, so the counts are
 * hardcoded to match the reference screenshot exactly ("Surveys — Unavailable"
 * reproduces the real error state the live version falls back to when a
 * fetch fails). Assets, Events, and Polls are additional pod features
 * (os_assets, os_events, os_poll in the real backend) that belong in this
 * same summary but aren't in the reference screenshot — mocked here with
 * the same completed/in-progress shape.
 */
export const SECTIONS: ProgressSection[] = [
    { id: 'courses', title: 'Learning Paths', counts: { completed: 9, inProgress: 42 } },
    { id: 'assessments', title: 'Assessments', counts: { completed: 0, inProgress: 0 } },
    { id: 'surveys', title: 'Surveys', counts: { completed: 3, inProgress: 1 } },
    { id: 'self-tests', title: 'Self-Tests', counts: { completed: 1, inProgress: 2 } },
    { id: 'assets', title: 'Assets', counts: { completed: 12, inProgress: 3 } },
    { id: 'events', title: 'Events', counts: { completed: 2, inProgress: 1 } },
    { id: 'polls', title: 'Polls', counts: { completed: 4, inProgress: 0 } },
]

export default function ProgressCountsPanel() {
    const [openId, setOpenId] = useState<string | null>(null)

    return (
        <div className="space-y-3">
            <h2 className="text-lg font-semibold text-pod-text px-1">Your Progress</h2>
            {SECTIONS.map(section => {
                const summary = section.counts.unavailable
                    ? 'Unavailable'
                    : `${section.counts.completed} completed · ${section.counts.inProgress} in progress`

                return (
                    <AccordionPanel
                        key={section.id}
                        title={`${section.title} — ${summary}`}
                        open={openId === section.id}
                        onToggle={() => setOpenId(prev => (prev === section.id ? null : section.id))}
                    >
                        <div className="px-5 py-4 flex items-center gap-6">
                            <div>
                                <p className="text-2xl font-bold text-pod-text tabular-nums">{section.counts.completed}</p>
                                <p className="text-xs text-pod-muted">Completed</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-pod-text tabular-nums">{section.counts.inProgress}</p>
                                <p className="text-xs text-pod-muted">In Progress</p>
                            </div>
                        </div>
                    </AccordionPanel>
                )
            })}
        </div>
    )
}
