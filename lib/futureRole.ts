import { deriveScaleChartData, type CapabilityAnswers, type CapabilityCategory } from './capabilityForm'

/**
 * Mock "AI" lookup for the Dashboard's Future Goal panel: given a typed role
 * title, returns a plausible required technical-skill list AND the
 * capability-questionnaire categories that role leans on, with the self-
 * rating level it expects. Nothing here calls a real model — it's a small
 * canned table matched by keyword, with a generic fallback for anything
 * unrecognized, so the mock-up never dead-ends on an unexpected goal.
 */

export interface RequiredCapability {
    category: CapabilityCategory
    /** Self-rating (1-5) the role expects on this capability. */
    targetLevel: number
}

export interface RoleSkillProfile {
    roleTitle: string
    requiredSkills: string[]
    requiredCapabilities: RequiredCapability[]
}

const ROLE_PROFILES: { match: string[]; roleTitle: string; requiredSkills: string[]; requiredCapabilities: RequiredCapability[] }[] = [
    {
        match: ['senior software engineer', 'senior engineer', 'senior developer'],
        roleTitle: 'Senior Software Engineer',
        requiredSkills: ['System Design', 'Code Review', 'Mentoring', 'TypeScript', 'Cloud Architecture', 'CI/CD'],
        requiredCapabilities: [
            { category: 'Technical Confidence', targetLevel: 5 },
            { category: 'Leadership', targetLevel: 4 },
            { category: 'Communication', targetLevel: 4 },
        ],
    },
    {
        match: ['engineering manager', 'team lead', 'tech lead'],
        roleTitle: 'Engineering Manager',
        requiredSkills: ['People Management', 'Performance Reviews', 'Hiring', 'Technical Strategy', 'Budgeting'],
        requiredCapabilities: [
            { category: 'Leadership', targetLevel: 5 },
            { category: 'Communication', targetLevel: 5 },
            { category: 'Collaboration', targetLevel: 4 },
        ],
    },
    {
        match: ['product manager'],
        roleTitle: 'Product Manager',
        requiredSkills: ['Roadmapping', 'Stakeholder Management', 'User Research', 'Data Analysis', 'Prioritization'],
        requiredCapabilities: [
            { category: 'Communication', targetLevel: 5 },
            { category: 'Collaboration', targetLevel: 5 },
            { category: 'Problem-Solving', targetLevel: 4 },
        ],
    },
    {
        match: ['data scientist', 'data analyst'],
        roleTitle: 'Data Scientist',
        requiredSkills: ['Machine Learning', 'Statistics', 'Python', 'Data Visualization', 'SQL'],
        requiredCapabilities: [
            { category: 'Problem-Solving', targetLevel: 5 },
            { category: 'Technical Confidence', targetLevel: 5 },
            { category: 'Adaptability', targetLevel: 3 },
        ],
    },
    {
        match: ['ux designer', 'product designer', 'designer'],
        roleTitle: 'Product Designer',
        requiredSkills: ['User Research', 'Wireframing', 'Prototyping', 'Design Systems', 'Usability Testing'],
        requiredCapabilities: [
            { category: 'Collaboration', targetLevel: 4 },
            { category: 'Communication', targetLevel: 4 },
            { category: 'Adaptability', targetLevel: 4 },
        ],
    },
    {
        match: ['software engineer', 'software developer', 'swe'],
        roleTitle: 'Software Engineer',
        requiredSkills: ['Data Structures', 'TypeScript', 'Testing', 'Node.js', 'Git', 'Debugging'],
        requiredCapabilities: [
            { category: 'Problem-Solving', targetLevel: 4 },
            { category: 'Technical Confidence', targetLevel: 4 },
            { category: 'Adaptability', targetLevel: 3 },
        ],
    },
]

const DEFAULT_REQUIRED_SKILLS = ['Domain Expertise', 'Strategic Thinking', 'Cross-functional Collaboration', 'Continuous Learning']
const DEFAULT_REQUIRED_CAPABILITIES: RequiredCapability[] = [
    { category: 'Communication', targetLevel: 4 },
    { category: 'Adaptability', targetLevel: 4 },
    { category: 'Leadership', targetLevel: 3 },
]

export function getRoleSkillProfile(goalTitle: string): RoleSkillProfile {
    const normalized = goalTitle.trim().toLowerCase()
    const found = ROLE_PROFILES.find(profile => profile.match.some(m => normalized.includes(m)))
    if (found) return { roleTitle: found.roleTitle, requiredSkills: found.requiredSkills, requiredCapabilities: found.requiredCapabilities }
    return {
        roleTitle: goalTitle.trim() || 'Your Future Role',
        requiredSkills: DEFAULT_REQUIRED_SKILLS,
        requiredCapabilities: DEFAULT_REQUIRED_CAPABILITIES,
    }
}

/** Same shape as RoleSkillProfile minus roleTitle (the archetype's own
 *  display title lives in ProfileCapabilityReflection's FUTURE_ARCHETYPES —
 *  this only needs to contribute requirements, keyed by the same 6 ids). */
export interface ArchetypeProfile {
    title: string
    requiredSkills: string[]
    requiredCapabilities: RequiredCapability[]
}

