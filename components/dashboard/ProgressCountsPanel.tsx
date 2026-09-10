'use client'

import { useRef, useState } from 'react'
import {
    Check, AlertTriangle, ChevronDown, BookOpen, ClipboardCheck, ListChecks, Layers, Calendar,
    Trophy, BadgeCheck, CircleDashed, Upload, Eye, Download, Trash2, Plus, type LucideIcon,
} from 'lucide-react'
import Modal from '@/components/ui/Modal'
import type { ResumeCertification } from './mockResumeData'

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

/** One achievement's uploaded proof — a real File the member picked, kept as
 *  local state only (mocked like every other upload in this project). */
interface AchievementProof {
    file: File
    url: string
}

/** An achievement the member types in themselves, rather than one pulled
 *  from resume parsing — same verify-by-upload flow as a resume achievement
 *  (see AchievementProof/AchievementRow below), just with no issuer line
 *  since there's no resume metadata behind it. Underlying logic (e.g.
 *  matching a typed name against a real credential registry) is a later
 *  decision — for this mock-up, typing a name and clicking Add is enough to
 *  create the (not verified) row. */
interface ManualAchievement {
    id: string
    title: string
    proof?: AchievementProof
}

/** Seeds the first achievement as already verified, so the "fully built-out"
 *  mock persona shows every state at a glance the moment the pop-up opens:
 *  one Verified (with a real, viewable/downloadable proof file), and the
 *  other two still "(not verified)" with the upload-to-verify affordance. */
function seedAchievementProofs(): Record<number, AchievementProof> {
    const file = new File(
        ['Mock verification document for Jordan Ellis — AWS Certified Solutions Architect – Associate.'],
        'aws-certified-solutions-architect-proof.pdf',
        { type: 'application/pdf' }
    )
    return { 0: { file, url: URL.createObjectURL(file) } }
}

/** One achievement row inside the detail pop-up — the shared verify-by-upload
 *  card used for both résumé-pulled achievements (title + issuer, proof keyed
 *  by array index) and member-typed ones (title only, proof keyed by the
 *  achievement's own id) — same visual treatment either way: a real proof
 *  document earns the "Verified" badge, otherwise it stays "(not verified)"
 *  with an upload affordance. */
function AchievementRow({
    title,
    issuer,
    proof,
    onUploadProof,
    onDelete,
}: {
    title: string
    issuer?: string
    proof: AchievementProof | undefined
    onUploadProof: (file: File) => void
    onDelete: () => void
}) {
    const inputRef = useRef<HTMLInputElement>(null)

    return (
        <div className="rounded-xl border border-pod-border bg-pod-bg-soft p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-pod-text">{title}</p>
                    {issuer && <p className="text-xs text-pod-muted">{issuer}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                    {proof ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                            <BadgeCheck className="h-3.5 w-3.5" /> Verified
                        </span>
                    ) : (
                        <span className="text-[11px] font-medium text-pod-muted">(not verified)</span>
                    )}
                    <button
                        type="button"
                        onClick={onDelete}
                        aria-label={`Delete ${title}`}
                        className="text-pod-muted transition hover:text-red-600"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
                {proof ? (
                    <>
                        <span className="min-w-0 max-w-[10rem] truncate text-xs text-pod-muted" title={proof.file.name}>
                            {proof.file.name}
                        </span>
                        <a
                            href={proof.url}
                            target="_blank"
                            rel="noreferrer"
                            className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-pod-border bg-white px-2.5 py-1.5 text-xs font-semibold text-pod-text transition hover:border-pod-primary-medium hover:text-pod-primary"
                        >
                            <Eye className="h-3.5 w-3.5" /> View
                        </a>
                        <a
                            href={proof.url}
                            download={proof.file.name}
                            className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-pod-border bg-white px-2.5 py-1.5 text-xs font-semibold text-pod-text transition hover:border-pod-primary-medium hover:text-pod-primary"
                        >
                            <Download className="h-3.5 w-3.5" /> Download
                        </a>
                        <button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            className="shrink-0 text-xs font-semibold text-pod-primary transition hover:text-pod-primary-hover"
                        >
                            Update
                        </button>
                    </>
                ) : (
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-pod-border bg-white px-3 py-1.5 text-xs font-semibold text-pod-text transition hover:border-pod-primary-medium hover:text-pod-primary"
                    >
                        <Upload className="h-3.5 w-3.5" /> Upload proof to verify
                    </button>
                )}
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    onChange={e => {
                        const file = e.target.files?.[0]
                        e.target.value = ''
                        if (file) onUploadProof(file)
                    }}
                />
            </div>
        </div>
    )
}

/** Achievements detail pop-up: lists what resume parsing found (transferred
 *  in from the Resume area, not typed here) plus whatever the member has
 *  typed in themselves below — same verify-by-upload flow either way. Proof
 *  state lives one level up (ProgressCountsPanel) so it survives this modal
 *  closing, and so the trophy-shelf row above can reflect verified state too. */
