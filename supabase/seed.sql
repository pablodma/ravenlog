-- Insertar rangos militares básicos
INSERT INTO public.ranks (name, abbreviation, "order") VALUES
    ('Cadete', 'CDT', 1),
    ('Subteniente', 'STE', 2),
    ('Teniente', 'TTE', 3),
    ('Capitán', 'CAP', 4),
    ('Mayor', 'MAY', 5),
    ('Teniente Coronel', 'TCL', 6),
    ('Coronel', 'COL', 7),
    ('General de Brigada', 'GBR', 8),
    ('General de División', 'GDV', 9),
    ('General', 'GRL', 10);

-- Insertar certificaciones básicas
INSERT INTO public.certifications (name, description, category, requirements) VALUES
    ('BFM Básico', 'Certificación básica en combate aire-aire básico', 'Combate', 'Completar curso de BFM y aprobar evaluación práctica'),
    ('BVR Intermedio', 'Combate más allá del alcance visual', 'Combate', 'Certificación BFM + 10 horas de práctica BVR'),
    ('CAS Básico', 'Apoyo aéreo cercano básico', 'Ataque', 'Conocimiento de procedimientos CAS y comunicaciones'),
    ('SEAD', 'Supresión de defensas aéreas enemigas', 'Ataque', 'Certificación CAS + conocimiento de sistemas antiaéreos'),
    ('AAR', 'Reabastecimiento aéreo', 'Apoyo', 'Práctica con diferentes tipos de aeronaves tanque'),
    ('Instructor BFM', 'Instructor de combate aire-aire', 'Instrucción', 'Certificación BVR + experiencia demostrada + evaluación pedagógica'),
    ('Líder de Vuelo', 'Liderazgo de formaciones', 'Liderazgo', '50 horas de vuelo + certificaciones básicas + evaluación de liderazgo'),
    ('ILS/TACAN', 'Aproximaciones instrumentales', 'Navegación', 'Conocimiento de procedimientos ILS y TACAN');

-- Insertar medallas básicas
INSERT INTO public.medals (name, description, category, requirements, rarity, points) VALUES
    ('Medalla de Servicio', 'Por completar el período de servicio básico', 'Servicio', 'Completar 3 meses de servicio activo', 'common', 10),
    ('Medalla de Entrenamiento', 'Por completar el entrenamiento básico', 'Entrenamiento', 'Completar todas las certificaciones básicas', 'common', 15),
    ('As del Aire', 'Por derribar 5 aeronaves enemigas', 'Combate', '5 derribos confirmados en combate', 'rare', 50),
    ('Médula de Valor', 'Por actos de valentía excepcional', 'Honor', 'Acción destacada bajo fuego enemigo', 'epic', 100),
    ('Cruz del Servicio Distinguido', 'Por servicio excepcional a la unidad', 'Honor', 'Contribución significativa a la unidad por período extendido', 'epic', 75),
    ('Estrella de Plata', 'Por actos de gallardía en combate', 'Combat', 'Acción heroica que resulte en éxito de misión', 'legendary', 150),
    ('Instructor del Año', 'Por excelencia en la instrucción', 'Entrenamiento', 'Reconocido como mejor instructor por período de un año', 'rare', 60),
    ('Misión Perfecta', 'Por completar misión sin daños', 'Operacional', 'Completar misión compleja sin recibir daños', 'uncommon', 25);

-- Crear un usuario administrador de ejemplo (esto se debe hacer después de que alguien se registre)
-- Los datos del primer usuario admin se configurarán manualmente
