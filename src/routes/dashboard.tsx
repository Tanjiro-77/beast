import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useDashboardData } from "@/hooks/use-dashboard";
import { useRanks, rankFor, levelFor } from "@/hooks/use-reference";
import {
  Plus, Zap, Flame, Bell, LogOut, BookOpen, Target, ClipboardCheck,
  TrendingUp, Trophy, Repeat, StickyNote, Brain, Home, ChevronRight,
  Menu, X,
} from "lucide-react";
import { QuickAddModal } from "@/components/dashboard/quick-add-modal";
import {
  DashboardHero, SmartInsights, QuestionLogsSection, ChapterProgressSection,
  MockTestsSection, AnalyticsSection, RevisionsSection, NotesSection, GamificationSection,
} from "@/components/dashboard/sections";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Mission Control · BeastPrep" },
      { name: "description", content: "Your JEE 2028 command center — log questions, mocks, revisions, and rank up." },
    ],
  }),
  component: DashboardPage,
});

const NAV = [
  { id: "hero", label: "Home", icon: Home },
  { id: "questions", label: "Questions", icon: BookOpen },
  { id: "chapters", label: "Chapters", icon: Target },
  { id: "mocks", label: "Mocks", icon: ClipboardCheck },
  { id: "analytics", label: "Analytics", icon: TrendingUp },
  { id: "gamification", label: "Quests", icon: Trophy },
  { id: "revisions", label: "Revise", icon: Repeat },
  { id: "notes", label: "Notes", icon: StickyNote },
  { id: "insights", label: "Insights", icon: Brain },
] as const;

type NavId = (typeof NAV)[number]["id"];

// ── Rank colour map ──────────────────────────────────────────────────────────
const RANK_COLORS: Record<string, string> = {
  Rookie: "var(--neon-cyan)",
  Solver: "var(--neon-lime)",
  Grinder: "var(--neon-amber)",
  Dominator: "var(--neon-violet)",
  Beast: "var(--neon-pink)",
};

// ── Thin stat badge ──────────────────────────────────────────────────────────
function Badge({
  icon: Icon,
  value,
  label,
  color,
}: {
  icon: React.ElementType;
  value: number | string;
  label?: string;
  color: string;
}) {
  return (
    <div
      className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 shrink-0 border border-white/5"
      style={{ background: "rgba(255,255,255,0.04)" }}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" style={{ color }} />
      <span className="text-sm font-bold leading-none" style={{ color }}>
        {value}
      </span>
      {label && (
        <span className="text-[10px] text-muted-foreground uppercase tracking-wide hidden sm:inline">
          {label}
        </span>
      )}
    </div>
  );
}

// ── Sidebar nav item ─────────────────────────────────────────────────────────
function SideNavItem({
  nav,
  active,
  expanded,
  onClick,
}: {
  nav: (typeof NAV)[number];
  active: boolean;
  expanded: boolean;
  onClick: () => void;
}) {
  const Icon = nav.icon;
  return (
    <button
      onClick={onClick}
      title={nav.label}
      className={`
        group relative flex items-center gap-3 rounded-xl transition-all duration-150
        ${expanded ? "w-full px-3 py-2.5" : "h-11 w-11 justify-center"}
        ${active
          ? "text-black"
          : "text-muted-foreground hover:text-foreground hover:bg-white/5"
        }
      `}
      style={active ? {
        background: "linear-gradient(135deg, var(--neon-cyan), var(--neon-violet))",
        boxShadow: "0 0 16px var(--neon-cyan)40",
      } : undefined}
    >
      <Icon className="h-4.5 w-4.5 shrink-0" style={{ width: 18, height: 18 }} />
      {expanded && (
        <span className="text-sm font-medium truncate">{nav.label}</span>
      )}
      {/* tooltip when collapsed */}
      {!expanded && (
        <span className="
          pointer-events-none absolute left-full ml-2 px-2 py-1 rounded-md
          text-xs font-medium whitespace-nowrap
          bg-popover border border-white/8 text-foreground
          opacity-0 group-hover:opacity-100 transition-opacity duration-100 z-50
        ">
          {nav.label}
        </span>
      )}
    </button>
  );
}

