'use client'

/** Shared "row of min..max pill buttons + low/mid/high legend" control — the
 *  1-10 scale mechanic introduced for Curiosity Drive, reused as-is by the
 *  Capability Proficiency Matrix's 41 indicators (CapabilityBuildingForm) and
 *  by the Capability Snapshot's inline editors (CapabilityGraphGrid) rather
 *  than reinventing the interaction for each new consumer. */
export default function ScorePillRow({
    min,
    max,
    legend,
    value,
    onSelect,
}: {
    min: number
    max: number
    legend: { value: number; label: string }[]
    value: number | undefined
    onSelect: (value: number) => void
}) {
    const values = Array.from({ length: max - min + 1 }, (_, i) => min + i)
    return (
        <div className="w-fit max-w-full">
            <div className="flex flex-wrap gap-1.5">
                {values.map(v => {
                    const selected = value === v
                    return (
                        <button
                            key={v}
                            type="button"
                            onClick={() => onSelect(v)}
                            className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all ${
                                selected
                                    ? 'bg-pod-primary text-pod-primary-foreground scale-110 shadow-sm animate-capability-star-pop'
                                    : 'border border-pod-border bg-white text-pod-text hover:border-pod-primary-medium hover:scale-105'
                            }`}
                        >
                            {v}
                        </button>
                    )
                })}
            </div>
            <div className="mt-1.5 flex justify-between px-1 text-[10px] font-medium text-pod-muted">
                <span>🧊 {legend[0]?.label}</span>
                <span>{legend[1]?.label}</span>
                <span>🔥 {legend[legend.length - 1]?.label}</span>
            </div>
        </div>
    )
}
