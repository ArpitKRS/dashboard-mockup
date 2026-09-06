import Image from "next/image";
import { Search, Bell, UserCircle } from "lucide-react";

/**
 * Static recreation of osmosis's PodHeader for the reference screenshot's
 * signed-in "pjm" pod — no NextAuth session, no pod theming lookup, no live
 * notification/broadcast fetches. Only the Dashboard route exists here, so
 * every link is inert; "Events" stays visually greyed out the same way the
 * real header renders it (not shipped yet).
 *
 * The logo is the real pjm pod logo (osmosis/public/landing/images/pods/pjm_logo.png)
 * rather than a hand-drawn recreation — this pod's own PodHeader would resolve
 * to the same file via `pod.pod_logo`.
 */
export default function AppHeader() {
  const navItems = [
    { label: "Explore", disabled: false },
    { label: "Create", disabled: false },
    { label: "Events", disabled: true },
    { label: "Workspace", disabled: false },
  ];

  return (
    <header className="bg-white border-b border-pod-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-end h-20 pb-4">
          <div className="w-40 h-12 relative shrink-0">
            <Image src="/osmosis_logo.png" alt="Osmosis Learn" fill className="object-contain" priority sizes="160px" />
          </div>

          <div className="ml-auto flex items-end gap-6 md:gap-10">
            <nav className="hidden md:flex items-center gap-8">
              <button type="button" aria-label="Search" title="Search" className="text-pod-muted hover:text-pod-text transition mr-2 cursor-pointer">
                <Search className="w-6 h-6" />
              </button>

              {navItems.map((item) =>
                item.disabled ? (
                  <span
                    key={item.label}
                    aria-disabled="true"
                    title="Coming soon"
                    className="text-pod-muted font-medium cursor-not-allowed select-none"
                  >
                    {item.label}
                  </span>
                ) : (
                  <span key={item.label} className="text-pod-text font-medium cursor-default">
                    {item.label}
                  </span>
                )
              )}
            </nav>

            <div className="flex items-center gap-4 md:gap-6">
              <button type="button" aria-label="Notifications" title="Notifications" className="relative text-pod-muted hover:text-pod-text transition cursor-pointer">
                <Bell className="w-6 h-6" />
                <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  14
                </span>
              </button>

              <span className="flex items-center gap-2 text-pod-muted cursor-default">
                <UserCircle className="w-8 h-8" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
