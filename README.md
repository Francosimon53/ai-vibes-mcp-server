# 🚀 AI Vibes Radar - MCP Server
## Guía de Instalación y Deploy (30 minutos)

---

## 📦 PASO 1: Preparar el Proyecto Localmente (5 mins)

### 1.1 Crea una carpeta nueva en tu computadora:

```bash
mkdir ai-vibes-mcp-server
cd ai-vibes-mcp-server
```

### 1.2 Copia estos 3 archivos a la carpeta:
- `server.js` (el archivo principal del servidor)
- `package.json` (dependencias)
- `.env.example` (plantilla de variables de entorno)

### 1.3 Crea tu archivo `.env` real:

```bash
cp .env.example .env
```

Luego edita `.env` y pega tus keys reales:

```env
SUPABASE_URL=https://mcmbhkexkdfxbhgepcot.supabase.co
SUPABASE_ANON_KEY=tu_key_aqui
OPENAI_API_KEY=sk-tu-key-aqui
ANTHROPIC_API_KEY=sk-ant-tu-key-aqui
```

### 1.4 Instala las dependencias:

```bash
npm install
```

### 1.5 Prueba que funcione localmente:

```bash
npm start
```

Deberías ver: `AI Vibes Radar MCP Server running on stdio`

✅ Si ves ese mensaje, **¡FUNCIONA!** Presiona Ctrl+C para detenerlo.

---

## 🚂 PASO 2: Deploy a Railway (10 mins)

Railway es gratis para empezar y mantiene tu servidor activo 24/7.

### 2.1 Crea cuenta en Railway:
1. Ve a https://railway.app
2. Sign up con GitHub (más fácil)
3. Verifica tu email

### 2.2 Inicializa Git en tu proyecto:

```bash
git init
git add .
git commit -m "Initial MCP server"
```

### 2.3 Sube a GitHub (opcional pero recomendado):

```bash
# Crea un repo nuevo en github.com llamado "ai-vibes-mcp-server"
# Luego:
git remote add origin https://github.com/TU_USUARIO/ai-vibes-mcp-server.git
git push -u origin main
```

### 2.4 Deploy a Railway:

**Opción A - Con GitHub (Recomendado):**
1. En Railway, click "New Project"
2. Click "Deploy from GitHub repo"
3. Selecciona `ai-vibes-mcp-server`
4. Railway detectará automáticamente que es Node.js

**Opción B - Sin GitHub:**
1. En Railway, click "New Project"
2. Click "Empty Project"
3. Click "Deploy from local repo"
4. Arrastra tu carpeta `ai-vibes-mcp-server`

### 2.5 Configura las variables de entorno en Railway:

1. Ve a tu proyecto en Railway
2. Click en "Variables"
3. Agrega una por una:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY`
   - `ANTHROPIC_API_KEY`
   - `NODE_ENV` = `production`

4. Click "Deploy" si no se deployó automáticamente

### 2.6 Verifica que esté corriendo:

1. En Railway, ve a "Deployments"
2. Click en el último deployment
3. Ve a "Logs"
4. Deberías ver: "AI Vibes Radar MCP Server running on stdio"

✅ **¡DEPLOYED!** Tu servidor MCP está activo 24/7.

---

## 🔗 PASO 3: Conectar con Claude Desktop (15 mins)

Ahora vamos a conectar tu MCP server con Claude Desktop para que puedas usarlo.

### 3.1 Descarga Claude Desktop:
- Mac: https://claude.ai/download
- Windows: Próximamente (usa alternativa abajo)

### 3.2 Configura el MCP Server:

**En Mac/Linux:**

Edita el archivo de configuración de Claude:

```bash
code ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

Agrega:

```json
{
  "mcpServers": {
    "ai-vibes-radar": {
      "command": "npx",
      "args": ["-y", "ai-vibes-radar-mcp"],
      "env": {
        "SUPABASE_URL": "https://mcmbhkexkdfxbhgepcot.supabase.co",
        "SUPABASE_ANON_KEY": "tu_key_aqui",
        "OPENAI_API_KEY": "sk-tu-key-aqui",
        "ANTHROPIC_API_KEY": "sk-ant-tu-key-aqui"
      }
    }
  }
}
```

**ALTERNATIVA - Usar directamente claude.ai:**

Si no tienes Claude Desktop, puedes configurar el MCP server para que funcione vía HTTP y conectarlo a claude.ai. Te explico cómo en el siguiente paso.

### 3.3 Reinicia Claude Desktop:

1. Cierra completamente Claude Desktop
2. Ábrelo de nuevo
3. Deberías ver un ícono de herramientas 🔧 en la esquina

### 3.4 Prueba tu MCP Server:

Escribe en Claude Desktop:

> "Analiza la percepción de Nike"

Claude debería usar tu MCP server y ejecutar el análisis con OpenAI + Anthropic.

---

## ✅ VERIFICACIÓN FINAL

Tu MCP Server está funcionando si:

1. ✅ Railway muestra "Active" y logs sin errores
2. ✅ Claude Desktop muestra el ícono de herramientas 🔧
3. ✅ Puedes pedirle a Claude que analice marcas y responde con datos

---

## 🎯 PRÓXIMOS PASOS

Una vez que esto funcione:

1. **Fase 2**: Agregar interfaz conversacional a tu app web
2. **Fase 3**: Implementar features premium (alertas, briefings, etc.)
3. **Monetización**: Configurar planes de precios

---

## 🆘 TROUBLESHOOTING

### Problema: "Module not found"
**Solución:** 
```bash
rm -rf node_modules package-lock.json
npm install
```

### Problema: "SUPABASE_URL is not defined"
**Solución:** Verifica que tu `.env` tenga todas las variables y reinicia el servidor

### Problema: "API key invalid"
**Solución:** Ve a:
- OpenAI: https://platform.openai.com/api-keys
- Anthropic: https://console.anthropic.com/settings/keys
- Supabase: Project Settings → API → anon key

### Problema: Railway no hace deploy
**Solución:** Asegúrate de tener `package.json` en la raíz del proyecto

---

## 📞 SOPORTE

Si algo no funciona, comparte:
1. Los logs de Railway
2. El mensaje de error exacto
3. Qué paso estabas intentando

¡Vamos con todo! 🚀
