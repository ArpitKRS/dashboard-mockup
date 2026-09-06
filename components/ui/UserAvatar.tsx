import { User } from "lucide-react";

/**
 * Simplified from osmosis/components/ui/UserAvatar.tsx: the real version
 * resolves a signed CloudFront URL via an access token; this mock-up has no
 * backend or session, so it always renders the fallback icon.
 */

interface UserAvatarProps {
    name: string
    size?: number
    className?: string
}

export default function UserAvatar({ name, size = 36, className = '' }: UserAvatarProps) {
    return (
        <span
            title={name}
            style={{ width: size, height: size }}
            className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-pod-primary-light ${className}`}
        >
            <User aria-hidden className="text-pod-primary" style={{ width: size * 0.5, height: size * 0.5 }} />
        </span>
    )
}
