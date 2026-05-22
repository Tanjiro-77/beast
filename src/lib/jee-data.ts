// Legacy helpers kept ONLY for files not yet migrated. Prefer @/hooks/use-reference.
// All reference data (subjects, chapters, sources, difficulties, ranks, achievements)
// now lives in the database. Import hooks from "@/hooks/use-reference" instead.

export const SUBJECT_COLOR_FALLBACK: Record<string, string> = {
  Physics: "neon-cyan",
  Chemistry: "neon-violet",
  Math: "neon-pink",
};
