export type TxType = "income" | "expense";

export interface Category {
  id: string;
  user_id: string;
  name: string;
  emoji: string;
  type: TxType;
  color: string | null;
  description: string | null;
  is_essential: boolean;
  is_active: boolean;
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string | null;
  type: TxType;
  amount: number;
  currency: string;
  description: string | null;
  notes: string | null;
  transaction_date: string;
  payment_method: string | null;
  is_recurring: boolean;
  recurring_rule: string | null;
  created_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string | null;
  amount: number;
  currency: string;
  period: string;
  start_date: string;
}

export interface Profile {
  id: string;
  name: string;
  avatar_url: string | null;
  base_currency: string;
  theme: string;
  date_format: string;
  week_start: number;
  growth_points: number;
  notifications_enabled: boolean;
}

export type ChallengeStatus = "active" | "completed" | "failed" | "abandoned";
export type Difficulty = "easy" | "medium" | "hard";

export interface UserChallenge {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  challenge_type: "reduction" | "limit" | "saving" | "trend";
  difficulty: Difficulty;
  category_id: string | null;
  target_amount: number;
  baseline_amount: number | null;
  currency: string;
  start_date: string;
  end_date: string;
  status: ChallengeStatus;
  progress_amount: number;
  reward_points: number;
  completed_at: string | null;
}

export interface PlantItem {
  id: string;
  code: string;
  name: string;
  description: string | null;
  item_type: "plant" | "pot" | "background" | "effect";
  rarity: string;
  unlock_points: number;
}

export interface UserPlantItem {
  id: string;
  plant_item_id: string;
  equipped: boolean;
  unlocked_at: string;
}
