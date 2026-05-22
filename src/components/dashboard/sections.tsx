import { useMemo, useState } from "react";
import { useDashboardData, useInvalidateDashboard } from "@/hooks/use-dashboard";
import {
  useSubjects, useChapters, useRanks, useMissions, useAchievementDefs,
  rankFor, nextRankFor, levelFor, levelProgressFor,
} from "@/hooks/use-reference";
import { SUBJECT_COLOR_FALLBACK } from "@/lib/jee-data";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame, Trophy, Zap, Target, TrendingUp, Brain, Sparkles, CheckCircle2,
  BookOpen, ClipboardCheck, Repeat, StickyNote, ChevronDown, AlertTriangle,
  Pin, Trash2, Calendar, Clock, ArrowUpRight, BarChart2, Award,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip,
  BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from "recharts";
import { toast } from "sonner";

function colorForSubject(name: string, fromDb?: string) {
  return fromDb ?? SUBJECT_COLOR_FALLBACK[name] ?? "neon-cyan";
}

/* ============ HERO ============ */
export function DashboardHero() {
  const { profile } = useDashboardData();
  const ranks = useRanks();
  const missions = useMissions();
  const p = profile.data;
  const xp = p?.xp ?? 0;
  const rs = ranks.data ?? [];
  const rank = rankFor(xp, rs);
  const next = nextRankFor(xp, rs);
  const level = levelFor(xp);
  const lp = levelProgressFor(xp);

  const todayMissions = (missions.data ?? []).filter((m) => !m.completed).slice(0, 1);
  const headlineMission = todayMissions[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass rounded-3xl p-6 md:p-8 relative overflow-hidden glow-subtle"
    >
      <div className="absolute inset-0 bg-aurora opacity-40 pointer-events-none" />

      <div className="relative grid md:grid-cols-3 gap-6 items-center">
        {/* Main content */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-neon-cyan animate-pulse-glow" />
            <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
              Mission Control · {new Date().toLocaleDateString("en", { weekday: "long", month: "short", day: "numeric" })}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold tracking-tighter leading-tight">
            Welcome back, <span className="text-gradient animate-gradient">{p?.display_name ?? "Beast"}</span>
          </h1>

          <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
            {headlineMission ? (
              <>
                Today's mission: <strong className="text-foreground font-bold">{headlineMission.title}</strong> ·{" "}
                <strong className="text-neon-cyan font-bold">{headlineMission.progress}/{headlineMission.target_value}</strong>
              </>
            ) : (
              <>All missions cleared. You're on fire! 🔥</>
            )}
          </p>

          {/* XP Progress */}
          <div className="max-w-md pt-2">
            <div className="flex justify-between items-baseline mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium">Level {level}</span>
                {rank && (
                  <>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs font-bold" style={{ color: `var(--${rank.color})` }}>
                      {rank.name}
                    </span>
                  </>
                )}
              </div>
              <span className="text-xs font-mono text-muted-foreground">
                {lp.current.toLocaleString()} / {lp.max.toLocaleString()} XP
              </span>
            </div>

            <div className="h-3 bg-white/5 rounded-full overflow-hidden glass-inset">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${lp.pct}%` }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                className="h-full bg-hero-gradient shimmer rounded-full"
              />
            </div>

            {next && (
              <div className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" style={{ color: `var(--${next.color})` }} />
                <strong style={{ color: `var(--${next.color})` }} className="font-bold">
                  {(next.min_xp - xp).toLocaleString()} XP
                </strong>
                to {next.name}
              </div>
            )}
          </div>
        </div>

        {/* Stat pills */}
        <div className="flex md:flex-col gap-3">
          <StatPill icon={Flame} value={p?.current_streak ?? 0} label="Day streak" color="neon-amber" animate />
          <StatPill icon={Zap} value={xp.toLocaleString()} label="Total XP" color="neon-cyan" />
          <StatPill icon={Trophy} value={p?.longest_streak ?? 0} label="Best streak" color="neon-pink" />
        </div>
      </div>
    </motion.div>
  );
}

function StatPill({
  icon: Icon,
  value,
  label,
  color,
  animate,
}: {
  icon: typeof Flame;
  value: number | string;
  label: string;
  color: string;
  animate?: boolean;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -2 }}
      className="glass-strong rounded-2xl p-3.5 text-center min-w-[90px] cursor-default"
    >
      <Icon
        className={`h-5 w-5 mx-auto mb-1.5 ${animate ? "animate-flame" : ""}`}
        style={{ color: `var(--${color})` }}
      />
      <div className="text-xl font-bold tabular-nums" style={{ color: `var(--${color})` }}>
        {value}
      </div>
      <div className="text-[9px] uppercase tracking-widest text-muted-foreground font-medium">
        {label}
      </div>
    </motion.div>
  );
}

/* ============ INSIGHTS ============ */
export function SmartInsights() {
  const { logs, profile, mocks } = useDashboardData();
  const ranks = useRanks();
  const xp = profile.data?.xp ?? 0;
  const next = nextRankFor(xp, ranks.data ?? []);

  const insights = useMemo(() => {
    const out: { icon: typeof Brain; title: string; tone: string }[] = [];

    if (next) {
      out.push({
        icon: Trophy,
        title: `${(next.min_xp - xp).toLocaleString()} XP to ${next.name} rank`,
        tone: next.color,
      });
    }

    const bySubject: Record<string, { c: number; w: number }> = {};
    (logs.data ?? []).forEach((l) => {
      bySubject[l.subject] = bySubject[l.subject] ?? { c: 0, w: 0 };
      bySubject[l.subject].c += l.correct;
      bySubject[l.subject].w += l.wrong;
    });

    let weakest: string | null = null;
    let weakestAcc = 1;
    let strongest: string | null = null;
    let strongestAcc = 0;

    Object.entries(bySubject).forEach(([s, v]) => {
      const total = v.c + v.w;
      if (!total) return;
      const acc = v.c / total;
      if (acc < weakestAcc) {
        weakestAcc = acc;
        weakest = s;
      }
      if (acc > strongestAcc) {
        strongestAcc = acc;
        strongest = s;
      }
    });

    if (strongest) {
      out.push({
        icon: TrendingUp,
        title: `Strongest: ${strongest} at ${Math.round(strongestAcc * 100)}%`,
        tone: "neon-lime",
      });
    }

    if (weakest && weakest !== strongest) {
      out.push({
        icon: AlertTriangle,
        title: `Weakest: ${weakest} at ${Math.round(weakestAcc * 100)}%`,
        tone: "neon-amber",
      });
    }

    if ((mocks.data ?? []).length >= 2) {
      const recent = mocks.data!.slice(0, 2);
      const delta = Math.round(recent[0].accuracy - recent[1].accuracy);
      if (delta !== 0) {
        out.push({
          icon: delta > 0 ? TrendingUp : AlertTriangle,
          title: `Mock accuracy ${delta > 0 ? "up" : "down"} ${Math.abs(delta)}% vs last`,
          tone: delta > 0 ? "neon-lime" : "neon-amber",
        });
      }
    }

    if (out.length === 0) {
      out.push({
        icon: Brain,
        title: "Start logging questions to unlock smart insights",
        tone: "neon-cyan",
      });
    }

    return out.slice(0, 4);
  }, [logs.data, mocks.data, xp, next]);

  return (
    <Section title="Smart Insights" icon={Brain} accent="neon-violet">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {insights.map((i, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.06, duration: 0.4 }}
            whileHover={{ scale: 1.02, x: 4 }}
            className="glass rounded-xl p-4 flex items-center gap-3 cursor-default group"
          >
            <div
              className="h-10 w-10 rounded-xl grid place-items-center shrink-0 group-hover:scale-110 transition-transform"
              style={{
                background: `color-mix(in oklab, var(--${i.tone}) 20%, transparent)`,
                color: `var(--${i.tone})`,
              }}
            >
              <i.icon className="h-5 w-5" />
            </div>
            <span className="text-sm font-semibold leading-snug">{i.title}</span>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

/* ============ QUESTION LOGS ============ */
export function QuestionLogsSection() {
  const { logs } = useDashboardData();
  const subjects = useSubjects();
  const invalidate = useInvalidateDashboard();
  const items = logs.data ?? [];

  async function remove(id: string) {
    if (!confirm("Delete this log?")) return;
    const { error } = await supabase.from("question_logs").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Log deleted");
    invalidate();
  }

  return (
    <Section title="Question Tracker" icon={BookOpen} accent="neon-cyan" count={items.length}>
      {items.length === 0 ? (
        <Empty text="No questions logged yet. Hit the + button to start grinding." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto scrollbar-thin pr-1">
          {items.slice(0, 40).map((q) => {
            const acc = q.solved ? Math.round((q.correct / q.solved) * 100) : 0;
            const subj = subjects.data?.find((s) => s.name === q.subject);
            const c = colorForSubject(q.subject, subj?.color);

            return (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.01, y: -2 }}
                className="glass rounded-xl p-3.5 group relative"
              >
                <button
                  onClick={() => remove(q.id)}
                  title="Delete"
                  className="absolute top-2 right-2 h-7 w-7 grid place-items-center rounded-lg bg-glass-strong text-muted-foreground hover:text-neon-red hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>

                <div className="flex items-center justify-between mb-2.5 pr-9">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span
                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shrink-0"
                      style={{
                        background: `color-mix(in oklab, var(--${c}) 18%, transparent)`,
                        color: `var(--${c})`,
                        boxShadow: `0 0 12px color-mix(in oklab, var(--${c}) 20%, transparent)`,
                      }}
                    >
                      {q.subject}
                    </span>
                    <span className="text-xs text-muted-foreground truncate font-medium">
                      {q.chapter}
                    </span>
                  </div>
                  <span
                    className="text-sm font-mono font-bold shrink-0 tabular-nums"
                    style={{
                      color: `var(--${acc >= 75 ? "neon-lime" : acc >= 50 ? "neon-amber" : "neon-red"})`,
                    }}
                  >
                    {acc}%
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs mb-2">
                  <span className="text-neon-lime font-semibold">✓ {q.correct}</span>
                  <span className="text-neon-red font-semibold">✗ {q.wrong}</span>
                  <span className="text-muted-foreground">— {q.skipped}</span>
                  <span className="text-muted-foreground ml-auto flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {q.time_spent_min}m
                  </span>
                </div>

                {(q.source || q.difficulty) && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {q.source && (
                      <span className="text-[10px] glass-strong px-2 py-1 rounded-md font-medium">
                        {q.source}
                      </span>
                    )}
                    {q.difficulty && (
                      <span className="text-[10px] glass-strong px-2 py-1 rounded-md font-medium">
                        {q.difficulty}
                      </span>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </Section>
  );
}

/* ============ CHAPTER PROGRESS ============ */
export function ChapterProgressSection() {
  const { chapterProgress } = useDashboardData();
  const subjects = useSubjects();
  const chapters = useChapters();
  const [openSubjectId, setOpenSubjectId] = useState<string | null>(null);

  const progressMap = useMemo(() => {
    const m: Record<string, { progress: number; mastery: number; is_weak: boolean }> = {};
    (chapterProgress.data ?? []).forEach((c) => {
      m[`${c.subject}:${c.chapter}`] = c;
    });
    return m;
  }, [chapterProgress.data]);

  const firstId = subjects.data?.[0]?.id ?? null;
  const activeId = openSubjectId ?? firstId;

  return (
    <Section title="Chapter Progress" icon={Target} accent="neon-lime">
      <div className="space-y-2.5">
        {(subjects.data ?? []).map((s) => {
          const isOpen = activeId === s.id;
          const chList = (chapters.data ?? []).filter((c) => c.subject_id === s.id);
          const c = colorForSubject(s.name, s.color);

          return (
            <div key={s.id} className="glass rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenSubjectId(isOpen ? null : s.id)}
                className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-white/[0.05] transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="h-2.5 w-2.5 rounded-full group-hover:scale-125 transition-transform"
                    style={{
                      background: `var(--${c})`,
                      boxShadow: `0 0 12px var(--${c})`,
                    }}
                  />
                  <span className="font-bold text-sm">{s.name}</span>
                  <span className="text-xs text-muted-foreground font-medium">
                    {chList.length} chapters
                  </span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 grid grid-cols-2 md:grid-cols-3 gap-2.5">
                      {chList.map((ch) => {
                        const cp = progressMap[`${s.name}:${ch.name}`];
                        const prog = cp?.progress ?? 0;
                        const mastery = cp?.mastery ?? 0;
                        const weak = cp?.is_weak ?? false;
                        const mastered = mastery >= 80;

                        return (
                          <motion.div
                            key={ch.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.03, y: -2 }}
                            className={`rounded-xl p-3 glass-strong cursor-default ${mastered ? "neon-border-lime" : weak ? "neon-border-red" : ""
                              }`}
                          >
                            <div className="text-xs font-semibold truncate mb-2">{ch.name}</div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-1.5">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${prog}%` }}
                                transition={{ duration: 0.8, delay: 0.1 }}
                                className="h-full rounded-full"
                                style={{ background: `var(--${c})` }}
                              />
                            </div>
                            <div className="text-[9px] text-muted-foreground flex justify-between">
                              <span>{prog}% done</span>
                              <span className={mastered ? "text-neon-lime" : weak ? "text-neon-red" : ""}>
                                {mastery}% mastery
                              </span>
                            </div>
                            {mastered && (
                              <div className="mt-1.5 flex items-center gap-1 text-[9px] text-neon-lime font-bold">
                                <CheckCircle2 className="h-3 w-3" />
                                Mastered
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

/* ============ MOCK TESTS ============ */
export function MockTestsSection() {
  const { mocks } = useDashboardData();
  const invalidate = useInvalidateDashboard();
  const items = mocks.data ?? [];
  const [expanded, setExpanded] = useState<string | null>(null);

  async function remove(id: string) {
    if (!confirm("Delete this mock test?")) return;
    const { error } = await supabase.from("mock_tests").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Mock deleted");
    invalidate();
  }

  return (
    <Section title="Mock Tests" icon={ClipboardCheck} accent="neon-pink" count={items.length}>
      {items.length === 0 ? (
        <Empty text="No mocks logged. Quick-add your first test and start tracking." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.slice(0, 8).map((m) => {
            const isExpanded = expanded === m.id;
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.01, y: -2 }}
                className="glass rounded-xl p-4 group relative"
              >
                <button
                  onClick={() => remove(m.id)}
                  title="Delete"
                  className="absolute top-2 right-2 h-7 w-7 grid place-items-center rounded-lg glass-strong text-muted-foreground hover:text-neon-red hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>

                <div className="flex items-center justify-between mb-3 pr-9">
                  <span className="font-bold text-sm truncate">{m.name}</span>
                  <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(m.taken_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center mb-3">
                  <Metric label="Score" value={`${m.score}/${m.max_score}`} color="neon-cyan" />
                  <Metric
                    label="Accuracy"
                    value={`${m.accuracy}%`}
                    color={m.accuracy >= 75 ? "neon-lime" : m.accuracy >= 50 ? "neon-amber" : "neon-red"}
                  />
                  <Metric label="%ile" value={m.percentile ?? "—"} color="neon-pink" />
                </div>

                <button
                  onClick={() => setExpanded(isExpanded ? null : m.id)}
                  className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 font-medium transition-colors"
                >
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  />
                  {isExpanded ? "Hide" : "Show"} analysis
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-3 pt-3 border-t border-white/10 text-xs space-y-2 overflow-hidden"
                    >
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Time taken:</span>
                        <span className="text-foreground font-semibold">
                          {m.time_taken_min ?? "—"} min
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Silly mistakes:</span>
                        <span className="text-neon-amber font-semibold">{m.mistakes ?? 0}</span>
                      </div>
                      {m.notes && (
                        <div className="pt-1">
                          <span className="text-muted-foreground">Notes:</span>
                          <p className="text-foreground mt-1 leading-relaxed">{m.notes}</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </Section>
  );
}

function Metric({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="glass-strong rounded-xl py-2.5 px-2">
      <div className="text-base font-bold tabular-nums" style={{ color: `var(--${color})` }}>
        {value}
      </div>
      <div className="text-[9px] uppercase tracking-widest text-muted-foreground mt-0.5">
        {label}
      </div>
    </div>
  );
}

/* ============ ANALYTICS ============ */
type RangeKey = "7" | "30" | "90" | "all";
const RANGES: { key: RangeKey; label: string; days: number | null }[] = [
  { key: "7", label: "7D", days: 7 },
  { key: "30", label: "30D", days: 30 },
  { key: "90", label: "90D", days: 90 },
  { key: "all", label: "All", days: null },
];

export function AnalyticsSection() {
  const { logs, mocks } = useDashboardData();
  const subjects = useSubjects();
  const [range, setRange] = useState<RangeKey>("30");

  const dailyData = useMemo(() => {
    const all = logs.data ?? [];
    if (all.length === 0) return [];
    const rangeDef = RANGES.find((r) => r.key === range)!;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const firstDay = rangeDef.days
      ? new Date(today.getTime() - (rangeDef.days - 1) * 86400000)
      : new Date(Math.min(...all.map((l) => new Date(l.created_at.slice(0, 10)).getTime())));
    firstDay.setHours(0, 0, 0, 0);

    const days: Record<
      string,
      { day: string; date: string; minutes: number; solved: number; correct: number; wrong: number }
    > = {};

    for (let d = new Date(firstDay); d <= today; d = new Date(d.getTime() + 86400000)) {
      const key = d.toISOString().slice(0, 10);
      days[key] = {
        day: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        date: key,
        minutes: 0,
        solved: 0,
        correct: 0,
        wrong: 0,
      };
    }

    all.forEach((l) => {
      const key = l.created_at.slice(0, 10);
      if (days[key]) {
        days[key].minutes += l.time_spent_min;
        days[key].solved += l.solved;
        days[key].correct += l.correct;
        days[key].wrong += l.wrong;
      }
    });

    return Object.values(days).map((d) => ({
      ...d,
      accuracy: d.correct + d.wrong > 0 ? Math.round((d.correct / (d.correct + d.wrong)) * 100) : 0,
    }));
  }, [logs.data, range]);

  const totals = useMemo(() => {
    const t = dailyData.reduce(
      (a, d) => ({
        minutes: a.minutes + d.minutes,
        solved: a.solved + d.solved,
        active: a.active + (d.solved > 0 ? 1 : 0),
      }),
      { minutes: 0, solved: 0, active: 0 }
    );
    return { ...t, avgMin: dailyData.length ? Math.round(t.minutes / dailyData.length) : 0 };
  }, [dailyData]);

  const radarData = useMemo(() => {
    const subjList = subjects.data ?? [];
    const by: Record<string, { c: number; w: number; sp: number }> = {};
    subjList.forEach((s) => {
      by[s.name] = { c: 0, w: 0, sp: 0 };
    });
    (logs.data ?? []).forEach((l) => {
      if (!by[l.subject]) return;
      by[l.subject].c += l.correct;
      by[l.subject].w += l.wrong;
      by[l.subject].sp += l.solved;
    });
    return subjList.map((s) => ({
      subject: s.name,
      accuracy:
        by[s.name].c + by[s.name].w > 0
          ? Math.round((by[s.name].c / (by[s.name].c + by[s.name].w)) * 100)
          : 0,
      volume: Math.min(100, by[s.name].sp),
    }));
  }, [logs.data, subjects.data]);

  const mockTrend = useMemo(
    () =>
      (mocks.data ?? [])
        .slice(0, 10)
        .reverse()
        .map((m) => ({ name: m.name.slice(0, 10), accuracy: m.accuracy })),
    [mocks.data]
  );

  return (
    <Section title="Analytics" icon={BarChart2} accent="neon-cyan">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        {/* Range selector */}
        <div className="flex gap-1.5 glass rounded-xl p-1.5">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${range === r.key
                  ? "bg-hero-gradient text-background glow-cyan"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Summary stats */}
        <div className="flex flex-wrap gap-4 text-xs">
          <span className="font-mono">
            <strong className="text-neon-cyan">{totals.solved}</strong> solved
          </span>
          <span className="font-mono">
            <strong className="text-neon-lime">{totals.minutes}</strong> min
          </span>
          <span className="font-mono">
            <strong className="text-neon-pink">{totals.active}</strong> active days
          </span>
          <span className="font-mono">
            <strong className="text-neon-amber">{totals.avgMin}</strong> avg/day
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Daily study time */}
        <div className="md:col-span-2 glass rounded-xl p-5">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-4 font-semibold flex items-center gap-2">
            <Clock className="h-3.5 w-3.5" />
            Daily Study Time (minutes)
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dailyData}>
              <XAxis
                dataKey="day"
                stroke="oklch(0.72 0.03 260)"
                fontSize={10}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
                minTickGap={20}
              />
              <YAxis stroke="oklch(0.72 0.03 260)" fontSize={10} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: "oklch(0.20 0.03 270)",
                  border: "1px solid oklch(1 0 0 / 0.1)",
                  borderRadius: 12,
                  fontSize: 12,
                  backdropFilter: "blur(12px)",
                }}
              />
              <Bar dataKey="minutes" fill="var(--neon-cyan)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Accuracy trend */}
        <div className="md:col-span-2 glass rounded-xl p-5">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-4 font-semibold flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5" />
            Daily Accuracy & Questions Solved
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dailyData}>
              <XAxis
                dataKey="day"
                stroke="oklch(0.72 0.03 260)"
                fontSize={10}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
                minTickGap={20}
              />
              <YAxis
                yAxisId="left"
                stroke="oklch(0.72 0.03 260)"
                fontSize={10}
                axisLine={false}
                tickLine={false}
                domain={[0, 100]}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="oklch(0.72 0.03 260)"
                fontSize={10}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "oklch(0.20 0.03 270)",
                  border: "1px solid oklch(1 0 0 / 0.1)",
                  borderRadius: 12,
                  fontSize: 12,
                  backdropFilter: "blur(12px)",
                }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="accuracy"
                stroke="var(--neon-lime)"
                strokeWidth={2.5}
                dot={false}
                name="Accuracy %"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="solved"
                stroke="var(--neon-pink)"
                strokeWidth={2.5}
                dot={false}
                name="Solved"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Mock trend */}
        <div className="glass rounded-xl p-5">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-4 font-semibold flex items-center gap-2">
            <ClipboardCheck className="h-3.5 w-3.5" />
            Mock Accuracy Trend
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={mockTrend}>
              <XAxis
                dataKey="name"
                stroke="oklch(0.72 0.03 260)"
                fontSize={10}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                stroke="oklch(0.72 0.03 260)"
                fontSize={10}
                axisLine={false}
                tickLine={false}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  background: "oklch(0.20 0.03 270)",
                  border: "1px solid oklch(1 0 0 / 0.1)",
                  borderRadius: 12,
                  fontSize: 12,
                  backdropFilter: "blur(12px)",
                }}
              />
              <Line
                type="monotone"
                dataKey="accuracy"
                stroke="var(--neon-pink)"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "var(--neon-pink)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Subject radar */}
        <div className="glass rounded-xl p-5">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-4 font-semibold flex items-center gap-2">
            <Target className="h-3.5 w-3.5" />
            Subject Performance Radar
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="oklch(1 0 0 / 0.1)" />
              <PolarAngleAxis dataKey="subject" stroke="oklch(0.72 0.03 260)" fontSize={11} />
              <Radar
                name="Accuracy"
                dataKey="accuracy"
                stroke="var(--neon-cyan)"
                fill="var(--neon-cyan)"
                fillOpacity={0.3}
              />
              <Radar
                name="Volume"
                dataKey="volume"
                stroke="var(--neon-pink)"
                fill="var(--neon-pink)"
                fillOpacity={0.2}
              />
              <Tooltip
                contentStyle={{
                  background: "oklch(0.20 0.03 270)",
                  border: "1px solid oklch(1 0 0 / 0.1)",
                  borderRadius: 12,
                  fontSize: 12,
                  backdropFilter: "blur(12px)",
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Section>
  );
}

/* ============ REVISIONS ============ */
export function RevisionsSection() {
  const { revisions } = useDashboardData();
  const subjects = useSubjects();
  const invalidate = useInvalidateDashboard();
  const items = (revisions.data ?? []).filter((r) => r.status !== "done");

  async function complete(id: string) {
    await supabase.from("revisions").update({ status: "done" }).eq("id", id);
    toast.success("Revision complete · +20 XP");
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: p } = await supabase
        .from("profiles")
        .select("xp")
        .eq("id", user.id)
        .maybeSingle();
      await supabase
        .from("profiles")
        .update({ xp: (p?.xp ?? 0) + 20 })
        .eq("id", user.id);
      await supabase
        .from("xp_history")
        .insert({ user_id: user.id, amount: 20, reason: "Revision complete" });
    }
    invalidate();
  }

  async function remove(id: string) {
    if (!confirm("Delete this revision?")) return;
    const { error } = await supabase.from("revisions").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Revision deleted");
    invalidate();
  }

  return (
    <Section title="Revision Queue" icon={Repeat} accent="neon-amber" count={items.length}>
      {items.length === 0 ? (
        <Empty text="Queue is clear. Schedule a revision from the + button." />
      ) : (
        <div className="space-y-2.5 max-h-[340px] overflow-y-auto scrollbar-thin pr-1">
          {items.map((r) => {
            const overdue = r.due_date && r.due_date < new Date().toISOString().slice(0, 10);
            const subj = subjects.data?.find((s) => s.name === r.subject);
            const c = colorForSubject(r.subject, subj?.color);

            return (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.01, x: 4 }}
                className="glass rounded-xl p-3.5 flex items-center gap-3"
              >
                <span
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shrink-0"
                  style={{
                    background: `color-mix(in oklab, var(--${c}) 18%, transparent)`,
                    color: `var(--${c})`,
                    boxShadow: `0 0 12px color-mix(in oklab, var(--${c}) 20%, transparent)`,
                  }}
                >
                  {r.subject}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold truncate">{r.topic || r.chapter}</div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    {r.chapter}
                    {r.due_date && (
                      <span className={overdue ? "text-neon-red font-semibold ml-2" : "ml-2"}>
                        · {r.due_date}
                        {overdue && " (overdue)"}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => complete(r.id)}
                  className="px-4 py-2 rounded-lg bg-hero-gradient text-background text-xs font-bold flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-transform glow-cyan shrink-0"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Revise
                </button>

                <button
                  onClick={() => remove(r.id)}
                  title="Delete"
                  className="h-8 w-8 grid place-items-center rounded-lg text-muted-foreground hover:text-neon-red hover:bg-white/5 transition-colors shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </Section>
  );
}

/* ============ NOTES ============ */
export function NotesSection() {
  const { notes } = useDashboardData();
  const invalidate = useInvalidateDashboard();
  const items = notes.data ?? [];

  async function togglePin(id: string, pinned: boolean) {
    await supabase.from("notes").update({ pinned: !pinned }).eq("id", id);
    invalidate();
  }

  async function remove(id: string) {
    if (!confirm("Delete this note?")) return;
    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Note deleted");
    invalidate();
  }

  return (
    <Section title="Sticky Notes" icon={StickyNote} accent="neon-violet" count={items.length}>
      {items.length === 0 ? (
        <Empty text="No notes yet. Pin formulas and mistakes." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-h-[360px] overflow-y-auto scrollbar-thin pr-1">
          {items.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02, rotate: n.pinned ? 0 : 1 }}
              className="rounded-xl p-4 relative group cursor-default"
              style={{
                background: `color-mix(in oklab, var(--${n.color}) 14%, oklch(0.20 0.03 270))`,
                border: `1px solid color-mix(in oklab, var(--${n.color}) 40%, transparent)`,
                boxShadow: `0 0 20px color-mix(in oklab, var(--${n.color}) 15%, transparent)`,
              }}
            >
              <div className="absolute top-2 right-2 flex items-center gap-1">
                <button
                  onClick={() => togglePin(n.id, n.pinned)}
                  title="Pin"
                  className={`h-6 w-6 grid place-items-center rounded-lg hover:bg-white/10 transition-all ${n.pinned ? "opacity-100" : "opacity-40 group-hover:opacity-100"
                    }`}
                >
                  <Pin
                    className="h-3.5 w-3.5"
                    style={{ color: `var(--${n.color})` }}
                    fill={n.pinned ? `var(--${n.color})` : "none"}
                  />
                </button>
                <button
                  onClick={() => remove(n.id)}
                  title="Delete"
                  className="h-6 w-6 grid place-items-center rounded-lg opacity-40 group-hover:opacity-100 text-muted-foreground hover:text-neon-red hover:bg-white/10 transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              {n.title && (
                <div className="font-bold text-sm mb-2 pr-14">{n.title}</div>
              )}
              <div className="text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed">
                {n.content}
              </div>
              {n.category && (
                <div className="mt-2 text-[10px] uppercase tracking-wider opacity-60 font-semibold">
                  {n.category}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </Section>
  );
}

/* ============ GAMIFICATION ============ */
export function GamificationSection() {
  const { profile, logs, mocks } = useDashboardData();
  const missionsQ = useMissions();
  const achievementDefs = useAchievementDefs();
  const invalidate = useInvalidateDashboard();

  const xp = profile.data?.xp ?? 0;
  const streak = profile.data?.current_streak ?? 0;
  const totalSolved = (logs.data ?? []).reduce((a, b) => a + (b.solved ?? 0), 0);
  const totalMocks = (mocks.data ?? []).length;
  const bestMockAcc = Math.max(0, ...(mocks.data ?? []).map((m) => m.accuracy));

  async function deleteMission(id: string) {
    await supabase.from("missions").delete().eq("id", id);
    invalidate();
  }

  function isUnlocked(criteria: { type: string; value: number } | null): boolean {
    if (!criteria) return false;
    switch (criteria.type) {
      case "questions":
        return totalSolved >= criteria.value;
      case "mocks":
        return totalMocks >= criteria.value;
      case "streak":
        return streak >= criteria.value;
      case "xp":
        return xp >= criteria.value;
      case "mock_accuracy":
        return bestMockAcc >= criteria.value;
      default:
        return false;
    }
  }

  const missions = missionsQ.data ?? [];

  return (
    <Section title="Daily Quests & Achievements" icon={Trophy} accent="neon-pink">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Missions */}
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-semibold">
            Your Missions
          </div>
          <div className="space-y-2.5 max-h-[320px] overflow-y-auto scrollbar-thin pr-1">
            {missions.length === 0 && <Empty text="No missions yet. Add one from the + button." />}
            {missions.map((m) => {
              const pct = Math.min(100, ((m.progress ?? 0) / m.target_value) * 100);
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.01, x: 2 }}
                  className={`glass rounded-xl p-3.5 group ${m.completed ? "neon-border-lime" : ""
                    }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold truncate">{m.title}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-mono text-neon-cyan font-bold">
                        +{m.xp_reward} XP
                      </span>
                      <button
                        onClick={() => deleteMission(m.id)}
                        className="text-muted-foreground hover:text-neon-red opacity-0 group-hover:opacity-100 transition-opacity text-sm"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-hero-gradient rounded-full shimmer"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1.5 font-mono flex justify-between">
                    <span>
                      {m.progress} / {m.target_value} {m.target_type}
                    </span>
                    {m.completed && <span className="text-neon-lime font-bold">✓ done</span>}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Achievements */}
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-semibold">
            Achievements
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {(achievementDefs.data ?? []).map((a) => {
              const unlocked = isUnlocked(a.criteria);
              return (
                <motion.div
                  key={a.id}
                  title={a.description ?? ""}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: unlocked ? 1.1 : 1.02, rotate: unlocked ? 5 : 0 }}
                  className={`glass rounded-xl p-3.5 text-center cursor-default transition ${unlocked ? "neon-border-amber" : "opacity-40 grayscale"
                    }`}
                >
                  <Trophy
                    className={`h-7 w-7 mx-auto mb-1.5 ${unlocked ? "text-neon-amber" : "text-muted-foreground"
                      }`}
                  />
                  <div className="text-[11px] font-bold leading-tight">{a.title}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ============ SECTION WRAPPER ============ */
export function Section({
  title,
  icon: Icon,
  accent,
  count,
  children,
  id,
}: {
  title: string;
  icon: typeof Brain;
  accent: string;
  count?: number;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4 }}
      className="space-y-3"
    >
      <div className="flex items-center gap-2.5">
        <div
          className="h-9 w-9 rounded-xl grid place-items-center"
          style={{
            background: `color-mix(in oklab, var(--${accent}) 18%, transparent)`,
            color: `var(--${accent})`,
          }}
        >
          <Icon className="h-4.5 w-4.5" />
        </div>
        <h2 className="text-lg font-bold tracking-tight">{title}</h2>
        {count !== undefined && (
          <span className="text-xs text-muted-foreground font-mono">({count})</span>
        )}
      </div>
      {children}
    </motion.section>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="glass rounded-xl p-8 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}