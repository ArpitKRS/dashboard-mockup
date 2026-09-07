'use client'

import { useState } from 'react'
import {
    Pencil,
    Check,
    BookOpen,
    Compass,
    Trophy,
    Target,
    BarChart3,
    Sprout,
    TrendingUp,
} from 'lucide-react'
import ScorePillRow from './ScorePillRow'
import {
    CAPABILITY_QUESTIONS,
    deriveProficiencyCompetencyAverages,
    deriveNumericSelfRatingPoints,
    type CapabilityAnswers,
    type CapabilityAnswer,
    type CapabilityTextQuestion,
    type CapabilityMultiScaleQuestion,
    type CapabilityDiagnosticQuestion,
    type CapabilityRankQuestion,
    type CapabilityProficiencyMatrixQuestion,
    type CapabilityHabitChecklistQuestion,
} from '@/lib/capabilityForm'
import {
    radarPoint,
    radarPolygonPoints,
    podiumBlockPaths,
    PODIUM_BLOCK_COLORS,
    PODIUM_LAYOUT,
    PODIUM_GROUND_Y,
    PODIUM_VIEWBOX,
    RANK_MEDALS,
    HABIT_TIER_HEX,
    PROFICIENCY_RADAR_LABELS,
} from '@/lib/capabilityVisuals'

interface CapabilityGraphGridProps {
    answers: CapabilityAnswers
    onAnswerChange: (questionId: string, answer: CapabilityAnswer) => void
}

function EditToggleButton({ editing, onClick }: { editing: boolean; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={editing ? 'Cancel edit' : 'Edit this section'}
            className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-white border border-pod-border px-2 py-1 text-[11px] font-semibold text-pod-muted hover:text-pod-primary hover:border-pod-primary-medium transition-colors"
        >
            <Pencil className="h-3 w-3" />
            {editing ? 'Cancel' : 'Edit'}
        </button>
    )
}

/** Shared N-axis radar chart — the shape reused for both Curiosity Drive (4
 *  axes) and the Proficiency Matrix (8 axes), per the "similar approach for
 *  similar questions" instruction. Axis labels are overlaid as plain text
 *  (not drawn inside the <svg>) purely so the exact same positioning math
 *  can be reused, unchanged, by the PDF's react-pdf renderer later. */
function RadarChart({
    axes,
    values,
    max,
    accent,
    size = 220,
}: {
    axes: string[]
    values: (number | null)[]
    max: number
    accent: string
    size?: number
}) {
    const cx = size / 2
    const cy = size / 2
    const radius = size / 2 - 34
    const ringFractions = [0.25, 0.5, 0.75, 1]

    return (
        <div className="relative shrink-0" style={{ width: size, height: size }}>
            <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
                {ringFractions.map(f => (
                    <polygon
                        key={f}
                        points={axes.map((_, i) => { const p = radarPoint(i, axes.length, radius * f, cx, cy); return `${p.x},${p.y}` }).join(' ')}
                        fill="none"
                        stroke="#E5E7EB"
                        strokeWidth={1}
                    />
                ))}
                {axes.map((_, i) => {
                    const p = radarPoint(i, axes.length, radius, cx, cy)
                    return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#E5E7EB" strokeWidth={1} />
                })}
                <polygon
                    points={radarPolygonPoints(values, max, cx, cy, radius)}
                    fill={`${accent}33`}
                    stroke={accent}
                    strokeWidth={2}
                />
                {values.map((v, i) => {
                    if (v == null) return null
                    const p = radarPoint(i, axes.length, (Math.max(v, 0) / max) * radius, cx, cy)
                    return <circle key={i} cx={p.x} cy={p.y} r={3.5} fill={accent} />
                })}
            </svg>
            {axes.map((label, i) => {
                const p = radarPoint(i, axes.length, radius + 22, cx, cy)
                return (
                    <span
                        key={i}
                        className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[10px] font-bold text-pod-text"
                        style={{ left: p.x, top: p.y }}
                    >
                        {label}
                    </span>
                )
            })}
        </div>
    )
}

