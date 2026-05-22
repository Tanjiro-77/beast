import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { AuthProvider } from "@/hooks/use-auth";
import { Toaster } from "@/components/ui/sonner";
import { Zap, Home, RotateCcw, AlertTriangle, Ghost } from "lucide-react";
import { motion } from "framer-motion";

import appCss from "../styles.css?url";

// ── Animated background orbs ─────────────────────────────────────────────────
function ErrorOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {[
        { x: "15%", y: "25%", color: "var(--neon-pink)", size: 300, dur: 12 },
        { x: "80%", y: "70%", color: "var(--neon-violet)", size: 250, dur: 15 },
        { x: "50%", y: "50%", color: "var(--neon-cyan)", size: 200, dur: 10 },
      ].map((o, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: o.x,
            top: o.y,
            width: o.size,
            height: o.size,
            transform: "translate(-50%, -50%)",
            background: `radial-gradient(circle, ${o.color}18 0%, transparent 70%)`,
            filter: "blur(60px)",
          }}
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -25, 15, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{
            duration: o.dur,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 1.2,
          }}
        />
      ))}
      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  );
}

// ── 404 Not Found ────────────────────────────────────────────────────────────
function NotFoundComponent() {
  return (
    <div
      className="flex min-h-screen items-center justify-center px-6 relative overflow-hidden"
      style={{ background: "var(--background)" }}
    >
      <ErrorOrbs />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-lg text-center relative z-10"
      >
        {/* Icon */}
        <motion.div
          animate={{
            rotate: [0, 10, -10, 10, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="inline-flex mb-6"
        >
          <div
            className="h-20 w-20 rounded-2xl grid place-items-center"
            style={{
              background: "linear-gradient(135deg, var(--neon-pink), var(--neon-violet))",
              boxShadow: "0 0 40px var(--neon-pink)40",
            }}
          >
            <Ghost className="h-10 w-10 text-black" strokeWidth={2} />
          </div>
        </motion.div>

        {/* Heading */}
        <h1 className="text-7xl md:text-8xl font-bold tracking-tighter mb-4">
          <span
            style={{
              background: "linear-gradient(135deg, var(--neon-pink), var(--neon-violet))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            404
          </span>
        </h1>

        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
          Lost in the void
        </h2>

        <p className="text-muted-foreground leading-relaxed mb-8 max-w-md mx-auto">
          This page went full ghost mode. Either it never existed, or it's out
          grinding questions somewhere else.
        </p>

        {/* CTA */}
        <Link
          to="/"
          className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-black transition-all hover:scale-105 active:scale-95"
          style={{
            background: "linear-gradient(135deg, var(--neon-cyan), var(--neon-violet))",
            boxShadow: "0 0 24px var(--neon-cyan)40",
          }}
        >
          <Home className="h-4 w-4" />
          Back to Command Center
        </Link>

        {/* Sub-text */}
        <p className="mt-6 text-xs text-muted-foreground">
          Lost? Try the dashboard instead.{" "}
          <Link
            to="/dashboard"
            className="underline hover:text-foreground transition-colors"
          >
            Go to Dashboard
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

// ── Error boundary ───────────────────────────────────────────────────────────
function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div
      className="flex min-h-screen items-center justify-center px-6 relative overflow-hidden"
      style={{ background: "var(--background)" }}
    >
      <ErrorOrbs />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-lg text-center relative z-10"
      >
        {/* Icon */}
        <motion.div
          animate={{
            rotate: [0, -5, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="inline-flex mb-6"
        >
          <div
            className="h-20 w-20 rounded-2xl grid place-items-center"
            style={{
              background: "linear-gradient(135deg, var(--neon-amber), var(--neon-pink))",
              boxShadow: "0 0 40px var(--neon-amber)40",
            }}
          >
            <AlertTriangle className="h-10 w-10 text-black" strokeWidth={2} />
          </div>
        </motion.div>

        {/* Heading */}
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
          Something broke the streak
        </h1>

        <p className="text-muted-foreground leading-relaxed mb-2 max-w-md mx-auto">
          An error crashed this page. No XP lost — just refresh and keep
          grinding.
        </p>

        {/* Error details (collapsible) */}
        <details className="mt-4 mb-8 text-left">
          <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors inline-flex items-center gap-1">
            <span>Show error details</span>
          </summary>
          <pre
            className="mt-2 p-3 rounded-lg text-[10px] text-left overflow-x-auto border border-white/10"
            style={{ background: "rgba(255,255,255,0.02)" }}
          >
            {error.message}
          </pre>
        </details>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-black transition-all hover:scale-105 active:scale-95"
            style={{
              background: "linear-gradient(135deg, var(--neon-cyan), var(--neon-violet))",
              boxShadow: "0 0 24px var(--neon-cyan)40",
            }}
          >
            <RotateCcw className="h-4 w-4" />
            Try again
          </button>

          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all"
          >
            <Home className="h-4 w-4" />
            Go home
          </a>
        </div>

        {/* Help text */}
        <p className="mt-6 text-xs text-muted-foreground">
          Still broken? Clear cache or contact support.
        </p>
      </motion.div>
    </div>
  );
}

// ── Root route config ────────────────────────────────────────────────────────
export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "BeastPrep — JEE 2028 Command Center" },
      {
        name: "description",
        content:
          "Gamified JEE 2028 prep tracker. Log questions, mocks, revisions. Rank up to Beast.",
      },
      { name: "author", content: "BeastPrep" },
      { property: "og:title", content: "BeastPrep — JEE 2028 Command Center" },
      {
        property: "og:description",
        content: "Train like an esports pro. Track every question. Rank up to Beast.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#0a0a0e" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%2300ffcc'/><path d='M30 50 L50 30 L70 50 L50 70 Z' fill='%23000'/></svg>",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

// ── Shell (HTML wrapper) ─────────────────────────────────────────────────────
function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

// ── Root component ───────────────────────────────────────────────────────────
function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Outlet />
        <Toaster
          position="top-center"
          theme="dark"
          richColors
          toastOptions={{
            style: {
              background: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "var(--foreground)",
            },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}