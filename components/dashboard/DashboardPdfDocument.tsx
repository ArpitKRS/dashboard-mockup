import { Document, Page, View, Text, StyleSheet, Svg, Path, Circle, Polygon, Line } from '@react-pdf/renderer'
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
    HABIT_TIER_HEX,
    PROFICIENCY_RADAR_LABELS,
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
    // One style family per Capability Snapshot question card — replaces the
    // old category-grid/working-style styles now that no question is a
    // plain 'scale'/'choice' pair anymore.
    qCard: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 10, marginBottom: 10 },
    qCardTitle: { fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 8 },
    qCardQuote: { fontSize: 9, fontStyle: 'italic', color: '#26302B' },
    qCardMuted: { fontSize: 9, color: '#6E6E6E' },
    qCardMeta: { fontSize: 7.5, color: '#6E6E6E', marginTop: 6, textAlign: 'center' },
    diagGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    diagCell: { width: '48%', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 6, backgroundColor: '#FFFFFF', padding: 8 },
    diagCellLabel: { fontSize: 8, fontWeight: 'bold', marginBottom: 3 },
    tagsWrapSmall: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
    tagChipSmall: { fontSize: 7.5, fontWeight: 'bold', color: '#8DCFB3', backgroundColor: '#EDF8F3', borderRadius: 8, paddingVertical: 2, paddingHorizontal: 6 },
    habitGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    habitCell: { width: '31%', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 6, backgroundColor: '#FFFFFF', padding: 6 },
    habitCellLabel: { fontSize: 7, fontWeight: 'bold', color: '#26302B' },
    habitCellValue: { fontSize: 7, fontWeight: 'bold', color: '#6E6E6E', marginTop: 2 },
    medalRow: { flexDirection: 'row', gap: 8, width: '100%' },
    medalCard: { flex: 1, borderWidth: 1.5, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 6, alignItems: 'center' },
    medalBadge: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
    medalBadgeText: { fontSize: 9, fontWeight: 'bold', color: '#FFFFFF' },
    medalLabel: { fontSize: 8, fontWeight: 'bold', color: '#26302B', textAlign: 'center' },
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
                    <Text style={styles.label}>Current Capability</Text>
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

// ── One bespoke visual per Capability Snapshot question, drawn with
// react-pdf's SVG/View/Text primitives (lucide-react icons and CapabilityGraphGrid's
// DOM elements can't render inside react-pdf's own renderer). No emoji: react-pdf's
// core Helvetica font only covers WinAnsi encoding, not Unicode emoji, so every emoji
// used on the web (question titles, habit tiers, medals) is dropped here in favor of
// plain text/color — same convention already established for the old Working Style
// section. Shared geometry (radarPoint/radarPolygonPoints/podiumBlockPaths/
// PODIUM_LAYOUT) comes from lib/capabilityVisuals.ts so the web and PDF plot the exact
// same shapes from the exact same answers.

/** N-axis radar — the shared shape for Curiosity Drive (4 axes) and the
 *  Proficiency Matrix (8 axes). Axis labels are absolutely-positioned Views
 *  over the Svg (not drawn inside it): react-pdf's Svg has no reliable way
 *  to host arbitrary positioned text, same reasoning as the numeric overlays
 *  on the old ring/gauge visuals. */
function PdfRadarChart({
    axes,
    values,
    max,
    accent,
    size = 180,
}: {
    axes: string[]
    values: (number | null)[]
    max: number
    accent: string
    size?: number
}) {
    const cx = size / 2
    const cy = size / 2
    const radius = size / 2 - 38
    const ringFractions = [0.25, 0.5, 0.75, 1]

    return (
        <View style={{ position: 'relative', width: size, height: size }}>
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {ringFractions.map(f => (
                    <Polygon
                        key={f}
                        points={axes.map((_, i) => { const p = radarPoint(i, axes.length, radius * f, cx, cy); return `${p.x},${p.y}` }).join(' ')}
                        fill="none"
                        stroke="#E5E7EB"
                        strokeWidth={1}
                    />
                ))}
                {axes.map((_, i) => {
                    const p = radarPoint(i, axes.length, radius, cx, cy)
                    return <Line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#E5E7EB" strokeWidth={1} />
                })}
                <Polygon points={radarPolygonPoints(values, max, cx, cy, radius)} fill={accent} fillOpacity={0.2} stroke={accent} strokeWidth={2} />
                {values.map((v, i) => {
                    if (v == null) return null
                    const p = radarPoint(i, axes.length, (Math.max(v, 0) / max) * radius, cx, cy)
                    return <Circle key={i} cx={p.x} cy={p.y} r={2.5} fill={accent} />
                })}
            </Svg>
            {axes.map((label, i) => {
                const p = radarPoint(i, axes.length, radius + 22, cx, cy)
                return (
                    <View key={i} style={{ position: 'absolute', left: p.x - 30, top: p.y - 6, width: 60, alignItems: 'center' }}>
                        <Text style={{ fontSize: 6.5, fontWeight: 'bold', textAlign: 'center' }}>{label}</Text>
                    </View>
                )
            })}
        </View>
    )
}

