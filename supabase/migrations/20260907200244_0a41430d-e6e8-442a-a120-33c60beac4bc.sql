
-- ============ helpers ============
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============ profiles ============
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  avatar_url text,
  base_currency text NOT NULL DEFAULT 'COP',
  locale text NOT NULL DEFAULT 'es',
  theme text NOT NULL DEFAULT 'system',
  date_format text NOT NULL DEFAULT 'dd/MM/yyyy',
  week_start smallint NOT NULL DEFAULT 1,
  growth_points integer NOT NULL DEFAULT 0,
  notifications_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ categories ============
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name text NOT NULL,
  emoji text NOT NULL DEFAULT '📦',
  type text NOT NULL CHECK (type IN ('income','expense')),
  color text,
  description text,
  is_essential boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own categories" ON public.categories FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX categories_user_idx ON public.categories(user_id, type);
CREATE TRIGGER categories_updated BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ transactions ============
CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('income','expense')),
  amount numeric(14,2) NOT NULL CHECK (amount > 0),
  currency text NOT NULL DEFAULT 'COP',
  description text,
  notes text,
  transaction_date date NOT NULL DEFAULT current_date,
  payment_method text,
  is_recurring boolean NOT NULL DEFAULT false,
  recurring_rule text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO authenticated;
GRANT ALL ON public.transactions TO service_role;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own transactions" ON public.transactions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX transactions_user_date_idx ON public.transactions(user_id, transaction_date DESC);
CREATE INDEX transactions_user_cat_idx ON public.transactions(user_id, category_id);
CREATE TRIGGER transactions_updated BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ budgets ============
CREATE TABLE public.budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  category_id uuid REFERENCES public.categories(id) ON DELETE CASCADE,
  amount numeric(14,2) NOT NULL CHECK (amount > 0),
  currency text NOT NULL DEFAULT 'COP',
  period text NOT NULL DEFAULT 'monthly',
  start_date date NOT NULL DEFAULT date_trunc('month', current_date)::date,
  end_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.budgets TO authenticated;
GRANT ALL ON public.budgets TO service_role;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own budgets" ON public.budgets FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE UNIQUE INDEX budgets_unique_cat ON public.budgets(user_id, category_id, period);
CREATE TRIGGER budgets_updated BEFORE UPDATE ON public.budgets FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ financial goals ============
CREATE TABLE public.financial_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name text NOT NULL,
  target_amount numeric(14,2) NOT NULL CHECK (target_amount > 0),
  current_amount numeric(14,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'COP',
  target_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.financial_goals TO authenticated;
GRANT ALL ON public.financial_goals TO service_role;
ALTER TABLE public.financial_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own goals" ON public.financial_goals FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER goals_updated BEFORE UPDATE ON public.financial_goals FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ plant items catalog ============
CREATE TABLE public.plant_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  item_type text NOT NULL CHECK (item_type IN ('plant','pot','background','effect')),
  rarity text NOT NULL DEFAULT 'common',
  unlock_points integer NOT NULL DEFAULT 0,
  seasonal text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.plant_items TO authenticated;
GRANT ALL ON public.plant_items TO service_role;
ALTER TABLE public.plant_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "catalog readable" ON public.plant_items FOR SELECT TO authenticated USING (true);

CREATE TABLE public.user_plant_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  plant_item_id uuid NOT NULL REFERENCES public.plant_items(id) ON DELETE CASCADE,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  equipped boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, plant_item_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_plant_items TO authenticated;
GRANT ALL ON public.user_plant_items TO service_role;
ALTER TABLE public.user_plant_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own plant items" ON public.user_plant_items FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ challenges ============
CREATE TABLE public.user_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  challenge_type text NOT NULL CHECK (challenge_type IN ('reduction','limit','saving','trend')),
  difficulty text NOT NULL DEFAULT 'easy' CHECK (difficulty IN ('easy','medium','hard')),
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  target_amount numeric(14,2) NOT NULL CHECK (target_amount > 0),
  baseline_amount numeric(14,2),
  currency text NOT NULL DEFAULT 'COP',
  start_date date NOT NULL DEFAULT current_date,
  end_date date NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','failed','abandoned')),
  progress_amount numeric(14,2) NOT NULL DEFAULT 0,
  reward_points integer NOT NULL DEFAULT 50,
  reward_claimed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_challenges TO authenticated;
GRANT ALL ON public.user_challenges TO service_role;
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own challenges" ON public.user_challenges FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER challenges_updated BEFORE UPDATE ON public.user_challenges FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.user_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  source text NOT NULL,
  points integer NOT NULL DEFAULT 0,
  challenge_id uuid REFERENCES public.user_challenges(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.user_rewards TO authenticated;
GRANT ALL ON public.user_rewards TO service_role;
ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own rewards" ON public.user_rewards FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.financial_streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  streak_type text NOT NULL DEFAULT 'tracking',
  current_streak integer NOT NULL DEFAULT 0,
  best_streak integer NOT NULL DEFAULT 0,
  last_activity_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, streak_type)
);
GRANT SELECT, INSERT, UPDATE ON public.financial_streaks TO authenticated;
GRANT ALL ON public.financial_streaks TO service_role;
ALTER TABLE public.financial_streaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own streaks" ON public.financial_streaks FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER streaks_updated BEFORE UPDATE ON public.financial_streaks FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  emoji text NOT NULL DEFAULT '🏆',
  reward_points integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.achievements TO authenticated;