function AchievementsModal({
    achievements,
    proofs,
    onUploadProof,
    removedIndices,
    onDeleteAchievement,
    manualAchievements,
    onAddManualAchievement,
    onUploadManualProof,
    onDeleteManualAchievement,
    onClose,
}: {
    achievements: ResumeCertification[] | null
    proofs: Record<number, AchievementProof>
    onUploadProof: (index: number, file: File) => void
    removedIndices: Set<number>
    onDeleteAchievement: (index: number) => void
    manualAchievements: ManualAchievement[]
    onAddManualAchievement: (title: string) => void
    onUploadManualProof: (id: string, file: File) => void
    onDeleteManualAchievement: (id: string) => void
    onClose: () => void
}) {
    const [newTitle, setNewTitle] = useState('')
    const visibleResumeCount = achievements?.filter((_, i) => !removedIndices.has(i)).length ?? 0
    const hasAnyAchievements = visibleResumeCount > 0 || manualAchievements.length > 0

    const handleAdd = () => {
        const trimmed = newTitle.trim()
        if (!trimmed) return
        onAddManualAchievement(trimmed)
        setNewTitle('')
    }

    return (
        <Modal
            title="Your Achievements"
            subtitle="Pulled in automatically from your resume — or add your own below."
            icon={<Trophy className="w-4 h-4 text-pod-primary" />}
            onClose={onClose}
        >
            {!hasAnyAchievements ? (
                <p className="text-sm text-pod-muted">No achievements yet — upload a resume to bring some in, or add one below.</p>
            ) : (
                <div className="space-y-3">
                    {achievements?.map((achievement, i) => (
                        removedIndices.has(i) ? null : (
                            <AchievementRow
                                key={`resume-${i}`}
                                title={achievement.title}
                                issuer={achievement.issuer}
                                proof={proofs[i]}
                                onUploadProof={file => onUploadProof(i, file)}
                                onDelete={() => onDeleteAchievement(i)}
                            />
                        )
                    ))}
                    {manualAchievements.map(achievement => (
                        <AchievementRow
                            key={achievement.id}
                            title={achievement.title}
                            proof={achievement.proof}
                            onUploadProof={file => onUploadManualProof(achievement.id, file)}
                            onDelete={() => onDeleteManualAchievement(achievement.id)}
                        />
                    ))}
                </div>
            )}

            <div className="mt-5 border-t border-pod-border pt-4">
                <p className="text-xs font-bold uppercase tracking-widest text-pod-muted mb-2.5">Add a new achievement</p>
                <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                        type="text"
                        value={newTitle}
                        onChange={e => setNewTitle(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleAdd() }}
                        placeholder="e.g. Google Data Analytics Certificate"
                        className="min-w-0 flex-1 rounded-lg border border-pod-border bg-pod-bg-soft px-3 py-2.5 text-sm text-pod-text outline-none transition focus:border-transparent focus:ring-2 focus:ring-pod-primary"
                    />
                    <button
                        type="button"
                        onClick={handleAdd}
                        disabled={!newTitle.trim()}
                        className="shrink-0 inline-flex items-center justify-center gap-1.5 rounded-lg bg-pod-primary px-4 py-2.5 text-sm font-semibold text-pod-primary-foreground transition hover:bg-pod-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Plus className="h-4 w-4" /> Add
                    </button>
                </div>
                <p className="mt-1.5 text-xs text-pod-muted">It'll show as (not verified) until you upload proof.</p>
            </div>
        </Modal>
    )
}

/** One award-style badge in the top-of-section trophy shelf — icon medallion,
 *  title, then a Verified/Not verified caption+icon beneath, per the "like
 *  awards" placement Poh Moi asked for. Clicking any badge (or the "Add" one)
 *  opens the same detail pop-up used to view proof, upload verification, or
 *  add a new achievement — this row is the summary, the modal is where the
 *  actual management happens (mock-up scope: display + mocked verify-by-upload
 *  only, no real document validation). */
function AchievementBadge({ title, verified, onClick }: { title: string; verified: boolean; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex w-24 shrink-0 flex-col items-center gap-1.5 text-center transition hover:opacity-80"
        >
            <div
                className={`flex h-14 w-14 items-center justify-center rounded-full ${
                    verified ? 'bg-gradient-to-b from-amber-300 to-amber-500 ring-4 ring-amber-100' : 'bg-pod-bg-soft ring-4 ring-pod-border'
                }`}
            >
                <Trophy aria-hidden className={`h-4 w-4 ${verified ? 'text-white' : 'text-pod-muted'}`} />
            </div>
            <p className="w-full truncate text-[11px] font-semibold text-pod-text" title={title}>
                {title}
            </p>
            {verified ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                    <BadgeCheck className="h-3 w-3" aria-hidden /> Verified
                </span>
            ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-pod-muted">
                    <CircleDashed className="h-3 w-3" aria-hidden /> Not verified
                </span>
            )}
        </button>
    )
}

function AddAchievementBadge({ onClick }: { onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex w-24 shrink-0 flex-col items-center justify-center gap-1.5 text-center text-pod-muted transition hover:text-pod-primary"
        >
            <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-pod-border">
                <Plus className="h-5 w-5" aria-hidden />
            </div>
            <p className="text-[11px] font-semibold">Add</p>
        </button>
    )
}