function PdfTextCard({ question, answer }: { question: CapabilityTextQuestion; answer: CapabilityAnswer | undefined }) {
    const text = answer?.type === 'text' ? answer.value : null
    return (
        <View style={[styles.qCard, { backgroundColor: '#EFF6FF' }]} wrap={false}>
            <Text style={styles.qCardTitle}>Future Study Plans</Text>
            <Text style={text ? styles.qCardQuote : styles.qCardMuted}>{text ? `"${text}"` : 'Not answered yet'}</Text>
        </View>
    )
}

function PdfMultiScaleCard({ question, answers }: { question: CapabilityMultiScaleQuestion; answers: CapabilityAnswers }) {
    const answer = answers[question.id]
    const scores = answer?.type === 'multi-scale' ? answer.scores : {}
    const axes = question.dimensions.map(d => d.label.split(' (')[0])
    const values = question.dimensions.map(d => scores[d.id]?.value ?? null)
    const answeredCount = values.filter(v => v != null).length

    return (
        <View style={[styles.qCard, { backgroundColor: '#FFFBEB' }]} wrap={false}>
            <Text style={styles.qCardTitle}>{question.title}</Text>
            <View style={{ alignItems: 'center' }}>
                <PdfRadarChart axes={axes} values={values} max={question.max} accent="#F59E0B" />
                <Text style={styles.qCardMeta}>{answeredCount}/{question.dimensions.length} rated</Text>
            </View>
        </View>
    )
}

function PdfProficiencyCard({ question, answers }: { question: CapabilityProficiencyMatrixQuestion; answers: CapabilityAnswers }) {
    const averages = deriveProficiencyCompetencyAverages(question, answers)
    const axes = averages.map(a => PROFICIENCY_RADAR_LABELS[a.competencyId] ?? a.title)
    const values = averages.map(a => a.average)
    const answeredCount = averages.reduce((sum, a) => sum + a.answeredCount, 0)
    const totalCount = averages.reduce((sum, a) => sum + a.indicatorCount, 0)

    return (
        <View style={[styles.qCard, { backgroundColor: '#EEF2FF' }]} wrap={false}>
            <Text style={styles.qCardTitle}>{question.title}</Text>
            <View style={{ alignItems: 'center' }}>
                <PdfRadarChart axes={axes} values={values} max={question.max} accent="#6366F1" size={210} />
                <Text style={styles.qCardMeta}>{answeredCount}/{totalCount} indicators rated</Text>
            </View>
        </View>
    )
}

/** The same 3D-ish podium as the web (front/top/side faces per block, via
 *  podiumBlockPaths + PODIUM_LAYOUT) — flattened into one Path list rather
 *  than grouped, since react-pdf's Svg primitive set has no <G>. A plain
 *  ranked list underneath backs up the on-block labels, since an 8pt name
 *  centered over a 70pt-wide block can legitimately run out of room. */
