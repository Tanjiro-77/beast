
-- Auto-create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed default missions on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_missions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.missions (user_id, title, description, target_type, target_value, xp_reward, due_date) VALUES
    (NEW.id, 'Solve 30 questions today', 'Daily question grind', 'questions', 30, 75, CURRENT_DATE),
    (NEW.id, 'Study for 90 minutes', 'Deep focus block', 'minutes', 90, 60, CURRENT_DATE),
    (NEW.id, 'Take 1 mock test', 'Test your readiness', 'mocks', 1, 150, CURRENT_DATE + 7);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_missions ON auth.users;
CREATE TRIGGER on_auth_user_created_missions
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_missions();
