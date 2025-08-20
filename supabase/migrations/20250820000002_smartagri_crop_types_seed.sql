-- SmartAgri Crop Types Seed Data
-- Migration: 20250820000002_smartagri_crop_types_seed.sql

-- Insert common crop types with detailed information
INSERT INTO public.crop_types (name, scientific_name, category, growing_season, avg_growing_period, water_requirements, temperature_range, spacing_requirements, harvest_indicators, common_diseases, common_pests) VALUES

-- Vegetables
('Tomato', 'Solanum lycopersicum', 'vegetable', ARRAY['spring', 'summer'], 90, 'moderate', '{"min": 18, "max": 30, "optimal": 24}', '{"row_spacing": 60, "plant_spacing": 45}', ARRAY['red color', 'firm texture', 'easy separation from stem'], ARRAY['early blight', 'late blight', 'bacterial wilt'], ARRAY['aphids', 'whiteflies', 'hornworms']),

('Onion', 'Allium cepa', 'vegetable', ARRAY['spring', 'fall'], 120, 'low', '{"min": 12, "max": 25, "optimal": 18}', '{"row_spacing": 30, "plant_spacing": 10}', ARRAY['yellowing tops', 'bulb formation', 'dry outer scales'], ARRAY['downy mildew', 'purple blotch', 'white rot'], ARRAY['thrips', 'onion maggot', 'cutworms']),

('Cabbage', 'Brassica oleracea', 'vegetable', ARRAY['fall', 'winter'], 75, 'moderate', '{"min": 15, "max": 22, "optimal": 18}', '{"row_spacing": 45, "plant_spacing": 40}', ARRAY['firm head', 'tight leaves', 'proper size'], ARRAY['clubroot', 'black rot', 'downy mildew'], ARRAY['cabbage worms', 'aphids', 'flea beetles']),

('Pepper', 'Capsicum annuum', 'vegetable', ARRAY['spring', 'summer'], 80, 'moderate', '{"min": 20, "max": 30, "optimal": 25}', '{"row_spacing": 50, "plant_spacing": 30}', ARRAY['color change', 'firm texture', 'full size'], ARRAY['bacterial spot', 'anthracnose', 'powdery mildew'], ARRAY['aphids', 'spider mites', 'pepper weevil']),

('Okra', 'Abelmoschus esculentus', 'vegetable', ARRAY['spring', 'summer'], 60, 'moderate', '{"min": 20, "max": 35, "optimal": 27}', '{"row_spacing": 60, "plant_spacing": 45}', ARRAY['tender pods', '3-4 inches long', 'easy snap'], ARRAY['fusarium wilt', 'root rot', 'leaf spot'], ARRAY['aphids', 'pod borers', 'flea beetles']),

-- Fruits
('Plantain', 'Musa paradisiaca', 'fruit', ARRAY['year-round'], 365, 'high', '{"min": 25, "max": 32, "optimal": 28}', '{"row_spacing": 300, "plant_spacing": 200}', ARRAY['full finger development', 'yellow color', 'easy peeling'], ARRAY['black sigatoka', 'panama disease', 'crown rot'], ARRAY['nematodes', 'weevils', 'aphids']),

('Pineapple', 'Ananas comosus', 'fruit', ARRAY['year-round'], 540, 'low', '{"min": 20, "max": 32, "optimal": 26}', '{"row_spacing": 180, "plant_spacing": 45}', ARRAY['golden color', 'sweet aroma', 'hollow sound'], ARRAY['heart rot', 'black rot', 'fruitlet core rot'], ARRAY['mealybugs', 'scale insects', 'thrips']),

('Pawpaw', 'Carica papaya', 'fruit', ARRAY['year-round'], 365, 'moderate', '{"min": 20, "max": 35, "optimal": 27}', '{"row_spacing": 250, "plant_spacing": 200}', ARRAY['color change', 'slight softness', 'sweet aroma'], ARRAY['papaya ringspot virus', 'anthracnose', 'black spot'], ARRAY['fruit flies', 'aphids', 'spider mites']),

-- Grains
('Maize', 'Zea mays', 'grain', ARRAY['spring', 'summer'], 120, 'moderate', '{"min": 18, "max": 32, "optimal": 25}', '{"row_spacing": 75, "plant_spacing": 25}', ARRAY['brown silks', 'hard kernels', 'dry husks'], ARRAY['gray leaf spot', 'northern leaf blight', 'ear rot'], ARRAY['fall armyworm', 'stem borers', 'aphids']),

('Rice', 'Oryza sativa', 'grain', ARRAY['spring', 'summer'], 120, 'high', '{"min": 20, "max": 35, "optimal": 28}', '{"row_spacing": 20, "plant_spacing": 10}', ARRAY['golden color', 'hard grains', 'drooping heads'], ARRAY['blast', 'bacterial leaf blight', 'sheath blight'], ARRAY['stem borers', 'brown planthoppers', 'rice bugs']),

