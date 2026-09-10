'use client'

import { useRef, useState } from 'react'
import {
    Quote, ScrollText, Award, Upload, X, ArrowRight, Eye, Download,
    UserPlus, Send, Plus, Trash2, type LucideIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import UserAvatar from '@/components/ui/UserAvatar'
import AccordionPanel from '@/components/ui/AccordionPanel'
import Modal from '@/components/ui/Modal'
import { MOCK_TESTIMONIALS } from './mockTestimonialsData'
import { MOCK_PLATFORM_CERTIFICATES, type PlatformCertificate } from './mockPlatformCertificates'
import { MOCK_POD_USERS, type PodUser } from './mockPodUsers'

interface AuthenticatedCapabilitySectionProps {
    fullName: string
}

/** One uploaded letter of recommendation. */
interface RecommendationLetter {
    id: string
    name: string
    fileName: string
    url: string
}

function CredentialCard({
    icon: Icon,
    label,
    description,
    ctaLabel,
    onClick,
}: {
    icon: LucideIcon
    label: string
    description: string
    ctaLabel: string
    onClick: () => void
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="rounded-xl border-2 border-dashed border-pod-border bg-pod-bg-soft p-4 flex flex-col items-start text-left transition hover:border-pod-primary-medium hover:bg-white"
        >
            <div className="flex items-center gap-2 mb-1">
                <Icon aria-hidden className="h-4 w-4 text-pod-primary" />
                <p className="text-sm font-semibold text-pod-text">{label}</p>
            </div>
            <p className="text-xs text-pod-muted mb-3">{description}</p>
            <span className="mt-auto inline-flex items-center gap-1.5 text-xs font-semibold text-pod-primary">
                {ctaLabel} <ArrowRight className="h-3.5 w-3.5" />
            </span>
        </button>
    )
}

/** Certificates pop-up: read-only list of platform course completions — the
 *  "Download" button generates a small text stand-in on the fly (this
 *  mock-up has no real PDF certificate to serve), same mocked-but-functional
 *  spirit as every other download/upload affordance in this project. */
function CertificatesModal({
    certificates,
    fullName,
    onDelete,
    onClose,
}: {
    certificates: PlatformCertificate[]
    fullName: string
    onDelete: (id: string) => void
    onClose: () => void
}) {
    const handleDownload = (cert: PlatformCertificate) => {
        const completed = new Date(cert.completedDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
        const text = `Certificate of Completion\n\n${fullName} has successfully completed "${cert.courseName}" on this platform.\n\nCompleted: ${completed}\nCredential ID: ${cert.credentialId}`
        const blob = new Blob([text], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = `${cert.courseName.replace(/\s+/g, '-').toLowerCase()}-certificate.txt`
        anchor.click()
        URL.revokeObjectURL(url)
    }

    return (
        <Modal
            title="Your Certificates"
            subtitle="Earned by completing courses on this platform."
            icon={<Award className="w-4 h-4 text-pod-primary" />}
            onClose={onClose}
        >
            {certificates.length === 0 ? (
                <p className="text-sm text-pod-muted">Complete a course on this platform to earn your first certificate.</p>
            ) : (
                <div className="space-y-3">
                    {certificates.map(cert => (
                        <div key={cert.id} className="flex items-center justify-between gap-3 rounded-xl border border-pod-border bg-pod-bg-soft p-4">
                            <div className="flex min-w-0 flex-1 items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-amber-300 to-amber-500 ring-4 ring-amber-100">
                                    <Award aria-hidden className="h-5 w-5 text-white" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-pod-text truncate">{cert.courseName}</p>
                                    <p className="text-xs text-pod-muted">
                                        Completed {new Date(cert.completedDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })} · {cert.credentialId}
                                    </p>
                                </div>
                            </div>
                            <div className="shrink-0 flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleDownload(cert)}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-pod-border bg-white px-3 py-1.5 text-xs font-semibold text-pod-text transition hover:border-pod-primary-medium hover:text-pod-primary"
                                >
                                    <Download className="h-3.5 w-3.5" /> Download
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onDelete(cert.id)}
                                    aria-label={`Delete ${cert.courseName}`}
                                    className="text-pod-muted transition hover:text-red-600"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Modal>
    )
}

/** Letters of Recommendation pop-up: view/download what's already uploaded,
 *  plus a small add-new form (name + file) — the one credential category
 *  that's genuinely user-supplied, so it keeps the upload affordance the
 *  others gave up in favor of read-only/verify views. */
function LettersModal({
    letters,
    onAdd,
    onDelete,
    onClose,
}: {
    letters: RecommendationLetter[]
    onAdd: (input: { name: string; file: File }) => void
    onDelete: (id: string) => void
    onClose: () => void
}) {
    const [name, setName] = useState('')
    const [pendingFile, setPendingFile] = useState<File | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const canAdd = name.trim().length > 0 && pendingFile != null

    const handleAdd = () => {
        if (!canAdd || !pendingFile) return
        onAdd({ name: name.trim(), file: pendingFile })
        setName('')
        setPendingFile(null)
    }

    return (
        <Modal
            title="Letters of Recommendation"
            subtitle="Reference letters from a manager, mentor, or colleague."
            icon={<ScrollText className="w-4 h-4 text-pod-primary" />}
            onClose={onClose}
        >
            <div className="space-y-3">
                {letters.length === 0 ? (
                    <p className="text-sm text-pod-muted">No letters uploaded yet.</p>
                ) : (
                    letters.map(letter => (
                        <div key={letter.id} className="flex items-center justify-between gap-3 rounded-xl border border-pod-border bg-pod-bg-soft p-3.5">
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-pod-primary">
                                    <ScrollText className="h-4 w-4" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-pod-text truncate">{letter.name}</p>
                                    <p className="text-xs text-pod-muted truncate">{letter.fileName}</p>
                                </div>
                            </div>
                            <div className="shrink-0 flex items-center gap-2">
                                <a
                                    href={letter.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 rounded-lg border border-pod-border bg-white px-2.5 py-1.5 text-xs font-semibold text-pod-text transition hover:border-pod-primary-medium hover:text-pod-primary"
                                >
                                    <Eye className="h-3.5 w-3.5" /> View
                                </a>
                                <a
                                    href={letter.url}
                                    download={letter.fileName}
                                    className="inline-flex items-center gap-1 rounded-lg border border-pod-border bg-white px-2.5 py-1.5 text-xs font-semibold text-pod-text transition hover:border-pod-primary-medium hover:text-pod-primary"
                                >
                                    <Download className="h-3.5 w-3.5" /> Download
                                </a>
                                <button
                                    type="button"
                                    onClick={() => onDelete(letter.id)}
                                    aria-label={`Delete ${letter.name}`}
                                    className="text-pod-muted transition hover:text-red-600"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="mt-5 border-t border-pod-border pt-4">
                <p className="text-xs font-bold uppercase tracking-widest text-pod-muted mb-2.5">Add a new letter</p>
                <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Letter from my manager"
                        className="min-w-0 flex-1 rounded-lg border border-pod-border bg-pod-bg-soft px-3 py-2.5 text-sm text-pod-text outline-none transition focus:border-transparent focus:ring-2 focus:ring-pod-primary"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-pod-border bg-white px-3 py-2.5 text-sm font-semibold text-pod-text transition hover:border-pod-primary-medium hover:text-pod-primary"
                    >
                        <Upload className="h-4 w-4" />
                        <span className="max-w-[8rem] truncate">{pendingFile ? pendingFile.name : 'Choose file'}</span>
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={e => {
                            const file = e.target.files?.[0]
                            e.target.value = ''
                            if (file) setPendingFile(file)
                        }}
                    />
                    <button
                        type="button"
                        onClick={handleAdd}
                        disabled={!canAdd}
                        className="shrink-0 inline-flex items-center justify-center gap-1.5 rounded-lg bg-pod-primary px-4 py-2.5 text-sm font-semibold text-pod-primary-foreground transition hover:bg-pod-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Plus className="h-4 w-4" /> Add
                    </button>
                </div>
            </div>
        </Modal>
    )
}

/** Invite Peers pop-up: search + multi-select over the pod's members, then a
 *  mocked "send". Real behaviour (per product intent) would notify each
 *  invited person, who fills in a testimony from their notifications that
 *  then lands back here automatically — there's no notification system in
 *  this mock-up, so sending just closes the dialog with a toast. */
function InvitePeersModal({ onClose }: { onClose: () => void }) {
    const [query, setQuery] = useState('')
    const [selected, setSelected] = useState<PodUser[]>([])
    const [sending, setSending] = useState(false)

    const filtered = MOCK_POD_USERS.filter(user =>
        !selected.some(s => s.id === user.id) &&
        (user.name.toLowerCase().includes(query.toLowerCase()) || user.role.toLowerCase().includes(query.toLowerCase()))
    )

    const handleSend = () => {
        if (selected.length === 0 || sending) return
        setSending(true)
        toast.success(`Invite sent to ${selected.length} ${selected.length === 1 ? 'person' : 'people'}.`)
        setTimeout(onClose, 600)
    }

    return (
        <Modal
            title="Invite Peers for a Testimony"
            subtitle="They'll get a notification to write a few words about working with you."
            icon={<UserPlus className="w-4 h-4 text-pod-primary" />}
            onClose={onClose}
            footer={
                <>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-pod-border px-4 py-2 text-sm text-pod-text transition hover:bg-white"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSend}
                        disabled={selected.length === 0 || sending}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-pod-primary px-4 py-2 text-sm font-semibold text-pod-primary-foreground transition hover:bg-pod-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Send className="h-3.5 w-3.5" /> Send invite{selected.length > 1 ? 's' : ''}
                    </button>
                </>
            }
        >
            {selected.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1.5">
                    {selected.map(user => (
                        <span key={user.id} className="inline-flex items-center gap-1 rounded-full bg-pod-primary-light px-2.5 py-1 text-xs font-semibold text-pod-primary">
                            {user.name}
                            <button type="button" onClick={() => setSelected(prev => prev.filter(u => u.id !== user.id))} aria-label={`Remove ${user.name}`}>
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search people in your pod…"
                className="mb-3 w-full rounded-lg border border-pod-border bg-pod-bg-soft px-3 py-2.5 text-sm text-pod-text outline-none transition focus:border-transparent focus:ring-2 focus:ring-pod-primary"
            />

            <div className="max-h-56 space-y-1 overflow-y-auto">
                {filtered.length === 0 ? (
                    <p className="py-4 text-center text-sm text-pod-muted">No matching people found.</p>
                ) : (
                    filtered.map(user => (
                        <button
                            key={user.id}
                            type="button"
                            onClick={() => setSelected(prev => [...prev, user])}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-pod-bg-soft"
                        >
                            <UserAvatar name={user.name} size={32} />
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-pod-text truncate">{user.name}</p>
                                <p className="text-xs text-pod-muted truncate">{user.role}</p>
                            </div>
                        </button>
                    ))
                )}
            </div>

            <p className="mt-4 text-[11px] text-pod-muted">
                Mocked for this prototype — in the real app, each person gets a notification, opens it, fills in a short testimony, and it appears here automatically once submitted.
            </p>
        </Modal>
    )
}

/** Seeds one already-uploaded letter so the "fully built-out" mock persona
 *  has something to look at immediately, same as every other section on
 *  this page — its object URL points to a small generated text stand-in
 *  (there's no real uploaded file for a seeded row), so View/Download still
 *  work like they would for a genuinely uploaded one. */
function seedLetters(): RecommendationLetter[] {
    const blob = new Blob(
        ['This is a mock letter of recommendation for Jordan Ellis, provided as sample content for this dashboard prototype.'],
        { type: 'text/plain' }
    )
    return [{ id: 'seed-1', name: 'Letter from Priya Nair (Team Lead)', fileName: 'priya-nair-recommendation.txt', url: URL.createObjectURL(blob) }]
}

/**
 * "Authenticated Capability" — what other people have said about this member
 * (Testimonials, plus an "Invite peers" flow to collect more), and the
 * supporting documents that back their profile up: Certificates (earned on
 * this platform) and Letters of Recommendation (uploaded directly here).
 * Résumé-derived Achievements live at the top of Status & Progress instead
 * (see ProgressCountsPanel) — Poh Moi's direction from the Sep 10 sandbox
 * session was that certifications/badges belong there, as a feel-good/pride
 * signal, not in this authentication-and-proof bucket.
 * Each credential category opens its own pop-up rather than being an inline
 * dropzone, since Certificates are no longer a raw upload — see
 * CredentialCard below.
 */
export default function AuthenticatedCapabilitySection({ fullName }: AuthenticatedCapabilitySectionProps) {
    const [open, setOpen] = useState(false)

    const [showInvite, setShowInvite] = useState(false)
    const [showCertificates, setShowCertificates] = useState(false)
    const [showLetters, setShowLetters] = useState(false)

    const [letters, setLetters] = useState<RecommendationLetter[]>(seedLetters)
    const [certificates, setCertificates] = useState<PlatformCertificate[]>(MOCK_PLATFORM_CERTIFICATES)

    const handleAddLetter = ({ name, file }: { name: string; file: File }) => {
        setLetters(prev => [...prev, { id: `letter-${Date.now()}`, name, fileName: file.name, url: URL.createObjectURL(file) }])
    }

    const handleDeleteLetter = (id: string) => {
        setLetters(prev => {
            const target = prev.find(letter => letter.id === id)
            if (target) URL.revokeObjectURL(target.url)
            return prev.filter(letter => letter.id !== id)
        })
    }

    const handleDeleteCertificate = (id: string) => {
        setCertificates(prev => prev.filter(cert => cert.id !== id))
    }

    return (
        <>
            <AccordionPanel
                title="Authenticated Capability"
                open={open}
                onToggle={() => setOpen(o => !o)}
                className="overflow-hidden"
            >
                <div className="px-6 pt-5 pb-6">
                    <p className="text-sm text-pod-muted">
                        What others have said about working with you, plus the documents that back it up.
                    </p>

                    <div className="mt-6">
                        <div className="mb-3 flex items-center justify-between gap-3">
                            <p className="text-xs font-bold uppercase tracking-widest text-pod-muted">Testimonials</p>
                            <button
                                type="button"
                                onClick={() => setShowInvite(true)}
                                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-pod-border bg-white px-3 py-1.5 text-xs font-semibold text-pod-text transition hover:border-pod-primary-medium hover:text-pod-primary"
                            >
                                <UserPlus className="h-3.5 w-3.5" /> Invite peers to write a testimony
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {MOCK_TESTIMONIALS.map(testimonial => (
                                <div key={testimonial.name} className="rounded-xl border border-pod-border bg-pod-bg-soft p-4 flex flex-col">
                                    <Quote aria-hidden className="h-4 w-4 text-pod-primary mb-2" />
                                    <p className="text-xs leading-relaxed italic text-pod-text flex-1">
                                        &ldquo;{testimonial.quote}&rdquo;
                                    </p>
                                    <div className="flex items-center gap-2.5 mt-4 pt-3 border-t border-pod-border">
                                        <UserAvatar name={testimonial.name} size={32} />
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold text-pod-text truncate">{testimonial.name}</p>
                                            <p className="text-[11px] text-pod-muted truncate">{testimonial.relationship}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-pod-border">
                        <p className="text-xs font-bold uppercase tracking-widest text-pod-muted mb-1">Credentials</p>
                        <p className="text-sm text-pod-muted mb-3">
                            Certificates and letters of recommendation live here. (Achievements pulled from your resume are up top, in Status &amp; Progress.)
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <CredentialCard
                                icon={ScrollText}
                                label="Letters of Recommendation"
                                description="A reference letter from a manager, mentor, or colleague."
                                ctaLabel="View & upload letters"
                                onClick={() => setShowLetters(true)}
                            />
                            <CredentialCard
                                icon={Award}
                                label="Certificates"
                                description="Proof of a course you completed on this platform."
                                ctaLabel="View your certificates"
                                onClick={() => setShowCertificates(true)}
                            />
                        </div>
                    </div>
                </div>
            </AccordionPanel>

            {showInvite && <InvitePeersModal onClose={() => setShowInvite(false)} />}
            {showCertificates && (
                <CertificatesModal certificates={certificates} fullName={fullName} onDelete={handleDeleteCertificate} onClose={() => setShowCertificates(false)} />
            )}
            {showLetters && (
                <LettersModal letters={letters} onAdd={handleAddLetter} onDelete={handleDeleteLetter} onClose={() => setShowLetters(false)} />
            )}
        </>
    )
}
