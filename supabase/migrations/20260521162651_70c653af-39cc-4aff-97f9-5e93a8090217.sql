
-- ============ SUBJECTS ============
CREATE TABLE public.subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text NOT NULL DEFAULT 'neon-cyan',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view subjects" ON public.subjects FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);
CREATE POLICY "insert own subject" ON public.subjects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update own subject" ON public.subjects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete own subject" ON public.subjects FOR DELETE USING (auth.uid() = user_id);

-- ============ CHAPTERS ============
CREATE TABLE public.chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  name text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view chapters" ON public.chapters FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);
CREATE POLICY "insert own chapter" ON public.chapters FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update own chapter" ON public.chapters FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete own chapter" ON public.chapters FOR DELETE USING (auth.uid() = user_id);

-- ============ SOURCES ============
CREATE TABLE public.sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  sort_order int NOT NULL DEFAULT 0
);
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view sources" ON public.sources FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);
CREATE POLICY "insert own source" ON public.sources FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update own source" ON public.sources FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete own source" ON public.sources FOR DELETE USING (auth.uid() = user_id);

-- ============ DIFFICULTIES ============
CREATE TABLE public.difficulties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  level int NOT NULL DEFAULT 1
);
ALTER TABLE public.difficulties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view difficulties" ON public.difficulties FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);
CREATE POLICY "insert own difficulty" ON public.difficulties FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update own difficulty" ON public.difficulties FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete own difficulty" ON public.difficulties FOR DELETE USING (auth.uid() = user_id);

-- ============ RANKS (global, read-only via RLS) ============
CREATE TABLE public.ranks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  min_xp int NOT NULL,
  color text NOT NULL DEFAULT 'neon-cyan',
  sort_order int NOT NULL DEFAULT 0
);
ALTER TABLE public.ranks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view ranks" ON public.ranks FOR SELECT USING (true);

-- ============ ACHIEVEMENT DEFINITIONS (global, read-only via RLS) ============
CREATE TABLE public.achievement_defs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  icon text NOT NULL DEFAULT 'Trophy',
  xp_reward int NOT NULL DEFAULT 0,
  criteria jsonb
);
ALTER TABLE public.achievement_defs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view achievement defs" ON public.achievement_defs FOR SELECT USING (true);

-- ============ MISSIONS (per-user) ============
CREATE TABLE public.missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  target_type text NOT NULL DEFAULT 'questions',  -- questions | minutes | mocks | revisions
  target_value int NOT NULL DEFAULT 1,
  progress int NOT NULL DEFAULT 0,
  xp_reward int NOT NULL DEFAULT 50,
  due_date date,
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own missions select" ON public.missions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own missions insert" ON public.missions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own missions update" ON public.missions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own missions delete" ON public.missions FOR DELETE USING (auth.uid() = user_id);

-- ============ SEED: subjects ============
INSERT INTO public.subjects (name, color, sort_order) VALUES
  ('Physics', 'neon-cyan', 1),
  ('Chemistry', 'neon-violet', 2),
  ('Math', 'neon-pink', 3);

-- ============ SEED: chapters ============
DO $$
DECLARE
  phys_id uuid;
  chem_id uuid;
  math_id uuid;
