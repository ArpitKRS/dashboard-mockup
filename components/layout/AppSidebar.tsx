"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  CalendarDays,
  Users,
  ClipboardCheck,
  ListChecks,
} from "lucide-react";

/**
 * Static recreation of osmosis's ExploreSidebar. Same hover-expand rail and
 * icon set; only Dashboard is a real (self-)link since this mock-up has no
 * other pages — the rest render as inert rows, same treatment the real
 * sidebar gives an item whose page isn't built yet.
 */
const MENU_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: BookOpen, label: "Courses", active: false },
  { icon: GraduationCap, label: "Learning Tools", active: false },
  { icon: CalendarDays, label: "Events", active: false },
  { icon: Users, label: "Community", active: false },
  { icon: ClipboardCheck, label: "Assessments", active: false },
  { icon: ListChecks, label: "Surveys", active: false },
];

export default function AppSidebar() {
  const [isHovered, setIsHovered] = useState(false);
  const isCollapsed = !isHovered;

  return (
    <aside
      className={`fixed left-4 top-1/2 -translate-y-1/2 z-40 bg-white/95 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-3xl transition-all duration-400 ease-[cubic-bezier(0.25,0.1,0.25,1.0)] flex flex-col overflow-hidden border border-gray-100 max-h-[calc(100vh-4rem)] ${
        isCollapsed ? "w-20" : "w-[260px]"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <nav className="overflow-y-auto py-6 px-3 space-y-2 custom-scrollbar">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="group/nav-item relative flex flex-col">
              <div
                role={item.active ? "link" : undefined}
                aria-current={item.active ? "page" : undefined}
                className={`relative flex items-center p-2 rounded-2xl transition-all duration-300 ${
                  item.active
                    ? "bg-gray-100 text-gray-900 cursor-default"
                    : "text-gray-600 cursor-default"
                }`}
              >
                <div
                  className={`relative flex items-center justify-center w-[40px] h-[40px] shrink-0 bg-white rounded-[14px] shadow-[0_2px_10px_rgb(0,0,0,0.06)] border border-gray-100 transition-transform duration-300 ${
                    item.active ? "scale-105" : ""
                  }`}
                >
                  <Icon className="w-5 h-5 text-pod-primary transition-transform duration-300" />
                </div>

                <div
                  className={`flex items-center justify-between overflow-hidden transition-all duration-400 ${
                    isCollapsed ? "opacity-0 w-0 ml-0 translate-x-2" : "opacity-100 flex-1 ml-3 translate-x-0"
                  }`}
                >
                  <span className="font-semibold text-[15px] whitespace-nowrap">{item.label}</span>
                </div>
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
