'use client'

import UserAvatar from '@/components/ui/UserAvatar'

interface ProfileBannerProps {
    firstName: string
    lastName: string
    email: string
}

/**
 * LinkedIn-style identity banner: a cover strip, an overlapping avatar, and
 * name + email underneath. Deliberately shows only what the platform actually
 * has at login — no job title, company, or location guesswork before a resume
 * has been parsed.
 *
 * Adapted from osmosis/app/pod/[subdomain]/explore/dashboard/ProfileBanner.tsx:
 * `userImage`/`accessToken` are dropped since this mock-up has no auth/session
 * and UserAvatar always renders its fallback icon here.
 */
export default function ProfileBanner({ firstName, lastName, email }: ProfileBannerProps) {
    const fullName = [firstName, lastName].filter(Boolean).join(' ').trim() || 'Welcome'

    return (
        <article className="rounded-2xl border border-pod-border bg-white shadow-sm overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-pod-primary-light via-pod-primary/20 to-pod-primary-light" />
            <div className="px-6 pb-6">
                <div className="-mt-10 flex items-end gap-4">
                    <UserAvatar
                        name={fullName}
                        size={80}
                        className="border-4 border-white shadow-sm"
                    />
                    <div className="pb-1">
                        <h1 className="text-xl font-bold text-pod-text">{fullName}</h1>
                        {email && <p className="text-sm text-pod-muted">{email}</p>}
                    </div>
                </div>
            </div>
        </article>
    )
}
