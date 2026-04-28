# Migración a OpenRouter

Este documento explica cómo configurar OpenRouter como motor de generación para tu proyecto CV Automation Tool.

## Ventajas de OpenRouter

- **Sin límites de peticiones** con el plan gratuito
- **Acceso a múltiples modelos** a través de una API unificada
- **Compatible con formato OpenAI**, facilitando la migración
- **Ideal para uso comunitario** y despliegue abierto
- **Free Models Router** que automáticamente elige el mejor modelo gratuito disponible

## Pasos de configuración

### 1. Crear cuenta en OpenRouter

1. Ve a [https://openrouter.ai/](https://openrouter.ai/)
2. Crea una cuenta gratuita
3. Ve a tu dashboard y obtén tu API key

### 2. Configurar API Key

1. Reemplaza `sk-or-xxxx-your-api-key-here` en `.env.local` con tu API key real
2. Asegúrate de que el archivo `.env.local` no se suba a GitHub (ya está en .gitignore)

### 3. Modelos utilizados

El proyecto ahora usa `openrouter/free` que automáticamente elige el mejor modelo gratuito disponible según las necesidades de la solicitud.

Alternativas específicas que puedes probar:
- `deepseek/deepseek-chat:free` - Buen rendimiento para generación de texto
- `meta-llama/llama-3.2-3b-instruct:free` - Modelo ligero y capable

### 4. Despliegue en Vercel

Cuando despliegues en Vercel:
1. Añade la variable de entorno `OPENROUTER_API_KEY` en las configuraciones de tu proyecto
2. Ve a tu proyecto en Vercel > Settings > Environment Variables
3. Añade:
   - Key: `OPENROUTER_API_KEY`
   - Value: Tu API key de OpenRouter

### 5. Probar localmente

```bash
npm run dev
```

## Cambios realizados

- ✅ Reemplazada API de Gemini por OpenRouter
- ✅ Usando formato compatible con OpenAI
- ✅ Implementado Free Models Router para uso gratuito
- ✅ Configuración de variables de entorno
- ✅ Actualizados mensajes de error

## Consideraciones

- Los modelos gratuitos pueden tener diferentes capacidades que Gemini
- El tiempo de respuesta puede variar según el modelo elegido
- Para uso en producción, considera un plan pago de OpenRouter para mayor estabilidad

## Soporte

Si tienes problemas con la integración, revisa:
1. Que tu API key sea válida
2. Que tengas crédito en tu cuenta de OpenRouter
3. Los logs de errores en la consola de desarrollo