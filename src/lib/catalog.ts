import type { PlantItem } from "./types";

export interface SystemChallengeTemplate {
  id: string;
  title: string;
  description: string;
  category_name?: string;
  category_hint: string[]; // hints like ["Restaurantes", "Salidas", "Ocio", "Compras"]
  challenge_type: "reduction" | "limit" | "saving";
  difficulty: "easy" | "medium" | "hard";
  reward_points: number;
  duration_days: number;
  target_amount?: number;
  is_system: true;
}

/**
 * Catálogo completo de la colección de PlantWallet.
 * Incluye plantas coloridas, macetas artesanales/tecnológicas, fondos ambientales y efectos visuales dinámicos.
 */
export const FULL_CATALOG: PlantItem[] = [
  // ==================== PLANTAS ====================
  {
    id: "pi_plant_classic",
    code: "plant_classic",
    name: "Monstera Clásica",
    description: "Tu fiel compañera de hojas verdes lustrosas que crece con tu ahorro.",
    item_type: "plant",
    rarity: "common",
    unlock_points: 0,
  },
  {
    id: "pi_plant_cactus",
    code: "plant_cactus",
    name: "Cactus Flor de Desierto",
    description: "Resistente y sereno, coronado con una vibrante flor magenta en plena floración.",
    item_type: "plant",
    rarity: "rare",
    unlock_points: 100,
  },
  {
    id: "pi_plant_succulent",
    code: "plant_succulent",
    name: "Suculenta Arcoíris",
    description: "Roseta compacta con suaves degradados pastel turquesa, lila y coral.",
    item_type: "plant",
    rarity: "rare",
    unlock_points: 100,
  },
  {
    id: "pi_plant_monstera",
    code: "plant_monstera",
    name: "Monstera Variegata Real",
    description: "Hojas gigantes de colección con cortes botánicos y delicados tonos crema.",
    item_type: "plant",
    rarity: "epic",
    unlock_points: 150,
  },
  {
    id: "pi_plant_bonsai",
    code: "plant_bonsai",
    name: "Bonsái Sakura Zen",
    description: "Milenario tronco esculpido en madera de cerezo con flores rosadas flotantes.",
    item_type: "plant",
    rarity: "epic",
    unlock_points: 150,
  },
  {
    id: "pi_plant_bamboo",
    code: "plant_bamboo",
    name: "Bambú de la Fortuna",
    description: "Cañas doradas de crecimiento vertical recto y cinta roja de abundancia.",
    item_type: "plant",
    rarity: "epic",
    unlock_points: 200,
  },
  {
    id: "pi_plant_carnivorous",
    code: "plant_carnivorous",
    name: "Planta Exótica Tropical",
    description: "Cáliz carmesí luminiscente con destellos de rocío y tonalidades de selva profunda.",
    item_type: "plant",
    rarity: "legendary",
    unlock_points: 200,
  },
  {
    id: "pi_plant_tree",
    code: "plant_tree",
    name: "Árbol de la Abundancia",
    description: "Copa dorada radiante con hojas que resplandecen como monedas de oro y esmeraldas.",
    item_type: "plant",
    rarity: "legendary",
    unlock_points: 300,
  },

  // ==================== MACETAS ====================
  {
    id: "pi_pot_ceramic",
    code: "pot_ceramic",
    name: "Cerámica Terracota",
    description: "Barro artesanal cocido a mano con un elegante ribete dorado superior.",
    item_type: "pot",
    rarity: "common",
    unlock_points: 0,
  },
  {
    id: "pi_pot_wood",
    code: "pot_wood",
    name: "Barril de Roble Noble",
    description: "Madera rústica con duelas talladas y cinchas de bronce brillante.",
    item_type: "pot",
    rarity: "common",
    unlock_points: 75,
  },
  {
    id: "pi_pot_minimal",
    code: "pot_minimal",
    name: "Nórdica Trípode",
    description: "Maceta blanca satinada moderna suspendida sobre trípode de madera clara.",
    item_type: "pot",
    rarity: "rare",
    unlock_points: 75,
  },
  {
    id: "pi_pot_metal",
    code: "pot_metal",
    name: "Latón Imperial Dorado",
    description: "Cilindro metálico pulido como espejo con destellos de oro reluciente.",
    item_type: "pot",
    rarity: "epic",
    unlock_points: 150,
  },
  {
    id: "pi_pot_crystal",
    code: "pot_crystal",
    name: "Terrario de Cuarzo",
    description: "Vidrio cristalino biselado que deja ver estratos de cuarzo blanco y tierra fértil.",
    item_type: "pot",
    rarity: "epic",
    unlock_points: 150,
  },
  {
    id: "pi_pot_cyber",
    code: "pot_cyber",
    name: "Maceta Cyberpunk Neón",
    description: "Estructura angular negra obsidiana con franjas LED holográficas cian y magenta.",
    item_type: "pot",
    rarity: "legendary",
    unlock_points: 200,
  },

  // ==================== FONDOS ====================
  {
    id: "pi_bg_room",
    code: "bg_room",
    name: "Habitación Cálida",
    description: "Luz de la mañana entrando por un ventanal suave y acogedor.",
    item_type: "background",
    rarity: "common",
    unlock_points: 0,
  },
  {
    id: "pi_bg_garden",
    code: "bg_garden",
    name: "Jardín Botánico",
    description: "Exuberantes hojas tropicales y brisa verde refrescante al fondo.",
    item_type: "background",
    rarity: "rare",
    unlock_points: 100,
  },
  {
    id: "pi_bg_sunrise",
    code: "bg_sunrise",
    name: "Amanecer Dorado",
    description: "Horizontes de luz celestial en degradados ámbar, melocotón y violeta.",
    item_type: "background",
    rarity: "epic",
    unlock_points: 150,
  },
  {
    id: "pi_bg_greenhouse",
    code: "bg_greenhouse",
    name: "Invernadero Victoriano",
    description: "Elegante cúpula de cristal con arcos de hierro forjado y vegetación difuminada.",
    item_type: "background",
    rarity: "epic",
    unlock_points: 150,
  },
  {
    id: "pi_bg_zen",
    code: "bg_zen",
    name: "Jardín Zen Atardecer",
    description: "Piedras sagradas en equilibrio, ondas de arena y siluetas de bambú místico.",
    item_type: "background",
    rarity: "legendary",
    unlock_points: 200,
  },
  {
    id: "pi_bg_night",
    code: "bg_night",
    name: "Noche Cósmica & Estrellas",
    description: "Cielo estrellado profundo con luna creciente plateada y nebulosa violeta.",
    item_type: "background",
    rarity: "legendary",
    unlock_points: 250,
  },

  // ==================== EFECTOS ====================
  {
    id: "pi_fx_none",
    code: "fx_none",
    name: "Sin Efecto",
    description: "Entorno clásico, sobrio y equilibrado.",
    item_type: "effect",
    rarity: "common",
    unlock_points: 0,
  },
  {
    id: "pi_fx_leaves",
    code: "fx_leaves",
    name: "Hojas en Brisa",
    description: "Pequeñas hojas esmeralda flotando en espirales ascendentes.",
    item_type: "effect",
    rarity: "common",
    unlock_points: 75,
  },
  {
    id: "pi_fx_petals",
    code: "fx_petals",
    name: "Lluvia de Pétalos Sakura",
    description: "Delicados pétalos rosados que caen en suave vaivén zen.",
    item_type: "effect",
    rarity: "rare",
    unlock_points: 100,
  },
  {
    id: "pi_fx_particles",
    code: "fx_particles",
    name: "Chispas de Oro",
    description: "Polvo de estrellas doradas y destellos mágicos que centellean.",
    item_type: "effect",
    rarity: "epic",
    unlock_points: 125,
  },
  {
    id: "pi_fx_fireflies",
    code: "fx_fireflies",
    name: "Luciérnagas Mágicas",
    description: "Orbes de luz cálida pulsante que iluminan la noche con encanto.",
    item_type: "effect",
    rarity: "epic",
    unlock_points: 150,
  },
  {
    id: "pi_fx_aura",
    code: "fx_aura",
    name: "Aura de Prosperidad",
    description: "Anillos concéntricos de energía mística esmeralda y cian en expansión.",
    item_type: "effect",
    rarity: "legendary",
    unlock_points: 200,
  },
];

