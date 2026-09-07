/**
 * Shared visual math and color constants for the Capability Snapshot —
 * one source of truth used by both CapabilityGraphGrid (the interactive web
 * grid) and DashboardPdfDocument (the exported PDF), so the two never draw
 * a chart differently for the same answers.
 */

/** Evenly-spaced axis angle for an N-axis radar chart, axis 0 pointing
 *  straight up — shared by every radar (Curiosity Drive's 4 axes, the
 *  Proficiency Matrix's 8) and by both the web SVG and the PDF's react-pdf
 *  Polygon, so the two never draw a different shape for the same answers. */
export function radarAxisAngle(index: number, total: number): number {
    return -Math.PI / 2 + (index * 2 * Math.PI) / total
}

export function radarPoint(index: number, total: number, radius: number, cx: number, cy: number): { x: number; y: number } {
    const angle = radarAxisAngle(index, total)
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) }
}

/** The filled polygon's own vertices, one per axis — a `null` value (not yet
 *  answered) sits at the center rather than being skipped, so the shape
 *  always has exactly `values.length` vertices. */
export function radarPolygonPoints(values: (number | null)[], max: number, cx: number, cy: number, radius: number): string {
    return values
        .map((v, i) => {
            const r = v != null ? (Math.max(v, 0) / max) * radius : 0
            const { x, y } = radarPoint(i, values.length, r, cx, cy)
            return `${x.toFixed(2)},${y.toFixed(2)}`
        })
        .join(' ')
}

/** Pure geometry for one "3D-ish" podium block — a front face, a lighter top
 *  face, and a darker side face, faked via a fixed isometric skew. Shared so
 *  the web (plain SVG <path>) and the PDF (react-pdf <Path>) draw the exact
 *  same block from the same `d` strings. */
export function podiumBlockPaths(x: number, width: number, groundY: number, height: number): { front: string; top: string; side: string } {
    const dx = 10
    const dy = -8
    const front = `M ${x} ${groundY} L ${x + width} ${groundY} L ${x + width} ${groundY - height} L ${x} ${groundY - height} Z`
    const top = `M ${x} ${groundY - height} L ${x + width} ${groundY - height} L ${x + width + dx} ${groundY - height + dy} L ${x + dx} ${groundY - height + dy} Z`
    const side = `M ${x + width} ${groundY} L ${x + width} ${groundY - height} L ${x + width + dx} ${groundY - height + dy} L ${x + width + dx} ${groundY + dy} Z`
    return { front, top, side }
}

// Index 0 = rank 1, so RANK_MEDALS[rank - 1] gets the right medal — shared by
// the wizard's rank picker, the Capability Snapshot's podium, and the PDF.
export const RANK_MEDALS = ['🥇', '🥈', '🥉']

export const PODIUM_BLOCK_COLORS: Record<1 | 2 | 3, { front: string; top: string; side: string }> = {
    1: { front: '#FBBF24', top: '#FDE68A', side: '#B45309' },
    2: { front: '#CBD5E1', top: '#E2E8F0', side: '#64748B' },
    3: { front: '#FB923C', top: '#FDBA74', side: '#9A3412' },
}

/** Fixed block positions for the podium visual (2nd-1st-3rd left to right,
 *  1st tallest) — shared so the web SVG and the PDF's overlaid rank/name
 *  labels (react-pdf can't draw text inside its own Svg reliably, so those
 *  are positioned Views on top of it, same technique as the numeric
 *  overlays on the other 6 visuals) land on the exact same coordinates. */
export const PODIUM_VIEWBOX = { width: 300, height: 190 }
export const PODIUM_GROUND_Y = 155
export const PODIUM_LAYOUT: { rank: 1 | 2 | 3; x: number; width: number; height: number }[] = [
    { rank: 2, x: 20, width: 70, height: 55 },
    { rank: 1, x: 110, width: 70, height: 85 },
    { rank: 3, x: 200, width: 70, height: 35 },
]

/** Green-to-red frequency ramp for a habit-checklist's shared 5 options
 *  (best/most-practiced first) — used by the Values & Habits distribution
 *  chart in both the web snapshot and the PDF export. */
export const HABIT_TIER_HEX = ['#10B981', '#14B8A6', '#0EA5E9', '#F59E0B', '#F43F5E']

/** Short axis labels for the Proficiency Matrix's 8-competency radar — the
 *  real titles ("Self-Awareness and Interpersonal Awareness") are too long
 *  to sit around a radar chart, so this is a deliberate display-only
 *  shortening, keyed by competency id, shared by web + PDF. */
export const PROFICIENCY_RADAR_LABELS: Record<string, string> = {
    'results-orientation': 'Results',
    decisiveness: 'Decisiveness',
    accountability: 'Accountability',
    'self-interpersonal-awareness': 'Self-Awareness',
    'self-confidence': 'Confidence',
    'stress-management': 'Stress Mgmt',
    'personal-credibility': 'Credibility',
    'flexibility-agility': 'Flexibility',
}
