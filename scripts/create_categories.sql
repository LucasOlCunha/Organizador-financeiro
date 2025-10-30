-- Migration: create categories table with the requested columns
-- Fields: id, nome, tipo (receita/despesa), data_criacao
-- This script will drop the existing `categories` table (if any) and recreate it
-- NOTE: dropping will remove existing category data. Run with caution.

DROP TABLE IF EXISTS categories CASCADE;

CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('receita','despesa')),
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Optional: create an index on tipo if you plan to query by it frequently
CREATE INDEX IF NOT EXISTS idx_categories_tipo ON categories(tipo);
