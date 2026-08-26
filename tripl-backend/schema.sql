-- ============================================================
-- TripL Database Schema
-- Smart Tourism & AI Trail Platform
-- ============================================================

CREATE DATABASE IF NOT EXISTS tripl_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tripl_db;

-- ----------------------------------------
-- 1. Categories
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(100) DEFAULT '🏛️',
    color VARCHAR(20) DEFAULT '#6366f1',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------
-- 2. Places
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS places (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    category_id INT,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    rating DECIMAL(3, 1) DEFAULT 4.0,
    avg_visit_duration INT DEFAULT 60,   -- minutes
    opening_time TIME DEFAULT '06:00:00',
    closing_time TIME DEFAULT '20:00:00',
    entry_fee DECIMAL(10, 2) DEFAULT 0.00,
    description TEXT,
    image_url VARCHAR(512),
    address VARCHAR(512),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) DEFAULT 'India',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- ----------------------------------------
-- 3. Transport Modes
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS transport_modes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    mode VARCHAR(50) NOT NULL,
    display_name VARCHAR(100),
    cost_per_km DECIMAL(6, 2) NOT NULL,
    avg_speed_kmph INT NOT NULL,
    icon VARCHAR(10) DEFAULT '🚗',
    color VARCHAR(20) DEFAULT '#3b82f6',
    is_active BOOLEAN DEFAULT TRUE
);