GRANT ALL ON public.achievements TO service_role;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "achievements readable" ON public.achievements FOR SELECT TO authenticated USING (true);

CREATE TABLE public.user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  achievement_id uuid NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, achievement_id)
);
GRANT SELECT ON public.user_achievements TO authenticated;
GRANT ALL ON public.user_achievements TO service_role;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own achievements" ON public.user_achievements FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ============ catalog seed ============
INSERT INTO public.plant_items (code,name,description,item_type,rarity,unlock_points) VALUES
 ('plant_classic','Planta clásica','Tu compañera de siempre.','plant','common',0),
 ('plant_cactus','Cactus','Resistente y sereno.','plant','common',150),
 ('plant_monstera','Monstera','Hojas amplias y elegantes.','plant','rare',300),
 ('plant_bonsai','Bonsái','Paciencia y constancia.','plant','rare',500),
 ('plant_bamboo','Bambú','Crecimiento firme.','plant','epic',800),
 ('plant_tree','Árbol joven','Raíces profundas.','plant','epic',1200),
 ('pot_ceramic','Maceta cerámica','Acabado mate.','pot','common',0),
 ('pot_wood','Maceta de madera','Cálida y natural.','pot','common',100),
 ('pot_minimal','Maceta minimalista','Líneas puras.','pot','rare',250),
 ('pot_metal','Maceta metálica','Reflejos suaves.','pot','epic',600),
 ('bg_room','Habitación minimalista','Luz neutra.','background','common',0),
 ('bg_garden','Jardín','Verde alrededor.','background','common',200),
 ('bg_sunrise','Amanecer','Tonos cálidos.','background','rare',400),
 ('bg_night','Noche','Calma azulada.','background','epic',700),
 ('fx_leaves','Hojas al viento','Movimiento sutil.','effect','common',120),
 ('fx_particles','Partículas','Brillo discreto.','effect','rare',350),
 ('fx_fireflies','Luciérnagas','Luz suave nocturna.','effect','epic',900);

INSERT INTO public.achievements (code,name,description,emoji,reward_points) VALUES
 ('first_move','Primer paso','Registraste tu primer movimiento.','🌱',25),
 ('moves_100','Constancia','100 movimientos registrados.','📒',150),
 ('challenges_10','Coleccionista de retos','Completaste 10 retos.','🏆',300),
 ('health_70','Raíces sanas','Alcanzaste 70 de salud financiera.','🌿',100),
 ('health_90','Frondoso','Alcanzaste 90 de salud financiera.','🌳',250);

