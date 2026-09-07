import { Quote } from 'lucide-react'
import UserAvatar from '@/components/ui/UserAvatar'
import { MOCK_TESTIMONIALS } from './mockTestimonialsData'

/**
 * What other people have said about this member — mocked, since this
 * mock-up has no backend to collect real testimonials from. Reuses the
 * quote-card language already established in CapabilityGraphGrid's text
 * rows (italic, curly-quoted, on a soft card) rather than a plain bullet.
 */
export default function TestimonialsSection() {
    return (
        <article className="rounded-2xl border border-pod-border bg-white shadow-sm p-6">
            <h2 className="text-lg font-semibold text-pod-text">Testimonials</h2>
            <p className="text-sm text-pod-muted mt-1">What others have said about working with you.</p>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {MOCK_TESTIMONIALS.map(testimonial => (
                    <div key={testimonial.name} className="rounded-xl border border-pod-border bg-pod-bg-soft p-4 flex flex-col">
                        <Quote aria-hidden className="h-4 w-4 text-pod-primary mb-2" />
                        <p className="text-xs leading-relaxed italic text-pod-text flex-1">
                            &ldquo;{testimonial.quote}&rdquo;
                        </p>
                        <div className="flex items-center gap-2.5 mt-4 pt-3 border-t border-pod-border">
                            <UserAvatar name={testimonial.name} size={32} />
                            <div className="min-w-0">
                                <p className="text-xs font-semibold text-pod-text truncate">{testimonial.name}</p>
                                <p className="text-[11px] text-pod-muted truncate">{testimonial.relationship}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </article>
    )
}