/**
 * Retos sugeridos generales del sistema.
 * FIJOS, NO MODIFICABLES por el usuario.
 * Otorgan Growth Points calculados y distribuidos armónicamente con respecto
 * a los costos de los ítems de la colección (50, 75, 100, 150, 200 pts).
 */
export const SYSTEM_CHALLENGES: SystemChallengeTemplate[] = [
  {
    id: "sys_no_leisure",
    title: "🎮 1 mes sin gastos en Ocio y Salidas",
    description: "Elimina los gastos en bares, cine, ocio y salidas nocturnas durante 30 días para impulsar tu fondo de ahorro.",
    category_hint: ["Entretenimiento", "Ocio", "Salidas", "Bares", "Juegos"],
    challenge_type: "limit",
    difficulty: "medium",
    reward_points: 100,
    duration_days: 30,
    target_amount: 0,
    is_system: true,
  },
  {
    id: "sys_no_delivery",
    title: "🍔 Mes Cero Domicilios y Restaurantes",
    description: "Cocina en casa y prepara tus comidas. No incurras en compras de apps de delivery ni restaurantes.",
    category_hint: ["Restaurantes", "Comida", "Domicilios", "Alimentación"],
    challenge_type: "limit",
    difficulty: "medium",
    reward_points: 100,
    duration_days: 30,
    target_amount: 0,
    is_system: true,
  },
  {
    id: "sys_impulse_detox",
    title: "🛍️ 15 días detox de compras impulsivas",
    description: "Pausa total en ropa, calzado, tecnología y compras no esenciales durante 15 días.",
    category_hint: ["Compras", "Ropa", "Tecnología", "Otros"],
    challenge_type: "limit",
    difficulty: "easy",
    reward_points: 75,
    duration_days: 15,
    target_amount: 0,
    is_system: true,
  },
  {
    id: "sys_savings_rate",
    title: "🌱 Cosecha de Ahorro: 20% en débito",
    description: "Cierra el mes ahorrando al menos el 20% de tus ingresos líquidos sin tocar tu saldo de reserva.",
    category_hint: [],
    challenge_type: "saving",
    difficulty: "hard",
    reward_points: 150,
    duration_days: 30,
    is_system: true,
  },
  {
    id: "sys_transport_control",
    title: "🚗 Control de Movilidad y Taxis",
    description: "Optimizemos desplazamientos: usa transporte público o camina y mantén tus taxis al mínimo este mes.",
    category_hint: ["Transporte", "Combustible", "Taxis", "Movilidad"],
    challenge_type: "limit",
    difficulty: "easy",
    reward_points: 75,
    duration_days: 30,
    is_system: true,
  },
  {
    id: "sys_reserve_fund",
    title: "🏦 Fondo de Reserva: Balance en Verde",
    description: "Mantén tu balance de débito en positivo durante todo el mes sin registrar sobregiros ni saldos en rojo.",
    category_hint: [],
    challenge_type: "saving",
    difficulty: "medium",
    reward_points: 100,
    duration_days: 30,
    is_system: true,
  },
  {
    id: "sys_subscriptions_audit",
    title: "📱 Auditoría de Suscripciones Innecesarias",
    description: "Identifica y cancela servicios recurrentes que no uses con frecuencia para liberar flujo de caja.",
    category_hint: ["Suscripciones", "Telefonía", "Internet"],
    challenge_type: "limit",
    difficulty: "easy",
    reward_points: 50,
    duration_days: 30,
    is_system: true,
  },
  {
    id: "sys_mastery",
    title: "💎 Maestría Financiera: Mes Impecable",
    description: "Cumple con todas tus metas mensuales establecidas sin exceder el límite en ninguna categoría.",
    category_hint: [],
    challenge_type: "saving",
    difficulty: "hard",
    reward_points: 200,
    duration_days: 30,
    is_system: true,
  },
];