const ARCHETYPE_PROFILES: Record<string, ArchetypeProfile> = {
    leader: {
        title: 'The Leader',
        requiredSkills: ['Team Leadership', 'Strategic Planning', 'Culture Building', 'Decision Making'],
        requiredCapabilities: [
            { category: 'Leadership', targetLevel: 5 },
            { category: 'Communication', targetLevel: 4 },
        ],
    },
    innovator: {
        title: 'The Innovator',
        requiredSkills: ['Prototyping', 'Experimentation', 'Emerging Tech', 'Creative Problem Solving'],
        requiredCapabilities: [
            { category: 'Problem-Solving', targetLevel: 5 },
            { category: 'Adaptability', targetLevel: 4 },
        ],
    },
    expert: {
        title: 'The Expert',
        requiredSkills: ['Deep Technical Mastery', 'Mentoring', 'Best Practices', 'Documentation'],
        requiredCapabilities: [
            { category: 'Technical Confidence', targetLevel: 5 },
            { category: 'Problem-Solving', targetLevel: 4 },
        ],
    },
    creator: {
        title: 'The Creator',
        requiredSkills: ['Design Thinking', 'Prototyping', 'Storytelling', 'Craftsmanship'],
        requiredCapabilities: [
            { category: 'Adaptability', targetLevel: 4 },
            { category: 'Technical Confidence', targetLevel: 4 },
        ],
    },
    connector: {
        title: 'The Connector',
        requiredSkills: ['Stakeholder Management', 'Networking', 'Facilitation', 'Cross-team Collaboration'],
        requiredCapabilities: [
            { category: 'Collaboration', targetLevel: 5 },
            { category: 'Communication', targetLevel: 4 },
        ],
    },
    changemaker: {
        title: 'The Changemaker',
        requiredSkills: ['Systems Thinking', 'Change Management', 'Advocacy', 'Root-cause Analysis'],
        requiredCapabilities: [
            { category: 'Adaptability', targetLevel: 5 },
            { category: 'Leadership', targetLevel: 4 },
        ],
    },
}

export function getArchetypeProfile(archetypeId: string | null): ArchetypeProfile | null {
    if (!archetypeId) return null
    return ARCHETYPE_PROFILES[archetypeId] ?? null
}

/** Merges a typed role's requirements with a chosen 5-10-year archetype's —
 *  skills deduped by name, capabilities deduped by category (keeping the
 *  higher target level when both name the same one) — so the roadmap
 *  reflects both "the role you typed" and "who you picked to become",
 *  rather than only whichever was filled in last. roleTitle prefers the
 *  typed role's (more specific) title, falling back to the archetype's only
 *  when no role has been typed yet. */
export function mergeRoleAndArchetype(
    role: RoleSkillProfile | null,
    archetype: ArchetypeProfile | null
): RoleSkillProfile | null {
    if (!role && !archetype) return null
    if (!archetype) return role
    if (!role) {
        return { roleTitle: archetype.title, requiredSkills: archetype.requiredSkills, requiredCapabilities: archetype.requiredCapabilities }
    }

    const skills = Array.from(new Set([...role.requiredSkills, ...archetype.requiredSkills]))

    const targetByCategory = new Map<CapabilityCategory, number>()
    for (const c of [...role.requiredCapabilities, ...archetype.requiredCapabilities]) {
        targetByCategory.set(c.category, Math.max(targetByCategory.get(c.category) ?? 0, c.targetLevel))
    }
    const capabilities = Array.from(targetByCategory.entries()).map(([category, targetLevel]) => ({ category, targetLevel }))

    return { roleTitle: role.roleTitle, requiredSkills: skills, requiredCapabilities: capabilities }
}

export interface SkillGap {
    matched: string[]
    gaps: string[]
}

/** Case-insensitive, substring-tolerant match ("Node" matches "Node.js") so a
 *  slightly different phrasing between a resume-parsed skill and the role's
 *  required skill still counts as "you already have this". */
export function computeSkillGap(currentSkills: string[], requiredSkills: string[]): SkillGap {
    const normalizedCurrent = currentSkills.map(s => s.toLowerCase())
    const matched: string[] = []
    const gaps: string[] = []
    for (const skill of requiredSkills) {
        const normalizedSkill = skill.toLowerCase()
        const hasIt = normalizedCurrent.some(cur => cur.includes(normalizedSkill) || normalizedSkill.includes(cur))
        if (hasIt) matched.push(skill)
        else gaps.push(skill)
    }
    return { matched, gaps }
}

export interface CapabilityGapEntry {
    category: CapabilityCategory
    currentLevel: number
    targetLevel: number
}

export interface CapabilityGap {
    matched: CapabilityGapEntry[]
    gaps: CapabilityGapEntry[]
}

/** Compares the questionnaire's self-ratings against a role's expected
 *  levels. A category the user never answered counts as a level-0 gap —
 *  there's no self-rating to call "met" yet. */
export function computeCapabilityGap(answers: CapabilityAnswers, required: RequiredCapability[]): CapabilityGap {
    const currentByCategory = new Map(deriveScaleChartData(answers).map(point => [point.category, point.value]))
    const matched: CapabilityGapEntry[] = []
    const gaps: CapabilityGapEntry[] = []
    for (const { category, targetLevel } of required) {
        const currentLevel = currentByCategory.get(category) ?? 0
        const entry = { category, currentLevel, targetLevel }
        if (currentLevel >= targetLevel) matched.push(entry)
        else gaps.push(entry)
    }
    return { matched, gaps }
}

/** Overall readiness for the role: matched technical skills + matched
 *  capabilities, out of the total of both — the single number the
 *  Future Goal map leads with. */
export function computeOverallMatch(skillGap: SkillGap, capabilityGap: CapabilityGap): number {
    const total = skillGap.matched.length + skillGap.gaps.length + capabilityGap.matched.length + capabilityGap.gaps.length
    if (total === 0) return 0
    const matched = skillGap.matched.length + capabilityGap.matched.length
    return Math.round((matched / total) * 100)
}
