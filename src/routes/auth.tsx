import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import {
  Zap,
  Loader2,
  Eye,
  EyeOff,
  ArrowRight,
  Mail,
  Lock,
  User,
  ChevronLeft,
  Sparkles,
  Shield,
  Trophy,
  Flame,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in · BeastPrep" },
      {
        name: "description",
        content:
          "Log in or create your BeastPrep account to enter your JEE command center.",
      },
    ],
  }),
  component: AuthPage,
});

// ── Floating orbs (lightweight, auth-specific) ─────────────────────────────
function AuthOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {[
        { x: "10%", y: "20%", color: "var(--neon-cyan)", size: 320, dur: 14 },
        {
          x: "85%",
          y: "60%",
          color: "var(--neon-violet)",
          size: 280,
          dur: 18,
        },
        { x: "50%", y: "85%", color: "var(--neon-pink)", size: 240, dur: 12 },
      ].map((o, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: o.x,
            top: o.y,
            width: o.size,
            height: o.size,
            transform: "translate(-50%,-50%)",
            background: `radial-gradient(circle, ${o.color}20 0%, transparent 70%)`,
            filter: "blur(50px)",
          }}
          animate={{ x: [0, 25, -15, 0], y: [0, -20, 18, 0] }}
          transition={{
            duration: o.dur,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 1.5,
          }}
        />
      ))}
      {/* subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />
    </div>
  );
}

// ── Stat pill (right panel) ────────────────────────────────────────────────
function StatPill({
  icon: Icon,
  label,
  value,
  color,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/4 px-4 py-3 backdrop-blur-sm"
    >
      <div
        className="h-8 w-8 rounded-lg grid place-items-center shrink-0"
        style={{ background: `${color}20` }}
      >
        <Icon className="h-4 w-4" style={{ color }} />
      </div>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm font-bold" style={{ color }}>
          {value}
        </div>
      </div>
    </motion.div>
  );
}

// ── Floating rank badge ────────────────────────────────────────────────────
function FloatingCard() {
  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className="w-full max-w-xs mx-auto"
    >
      {/* rank card */}
      <div
        className="rounded-2xl border border-white/10 p-5 mb-3"
        style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5">
              Current Rank
            </div>
            <div
              className="text-xl font-bold"
              style={{
                background:
                  "linear-gradient(135deg, var(--neon-violet), var(--neon-pink))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Dominator
            </div>
          </div>
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              filter: ["brightness(1)", "brightness(1.6)", "brightness(1)"],
            }}
            transition={{ duration: 1.8, repeat: Infinity }}
          >
            <Flame
              className="h-10 w-10"
              style={{ color: "var(--neon-amber)" }}
            />
          </motion.div>
        </div>

        {/* XP bar */}
        <div className="space-y-1.5 mb-4">
          <div className="flex justify-between text-[10px]">
            <span className="text-muted-foreground">XP to Beast</span>
            <span className="font-mono font-semibold">3,500 / 7,000</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, var(--neon-violet), var(--neon-pink))",
              }}
              initial={{ width: "0%" }}
              animate={{ width: "50%" }}
              transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* mini stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { v: "47", l: "Streak", c: "var(--neon-amber)" },
            { v: "94%", l: "Accuracy", c: "var(--neon-lime)" },
            { v: "12", l: "Mocks", c: "var(--neon-cyan)" },
          ].map((s) => (
            <div
              key={s.l}
              className="rounded-lg p-2.5 text-center border border-white/5"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              <div className="text-base font-bold" style={{ color: s.c }}>
                {s.v}
              </div>
              <div className="text-[9px] text-muted-foreground mt-0.5">
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* quest pill */}
      <div
        className="rounded-xl border border-white/8 p-3.5"
        style={{ background: "rgba(255,255,255,0.02)", backdropFilter: "blur(12px)" }}
      >
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-[9px] font-bold tracking-widest"
            style={{ color: "var(--neon-lime)" }}
          >
            TODAY'S QUEST
          </span>
          <span className="text-[10px] font-semibold" style={{ color: "var(--neon-lime)" }}>
            +150 XP
          </span>
        </div>
        <div className="text-xs font-medium mb-2">
          Solve 50 questions in Mechanics
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: "var(--neon-lime)" }}
            initial={{ width: "0%" }}
            animate={{ width: "68%" }}
            transition={{ duration: 1.2, delay: 1.2, ease: "easeOut" }}
          />
        </div>
        <div className="text-[9px] text-muted-foreground mt-1">
          34 / 50 complete
        </div>
      </div>
    </motion.div>
  );
}

