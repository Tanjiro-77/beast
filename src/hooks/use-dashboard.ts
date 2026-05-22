import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  xp: number;
  level: number;
  rank: string;
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
};

export type QuestionLog = {
  id: string;
  subject: string;
  chapter: string;
  source: string | null;
  difficulty: string | null;
  solved: number;
  correct: number;
  wrong: number;
  skipped: number;
  time_spent_min: number;
  notes: string | null;
  created_at: string;
};

export type MockTest = {
  id: string;
  name: string;
  score: number;
  max_score: number;
  accuracy: number;
  percentile: number | null;
  time_taken_min: number | null;
  mistakes: number;
  notes: string | null;
  taken_at: string;
};

export type Revision = {
  id: string;
  subject: string;
  chapter: string;
  topic: string | null;
  status: string;
  due_date: string | null;
  created_at: string;
};

export type Note = {
  id: string;
  title: string | null;
  content: string;
  color: string;
  pinned: boolean;
  category: string | null;
  created_at: string;
};

export type ChapterProgress = {
  id: string;
  subject: string;
  chapter: string;
  progress: number;
  mastery: number;
  is_weak: boolean;
};

export function useDashboardData() {
  const { user } = useAuth();
  const uid = user?.id;

  const profile = useQuery({
    queryKey: ["profile", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", uid!).maybeSingle();
      if (error) throw error;
      return data as Profile | null;
    },
  });

  const logs = useQuery({
    queryKey: ["question_logs", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("question_logs")
        .select("*")
        .eq("user_id", uid!)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as QuestionLog[];
    },
  });

  const mocks = useQuery({
    queryKey: ["mock_tests", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mock_tests")
        .select("*")
        .eq("user_id", uid!)
        .order("taken_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as MockTest[];
    },
  });

  const revisions = useQuery({
    queryKey: ["revisions", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("revisions")
        .select("*")
        .eq("user_id", uid!)
        .order("due_date", { ascending: true, nullsFirst: false });
      if (error) throw error;
      return (data ?? []) as Revision[];
    },
  });

  const notes = useQuery({
    queryKey: ["notes", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", uid!)
        .order("pinned", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Note[];
    },
  });

  const chapterProgress = useQuery({
    queryKey: ["chapter_progress", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data, error } = await supabase.from("chapter_progress").select("*").eq("user_id", uid!);
      if (error) throw error;
      return (data ?? []) as ChapterProgress[];
    },
  });

  return { profile, logs, mocks, revisions, notes, chapterProgress };
}

export function useInvalidateDashboard() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["profile"] });
    qc.invalidateQueries({ queryKey: ["question_logs"] });
    qc.invalidateQueries({ queryKey: ["mock_tests"] });
    qc.invalidateQueries({ queryKey: ["revisions"] });
    qc.invalidateQueries({ queryKey: ["notes"] });
    qc.invalidateQueries({ queryKey: ["chapter_progress"] });
  };
}

/** Award XP, update streak, log to xp_history */
export async function awardXP(userId: string, amount: number, reason: string) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("xp,current_streak,longest_streak,last_active_date")
    .eq("id", userId)
    .maybeSingle();

  const today = new Date().toISOString().slice(0, 10);
  let streak = profile?.current_streak ?? 0;
  let longest = profile?.longest_streak ?? 0;
  if (profile?.last_active_date !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    streak = profile?.last_active_date === yesterday ? streak + 1 : 1;
    if (streak > longest) longest = streak;
  }
  const newXp = (profile?.xp ?? 0) + amount;
  const level = Math.floor(newXp / 250) + 1;

  await supabase.from("profiles").update({
    xp: newXp,
    level,
    current_streak: streak,
    longest_streak: longest,
    last_active_date: today,
    updated_at: new Date().toISOString(),
  }).eq("id", userId);

  await supabase.from("xp_history").insert({ user_id: userId, amount, reason });

  toast.success(`+${amount} XP`, { description: reason, duration: 2000 });
}
