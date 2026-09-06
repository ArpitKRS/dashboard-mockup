'use client'

import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip,
} from 'recharts'
import { deriveScaleChartData, type CapabilityAnswers } from '@/lib/capabilityForm'

interface CapabilityInsightsChartsProps {
    answers: CapabilityAnswers
}

/** Radar of the six self-rated capability categories, rendered once the
 *  questionnaire is complete. Same card chrome/palette as the rest of the
 *  Dashboard's cards.
 *
 *  Copied verbatim from osmosis/app/pod/[subdomain]/explore/dashboard/CapabilityInsightsCharts.tsx. */
export default function CapabilityInsightsCharts({ answers }: CapabilityInsightsChartsProps) {
    const data = deriveScaleChartData(answers)

    if (data.length === 0) return null

    return (
        <article className="rounded-2xl border border-pod-border bg-white shadow-sm p-6">
            <h2 className="text-lg font-semibold text-pod-text mb-1">Your Capability Snapshot</h2>
            <p className="text-sm text-pod-muted mb-4">
                A self-reflection, not a score — based on your Capability Building Questionnaire answers.
            </p>
            <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={data} outerRadius="75%">
                        <PolarGrid stroke="#e5e7eb" />
                        <PolarAngleAxis dataKey="category" tick={{ fill: '#6E6E6E', fontSize: 12 }} />
                        <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fill: '#6E6E6E', fontSize: 10 }} tickCount={6} />
                        <Radar
                            name="Self-rating"
                            dataKey="value"
                            stroke="#6366f1"
                            fill="#6366f1"
                            fillOpacity={0.35}
                        />
                        <Tooltip />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </article>
    )
}
