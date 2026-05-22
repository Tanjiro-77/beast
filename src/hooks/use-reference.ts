import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export type Subject = { id: string; name: string; color: string; user_id: string | null; sort_order: number };
export type Chapter = { id: string; subject_id: string; name: string; user_id: string | null; sort_order: number };
export type Source = { id: string; name: string; user_id: string | null };
export type Difficulty = { id: string; name: string; level: number; user_id: string | null };
export type Rank = { id: string; name: string; min_xp: number; color: string; sort_order: number };
export type AchievementDef = {
  id: string; code: string; title: string; description: string | null;
  icon: string; xp_reward: number; criteria: { type: string; value: number } | null;
};
export type Mission = {
  id: string; user_id: string; title: string; description: string | null;
  target_type: string; target_value: number; progress: number;
  xp_reward: number; due_date: string | null; completed: boolean; created_at: string;
};

export function useSubjects() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["subjects", user?.id ?? "anon"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subjects").select("*").order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Subject[];
    },
  });
}

export function useChapters() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["chapters", user?.id ?? "anon"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chapters").select("*").order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Chapter[];
    },
  });
}

export function useSources() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["sources", user?.id ?? "anon"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("sources").select("*").order("sort_order");
      if (error) throw error;
      return (data ?? []) as Source[];
    },
  });
}

export function useDifficulties() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["difficulties", user?.id ?? "anon"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("difficulties").select("*").order("level");
      if (error) throw error;
      return (data ?? []) as Difficulty[];
    },
  });
}

export function useRanks() {
  return useQuery({
    queryKey: ["ranks"],
    queryFn: async () => {
      const { data, error } = await supabase.from("ranks").select("*").order("min_xp");
      if (error) throw error;
      return (data ?? []) as Rank[];
    },
  });
}

export function useAchievementDefs() {
  return useQuery({
    queryKey: ["achievement_defs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("achievement_defs").select("*");
      if (error) throw error;
      return (data ?? []) as AchievementDef[];
    },
  });
}

export function useMissions() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["missions", user?.id ?? "anon"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("missions")
        .select("*")
        .eq("user_id", user!.id)
        .order("due_date", { ascending: true, nullsFirst: false });
      if (error) throw error;
      return (data ?? []) as Mission[];
    },
  });
}

export function useInvalidateReference() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["subjects"] });
    qc.invalidateQueries({ queryKey: ["chapters"] });
    qc.invalidateQueries({ queryKey: ["sources"] });
    qc.invalidateQueries({ queryKey: ["difficulties"] });
    qc.invalidateQueries({ queryKey: ["missions"] });
  };
}

/* ============ XP / RANK helpers (operate on DB rows) ============ */
export function rankFor(xp: number, ranks: Rank[]): Rank | null {
  if (!ranks.length) return null;
  let current = ranks[0];
  for (const r of ranks) if (xp >= r.min_xp) current = r;
  return current;
}

export function nextRankFor(xp: number, ranks: Rank[]): Rank | null {
  return ranks.find((r) => r.min_xp > xp) ?? null;
}

export function levelFor(xp: number) {
  return Math.floor(xp / 250) + 1;
}

export function levelProgressFor(xp: number) {
  const into = xp % 250;
  return { current: into, max: 250, pct: (into / 250) * 100 };
}