BEGIN
  SELECT id INTO phys_id FROM public.subjects WHERE name='Physics' AND user_id IS NULL;
  SELECT id INTO chem_id FROM public.subjects WHERE name='Chemistry' AND user_id IS NULL;
  SELECT id INTO math_id FROM public.subjects WHERE name='Math' AND user_id IS NULL;

  INSERT INTO public.chapters (subject_id, name, sort_order) VALUES
    (phys_id,'Units & Measurement',1),(phys_id,'Kinematics',2),(phys_id,'Laws of Motion',3),
    (phys_id,'Work, Energy & Power',4),(phys_id,'Rotational Motion',5),(phys_id,'Gravitation',6),
    (phys_id,'Properties of Solids & Liquids',7),(phys_id,'Thermodynamics',8),(phys_id,'Kinetic Theory of Gases',9),
    (phys_id,'Oscillations & Waves',10),(phys_id,'Electrostatics',11),(phys_id,'Current Electricity',12),
    (phys_id,'Magnetic Effects of Current',13),(phys_id,'EMI & AC',14),(phys_id,'Electromagnetic Waves',15),
    (phys_id,'Optics',16),(phys_id,'Modern Physics',17),(phys_id,'Semiconductors',18),
    (chem_id,'Atomic Structure',1),(chem_id,'Chemical Bonding',2),(chem_id,'States of Matter',3),
    (chem_id,'Thermodynamics (Chem)',4),(chem_id,'Equilibrium',5),(chem_id,'Redox & Electrochem',6),
    (chem_id,'Chemical Kinetics',7),(chem_id,'Solutions',8),(chem_id,'p-Block Elements',9),
    (chem_id,'d & f-Block Elements',10),(chem_id,'Coordination Compounds',11),(chem_id,'GOC',12),
    (chem_id,'Hydrocarbons',13),(chem_id,'Haloalkanes & Haloarenes',14),(chem_id,'Alcohols, Phenols & Ethers',15),
    (chem_id,'Aldehydes, Ketones & Acids',16),(chem_id,'Amines',17),(chem_id,'Biomolecules & Polymers',18),
    (math_id,'Sets, Relations & Functions',1),(math_id,'Complex Numbers',2),(math_id,'Quadratic Equations',3),
    (math_id,'Sequences & Series',4),(math_id,'Permutations & Combinations',5),(math_id,'Binomial Theorem',6),
    (math_id,'Matrices & Determinants',7),(math_id,'Trigonometry',8),(math_id,'Inverse Trigonometry',9),
    (math_id,'Straight Lines',10),(math_id,'Conic Sections',11),(math_id,'3D Geometry',12),
    (math_id,'Vectors',13),(math_id,'Limits & Continuity',14),(math_id,'Differentiation',15),
    (math_id,'Applications of Derivatives',16),(math_id,'Integrals',17),(math_id,'Differential Equations',18),
    (math_id,'Probability & Statistics',19);
END $$;

-- ============ SEED: sources ============
INSERT INTO public.sources (name, sort_order) VALUES
  ('NCERT',1),('Coaching',2),('PYQ',3),('Mock',4),('Custom',5);

-- ============ SEED: difficulties ============
INSERT INTO public.difficulties (name, level) VALUES
  ('Easy',1),('Medium',2),('Hard',3),('Insane',4);

-- ============ SEED: ranks ============
INSERT INTO public.ranks (name, min_xp, color, sort_order) VALUES
  ('Rookie',0,'neon-cyan',1),
  ('Solver',500,'neon-lime',2),
  ('Grinder',1500,'neon-amber',3),
  ('Dominator',3500,'neon-violet',4),
  ('Beast',7000,'neon-pink',5);

-- ============ SEED: achievement defs ============
INSERT INTO public.achievement_defs (code, title, description, icon, xp_reward, criteria) VALUES
  ('first_question','First Blood','Log your very first question','Zap',25,'{"type":"questions","value":1}'),
  ('hundred_questions','Centurion','Solve 100 questions total','Target',100,'{"type":"questions","value":100}'),
  ('thousand_questions','Question Slayer','Solve 1000 questions total','Trophy',500,'{"type":"questions","value":1000}'),
  ('streak_7','Week Warrior','Maintain a 7-day streak','Flame',150,'{"type":"streak","value":7}'),
  ('streak_30','Iron Discipline','Maintain a 30-day streak','Flame',500,'{"type":"streak","value":30}'),
  ('first_mock','Mock Rookie','Complete your first mock test','ClipboardCheck',50,'{"type":"mocks","value":1}'),
  ('mock_90','Sharp Shooter','Score 90%+ in any mock','TrendingUp',200,'{"type":"mock_accuracy","value":90}'),
  ('beast_rank','Beast Mode','Reach Beast rank (7000 XP)','Trophy',1000,'{"type":"xp","value":7000}');