interface ProgressCountsPanelProps {
    /** Resume-parsed achievements — surfaced here, at the very top of Status
     *  & Progress, ahead of the five activity rows below, per Poh Moi's
     *  direction from the Sep 10 sandbox session: certifications and badges
     *  belong in this section as a positive, feel-good/pride factor for the
     *  user — not as capability proof (that's Authenticated Capability's job).
     *  Null until a resume has been uploaded. */
    achievements: ResumeCertification[] | null
}

/** One card holding the achievements trophy shelf plus every progress
 *  category as an internally-divided row — matches how the rest of the page
 *  groups related content into a single bordered card, rather than separate
 *  boxes stacked with gaps between them. */
export default function ProgressCountsPanel({ achievements }: ProgressCountsPanelProps) {
    const [showAchievements, setShowAchievements] = useState(false)
    const [achievementProofs, setAchievementProofs] = useState<Record<number, AchievementProof>>(seedAchievementProofs)
    const [removedAchievementIndices, setRemovedAchievementIndices] = useState<Set<number>>(new Set())
    const [manualAchievements, setManualAchievements] = useState<ManualAchievement[]>([])

    const handleUploadProof = (index: number, file: File) => {
        setAchievementProofs(prev => {
            const previous = prev[index]
            if (previous) URL.revokeObjectURL(previous.url)
            return { ...prev, [index]: { file, url: URL.createObjectURL(file) } }
        })
    }

    // Resume-parsed achievements aren't owned by this component's state (they
    // come in as a prop from the resume-parse result), so "deleting" one just
    // hides its index here rather than mutating the source array.
    const handleDeleteAchievement = (index: number) => {
        setRemovedAchievementIndices(prev => new Set(prev).add(index))
        setAchievementProofs(prev => {
            const previous = prev[index]
            if (!previous) return prev
            URL.revokeObjectURL(previous.url)
            const next = { ...prev }
            delete next[index]
            return next
        })
    }

    const handleAddManualAchievement = (title: string) => {
        setManualAchievements(prev => [...prev, { id: `manual-${Date.now()}`, title }])
    }

    const handleUploadManualProof = (id: string, file: File) => {
        setManualAchievements(prev => prev.map(achievement => {
            if (achievement.id !== id) return achievement
            if (achievement.proof) URL.revokeObjectURL(achievement.proof.url)
            return { ...achievement, proof: { file, url: URL.createObjectURL(file) } }
        }))
    }

    const handleDeleteManualAchievement = (id: string) => {
        setManualAchievements(prev => {
            const target = prev.find(achievement => achievement.id === id)
            if (target?.proof) URL.revokeObjectURL(target.proof.url)
            return prev.filter(achievement => achievement.id !== id)
        })
    }

    const visibleResumeAchievements = (achievements ?? [])
        .map((achievement, index) => ({ achievement, index }))
        .filter(({ index }) => !removedAchievementIndices.has(index))

    return (
        <div>
            <h2 className="text-lg font-semibold text-pod-text mb-1">Status & Progress</h2>
            <p className="text-xs text-pod-muted mb-3">
                What your activity in each area is — and isn&apos;t — doing for your progress toward your future goal.
            </p>
            <div className="rounded-2xl border border-pod-border bg-white shadow-sm divide-y divide-pod-border overflow-hidden">
                <div className="px-5 py-4">
                    <p className="mb-3 text-xs font-bold uppercase tracking-widest text-pod-muted">Your Achievements</p>
                    <div className="flex gap-3 overflow-x-auto pt-2 pb-1">
                        {visibleResumeAchievements.map(({ achievement, index }) => (
                            <AchievementBadge
                                key={`resume-${index}`}
                                title={achievement.title}
                                verified={Boolean(achievementProofs[index])}
                                onClick={() => setShowAchievements(true)}
                            />
                        ))}
                        {manualAchievements.map(achievement => (
                            <AchievementBadge
                                key={achievement.id}
                                title={achievement.title}
                                verified={Boolean(achievement.proof)}
                                onClick={() => setShowAchievements(true)}
                            />
                        ))}
                        <AddAchievementBadge onClick={() => setShowAchievements(true)} />
                    </div>
                </div>

                {SECTIONS.map(section => (
                    <ProgressRow key={section.id} section={section} />
                ))}
            </div>

            {showAchievements && (
                <AchievementsModal
                    achievements={achievements}
                    proofs={achievementProofs}
                    onUploadProof={handleUploadProof}
                    removedIndices={removedAchievementIndices}
                    onDeleteAchievement={handleDeleteAchievement}
                    manualAchievements={manualAchievements}
                    onAddManualAchievement={handleAddManualAchievement}
                    onUploadManualProof={handleUploadManualProof}
                    onDeleteManualAchievement={handleDeleteManualAchievement}
                    onClose={() => setShowAchievements(false)}
                />
            )}
        </div>
    )
}
