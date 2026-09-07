'use client'

import { useRef, useState } from 'react'
import { Trophy, ScrollText, Award, Upload, X, type LucideIcon } from 'lucide-react'

interface CredentialCategory {
    id: string
    label: string
    description: string
    icon: LucideIcon
}

const CATEGORIES: CredentialCategory[] = [
    { id: 'achievements', label: 'Achievements', description: 'Awards, recognitions, or milestones worth showing off.', icon: Trophy },
    { id: 'recommendations', label: 'Letters of Recommendation', description: 'A reference letter from a manager, mentor, or colleague.', icon: ScrollText },
    { id: 'certificates', label: 'Certificates', description: 'Proof of a course you completed on this platform.', icon: Award },
]

/** One category's dropzone — purely local state, mocked like every other
 *  upload in this project (see DashboardClient's resume-upload input). */
function UploadSlot({ category }: { category: CredentialCategory }) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [files, setFiles] = useState<string[]>([])
    const Icon = category.icon

    const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        const picked = Array.from(e.target.files ?? []).map(f => f.name)
        e.target.value = ''
        if (picked.length === 0) return
        setFiles(prev => Array.from(new Set([...prev, ...picked])))
    }

    const removeFile = (name: string) => {
        setFiles(prev => prev.filter(f => f !== name))
    }

    return (
        <div className="rounded-xl border-2 border-dashed border-pod-border bg-pod-bg-soft p-4 flex flex-col">
            <div className="flex items-center gap-2 mb-1">
                <Icon aria-hidden className="h-4 w-4 text-pod-primary" />
                <p className="text-sm font-semibold text-pod-text">{category.label}</p>
            </div>
            <p className="text-xs text-pod-muted mb-3">{category.description}</p>

            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="inline-flex items-center justify-center gap-1.5 self-start rounded-lg border border-pod-border bg-white px-3 py-2 text-xs font-semibold text-pod-text transition hover:border-pod-primary-medium hover:text-pod-primary"
            >
                <Upload className="h-3.5 w-3.5" />
                Upload file
            </button>
            <input ref={inputRef} type="file" multiple className="hidden" onChange={handleFilesSelected} />

            {files.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                    {files.map(name => (
                        <li
                            key={name}
                            className="flex items-center justify-between gap-2 rounded-lg border border-pod-border bg-white px-2.5 py-1.5 text-xs text-pod-text"
                        >
                            <span className="truncate">{name}</span>
                            <button
                                type="button"
                                onClick={() => removeFile(name)}
                                aria-label={`Remove ${name}`}
                                className="shrink-0 text-pod-muted transition hover:text-pod-text"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

/**
 * A place to attach supporting documents — achievements, letters of
 * recommendation, and certificates earned from completing courses on this
 * platform. Distinct from the resume-parsed certifications already shown in
 * ProfileCapabilityReflection's ResumeSnapshot: those are read from a resume,
 * these are the actual documents the member attaches themselves. Entirely
 * mocked (local state only) — this mock-up has no backend or file storage.
 */
export default function CredentialsUploadSection() {
    return (
        <article className="rounded-2xl border border-pod-border bg-white shadow-sm p-6">
            <h2 className="text-lg font-semibold text-pod-text">Achievements &amp; Credentials</h2>
            <p className="text-sm text-pod-muted mt-1">
                Add supporting documents to your profile — achievements, letters of recommendation, and certificates from courses you completed on this platform.
            </p>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {CATEGORIES.map(category => (
                    <UploadSlot key={category.id} category={category} />
                ))}
            </div>
        </article>
    )
}
