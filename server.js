#!/usr/bin/env node

/**
 * AI Vibes Radar - MCP Server
 * Exposes brand analysis tools for Claude AI
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

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

// Create MCP server
const server = new Server(
  {
    name: 'ai-vibes-radar-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// ============================================
// TOOL 1: Analyze Brand Perception (Multi-Model)
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
        // Try to extract JSON from the response
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

// ============================================
// TOOL 2: Get Brand Historical Reports
// ============================================
async function getBrandReports(brandName, limit = 10) {
  try {
    const { data, error } = await supabase
      .from('analysis_results')
      .select('*')
      .eq('brand_name', brandName)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return {
      brand_name: brandName,
      total_reports: data.length,
      reports: data,
    };
  } catch (error) {
    throw new Error(`Failed to fetch reports: ${error.message}`);
  }
}

// ============================================
// TOOL 3: Compare Brands
// ============================================
async function compareBrands(brand1, brand2) {
  try {
    // Get latest analysis for both brands
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
      return {
        status: 'partial',
        message: 'One or both brands need fresh analysis',
        available: {
          [brand1]: !data1.error,
          [brand2]: !data2.error,
        },
      };
    }

    return {
      comparison: {
        [brand1]: data1.data,
        [brand2]: data2.data,
      },
      winner: determineWinner(data1.data, data2.data),
    };
  } catch (error) {
    throw new Error(`Failed to compare brands: ${error.message}`);
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================
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
    (avgScores.sentiment + 1) * 50 + // Convert -1 to 1 scale to 0-100
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

function determineWinner(data1, data2) {
  const score1 = data1.consensus_score || 0;
  const score2 = data2.consensus_score || 0;

  if (Math.abs(score1 - score2) < 5) {
    return { result: 'tie', message: 'Brands are evenly matched' };
  }

  return {
    result: score1 > score2 ? data1.brand_name : data2.brand_name,
    margin: Math.abs(score1 - score2),
  };
}

// ============================================
// MCP SERVER HANDLERS
// ============================================

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'analyze_brand_perception',
        description:
          'Analyze how AI models (OpenAI GPT-4 and Anthropic Claude) perceive a brand. Returns sentiment scores, key attributes, competitive positioning, and dimensional scores (innovation, trust, sustainability, value).',
        inputSchema: {
          type: 'object',
          properties: {
            brand_name: {
              type: 'string',
              description: 'The brand name to analyze (e.g., "Nike", "Tesla")',
            },
            competitors: {
              type: 'array',
              items: { type: 'string' },
              description: 'Optional list of competitor brands to compare against',
              default: [],
            },
            depth: {
              type: 'string',
              enum: ['quick', 'standard', 'deep'],
              description: 'Analysis depth level',
              default: 'standard',
            },
          },
          required: ['brand_name'],
        },
      },
      {
        name: 'get_brand_reports',
        description:
          'Retrieve historical brand analysis reports from the database. Returns past analyses with timestamps and trend data.',
        inputSchema: {
          type: 'object',
          properties: {
            brand_name: {
              type: 'string',
              description: 'The brand name to get reports for',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of reports to retrieve',
              default: 10,
            },
          },
          required: ['brand_name'],
        },
      },
      {
        name: 'compare_brands',
        description:
          'Compare two brands side-by-side using their latest analysis data. Shows which brand has better AI perception and by what margin.',
        inputSchema: {
          type: 'object',
          properties: {
            brand1: {
              type: 'string',
              description: 'First brand name',
            },
            brand2: {
              type: 'string',
              description: 'Second brand name',
            },
          },
          required: ['brand1', 'brand2'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    switch (name) {
      case 'analyze_brand_perception': {
        const result = await analyzeBrandPerception(
          args.brand_name,
          args.competitors || [],
          args.depth || 'standard'
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_brand_reports': {
        const result = await getBrandReports(args.brand_name, args.limit || 10);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'compare_brands': {
        const result = await compareBrands(args.brand1, args.brand2);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// ============================================
// START SERVER
// ============================================
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('AI Vibes Radar MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