('Millet', 'Pennisetum glaucum', 'grain', ARRAY['spring', 'summer'], 90, 'low', '{"min": 25, "max": 40, "optimal": 32}', '{"row_spacing": 45, "plant_spacing": 15}', ARRAY['hard seeds', 'brown color', 'dry heads'], ARRAY['downy mildew', 'smut', 'ergot'], ARRAY['stem borers', 'head bugs', 'birds']),

-- Legumes
('Cowpea', 'Vigna unguiculata', 'legume', ARRAY['spring', 'summer'], 75, 'moderate', '{"min": 20, "max": 35, "optimal": 28}', '{"row_spacing": 60, "plant_spacing": 20}', ARRAY['dry pods', 'hard seeds', 'brown color'], ARRAY['bacterial blight', 'rust', 'mosaic virus'], ARRAY['aphids', 'pod borers', 'thrips']),

('Groundnut', 'Arachis hypogaea', 'legume', ARRAY['spring', 'summer'], 120, 'moderate', '{"min": 20, "max": 30, "optimal": 25}', '{"row_spacing": 45, "plant_spacing": 15}', ARRAY['mature pods', 'full kernels', 'net pattern'], ARRAY['leaf spot', 'rust', 'rosette virus'], ARRAY['aphids', 'thrips', 'termites']),

('Soybean', 'Glycine max', 'legume', ARRAY['spring', 'summer'], 100, 'moderate', '{"min": 15, "max": 30, "optimal": 22}', '{"row_spacing": 40, "plant_spacing": 5}', ARRAY['yellow leaves', 'rattling pods', 'hard seeds'], ARRAY['rust', 'bacterial blight', 'mosaic virus'], ARRAY['pod borers', 'aphids', 'stink bugs']),

-- Root crops
('Cassava', 'Manihot esculenta', 'root', ARRAY['year-round'], 365, 'low', '{"min": 20, "max": 35, "optimal": 27}', '{"row_spacing": 100, "plant_spacing": 100}', ARRAY['mature tubers', 'easy digging', 'white flesh'], ARRAY['cassava mosaic virus', 'bacterial blight', 'root rot'], ARRAY['mealybugs', 'spider mites', 'whiteflies']),

('Yam', 'Dioscorea alata', 'root', ARRAY['spring'], 270, 'moderate', '{"min": 25, "max": 32, "optimal": 28}', '{"row_spacing": 100, "plant_spacing": 100}', ARRAY['mature tubers', 'thick skin', 'dormant buds'], ARRAY['anthracnose', 'virus diseases', 'nematodes'], ARRAY['yam beetles', 'scale insects', 'termites']),

('Sweet Potato', 'Ipomoea batatas', 'root', ARRAY['spring', 'summer'], 120, 'moderate', '{"min": 18, "max": 30, "optimal": 24}', '{"row_spacing": 75, "plant_spacing": 30}', ARRAY['mature roots', 'proper size', 'smooth skin'], ARRAY['black rot', 'scurf', 'virus diseases'], ARRAY['sweet potato weevil', 'wireworms', 'flea beetles']),

-- Cash crops
('Cocoa', 'Theobroma cacao', 'cash_crop', ARRAY['year-round'], 1825, 'high', '{"min": 21, "max": 32, "optimal": 26}', '{"row_spacing": 300, "plant_spacing": 300}', ARRAY['color change', 'hollow sound', 'mature beans'], ARRAY['black pod disease', 'witches broom', 'frosty pod rot'], ARRAY['capsids', 'thrips', 'mealybugs']),

('Coffee', 'Coffea arabica', 'cash_crop', ARRAY['year-round'], 1095, 'moderate', '{"min": 15, "max": 25, "optimal": 20}', '{"row_spacing": 200, "plant_spacing": 150}', ARRAY['red cherries', 'easy picking', 'sweet pulp'], ARRAY['coffee berry disease', 'leaf rust', 'coffee wilt'], ARRAY['coffee berry borer', 'scale insects', 'antestia bugs']),

('Cotton', 'Gossypium hirsutum', 'cash_crop', ARRAY['spring'], 180, 'moderate', '{"min": 20, "max": 35, "optimal": 27}', '{"row_spacing": 75, "plant_spacing": 15}', ARRAY['open bolls', 'white fiber', 'dry pods'], ARRAY['bacterial blight', 'fusarium wilt', 'leaf curl virus'], ARRAY['bollworms', 'aphids', 'whiteflies'])

ON CONFLICT (name) DO UPDATE SET
    scientific_name = EXCLUDED.scientific_name,
    category = EXCLUDED.category,
    growing_season = EXCLUDED.growing_season,
    avg_growing_period = EXCLUDED.avg_growing_period,
    water_requirements = EXCLUDED.water_requirements,
    temperature_range = EXCLUDED.temperature_range,
    spacing_requirements = EXCLUDED.spacing_requirements,
    harvest_indicators = EXCLUDED.harvest_indicators,
    common_diseases = EXCLUDED.common_diseases,
    common_pests = EXCLUDED.common_pests;
