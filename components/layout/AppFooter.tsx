import Image from "next/image";

/**
 * Static recreation of osmosis's PodFooter. Social links point nowhere real
 * (`#`) since this mock-up has no pod record to read them from; every icon
 * that PodFooter can show is rendered unconditionally instead of being
 * filtered by "does this pod have that link set".
 */
const SOCIAL_ICON_PATHS: Record<string, string> = {
  Facebook: "M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.87.24-1.46 1.5-1.46H16.7V3.96A21.4 21.4 0 0 0 14.36 3.84c-2.32 0-3.91 1.42-3.91 4.02V10H7.75v3h2.7v8h3.05z",
  LinkedIn: "M6.94 8.5H3.56V21h3.38V8.5zM5.25 3a1.96 1.96 0 1 0 0 3.92 1.96 1.96 0 0 0 0-3.92zM21 21h-3.37v-6.08c0-1.45-.03-3.31-2.02-3.31-2.02 0-2.33 1.58-2.33 3.21V21H9.9V8.5h3.24v1.71h.05a3.55 3.55 0 0 1 3.2-1.76c3.42 0 4.05 2.25 4.05 5.18V21z",
  Instagram: "M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.64.07 4.85 0 3.2-.01 3.58-.07 4.85-.15 3.22-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07-3.2 0-3.58-.01-4.85-.07-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.64-.07-4.85 0-3.2.01-3.58.07-4.85.15-3.23 1.66-4.77 4.92-4.92C8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12c0 3.26.01 3.67.07 4.95.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24c3.26 0 3.67-.01 4.95-.07 4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95 0-3.26-.01-3.67-.07-4.95-.2-4.35-2.62-6.78-6.98-6.98C15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.41-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z",
  "X (Twitter)": "M18.24 2.25h3.31l-7.23 8.26 8.5 11.24H16.17l-5.21-6.82-5.97 6.82H1.68l7.73-8.84L1.25 2.25h6.83l4.71 6.23zm-1.16 17.52h1.83L7.08 4.13H5.12z",
  YouTube: "M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81zM9.55 15.57V8.43L15.82 12l-6.27 3.57z",
};

export default function AppFooter() {
  return (
    <footer className="mt-auto">
      <div className="bg-pod-primary py-6">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="text-pod-primary-foreground text-sm font-medium cursor-default">About Us</span>
            <span className="text-pod-primary-foreground text-sm font-medium cursor-default">Privacy Policy</span>
          </div>

          <div className="flex flex-col items-center">
            <Image src="/osmosis_white_logo.png" alt="Osmosis Learn Logo" width={138} height={48} className="h-12 w-auto" priority />
          </div>

          <div>
            <span className="text-pod-primary-foreground text-sm font-medium cursor-default">We Love to Hear From You</span>
          </div>
        </div>
      </div>

      <div className="bg-pod-primary-hover py-3">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {Object.entries(SOCIAL_ICON_PATHS).map(([name, path]) => (
              <span
                key={name}
                aria-label={name}
                title={name}
                className="flex h-6 w-6 items-center justify-center rounded-md border border-pod-primary-foreground/50 bg-pod-primary-foreground/15 text-pod-primary-foreground"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d={path} />
                </svg>
              </span>
            ))}
          </div>

          <p className="text-pod-primary-foreground text-sm">&copy; {new Date().getFullYear()} Osmosis Learn</p>
        </div>
      </div>
    </footer>
  );
}
