'use client'

import { useState } from 'react'
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
} from 'recharts'
import { deriveScaleChartData, type CapabilityAnswers } from '@/lib/capabilityForm'

interface CapabilityInsightsChartsProps {
    answers: CapabilityAnswers
}

type ChartView = 'radar' | 'bar' | 'list'

const VIEWS: { id: ChartView; label: string }[] = [
    { id: 'radar', label: 'Radar' },
    { id: 'bar', label: 'Bar' },
    { id: 'list', label: 'List' },
]

/**
 * Self-rated capability categories, rendered once the questionnaire is
 * complete, in whichever of the three views the viewer picks — a radar
 * (the original), a bar chart, or a plain progress-bar list. Same underlying
 * data (deriveScaleChartData) for all three; only the presentation changes.
 *
 * Adapted from osmosis/app/pod/[subdomain]/explore/dashboard/CapabilityInsightsCharts.tsx
 * to add the view picker.
 */
export default function CapabilityInsightsCharts({ answers }: CapabilityInsightsChartsProps) {
    const [view, setView] = useState<ChartView>('radar')
    const data = deriveScaleChartData(answers)

    if (data.length === 0) return null

    return (
        <article className="rounded-2xl border border-pod-border bg-white shadow-sm p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <h2 className="text-lg font-semibold text-pod-text">Your Capability Snapshot</h2>
                <div className="inline-flex rounded-lg border border-pod-border bg-pod-bg-soft p-0.5">
                    {VIEWS.map(v => (
                        <button
                            key={v.id}
                            type="button"
                            onClick={() => setView(v.id)}
                            aria-pressed={view === v.id}
                            className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                                view === v.id ? 'bg-white text-pod-text shadow-sm' : 'text-pod-muted hover:text-pod-text'
                            }`}
                        >
                            {v.label}
                        </button>
                    ))}
                </div>
            </div>
            <p className="text-sm text-pod-muted mb-4">
                A self-reflection, not a score — based on your Capability Building Questionnaire answers.
            </p>

            {view === 'radar' && (
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={data} outerRadius="75%">
                            <PolarGrid stroke="#e5e7eb" />
                            <PolarAngleAxis dataKey="category" tick={{ fill: '#6E6E6E', fontSize: 12 }} />
                            <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fill: '#6E6E6E', fontSize: 10 }} tickCount={6} />
                            <Radar name="Self-rating" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.35} />
                            <Tooltip />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {view === 'bar' && (
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ left: -20 }}>
                            <CartesianGrid stroke="#e5e7eb" vertical={false} />
                            <XAxis dataKey="category" tick={{ fill: '#6E6E6E', fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
                            <YAxis domain={[0, 5]} tick={{ fill: '#6E6E6E', fontSize: 11 }} allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="value" name="Self-rating" fill="#6366f1" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {view === 'list' && (
                <div className="space-y-4">
                    {data.map(point => (
                        <div key={point.category}>
                            <div className="flex items-center justify-between text-xs mb-1.5">
                                <span className="font-semibold text-pod-text">{point.category}</span>
                                <span className="text-pod-muted tabular-nums">{point.value}/5</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-pod-primary/10 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-pod-primary transition-all duration-500"
                                    style={{ width: `${(point.value / 5) * 100}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </article>
    )
}
