import type { CapabilityCategory } from './capabilityForm'

/**
 * Shared color mapping for the six capability categories — one source of
 * truth used by both CapabilityGraphGrid (the interactive web grid) and
 * DashboardPdfDocument (the exported PDF), so the two never drift apart.
 */
export const CATEGORY_ACCENTS: Record<CapabilityCategory, string> = {
    Communication: '#3B82F6',
    'Problem-Solving': '#8B5CF6',
    Collaboration: '#14B8A6',
    Adaptability: '#F59E0B',
    Leadership: '#EC4899',
    'Technical Confidence': '#6366F1',
}

/** Six different chart forms, one per category — shared so the PDF export
 *  (DashboardPdfDocument, drawn with @react-pdf/renderer's SVG primitives)
 *  uses the exact same per-category shape as the interactive web grid
 *  (CapabilityGraphGrid, drawn with lucide icons / plain DOM), not a
 *  simplified substitute. */
export type CapabilityVisualKind = 'ring' | 'stars' | 'gauge' | 'battery' | 'bars' | 'nodes'

export const CATEGORY_VISUAL_KIND: Record<CapabilityCategory, CapabilityVisualKind> = {
    Communication: 'gauge',
    'Problem-Solving': 'nodes',
    Collaboration: 'stars',
    Adaptability: 'bars',
    Leadership: 'battery',
    'Technical Confidence': 'ring',
}

/** Per-category card tint (background) — shared so a category's PDF card
 *  matches its web card exactly, not just the chart inside it. */
export const CATEGORY_TINTS: Record<CapabilityCategory, string> = {
    Communication: '#EFF6FF',
    'Problem-Solving': '#F5F3FF',
    Collaboration: '#F0FDFA',
    Adaptability: '#FFFBEB',
    Leadership: '#FDF2F8',
    'Technical Confidence': '#EEF2FF',
}

/** Rotating tints for the "Working Style" answer boxes (not category-keyed —
 *  there are only 3 of these questions, cycled across whatever tints are
 *  here) — shared for the same reason as CATEGORY_TINTS. */
export const WORKING_STYLE_TINTS = ['#EFF6FF', '#F5F3FF', '#F0FDFA']

/** Self-rating (1-5) → a plain-language read on how someone's doing, plus
 *  the semantic (not category) colors it renders in. */
export const TIER_BY_VALUE: Record<number, { label: string; bg: string; fg: string }> = {
    5: { label: 'Strength', bg: '#ECFDF5', fg: '#047857' },
    4: { label: 'Strong', bg: '#ECFDF5', fg: '#059669' },
    3: { label: 'Steady', bg: '#EFF6FF', fg: '#2563EB' },
    2: { label: 'Growing', bg: '#FFFBEB', fg: '#B45309' },
    1: { label: 'Focus Area', bg: '#FEF2F2', fg: '#B91C1C' },
}
