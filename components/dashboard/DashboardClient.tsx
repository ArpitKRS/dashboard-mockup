'use client'

import { useState, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import {
    MOCK_RESUME_SKILLS,
    MOCK_RESUME_INTERESTS,
    MOCK_RESUME_SUMMARY,
    MOCK_RESUME_ROLES,
    type ResumeRoleSummary,
} from './mockResumeData'
import { type CapabilityAnswers, isCapabilityFormComplete } from '@/lib/capabilityForm'
import ProfileBanner from './ProfileBanner'
import CareerPathSection from './CareerPathSection'
import ProgressCountsPanel from './ProgressCountsPanel'
import CapabilityBuildingForm from './CapabilityBuildingForm'

// How long the mocked "analyzing" state lasts before the resume data lands —
// see handleResumeFileSelected.
const MOCK_RESUME_PROCESSING_MS = 1200

/**
 * Adapted from osmosis/app/pod/[subdomain]/explore/dashboard/DashboardClient.tsx.
 *
 * The real component fetches `user/profile/my-profile` and
 * `user/profile/capability-form` on mount; this mock-up has no backend or
 * session, so it starts from a mock signed-in member instead — the banner
 * needs a name and email to show, so an empty "brand new member" state
 * (matching the reference screenshot) isn't useful here.
 */
export default function DashboardClient() {
    const [firstName] = useState('Jordan')
    const [lastName] = useState('Ellis')
    const [email] = useState('jordan.ellis@example.com')
    const [resumeFileName, setResumeFileName] = useState<string | null>(null)
    const [capabilityAnswers, setCapabilityAnswers] = useState<CapabilityAnswers>({})
    const [capabilityCompletedAt, setCapabilityCompletedAt] = useState<string | null>(null)

    // The Dashboard's own editable copy of what the resume produced — seeded
    // from the (mock) upload, then freely editable via the header Edit
    // toggle. Nothing here round-trips to a real backend; it's a mock-up.
    const [skills, setSkills] = useState<string[]>([])
    const [interests, setInterests] = useState<string[]>([])
    const [resumeSummary, setResumeSummary] = useState<string | null>(null)
    const [resumeRoles, setResumeRoles] = useState<ResumeRoleSummary[] | null>(null)
    const [isEditingFields, setIsEditingFields] = useState(false)

    const [showCapabilityForm, setShowCapabilityForm] = useState(false)
    const resumeFileInputRef = useRef<HTMLInputElement>(null)

    const resumeUploaded = Boolean(resumeFileName)
    const capabilityCompleted = Boolean(capabilityCompletedAt) || isCapabilityFormComplete(capabilityAnswers)
    const completionPct = (resumeUploaded ? 50 : 0) + (capabilityCompleted ? 50 : 0)

    // Picking a file simulates the resume-parse result with fixed mock data
    // regardless of what was picked — no modal, no backend call.
    const handleResumeFileSelected = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        e.target.value = ''
        if (!file) return

        toast.loading(`Analyzing ${file.name}…`, { id: 'dashboard-resume-upload' })
        setTimeout(() => {
            setSkills(prev => Array.from(new Set([...prev, ...MOCK_RESUME_SKILLS])))
            setInterests(prev => Array.from(new Set([...prev, ...MOCK_RESUME_INTERESTS])))
            setResumeSummary(MOCK_RESUME_SUMMARY)
            setResumeRoles(MOCK_RESUME_ROLES)
            setResumeFileName(file.name)
            toast.success(`Resume imported: ${file.name}`, { id: 'dashboard-resume-upload' })
        }, MOCK_RESUME_PROCESSING_MS)
    }, [])

    const handleCapabilityCompleted = useCallback((answers: CapabilityAnswers) => {
        setCapabilityAnswers(answers)
        setCapabilityCompletedAt(new Date().toISOString())
    }, [])

    return (
        <div className="space-y-6">
            <ProfileBanner
                firstName={firstName}
                lastName={lastName}
                email={email}
            />

            <CareerPathSection
                completionPct={completionPct}
                resumeUploaded={resumeUploaded}
                resumeFileName={resumeFileName}
                capabilityCompleted={capabilityCompleted}
                capabilityAnswers={capabilityAnswers}
                onUploadResumeClick={() => resumeFileInputRef.current?.click()}
                onCapabilityFormClick={() => setShowCapabilityForm(true)}
                firstName={firstName}
                skills={skills}
                interests={interests}
                resumeSummary={resumeSummary}
                resumeRoles={resumeRoles}
                isEditing={isEditingFields}
                onToggleEditing={() => setIsEditingFields(prev => !prev)}
                onSkillsChange={setSkills}
                onInterestsChange={setInterests}
                onSummaryChange={setResumeSummary}
                onRolesChange={setResumeRoles}
            />

            <ProgressCountsPanel />

            <input
                ref={resumeFileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                className="hidden"
                onChange={handleResumeFileSelected}
            />

            {showCapabilityForm && (
                <CapabilityBuildingForm
                    initialAnswers={capabilityAnswers}
                    onClose={() => setShowCapabilityForm(false)}
                    onCompleted={handleCapabilityCompleted}
                />
            )}
        </div>
    )
}