-- ============ new user bootstrap ============
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)))
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.categories (user_id,name,emoji,type,is_essential) VALUES
   (NEW.id,'Vivienda','🏠','expense',true),
   (NEW.id,'Alimentación','🍔','expense',true),
   (NEW.id,'Mercado','🛒','expense',true),
   (NEW.id,'Transporte','🚗','expense',true),
   (NEW.id,'Combustible','⛽','expense',true),
   (NEW.id,'Servicios','💡','expense',true),
   (NEW.id,'Telefonía','📱','expense',true),
   (NEW.id,'Internet','🌐','expense',true),
   (NEW.id,'Educación','🎓','expense',true),
   (NEW.id,'Salud','💊','expense',true),
   (NEW.id,'Deudas','💳','expense',true),
   (NEW.id,'Mascotas','🐶','expense',false),
   (NEW.id,'Ropa','👕','expense',false),
   (NEW.id,'Entretenimiento','🎮','expense',false),
   (NEW.id,'Restaurantes','🍽️','expense',false),
   (NEW.id,'Compras','🛍️','expense',false),
   (NEW.id,'Viajes','✈️','expense',false),
   (NEW.id,'Suscripciones','📺','expense',false),
   (NEW.id,'Regalos','🎁','expense',false),
   (NEW.id,'Otros','📦','expense',false),
   (NEW.id,'Salario','💼','income',true),
   (NEW.id,'Freelance','💻','income',false),
   (NEW.id,'Rendimientos','🏦','income',false),
   (NEW.id,'Inversión','💰','income',false),
   (NEW.id,'Regalo','🎁','income',false),
   (NEW.id,'Reembolso','🧾','income',false),
   (NEW.id,'Venta','📦','income',false),
   (NEW.id,'Otros ingresos','➕','income',false);

  INSERT INTO public.user_plant_items (user_id, plant_item_id, equipped)
  SELECT NEW.id, id, true FROM public.plant_items WHERE unlock_points = 0;

  INSERT INTO public.financial_streaks (user_id, streak_type) VALUES (NEW.id,'tracking')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ challenge engine (server side) ============
CREATE OR REPLACE FUNCTION public.recalc_challenges(p_user uuid DEFAULT auth.uid())
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c record; v_spent numeric; v_saved numeric; v_new_status text; v_pts int;
BEGIN
  IF p_user IS NULL OR p_user <> auth.uid() THEN RAISE EXCEPTION 'not allowed'; END IF;

  FOR c IN SELECT * FROM public.user_challenges WHERE user_id = p_user AND status = 'active' LOOP
    IF c.challenge_type = 'saving' THEN
      SELECT COALESCE(SUM(CASE WHEN type='income' THEN amount ELSE -amount END),0) INTO v_saved
      FROM public.transactions
      WHERE user_id = p_user AND transaction_date BETWEEN c.start_date AND c.end_date;
      UPDATE public.user_challenges SET progress_amount = GREATEST(v_saved,0) WHERE id = c.id;
      v_new_status := CASE WHEN v_saved >= c.target_amount THEN 'completed'
                           WHEN current_date > c.end_date THEN 'failed' ELSE 'active' END;
    ELSE
      SELECT COALESCE(SUM(amount),0) INTO v_spent
      FROM public.transactions
      WHERE user_id = p_user AND type='expense'
        AND (c.category_id IS NULL OR category_id = c.category_id)
        AND transaction_date BETWEEN c.start_date AND c.end_date;
      UPDATE public.user_challenges SET progress_amount = v_spent WHERE id = c.id;
      v_new_status := CASE WHEN v_spent > c.target_amount THEN 'failed'
                           WHEN current_date > c.end_date THEN 'completed' ELSE 'active' END;
    END IF;

    IF v_new_status <> 'active' THEN
      UPDATE public.user_challenges
        SET status = v_new_status,
            completed_at = CASE WHEN v_new_status='completed' THEN now() ELSE NULL END,
            reward_claimed = (v_new_status='completed')
        WHERE id = c.id;
      IF v_new_status = 'completed' THEN
        v_pts := c.reward_points;
        INSERT INTO public.user_rewards (user_id, source, points, challenge_id)
        VALUES (p_user, 'challenge', v_pts, c.id);
        UPDATE public.profiles SET growth_points = growth_points + v_pts WHERE id = p_user;
      END IF;
    END IF;
  END LOOP;

  -- unlock cosmetics by points
  INSERT INTO public.user_plant_items (user_id, plant_item_id)
  SELECT p_user, pi.id FROM public.plant_items pi
  WHERE pi.unlock_points <= (SELECT growth_points FROM public.profiles WHERE id = p_user)
  ON CONFLICT (user_id, plant_item_id) DO NOTHING;
END; $$;
GRANT EXECUTE ON FUNCTION public.recalc_challenges(uuid) TO authenticated;
