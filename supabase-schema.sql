-- AI Vibes Radar - Supabase Schema
-- Ejecuta esto en Supabase SQL Editor si tu tabla analysis_results necesita ajustes

-- Verificar estructura existente de analysis_results
-- Si ya existe y tiene datos, NO ejecutar el DROP

-- DROP TABLE IF EXISTS analysis_results;

CREATE TABLE IF NOT EXISTS analysis_results (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_name text NOT NULL,
  competitors text[] DEFAULT '{}',
  results jsonb NOT NULL,
  consensus_score numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_analysis_brand ON analysis_results(brand_name);
CREATE INDEX IF NOT EXISTS idx_analysis_created ON analysis_results(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analysis_score ON analysis_results(consensus_score DESC);

-- Habilitar RLS (Row Level Security) - IMPORTANTE para seguridad
ALTER TABLE analysis_results ENABLE ROW LEVEL SECURITY;

-- Política: Permitir lectura a usuarios autenticados
CREATE POLICY IF NOT EXISTS "Enable read access for authenticated users"
ON analysis_results FOR SELECT
TO authenticated
USING (true);

-- Política: Permitir inserción a usuarios autenticados
CREATE POLICY IF NOT EXISTS "Enable insert for authenticated users"
ON analysis_results FOR INSERT
TO authenticated
WITH CHECK (true);

-- Política: Permitir acceso público para anon key (TEMPORAL - para desarrollo)
-- NOTA: En producción deberías restringir esto
CREATE POLICY IF NOT EXISTS "Enable read access for anon users"
ON analysis_results FOR SELECT
TO anon
USING (true);

CREATE POLICY IF NOT EXISTS "Enable insert for anon users"
ON analysis_results FOR INSERT
TO anon
WITH CHECK (true);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_analysis_results_updated_at ON analysis_results;
CREATE TRIGGER update_analysis_results_updated_at
  BEFORE UPDATE ON analysis_results
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Vista para obtener últimos análisis por marca
CREATE OR REPLACE VIEW latest_brand_analyses AS
SELECT DISTINCT ON (brand_name)
  id,
  brand_name,
  competitors,
  results,
  consensus_score,
  created_at
FROM analysis_results
ORDER BY brand_name, created_at DESC;

-- Comentarios para documentación
COMMENT ON TABLE analysis_results IS 'Stores AI model analysis results for brands';
COMMENT ON COLUMN analysis_results.brand_name IS 'Name of the brand being analyzed';
COMMENT ON COLUMN analysis_results.competitors IS 'Array of competitor brand names';
COMMENT ON COLUMN analysis_results.results IS 'Full JSON results from AI models (OpenAI, Anthropic)';
COMMENT ON COLUMN analysis_results.consensus_score IS 'Aggregated score from all models (0-100)';

-- VERIFICACIÓN: Ejecuta esto para ver la estructura
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'analysis_results';
