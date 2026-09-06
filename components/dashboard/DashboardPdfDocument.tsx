import { Document, Page, View, Text, StyleSheet, Svg, Path, Circle, Rect, Line, Polygon } from '@react-pdf/renderer'
import { getScaleQuestions, getChoiceQuestions, type CapabilityAnswers, type CapabilityScaleQuestion } from '@/lib/capabilityForm'
import {
    CATEGORY_ACCENTS,
    CATEGORY_VISUAL_KIND,
    CATEGORY_TINTS,
    WORKING_STYLE_TINTS,
    TIER_BY_VALUE,
    type CapabilityVisualKind,
} from '@/lib/capabilityVisuals'
import { SECTIONS as PROGRESS_SECTIONS } from './ProgressCountsPanel'
import type { ResumeRoleSummary } from './mockResumeData'
import type { RoleSkillProfile, SkillGap, CapabilityGap } from '@/lib/futureRole'

export interface DashboardPdfDocumentProps {
    fullName: string
    email: string
    resumeFileName: string | null
    resumeSummary: string | null
    resumeRoles: ResumeRoleSummary[] | null
    skills: string[]
    interests: string[]
    capabilityCompleted: boolean
    capabilityAnswers: CapabilityAnswers
    submittedGoal: string | null
    roleProfile: RoleSkillProfile | null
    skillGap: SkillGap | null
    capabilityGap: CapabilityGap | null
    exportedAt: string
}

// Plain Helvetica (a core PDF font, always available with no Font.register()
// call) — every property below is part of react-pdf's supported subset,
// which mirrors React Native's Yoga-based flexbox styling, not full CSS.
const styles = StyleSheet.create({
    page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica', color: '#26302B' },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    name: { fontSize: 20, fontWeight: 'bold', marginBottom: 2 },
    email: { fontSize: 10, color: '#6E6E6E' },
    exportMeta: { fontSize: 8, color: '#9CA3AF', textAlign: 'right', lineHeight: 1.5 },
    section: { marginTop: 18 },
    sectionTitle: {
        fontSize: 9,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
        color: '#6E6E6E',
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        paddingBottom: 4,
    },
    progressTrack: { height: 6, backgroundColor: '#EEF0EF', borderRadius: 3, overflow: 'hidden' },
    progressFill: { height: 6, borderRadius: 3 },
    label: { fontSize: 9, fontWeight: 'bold' },
    muted: { fontSize: 9, color: '#6E6E6E' },
    roleCard: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 6, padding: 8, marginBottom: 6 },
    roleTitleRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
    roleTitle: { fontSize: 10, fontWeight: 'bold' },
    roleDuration: { fontSize: 8, color: '#6E6E6E' },
    roleDesc: { fontSize: 9, color: '#4B5563' },
    tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
    tag: { borderWidth: 1, borderColor: '#D9D9D9', borderRadius: 10, paddingVertical: 2, paddingHorizontal: 8, fontSize: 8 },
    twoCol: { flexDirection: 'row', gap: 20 },
    col: { flex: 1 },
    insightRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
    insightBox: { flex: 1, borderWidth: 1, borderRadius: 8, padding: 8 },
    insightText: { fontSize: 8 },
    categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 4 },
    categoryCard: { width: '31%', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 8 },
    categoryHeadRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    categoryName: { fontSize: 8, fontWeight: 'bold', textTransform: 'uppercase' },
    tierBadge: { fontSize: 6.5, fontWeight: 'bold', textTransform: 'uppercase', paddingVertical: 1, paddingHorizontal: 5, borderRadius: 8 },
    categoryVisualRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    categoryLabelSub: { fontSize: 7.5, color: '#6E6E6E' },
    visualOverlayCenter: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
    visualOverlayBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, alignItems: 'center' },
    visualNumber: { fontSize: 10, fontWeight: 'bold', color: '#26302B' },
    readoutRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    readoutValue: { fontSize: 10, fontWeight: 'bold', color: '#26302B' },
    readoutMax: { fontSize: 8, fontWeight: 'normal', color: '#6E6E6E' },
    workingStyleContainer: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, backgroundColor: '#F7F7F7', padding: 10 },
    workingStyleGrid: { flexDirection: 'row', gap: 8 },
    workingStyleBox: { flex: 1, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 6, padding: 8, alignItems: 'center' },
    workingStyleLabel: { fontSize: 7.5, fontWeight: 'bold', textAlign: 'center', marginTop: 2 },
    checklistItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 6 },
    checkDot: { width: 8, height: 8, borderRadius: 4 },
    progressGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    progressTile: { width: '47%', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 6, padding: 10 },
    progressTileTitle: { fontSize: 9, fontWeight: 'bold', marginBottom: 4 },
    progressTileValue: { fontSize: 8, color: '#6E6E6E' },
    footer: {
        position: 'absolute',
        bottom: 24,
        left: 40,
        right: 40,
        fontSize: 7,
        color: '#9CA3AF',
        textAlign: 'center',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingTop: 6,
    },
})

