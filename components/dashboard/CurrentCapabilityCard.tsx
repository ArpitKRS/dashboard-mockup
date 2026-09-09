/**
 * The resume-derived summary paragraph, on its own — split out of
 * ProfileCapabilityReflection's ResumeSnapshot so it reads as its own
 * standalone statement rather than the first item in a longer list, sitting
 * between the Banner and Personal Career Reflection (the
 * ProfileCapabilityReflection component's heading).
 */
export default function CurrentCapabilityCard({ summary }: { summary: string | null }) {
    if (!summary) return null

    return (
        <article className="rounded-2xl border border-pod-border bg-white shadow-sm p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-pod-muted mb-2">Current Capability</p>
            <p className="text-sm text-pod-text leading-relaxed">{summary}</p>
        </article>
    )
}
