"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Toaster } from "@/components/ui/sonner";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: "◉" },
  { href: "/dashboard/exchange", label: "Exchange", icon: "⇄" },
  { href: "/dashboard/stream", label: "Nanopay", icon: "⚡" },
  { href: "/dashboard/vault", label: "Vault", icon: "◈" },
  { href: "/dashboard/history", label: "History", icon: "◷" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <main className="min-h-screen flex flex-col grid-bg">
      {/* Top nav */}
      <nav className="w-full sticky top-0 z-50 flex justify-center border-b border-border/30 h-14 backdrop-blur-xl bg-background/60">
        <div className="w-full max-w-7xl flex justify-between items-center px-6">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[var(--gainifi-blue)] to-[var(--gainifi-violet)] flex items-center justify-center text-white font-bold text-xs">
                G
              </div>
              <span className="font-bold text-sm tracking-tight">Gainifi</span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" &&
                    pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                      }`}
                  >
                    <span className="text-[10px]">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--gainifi-emerald)]/10 text-[var(--gainifi-emerald)] text-[10px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--gainifi-emerald)] animate-pulse-glow" />
              Arc Testnet
            </div>
            <ThemeSwitcher />
          </div>
        </div>
      </nav>

      {/* Mobile nav */}
      <div className="md:hidden flex items-center gap-1 px-4 py-2 overflow-x-auto border-b border-border/20 bg-background/80 backdrop-blur-lg">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground"
                }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {children}
      </div>

      <Toaster
        toastOptions={{ style: { width: "450px", maxWidth: "90vw" } }}
      />
    </main>
  );
}
