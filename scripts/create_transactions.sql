-- Migration: create transactions table
-- Fields: id, descricao, valor, tipo (receita/despesa), categoria_id, user_id, data_criacao

CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  descricao VARCHAR(255) NOT NULL,
  valor NUMERIC(14,2) NOT NULL,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('receita','despesa')),
  categoria_id INTEGER,
  user_id INTEGER,
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Foreign keys (if tables exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'transactions_categoria_id_fkey'
  ) THEN
    BEGIN
      ALTER TABLE transactions ADD CONSTRAINT transactions_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES categories(id) ON DELETE SET NULL;
    EXCEPTION WHEN undefined_table THEN
      -- categories table not present yet; skip
      NULL;
    END;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'transactions_user_id_fkey'
  ) THEN
    BEGIN
      ALTER TABLE transactions ADD CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    EXCEPTION WHEN undefined_table THEN
      NULL;
    END;
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_categoria_id ON transactions(categoria_id);