function PdfPodiumCard({ question, answers }: { question: CapabilityRankQuestion; answers: CapabilityAnswers }) {
    const answer = answers[question.id]
    const ranking = answer?.type === 'rank' ? answer.ranking : {}
    const rankedCount = Object.keys(ranking).length
    const podiumPaths = PODIUM_LAYOUT.flatMap(block => {
        const paths = podiumBlockPaths(block.x, block.width, PODIUM_GROUND_Y, block.height)
        const colors = PODIUM_BLOCK_COLORS[block.rank]
        return [
            { key: `${block.rank}-side`, d: paths.side, fill: colors.side },
            { key: `${block.rank}-top`, d: paths.top, fill: colors.top },
            { key: `${block.rank}-front`, d: paths.front, fill: colors.front },
        ]
    })

    return (
        <View style={[styles.qCard, { backgroundColor: '#F7F7F7' }]} wrap={false}>
            <Text style={styles.qCardTitle}>Top Drivers</Text>
            <View style={{ alignItems: 'center' }}>
                <View style={{ position: 'relative', width: PODIUM_VIEWBOX.width, height: PODIUM_VIEWBOX.height }}>
                    <Svg width={PODIUM_VIEWBOX.width} height={PODIUM_VIEWBOX.height} viewBox={`0 0 ${PODIUM_VIEWBOX.width} ${PODIUM_VIEWBOX.height}`}>
                        {podiumPaths.map(p => <Path key={p.key} d={p.d} fill={p.fill} />)}
                    </Svg>
                    {PODIUM_LAYOUT.map(block => (
                        <View
                            key={block.rank}
                            style={{
                                position: 'absolute',
                                left: block.x, top: PODIUM_GROUND_Y - block.height,
                                width: block.width, height: block.height,
                                alignItems: 'center', justifyContent: 'center',
                            }}
                        >
                            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#FFFFFF' }}>{block.rank}</Text>
                        </View>
                    ))}
                </View>
                <View style={[styles.medalRow, { marginTop: 8 }]}>
                    {PODIUM_LAYOUT.slice().sort((a, b) => a.rank - b.rank).map(block => {
                        const option = question.options.find(o => ranking[o.id] === block.rank)
                        const colors = PODIUM_BLOCK_COLORS[block.rank]
                        return (
                            <View key={block.rank} style={[styles.medalCard, { backgroundColor: colors.top, borderColor: colors.front }]}>
                                <View style={[styles.medalBadge, { backgroundColor: colors.side }]}>
                                    <Text style={styles.medalBadgeText}>{block.rank}</Text>
                                </View>
                                <Text style={styles.medalLabel}>{option?.label ?? 'Not ranked yet'}</Text>
                            </View>
                        )
                    })}
                </View>
                <Text style={styles.qCardMeta}>{rankedCount}/{question.topN} ranked</Text>
            </View>
        </View>
    )
}

/** An item-level heatmap (each of the 12 habits tinted by its own tier) —
 *  matches CapabilityGraphGrid's web card exactly; an aggregate count per
 *  tier isn't as useful as seeing which specific habit needs work. */
function PdfHabitCard({ question, answers }: { question: CapabilityHabitChecklistQuestion; answers: CapabilityAnswers }) {
    const answer = answers[question.id]
    const selections = answer?.type === 'habit-checklist' ? answer.selections : {}
    const answeredCount = Object.values(selections).filter(Boolean).length

    return (
        <View style={[styles.qCard, { backgroundColor: '#F0FDFA' }]} wrap={false}>
            <Text style={styles.qCardTitle}>{question.title}</Text>
            <View style={styles.habitGrid}>
                {question.items.map(item => {
                    const optionIndex = question.options.findIndex(o => o.id === selections[item.id])
                    const option = optionIndex >= 0 ? question.options[optionIndex] : undefined
                    const color = optionIndex >= 0 ? HABIT_TIER_HEX[optionIndex] : '#9CA3AF'
                    return (
                        <View key={item.id} style={styles.habitCell}>
                            <Text style={styles.habitCellLabel}>{item.label}</Text>
                            <Text style={[styles.habitCellValue, { color }]}>{option?.label ?? 'Not answered'}</Text>
                        </View>
                    )
                })}
            </View>
            <Text style={[styles.qCardMeta, { textAlign: 'left', marginTop: 8 }]}>{answeredCount}/{question.items.length} answered</Text>
        </View>
    )
}

/** Energy Dynamics and Growth Goals & Alignment share this one form — both
 *  are diagnostic panels mixing (or, for Growth Goals, made entirely of)
 *  free text with select-all-that-apply checklists. */
