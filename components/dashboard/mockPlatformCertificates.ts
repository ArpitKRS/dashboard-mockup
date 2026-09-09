/**
 * Certificates earned by completing a course on this platform — distinct
 * from mockResumeData's ResumeCertification, which is parsed from the
 * resume and lists credentials earned elsewhere. Same convention as every
 * other mock*Data file: fixed content, no backend.
 */
export interface PlatformCertificate {
    id: string
    courseName: string
    completedDate: string
    credentialId: string
}

export const MOCK_PLATFORM_CERTIFICATES: PlatformCertificate[] = [
    { id: 'cert-1', courseName: 'Advanced TypeScript Patterns', completedDate: '2026-03-12', credentialId: 'OSM-TS-88231' },
    { id: 'cert-2', courseName: 'Cloud Architecture Fundamentals', completedDate: '2026-01-18', credentialId: 'OSM-CA-51042' },
    { id: 'cert-3', courseName: 'Leading Technical Teams', completedDate: '2025-11-02', credentialId: 'OSM-LT-30987' },
]
