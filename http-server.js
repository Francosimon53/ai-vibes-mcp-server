#!/usr/bin/env node

/**
 * AI Vibes Radar - HTTP Wrapper for MCP Server
 * Exposes MCP tools via HTTP API for web app integration
 */

import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize clients
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ============================================
// CORE ANALYSIS FUNCTION
// ============================================
async function analyzeBrandPerception(brandName, competitors = [], depth = 'standard') {
  const prompt = `Analyze the brand perception of "${brandName}"${
    competitors.length > 0 ? ` compared to competitors: ${competitors.join(', ')}` : ''
  }.

Provide a detailed analysis including:
1. Overall sentiment score (-1 to 1)
2. Key brand attributes (top 5)
3. Competitive positioning
4. Innovation score (0-10)
5. Trust score (0-10)
6. Sustainability score (0-10)
7. Value perception score (0-10)

Format as JSON with these exact keys: sentiment, attributes, positioning, innovation_score, trust_score, sustainability_score, value_score`;

  const results = {
    brand_name: brandName,
    competitors: competitors,
    timestamp: new Date().toISOString(),
    models: {},
  };

  try {
    // Parallel queries to OpenAI and Anthropic
    const [openaiResult, anthropicResult] = await Promise.allSettled([
      // OpenAI Query
      openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),

      // Anthropic Query
      anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    ]);

    // Process OpenAI result
    if (openaiResult.status === 'fulfilled') {
      try {
        const content = openaiResult.value.choices[0].message.content;
        results.models.openai = {
          status: 'success',
          data: JSON.parse(content),
          model: 'gpt-4-turbo-preview',
        };
      } catch (e) {
        results.models.openai = {
          status: 'error',
          error: 'Failed to parse response',
        };
      }
    } else {
      results.models.openai = {
        status: 'error',
        error: openaiResult.reason.message || 'API call failed',
      };
    }

    // Process Anthropic result
    if (anthropicResult.status === 'fulfilled') {
      try {
        const content = anthropicResult.value.content[0].text;
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          results.models.anthropic = {
            status: 'success',
            data: JSON.parse(jsonMatch[0]),
            model: 'claude-3-5-sonnet',
          };
        } else {
          results.models.anthropic = {
            status: 'success',
            data: { raw_response: content },
            model: 'claude-3-5-sonnet',
          };
        }
      } catch (e) {
        results.models.anthropic = {
          status: 'error',
          error: 'Failed to parse response',
        };
      }
    } else {
      results.models.anthropic = {
        status: 'error',
        error: anthropicResult.reason.message || 'API call failed',
      };
    }

    // Calculate consensus
    results.consensus = calculateConsensus(results.models);

    // Store in Supabase
    const { data: insertData, error: insertError } = await supabase
      .from('analysis_results')
      .insert([
        {
          brand_name: brandName,
          competitors: competitors,
          results: results,
          consensus_score: results.consensus.overall_score,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (insertError) {
      console.error('Supabase insert error:', insertError);
    }

    return results;
  } catch (error) {
    console.error('Analysis error:', error);
    throw new Error(`Failed to analyze brand: ${error.message}`);
  }
}

function calculateConsensus(models) {
  const validModels = Object.values(models).filter((m) => m.status === 'success');

  if (validModels.length === 0) {
    return { overall_score: 0, confidence: 0, message: 'No valid model responses' };
  }

  const scores = validModels
    .map((m) => {
      const data = m.data;
      return {
        sentiment: data.sentiment || 0,
        innovation: data.innovation_score || 0,
        trust: data.trust_score || 0,
        sustainability: data.sustainability_score || 0,
        value: data.value_score || 0,
      };
    })
    .filter((s) => s !== null);

  if (scores.length === 0) {
    return { overall_score: 0, confidence: 0, message: 'No valid scores' };
  }

  const avgScores = {
    sentiment: average(scores.map((s) => s.sentiment)),
    innovation: average(scores.map((s) => s.innovation)),
    trust: average(scores.map((s) => s.trust)),
    sustainability: average(scores.map((s) => s.sustainability)),
    value: average(scores.map((s) => s.value)),
  };

  const overallScore = (
    (avgScores.sentiment + 1) * 50 +
    avgScores.innovation * 10 +
    avgScores.trust * 10 +
    avgScores.sustainability * 10 +
    avgScores.value * 10
  ) / 5;

  return {
    overall_score: Math.round(overallScore),
    scores: avgScores,
    confidence: validModels.length / Object.keys(models).length,
    models_used: validModels.length,
  };
}

function average(numbers) {
  return numbers.reduce((a, b) => a + b, 0) / numbers.length;
}

// ============================================
// HTTP ENDPOINTS
// ============================================

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'ai-vibes-radar-mcp',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Analyze brand
app.post('/analyze', async (req, res) => {
  try {
    const { brand_name, competitors = [], depth = 'standard' } = req.body;

    if (!brand_name) {
      return res.status(400).json({ 
        error: 'brand_name is required' 
      });
    }

    const result = await analyzeBrandPerception(brand_name, competitors, depth);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Analyze error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Get brand reports
app.get('/reports/:brandName', async (req, res) => {
  try {
    const { brandName } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    const { data, error } = await supabase
      .from('analysis_results')
      .select('*')
      .eq('brand_name', brandName)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    res.json({
      success: true,
      data: {
        brand_name: brandName,
        total_reports: data.length,
        reports: data,
      }
    });
  } catch (error) {
    console.error('Reports error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Compare brands
app.post('/compare', async (req, res) => {
  try {
    const { brand1, brand2 } = req.body;

    if (!brand1 || !brand2) {
      return res.status(400).json({ 
        error: 'brand1 and brand2 are required' 
      });
    }

    const [data1, data2] = await Promise.all([
      supabase
        .from('analysis_results')
        .select('*')
        .eq('brand_name', brand1)
        .order('created_at', { ascending: false })
        .limit(1)
        .single(),
      supabase
        .from('analysis_results')
        .select('*')
        .eq('brand_name', brand2)
        .order('created_at', { ascending: false })
        .limit(1)
        .single(),
    ]);

    if (data1.error || data2.error) {
      return res.json({
        success: true,
        data: {
          status: 'partial',
          message: 'One or both brands need fresh analysis',
          available: {
            [brand1]: !data1.error,
            [brand2]: !data2.error,
          },
        }
      });
    }

    const score1 = data1.data.consensus_score || 0;
    const score2 = data2.data.consensus_score || 0;

    res.json({
      success: true,
      data: {
        comparison: {
          [brand1]: data1.data,
          [brand2]: data2.data,
        },
        winner: Math.abs(score1 - score2) < 5 
          ? { result: 'tie', message: 'Brands are evenly matched' }
          : {
              result: score1 > score2 ? brand1 : brand2,
              margin: Math.abs(score1 - score2),
            }
      }
    });
  } catch (error) {
    console.error('Compare error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 AI Vibes Radar MCP HTTP Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔍 Analyze endpoint: POST http://localhost:${PORT}/analyze`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});