/** Curiosity Drive: a 4-axis radar plotted straight from the 4 dimension
 *  scores — the exact chart the user referenced (Technical/Empathic/
 *  Systemic/Self), not a re-skinned version of one of the other 6 shapes. */
function MultiScaleRadarCard({
    question,
    answer,
    onChange,
}: {
    question: CapabilityMultiScaleQuestion
    answer: CapabilityAnswer | undefined
    onChange: (questionId: string, answer: CapabilityAnswer) => void
}) {
    const [editing, setEditing] = useState(false)
    const scores = answer?.type === 'multi-scale' ? answer.scores : {}
    const axes = question.dimensions.map(d => d.label.split(' (')[0])
    const values = question.dimensions.map(d => scores[d.id]?.value ?? null)
    const answeredCount = values.filter(v => v != null).length

    const pick = (dimensionId: string, value: number) => {
        onChange(question.id, { type: 'multi-scale', scores: { ...scores, [dimensionId]: { value } } })
    }

    return (
        <div className="relative rounded-xl border border-pod-border bg-amber-50 p-4">
            <EditToggleButton editing={editing} onClick={() => setEditing(e => !e)} />
            <div className="flex items-center gap-1.5 mb-3 pr-16">
                <Compass className="h-3.5 w-3.5 shrink-0 text-amber-600" aria-hidden />
                <p className="text-xs font-bold uppercase tracking-widest text-pod-muted">{question.title}</p>
            </div>

            {!editing ? (
                <div>
                    <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
                        <RadarChart axes={axes} values={values} max={question.max} accent="#F59E0B" />
                        <div className="grid w-full grid-cols-2 gap-3 sm:w-auto sm:min-w-[220px]">
                            {question.dimensions.map((dim, i) => (
                                <div key={dim.id} className="rounded-lg bg-white/70 px-3 py-2.5">
                                    <p className="text-[11px] font-semibold text-pod-text">{dim.emoji} {axes[i]}</p>
                                    <p className="text-lg font-bold text-amber-700 tabular-nums">
                                        {values[i] ?? '–'}<span className="text-xs font-medium text-pod-muted">/{question.max}</span>
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <p className="mt-3 text-center text-[11px] text-pod-muted">{answeredCount}/{question.dimensions.length} rated</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {question.dimensions.map(dim => (
                        <div key={dim.id}>
                            <p className="text-xs font-semibold text-pod-text mb-1.5">{dim.emoji} {dim.label}</p>
                            <ScorePillRow
                                min={question.min}
                                max={question.max}
                                legend={question.scaleLegend}
                                value={scores[dim.id]?.value}
                                onSelect={v => pick(dim.id, v)}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

/** Capability Proficiency Matrix: "similar approach" to Curiosity Drive, but
 *  41 individual indicators can't each be their own axis, so the radar plots
 *  one axis per competency GROUP (its average score) instead — an overview
 *  across all 8 competencies rather than an unreadable 41-point shape.
 *  Editing shows every competency's full indicator list stacked (no
 *  pagination) — there's no modal-height constraint on this card, unlike the
 *  wizard, so exhaustive is simpler than porting the wizard's section stepper. */
function ProficiencyRadarCard({
    question,
    answers,
    onChange,
}: {
    question: CapabilityProficiencyMatrixQuestion
    answers: CapabilityAnswers
    onChange: (questionId: string, answer: CapabilityAnswer) => void
}) {
    const [editing, setEditing] = useState(false)
    const averages = deriveProficiencyCompetencyAverages(question, answers)
    const axes = averages.map(a => PROFICIENCY_RADAR_LABELS[a.competencyId] ?? a.title)
    const values = averages.map(a => a.average)
    const answeredCount = averages.reduce((sum, a) => sum + a.answeredCount, 0)
    const totalCount = averages.reduce((sum, a) => sum + a.indicatorCount, 0)

    const answer = answers[question.id]
    const scores = answer?.type === 'proficiency-matrix' ? answer.scores : {}
    const pick = (indicatorId: string, value: number) => {
        onChange(question.id, { type: 'proficiency-matrix', scores: { ...scores, [indicatorId]: value } })
    }

    return (
        <div className="relative rounded-xl border border-pod-border bg-indigo-50 p-4">
            <EditToggleButton editing={editing} onClick={() => setEditing(e => !e)} />
            <div className="flex items-center gap-1.5 mb-3 pr-16">
                <Target className="h-3.5 w-3.5 shrink-0 text-indigo-600" aria-hidden />
                <p className="text-xs font-bold uppercase tracking-widest text-pod-muted">{question.title}</p>
            </div>

            {!editing ? (
                <div className="flex flex-col items-center">
                    <RadarChart axes={axes} values={values} max={question.max} accent="#6366F1" size={260} />
                    <p className="mt-2 text-[11px] text-pod-muted">{answeredCount}/{totalCount} indicators rated</p>
                </div>
            ) : (
                <div className="space-y-5">
                    {question.competencies.map(competency => (
                        <div key={competency.id}>
                            <p className="text-sm font-bold text-pod-text mb-2">{competency.title}</p>
                            <div className="space-y-3">
                                {competency.indicators.map((indicator, i) => (
                                    <div key={indicator.id}>
                                        <p className="text-xs text-pod-text mb-1.5">{i + 1}. {indicator.label}</p>
                                        <ScorePillRow
                                            min={question.min}
                                            max={question.max}
                                            legend={question.scaleLegend}
                                            value={scores[indicator.id]}
                                            onSelect={v => pick(indicator.id, v)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

// Same coloring as the PDF's rankColors — the block's own front/side colors
// read as too light for small badge text, so the ranked list below uses this
// darker variant instead.
/** A real illustrated podium (front/top/side faces per block, faked 3D via a
 *  fixed isometric skew) rather than plain colored bars — per the explicit
 *  "real podium vector or svg" request. Just the blocks + rank number here —
 *  driver names live in the ranked list below instead of squeezed above each
 *  block (that overlapped at typical block heights), matching the PDF's
 *  cleaner podium-plus-list layout, which reads better than crowded labels. */
function PodiumVisual() {
    return (
        <div className="relative mx-auto" style={{ width: PODIUM_VIEWBOX.width, height: PODIUM_VIEWBOX.height - 60 }}>
            <svg
                viewBox={`0 0 ${PODIUM_VIEWBOX.width} ${PODIUM_VIEWBOX.height}`}
                width={PODIUM_VIEWBOX.width}
                height={PODIUM_VIEWBOX.height - 60}
                preserveAspectRatio="xMidYMax meet"
            >
                {PODIUM_LAYOUT.map(block => {
                    const paths = podiumBlockPaths(block.x, block.width, PODIUM_GROUND_Y, block.height)
                    const colors = PODIUM_BLOCK_COLORS[block.rank]
                    return (
                        <g key={block.rank}>
                            <path d={paths.front} fill={colors.front} />
                            <path d={paths.top} fill={colors.top} />
                            <path d={paths.side} fill={colors.side} />
                        </g>
                    )
                })}
                {PODIUM_LAYOUT.map(block => (
                    <text
                        key={block.rank}
                        x={block.x + block.width / 2}
                        y={PODIUM_GROUND_Y - block.height / 2}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize={18}
                        fontWeight={800}
                        fill="#FFFFFF"
                    >
                        {block.rank}
                    </text>
                ))}
            </svg>
        </div>
    )
}

function RankPodiumCard({
    question,
    answer,
    onChange,
}: {
    question: CapabilityRankQuestion
    answer: CapabilityAnswer | undefined
    onChange: (questionId: string, answer: CapabilityAnswer) => void
}) {
    const [editing, setEditing] = useState(false)
    const ranking = answer?.type === 'rank' ? answer.ranking : {}
    const rankedCount = Object.keys(ranking).length

    const updateRank = (optionId: string, rank: number) => {
        const next = { ...ranking }
        if (next[optionId] === rank) {
            delete next[optionId]
        } else {
            for (const key of Object.keys(next)) {
                if (next[key] === rank) delete next[key]
            }
            next[optionId] = rank
        }
        onChange(question.id, { type: 'rank', ranking: next })
    }

    return (
        <div className="relative rounded-xl border border-pod-border bg-pod-bg-soft p-4">
            <EditToggleButton editing={editing} onClick={() => setEditing(e => !e)} />
            <div className="flex items-center gap-1.5 mb-3 pr-16">
                <Trophy className="h-3.5 w-3.5 shrink-0 text-amber-600" aria-hidden />
                <p className="text-xs font-bold uppercase tracking-widest text-pod-muted">Top Drivers</p>
            </div>

            {!editing ? (
                <div className="flex flex-col items-center">
                    <PodiumVisual />
                    <div className="mt-4 grid w-full max-w-2xl grid-cols-3 gap-3">
                        {[1, 2, 3].map(r => {
                            const option = question.options.find(o => ranking[o.id] === r)
                            const colors = PODIUM_BLOCK_COLORS[r as 1 | 2 | 3]
                            return (
                                <div
                                    key={r}
                                    className="rounded-xl border-2 px-3 py-3 text-center"
                                    style={{ backgroundColor: colors.top, borderColor: colors.front }}
                                >
                                    <span
                                        className="mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm font-extrabold text-white shadow-sm"
                                        style={{ backgroundColor: colors.side }}
                                    >
                                        {r}
                                    </span>
                                    <p className="mt-2 text-sm font-bold leading-tight text-pod-text">{option?.label ?? 'Not ranked yet'}</p>
                                </div>
                            )
                        })}
                    </div>
                    <p className="mt-3 text-[11px] text-pod-muted">{rankedCount}/{question.topN} ranked</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {question.options.map(option => {
                        const rank = ranking[option.id]
                        return (
                            <div key={option.id} className="flex items-center gap-3 rounded-lg border border-pod-border bg-white px-3 py-2.5">
                                <p className="min-w-0 flex-1 truncate text-xs font-semibold text-pod-text">{option.label}</p>
                                <div className="flex shrink-0 gap-1.5">
                                    {[1, 2, 3].map(r => {
                                        const selected = rank === r
                                        return (
                                            <button
                                                key={r}
                                                type="button"
                                                onClick={() => updateRank(option.id, r)}
                                                title={`Rank ${r}`}
                                                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm transition-all ${
                                                    selected
                                                        ? 'bg-white shadow-sm ring-2 ring-pod-primary scale-110'
                                                        : 'border border-pod-border bg-white opacity-50 hover:opacity-100'
                                                }`}
                                            >
                                                {RANK_MEDALS[r - 1]}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

/** Values & Habits: an item-level heatmap (each of the 12 habits tinted by
 *  its own tier) rather than an aggregate distribution chart — a bar count
 *  of "how many are 'sometimes'" says nothing actionable, but seeing which
 *  specific habit is "Not at all" is the actual insight worth surfacing. */
function HabitDistributionCard({
    question,
    answers,
    onChange,
}: {
    question: CapabilityHabitChecklistQuestion
    answers: CapabilityAnswers
    onChange: (questionId: string, answer: CapabilityAnswer) => void
}) {
    const [editing, setEditing] = useState(false)
    const answer = answers[question.id]
    const selections = answer?.type === 'habit-checklist' ? answer.selections : {}
    const answeredCount = Object.values(selections).filter(Boolean).length

    const pick = (itemId: string, optionId: string) => {
        onChange(question.id, { type: 'habit-checklist', selections: { ...selections, [itemId]: optionId } })
    }

    return (
        <div className="relative rounded-xl border border-pod-border bg-teal-50 p-4">
            <EditToggleButton editing={editing} onClick={() => setEditing(e => !e)} />
            <div className="flex items-center gap-1.5 mb-3 pr-16">
                <BarChart3 className="h-3.5 w-3.5 shrink-0 text-teal-600" aria-hidden />
                <p className="text-xs font-bold uppercase tracking-widest text-pod-muted">{question.title}</p>
            </div>

            {!editing ? (
                <div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {question.items.map(item => {
                            const optionIndex = question.options.findIndex(o => o.id === selections[item.id])
                            const option = optionIndex >= 0 ? question.options[optionIndex] : undefined
                            const color = optionIndex >= 0 ? HABIT_TIER_HEX[optionIndex] : undefined
                            return (
                                <div
                                    key={item.id}
                                    className="rounded-lg border px-2.5 py-2 text-center"
                                    style={{ backgroundColor: color ? `${color}1A` : '#FFFFFF', borderColor: color ?? '#E5E7EB' }}
                                >
                                    <p className="text-[10px] font-semibold leading-tight text-pod-text">{item.emoji} {item.label}</p>
                                    <p className="mt-1 text-[10px] font-bold" style={{ color: color ?? '#9CA3AF' }}>
                                        {option?.label ?? 'Not answered'}
                                    </p>
                                </div>
                            )
                        })}
                    </div>
                    <p className="mt-3 text-[11px] text-pod-muted">{answeredCount}/{question.items.length} answered</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {question.items.map(item => (
                        <div key={item.id}>
                            <p className="text-xs font-semibold text-pod-text mb-1.5">{item.emoji} {item.label}</p>
                            <div className="flex flex-wrap gap-1.5">
                                {question.options.map((option, i) => {
                                    const selected = selections[item.id] === option.id
                                    return (
                                        <button
                                            key={option.id}
                                            type="button"
                                            onClick={() => pick(item.id, option.id)}
                                            className="rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors"
                                            style={
                                                selected
                                                    ? { backgroundColor: HABIT_TIER_HEX[i], borderColor: HABIT_TIER_HEX[i], color: '#ffffff' }
                                                    : { borderColor: '#D9D9D9', backgroundColor: '#ffffff', color: '#303030' }
                                            }
                                        >
                                            {option.emoji} {option.label}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

/** Energy Dynamics and Growth Goals & Alignment share this one card form —
 *  both are diagnostic panels mixing (or, for Growth Goals, made entirely
 *  of) open-ended text with select-all-that-apply checklists, so a numeric
 *  chart doesn't fit either; a quote-card + selected-tags layout does. */
function DiagnosticPanelCard({
    question,
    answer,
    onChange,
}: {
    question: CapabilityDiagnosticQuestion
    answer: CapabilityAnswer | undefined
    onChange: (questionId: string, answer: CapabilityAnswer) => void
}) {
    const [editing, setEditing] = useState(false)
    const rows = answer?.type === 'diagnostic-panel' ? answer.rows : {}

    const setText = (rowId: string, text: string) => {
        onChange(question.id, { type: 'diagnostic-panel', rows: { ...rows, [rowId]: { ...rows[rowId], text } } })
    }
    const toggleOption = (rowId: string, optionId: string) => {
        const current = rows[rowId]?.optionIds ?? []
        const next = current.includes(optionId) ? current.filter(id => id !== optionId) : [...current, optionId]
        onChange(question.id, { type: 'diagnostic-panel', rows: { ...rows, [rowId]: { ...rows[rowId], optionIds: next } } })
    }

    return (
        <div className="relative rounded-xl border border-pod-border bg-violet-50 p-4">
            <EditToggleButton editing={editing} onClick={() => setEditing(e => !e)} />
            <div className="flex items-center gap-1.5 mb-3 pr-16">
                <span className="text-sm">{question.emoji}</span>
                <p className="text-xs font-bold uppercase tracking-widest text-pod-muted">{question.title}</p>
            </div>

            {!editing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {question.rows.map(row => {
                        const rowAnswer = rows[row.id]
                        if (row.type === 'text') {
                            const text = rowAnswer?.text?.trim()
                            return (
                                <div key={row.id} className="rounded-lg border border-pod-border bg-white p-3">
                                    <p className="text-[11px] font-bold text-pod-muted mb-1">{row.emoji} {row.label}</p>
                                    <p className={`text-xs leading-relaxed ${text ? 'italic text-pod-text' : 'text-pod-muted'}`}>
                                        {text ? `“${text}”` : 'Not answered yet'}
                                    </p>
                                </div>
                            )
                        }
                        const selected = row.options.filter(o => rowAnswer?.optionIds?.includes(o.id))
                        return (
                            <div key={row.id} className="rounded-lg border border-pod-border bg-white p-3">
                                <p className="text-[11px] font-bold text-pod-muted mb-1.5">{row.emoji} {row.label}</p>
                                {selected.length > 0 ? (
                                    <div className="flex flex-wrap gap-1">
                                        {selected.map(o => (
                                            <span key={o.id} className="rounded-full bg-pod-primary-light px-2 py-0.5 text-[10px] font-semibold text-pod-primary">
                                                {o.label}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-pod-muted">Not answered yet</p>
                                )}
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="space-y-4">
                    {question.rows.map(row => {
                        const rowAnswer = rows[row.id]
                        if (row.type === 'text') {
                            return (
                                <div key={row.id}>
                                    <p className="text-xs font-semibold text-pod-text mb-1.5">{row.emoji} {row.label}</p>
                                    <textarea
                                        value={rowAnswer?.text ?? ''}
                                        onChange={e => setText(row.id, e.target.value)}
                                        placeholder={row.placeholder}
                                        rows={2}
                                        className="w-full rounded-lg border border-pod-border bg-white px-3 py-2 text-xs text-pod-text outline-none transition resize-none focus:border-transparent focus:ring-2 focus:ring-pod-primary"
                                    />
                                </div>
                            )
                        }
                        return (
                            <div key={row.id}>
                                <p className="text-xs font-semibold text-pod-text mb-1.5">{row.emoji} {row.label}</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {row.options.map(option => {
                                        const selected = Boolean(rowAnswer?.optionIds?.includes(option.id))
                                        return (
                                            <button
                                                key={option.id}
                                                type="button"
                                                onClick={() => toggleOption(row.id, option.id)}
                                                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                                                    selected
                                                        ? 'border-pod-primary bg-pod-primary-light text-pod-text'
                                                        : 'border-pod-border bg-white text-pod-text hover:border-pod-primary-medium'
                                                }`}
                                            >
                                                {selected ? '✅' : '⬜'} {option.label}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

/** Future Study Plans: the one plain free-text question — a quote card, same
 *  visual treatment as a diagnostic panel's text rows, just standalone. */
function TextQuestionCard({
    question,
    answer,
    onChange,
}: {
    question: CapabilityTextQuestion
    answer: CapabilityAnswer | undefined
    onChange: (questionId: string, answer: CapabilityAnswer) => void
}) {
    const [editing, setEditing] = useState(false)
    const text = answer?.type === 'text' ? answer.value : null
    const [draft, setDraft] = useState(text ?? '')

    const save = () => {
        const trimmed = draft.trim()
        if (trimmed) onChange(question.id, { type: 'text', value: trimmed })
        setEditing(false)
    }

    return (
        <div className="relative rounded-xl border border-pod-border bg-sky-50 p-4">
            <EditToggleButton editing={editing} onClick={() => { setDraft(text ?? ''); setEditing(e => !e) }} />
            <div className="flex items-center gap-1.5 mb-3 pr-16">
                <BookOpen className="h-3.5 w-3.5 shrink-0 text-sky-600" aria-hidden />
                <p className="text-xs font-bold uppercase tracking-widest text-pod-muted">Future Study Plans</p>
            </div>

            {!editing ? (
                <p className={`text-xs leading-relaxed ${text ? 'italic text-pod-text' : 'text-pod-muted'}`}>
                    {text ? `“${text}”` : 'Not answered yet'}
                </p>
            ) : (
                <div>
                    <textarea
                        value={draft}
                        onChange={e => setDraft(e.target.value)}
                        placeholder={question.placeholder}
                        rows={3}
                        className="w-full rounded-lg border border-pod-border bg-white px-3 py-2 text-xs text-pod-text outline-none transition resize-none focus:border-transparent focus:ring-2 focus:ring-pod-primary"
                    />
                    <div className="mt-2 flex justify-end">
                        <button type="button" onClick={save} className="inline-flex items-center gap-1 text-xs font-semibold text-pod-primary hover:text-pod-primary-hover transition-colors">
                            <Check className="h-3.5 w-3.5" /> Save
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

/** "Strongest area" / "Growth focus" — pooled across the two numeric
 *  self-rating questions (Curiosity Drive's 4 dimensions + the Proficiency
 *  Matrix's 8 competency averages), the only two chartable on the same
 *  1..10 scale; the other questions (text, checklists, rank) don't produce
 *  a comparable number. */
function CapabilityInsightBanner({ answers }: { answers: CapabilityAnswers }) {
    const points = deriveNumericSelfRatingPoints(answers)
    if (points.length < 2) return null
    const strongest = points.reduce((best, p) => (p.value > best.value ? p : best), points[0])
    const weakest = points.reduce((worst, p) => (p.value < worst.value ? p : worst), points[0])
    if (strongest.label === weakest.label) return null

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                <TrendingUp className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                <p className="text-xs text-emerald-900">
                    <span className="font-bold">Strongest area:</span> {strongest.label} ({strongest.value.toFixed(1)}/10)
                </p>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
                <Sprout className="h-4.5 w-4.5 text-amber-600 shrink-0" />
                <p className="text-xs text-amber-900">
                    <span className="font-bold">Growth focus:</span> {weakest.label} ({weakest.value.toFixed(1)}/10)
                </p>
            </div>
        </div>
    )
}

/**
 * One bespoke visual per Capability Building Form question — a radar for
 * each of the two 1..10 self-rating questions (Curiosity Drive, the
 * Proficiency Matrix), a real illustrated podium for the ranked drivers, a
 * distribution chart for the habit checklist, and quote/tag cards for the
 * free-text and preference-checklist questions — rather than the same chart
 * shape repeated. Every card carries its own inline Edit control (no modal)
 * so a question can be re-answered on its own without retaking the whole
 * form, same as before.
 */
export default function CapabilityGraphGrid({ answers, onAnswerChange }: CapabilityGraphGridProps) {
    return (
        <div>
            <h3 className="text-sm font-semibold text-pod-text mb-1">Your Capability Snapshot</h3>
            <p className="text-xs text-pod-muted mb-4">
                One visual per question — edit any of them without retaking the whole questionnaire.
            </p>

            <CapabilityInsightBanner answers={answers} />

            <div className="space-y-4">
                {CAPABILITY_QUESTIONS.map(question => {
                    const answer = answers[question.id]
                    switch (question.type) {
                        case 'text':
                            return <TextQuestionCard key={question.id} question={question} answer={answer} onChange={onAnswerChange} />
                        case 'multi-scale':
                            return <MultiScaleRadarCard key={question.id} question={question} answer={answer} onChange={onAnswerChange} />
                        case 'diagnostic-panel':
                            return <DiagnosticPanelCard key={question.id} question={question} answer={answer} onChange={onAnswerChange} />
                        case 'rank':
                            return <RankPodiumCard key={question.id} question={question} answer={answer} onChange={onAnswerChange} />
                        case 'proficiency-matrix':
                            return <ProficiencyRadarCard key={question.id} question={question} answers={answers} onChange={onAnswerChange} />
                        case 'habit-checklist':
                            return <HabitDistributionCard key={question.id} question={question} answers={answers} onChange={onAnswerChange} />
                        default:
                            return null
                    }
                })}
            </div>
        </div>
    )
}
