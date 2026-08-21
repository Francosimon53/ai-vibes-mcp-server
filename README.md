# AI Vibes Radar — Multi-Model Evaluation Prototype

A Node.js prototype for comparing structured outputs from multiple large language models and producing a normalized consensus view.

This project sends the same evaluation prompt to OpenAI and Anthropic, parses each model's structured response, records model-level success/failure states, and computes an aggregate consensus score before persisting results to Supabase.

## Why this project matters

The core problem is not simply generating text with an LLM. It is evaluating multiple model outputs consistently enough to compare them, detect disagreement, and preserve enough structure for downstream analysis.

The implementation demonstrates:

- Multi-model evaluation using OpenAI and Anthropic
- Parallel model execution with `Promise.allSettled`
- Structured-output prompting and JSON parsing
- Model-specific error handling and fallback behavior
- Cross-model score normalization
- Consensus calculation across model outputs
- Persistence of evaluation results in Supabase
- HTTP endpoints for analysis, retrieval, and comparison
- Environment-based API credential management

## Evaluation workflow

1. A single evaluation prompt is created for a target brand and optional competitors.
2. The same task is sent in parallel to OpenAI and Anthropic.
3. Each model response is parsed into a common structure.
4. Invalid or failed responses are recorded explicitly rather than silently dropped.
5. Comparable dimensions are normalized across valid model responses.
6. A consensus score and model-coverage confidence value are calculated.
7. The complete result is stored for later comparison.

## Current evaluation dimensions

The prototype currently compares model outputs for:

- Sentiment
- Innovation
- Trust
- Sustainability
- Value perception
- Competitive positioning
- Key brand attributes

The evaluation domain is brand perception, but the architecture is intended to illustrate a broader pattern: compare independent LLM outputs against a shared schema, preserve disagreements and failures, and derive an auditable aggregate result.

## Technical stack

- Node.js
- Express
- OpenAI SDK
- Anthropic SDK
- Supabase
- JavaScript
- REST API

## Core endpoints

### `POST /analyze`

Runs the multi-model evaluation workflow for a brand.

Example request:

```json
{
  "brand_name": "Example Brand",
  "competitors": ["Competitor A", "Competitor B"]
}
```

### `GET /reports/:brandName`

Retrieves prior stored evaluations for a brand.

### `POST /compare`

Compares the latest stored consensus results for two brands.

## Local setup

```bash
git clone https://github.com/Francosimon53/ai-vibes-mcp-server.git
cd ai-vibes-mcp-server
npm install
```

Create a `.env` file with:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

Then run:

```bash
npm start
```

## What I would improve next

For a production-grade model-evaluation system, the next steps would be:

- Replace simple averaging with rubric-based evaluation
- Add factuality and reasoning-quality dimensions
- Add pairwise ranking and judge-model evaluation
- Track inter-model disagreement explicitly
- Version prompts and evaluation rubrics
- Add golden test sets and regression benchmarks
- Add human-review labels for calibration
- Measure evaluator consistency over time

## Portfolio context

This repository is part of my work exploring reliable AI systems, multi-model evaluation, structured-output validation, and human-verifiable AI workflows.