function ProgressBar({ pct, color = '#8DCFB3' }: { pct: number; color?: string }) {
    return (
        <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.max(0, Math.min(100, pct))}%`, backgroundColor: color }]} />
        </View>
    )
}

function TagList({ items }: { items: string[] }) {
    if (items.length === 0) return null
    return (
        <View style={styles.tagsWrap}>
            {items.map(item => <Text key={item} style={styles.tag}>{item}</Text>)}
        </View>
    )
}

function ResumeSection({
    resumeFileName,
    resumeSummary,
    resumeRoles,
    skills,
    interests,
}: {
    resumeFileName: string | null
    resumeSummary: string | null
    resumeRoles: ResumeRoleSummary[] | null
    skills: string[]
    interests: string[]
}) {
    return (
        <View>
            {resumeFileName && <Text style={[styles.muted, { marginBottom: 8 }]}>Resume on file: {resumeFileName}</Text>}

            {resumeSummary && (
                <View style={{ marginBottom: 10 }}>
                    <Text style={styles.label}>Summary</Text>
                    <Text style={[styles.muted, { marginTop: 2 }]}>{resumeSummary}</Text>
                </View>
            )}

            {resumeRoles && resumeRoles.length > 0 && (
                <View style={{ marginBottom: 10 }}>
                    <Text style={[styles.label, { marginBottom: 4 }]}>Experience</Text>
                    {resumeRoles.map((role, i) => (
                        <View key={i} style={styles.roleCard} wrap={false}>
                            <View style={styles.roleTitleRow}>
                                <Text style={styles.roleTitle}>{role.title}</Text>
                                <Text style={styles.roleDuration}>{role.duration}</Text>
                            </View>
                            <Text style={styles.roleDesc}>{role.description}</Text>
                        </View>
                    ))}
                </View>
            )}

            {(skills.length > 0 || interests.length > 0) && (
                <View style={styles.twoCol}>
                    {skills.length > 0 && (
                        <View style={styles.col}>
                            <Text style={[styles.label, { marginBottom: 4 }]}>Skills</Text>
                            <TagList items={skills} />
                        </View>
                    )}
                    {interests.length > 0 && (
                        <View style={styles.col}>
                            <Text style={[styles.label, { marginBottom: 4 }]}>Interests</Text>
                            <TagList items={interests} />
                        </View>
                    )}
                </View>
            )}
        </View>
    )
}

// ── The six capability chart forms, drawn with react-pdf's SVG primitives ──
// (lucide-react icons, which the web grid uses, are DOM components and can't
// render inside react-pdf's own renderer) — matched 1:1 to CategoryGauge /
// StarsVisual / GaugeVisual / BatteryVisual / BarsVisual / NodesVisual in
// CapabilityGraphGrid.tsx via CATEGORY_VISUAL_KIND, so a category draws the
// same shape on the page as it does on screen.

interface VisualProps {
    value: number | null
    min: number
    max: number
    accent: string
}

function starPoints(cx: number, cy: number, outerR: number, innerR: number): string {
    const pts: string[] = []
    for (let i = 0; i < 10; i++) {
        const angle = (Math.PI / 5) * i - Math.PI / 2
        const r = i % 2 === 0 ? outerR : innerR
        pts.push(`${(cx + r * Math.cos(angle)).toFixed(2)},${(cy + r * Math.sin(angle)).toFixed(2)}`)
    }
    return pts.join(' ')
}

// react-pdf's SVG type surface has strokeDasharray but not strokeDashoffset
// (confirmed against node_modules/@react-pdf/types/svg.d.ts) — so a "partial
// ring/arc" fill can't use the usual dasharray+dashoffset trick. Instead,
// the filled portion is its own arc path computed from actual start/end
// angles (0°=3 o'clock, clockwise, matching SVG's y-down convention).
function polarPoint(cx: number, cy: number, r: number, angleDeg: number) {
    const rad = (angleDeg * Math.PI) / 180
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
    const start = polarPoint(cx, cy, r, startAngle)
    const end = polarPoint(cx, cy, r, endAngle)
    const largeArc = endAngle - startAngle <= 180 ? 0 : 1
    return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`
}