-- ----------------------------------------
-- 4. Users (backend authentication)
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(512) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------
-- 5. User Trails (saved sessions)
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS user_trails (
    id INT PRIMARY KEY AUTO_INCREMENT,
    session_id VARCHAR(100) NOT NULL,
    origin_city VARCHAR(100),
    preferences JSON,
    trail_data JSON,
    total_cost DECIMAL(10, 2),
    total_duration INT,               -- minutes
    place_count INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Categories
INSERT INTO categories (name, icon, color) VALUES
('Beach',    '🏖️',  '#06b6d4'),
('Temple',   '🛕',  '#f59e0b'),
('Park',     '🌿',  '#22c55e'),
('Museum',   '🏛️',  '#8b5cf6'),
('Viewpoint','⛰️',  '#ef4444'),
('Market',   '🛍️',  '#ec4899'),
('Fort',     '🏰',  '#78716c'),
('Waterfall','💧',  '#3b82f6'),
('Lake',     '🌊',  '#0ea5e9'),
('Wildlife', '🦁',  '#84cc16');

-- Transport Modes
INSERT INTO transport_modes (mode, display_name, cost_per_km, avg_speed_kmph, icon, color) VALUES
('walk',  'Walking',    0.00,  5,  '🚶', '#22c55e'),
('bike',  'Bike/2W',   2.50, 40,  '🏍️', '#f59e0b'),
('auto',  'Auto',      12.00, 30, '🛺', '#f97316'),
('car',   'Car/Cab',   14.00, 50, '🚗', '#3b82f6'),
('bus',   'Bus',        5.00, 25, '🚌', '#8b5cf6');

-- ============================================================
-- PLACES — VISAKHAPATNAM
-- ============================================================
INSERT INTO places (name, category_id, latitude, longitude, rating, avg_visit_duration, opening_time, closing_time, entry_fee, description, city, address) VALUES
('RK Beach (Ramakrishna Beach)', 1, 17.7231, 83.3372, 4.5, 90, '05:00:00', '21:00:00', 0,    'Most popular beach in Vizag with scenic views, beach road, and submarine museum.', 'Visakhapatnam', 'Beach Road, Visakhapatnam'),
('Kailasagiri Hill Park',       5, 17.7567, 83.3735, 4.4, 120,'05:30:00', '20:00:00', 40,   'Hilltop park with giant Shiva-Parvati statue, cable car, and panoramic views.', 'Visakhapatnam', 'Kailasagiri, Visakhapatnam'),
('Araku Valley',                3, 18.3272, 82.8753, 4.6, 240,'06:00:00', '18:00:00', 0,    'Scenic hill station with coffee plantations, tribal culture, and fresh air.', 'Visakhapatnam', 'Araku Valley, Alluri Sitharama Raju Dist.'),
('Borra Caves',                 5, 18.1157, 83.0404, 4.3, 90, '10:00:00', '17:00:00', 65,   'Natural limestone caves 1 million years old with stalactites and stalagmites.', 'Visakhapatnam', 'Borra, Alluri Sitharama Raju Dist.'),
('Rushikonda Beach',            1, 17.7802, 83.3832, 4.3, 90, '06:00:00', '18:00:00', 0,    'Blue-flag beach perfect for water sports like surfing and kayaking.', 'Visakhapatnam', 'Rushikonda, Visakhapatnam'),
('INS Kurusura Submarine Museum',4, 17.7219, 83.3380, 4.4, 60, '10:00:00', '18:00:00', 40,  'Decommissioned submarine converted into museum on the beach.', 'Visakhapatnam', 'RK Beach, Visakhapatnam'),
('VUDA Park',                   3, 17.7255, 83.3391, 4.1, 60, '11:00:00', '21:00:00', 30,   'Amusement and nature park near the beach with rides and fountains.', 'Visakhapatnam', 'Beach Road, Visakhapatnam'),
('Yarada Beach',                1, 17.6460, 83.2943, 4.5, 90, '05:00:00', '20:00:00', 0,    'Secluded, pristine beach surrounded by hills — one of the cleanest in India.', 'Visakhapatnam', 'Yarada, Visakhapatnam'),
('Simhachalam Temple',          2, 17.7680, 83.2499, 4.6, 90, '06:00:00', '21:00:00', 0,    'Ancient temple of Lord Varaha Narasimha set on a lush hill.', 'Visakhapatnam', 'Simhachalam, Visakhapatnam'),
('Bojjannakonda',               4, 17.5166, 82.8671, 4.2, 60, '09:00:00', '17:00:00', 15,   'Buddhist rock-cut caves with ancient sculptures and meditation halls.', 'Visakhapatnam', 'Sankaram, Visakhapatnam'),
('Rishikonda Park',             3, 17.7821, 83.3864, 4.0, 60, '06:00:00', '18:00:00', 20,   'Scenic park with sea views, jogging track, and tree-lined paths.', 'Visakhapatnam', 'Rushikonda, Visakhapatnam'),
('Dolphin''s Nose Lighthouse',  5, 17.6887, 83.2881, 4.3, 60, '10:00:00', '16:00:00', 20,   'Scenic viewpoint at the edge of a cliff with stunning Bay of Bengal views.', 'Visakhapatnam', 'Dolphin''s Nose, Visakhapatnam'),
('Tenneti Park',                3, 17.7308, 83.3488, 4.1, 45, '05:00:00', '22:00:00', 10,   'Cliff-side garden park with sea views and steps to a small beach.', 'Visakhapatnam', 'Tenneti, Visakhapatnam'),
('Pavurallakonda Buddhist Site', 4, 17.7487, 83.2262, 4.0, 60, '09:00:00', '17:00:00', 10,   'Ancient Buddhist site with monastic ruins from 3rd century BC.', 'Visakhapatnam', 'Bheemunipatnam, Visakhapatnam'),
('Bheemunipatnam Beach',        1, 17.8905, 83.4569, 4.2, 75, '05:00:00', '20:00:00', 0,    'Quiet heritage beach with Dutch cemetery and a restored lighthouse.', 'Visakhapatnam', 'Bheemunipatnam, Visakhapatnam');

-- ============================================================
-- PLACES — HYDERABAD
-- ============================================================
INSERT INTO places (name, category_id, latitude, longitude, rating, avg_visit_duration, opening_time, closing_time, entry_fee, description, city, address) VALUES
('Charminar',               7, 17.3616, 78.4747, 4.6, 90, '09:30:00', '17:30:00', 25,   'Iconic 16th-century monument with four minarets in the heart of Old Hyderabad.', 'Hyderabad', 'Charminar, Hyderabad'),
('Golconda Fort',           7, 17.3833, 78.4011, 4.7, 150,'09:00:00', '17:30:00', 15,   'Grand 400-year-old fort with acoustic clapping chamber and stunning views.', 'Hyderabad', 'Golconda, Hyderabad'),
('Hussain Sagar Lake',      9, 17.4239, 78.4738, 4.3, 75, '05:00:00', '22:00:00', 0,    'Large artificial lake with Buddha statue and boat rides.', 'Hyderabad', 'Tank Bund, Hyderabad'),
('Ramoji Film City',        3, 17.2543, 78.6808, 4.5, 480,'09:00:00', '21:30:00', 1150, 'World''s largest film studio complex with theme park and tours.', 'Hyderabad', 'Anaspur Village, Hyderabad'),
('Salar Jung Museum',       4, 17.3711, 78.4798, 4.5, 120,'10:00:00', '17:00:00', 20,   'One of India''s largest museums with rare artifacts collected across centuries.', 'Hyderabad', 'Salar Jung Road, Hyderabad'),
('Birla Mandir',            2, 17.4062, 78.4691, 4.5, 60, '07:00:00', '12:00:00', 0,    'Stunning white marble temple atop a rocky hill overlooking the city.', 'Hyderabad', 'Naubat Pahad, Hyderabad'),
('Laad Bazaar',             6, 17.3609, 78.4737, 4.2, 60, '10:00:00', '20:00:00', 0,    'Famous bangle market near Charminar, bursting with color and tradition.', 'Hyderabad', 'Laad Bazaar, Hyderabad'),
('Qutb Shahi Tombs',        7, 17.3942, 78.3978, 4.4, 90, '09:30:00', '17:30:00', 15,   'Royal tombs of the Qutb Shahi dynasty amid serene gardens.', 'Hyderabad', 'Ibrahim Bagh, Hyderabad'),
('Nehru Zoological Park',   10,17.3478, 78.4511, 4.3, 150,'08:30:00', '17:00:00', 50,   'One of India''s largest zoos with lion safaris and a butterfly park.', 'Hyderabad', 'Bahadurpura, Hyderabad'),
('Shilparamam',             6, 17.4530, 78.3686, 4.2, 90, '10:30:00', '20:00:00', 15,   'Craft village and cultural center showcasing traditional arts.', 'Hyderabad', 'Hi-Tech City, Hyderabad'),
('NTR Gardens',             3, 17.4229, 78.4688, 4.1, 60, '08:30:00', '21:00:00', 20,   'Lakeside gardens named after late CM NT Rama Rao with musical fountain.', 'Hyderabad', 'Tank Bund, Hyderabad'),
('Chowmahalla Palace',      7, 17.3587, 78.4682, 4.6, 90, '10:00:00', '17:00:00', 80,   'Magnificent palace of the Nizams with vintage cars and royal artifacts.', 'Hyderabad', 'Khilwat, Hyderabad'),
('Mecca Masjid',            2, 17.3604, 78.4738, 4.4, 45, '04:30:00', '21:00:00', 0,    'One of the oldest and largest mosques in India, built during Mughal era.', 'Hyderabad', 'Charminar, Hyderabad'),
('Lumbini Park',            3, 17.4087, 78.4740, 4.1, 75, '09:00:00', '21:00:00', 15,   'Nicely landscaped park next to Hussain Sagar with laser show.', 'Hyderabad', 'Secretariat Road, Hyderabad'),
('Snow World',              3, 17.4280, 78.4417, 3.9, 90, '11:00:00', '21:00:00', 399,  'Snow-themed amusement park with real snow and ice slides.', 'Hyderabad', 'Lower Tank Bund, Hyderabad');

-- ============================================================
-- PLACES — GOA
-- ============================================================
INSERT INTO places (name, category_id, latitude, longitude, rating, avg_visit_duration, opening_time, closing_time, entry_fee, description, city, address) VALUES
('Baga Beach',              1, 15.5553, 73.7517, 4.3, 120,'06:00:00', '22:00:00', 0,    'Lively beach famous for water sports, beach shacks, and nightlife.', 'Goa', 'Baga, North Goa'),
('Basilica of Bom Jesus',   2, 15.5009, 73.9116, 4.7, 75, '09:00:00', '18:30:00', 0,    'UNESCO World Heritage Site with relics of St. Francis Xavier.', 'Goa', 'Old Goa'),
('Dudhsagar Waterfalls',    8, 15.3148, 74.3145, 4.8, 180,'08:00:00', '18:00:00', 400,  'Four-tiered 600m-tall waterfall on the Goa-Karnataka border.', 'Goa', 'Mollem National Park, Goa'),
('Fort Aguada',             7, 15.4913, 73.7736, 4.5, 90, '09:30:00', '18:00:00', 15,   '17th-century Portuguese fort overlooking the Arabian Sea.', 'Goa', 'Candolim, North Goa'),
('Calangute Beach',         1, 15.5439, 73.7554, 4.2, 90, '06:00:00', '22:00:00', 0,    'Queen of beaches in Goa, busy and vibrant with market stalls.', 'Goa', 'Calangute, North Goa'),
('Palolem Beach',           1, 14.9999, 74.0232, 4.6, 120,'06:00:00', '22:00:00', 0,    'Crescent-shaped paradise beach in South Goa — calm and beautiful.', 'Goa', 'Palolem, South Goa'),
('Se Cathedral',            2, 15.5007, 73.9120, 4.5, 60, '09:00:00', '17:00:00', 0,    'Asia''s largest church, dedicated to St. Catherine, built in 1619.', 'Goa', 'Old Goa'),
('Anjuna Flea Market',      6, 15.5766, 73.7404, 4.1, 90, '08:00:00', '18:00:00', 0,    'Famous Wednesday flea market with hippie vibes, crafts, and food.', 'Goa', 'Anjuna, North Goa'),
('Chapora Fort',            7, 15.6032, 73.7352, 4.4, 75, '09:30:00', '17:30:00', 0,    'Iconic fort from Dil Chahta Hai with stunning river views.', 'Goa', 'Chapora, North Goa'),
('Mandovi River Cruise',    9, 15.4909, 73.8278, 4.2, 60, '18:00:00', '22:00:00', 300,  'Evening river cruise with Goan folk music and dance performances.', 'Goa', 'Panaji, Goa'),
('Colva Beach',             1, 15.2792, 73.9226, 4.2, 90, '06:00:00', '21:00:00', 0,    'Quiet, long stretch of white sand in South Goa with coconut palms.', 'Goa', 'Colva, South Goa'),
('Fontainhas',              6, 15.4985, 73.8343, 4.4, 60, '09:00:00', '18:00:00', 0,    'Latin Quarter of Panaji with colorful Portuguese-era houses.', 'Goa', 'Panaji, Goa'),
('Bogmalo Beach',           1, 15.3875, 73.8245, 4.3, 90, '06:00:00', '20:00:00', 0,    'Small, clean beach near Goa airport with water sports options.', 'Goa', 'Bogmalo, South Goa'),
('Butterfly Beach',         1, 14.9739, 74.0393, 4.7, 60, '08:00:00', '18:00:00', 0,    'Remote, stunning beach accessible only by boat — paradise!', 'Goa', 'Canacona, South Goa'),
('Cabo de Rama Fort',       7, 14.9178, 74.0476, 4.2, 60, '09:00:00', '18:00:00', 0,    'Ancient fort overlooking the Arabian Sea with dramatic cliff views.', 'Goa', 'Canacona, South Goa');

-- ============================================================
-- PLACES — JAIPUR
-- ============================================================
INSERT INTO places (name, category_id, latitude, longitude, rating, avg_visit_duration, opening_time, closing_time, entry_fee, description, city, address) VALUES
('Hawa Mahal',              7, 26.9239, 75.8267, 4.7, 90, '09:00:00', '17:00:00', 50,   'Iconic Palace of Winds with 953 tiny windows for royal ladies to observe the city.', 'Jaipur', 'Siredeori Bazaar, Jaipur'),
('Amber Fort',              7, 26.9855, 75.8513, 4.8, 180,'08:00:00', '20:00:00', 100,  'Magnificent hilltop fort with palatial courts, elephant rides, and light show.', 'Jaipur', 'Devisinghpura, Amber, Jaipur'),
('City Palace',             7, 26.9258, 75.8237, 4.6, 120,'09:30:00', '17:00:00', 200,  'Royal palace complex housing a museum with royal artifacts and costumes.', 'Jaipur', 'Tulsi Marg, Jaipur'),
('Jantar Mantar',           4, 26.9247, 75.8242, 4.5, 60, '09:00:00', '17:00:00', 50,   'UNESCO-listed astronomical observatory with giant stone instruments.', 'Jaipur', 'Gangori Bazar, Jaipur'),
('Jal Mahal',               9, 26.9516, 75.8492, 4.3, 45, '06:00:00', '18:00:00', 0,    'Stunning mid-lake palace visible from the road — doesn''t permit entry but photogenic.', 'Jaipur', 'Man Sagar Lake, Jaipur'),
('Nahargarh Fort',          7, 26.9438, 75.8043, 4.5, 120,'10:00:00', '18:00:00', 50,   'Hilltop fort with the best sunset view of Jaipur city.', 'Jaipur', 'Aravalli Range, Jaipur'),
('Jaigarh Fort',            7, 27.0005, 75.8435, 4.4, 90, '09:00:00', '17:30:00', 35,   'Fort housing the world''s largest cannon on wheels — Jaivana.', 'Jaipur', 'Devisinghpura, Jaipur'),
('Johri Bazaar',            6, 26.9226, 75.8234, 4.3, 90, '10:00:00', '21:00:00', 0,    'Famous jewelry market for Kundan, Meena, and Polki jewelry.', 'Jaipur', 'Johri Bazaar, Jaipur'),
('Albert Hall Museum',      4, 26.9001, 75.8188, 4.4, 90, '09:00:00', '17:00:00', 40,   'Oldest museum in Rajasthan in a beautiful Indo-Saracenic building.', 'Jaipur', 'Ram Niwas Garden, Jaipur'),
('Sisodia Rani Garden',     3, 26.8946, 75.8624, 4.3, 60, '08:00:00', '18:00:00', 10,   'Terraced Mughal garden with fountains and murals of the Radha-Krishna story.', 'Jaipur', 'Agra Road, Jaipur'),
('Birla Mandir Jaipur',     2, 26.8931, 75.8093, 4.5, 60, '06:00:00', '12:00:00', 0,    'White marble temple dedicated to Laxmi-Narayan with intricate carvings.', 'Jaipur', 'Statue Circle, Jaipur'),
('Chokhi Dhani',            6, 26.7890, 75.7992, 4.5, 180,'17:00:00', '23:00:00', 700,  'Rajasthani village resort with folk dances, camel rides, and authentic food.', 'Jaipur', 'Tonk Road, Jaipur'),
('Galtaji Temple (Monkey Temple)', 2, 26.9146, 75.8655, 4.3, 75, '05:00:00', '18:00:00', 0, 'Ancient temple complex with natural springs, kunds, and troops of monkeys.', 'Jaipur', 'Galta Ji, Jaipur'),
('Anokhi Museum of Hand Printing', 4, 26.9863, 75.8518, 4.5, 75, '10:30:00', '17:00:00', 50, 'Charming museum in a renovated haveli showcasing block-printing craft.', 'Jaipur', 'Kheri Gate, Amber, Jaipur'),
('Panna Meena Ka Kund',     5, 26.9854, 75.8537, 4.6, 45, '08:00:00', '18:00:00', 0,    'Stunning geometric stepwell with criss-crossing stairs — photography heaven.', 'Jaipur', 'Amber, Jaipur');