// ── Input field ────────────────────────────────────────────────────────────
function InputField({
  icon: Icon,
  type,
  placeholder,
  value,
  onChange,
  required,
  minLength,
  autoComplete,
  rightEl,
}: {
  icon: React.ElementType;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
  rightEl?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <motion.div
      animate={{
        boxShadow: focused
          ? "0 0 0 1px var(--neon-cyan)60, 0 0 20px var(--neon-cyan)15"
          : "0 0 0 1px rgba(255,255,255,0.06)",
      }}
      transition={{ duration: 0.2 }}
      className="relative flex items-center rounded-xl overflow-hidden"
      style={{ background: "rgba(255,255,255,0.04)" }}
    >
      <div className="absolute left-4 pointer-events-none">
        <Icon
          className="h-4 w-4 transition-colors duration-200"
          style={{ color: focused ? "var(--neon-cyan)" : "var(--muted-foreground)" }}
        />
      </div>
      <input
        type={type}
        required={required}
        minLength={minLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full pl-11 pr-4 py-3.5 bg-transparent text-sm placeholder:text-muted-foreground/60 focus:outline-none"
      />
      {rightEl && <div className="pr-3">{rightEl}</div>}
    </motion.div>
  );
}

// ── Password field wrapper ─────────────────────────────────────────────────
function PasswordField({
  value,
  onChange,
  placeholder = "Password",
  autoComplete,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  const ToggleIcon = show ? EyeOff : Eye;

  return (
    <InputField
      icon={Lock}
      type={show ? "text" : "password"}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required
      minLength={6}
      autoComplete={autoComplete}
      rightEl={
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors"
        >
          <ToggleIcon className="h-4 w-4" />
        </button>
      }
    />
  );
}

// ── Strength meter ─────────────────────────────────────────────────────────
function StrengthMeter({ password }: { password: string }) {
  const strength = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();

  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = [
    "",
    "var(--neon-pink)",
    "var(--neon-amber)",
    "var(--neon-lime)",
    "var(--neon-cyan)",
  ];

  if (!password) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="space-y-1.5 overflow-hidden"
    >
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="h-1 flex-1 rounded-full"
            animate={{
              background: i <= strength ? colors[strength] : "rgba(255,255,255,0.06)",
            }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
      <div
        className="text-[10px] font-medium"
        style={{ color: colors[strength] }}
      >
        {labels[strength]}
      </div>
    </motion.div>
  );
}

// ── Main AuthPage ──────────────────────────────────────────────────────────
function AuthPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!authLoading && user) navigate({ to: "/dashboard" });
  }, [user, authLoading, navigate]);

  function switchMode(next: "signin" | "signup" | "forgot") {
    setMode(next);
    setPassword("");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Welcome back, beast. 🔥");
        navigate({ to: "/dashboard" });
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + "/dashboard",
            data: { display_name: name || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Account created. Entering Beast Mode…");
        navigate({ to: "/dashboard" });
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + "/auth",
        });
        if (error) throw error;
        toast.success("Reset link sent. Check your inbox.");
        switchMode("signin");
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const titles = {
    signin: { h: "Welcome back", sub: "Sign in to your command center." },
    signup: { h: "Start the grind", sub: "Create your account in 10 seconds." },
    forgot: { h: "Reset password", sub: "We'll email you a secure reset link." },
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "var(--background)" }}
    >
      <AuthOrbs />

      {/* ── Left panel: form ──────────────────────────────────────────────── */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-6 py-12 z-10 min-h-screen">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <Link to="/" className="flex items-center gap-2.5 group">
            <motion.div
              className="h-10 w-10 rounded-xl grid place-items-center"
              style={{
                background:
                  "linear-gradient(135deg, var(--neon-cyan), var(--neon-violet))",
                boxShadow: "0 0 24px var(--neon-cyan)50",
              }}
              whileHover={{ scale: 1.1, rotate: 8 }}
            >
              <Zap className="h-5 w-5 text-black" strokeWidth={2.5} />
            </motion.div>
            <span className="font-bold text-2xl tracking-tight">BeastPrep</span>
          </Link>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="w-full max-w-md"
        >
          <div
            className="rounded-2xl border border-white/8 p-8"
            style={{
              background: "rgba(255,255,255,0.03)",
              backdropFilter: "blur(24px)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
            }}
          >
            {/* Mode header */}
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="mb-7"
              >
                <h1 className="text-2xl font-bold tracking-tight mb-1">
                  {titles[mode].h}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {titles[mode].sub}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Form */}
            <form ref={formRef} onSubmit={submit} className="space-y-3">
              <AnimatePresence>
                {mode === "signup" && (
                  <motion.div
                    key="name-field"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <InputField
                      icon={User}
                      type="text"
                      placeholder="Display name"
                      value={name}
                      onChange={setName}
                      autoComplete="name"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <InputField
                icon={Mail}
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={setEmail}
                required
                autoComplete="email"
              />

              <AnimatePresence>
                {mode !== "forgot" && (
                  <motion.div
                    key="password-fields"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden space-y-3"
                  >
                    <PasswordField
                      value={password}
                      onChange={setPassword}
                      autoComplete={
                        mode === "signup" ? "new-password" : "current-password"
                      }
                    />
                    <AnimatePresence>
                      {mode === "signup" && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <StrengthMeter password={password} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loading}
                className="relative w-full py-3.5 rounded-xl font-bold text-sm overflow-hidden disabled:opacity-60 mt-1"
                style={{ color: "black" }}
                whileHover={{ scale: loading ? 1 : 1.01 }}
                whileTap={{ scale: loading ? 1 : 0.99 }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--neon-cyan), var(--neon-violet))",
                    boxShadow: "0 0 24px var(--neon-cyan)40",
                  }}
                />
                <span className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      {mode === "signin" && "Sign in"}
                      {mode === "signup" && "Create account"}
                      {mode === "forgot" && "Send reset link"}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </span>
              </motion.button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-white/6" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-white/6" />
            </div>

            {/* Mode switcher */}
            <AnimatePresence mode="wait">
              {mode === "signin" && (
                <motion.div
                  key="signin-links"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-between"
                >
                  <button
                    onClick={() => switchMode("forgot")}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Forgot password?
                  </button>
                  <button
                    onClick={() => switchMode("signup")}
                    className="text-xs font-semibold transition-colors inline-flex items-center gap-1"
                    style={{ color: "var(--neon-cyan)" }}
                  >
                    Create account
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </motion.div>
              )}
              {mode !== "signin" && (
                <motion.div
                  key="back-link"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center"
                >
                  <button
                    onClick={() => switchMode("signin")}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                  >
                    <ChevronLeft className="h-3 w-3" />
                    Back to sign in
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Below-card note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-5 flex items-center justify-center gap-5 text-[11px] text-muted-foreground"
          >
            {[
              { icon: Shield, text: "Free forever" },
              { icon: Sparkles, text: "No credit card" },
              { icon: Zap, text: "60-second setup" },
            ].map(({ icon: I, text }) => (
              <span key={text} className="flex items-center gap-1.5">
                <I className="h-3 w-3" style={{ color: "var(--neon-cyan)" }} />
                {text}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* ── Right panel: preview (hidden on mobile) ──────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="hidden lg:flex flex-col justify-center flex-1 relative px-12 py-12 max-w-xl border-l border-white/5"
        style={{ background: "rgba(255,255,255,0.01)" }}
      >
        {/* header copy */}
        <div className="mb-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4 border"
            style={{
              borderColor: "rgba(0,255,200,0.2)",
              color: "var(--neon-cyan)",
              background: "rgba(0,255,200,0.05)",
            }}
          >
            <Sparkles className="h-3 w-3" />
            JEE 2028 Command Center
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-3xl font-bold tracking-tight mb-3"
          >
            One dashboard.
            <br />
            <span
              style={{
                background:
                  "linear-gradient(135deg, var(--neon-cyan), var(--neon-violet))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Total command.
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-sm text-muted-foreground leading-relaxed max-w-sm"
          >
            Track every question, every mock, every streak — ranked up with XP
            like an esports pro. Built for the elite 1%.
          </motion.p>
        </div>

        {/* Floating card */}
        <div className="mb-8">
          <FloatingCard />
        </div>

        {/* Stats */}
        <div className="space-y-2.5 max-w-xs">
          <StatPill
            icon={Trophy}
            label="Active aspirants"
            value="10,247+"
            color="var(--neon-violet)"
            delay={0.7}
          />
          <StatPill
            icon={Flame}
            label="Questions tracked"
            value="2.4M+"
            color="var(--neon-amber)"
            delay={0.8}
          />
          <StatPill
            icon={Zap}
            label="Avg streak retention"
            value="98%"
            color="var(--neon-cyan)"
            delay={0.9}
          />
        </div>
      </motion.div>
    </div>
  );
}