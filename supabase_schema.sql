-- ====================================================================
-- Sitaram Ayurveda Catalogue — Supabase Cloud Database Schema
-- Central Database with Realtime Replication Enabled
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
    sort_order INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Products / Formulations Table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    sanskrit_name VARCHAR(200),
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    category_name VARCHAR(100),
    classical_reference VARCHAR(250),
    packings JSONB DEFAULT '[]'::jsonb,
    ingredients JSONB DEFAULT '[]'::jsonb,
    dosage TEXT,
    usage TEXT,
    indications TEXT,
    description TEXT,
    primary_benefit TEXT,
    dosha_impact TEXT,
    target_doshas JSONB DEFAULT '[]'::jsonb,
    health_goals JSONB DEFAULT '[]'::jsonb,
    image_url TEXT,
    batch_number VARCHAR(100),
    status VARCHAR(20) DEFAULT 'Active',
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Profiles / Users Table (Synchronized across Android App and Web Admin)
CREATE TABLE IF NOT EXISTS profiles (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'PRACTITIONER',
    role_title VARCHAR(150) DEFAULT 'Clinical Practitioner',
    status VARCHAR(50) DEFAULT 'Active',
    prakriti VARCHAR(50) DEFAULT 'Tridoshic',
    designation VARCHAR(150) DEFAULT '',
    phone VARCHAR(50) DEFAULT '',
    avatar_url TEXT DEFAULT '',
    clinical_notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Audit Logs Table
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

-- 6. Enable Row Level Security (RLS) with Full Access for Service and Public
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public Read Products" ON products FOR SELECT USING (true);
CREATE POLICY "Public Read Profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Public Read Audit Logs" ON audit_logs FOR SELECT USING (true);

CREATE POLICY "Full Access Categories" ON categories FOR ALL USING (true);
CREATE POLICY "Full Access Products" ON products FOR ALL USING (true);
CREATE POLICY "Full Access Profiles" ON profiles FOR ALL USING (true);
CREATE POLICY "Full Access Audit Logs" ON audit_logs FOR ALL USING (true);

-- 7. Enable Realtime Publications for all Central Tables
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'products'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE products;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'categories'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE categories;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'audit_logs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE audit_logs;
  END IF;
END $$;

-- ====================================================================
-- SEED DATA: 24 Classical Ayurvedic Categories
-- ====================================================================
INSERT INTO categories (name, code, title, description, icon, sort_order) VALUES
('Arishtams & Asavams', 'ARISHTAM', 'Fermented Formulations', 'Naturally self-generated herbal wines and biomedical elixirs imparting high bioavailability.', 'wine-glass', 1),
('Kashayams (Kwathams)', 'KASHAYAM', 'Decoctions & Kwaths', 'Standardized aqueous extracts and water decoctions of concentrated raw botanical roots.', 'flask', 2),
('Ghritams (Ghees)', 'GHRITAM', 'Medicated Clarified Butter', 'Lipophilic herbal extractions through cow ghee capable of crossing blood-brain barriers.', 'droplet', 3),
('Thailams & Kuzhambu', 'THAILAM', 'Medicated Sesame Oils', 'Therapeutic external and internal oils for Abhyanga, Nasya, and neuro-muscular regeneration.', 'sparkles', 4),
('Lehyams & Rasayanams', 'LEHYAM', 'Herbal Jams & Electuaries', 'Syrupy nutritive confections boiled with jaggery, honey, ghee, and rejuvenative herbs.', 'heart', 5),
('Choornams (Powders)', 'CHOORNAM', 'Micro-pulverized Herb Powders', 'Finely sifted herbal mixtures balancing doshas through direct oral or external posology.', 'wind', 6),
('Gulikas & Vatis', 'GULIKA', 'Ayurvedic Tablets & Pills', 'Compressed herbal powders and mineral preparations for calibrated precision dosing.', 'circle-dot', 7),
('Bhasmas & Rasakriyas', 'BHASMA', 'Calcined Mineral Ash', 'Bio-purified nano-particulate calx delivering deep cellular rejuvenation.', 'flame', 8),
('Thailam - Softgel Capsules', 'CAPSULE', 'Soft Gelatin Encapsulations', 'Modernized palatable dosage delivery of classical Thailams and Kashayams.', 'capsule', 9),
('Kashayam - Tablets', 'KWATH_TAB', 'Concentrated Kwath Tablets', 'Dehydrated compressed extracts replacing traditional boiling of liquid kwathams.', 'tablets', 10)
ON CONFLICT (name) DO NOTHING;