/** "value / max" readout — the web version's ValueReadout, reused beside the
 *  four visuals (stars, battery, bars, nodes) that don't have room to print
 *  the number inside the shape itself the way Ring/Gauge do. */
function ValueReadout({ value, max }: { value: number | null; max: number }) {
    return (
        <Text style={styles.readoutValue}>
            {value ?? '–'} <Text style={styles.readoutMax}>/ {max}</Text>
        </Text>
    )
}

function RingVisual({ value, min, max, accent }: VisualProps) {
    const r = 15, cx = 19, cy = 19
    const pct = max > min && value != null ? (value - min + 1) / (max - min + 1) : 0
    // A near-360° arc's start/end points round to the same coordinate at
    // toFixed(2) precision and silently draw nothing — a full ring is drawn
    // as a plain Circle instead of chasing that precision edge case, and a
    // real one (rating something max/max) is common, not rare.
    const isFull = pct >= 0.999
    const endAngle = -90 + pct * 360
    return (
        <View style={{ position: 'relative', width: 38, height: 38 }}>
            <Svg width={38} height={38} viewBox="0 0 38 38">
                <Circle cx={cx} cy={cy} r={r} stroke="#EEF0EF" strokeWidth={5} fill="none" />
                {isFull ? (
                    <Circle cx={cx} cy={cy} r={r} stroke={accent} strokeWidth={5} fill="none" />
                ) : pct > 0 ? (
                    <Path d={describeArc(cx, cy, r, -90, endAngle)} stroke={accent} strokeWidth={5} fill="none" strokeLinecap="round" />
                ) : null}
            </Svg>
            <View style={styles.visualOverlayCenter}>
                <Text style={styles.visualNumber}>{value ?? '–'}</Text>
            </View>
        </View>
    )
}

function StarsVisual({ value, min, max, accent }: VisualProps) {
    const count = max - min + 1
    const filled = value != null ? value - min + 1 : 0
    const step = 13
    const width = count * step
    return (
        <View style={styles.readoutRow}>
            <Svg width={width} height={14} viewBox={`0 0 ${width} 14`}>
                {Array.from({ length: count }).map((_, i) => {
                    const isFilled = i < filled
                    return (
                        <Polygon
                            key={i}
                            points={starPoints(i * step + step / 2, 7, 6, 2.4)}
                            fill={isFilled ? accent : '#FFFFFF'}
                            stroke={isFilled ? accent : '#D1D5DB'}
                            strokeWidth={0.75}
                        />
                    )
                })}
            </Svg>
            <ValueReadout value={value} max={max} />
        </View>
    )
}

/** Half-circle speedometer arc — a full grey background semicircle (fixed
 *  path, left to right), with the accent-colored fill drawn as its own
 *  partial arc from the same left start point, swept clockwise by `pct` of
 *  the 180° span (see the note above RingVisual on why not dash-offset). */
