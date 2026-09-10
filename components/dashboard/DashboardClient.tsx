'use client'

import { useState, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { pdf } from '@react-pdf/renderer'
import {
    MOCK_RESUME_SKILLS,
    MOCK_RESUME_INTERESTS,
    MOCK_RESUME_SUMMARY,
    MOCK_RESUME_ROLES,
    MOCK_RESUME_EDUCATION,
    MOCK_RESUME_CERTIFICATIONS,
    type ResumeRoleSummary,
    type ResumeCertification,
} from './mockResumeData'
import { MOCK_CAPABILITY_ANSWERS } from './mockCapabilityAnswers'
import { type CapabilityAnswers, type CapabilityAnswer, isCapabilityFormComplete } from '@/lib/capabilityForm'
import { getRoleSkillProfile, getArchetypeProfile, mergeRoleAndArchetype, computeSkillGap, computeCapabilityGap, computeOverallMatch, getAdjacentRoleMatches } from '@/lib/futureRole'
import ProfileBanner from './ProfileBanner'
import CurrentCapabilityCard from './CurrentCapabilityCard'
import ProfileCapabilityReflection from './ProfileCapabilityReflection'
import ProgressCountsPanel from './ProgressCountsPanel'
import AuthenticatedCapabilitySection from './AuthenticatedCapabilitySection'
import CapabilityBuildingForm from './CapabilityBuildingForm'
import DashboardPdfDocument from './DashboardPdfDocument'

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
    // Seeded as a fully-built-out mock member ("Jordan Ellis") rather than an
    // empty brand-new profile — every section below should render its
    // completed state the moment the page loads, not a blank prompt to fill
    // it in. See mockResumeData.ts/mockCapabilityAnswers.ts for the rest of
    // this persona's data.
    const [firstName] = useState('Jordan')
    const [lastName] = useState('Ellis')
    const [email] = useState('jordan.ellis@example.com')
    const [resumeFileName, setResumeFileName] = useState<string | null>('resume.pdf')
    const [capabilityAnswers, setCapabilityAnswers] = useState<CapabilityAnswers>(MOCK_CAPABILITY_ANSWERS)
    const [capabilityCompletedAt, setCapabilityCompletedAt] = useState<string | null>('2026-08-20T09:15:00.000Z')

    // The Dashboard's own copy of what the resume produced.
    const [skills, setSkills] = useState<string[]>(MOCK_RESUME_SKILLS)
    const [interests, setInterests] = useState<string[]>(MOCK_RESUME_INTERESTS)
    const [resumeSummary, setResumeSummary] = useState<string | null>(MOCK_RESUME_SUMMARY)
    const [resumeRoles, setResumeRoles] = useState<ResumeRoleSummary[] | null>(MOCK_RESUME_ROLES)
    const [resumeEducation, setResumeEducation] = useState<string | null>(MOCK_RESUME_EDUCATION)
    const [resumeCertifications, setResumeCertifications] = useState<ResumeCertification[] | null>(MOCK_RESUME_CERTIFICATIONS)

    // Lifted out of ProfileCapabilityReflection (rather than left local there)
    // so the PDF export below can derive the same role/skill-gap data.
    const [submittedGoal, setSubmittedGoal] = useState<string | null>('Senior Software Engineer')

    // Manually-typed reflections for the Future Role & Roadmap tab — unlike
    // submittedGoal, these never get computed against anything; they're the
    // user's own words, lifted here only so a future PDF pass can include
    // them the same way it already does for submittedGoal.
    const [personalVisionStatement, setPersonalVisionStatement] = useState(
        'I want to grow into a technical leader who ships reliable software and helps the people around me level up just as fast as I do.'
    )
    const [sixTwelveMonthPlan, setSixTwelveMonthPlan] = useState(
        'Lead the next major feature end-to-end, start mentoring a junior engineer formally, and close out the AWS Solutions Architect certification.'
    )
    const [futureVisionArchetype, setFutureVisionArchetype] = useState<string | null>('expert')

    const [showCapabilityForm, setShowCapabilityForm] = useState(false)
    const [isExporting, setIsExporting] = useState(false)
    const resumeFileInputRef = useRef<HTMLInputElement>(null)

    const resumeUploaded = Boolean(resumeFileName)
    const capabilityCompleted = Boolean(capabilityCompletedAt) || isCapabilityFormComplete(capabilityAnswers)
    const completionPct = (resumeUploaded ? 50 : 0) + (capabilityCompleted ? 50 : 0)

    // Same merge as ProfileCapabilityReflection (the roadmap should reflect
    // both the typed role and the picked archetype) — kept in sync here so
    // the exported PDF's roadmap matches the web page exactly.
    const baseRoleProfile = submittedGoal ? getRoleSkillProfile(submittedGoal) : null
    const archetypeProfile = getArchetypeProfile(futureVisionArchetype)
    const roleProfile = mergeRoleAndArchetype(baseRoleProfile, archetypeProfile)
    const skillGap = roleProfile ? computeSkillGap(skills, roleProfile.requiredSkills) : null
    const capabilityGap = roleProfile ? computeCapabilityGap(capabilityAnswers, roleProfile.requiredCapabilities) : null
    const overallMatch = skillGap && capabilityGap ? computeOverallMatch(skillGap, capabilityGap) : 0

    // The skill names behind overallMatch's skill half, turned into one
    // plain sentence by ProfileBanner's buildSkillInsight rather than a
    // second percentage. (Not doing the equivalent for the capability half:
    // computeCapabilityGap's "current level" comes from deriveScaleChartData,
    // which only reads scale-type question answers — and the Capability
    // Building Form's real 7 questions are none of them scale-type anymore,
    // so that side is always 0. Surfacing that would just look broken, not
    // informative.)
    const skillsMatched = skillGap?.matched ?? []
    const skillsGaps = skillGap?.gaps ?? []

    // Predictive Recommendation studies the whole dashboard against the main
    // goal (above) and, separately, against up to two adjacent roles — same
    // scoring method, just pointed at a different destination.
    const adjacentRoles = roleProfile ? getAdjacentRoleMatches(roleProfile.roleTitle, skills, capabilityAnswers) : []

    const fullName = [firstName, lastName].filter(Boolean).join(' ').trim() || 'Member'

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
            setResumeEducation(MOCK_RESUME_EDUCATION)
            setResumeCertifications(MOCK_RESUME_CERTIFICATIONS)
            setResumeFileName(file.name)
            toast.success(`Resume imported: ${file.name}`, { id: 'dashboard-resume-upload' })
        }, MOCK_RESUME_PROCESSING_MS)
    }, [])

    const handleCapabilityCompleted = useCallback((answers: CapabilityAnswers) => {
        setCapabilityAnswers(answers)
        setCapabilityCompletedAt(new Date().toISOString())
    }, [])

    // A single category's graph gets edited on its own, without reopening
    // the whole questionnaire — see CapabilityGraphGrid's per-card Edit.
    const handleCapabilityAnswerChange = useCallback((questionId: string, answer: CapabilityAnswer) => {
        setCapabilityAnswers(prev => ({ ...prev, [questionId]: answer }))
    }, [])

    // Builds a fresh DashboardPdfDocument from current state and downloads
    // it as a real .pdf — via @react-pdf/renderer's own renderer, not a
    // screenshot of the page, so there's no browser chrome, no "expandable"
    // sections left collapsed, and no six-shape chart mess to rasterize.
    const handleExportClick = useCallback(async () => {
        if (isExporting) return
        setIsExporting(true)
        try {
            const exportedAt = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })

            const blob = await pdf(
                <DashboardPdfDocument
                    fullName={fullName}
                    email={email}
                    resumeFileName={resumeFileName}
                    resumeSummary={resumeSummary}
                    resumeRoles={resumeRoles}
                    skills={skills}
                    interests={interests}
                    capabilityCompleted={capabilityCompleted}
                    capabilityAnswers={capabilityAnswers}
                    submittedGoal={submittedGoal}
                    roleProfile={roleProfile}
                    skillGap={skillGap}
                    capabilityGap={capabilityGap}
                    exportedAt={exportedAt}
                />
            ).toBlob()

            const url = URL.createObjectURL(blob)
            const anchor = document.createElement('a')
            anchor.href = url
            anchor.download = `${fullName.replace(/\s+/g, '-').toLowerCase() || 'profile'}-snapshot.pdf`
            anchor.click()
            URL.revokeObjectURL(url)
            toast.success('Profile PDF downloaded.')
        } catch (err) {
            console.error('Failed to generate profile PDF:', err)
            toast.error('Could not generate the PDF. Please try again.')
        } finally {
            setIsExporting(false)
        }
    }, [
        isExporting, fullName, email, completionPct, resumeFileName, resumeSummary,
        resumeRoles, skills, interests, capabilityCompleted, capabilityAnswers, submittedGoal,
        futureVisionArchetype, roleProfile, skillGap, capabilityGap,
    ])

    return (
        <div className="space-y-6">
            <ProfileBanner
                firstName={firstName}
                lastName={lastName}
                email={email}
                completionPct={completionPct}
                resumeUploaded={resumeUploaded}
                resumeFileName={resumeFileName}
                capabilityCompleted={capabilityCompleted}
                onUploadResumeClick={() => resumeFileInputRef.current?.click()}
                onCapabilityFormClick={() => setShowCapabilityForm(true)}
                onExportClick={handleExportClick}
                isExporting={isExporting}
                mainRoleTitle={roleProfile?.roleTitle ?? null}
                overallMatch={overallMatch}
                skillsMatched={skillsMatched}
                skillsGaps={skillsGaps}
                adjacentRoles={adjacentRoles}
            />

            <CurrentCapabilityCard summary={resumeSummary} />

            <ProfileCapabilityReflection
                completionPct={completionPct}
                capabilityCompleted={capabilityCompleted}
                capabilityAnswers={capabilityAnswers}
                skills={skills}
                interests={interests}
                resumeRoles={resumeRoles}
                submittedGoal={submittedGoal}
                onGoalSubmit={setSubmittedGoal}
                personalVisionStatement={personalVisionStatement}
                onPersonalVisionStatementChange={setPersonalVisionStatement}
                sixTwelveMonthPlan={sixTwelveMonthPlan}
                onSixTwelveMonthPlanChange={setSixTwelveMonthPlan}
                futureVisionArchetype={futureVisionArchetype}
                onFutureVisionArchetypeSelect={setFutureVisionArchetype}
                onAnswerChange={handleCapabilityAnswerChange}
            />

            <ProgressCountsPanel achievements={resumeCertifications} />

            <AuthenticatedCapabilitySection fullName={fullName} />

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
                    firstName={firstName}
                    resumeEducation={resumeEducation}
                    onClose={() => setShowCapabilityForm(false)}
                    onCompleted={handleCapabilityCompleted}
                />
            )}
        </div>
    )
}
