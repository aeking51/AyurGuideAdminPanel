-- ====================================================================
-- Sitaram Ayurveda Catalogue — Supabase Cloud Database Schema & Seed
-- Run this script in your Supabase Project SQL Editor (supabase.com -> SQL Editor -> New Query)
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    code VARCHAR(50) UNIQUE,
    title VARCHAR(150),
    description TEXT,
    icon VARCHAR(100),
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Ingredients Table
CREATE TABLE IF NOT EXISTS ingredients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    sanskrit_name VARCHAR(150),
    botanical_name VARCHAR(150),
    part_used VARCHAR(100),
    therapeutic_action TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Products / Formulations Table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    category_name VARCHAR(100),
    classical_reference VARCHAR(250),
    packings JSONB DEFAULT '[]'::jsonb,
    ingredients JSONB DEFAULT '[]'::jsonb,
    dosage TEXT,
    indications TEXT,
    description TEXT,
    image_url TEXT,
    stock INTEGER DEFAULT 25,
    status VARCHAR(20) DEFAULT 'Active',
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Administrators Table
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(100) NOT NULL,
    name VARCHAR(150) NOT NULL,
    role VARCHAR(100) DEFAULT 'Chief Medical Administrator',
    avatar TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    admin_email VARCHAR(150) NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_entity VARCHAR(100),
    target_id VARCHAR(100),
    details TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Manufacturers Table
CREATE TABLE IF NOT EXISTS manufacturers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    license_no VARCHAR(100),
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(100),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- SEED DATA: 24 Classical Ayurvedic Categories
-- ====================================================================
INSERT INTO categories (name, code, title, description, icon) VALUES
('Arishtams & Asavams', 'ARISHTAM', 'Fermented Formulations', 'Naturally self-generated herbal wines and biomedical elixirs imparting high bioavailability.', 'wine-glass'),
('Kashayams (Kwathams)', 'KASHAYAM', 'Decoctions & Kwaths', 'Standardized aqueous extracts and water decoctions of concentrated raw botanical roots.', 'flask'),
('Ghritams (Ghees)', 'GHRITAM', 'Medicated Clarified Butter', 'Lipophilic herbal extractions through cow ghee capable of crossing blood-brain barriers.', 'droplet'),
('Thailams & Kuzhambu', 'THAILAM', 'Medicated Sesame Oils', 'Therapeutic external and internal oils for Abhyanga, Nasya, and neuro-muscular regeneration.', 'sparkles'),
('Lehyams & Rasayanams', 'LEHYAM', 'Herbal Jams & Electuaries', 'Syrupy nutritive confections boiled with jaggery, honey, ghee, and rejuvenative herbs.', 'heart'),
('Choornams (Powders)', 'CHOORNAM', 'Micro-pulverized Herb Powders', 'Finely sifted herbal mixtures balancing doshas through direct oral or external posology.', 'wind'),
('Gulikas & Vatis', 'GULIKA', 'Ayurvedic Tablets & Pills', 'Compressed herbal powders and mineral preparations for calibrated precision dosing.', 'circle-dot'),
('Bhasmas & Rasakriyas', 'BHASMA', 'Calcined Mineral Ash', 'Bio-purified nano-particulate calx delivering deep cellular rejuvenation.', 'flame'),
('Thailam - Softgel Capsules', 'CAPSULE', 'Soft Gelatin Encapsulations', 'Modernized palatable dosage delivery of classical Thailams and Kashayams.', 'capsule'),
('Kashayam - Tablets', 'KWATH_TAB', 'Concentrated Kwath Tablets', 'Dehydrated compressed extracts replacing traditional boiling of liquid kwathams.', 'tablets')
ON CONFLICT (name) DO NOTHING;

