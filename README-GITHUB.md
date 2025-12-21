# 🚀 AI Vibes Radar - MCP Server

**Model Context Protocol Server** para análisis de percepción de marca multi-modelo (OpenAI + Anthropic).

## ⚡ Quick Start

### 1. Clone este repositorio

```bash
git clone https://github.com/TU_USUARIO/ai-vibes-mcp-server.git
cd ai-vibes-mcp-server
```

### 2. Instala dependencias

```bash
npm install
```

### 3. Configura variables de entorno

Crea un archivo `.env` con tus keys:

```env
SUPABASE_URL=tu_supabase_url
SUPABASE_ANON_KEY=tu_supabase_anon_key
OPENAI_API_KEY=tu_openai_key
ANTHROPIC_API_KEY=tu_anthropic_key
```

### 4. Ejecuta el servidor

```bash
npm start
```

## 🚂 Deploy a Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template)

1. Click el botón de arriba
2. Conecta tu repo de GitHub
3. Agrega las variables de entorno
4. Deploy automático ✅

## 📚 Documentación

- [Guía Completa de Instalación](README.md)
- [Ejemplos de Uso](EXAMPLES.md)
- [Schema de Supabase](supabase-schema.sql)

## 🛠️ Herramientas Disponibles

- `analyze_brand_perception` - Análisis multi-modelo de marcas
- `get_brand_reports` - Reportes históricos
- `compare_brands` - Comparación competitiva

## 📝 License

MIT
