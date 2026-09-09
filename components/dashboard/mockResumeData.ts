/** A role from resume-parsed work history — deliberately has no employer or
 *  location field, per the platform's privacy policy.
 *
 *  Copied verbatim from osmosis/app/pod/[subdomain]/explore/dashboard/mockResumeData.ts.
 */
export interface ResumeRoleSummary {
    title: string
    description: string
    duration: string
}

/**
 * Stands in for a real ai/resume-parse response on the Dashboard. Same data
 * regardless of which file is picked — see DashboardClient's file input.
 */
// Deliberately excludes System Design, Cloud Architecture, and CI/CD — those
// stay unmatched on purpose, since ProgressCountsPanel's Learning Paths
// bullets explicitly call them out as named roadmap gaps the member hasn't
// closed yet. Every other entry is chosen to genuinely overlap with the
// futureRole.ts ROLE_PROFILES for the main goal (Senior Software Engineer +
// The Expert archetype) and this member's two adjacent paths (Engineering
// Manager, Product Manager) — "Stakeholder Management"/"Data Analysis" in
// particular echo the "working closely with design and product teams"
// experience already in MOCK_RESUME_ROLES below.
export const MOCK_RESUME_SKILLS = [
    'React', 'TypeScript', 'Node.js', 'SQL', 'Project Management',
    'Code Review', 'Mentoring', 'Deep Technical Mastery', 'Best Practices', 'Documentation',
    'Technical Strategy', 'Hiring',
    'Stakeholder Management', 'Data Analysis',
]
export const MOCK_RESUME_INTERESTS = ['Product Design', 'Data Analysis']

export const MOCK_RESUME_SUMMARY =
    'A versatile professional with a strong foundation in building user-facing applications and collaborating closely with cross-functional teams to ship reliable software.'

export const MOCK_RESUME_EDUCATION = 'B.Tech in Computer Science, National Institute of Technology'

export const MOCK_RESUME_ROLES: ResumeRoleSummary[] = [
    {
        title: 'Frontend Developer',
        description: 'Built and maintained responsive web applications, working closely with design and product teams to ship new features.',
        duration: '2 yrs 4 mos',
    },
    {
        title: 'Junior Software Engineer',
        description: 'Contributed to backend services and internal tooling, focusing on API development and test coverage.',
        duration: '1 yr 6 mos',
    },
]

/** A certification mentioned on the resume — rendered as a trophy-case
 *  "Achievements" badge (see ProfileCapabilityReflection's ResumeSnapshot),
 *  game/LeetCode-style, rather than as another plain tag or bullet. */
export interface ResumeCertification {
    title: string
    issuer: string
}

export const MOCK_RESUME_CERTIFICATIONS: ResumeCertification[] = [
    { title: 'AWS Certified Solutions Architect – Associate', issuer: 'Amazon Web Services' },
    { title: 'Certified Scrum Master', issuer: 'Scrum Alliance' },
    { title: 'Meta Front-End Developer Professional Certificate', issuer: 'Meta' },
]
