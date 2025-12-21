# 🎯 Ejemplos de Uso - AI Vibes Radar MCP Server

## Una vez conectado a Claude, puedes hacer estas preguntas:

---

## 📊 Análisis Básico de Marca

**Pregunta:**
> "Analiza la percepción de Nike"

**Claude hará:**
1. Llamará a `analyze_brand_perception` con brand_name="Nike"
2. Consultará OpenAI GPT-4 y Anthropic Claude
3. Calculará consenso entre ambos modelos
4. Guardará resultados en Supabase
5. Te dará un reporte ejecutivo

**Respuesta esperada:**
```
Nike - Brand Perception Analysis
================================
Overall Score: 84/100
Confidence: 100% (2 models)

Sentiment: +0.76 (Very Positive)

Key Attributes:
1. Innovation (9.2/10)
2. Quality (8.8/10)
3. Athletic Excellence (9.0/10)
4. Brand Recognition (9.5/10)
5. Premium Positioning (8.5/10)

Dimensional Scores:
- Innovation: 9.2/10
- Trust: 8.5/10
- Sustainability: 7.8/10
- Value: 8.0/10

Status: Analysis saved to database
```

---

## ⚔️ Comparación Competitiva

**Pregunta:**
> "Analiza Nike vs Adidas en sostenibilidad"

**Claude hará:**
1. Analizará Nike enfocado en sostenibilidad
2. Analizará Adidas enfocado en sostenibilidad
3. Comparará resultados
4. Identificará ganador y margen

**Respuesta esperada:**
```
Nike vs Adidas - Sustainability Analysis
=========================================

Nike:
- Sustainability Score: 7.8/10
- Key Initiatives: Recycled materials, carbon neutral by 2025
- Perception: Improving but historically behind

Adidas:
- Sustainability Score: 8.6/10
- Key Initiatives: Ocean plastic shoes, renewable energy
- Perception: Industry leader in green innovation

Winner: Adidas
Margin: +0.8 points (10% better perception)

Recommendation: Nike should amplify existing green initiatives
in communications to close perception gap.
```

---

## 📈 Análisis Histórico

**Pregunta:**
> "Muéstrame la tendencia de Nike en los últimos análisis"

**Claude hará:**
1. Llamará a `get_brand_reports` para Nike
2. Obtendrá últimos 10 análisis
3. Calculará tendencia

**Respuesta esperada:**
```
Nike - Historical Trend (Last 10 Analyses)
==========================================

Overall Score Trend:
Dec 20: 84 ↑
Dec 13: 82 ↑
Dec 06: 80 ↑
Nov 29: 79 →
Nov 22: 79 ↓

Trend: +5 points in last month (↑ Improving)

Key Changes:
- Innovation perception increasing (+1.2)
- Sustainability improving (+0.8)
- Trust score stable (8.5)

Next Action: Continue current trajectory, 
focus on sustainability messaging.
```

---

## 🎯 Análisis Multi-Competidor

**Pregunta:**
> "Analiza Tesla comparado con BMW, Mercedes y Audi"

**Claude hará:**
1. Llamará a `analyze_brand_perception` con:
   - brand_name: "Tesla"
   - competitors: ["BMW", "Mercedes", "Audi"]
2. Los modelos de IA analizarán todos en contexto
3. Generará ranking

**Respuesta esperada:**
```
Tesla vs Premium Auto Brands
==============================

Rankings by Category:

Innovation:
1. Tesla (9.5/10)
2. BMW (7.8/10)
3. Mercedes (7.5/10)
4. Audi (7.6/10)

Sustainability:
1. Tesla (9.2/10)
2. BMW (7.4/10)
3. Mercedes (7.0/10)
4. Audi (7.2/10)

Trust/Reliability:
1. Mercedes (8.8/10)
2. BMW (8.5/10)
3. Audi (8.3/10)
4. Tesla (7.2/10)

Overall Winner: Tesla (84/100)
- Dominates in innovation & sustainability
- Opportunity: Improve trust/reliability perception
```

---

## 🔍 Análisis Profundo

**Pregunta:**
> "Dame un análisis profundo de Apple vs Samsung"

**Claude hará:**
1. Análisis detallado de ambas marcas
2. Comparación dimensional completa
3. Identificación de fortalezas/debilidades
4. Recomendaciones estratégicas

**Respuesta esperada:**
```
Apple vs Samsung - Deep Dive Analysis
======================================

Apple Strengths:
- Premium brand perception (9.5/10)
- Ecosystem lock-in (9.8/10)
- Design leadership (9.6/10)
- Innovation narrative (9.2/10)

Apple Weaknesses:
- Value perception (6.5/10)
- Sustainability concerns (7.2/10)
- Closed ecosystem criticism

Samsung Strengths:
- Technology innovation (8.8/10)
- Value for money (8.5/10)
- Product variety (9.0/10)
- Display technology leadership (9.5/10)

Samsung Weaknesses:
- Brand prestige (7.5/10 vs Apple 9.5)
- Ecosystem fragmentation
- Premium positioning struggles

Strategic Insights:
1. Apple owns "premium lifestyle" narrative
2. Samsung leads in "technology innovation"
3. Both neck-and-neck in AI features

Recommendations:
- Apple: Address value concerns in mid-tier
- Samsung: Strengthen premium positioning
```

---

## 💡 Preguntas Avanzadas

Estas también funcionan:

> "¿Qué marcas de autos eléctricos tienen mejor percepción de IA?"

> "Compara Coca-Cola y Pepsi, ¿cuál domina en cada dimensión?"

> "¿Cómo perciben los modelos de IA a las marcas de fast food?"

> "Analiza Starbucks vs Dunkin' en diferentes mercados"

> "Dame el share of voice de las top 3 marcas de smartphones"

---

## 🚀 Casos de Uso Reales

### Para CMOs:
- Benchmark competitivo mensual
- Tracking de iniciativas de marketing
- Identificación de gaps de percepción

### Para Product Marketing:
- Validación de posicionamiento
- Análisis pre/post-lanzamiento
- Competitive intelligence

### Para Agencies:
- Brand audits para clientes
- Competitive analysis reports
- Strategic positioning recommendations

---

## ⚠️ Limitaciones Actuales

1. Solo analiza 2 modelos (OpenAI + Anthropic)
   - Próximamente: Gemini, Mistral, DeepSeek, Grok
2. Análisis en inglés
   - Próximamente: Soporte multi-idioma
3. No tiene datos en tiempo real de trending
   - Próximamente: Integración con Google Trends

---

## 🎓 Tips para Mejores Resultados

1. **Sé específico:**
   ❌ "Analiza Nike"
   ✅ "Analiza Nike enfocado en sostenibilidad vs Adidas"

2. **Usa contexto:**
   ❌ "¿Quién gana?"
   ✅ "Entre Tesla y Rivian, ¿quién tiene mejor percepción en lujo?"

3. **Pide tendencias:**
   ❌ "¿Cómo está mi marca?"
   ✅ "¿Cómo ha evolucionado mi marca en el último mes?"

4. **Solicita accionables:**
   ✅ "¿Qué debería hacer mi marca para mejorar percepción?"

---

¡Experimenta y descubre insights únicos! 🚀
