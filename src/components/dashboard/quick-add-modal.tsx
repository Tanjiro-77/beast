import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useInvalidateDashboard, awardXP } from "@/hooks/use-dashboard";
import { useSubjects, useChapters, useSources, useDifficulties, useInvalidateReference, type Subject } from "@/hooks/use-reference";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { X, BookOpen, ClipboardCheck, Repeat, Clock, StickyNote, Plus, Minus, Check, Sparkles, Zap } from "lucide-react";
import { toast } from "sonner";

type Tab = "questions" | "mock" | "revision" | "hours" | "note" | "mission";

export function QuickAddModal({ open, onClose, initialTab = "questions" }: { open: boolean; onClose: () => void; initialTab?: Tab }) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const { user } = useAuth();
  const invalidate = useInvalidateDashboard();

  if (!user) return null;

  const tabs: { id: Tab; label: string; icon: typeof BookOpen; color: string }[] = [
    { id: "questions", label: "Questions", icon: BookOpen, color: "neon-cyan" },
    { id: "mock", label: "Mock Test", icon: ClipboardCheck, color: "neon-pink" },
    { id: "revision", label: "Revision", icon: Repeat, color: "neon-amber" },
    { id: "hours", label: "Study Time", icon: Clock, color: "neon-lime" },
    { id: "mission", label: "Mission", icon: Plus, color: "neon-violet" },
    { id: "note", label: "Note", icon: StickyNote, color: "neon-pink" },
  ];

  const activeTab = tabs.find((t) => t.id === tab);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md grid place-items-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 10, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="glass-strong rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
            style={{
              boxShadow: `0 0 60px ${activeTab ? `var(--${activeTab.color})20` : "rgba(0,255,200,0.2)"}`,
            }}
          >
            {/* Animated background accent */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <motion.div
                className="absolute inset-0 opacity-20"
                style={{
                  background: `radial-gradient(circle at 30% 20%, ${activeTab ? `var(--${activeTab.color})` : "var(--neon-cyan)"}15, transparent 60%)`,
                }}
                animate={{ opacity: [0.15, 0.25, 0.15] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </div>

            <div className="relative p-6 overflow-y-auto scrollbar-thin max-h-[90vh]">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="h-10 w-10 rounded-xl grid place-items-center"
                    style={{
                      background: `linear-gradient(135deg, ${activeTab ? `var(--${activeTab.color})` : "var(--neon-cyan)"}, var(--neon-violet))`,
                      boxShadow: `0 0 20px ${activeTab ? `var(--${activeTab.color})40` : "var(--neon-cyan)40"}`,
                    }}
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 0.5 }}
                    key={tab}
                  >
                    {activeTab && <activeTab.icon className="h-5 w-5 text-black" strokeWidth={2.5} />}
                  </motion.div>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight">Quick Add</h2>
                    <p className="text-xs text-muted-foreground">Log your progress in seconds</p>
                  </div>
                </div>
                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  className="h-9 w-9 grid place-items-center rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>

              {/* Tab selector */}
              <div className="glass rounded-xl p-1.5 mb-6 overflow-x-auto scrollbar-thin">
                <div className="flex gap-1">
                  {tabs.map((t, i) => {
                    const isActive = tab === t.id;
                    return (
                      <motion.button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`relative flex-1 min-w-fit flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${isActive ? "text-black" : "text-muted-foreground hover:text-foreground"
                          }`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute inset-0 rounded-lg"
                            style={{
                              background: `linear-gradient(135deg, var(--${t.color}), var(--neon-violet))`,
                              boxShadow: `0 0 20px var(--${t.color})40`,
                            }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          />
                        )}
                        <t.icon className="h-3.5 w-3.5 relative z-10" />
                        <span className="relative z-10">{t.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Forms */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {tab === "questions" && <QuestionsForm onSaved={() => { invalidate(); onClose(); }} userId={user.id} />}
                  {tab === "mock" && <MockForm onSaved={() => { invalidate(); onClose(); }} userId={user.id} />}
                  {tab === "revision" && <RevisionForm onSaved={() => { invalidate(); onClose(); }} userId={user.id} />}
                  {tab === "hours" && <HoursForm onSaved={() => { invalidate(); onClose(); }} userId={user.id} />}
                  {tab === "mission" && <MissionForm onSaved={() => { invalidate(); onClose(); }} userId={user.id} />}
                  {tab === "note" && <NoteForm onSaved={() => { invalidate(); onClose(); }} userId={user.id} />}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Enhanced counter with smooth animations
function Counter({ label, value, onChange, color = "neon-cyan" }: { label: string; value: number; onChange: (v: number) => void; color?: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className="glass-strong rounded-xl p-4 text-center cursor-default"
    >
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-semibold">
        {label}
      </div>
      <div className="flex items-center justify-center gap-2">
        <motion.button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="h-8 w-8 grid place-items-center rounded-lg glass hover:bg-white/10 transition-colors"
        >
          <Minus className="h-3.5 w-3.5" />
        </motion.button>

        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Math.max(0, parseInt(e.target.value) || 0))}
          className="w-16 bg-transparent text-center text-2xl font-bold focus:outline-none tabular-nums"
          style={{ color: `var(--${color})` }}
        />

        <motion.button
          type="button"
          onClick={() => onChange(value + 1)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="h-8 w-8 grid place-items-center rounded-lg glass hover:bg-white/10 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
        </motion.button>
      </div>
    </motion.div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-muted-foreground mb-2 block uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-4 py-3 rounded-xl glass border border-white/5 focus:border-neon-cyan/50 focus:outline-none text-sm transition-all hover:border-white/10";

/* ============ Subject + chapter picker ============ */
function useSubjectChapterPicker(initialSubjectId?: string) {
  const subjects = useSubjects();
  const chapters = useChapters();
  const invalidateRef = useInvalidateReference();

  const subjectList = subjects.data ?? [];
  const [subjectId, setSubjectId] = useState<string>(initialSubjectId ?? "");

  useEffect(() => {
    if (!subjectId && subjectList.length) setSubjectId(subjectList[0].id);
  }, [subjectList, subjectId]);

  const chapterList = useMemo(
    () => (chapters.data ?? []).filter((c) => c.subject_id === subjectId),
    [chapters.data, subjectId]
  );

  const [chapterId, setChapterId] = useState<string>("");
  useEffect(() => {
    if (chapterList.length && !chapterList.find((c) => c.id === chapterId)) {
      setChapterId(chapterList[0].id);
    }
  }, [chapterList, chapterId]);

  const subject = subjectList.find((s) => s.id === subjectId) ?? null;
  const chapter = chapterList.find((c) => c.id === chapterId) ?? null;

  async function addChapter(name: string, userId: string) {
    if (!subject || !name.trim()) return;
    const { data, error } = await supabase
      .from("chapters")
      .insert({ user_id: userId, subject_id: subject.id, name: name.trim(), sort_order: 999 })
      .select()
      .single();
    if (error) { toast.error(error.message); return; }
    invalidateRef();
    if (data) setChapterId(data.id);
    toast.success(`✓ Added "${name}" to ${subject.name}`);
  }

  async function addSubject(name: string, userId: string) {
    if (!name.trim()) return;
    const { data, error } = await supabase
      .from("subjects")
      .insert({ user_id: userId, name: name.trim(), color: "neon-cyan", sort_order: 999 })
      .select()
      .single();
    if (error) { toast.error(error.message); return; }
    invalidateRef();
    if (data) setSubjectId(data.id);
    toast.success(`✓ Added subject: ${name}`);
  }

  return {
    subjects: subjectList,
    chapters: chapterList,
    subject,
    chapter,
    subjectId,
    setSubjectId,
    chapterId,
    setChapterId,
    addChapter,
    addSubject,
    loading: subjects.isLoading || chapters.isLoading,
  };
}

function SubjectChapterPicker({ picker, userId }: { picker: ReturnType<typeof useSubjectChapterPicker>; userId: string }) {
  const [adding, setAdding] = useState<"chapter" | "subject" | null>(null);
  const [newName, setNewName] = useState("");

  async function submitAdd(e: React.FormEvent) {
    e.preventDefault();
    if (adding === "chapter") await picker.addChapter(newName, userId);
    if (adding === "subject") await picker.addSubject(newName, userId);
    setNewName("");
    setAdding(null);
  }

  if (picker.loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground glass rounded-xl p-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="h-4 w-4 text-neon-cyan" />
        </motion.div>
        Loading subjects…
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Subject">
          <select
            value={picker.subjectId}
            onChange={(e) => picker.setSubjectId(e.target.value)}
            className={inputCls}
          >
            {picker.subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Chapter">
          <select
            value={picker.chapterId}
            onChange={(e) => picker.setChapterId(e.target.value)}
            className={inputCls}
          >
            {picker.chapters.length === 0 && <option value="">No chapters yet</option>}
            {picker.chapters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="flex gap-3 text-xs">
        <motion.button
          type="button"
          onClick={() => {
            setAdding("chapter");
            setNewName("");
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="text-neon-cyan hover:text-neon-cyan/80 font-semibold flex items-center gap-1"
        >
          <Plus className="h-3 w-3" />
          Custom chapter
        </motion.button>
        <span className="text-muted-foreground">·</span>
        <motion.button
          type="button"
          onClick={() => {
            setAdding("subject");
            setNewName("");
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="text-neon-violet hover:text-neon-violet/80 font-semibold flex items-center gap-1"
        >
          <Plus className="h-3 w-3" />
          Custom subject
        </motion.button>
      </div>

      <AnimatePresence>
        {adding && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onSubmit={submitAdd}
            className="flex gap-2 overflow-hidden"
          >
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={
                adding === "chapter"
                  ? `New chapter in ${picker.subject?.name ?? ""}`
                  : "New subject name"
              }
              className={inputCls + " flex-1"}
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-5 py-3 rounded-xl bg-hero-gradient text-black text-xs font-bold glow-cyan"
            >
              Add
            </motion.button>
            <motion.button
              type="button"
              onClick={() => setAdding(null)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-3 rounded-xl glass text-xs font-semibold hover:bg-white/10"
            >
              Cancel
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============ Forms ============ */
function QuestionsForm({ onSaved, userId }: { onSaved: () => void; userId: string }) {
  const picker = useSubjectChapterPicker();
  const sources = useSources();
  const difficulties = useDifficulties();
  const [sourceId, setSourceId] = useState<string>("");
  const [difficultyId, setDifficultyId] = useState<string>("");
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [skipped, setSkipped] = useState(0);
  const [time, setTime] = useState(15);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (sources.data?.length && !sourceId) setSourceId(sources.data[0].id);
  }, [sources.data, sourceId]);

  useEffect(() => {
    if (difficulties.data?.length && !difficultyId)
      setDifficultyId(difficulties.data[1]?.id ?? difficulties.data[0].id);
  }, [difficulties.data, difficultyId]);

  const totalSolved = correct + wrong + skipped;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!picker.subject || !picker.chapter) {
      toast.error("Pick a chapter first");
      return;
    }
    setSaving(true);
    const solved = correct + wrong + skipped;
    if (solved === 0) {
      toast.error("Log at least one question");
      setSaving(false);
      return;
    }

    const source = sources.data?.find((s) => s.id === sourceId)?.name ?? null;
    const difficulty = difficulties.data?.find((d) => d.id === difficultyId)?.name ?? null;

    const { error } = await supabase.from("question_logs").insert({
      user_id: userId,
      subject: picker.subject.name,
      chapter: picker.chapter.name,
      source,
      difficulty,
      solved,
      correct,
      wrong,
      skipped,
      time_spent_min: time,
    });

    if (error) {
      toast.error(error.message);
      setSaving(false);
      return;
    }

    const { data: existing } = await supabase
      .from("chapter_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("subject", picker.subject.name)
      .eq("chapter", picker.chapter.name)
      .maybeSingle();

    const newProg = Math.min(100, (existing?.progress ?? 0) + Math.ceil(solved / 2));
    const accuracy = solved ? correct / solved : 0;
    const newMastery = Math.min(100, Math.round((existing?.mastery ?? 0) * 0.7 + accuracy * 100 * 0.3));

    await supabase.from("chapter_progress").upsert(
      {
        user_id: userId,
        subject: picker.subject.name,
        chapter: picker.chapter.name,
        progress: newProg,
        mastery: newMastery,
        is_weak: accuracy < 0.5,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,subject,chapter" }
    );

    await bumpMissions(userId, { questions: solved, minutes: time });

    const xp = solved * 5 + correct * 3;
    await awardXP(userId, xp, `${solved} ${picker.subject.name} questions`);

    toast.success(`✓ Logged ${solved} questions · +${xp} XP`);
    onSaved();
    setSaving(false);
  }

  return (
    <form onSubmit={save} className="space-y-5">
      <SubjectChapterPicker picker={picker} userId={userId} />

      <div className="grid grid-cols-3 gap-3">
        <Counter label="Correct" value={correct} onChange={setCorrect} color="neon-lime" />
        <Counter label="Wrong" value={wrong} onChange={setWrong} color="neon-red" />
        <Counter label="Skipped" value={skipped} onChange={setSkipped} color="neon-amber" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Source">
          <div className="flex flex-wrap gap-1.5">
            {(sources.data ?? []).map((s) => {
              const isActive = sourceId === s.id;
              return (
                <motion.button
                  type="button"
                  key={s.id}
                  onClick={() => setSourceId(s.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isActive ? "bg-hero-gradient text-black glow-cyan" : "glass hover:bg-white/10"
                    }`}
                >
                  {s.name}
                </motion.button>
              );
            })}
          </div>
        </Field>

        <Field label="Difficulty">
          <div className="flex flex-wrap gap-1.5">
            {(difficulties.data ?? []).map((d) => {
              const isActive = difficultyId === d.id;
              return (
                <motion.button
                  type="button"
                  key={d.id}
                  onClick={() => setDifficultyId(d.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isActive ? "bg-hero-gradient text-black glow-cyan" : "glass hover:bg-white/10"
                    }`}
                >
                  {d.name}
                </motion.button>
              );
            })}
          </div>
        </Field>
      </div>

      <Field label={`Time spent: ${time} min`}>
        <div className="space-y-2">
          <input
            type="range"
            min={1}
            max={180}
            value={time}
            onChange={(e) => setTime(parseInt(e.target.value))}
            className="w-full accent-neon-cyan h-2 rounded-full"
            style={{
              background: `linear-gradient(to right, var(--neon-cyan) 0%, var(--neon-cyan) ${(time / 180) * 100}%, rgba(255,255,255,0.1) ${(time / 180) * 100}%, rgba(255,255,255,0.1) 100%)`,
            }}
          />
          <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
            <span>1 min</span>
            <span className="text-neon-cyan font-bold">{time} min</span>
            <span>180 min</span>
          </div>
        </div>
      </Field>

      <motion.button
        type="submit"
        disabled={saving || totalSolved === 0}
        whileHover={{ scale: saving ? 1 : 1.02 }}
        whileTap={{ scale: saving ? 1 : 0.98 }}
        className="w-full py-4 rounded-xl bg-hero-gradient text-black font-bold disabled:opacity-50 disabled:cursor-not-allowed glow-cyan flex items-center justify-center gap-2 text-base"
      >
        {saving ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="h-4 w-4" />
            </motion.div>
            Saving…
          </>
        ) : (
          <>
            <Zap className="h-4 w-4" />
            Log {totalSolved} question{totalSolved !== 1 ? "s" : ""}
          </>
        )}
      </motion.button>
    </form>
  );
}

function MockForm({ onSaved, userId }: { onSaved: () => void; userId: string }) {
  const [name, setName] = useState("");
  const [score, setScore] = useState(0);
  const [maxScore, setMaxScore] = useState(300);
  const [percentile, setPercentile] = useState<number | "">("");
  const [time, setTime] = useState(180);
  const [mistakes, setMistakes] = useState(0);
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const accuracy = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    const { error } = await supabase.from("mock_tests").insert({
      user_id: userId,
      name,
      score,
      max_score: maxScore,
      accuracy,
      percentile: percentile === "" ? null : percentile,
      time_taken_min: time,
      mistakes,
    });
    if (error) {
      toast.error(error.message);
      setSaving(false);
      return;
    }
    await bumpMissions(userId, { mocks: 1 });
    await awardXP(userId, 50, `Mock: ${name}`);
    toast.success(`✓ Mock test logged · +50 XP`);
    onSaved();
    setSaving(false);
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <Field label="Test name">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="JEE Main Mock 12"
          className={inputCls}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Score">
          <input
            type="number"
            required
            value={score}
            onChange={(e) => setScore(parseFloat(e.target.value) || 0)}
            className={inputCls}
          />
        </Field>
        <Field label="Out of">
          <input
            type="number"
            required
            value={maxScore}
            onChange={(e) => setMaxScore(parseFloat(e.target.value) || 1)}
            className={inputCls}
          />
        </Field>
        <Field label="Percentile">
          <input
            type="number"
            step="0.01"
            value={percentile}
            onChange={(e) => setPercentile(e.target.value === "" ? "" : parseFloat(e.target.value))}
            placeholder="99.42"
            className={inputCls}
          />
        </Field>
        <Field label="Time (min)">
          <input
            type="number"
            value={time}
            onChange={(e) => setTime(parseInt(e.target.value) || 0)}
            className={inputCls}
          />
        </Field>
      </div>

      <Field label="Silly mistakes">
        <input
          type="number"
          value={mistakes}
          onChange={(e) => setMistakes(parseInt(e.target.value) || 0)}
          className={inputCls}
        />
      </Field>

      <motion.button
        type="submit"
        disabled={saving}
        whileHover={{ scale: saving ? 1 : 1.02 }}
        whileTap={{ scale: saving ? 1 : 0.98 }}
        className="w-full py-4 rounded-xl bg-hero-gradient text-black font-bold disabled:opacity-50 glow-cyan flex items-center justify-center gap-2"
      >
        {saving ? (
          <>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
              <Sparkles className="h-4 w-4" />
            </motion.div>
            Saving…
          </>
        ) : (
          <>
            <ClipboardCheck className="h-4 w-4" />
            Log Mock Test
          </>
        )}
      </motion.button>
    </form>
  );
}

function RevisionForm({ onSaved, userId }: { onSaved: () => void; userId: string }) {
  const picker = useSubjectChapterPicker();
  const [topic, setTopic] = useState("");
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 86400000).toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!picker.subject || !picker.chapter) {
      toast.error("Pick a chapter first");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("revisions").insert({
      user_id: userId,
      subject: picker.subject.name,
      chapter: picker.chapter.name,
      topic,
      due_date: dueDate,
      status: "pending",
    });
    if (error) {
      toast.error(error.message);
      setSaving(false);
      return;
    }
    toast.success("✓ Added to revision queue");
    onSaved();
    setSaving(false);
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <SubjectChapterPicker picker={picker} userId={userId} />

      <Field label="Topic (optional)">
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Gauss Law applications"
          className={inputCls}
        />
      </Field>

      <Field label="Due date">
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className={inputCls}
        />
      </Field>

      <motion.button
        type="submit"
        disabled={saving}
        whileHover={{ scale: saving ? 1 : 1.02 }}
        whileTap={{ scale: saving ? 1 : 0.98 }}
        className="w-full py-4 rounded-xl bg-hero-gradient text-black font-bold disabled:opacity-50 glow-cyan flex items-center justify-center gap-2"
      >
        {saving ? (
          <>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
              <Sparkles className="h-4 w-4" />
            </motion.div>
            Saving…
          </>
        ) : (
          <>
            <Repeat className="h-4 w-4" />
            Schedule Revision
          </>
        )}
      </motion.button>
    </form>
  );
}

function HoursForm({ onSaved, userId }: { onSaved: () => void; userId: string }) {
  const picker = useSubjectChapterPicker();
  const [minutes, setMinutes] = useState(60);
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!picker.subject || !picker.chapter) {
      toast.error("Pick a chapter first");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("question_logs").insert({
      user_id: userId,
      subject: picker.subject.name,
      chapter: picker.chapter.name,
      time_spent_min: minutes,
      source: "Study",
      notes: "Study session",
    });
    if (error) {
      toast.error(error.message);
      setSaving(false);
      return;
    }
    await bumpMissions(userId, { minutes });
    const xp = Math.round(minutes / 2);
    await awardXP(userId, xp, `${minutes} min ${picker.subject.name}`);
    toast.success(`✓ Logged ${minutes} min · +${xp} XP`);
    onSaved();
    setSaving(false);
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <SubjectChapterPicker picker={picker} userId={userId} />

      <Field label={`Study time: ${minutes} minutes`}>
        <div className="space-y-3">
          <input
            type="range"
            min={5}
            max={300}
            step={5}
            value={minutes}
            onChange={(e) => setMinutes(parseInt(e.target.value))}
            className="w-full accent-neon-lime h-2 rounded-full"
            style={{
              background: `linear-gradient(to right, var(--neon-lime) 0%, var(--neon-lime) ${(minutes / 300) * 100}%, rgba(255,255,255,0.1) ${(minutes / 300) * 100}%, rgba(255,255,255,0.1) 100%)`,
            }}
          />
          <div className="flex justify-between text-xs text-muted-foreground font-mono">
            <span>5 min</span>
            <span className="text-neon-lime font-bold">{minutes} min</span>
            <span>5 hrs</span>
          </div>
        </div>
      </Field>

      <motion.button
        type="submit"
        disabled={saving}
        whileHover={{ scale: saving ? 1 : 1.02 }}
        whileTap={{ scale: saving ? 1 : 0.98 }}
        className="w-full py-4 rounded-xl bg-hero-gradient text-black font-bold disabled:opacity-50 glow-cyan flex items-center justify-center gap-2"
      >
        {saving ? (
          <>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
              <Sparkles className="h-4 w-4" />
            </motion.div>
            Saving…
          </>
        ) : (
          <>
            <Clock className="h-4 w-4" />
            Log Study Time
          </>
        )}
      </motion.button>
    </form>
  );
}

function MissionForm({ onSaved, userId }: { onSaved: () => void; userId: string }) {
  const [title, setTitle] = useState("");
  const [targetType, setTargetType] = useState<"questions" | "minutes" | "mocks" | "revisions">("questions");
  const [targetValue, setTargetValue] = useState(30);
  const [xpReward, setXpReward] = useState(75);
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("missions").insert({
      user_id: userId,
      title,
      target_type: targetType,
      target_value: targetValue,
      xp_reward: xpReward,
      due_date: dueDate,
    });
    if (error) {
      toast.error(error.message);
      setSaving(false);
      return;
    }
    toast.success("✓ Mission created");
    onSaved();
    setSaving(false);
  }

  const targets = [
    { id: "questions", label: "Questions" },
    { id: "minutes", label: "Minutes" },
    { id: "mocks", label: "Mocks" },
    { id: "revisions", label: "Revisions" },
  ] as const;

  return (
    <form onSubmit={save} className="space-y-4">
      <Field label="Mission title">
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Crush 100 organic chem questions"
          className={inputCls}
        />
      </Field>

      <Field label="Target type">
        <div className="flex flex-wrap gap-1.5">
          {targets.map((t) => {
            const isActive = targetType === t.id;
            return (
              <motion.button
                type="button"
                key={t.id}
                onClick={() => setTargetType(t.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${isActive ? "bg-hero-gradient text-black glow-cyan" : "glass hover:bg-white/10"
                  }`}
              >
                {t.label}
              </motion.button>
            );
          })}
        </div>
      </Field>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Target">
          <input
            type="number"
            min={1}
            value={targetValue}
            onChange={(e) => setTargetValue(parseInt(e.target.value) || 1)}
            className={inputCls}
          />
        </Field>
        <Field label="XP reward">
          <input
            type="number"
            min={0}
            value={xpReward}
            onChange={(e) => setXpReward(parseInt(e.target.value) || 0)}
            className={inputCls}
          />
        </Field>
        <Field label="Due">
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={inputCls}
          />
        </Field>
      </div>

      <motion.button
        type="submit"
        disabled={saving}
        whileHover={{ scale: saving ? 1 : 1.02 }}
        whileTap={{ scale: saving ? 1 : 0.98 }}
        className="w-full py-4 rounded-xl bg-hero-gradient text-black font-bold disabled:opacity-50 glow-cyan flex items-center justify-center gap-2"
      >
        {saving ? (
          <>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
              <Sparkles className="h-4 w-4" />
            </motion.div>
            Saving…
          </>
        ) : (
          <>
            <Plus className="h-4 w-4" />
            Create Mission
          </>
        )}
      </motion.button>
    </form>
  );
}

function NoteForm({ onSaved, userId }: { onSaved: () => void; userId: string }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [color, setColor] = useState("neon-cyan");
  const [category, setCategory] = useState("formula");
  const [saving, setSaving] = useState(false);

  const colors = ["neon-cyan", "neon-violet", "neon-pink", "neon-lime", "neon-amber"];
  const cats = ["formula", "mistake", "reminder", "concept"];

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("notes").insert({
      user_id: userId,
      title,
      content,
      color,
      category,
    });
    if (error) {
      toast.error(error.message);
      setSaving(false);
      return;
    }
    toast.success("✓ Note saved");
    onSaved();
    setSaving(false);
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <Field label="Title">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Lorentz force formula"
          className={inputCls}
        />
      </Field>

      <Field label="Content">
        <textarea
          required
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className={inputCls}
          placeholder="Write your note here…"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Category">
          <div className="flex flex-wrap gap-1.5">
            {cats.map((c) => {
              const isActive = category === c;
              return (
                <motion.button
                  type="button"
                  key={c}
                  onClick={() => setCategory(c)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${isActive ? "bg-hero-gradient text-black glow-cyan" : "glass hover:bg-white/10"
                    }`}
                >
                  {c}
                </motion.button>
              );
            })}
          </div>
        </Field>

        <Field label="Color">
          <div className="flex gap-2">
            {colors.map((c) => {
              const isActive = color === c;
              return (
                <motion.button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  className={`h-9 w-9 rounded-lg border-2 transition-all ${isActive ? "border-white scale-110" : "border-transparent"
                    }`}
                  style={{
                    background: `var(--${c})`,
                    boxShadow: isActive ? `0 0 20px var(--${c})60` : "none",
                  }}
                />
              );
            })}
          </div>
        </Field>
      </div>

      <motion.button
        type="submit"
        disabled={saving}
        whileHover={{ scale: saving ? 1 : 1.02 }}
        whileTap={{ scale: saving ? 1 : 0.98 }}
        className="w-full py-4 rounded-xl bg-hero-gradient text-black font-bold disabled:opacity-50 glow-cyan flex items-center justify-center gap-2"
      >
        {saving ? (
          <>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
              <Sparkles className="h-4 w-4" />
            </motion.div>
            Saving…
          </>
        ) : (
          <>
            <StickyNote className="h-4 w-4" />
            Save Note
          </>
        )}
      </motion.button>
    </form>
  );
}

/* ============ Mission auto-bump on log ============ */
async function bumpMissions(
  userId: string,
  delta: { questions?: number; minutes?: number; mocks?: number; revisions?: number }
) {
  const { data: ms } = await supabase
    .from("missions")
    .select("*")
    .eq("user_id", userId)
    .eq("completed", false);
  if (!ms?.length) return;

  for (const m of ms) {
    const inc = delta[m.target_type as keyof typeof delta] ?? 0;
    if (!inc) continue;
    const newProgress = Math.min(m.target_value, (m.progress ?? 0) + inc);
    const completed = newProgress >= m.target_value;
    await supabase
      .from("missions")
      .update({ progress: newProgress, completed })
      .eq("id", m.id);
    if (completed) {
      await awardXP(userId, m.xp_reward, `Mission · ${m.title}`);
    }
  }
}

export type { Subject };