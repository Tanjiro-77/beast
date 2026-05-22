import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Zap, Flame, Trophy, Brain, Target, Sparkles, Rocket, BarChart3, ChevronRight, Star, CheckCircle2, ArrowUpRight, Shield, Clock, Users } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BeastPrep — JEE 2028 Command Center" },
      { name: "description", content: "Futuristic JEE 2028 preparation tracker with gamified XP, streaks, mock analytics and a single-page mission control dashboard." },
      { property: "og:title", content: "BeastPrep — JEE 2028 Command Center" },
      { property: "og:description", content: "Train like an esports pro. Track questions, mocks, revisions and rank up to BEAST." },
    ],
  }),
  component: Landing,
});

// ─── Animated Counter ────────────────────────────────────────────────────────
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const duration = 1800;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [started, target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ─── Floating Orb Background ─────────────────────────────────────────────────
function FloatingOrbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {[
        { cx: "15%", cy: "20%", color: "var(--neon-cyan)", size: 400, delay: 0 },
        { cx: "85%", cy: "15%", color: "var(--neon-violet)", size: 350, delay: 2 },
        { cx: "70%", cy: "75%", color: "var(--neon-pink)", size: 300, delay: 4 },
        { cx: "10%", cy: "80%", color: "var(--neon-amber)", size: 250, delay: 1 },
        { cx: "50%", cy: "50%", color: "var(--neon-lime)", size: 200, delay: 3 },
      ].map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: orb.cx,
            top: orb.cy,
            width: orb.size,
            height: orb.size,
            background: `radial-gradient(circle, ${orb.color}18 0%, transparent 70%)`,
            transform: "translate(-50%, -50%)",
            filter: "blur(40px)",
          }}
          animate={{
            x: [0, 30, -20, 10, 0],
            y: [0, -25, 15, -10, 0],
            scale: [1, 1.1, 0.95, 1.05, 1],
          }}
          transition={{
            duration: 12 + i * 2,
            delay: orb.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  );
}