function GaugeVisual({ value, min, max, accent }: VisualProps) {
    const r = 16, cx = 20, cy = 20
    const pct = max > min && value != null ? (value - min) / (max - min) : 0
    const backgroundD = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`
    const endAngle = 180 + pct * 180
    return (
        <View style={{ position: 'relative', width: 40, height: 22 }}>
            <Svg width={40} height={22} viewBox="0 0 40 22">
                <Path d={backgroundD} stroke="#EEF0EF" strokeWidth={5} fill="none" strokeLinecap="round" />
                {pct > 0 && (
                    <Path d={describeArc(cx, cy, r, 180, endAngle)} stroke={accent} strokeWidth={5} fill="none" strokeLinecap="round" />
                )}
            </Svg>
            <View style={styles.visualOverlayBottom}>
                <Text style={styles.visualNumber}>{value ?? '–'}</Text>
            </View>
        </View>
    )
}

function BatteryVisual({ value, min, max, accent }: VisualProps) {
    const pct = max > min && value != null ? (value - min + 1) / (max - min + 1) : 0
    const w = 16, h = 38
    const fillH = pct * (h - 6)
    return (
        <View style={styles.readoutRow}>
            <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
                <Rect x={1} y={1} width={w - 2} height={h - 2} rx={(w - 2) / 2} fill="#FFFFFF" stroke={accent} strokeOpacity={0.4} strokeWidth={1.5} />
                <Rect x={4} y={h - 3 - fillH} width={w - 8} height={fillH} rx={(w - 8) / 2} fill={accent} />
            </Svg>
            <ValueReadout value={value} max={max} />
        </View>
    )
}

function BarsVisual({ value, min, max, accent }: VisualProps) {
    const steps = max - min + 1
    const filled = value != null ? value - min + 1 : 0
    const barW = 4, gap = 3, maxH = 24
    const width = steps * (barW + gap)
    return (
        <View style={styles.readoutRow}>
            <Svg width={width} height={maxH} viewBox={`0 0 ${width} ${maxH}`}>
                {Array.from({ length: steps }).map((_, i) => {
                    const h = maxH * (0.35 + (i / Math.max(steps - 1, 1)) * 0.65)
                    return (
                        <Rect
                            key={i}
                            x={i * (barW + gap)}
                            y={maxH - h}
                            width={barW}
                            height={h}
                            rx={1}
                            fill={i < filled ? accent : '#E5E7EB'}
                        />
                    )
                })}
            </Svg>
            <ValueReadout value={value} max={max} />
        </View>
    )
}

function NodesVisual({ value, min, max, accent }: VisualProps) {
    const steps = max - min + 1
    const filled = value != null ? value - min + 1 : 0
    const nodeR = 3, gap = 15, pad = nodeR + 2
    const width = (steps - 1) * gap + pad * 2
    const cy = 8
    const filledSpan = filled > 1 ? (filled - 1) * gap : 0
    return (
        <View style={styles.readoutRow}>
            <Svg width={width} height={16} viewBox={`0 0 ${width} 16`}>
                <Line x1={pad} y1={cy} x2={width - pad} y2={cy} stroke="#E5E7EB" strokeWidth={2} />
                {filledSpan > 0 && <Line x1={pad} y1={cy} x2={pad + filledSpan} y2={cy} stroke={accent} strokeWidth={2} />}
                {Array.from({ length: steps }).map((_, i) => {
                    const isFilled = i < filled
                    return (
                        <Circle
                            key={i}
                            cx={pad + i * gap}
                            cy={cy}
                            r={nodeR}
                            fill={isFilled ? accent : '#FFFFFF'}
                            stroke={isFilled ? accent : '#D1D5DB'}
                            strokeWidth={1.5}
                        />
                    )
                })}
            </Svg>
            <ValueReadout value={value} max={max} />
        </View>
    )
}

const VISUALS: Record<CapabilityVisualKind, (props: VisualProps) => React.ReactElement> = {
    ring: RingVisual,
    stars: StarsVisual,
    gauge: GaugeVisual,
    battery: BatteryVisual,
    bars: BarsVisual,
    nodes: NodesVisual,
}

/** "Strongest area" / "Growth focus" — mirrors CapabilityGraphGrid's own
 *  InsightBanner exactly (same reduce-to-extremes logic), just re-declared
 *  here since it renders with react-pdf primitives instead of DOM ones. */
function CapabilityInsightBanner({ answers, questions }: { answers: CapabilityAnswers; questions: CapabilityScaleQuestion[] }) {
    const rated = questions
        .map(q => {
            const answer = answers[q.id]
            return { question: q, value: answer?.type === 'scale' ? answer.value : null }
        })
        .filter((r): r is { question: CapabilityScaleQuestion; value: number } => r.value != null)

    if (rated.length < 2) return null

    const strongest = rated.reduce((best, r) => (r.value > best.value ? r : best), rated[0])
    const weakest = rated.reduce((worst, r) => (r.value < worst.value ? r : worst), rated[0])
    if (strongest.question.category === weakest.question.category) return null

    return (
        <View style={styles.insightRow} wrap={false}>
            <View style={[styles.insightBox, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
                <Text style={[styles.insightText, { color: '#065F46' }]}>
                    <Text style={{ fontWeight: 'bold' }}>Strongest area: </Text>
                    {strongest.question.category} ({strongest.value}/{strongest.question.max})
                </Text>
            </View>
            <View style={[styles.insightBox, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
                <Text style={[styles.insightText, { color: '#92400E' }]}>
                    <Text style={{ fontWeight: 'bold' }}>Growth focus: </Text>
                    {weakest.question.category} ({weakest.value}/{weakest.question.max})
                </Text>
            </View>
        </View>
    )
}

/** Six chart forms — one per self-rating category, matching the web grid
 *  exactly (see CATEGORY_VISUAL_KIND), each on its own tinted card (matching
 *  CATEGORY_TINTS) in a 3-column grid, same as the web version's card grid —
 *  plus the Working Style answers as their own tinted box row. `wrap={false}`
 *  throughout keeps a card/box from being split across a page break. Emoji
 *  glyphs aren't attempted for Working Style: react-pdf's core Helvetica font
 *  only covers WinAnsi encoding, not Unicode emoji, so the tinted box and its
 *  label carry the same information instead. */
function CapabilitySection({ answers }: { answers: CapabilityAnswers }) {
    const scaleQuestions = getScaleQuestions()
    const choiceQuestions = getChoiceQuestions()

    return (
        <View>
            <CapabilityInsightBanner answers={answers} questions={scaleQuestions} />

            <View style={styles.categoryGrid}>
                {scaleQuestions.map(question => {
                    const answer = answers[question.id]
                    const value = answer?.type === 'scale' ? answer.value : null
                    const accent = CATEGORY_ACCENTS[question.category]
                    const tint = CATEGORY_TINTS[question.category]
                    const tier = value != null ? TIER_BY_VALUE[value] : null
                    const Visual = VISUALS[CATEGORY_VISUAL_KIND[question.category]]

                    return (
                        <View key={question.id} style={[styles.categoryCard, { backgroundColor: tint }]} wrap={false}>
                            <View style={styles.categoryHeadRow}>
                                <Text style={styles.categoryName}>{question.category}</Text>
                                {tier && <Text style={[styles.tierBadge, { backgroundColor: tier.bg, color: tier.fg }]}>{tier.label}</Text>}
                            </View>
                            <View style={styles.categoryVisualRow}>
                                <Visual value={value} min={question.min} max={question.max} accent={accent} />
                                <Text style={styles.categoryLabelSub}>
                                    {value != null ? question.labels[value - question.min] : 'Not answered'}
                                </Text>
                            </View>
                        </View>
                    )
                })}
            </View>

            {choiceQuestions.length > 0 && (
                <View style={[styles.workingStyleContainer, { marginTop: 10 }]} wrap={false}>
                    <Text style={[styles.label, { marginBottom: 8 }]}>Working Style</Text>
                    <View style={styles.workingStyleGrid}>
                        {choiceQuestions.map((question, i) => {
                            const answer = answers[question.id]
                            const option = answer?.type === 'choice' ? question.options.find(o => o.id === answer.optionId) : undefined
                            return (
                                <View
                                    key={question.id}
                                    style={[styles.workingStyleBox, { backgroundColor: WORKING_STYLE_TINTS[i % WORKING_STYLE_TINTS.length] }]}
                                >
                                    <Text style={styles.workingStyleLabel}>{option?.label ?? 'Not answered yet'}</Text>
                                </View>
                            )
                        })}
                    </View>
                </View>
            )}
        </View>
    )
}

/** The interactive checkpoint map has no static equivalent worth forcing —
 *  a plain cleared/still-to-go checklist says the same thing on paper. */
function FutureRoleSection({
    submittedGoal,
    roleProfile,
    skillGap,
    capabilityGap,
}: {
    submittedGoal: string | null
    roleProfile: RoleSkillProfile | null
    skillGap: SkillGap | null
    capabilityGap: CapabilityGap | null
}) {
    if (!submittedGoal || !roleProfile || !skillGap || !capabilityGap) {
        return <Text style={styles.muted}>No future goal set yet.</Text>
    }

    const totalItems = skillGap.matched.length + skillGap.gaps.length + capabilityGap.matched.length + capabilityGap.gaps.length
    const matchedItems = skillGap.matched.length + capabilityGap.matched.length
    const overallPct = totalItems > 0 ? Math.round((matchedItems / totalItems) * 100) : 0

    const skillItems = [
        ...skillGap.matched.map(label => ({ label, done: true })),
        ...skillGap.gaps.map(label => ({ label, done: false })),
    ]
    const capabilityItems = [
        ...capabilityGap.matched.map(c => ({ label: `${c.category} (${c.currentLevel}/${c.targetLevel})`, done: true })),
        ...capabilityGap.gaps.map(c => ({ label: `${c.category} (${c.currentLevel}/${c.targetLevel})`, done: false })),
    ]

    return (
        <View>
            <View style={{ marginBottom: 10 }} wrap={false}>
                <Text style={styles.roleTitle}>{roleProfile.roleTitle}</Text>
                <Text style={[styles.muted, { marginTop: 2, marginBottom: 4 }]}>
                    {overallPct}% ready — {matchedItems} of {totalItems} checkpoints cleared
                </Text>
                <ProgressBar pct={overallPct} />
            </View>

            <View style={styles.twoCol}>
                <View style={styles.col}>
                    <Text style={[styles.label, { marginBottom: 6 }]}>Technical Skills</Text>
                    {skillItems.map(item => (
                        <View key={item.label} style={styles.checklistItem} wrap={false}>
                            <View style={[styles.checkDot, { backgroundColor: item.done ? '#8DCFB3' : '#E5E7EB' }]} />
                            <Text style={styles.muted}>{item.label}</Text>
                        </View>
                    ))}
                </View>
                <View style={styles.col}>
                    <Text style={[styles.label, { marginBottom: 6 }]}>Growth Areas</Text>
                    {capabilityItems.map(item => (
                        <View key={item.label} style={styles.checklistItem} wrap={false}>
                            <View style={[styles.checkDot, { backgroundColor: item.done ? '#8DCFB3' : '#E5E7EB' }]} />
                            <Text style={styles.muted}>{item.label}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    )
}

/** The web version keeps this behind an accordion — a PDF has no concept of
 *  "collapsed", so every category is just always listed. `wrap={false}` on
 *  the grid keeps all four tiles together rather than splitting mid-tile
 *  across a page break. */
function ProgressSection() {
    return (
        <View style={styles.progressGrid} wrap={false}>
            {PROGRESS_SECTIONS.map(section => (
                <View key={section.id} style={styles.progressTile} wrap={false}>
                    <Text style={styles.progressTileTitle}>{section.title}</Text>
                    <Text style={styles.progressTileValue}>
                        {section.counts.unavailable
                            ? 'Unavailable'
                            : `${section.counts.completed} completed · ${section.counts.inProgress} in progress`}
                    </Text>
                </View>
            ))}
        </View>
    )
}

/**
 * A purpose-built PDF document (via @react-pdf/renderer), not a screenshot
 * of the live page — every section is composed fresh from the same data the
 * dashboard shows, laid out flat since a static document has no notion of
 * "collapsed" or "the tab you weren't on". See ProfileBanner's Export
 * Profile button, which calls `pdf(<DashboardPdfDocument .../>).toBlob()`.
 */
export default function DashboardPdfDocument({
    fullName,
    email,
    resumeFileName,
    resumeSummary,
    resumeRoles,
    skills,
    interests,
    capabilityCompleted,
    capabilityAnswers,
    submittedGoal,
    roleProfile,
    skillGap,
    capabilityGap,
    exportedAt,
}: DashboardPdfDocumentProps) {
    return (
        <Document title={`${fullName} - Profile Snapshot`}>
            <Page size="A4" style={styles.page}>
                <View style={styles.headerRow}>
                    <View>
                        <Text style={styles.name}>{fullName}</Text>
                        {email && <Text style={styles.email}>{email}</Text>}
                    </View>
                    <Text style={styles.exportMeta}>{'Profile Snapshot\nExported ' + exportedAt}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Current Role</Text>
                    <ResumeSection
                        resumeFileName={resumeFileName}
                        resumeSummary={resumeSummary}
                        resumeRoles={resumeRoles}
                        skills={skills}
                        interests={interests}
                    />
                </View>

                {capabilityCompleted && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Capability Snapshot</Text>
                        <CapabilitySection answers={capabilityAnswers} />
                    </View>
                )}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Future Role &amp; Roadmap</Text>
                    <FutureRoleSection
                        submittedGoal={submittedGoal}
                        roleProfile={roleProfile}
                        skillGap={skillGap}
                        capabilityGap={capabilityGap}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Your Progress</Text>
                    <ProgressSection />
                </View>

                <Text
                    style={styles.footer}
                    fixed
                    render={({ pageNumber, totalPages }) => `Osmosis Dashboard mock-up — page ${pageNumber} of ${totalPages}`}
                />
            </Page>
        </Document>
    )
}
