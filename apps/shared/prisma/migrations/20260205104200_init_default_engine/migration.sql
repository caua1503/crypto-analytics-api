-- Create default AnalysisEngineVersion
INSERT INTO "AnalysisEngineVersion" ("name", "description", "isActive", "createdAt")
VALUES ('v1-default', 'Versão padrão do motor de decisão', true, NOW());

-- Insert Criteria
INSERT INTO "Criterion" ("code", "name", "description", "category")
VALUES 
('SENTIMENT_FEAR_GREED', 'Fear & Greed Index', 'Indicador de sentimento do mercado (medo/ganância)', 'SENTIMENT'),
('TECHNICAL_TREND', 'Tendência Técnica', 'Análise de preço vs médias móveis', 'TECHNICAL'),
('MACRO_BTC_DOMINANCE', 'Dominância do Bitcoin', 'Proxy de risco para altcoins', 'MACRO')
ON CONFLICT ("code") DO NOTHING;

-- Insert Weights
INSERT INTO "CriterionWeight" ("engineVersionId", "criterionId", "importanceWeight", "scoreMin", "scoreMax")
SELECT 
    (SELECT id FROM "AnalysisEngineVersion" WHERE name = 'v1-default' ORDER BY id DESC LIMIT 1),
    (SELECT id FROM "Criterion" WHERE code = 'SENTIMENT_FEAR_GREED' LIMIT 1),
    0.40, 0, 10
UNION ALL
SELECT 
    (SELECT id FROM "AnalysisEngineVersion" WHERE name = 'v1-default' ORDER BY id DESC LIMIT 1),
    (SELECT id FROM "Criterion" WHERE code = 'TECHNICAL_TREND' LIMIT 1),
    0.40, 0, 10
UNION ALL
SELECT 
    (SELECT id FROM "AnalysisEngineVersion" WHERE name = 'v1-default' ORDER BY id DESC LIMIT 1),
    (SELECT id FROM "Criterion" WHERE code = 'MACRO_BTC_DOMINANCE' LIMIT 1),
    0.20, 0, 10;
