"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type DashboardSidebarProps = {
  schoolName: string;
  schoolCode: string;
  userName: string | null | undefined;
  role: string;
};

type NavigationItem = {
  href: string;
  label: string;
  icon: string;
};

type NavigationGroup = {
  label: string;
  items: NavigationItem[];
};

const navigationGroups: NavigationGroup[] = [
  {
    label: "Overview",
    items: [
      {
        href: "/dashboard",
        label: "Dashboard",
        icon: "⌂",
      },
    ],
  },
  {
    label: "People",
    items: [
      {
        href: "/dashboard/students",
        label: "Students",
        icon: "ST",
      },
      {
        href: "/dashboard/teachers",
        label: "Teachers",
        icon: "TC",
      },
      {
        href: "/dashboard/parents",
        label: "Parents",
        icon: "PR",
      },
      {
        href: "/dashboard/admissions",
        label: "Admissions",
        icon: "AD",
      },
    ],
  },
  {
    label: "Academic",
    items: [
      {
        href: "/dashboard/classes",
        label: "Classes",
        icon: "CL",
      },
      {
        href: "/dashboard/subjects",
        label: "Subjects",
        icon: "SB",
      },
      {
        href: "/dashboard/academic",
        label: "Academic Structure",
        icon: "AS",
      },
      {
        href: "/dashboard/timetable",
        label: "Timetable",
        icon: "TM",
      },
      {
        href: "/dashboard/teacher-assignments",
        label: "Teacher Assignments",
        icon: "TA",
      },
    ],
  },
  {
    label: "Assessment",
    items: [
      {
        href: "/dashboard/assignments",
        label: "Assignments",
        icon: "AS",
      },
      {
        href: "/dashboard/tests",
        label: "Tests",
        icon: "TS",
      },
      {
        href: "/dashboard/examinations",
        label: "Examinations",
        icon: "EX",
      },
      {
        href: "/dashboard/results",
        label: "Results",
        icon: "RE",
      },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        href: "/dashboard/attendance",
        label: "Attendance",
        icon: "AT",
      },
      {
        href: "/dashboard/fees",
        label: "Fees & Payments",
        icon: "₦",
      },
      {
        href: "/dashboard/scratch-cards",
        label: "Scratch Cards",
        icon: "SC",
      },
      {
        href: "/dashboard/announcements",
        label: "Announcements",
        icon: "AN",
      },
    ],
  },
  {
    label: "Administration",
    items: [
      {
        href: "/dashboard/settings",
        label: "School Settings",
        icon: "SE",
      },
    ],
  },
];

export default function DashboardSidebar({
  schoolName,
  schoolCode,
  userName,
  role,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-lg lg:hidden"
        aria-label="Open navigation"
      >
        <span className="text-lg">☰</span>
      </button>

      {mobileOpen && (
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
          aria-label="Close navigation"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-slate-800 bg-slate-950 text-white shadow-2xl transition-transform duration-200 lg:z-30 lg:w-72 lg:translate-x-0 lg:shadow-none ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-5">
          <Link
            href="/dashboard"
            onClick={() => setMobileOpen(false)}
            className="min-w-0"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-400 font-black text-slate-950 shadow-lg shadow-cyan-400/10">
                {schoolCode.slice(0, 2).toUpperCase()}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-black tracking-tight text-white">
                  {schoolName}
                </p>
                <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-300">
                  {schoolCode}
                </p>
              </div>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="ml-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
            aria-label="Close navigation"
          >
            ×
          </button>
        </div>

        <div className="border-b border-slate-800 px-5 py-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3">
            <p className="truncate text-sm font-bold text-white">
              {userName || "Portal User"}
            </p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
              {role}
            </p>
          </div>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-5">
            {navigationGroups.map((group) => (
              <div key={group.label}>
                <p className="mb-2 px-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  {group.label}
                </p>

                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive =
                      item.href === "/dashboard"
                        ? pathname === item.href
                        : pathname === item.href ||
                          pathname.startsWith(`${item.href}/`);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                          isActive
                            ? "bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-400/10"
                            : "text-slate-300 hover:bg-slate-900 hover:text-white"
                        }`}
                      >
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-black ${
                            isActive
                              ? "bg-slate-950/10 text-slate-950"
                              : "bg-slate-900 text-slate-400 group-hover:bg-slate-800 group-hover:text-cyan-300"
                          }`}
                        >
                          {item.icon}
                        </span>

                        <span className="truncate">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>

        <div className="border-t border-slate-800 p-4">
          <div className="rounded-2xl bg-gradient-to-br from-cyan-400/10 to-blue-500/10 p-4">
            <p className="text-xs font-bold text-cyan-300">
              BS International Academy
            </p>
            <p className="mt-1 text-[11px] leading-5 text-slate-500">
              School management portal
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
