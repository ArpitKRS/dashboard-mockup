import { Search, Bell, UserCircle } from "lucide-react";

/**
 * Static recreation of osmosis's PodHeader for the reference screenshot's
 * signed-in "pjm" pod — no NextAuth session, no pod theming lookup, no live
 * notification/broadcast fetches. Only the Dashboard route exists here, so
 * every link is inert; "Events" stays visually greyed out the same way the
 * real header renders it (not shipped yet).
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
          <div className="flex items-center gap-2 pl-2">
            <svg viewBox="0 0 40 40" className="w-9 h-9 shrink-0" aria-hidden>
              <circle cx="20" cy="20" r="17" fill="none" stroke="#2FBFA6" strokeWidth="4" strokeDasharray="80 40" strokeLinecap="round" transform="rotate(-45 20 20)" />
              <circle cx="32" cy="12" r="3.5" fill="#F2994A" />
            </svg>
            <h1 className="text-2xl font-extrabold leading-none tracking-tight">
              <span className="bg-gradient-to-r from-[#2FBFA6] to-[#F2994A] bg-clip-text text-transparent">Osmosis</span>
              <span className="block text-xs font-bold tracking-[0.2em] text-pod-text">LEARN</span>
            </h1>
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