// ─── Particle Trail ──────────────────────────────────────────────────────────
function ParticleField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: ["var(--neon-cyan)", "var(--neon-violet)", "var(--neon-pink)", "var(--neon-lime)"][i % 4],
            boxShadow: `0 0 6px currentColor`,
          }}
          animate={{
            y: [0, -80, 0],
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 4 + Math.random() * 3,
            delay: Math.random() * 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ─── Rank Badge ──────────────────────────────────────────────────────────────
function RankBadge({ rank, xp, color, active = false, index }: { rank: string; xp: string; color: string; active?: boolean; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      className={`relative flex items-center justify-between rounded-xl px-5 py-3.5 border transition-all duration-300 group cursor-default ${active
          ? "border-white/20 bg-white/8"
          : "border-white/5 bg-white/3 hover:border-white/10 hover:bg-white/5"
        }`}
    >
      {active && (
        <motion.div
          className="absolute inset-0 rounded-xl"
          style={{ background: `linear-gradient(135deg, ${color}15, transparent)` }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
      <div className="flex items-center gap-3 relative">
        <div
          className="h-8 w-8 rounded-lg grid place-items-center text-sm font-bold"
          style={{ background: `${color}20`, color }}
        >
          {index + 1}
        </div>
        <span className="font-semibold" style={{ color: active ? color : undefined }}>{rank}</span>
        {active && (
          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: `${color}20`, color }}>
            YOU
          </span>
        )}
      </div>
      <span className="text-sm text-muted-foreground font-mono relative">{xp}</span>
    </motion.div>
  );
}

// ─── Feature Card ─────────────────────────────────────────────────────────────
function FeatureCard({ icon: Icon, title, desc, color, index }: {
  icon: React.ElementType; title: string; desc: string; color: string; index: number;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.07 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative rounded-2xl p-6 border border-white/5 bg-white/3 backdrop-blur-sm overflow-hidden group cursor-default"
      style={{ transition: "border-color 0.3s, background 0.3s" }}
      whileHover={{ scale: 1.02, borderColor: `${color}40` }}
    >
      {/* Glow on hover */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(circle at 30% 30%, ${color}10, transparent 70%)` }}
          />
        )}
      </AnimatePresence>

      {/* Top accent line */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />

      <motion.div
        className="h-12 w-12 rounded-xl grid place-items-center mb-5 relative"
        style={{ background: `${color}15` }}
        animate={{ scale: hovered ? 1.1 : 1 }}
        transition={{ duration: 0.2 }}
      >
        <Icon className="h-5 w-5" style={{ color }} />
        <motion.div
          className="absolute inset-0 rounded-xl"
          style={{ boxShadow: `0 0 20px ${color}40` }}
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>

      <h3 className="font-bold text-lg mb-2 group-hover:text-white transition-colors">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>

      <motion.div
        className="flex items-center gap-1 mt-4 text-xs font-semibold"
        style={{ color }}
        animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : -5 }}
        transition={{ duration: 0.2 }}
      >
        Learn more <ArrowUpRight className="h-3 w-3" />
      </motion.div>
    </motion.div>
  );
}

// ─── Live Dashboard Preview ──────────────────────────────────────────────────
function DashboardPreview() {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = ["Overview", "Mocks", "Revision"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      className="relative mt-20 mx-auto max-w-5xl"
    >
      {/* Browser chrome */}
      <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl overflow-hidden shadow-2xl"
        style={{ boxShadow: "0 0 80px rgba(0,255,200,0.05), 0 40px 80px rgba(0,0,0,0.5)" }}>
        {/* Browser top bar */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/5 bg-white/2">
          <div className="flex gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500/60" />
            <div className="h-3 w-3 rounded-full bg-amber-500/60" />
            <div className="h-3 w-3 rounded-full bg-green-500/60" />
          </div>
          <div className="flex-1 max-w-sm mx-auto">
            <div className="bg-white/5 rounded-md px-4 py-1.5 text-xs text-muted-foreground font-mono text-center">
              app.beastprep.io/dashboard
            </div>
          </div>
          <div className="flex gap-2">
            {tabs.map((t, i) => (
              <button
                key={t}
                onClick={() => setActiveTab(i)}
                className={`text-xs px-3 py-1 rounded-md transition-all ${activeTab === i ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard content */}
        <div className="p-5 space-y-4">
          {/* Top stats row */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Questions Today", value: "142", delta: "+23", color: "var(--neon-cyan)" },
              { label: "XP Earned", value: "3,500", delta: "+180", color: "var(--neon-violet)" },
              { label: "Streak", value: "47 days", delta: "🔥", color: "var(--neon-amber)" },
              { label: "Accuracy", value: "94.2%", delta: "+2.1%", color: "var(--neon-lime)" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="rounded-xl bg-white/4 border border-white/5 p-4"
              >
                <div className="text-[10px] text-muted-foreground mb-1">{stat.label}</div>
                <div className="text-xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
                <div className="text-[10px] mt-1" style={{ color: stat.color }}>{stat.delta}</div>
              </motion.div>
            ))}
          </div>

          {/* Main content grid */}
          <div className="grid grid-cols-3 gap-3">
            {/* Chart placeholder */}
            <div className="col-span-2 rounded-xl bg-white/4 border border-white/5 p-4">
              <div className="text-xs font-semibold mb-3 text-muted-foreground">Questions / Day (last 14 days)</div>
              <div className="flex items-end gap-1.5 h-20">
                {[40, 65, 55, 80, 72, 90, 85, 110, 95, 130, 115, 142, 138, 142].map((h, i) => (
                  <motion.div
                    key={i}
                    className="flex-1 rounded-sm"
                    style={{
                      height: `${(h / 142) * 100}%`,
                      background: i === 13 ? "var(--neon-cyan)" : `rgba(0,255,200,${0.2 + i * 0.05})`,
                      transformOrigin: "bottom",
                    }}
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.03, duration: 0.4 }}
                  />
                ))}
              </div>
            </div>

            {/* Rank card */}
            <div className="rounded-xl bg-white/4 border border-white/5 p-4">
              <div className="text-[10px] text-muted-foreground mb-2">Rank Progress</div>
              <div className="text-sm font-bold mb-1" style={{ color: "var(--neon-violet)" }}>Dominator</div>
              <div className="h-1.5 bg-white/5 rounded-full mb-1">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, var(--neon-violet), var(--neon-pink))" }}
                  initial={{ width: 0 }}
                  whileInView={{ width: "50%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
              <div className="text-[10px] text-muted-foreground">3,500 / 7,000 XP</div>
              <div className="mt-3 space-y-1">
                {["Physics: 92%", "Chemistry: 88%", "Maths: 97%"].map((s, i) => (
                  <div key={i} className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground">{s.split(":")[0]}</span>
                    <span style={{ color: ["var(--neon-cyan)", "var(--neon-lime)", "var(--neon-pink)"][i] }}>
                      {s.split(":")[1]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent activity */}
          <div className="rounded-xl bg-white/4 border border-white/5 p-4">
            <div className="text-xs font-semibold mb-3 text-muted-foreground">Recent Activity</div>
            <div className="space-y-2">
              {[
                { action: "Solved 25 questions", topic: "Electrostatics", time: "2m ago", xp: "+50 XP", color: "var(--neon-cyan)" },
                { action: "Mock Test #12", topic: "Full Syllabus", time: "3h ago", xp: "+200 XP", color: "var(--neon-violet)" },
                { action: "Revision streak", topic: "Organic Chemistry", time: "5h ago", xp: "+30 XP", color: "var(--neon-lime)" },
              ].map((act, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 w-1.5 rounded-full" style={{ background: act.color }} />
                    <span className="text-white/80">{act.action}</span>
                    <span className="text-muted-foreground">· {act.topic}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold" style={{ color: act.color }}>{act.xp}</span>
                    <span className="text-muted-foreground">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Glow effect under preview */}
      <div
        className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20 pointer-events-none"
        style={{ background: "radial-gradient(ellipse, var(--neon-cyan)20, transparent 70%)", filter: "blur(20px)" }}
      />
    </motion.div>
  );
}

// ─── Testimonial Card ─────────────────────────────────────────────────────────
function TestimonialCard({ name, rank, text, rating, color, index }: {
  name: string; rank: string; text: string; rating: number; color: string; index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="rounded-2xl border border-white/5 bg-white/3 backdrop-blur-sm p-6 hover:border-white/10 transition-all"
    >
      <div className="flex gap-1 mb-4">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} className="h-3.5 w-3.5 fill-current" style={{ color: "var(--neon-amber)" }} />
        ))}
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed mb-5">"{text}"</p>
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full grid place-items-center font-bold text-sm" style={{ background: `${color}20`, color }}>
          {name[0]}
        </div>
        <div>
          <div className="text-sm font-semibold">{name}</div>
          <div className="text-xs text-muted-foreground">{rank}</div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function Landing() {
  const { scrollY } = useScroll();
  const navBg = useTransform(scrollY, [0, 100], ["rgba(0,0,0,0)", "rgba(0,0,0,0.8)"]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    { icon: Target, title: "Question Tracking", desc: "Log solves, accuracy, difficulty & source in 5 seconds. Inline counters, subject chips, and topic trees.", color: "var(--neon-cyan)" },
    { icon: Trophy, title: "XP & Ranks", desc: "Rookie → Solver → Grinder → Dominator → Beast. Daily quests, achievements, unlock animations.", color: "var(--neon-pink)" },
    { icon: Flame, title: "Streak Engine", desc: "Animated streak flame, weekly heatmap, consistency rewards that multiply your XP.", color: "var(--neon-amber)" },
    { icon: BarChart3, title: "Mock Analytics", desc: "Score, accuracy, percentile, time analysis. Expandable test drawers with question-level breakdowns.", color: "var(--neon-violet)" },
    { icon: Brain, title: "Smart Insights", desc: "AI-style cards: weakest topics, accuracy trends, next-rank XP gap, optimal study time suggestions.", color: "var(--neon-lime)" },
    { icon: Sparkles, title: "Revision Queue", desc: "Smart spaced-repetition reminders, flash review cards, one-click 'Revise Now' for any topic.", color: "var(--neon-cyan)" },
  ];

  const ranks = [
    { r: "Rookie", xp: "0 XP", c: "var(--neon-cyan)" },
    { r: "Solver", xp: "500 XP", c: "var(--neon-lime)" },
    { r: "Grinder", xp: "1,500 XP", c: "var(--neon-amber)" },
    { r: "Dominator", xp: "3,500 XP", c: "var(--neon-violet)" },
    { r: "Beast", xp: "7,000 XP", c: "var(--neon-pink)" },
  ];

  const testimonials = [
    { name: "Arjun Mehta", rank: "Dominator · AIR 847", text: "BeastPrep turned my chaotic prep into a system. The XP streaks are stupidly addictive — I haven't missed a day in 3 months.", rating: 5, color: "var(--neon-violet)" },
    { name: "Priya Sharma", rank: "Beast · AIR 112", text: "The mock analytics literally showed me I was wasting 8 minutes per question in chemistry. Fixed that, jumped 40 percentile.", rating: 5, color: "var(--neon-pink)" },
    { name: "Rohan Das", rank: "Grinder · 60-day streak", text: "Dashboard feels like a game HUD. I check it more than Instagram now. That alone says everything.", rating: 5, color: "var(--neon-lime)" },
  ];

  return (
    <div className="min-h-screen bg-aurora overflow-x-hidden" style={{ background: "var(--background)" }}>
      <FloatingOrbs />

      {/* ── Nav ──────────────────────────────────────────────────────────────── */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 border-b border-transparent transition-all"
        style={{ backgroundColor: navBg as any, backdropFilter: "blur(20px)" }}
      >
        <motion.div
          className="flex items-center gap-2.5"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="h-9 w-9 rounded-xl grid place-items-center"
            style={{ background: "linear-gradient(135deg, var(--neon-cyan), var(--neon-violet))", boxShadow: "0 0 20px var(--neon-cyan)60" }}
            whileHover={{ scale: 1.1, rotate: 10 }}
          >
            <Zap className="h-5 w-5 text-black" strokeWidth={2.5} />
          </motion.div>
          <span className="font-bold text-xl tracking-tight">BeastPrep</span>
        </motion.div>

        <motion.div
          className="hidden md:flex items-center gap-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {["Features", "Ranks", "Testimonials"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-sm text-muted-foreground hover:text-white transition-colors"
            >
              {item}
            </a>
          ))}
        </motion.div>

        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Link to="/auth" className="text-sm text-muted-foreground hover:text-white transition-colors hidden md:block">
            Sign in
          </Link>
          <Link
            to="/auth"
            className="group px-4 py-2 rounded-lg text-sm font-semibold transition-all inline-flex items-center gap-1.5"
            style={{
              background: "linear-gradient(135deg, var(--neon-cyan), var(--neon-violet))",
              color: "black",
              boxShadow: "0 0 20px var(--neon-cyan)40",
            }}
          >
            Get Started
            <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </motion.div>
      </motion.nav>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative px-6 md:px-12 pt-32 pb-12 max-w-7xl mx-auto">
        <ParticleField />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-4xl mx-auto relative z-10"
        >
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-8 border"
            style={{
              background: "rgba(0,255,200,0.05)",
              borderColor: "rgba(0,255,200,0.2)",
              color: "var(--neon-cyan)",
            }}
            animate={{ boxShadow: ["0 0 0px var(--neon-cyan)00", "0 0 20px var(--neon-cyan)30", "0 0 0px var(--neon-cyan)00"] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Sparkles className="h-3 w-3" />
            JEE 2028 · Built for the elite 1%
            <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
          </motion.div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-6 leading-[0.95]">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="block"
            >
              Train like a
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="block"
              style={{
                background: "linear-gradient(135deg, var(--neon-cyan) 0%, var(--neon-violet) 50%, var(--neon-pink) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Beast.
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="block text-4xl md:text-5xl lg:text-6xl mt-2 text-white/70"
            >
              Rank up to JEE.
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            A futuristic command center for JEE preparation. Track every question, every mock,
            every streak — all on one page. Built for grinders who treat studying like a sport.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link
              to="/auth"
              className="group relative px-8 py-4 rounded-xl font-bold text-base inline-flex items-center gap-2 overflow-hidden"
              style={{ color: "black" }}
            >
              <motion.div
                className="absolute inset-0"
                style={{ background: "linear-gradient(135deg, var(--neon-cyan), var(--neon-violet))" }}
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: "linear-gradient(135deg, var(--neon-violet), var(--neon-pink))" }}
              />
              <span className="relative flex items-center gap-2">
                <Rocket className="h-5 w-5" />
                Enter Beast Mode
              </span>
            </Link>

            <a
              href="#features"
              className="px-8 py-4 rounded-xl font-semibold text-base border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all inline-flex items-center gap-2 group"
            >
              See the dashboard
              <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="flex items-center justify-center gap-6 mt-8 text-xs text-muted-foreground"
          >
            {[
              { icon: Shield, text: "Free to start" },
              { icon: Clock, text: "Setup in 60 seconds" },
              { icon: Users, text: "10,000+ aspirants" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5" style={{ color: "var(--neon-cyan)" }} />
                {text}
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Dashboard preview */}
        <DashboardPreview />
      </section>

      {/* ── Stats ────────────────────────────────────────────────────────────── */}
      <section className="px-6 md:px-12 py-20 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { v: 2400000, suffix: "+", label: "Questions Tracked", color: "var(--neon-cyan)", format: (n: number) => n >= 1000000 ? `${(n / 1000000).toFixed(1)}M` : n.toLocaleString() },
            { v: 98, suffix: "%", label: "Daily Streak Retention", color: "var(--neon-lime)", format: (n: number) => n.toString() },
            { v: 12, suffix: "x", label: "Faster Log Workflow", color: "var(--neon-pink)", format: (n: number) => n.toString() },
            { v: 10247, suffix: "+", label: "Active Aspirants", color: "var(--neon-violet)", format: (n: number) => n.toLocaleString() },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="relative rounded-2xl border border-white/5 bg-white/3 backdrop-blur-sm p-6 text-center overflow-hidden group hover:border-white/10 transition-all"
            >
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: `radial-gradient(circle at center, ${s.color}08, transparent 70%)` }}
              />
              <div className="text-3xl md:text-4xl font-bold mb-1" style={{ color: s.color }}>
                {s.format(s.v)}{s.suffix}
              </div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────────── */}
      <section id="features" className="px-6 md:px-12 py-24 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4 border"
            style={{ borderColor: "rgba(139,92,246,0.3)", color: "var(--neon-violet)", background: "rgba(139,92,246,0.05)" }}
          >
            <Sparkles className="h-3 w-3" />
            Feature Set
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            One screen.{" "}
            <span style={{
              background: "linear-gradient(135deg, var(--neon-cyan), var(--neon-violet))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Total control.
            </span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            No tabs. No page reloads. Everything updates inline through modals, drawers, and
            quick-add buttons — the way pros work.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <FeatureCard key={i} {...f} index={i} />
          ))}
        </div>
      </section>

      {/* ── Rank system ──────────────────────────────────────────────────────── */}
      <section id="ranks" className="px-6 md:px-12 py-24 max-w-7xl mx-auto">
        <div
          className="rounded-3xl border border-white/5 overflow-hidden relative"
          style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))" }}
        >
          {/* Background glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 20% 50%, var(--neon-violet)08, transparent 60%), radial-gradient(ellipse at 80% 50%, var(--neon-pink)06, transparent 60%)" }}
          />

          <div className="relative grid md:grid-cols-2 gap-0">
            {/* Left */}
            <div className="p-10 md:p-14 border-b md:border-b-0 md:border-r border-white/5">
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-6 border"
                style={{ borderColor: "rgba(251,191,36,0.3)", color: "var(--neon-amber)", background: "rgba(251,191,36,0.05)" }}
              >
                <Trophy className="h-3 w-3" />
                Gamification Engine
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
                Climb the ranks.<br />
                <span style={{
                  background: "linear-gradient(135deg, var(--neon-amber), var(--neon-pink))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                  Become the Beast.
                </span>
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Every question earns XP. Every streak fuels your level. Every mock unlocks badges.
                Engineered to make grinding feel like a game you can't put down.
              </p>

              {/* Checklist */}
              <div className="space-y-3 mb-8">
                {[
                  "Daily XP multipliers for consistency",
                  "Rank-up animations & badge unlocks",
                  "Weekly leaderboard among peers",
                  "Achievement system with 50+ badges",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: "var(--neon-lime)" }} />
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                {ranks.map((rk, i) => (
                  <RankBadge key={rk.r} rank={rk.r} xp={rk.xp} color={rk.c} active={i === 3} index={i} />
                ))}
              </div>
            </div>

            {/* Right — Live card */}
            <div className="p-10 md:p-14 flex items-center justify-center">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-full max-w-sm"
              >
                {/* Main rank card */}
                <div
                  className="rounded-2xl border border-white/10 p-6 mb-4"
                  style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)" }}
                >
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Current Rank</div>
                      <div
                        className="text-2xl font-bold"
                        style={{
                          background: "linear-gradient(135deg, var(--neon-violet), var(--neon-pink))",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                        }}
                      >
                        Dominator
                      </div>
                    </div>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Flame className="h-12 w-12" style={{ color: "var(--neon-amber)" }} />
                    </motion.div>
                  </div>

                  {/* XP bar */}
                  <div className="space-y-2 mb-5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">XP to Beast</span>
                      <span className="font-mono font-bold">3,500 / 7,000</span>
                    </div>
                    <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: "linear-gradient(90deg, var(--neon-violet), var(--neon-pink))" }}
                        initial={{ width: "0%" }}
                        whileInView={{ width: "50%" }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">3,500 XP remaining</div>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { v: "47", label: "Day streak", color: "var(--neon-amber)" },
                      { v: "94%", label: "Accuracy", color: "var(--neon-lime)" },
                      { v: "12", label: "Mocks done", color: "var(--neon-cyan)" },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="rounded-xl p-3 text-center border border-white/5"
                        style={{ background: "rgba(255,255,255,0.03)" }}
                      >
                        <div className="text-lg font-bold" style={{ color: stat.color }}>{stat.v}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quest card */}
                <div
                  className="rounded-xl border border-white/8 p-4"
                  style={{ background: "rgba(255,255,255,0.02)", backdropFilter: "blur(10px)" }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-muted-foreground">TODAY'S QUEST</span>
                    <span className="text-xs" style={{ color: "var(--neon-lime)" }}>+150 XP</span>
                  </div>
                  <div className="text-sm font-medium mb-2">Solve 50 questions in Mechanics</div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: "var(--neon-lime)" }}
                      initial={{ width: "0%" }}
                      whileInView={{ width: "68%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, delay: 0.3 }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1.5">34 / 50 complete</div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────────── */}
      <section id="testimonials" className="px-6 md:px-12 py-24 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Real grinders.{" "}
            <span style={{
              background: "linear-gradient(135deg, var(--neon-lime), var(--neon-cyan))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Real results.
            </span>
          </h2>
          <p className="text-muted-foreground">From Rookie to Beast — the system works.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4">
          {testimonials.map((t, i) => (
            <TestimonialCard key={i} {...t} index={i} />
          ))}
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────────── */}
      <section className="px-6 md:px-12 py-24 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl border border-white/10 p-12 md:p-20 overflow-hidden"
          style={{ background: "rgba(255,255,255,0.02)" }}
        >
          {/* Background */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at center, var(--neon-cyan)08, transparent 70%)" }}
          />
          <motion.div
            className="absolute inset-0"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
            style={{ background: "radial-gradient(ellipse at 20% 80%, var(--neon-violet)06, transparent 50%)" }}
          />

          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="inline-block mb-6"
            >
              <Zap className="h-12 w-12" style={{ color: "var(--neon-cyan)" }} />
            </motion.div>
            <h2 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
              The grind starts today.
            </h2>
            <p className="text-muted-foreground text-lg mb-10">
              JEE 2028 won't wait. 847 days. Make every one count.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/auth"
                className="group relative px-10 py-4 rounded-xl font-bold text-lg inline-flex items-center gap-2 overflow-hidden"
                style={{ color: "black" }}
              >
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(135deg, var(--neon-cyan), var(--neon-violet))", boxShadow: "0 0 30px var(--neon-cyan)50" }}
                />
                <span className="relative flex items-center gap-2">
                  <Rocket className="h-5 w-5" />
                  Enter Beast Mode
                </span>
              </Link>
            </div>
            <p className="mt-6 text-xs text-muted-foreground">
              Free forever · No credit card · Setup in 60 seconds
            </p>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="px-6 md:px-12 py-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="h-7 w-7 rounded-lg grid place-items-center"
              style={{ background: "linear-gradient(135deg, var(--neon-cyan), var(--neon-violet))" }}
            >
              <Zap className="h-4 w-4 text-black" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-sm">BeastPrep</span>
          </div>
          <p className="text-xs text-muted-foreground">Built for JEE 2028 aspirants · All rights reserved</p>
          <div className="flex gap-6 text-xs text-muted-foreground">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}