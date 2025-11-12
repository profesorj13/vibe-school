# Configuración de Credenciales de Azure (Variables de Entorno)

## ✅ La aplicación ya está preparada

La app de Electron ya está configurada para leer las credenciales de Azure desde variables de entorno automáticamente.

## 📝 Cómo configurar tus credenciales

**Crea un archivo `.env` en la raíz del proyecto** (al mismo nivel que `package.json`):

```bash
# Azure OpenAI Credentials
AZURE_API_KEY=tu-azure-api-key-real-aqui
AZURE_RESOURCE_NAME=diego-mapp46ay-eastus2
```

**Nota:** Ya tienes el `AZURE_RESOURCE_NAME` correcto: `diego-mapp46ay-eastus2`. Solo necesitas agregar tu API Key real.

## 🔑 ¿Dónde encuentro mis credenciales de Azure?

### Azure API Key
1. Ve a [Azure Portal](https://portal.azure.com/)
2. Busca tu recurso de Azure OpenAI
3. En el menú lateral, ve a **"Keys and Endpoint"**
4. Copia **KEY 1** o **KEY 2**

### Azure Resource Name
Es el nombre de tu recurso de Azure OpenAI. Por ejemplo:
- Si tu endpoint es: `https://mi-recurso.openai.azure.com/`
- Tu Resource Name es: `mi-recurso`

## 🚀 Después de configurar

1. Guarda el archivo `.env`
2. Reinicia la aplicación Electron (si está corriendo, para el proceso y vuelve a levantar)
3. ¡Listo! Azure estará configurado automáticamente

## ⚠️ Nota de Seguridad

**IMPORTANTE:** El archivo `.env` ya está incluido en `.gitignore`, así que tus credenciales **NO se subirán a Git**. ✅

Esto es lo correcto para mantener tus credenciales seguras.

## 📋 Verificación

Para verificar que está funcionando:
1. Abre la aplicación
2. Ve a Settings → Providers → Azure
3. Deberías ver que Azure está marcado como configurado ✅
4. Intenta hacer un chat usando un modelo de Azure

## 🎯 Modelos disponibles

Con Azure configurado, puedes usar:
- GPT-5 Codex
- GPT-5
- GPT-5 Mini
- GPT-5 Nano
- GPT-5 Chat

Selecciónalos desde el selector de modelos en la interfaz principal.

---

## 🔧 Cómo funciona (Detalles técnicos)

La aplicación ya tiene todo implementado:

1. **Carga de variables de entorno** (`src/main.ts`):
   - Al iniciar, Electron carga el archivo `.env` usando `dotenv.config()`
   - También usa `shell-env` para leer variables del sistema

2. **Lectura de credenciales** (`src/ipc/utils/get_model_client.ts`):
   - Cuando usas un modelo de Azure, la app busca:
     - Primero: Credenciales guardadas en settings (desde la UI)
     - Segundo: Variables de entorno `AZURE_API_KEY` y `AZURE_RESOURCE_NAME`
   - Si encuentra alguna, la usa automáticamente

3. **Sin hardcodear** (`src/main/settings.ts`):
   - Los `DEFAULT_SETTINGS` están limpios (sin credenciales hardcodeadas)
   - Las credenciales solo vienen del `.env` o de settings guardados

**Prioridad de credenciales:**
```
Settings guardados > Variables de entorno > Error
```

Esto significa que si guardas credenciales desde la UI, esas tendrán prioridad sobre las del `.env`.