-- ====================================================================
-- SEED DATA: Master Formulations
-- ====================================================================
INSERT INTO products (code, name, category_name, classical_reference, packings, ingredients, dosage, indications, description, image_url, stock, status, featured) VALUES
('SA-00001', 'Abhayarishtam', 'Arishtams & Asavams', 'Ashtangahrudayam, Arshorogadhikaram', '["450 ml", "200 ml"]'::jsonb, '["Abhaya (Terminalia chebula)", "Dhatri (Emblica officinalis)", "Kapitha (Feronia elephantum)", "Vishala (Citrullus colocynthis)"]'::jsonb, '15 to 25 ml twice daily after meals with equal quantity of warm water.', 'Arshas (Hemorrhoids), Udara (Abdominal disorders), Vibanda (Constipation), Agnimandya (Impaired digestion).', 'Classic Ayurvedic fermented formulation indicated primarily for hemorrhoids, sluggish digestion, and chronic constipation.', 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600', 42, 'Active', TRUE),
('SA-00002', 'Amritarishtam', 'Arishtams & Asavams', 'Bhaishajya Ratnavali, Jwaradhikaram', '["450 ml"]'::jsonb, '["Amrita / Guduchi (Tinospora cordifolia)", "Bilva (Aegle marmelos)", "Agnimantha (Premna integrifolia)", "Shyonaka (Oroxylum indicum)"]'::jsonb, '15 to 25 ml twice daily after food.', 'Jwara (Chronic & intermittent fevers), Jeerna Jwara, Ajeerna, Yakrit roga (Hepatic sluggishness).', 'Potent immunomodulatory elixir that detoxifies Ama, strengthens hepatic function, and relieves recurrent pyrexia.', 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=600', 35, 'Active', TRUE),
('SA-00003', 'Ashokarishtam', 'Arishtams & Asavams', 'Bhaishajya Ratnavali, Pradaradhikaram', '["450 ml", "200 ml"]'::jsonb, '["Ashoka (Saraca asoca)", "Dhataki (Woodfordia fruticosa)", "Musta (Cyperus rotundus)", "Haritaki (Terminalia chebula)"]'::jsonb, '15 to 25 ml twice daily after food or as directed by the physician.', 'Asrigdara (Menorrhagia), Pradara (Leucorrhea), Katishoola (Low back pain), Shweta Pradara.', 'Classical uterine tonic indicated for hormonal harmony, excessive menstrual bleeding, and pelvic comfort.', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600', 28, 'Active', FALSE),
('SA-00004', 'Dhanwantharam Thailam', 'Thailams & Kuzhambu', 'Sahasrayogam, Tailaprakaranam', '["450 ml", "200 ml"]'::jsonb, '["Bala (Sida cordifolia)", "Yava (Hordeum vulgare)", "Kola (Ziziphus jujuba)", "Kulattha (Dolichos biflorus)", "Dashamoola"]'::jsonb, 'Apply lukewarm over affected body parts for 30-45 mins before warm bath.', 'Vata rogas, Post-natal care, Hemiplegia, Arthritis, Spinal spondylosis, Nerve debility.', 'The pinnacle of classical neuro-muscular medicated oils for regenerative massage and neurological revitalization.', 'https://images.unsplash.com/photo-1608248597359-253106511b0e?w=600', 50, 'Active', TRUE),
('SA-00005', 'Kalyanaka Ghritam', 'Ghritams (Ghees)', 'Ashtanga Hridaya, Unmadachikitsa', '["150 g"]'::jsonb, '["Haridra (Curcuma longa)", "Daruharidra (Berberis aristata)", "Sariva (Hemidesmus indicus)", "Triphala", "Ghrita (Pure Cow Ghee)"]'::jsonb, '5 to 10 g on empty stomach in the morning with lukewarm water.', 'Unmada, Smriti kshaya (Memory loss), Anxiety, Infertility, Psychosomatic stress, Neuro-cognitive balance.', 'Medicated clarified butter engineered to cross lipid barriers for psychiatric wellness and deep cognitive nourishment.', 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600', 18, 'Active', TRUE),
('SA-00006', 'Chyavanaprasham', 'Lehyams & Rasayanams', 'Charaka Samhita, Chikitsasthanam', '["500 g", "1 kg"]'::jsonb, '["Amalaki (Emblica officinalis)", "Dashamoola", "Pippali (Piper longum)", "Tugaksheeri (Bambusa bambos)", "Ghee", "Honey"]'::jsonb, '10 to 15 g in the morning followed by a cup of warm milk.', 'Kasa (Cough), Shwasa (Respiratory distress), Dhatukshaya (Debility), Immunity deficiency.', 'The ultimate classical Rasayana formulation for cellular rejuvenation, respiratory vigor, and Ojas restoration.', 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?w=600', 65, 'Active', TRUE)
ON CONFLICT (code) DO NOTHING;

-- 8. Enable Row Level Security (RLS) with Full Access for Service and Public
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE manufacturers ENABLE ROW LEVEL SECURITY;

-- 9. Profiles / Users Table (Synchronized across Android App and Web Admin)
CREATE TABLE IF NOT EXISTS profiles (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'PATIENT',
    status VARCHAR(50) DEFAULT 'Active',
    prakriti VARCHAR(50) DEFAULT 'Pitta',
    designation VARCHAR(150) DEFAULT '',
    phone VARCHAR(50) DEFAULT '',
    avatar_url TEXT DEFAULT '',
    clinical_notes TEXT DEFAULT '',
    adherence_percent INTEGER DEFAULT 85,
    password_hash VARCHAR(255) DEFAULT '',
    salt VARCHAR(100) DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public Read Products" ON products FOR SELECT USING (true);
CREATE POLICY "Public Read Ingredients" ON ingredients FOR SELECT USING (true);
CREATE POLICY "Public Read Profiles" ON profiles FOR SELECT USING (true);

CREATE POLICY "Full Access Categories" ON categories FOR ALL USING (true);
CREATE POLICY "Full Access Products" ON products FOR ALL USING (true);
CREATE POLICY "Full Access Ingredients" ON ingredients FOR ALL USING (true);
CREATE POLICY "Full Access Admins" ON admins FOR ALL USING (true);
CREATE POLICY "Full Access Audit Logs" ON audit_logs FOR ALL USING (true);
CREATE POLICY "Full Access Manufacturers" ON manufacturers FOR ALL USING (true);
CREATE POLICY "Full Access Profiles" ON profiles FOR ALL USING (true);

-- Seed Administrators
INSERT INTO admins (username, email, password_hash, salt, name, role, avatar) VALUES
('admin', 'admin@sitaramayurveda.com', 'bcf5ca0d4948aee6a761e3d09a25b3497d39ca25fe0506eb36329bf3368a4128', 'a1b2c3d4e5f60718293a4b5c6d7e8f90', 'Dr. D. Ramanathan', 'Chief Medical Administrator', 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=120'),
('sitaram_admin', 'sys.jerin@gmail.com', 'bcf5ca0d4948aee6a761e3d09a25b3497d39ca25fe0506eb36329bf3368a4128', 'a1b2c3d4e5f60718293a4b5c6d7e8f90', 'Jerin Administrator', 'Lead Systems Administrator', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120')
ON CONFLICT (username) DO NOTHING;

-- Seed User Profiles (Single source of truth synchronized across platforms)
INSERT INTO profiles (id, name, email, role, status, prakriti, designation, phone, avatar_url, clinical_notes, adherence_percent, password_hash, salt) VALUES
('user_admin_jerin', 'Jerin MR', 'sys.jerin@gmail.com', 'ADMIN', 'Active', 'Tridoshic', 'Chief Administrator & System Director', '+91 98450 11001', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120', 'Primary system administrator. Full clinical pharmacopoeia, formulation inventory, and user directory management.', 98, 'bcf5ca0d4948aee6a761e3d09a25b3497d39ca25fe0506eb36329bf3368a4128', 'a1b2c3d4e5f60718293a4b5c6d7e8f90'),
('user_practitioner_meera', 'Dr. Meera Nambiar', 'dr.meera@ayurguide.org', 'PRACTITIONER', 'Active', 'Pitta', 'Senior Ayurvedic Physician (BAMS, MD)', '+91 98450 22002', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=120', 'Specialist in Dravyaguna (Herbal pharmacology) & Kayachikitsa.', 94, 'bcf5ca0d4948aee6a761e3d09a25b3497d39ca25fe0506eb36329bf3368a4128', 'a1b2c3d4e5f60718293a4b5c6d7e8f90'),
('user_patient_arjun', 'Arjun Mehta', 'arjun.m@example.com', 'PATIENT', 'Active', 'Vata', 'Wellness Seeker', '+91 98450 44004', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120', 'Practicing Dinacharya routine and herbal tea regimen for grounding nervous system.', 88, 'bcf5ca0d4948aee6a761e3d09a25b3497d39ca25fe0506eb36329bf3368a4128', 'a1b2c3d4e5f60718293a4b5c6d7e8f90'),
('user_admin_ramanathan', 'Dr. D. Ramanathan', 'admin@sitaramayurveda.com', 'ADMIN', 'Active', 'Tridoshic', 'Chief Medical Administrator', '+91 98450 00000', 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=120', 'Chief Medical Administrator & Formulary Director.', 99, 'bcf5ca0d4948aee6a761e3d09a25b3497d39ca25fe0506eb36329bf3368a4128', 'a1b2c3d4e5f60718293a4b5c6d7e8f90')
ON CONFLICT (id) DO NOTHING;


