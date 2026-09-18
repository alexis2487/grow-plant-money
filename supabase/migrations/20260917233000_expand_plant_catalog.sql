-- Actualización y expansión del catálogo de plantas, macetas, fondos y efectos
INSERT INTO public.plant_items (code, name, description, item_type, rarity, unlock_points)
VALUES
  ('plant_classic', 'Monstera Clásica', 'Tu fiel compañera de hojas verdes lustrosas que crece con tu ahorro.', 'plant', 'common', 0),
  ('plant_cactus', 'Cactus Flor de Desierto', 'Resistente y sereno, coronado con una vibrante flor magenta en plena floración.', 'plant', 'rare', 100),
  ('plant_succulent', 'Suculenta Arcoíris', 'Roseta compacta con suaves degradados pastel turquesa, lila y coral.', 'plant', 'rare', 100),
  ('plant_monstera', 'Monstera Variegata Real', 'Hojas gigantes de colección con cortes botánicos y delicados tonos crema.', 'plant', 'epic', 150),
  ('plant_bonsai', 'Bonsái Sakura Zen', 'Milenario tronco esculpido en madera de cerezo con flores rosadas flotantes.', 'plant', 'epic', 150),
  ('plant_bamboo', 'Bambú de la Fortuna', 'Cañas doradas de crecimiento vertical recto y cinta roja de abundancia.', 'plant', 'epic', 200),
  ('plant_carnivorous', 'Planta Exótica Tropical', 'Cáliz carmesí luminiscente con destellos de rocío y tonalidades de selva profunda.', 'plant', 'legendary', 200),
  ('plant_tree', 'Árbol de la Abundancia', 'Copa dorada radiante con hojas que resplandecen como monedas de oro y esmeraldas.', 'plant', 'legendary', 300),

  ('pot_ceramic', 'Cerámica Terracota', 'Barro artesanal cocido a mano con un elegante ribete dorado superior.', 'pot', 'common', 0),
  ('pot_wood', 'Barril de Roble Noble', 'Madera rústica con duelas talladas y cinchas de bronce brillante.', 'pot', 'common', 75),
  ('pot_minimal', 'Nórdica Trípode', 'Maceta blanca satinada moderna suspendida sobre trípode de madera clara.', 'pot', 'rare', 75),
  ('pot_metal', 'Latón Imperial Dorado', 'Cilindro metálico pulido como espejo con destellos de oro reluciente.', 'pot', 'epic', 150),
  ('pot_crystal', 'Terrario de Cuarzo', 'Vidrio cristalino biselado que deja ver estratos de cuarzo blanco y tierra fértil.', 'pot', 'epic', 150),
  ('pot_cyber', 'Maceta Cyberpunk Neón', 'Estructura angular negra obsidiana con franjas LED holográficas cian y magenta.', 'pot', 'legendary', 200),

  ('bg_room', 'Habitación Cálida', 'Luz de la mañana entrando por un ventanal suave y acogedor.', 'background', 'common', 0),
  ('bg_garden', 'Jardín Botánico', 'Exuberantes hojas tropicales y brisa verde refrescante al fondo.', 'background', 'rare', 100),
  ('bg_sunrise', 'Amanecer Dorado', 'Horizontes de luz celestial en degradados ámbar, melocotón y violeta.', 'background', 'epic', 150),
  ('bg_greenhouse', 'Invernadero Victoriano', 'Elegante cúpula de cristal con arcos de hierro forjado y vegetación difuminada.', 'background', 'epic', 150),
  ('bg_zen', 'Jardín Zen Atardecer', 'Piedras sagradas en equilibrio, ondas de arena y siluetas de bambú místico.', 'background', 'legendary', 200),
  ('bg_night', 'Noche Cósmica & Estrellas', 'Cielo estrellado profundo con luna creciente plateada y nebulosa violeta.', 'background', 'legendary', 250),

  ('fx_none', 'Sin Efecto', 'Entorno clásico, sobrio y equilibrado.', 'effect', 'common', 0),
  ('fx_leaves', 'Hojas en Brisa', 'Pequeñas hojas esmeralda flotando en espirales ascendentes.', 'effect', 'common', 75),
  ('fx_petals', 'Lluvia de Pétalos Sakura', 'Delicados pétalos rosados que caen en suave vaivén zen.', 'effect', 'rare', 100),
  ('fx_particles', 'Chispas de Oro', 'Polvo de estrellas doradas y destellos mágicos que centellean.', 'effect', 'epic', 125),
  ('fx_fireflies', 'Luciérnagas Mágicas', 'Orbes de luz cálida pulsante que iluminan la noche con encanto.', 'effect', 'epic', 150),
  ('fx_aura', 'Aura de Prosperidad', 'Anillos concéntricos de energía mística esmeralda y cian en expansión.', 'effect', 'legendary', 200)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  item_type = EXCLUDED.item_type,
  rarity = EXCLUDED.rarity,
  unlock_points = EXCLUDED.unlock_points;
