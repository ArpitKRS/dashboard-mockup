'use client'

import { Check, Lock, Flag, Target } from 'lucide-react'
import { computeOverallMatch, type SkillGap, type CapabilityGap } from '@/lib/futureRole'

interface CareerRoadmapMapProps {
    roleTitle: string
    skillGap: SkillGap
    capabilityGap: CapabilityGap
}

interface Checkpoint {
    id: string
    label: string
    cleared: boolean
    kind: 'skill' | 'capability'
}

const COLS = 4
const COL_W = 168
const ROW_H = 128
const NODE_R = 26
const PAD = 56

/** Snake layout: left-to-right on even rows, right-to-left on odd rows —
 *  reads like a game world map, not a plain grid. */
function nodePosition(index: number) {
    const row = Math.floor(index / COLS)
    const colInRow = index % COLS
    const col = row % 2 === 0 ? colInRow : COLS - 1 - colInRow
    return { x: PAD + col * COL_W, y: PAD + row * ROW_H }
}

function ScoreRing({ percent }: { percent: number }) {
    const radius = 34
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (percent / 100) * circumference

    return (
        <div className="relative h-24 w-24 shrink-0">
            <svg viewBox="0 0 100 100" className="h-24 w-24 -rotate-90">
                <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--color-pod-primary-light)" strokeWidth="8" />
                <circle
                    cx="50" cy="50" r={radius} fill="none"
                    stroke="var(--color-pod-primary)" strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={circumference} strokeDashoffset={offset}
                    className="transition-[stroke-dashoffset] duration-700 ease-out"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-extrabold text-pod-text tabular-nums">{percent}%</span>
                <span className="text-[9px] font-semibold uppercase tracking-wide text-pod-muted">ready</span>
            </div>
        </div>
    )
}

/**
 * Replaces the pill-list CareerPathMap with a game-map-style visual: every
 * matched skill/capability is a "cleared" checkpoint, every gap is a locked
 * one still ahead — laid out along a winding path toward a flag for the
 * target role, so progress toward a goal reads like level-select on a map
 * rather than a static comparison table.
 */
export default function CareerRoadmapMap({ roleTitle, skillGap, capabilityGap }: CareerRoadmapMapProps) {
    const overallMatch = computeOverallMatch(skillGap, capabilityGap)

    const matchedCheckpoints: Checkpoint[] = [
        ...skillGap.matched.map(label => ({ id: `skill-${label}`, label, cleared: true, kind: 'skill' as const })),
        ...capabilityGap.matched.map(entry => ({ id: `cap-${entry.category}`, label: entry.category, cleared: true, kind: 'capability' as const })),
    ]
    const gapCheckpoints: Checkpoint[] = [
        ...skillGap.gaps.map(label => ({ id: `skill-${label}`, label, cleared: false, kind: 'skill' as const })),
        ...capabilityGap.gaps.map(entry => ({ id: `cap-${entry.category}`, label: entry.category, cleared: false, kind: 'capability' as const })),
    ]
    const checkpoints = [...matchedCheckpoints, ...gapCheckpoints]

    const nextUpId = gapCheckpoints[0]?.id
    const rows = Math.ceil((checkpoints.length + 1) / COLS)
    const svgWidth = PAD * 2 + (COLS - 1) * COL_W
    const svgHeight = PAD * 2 + (rows - 1) * ROW_H

    const positions = checkpoints.map((_, i) => nodePosition(i))
    const flagPosition = nodePosition(checkpoints.length)
    const allPositions = [...positions, flagPosition]
    const pathD = allPositions.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
    const allCleared = checkpoints.length > 0 && checkpoints.every(c => c.cleared)

    return (
        <div className="rounded-2xl border border-pod-border bg-pod-bg-soft p-6">
            <div className="flex flex-wrap items-center gap-5 mb-2">
                <ScoreRing percent={overallMatch} />
                <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-pod-muted mb-1">Path to</p>
                    <div className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-pod-primary shrink-0" />
                        <h3 className="text-xl font-bold text-pod-text">{roleTitle}</h3>
                    </div>
                    <p className="text-sm text-pod-muted mt-1">
                        {matchedCheckpoints.length} of {checkpoints.length} checkpoints cleared.
                    </p>
                </div>
            </div>

            {checkpoints.length === 0 ? (
                <p className="text-xs text-pod-muted">Complete the Capability Questionnaire to see this mapped out too.</p>
            ) : (
                <div className="overflow-x-auto custom-scrollbar -mx-2 px-2">
                    <svg
                        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                        width={svgWidth}
                        height={svgHeight}
                        className="block"
                        style={{ minWidth: svgWidth }}
                        role="img"
                        aria-label={`Roadmap toward ${roleTitle}: ${matchedCheckpoints.length} of ${checkpoints.length} checkpoints cleared`}
                    >
                        <path d={pathD} fill="none" stroke="var(--color-pod-border)" strokeWidth={4} strokeDasharray="2 10" strokeLinecap="round" />

                        {checkpoints.map((checkpoint, i) => {
                            const { x, y } = positions[i]
                            const isNextUp = checkpoint.id === nextUpId
                            return (
                                <g key={checkpoint.id}>
                                    {isNextUp && (
                                        <circle cx={x} cy={y} r={NODE_R + 8} fill="none" stroke="var(--color-pod-primary)" strokeWidth={2} className="animate-pulse" />
                                    )}
                                    <circle
                                        cx={x} cy={y} r={NODE_R}
                                        fill={checkpoint.cleared ? 'var(--color-pod-primary)' : '#FFFFFF'}
                                        stroke={checkpoint.cleared ? 'var(--color-pod-primary)' : 'var(--color-pod-border)'}
                                        strokeWidth={2.5}
                                    />
                                    <foreignObject x={x - 11} y={y - 11} width={22} height={22}>
                                        <div className="h-full w-full flex items-center justify-center">
                                            {checkpoint.cleared
                                                ? <Check className="h-4 w-4 text-white" />
                                                : <Lock className="h-3.5 w-3.5 text-pod-muted" />}
                                        </div>
                                    </foreignObject>
                                    <foreignObject x={x - COL_W / 2 + 8} y={y + NODE_R + 6} width={COL_W - 16} height={40}>
                                        <p className="text-[11px] font-semibold text-pod-text text-center leading-tight">{checkpoint.label}</p>
                                    </foreignObject>
                                </g>
                            )
                        })}

                        <g>
                            <circle
                                cx={flagPosition.x} cy={flagPosition.y} r={NODE_R + 4}
                                fill={allCleared ? '#F5B720' : '#FFFFFF'}
                                stroke={allCleared ? '#F5B720' : 'var(--color-pod-border)'}
                                strokeWidth={3}
                            />
                            <foreignObject x={flagPosition.x - 13} y={flagPosition.y - 13} width={26} height={26}>
                                <div className="h-full w-full flex items-center justify-center">
                                    <Flag className={`h-5 w-5 ${allCleared ? 'text-white' : 'text-pod-muted'}`} />
                                </div>
                            </foreignObject>
                            <foreignObject x={flagPosition.x - COL_W / 2 + 8} y={flagPosition.y + NODE_R + 10} width={COL_W - 16} height={40}>
                                <p className="text-[11px] font-bold text-pod-text text-center leading-tight">{roleTitle}</p>
                            </foreignObject>
                        </g>
                    </svg>
                </div>
            )}
        </div>
    )
}