function PdfDiagnosticCard({ question, answers, tint }: { question: CapabilityDiagnosticQuestion; answers: CapabilityAnswers; tint: string }) {
    const answer = answers[question.id]
    const rows = answer?.type === 'diagnostic-panel' ? answer.rows : {}

    return (
        <View style={[styles.qCard, { backgroundColor: tint }]} wrap={false}>
            <Text style={styles.qCardTitle}>{question.title}</Text>
            <View style={styles.diagGrid}>
                {question.rows.map(row => {
                    const rowAnswer = rows[row.id]
                    if (row.type === 'text') {
                        const text = rowAnswer?.text?.trim()
                        return (
                            <View key={row.id} style={styles.diagCell}>
                                <Text style={styles.diagCellLabel}>{row.label}</Text>
                                <Text style={text ? styles.qCardQuote : styles.qCardMuted}>{text ? `"${text}"` : 'Not answered yet'}</Text>
                            </View>
                        )
                    }
                    const selected = row.options.filter(o => rowAnswer?.optionIds?.includes(o.id))
                    return (
                        <View key={row.id} style={styles.diagCell}>
                            <Text style={styles.diagCellLabel}>{row.label}</Text>
                            {selected.length > 0 ? (
                                <View style={styles.tagsWrapSmall}>
                                    {selected.map(o => <Text key={o.id} style={styles.tagChipSmall}>{o.label}</Text>)}
                                </View>
                            ) : (
                                <Text style={styles.qCardMuted}>Not answered yet</Text>
                            )}
                        </View>
                    )
                })}
            </View>
        </View>
    )
}

/** "Strongest area" / "Growth focus" — pooled across the two numeric
 *  self-rating questions (Curiosity Drive's dimensions + the Proficiency
 *  Matrix's competency averages), mirroring CapabilityGraphGrid's own
 *  CapabilityInsightBanner exactly, just re-declared with react-pdf
 *  primitives instead of DOM ones. */
function CapabilityInsightBanner({ answers }: { answers: CapabilityAnswers }) {
    const points = deriveNumericSelfRatingPoints(answers)
    if (points.length < 2) return null
    const strongest = points.reduce((best, p) => (p.value > best.value ? p : best), points[0])
    const weakest = points.reduce((worst, p) => (p.value < worst.value ? p : worst), points[0])
    if (strongest.label === weakest.label) return null

    return (
        <View style={styles.insightRow} wrap={false}>
            <View style={[styles.insightBox, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
                <Text style={[styles.insightText, { color: '#065F46' }]}>
                    <Text style={{ fontWeight: 'bold' }}>Strongest area: </Text>
                    {strongest.label} ({strongest.value.toFixed(1)}/10)
                </Text>
            </View>
            <View style={[styles.insightBox, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
                <Text style={[styles.insightText, { color: '#92400E' }]}>
                    <Text style={{ fontWeight: 'bold' }}>Growth focus: </Text>
                    {weakest.label} ({weakest.value.toFixed(1)}/10)
                </Text>
            </View>
        </View>
    )
}

/** One card per Capability Building Form question, in the same order as the
 *  web grid — stacked full-width rather than packed into a multi-column
 *  grid, since a fixed A4 page reads better as a vertical list than a forced
 *  responsive grid, but every card's own chart/content matches the web
 *  version exactly. `wrap={false}` on each card keeps it from splitting
 *  across a page break. */
function CapabilitySection({ answers }: { answers: CapabilityAnswers }) {
    return (
        <View>
            <CapabilityInsightBanner answers={answers} />
            {CAPABILITY_QUESTIONS.map(question => {
                switch (question.type) {
                    case 'text':
                        return <PdfTextCard key={question.id} question={question} answer={answers[question.id]} />
                    case 'multi-scale':
                        return <PdfMultiScaleCard key={question.id} question={question} answers={answers} />
                    case 'diagnostic-panel':
                        return (
                            <PdfDiagnosticCard
                                key={question.id}
                                question={question}
                                answers={answers}
                                tint={question.id === 'energy-dynamics' ? '#F5F3FF' : '#ECFDF5'}
                            />
                        )
                    case 'rank':
                        return <PdfPodiumCard key={question.id} question={question} answers={answers} />
                    case 'proficiency-matrix':
                        return <PdfProficiencyCard key={question.id} question={question} answers={answers} />
                    case 'habit-checklist':
                        return <PdfHabitCard key={question.id} question={question} answers={answers} />
                    default:
                        return null
                }
            })}
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
                    <Text style={styles.sectionTitle}>Status & Progress</Text>
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