// ── Loading screen ───────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="min-h-screen grid place-items-center" style={{ background: "var(--background)" }}>
      <div className="flex flex-col items-center gap-4">
        <div
          className="h-12 w-12 rounded-xl grid place-items-center"
          style={{
            background: "linear-gradient(135deg, var(--neon-cyan), var(--neon-violet))",
            boxShadow: "0 0 24px var(--neon-cyan)50",
          }}
        >
          <Zap className="h-6 w-6 text-black" strokeWidth={2.5} />
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-1.5 w-1.5 rounded-full animate-bounce"
              style={{
                background: "var(--neon-cyan)",
                animationDelay: `${i * 0.15}s`,
                animationDuration: "0.8s",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { profile } = useDashboardData();

  const [quickOpen, setQuickOpen] = useState(false);
  const [active, setActive] = useState<NavId>("hero");
  const [sideExpanded, setSideExpanded] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  // Active section tracking — debounced via IntersectionObserver
  useEffect(() => {
    if (loading) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActive(visible[0].target.id as NavId);
        }
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0.1, 0.3, 0.5] }
    );
    NAV.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [loading]);

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMobileNavOpen(false);
  }, []);

  if (loading || !user) return <LoadingScreen />;

  const xp = profile.data?.xp ?? 0;
  const ranks = useRanks();
  const rank = rankFor(xp, ranks.data ?? []);
  const level = levelFor(xp);
  const rankName = rank?.name ?? "Rookie";
  const rankColor = RANK_COLORS[rankName] ?? "var(--neon-cyan)";
  const displayInitial = (profile.data?.display_name ?? user.email ?? "?")
    .slice(0, 1)
    .toUpperCase();

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "var(--background)" }}
    >
      {/* ── Desktop sidebar ───────────────────────────────────────────────── */}
      <aside
        className={`
          hidden md:flex flex-col py-5 gap-1 sticky top-0 h-screen z-30
          border-r border-white/5 transition-all duration-200
          ${sideExpanded ? "w-52 px-3" : "w-[60px] px-2.5"}
        `}
        style={{ background: "rgba(255,255,255,0.02)", backdropFilter: "blur(12px)" }}
      >
        {/* Logo + collapse toggle */}
        <div className={`flex items-center mb-4 ${sideExpanded ? "justify-between px-1" : "justify-center"}`}>
          <Link
            to="/"
            className="h-9 w-9 rounded-xl grid place-items-center shrink-0"
            style={{
              background: "linear-gradient(135deg, var(--neon-cyan), var(--neon-violet))",
              boxShadow: "0 0 16px var(--neon-cyan)40",
            }}
          >
            <Zap className="h-4.5 w-4.5 text-black" style={{ width: 18, height: 18 }} strokeWidth={2.5} />
          </Link>
          {sideExpanded && (
            <span className="text-sm font-bold tracking-tight ml-2 flex-1">BeastPrep</span>
          )}
          <button
            onClick={() => setSideExpanded((v) => !v)}
            className="h-7 w-7 rounded-lg grid place-items-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors shrink-0"
          >
            <ChevronRight
              className="h-3.5 w-3.5 transition-transform duration-200"
              style={{ transform: sideExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </button>
        </div>

        {/* Nav items */}
        <div className="flex flex-col gap-0.5 flex-1">
          {NAV.map((n) => (
            <SideNavItem
              key={n.id}
              nav={n}
              active={active === n.id}
              expanded={sideExpanded}
              onClick={() => scrollTo(n.id)}
            />
          ))}
        </div>

        {/* Sign out */}
        <button
          onClick={signOut}
          title="Sign out"
          className={`
            flex items-center gap-3 rounded-xl text-muted-foreground
            hover:text-foreground hover:bg-white/5 transition-colors duration-150
            ${sideExpanded ? "w-full px-3 py-2.5" : "h-11 w-11 justify-center self-center"}
          `}
        >
          <LogOut style={{ width: 16, height: 16 }} />
          {sideExpanded && <span className="text-sm font-medium">Sign out</span>}
        </button>
      </aside>

      {/* ── Main column ───────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col">

        {/* Top bar */}
        <header
          className="sticky top-0 z-20 flex items-center gap-2 px-4 md:px-6 py-2.5 border-b border-white/5"
          style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(16px)" }}
        >
          {/* Mobile: hamburger */}
          <button
            className="md:hidden h-9 w-9 rounded-lg grid place-items-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            onClick={() => setMobileNavOpen(true)}
          >
            <Menu className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} />
          </button>

          {/* Mobile: logo */}
          <Link
            to="/"
            className="md:hidden h-8 w-8 rounded-lg grid place-items-center shrink-0"
            style={{ background: "linear-gradient(135deg, var(--neon-cyan), var(--neon-violet))" }}
          >
            <Zap className="h-4 w-4 text-black" strokeWidth={2.5} />
          </Link>

          {/* Badges */}
          <div className="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-none">
            <Badge
              icon={Flame}
              value={profile.data?.current_streak ?? 0}
              label="streak"
              color="var(--neon-amber)"
            />
            <Badge
              icon={Zap}
              value={xp.toLocaleString()}
              label="XP"
              color="var(--neon-cyan)"
            />
            <Badge
              icon={Trophy}
              value={`L${level} · ${rankName}`}
              color={rankColor}
            />
          </div>

          {/* Actions */}
          <button className="h-8 w-8 rounded-lg grid place-items-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
            <Bell className="h-4 w-4" />
          </button>

          <button
            onClick={() => setQuickOpen(true)}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-black transition-all hover:opacity-90 active:scale-95"
            style={{
              background: "linear-gradient(135deg, var(--neon-cyan), var(--neon-violet))",
              boxShadow: "0 0 14px var(--neon-cyan)35",
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            Quick Add
          </button>

          {/* Avatar */}
          <div
            className="h-8 w-8 rounded-full grid place-items-center text-xs font-bold text-black shrink-0"
            style={{
              background: "linear-gradient(135deg, var(--neon-amber), var(--neon-pink))",
            }}
          >
            {displayInitial}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 md:px-6 py-6 pb-32 md:pb-8 max-w-6xl w-full mx-auto space-y-6">
          <section id="hero">        <DashboardHero /></section>
          <section id="insights">   <SmartInsights /></section>
          <section id="gamification"><GamificationSection /></section>
          <section id="questions">  <QuestionLogsSection /></section>
          <section id="chapters">   <ChapterProgressSection /></section>
          <section id="mocks">      <MockTestsSection /></section>
          <section id="analytics">  <AnalyticsSection /></section>
          <section id="revisions">  <RevisionsSection /></section>
          <section id="notes">      <NotesSection /></section>
        </main>
      </div>

      {/* ── Mobile slide-over nav ─────────────────────────────────────────── */}
      {mobileNavOpen && (
        <>
          {/* backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            style={{ backdropFilter: "blur(4px)" }}
            onClick={() => setMobileNavOpen(false)}
          />
          {/* drawer */}
          <div
            className="fixed top-0 left-0 bottom-0 z-50 w-64 flex flex-col py-6 px-4 gap-1 md:hidden"
            style={{
              background: "rgba(10,10,14,0.97)",
              backdropFilter: "blur(20px)",
              borderRight: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex items-center justify-between mb-5 px-1">
              <div className="flex items-center gap-2">
                <div
                  className="h-8 w-8 rounded-lg grid place-items-center"
                  style={{ background: "linear-gradient(135deg, var(--neon-cyan), var(--neon-violet))" }}
                >
                  <Zap className="h-4 w-4 text-black" strokeWidth={2.5} />
                </div>
                <span className="font-bold text-base tracking-tight">BeastPrep</span>
              </div>
              <button
                onClick={() => setMobileNavOpen(false)}
                className="h-8 w-8 rounded-lg grid place-items-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Nav items */}
            {NAV.map((n) => {
              const Icon = n.icon;
              const isActive = active === n.id;
              return (
                <button
                  key={n.id}
                  onClick={() => scrollTo(n.id)}
                  className={`
                    flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-100 text-left
                    ${isActive
                      ? "text-black"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    }
                  `}
                  style={isActive ? {
                    background: "linear-gradient(135deg, var(--neon-cyan), var(--neon-violet))",
                  } : undefined}
                >
                  <Icon style={{ width: 16, height: 16 }} className="shrink-0" />
                  <span className="text-sm font-medium">{n.label}</span>
                </button>
              );
            })}

            <div className="mt-auto">
              <button
                onClick={signOut}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 w-full text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
              >
                <LogOut style={{ width: 16, height: 16 }} />
                <span className="text-sm font-medium">Sign out</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Mobile bottom bar (5 primary items) ──────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around px-2 py-2 border-t border-white/5"
        style={{ background: "rgba(0,0,0,0.80)", backdropFilter: "blur(16px)" }}
      >
        {NAV.slice(0, 4).map((n) => {
          const Icon = n.icon;
          const isActive = active === n.id;
          return (
            <button
              key={n.id}
              onClick={() => scrollTo(n.id)}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-colors ${isActive ? "text-white" : "text-muted-foreground"
                }`}
            >
              <Icon
                style={{
                  width: 18,
                  height: 18,
                  color: isActive ? "var(--neon-cyan)" : undefined,
                }}
              />
              <span
                className="text-[9px] font-medium leading-none"
                style={{ color: isActive ? "var(--neon-cyan)" : undefined }}
              >
                {n.label}
              </span>
            </button>
          );
        })}
        {/* More → opens drawer */}
        <button
          onClick={() => setMobileNavOpen(true)}
          className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-muted-foreground"
        >
          <Menu style={{ width: 18, height: 18 }} />
          <span className="text-[9px] font-medium leading-none">More</span>
        </button>
      </nav>

      {/* ── Floating Quick Add (mobile only) ─────────────────────────────── */}
      <button
        onClick={() => setQuickOpen(true)}
        className="md:hidden fixed bottom-20 right-5 z-40 h-13 w-13 rounded-2xl grid place-items-center text-black active:scale-95 transition-transform"
        style={{
          width: 52,
          height: 52,
          background: "linear-gradient(135deg, var(--neon-cyan), var(--neon-violet))",
          boxShadow: "0 0 20px var(--neon-cyan)50",
        }}
      >
        <Plus style={{ width: 22, height: 22 }} strokeWidth={2.5} />
      </button>

      <QuickAddModal open={quickOpen} onClose={() => setQuickOpen(false)} />
    </div>
  );
}