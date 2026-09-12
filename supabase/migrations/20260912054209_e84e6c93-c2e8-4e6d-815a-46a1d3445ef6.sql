CREATE OR REPLACE FUNCTION public.recalc_challenges(p_user uuid DEFAULT auth.uid())
 RETURNS void
 LANGUAGE plpgsql
 SECURITY INVOKER
 SET search_path TO 'public'
AS $function$
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

  INSERT INTO public.user_plant_items (user_id, plant_item_id)
  SELECT p_user, pi.id FROM public.plant_items pi
  WHERE pi.unlock_points <= (SELECT growth_points FROM public.profiles WHERE id = p_user)
  ON CONFLICT (user_id, plant_item_id) DO NOTHING;
END; $function$;

REVOKE EXECUTE ON FUNCTION public.recalc_challenges(uuid) FROM anon;

CREATE POLICY "own achievements insert"
ON public.user_achievements
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "own rewards insert"
ON public.user_rewards
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

GRANT INSERT ON public.user_achievements TO authenticated;
GRANT INSERT ON public.user_rewards TO authenticated;