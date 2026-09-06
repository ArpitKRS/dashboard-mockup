import { Home, ChevronRight } from "lucide-react";

/**
 * Static recreation of osmosis's Breadcrumb for this one screen. The real
 * component replays a session's actual page-visit trail (lib/breadcrumbTrail);
 * this mock-up only ever shows one screen, so the trail is hardcoded to match
 * the reference screenshot instead.
 */
const TRAIL = [
  "Owner Statistics",
  "Learning Path Tool",
  "Explore Assets Library",
  "My Workspace",
  "Dashboard",
];

export default function AppBreadcrumb() {
  return (
    <nav aria-label="Breadcrumb" className="bg-white/80 backdrop-blur-sm border-b border-pod-border">
      <div className="container mx-auto px-4 pl-8 py-2.5">
        <ol className="flex items-center text-sm flex-wrap gap-y-1">
          <li className="flex items-center text-pod-muted">
            <Home className="w-4 h-4" />
          </li>

          {TRAIL.map((label, index) => {
            const isCurrentPage = index === TRAIL.length - 1;
            return (
              <li key={label} className="flex items-center">
                <ChevronRight className="w-3.5 h-3.5 mx-2 text-pod-border shrink-0" />
                <span
                  className={isCurrentPage ? "text-pod-text font-medium whitespace-nowrap" : "text-pod-muted whitespace-nowrap"}
                  aria-current={isCurrentPage ? "page" : undefined}
                >
                  {label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
