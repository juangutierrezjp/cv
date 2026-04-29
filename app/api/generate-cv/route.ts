import { NextResponse, type NextRequest } from "next/server"

// API key de OpenRouter
const OPENROUTER_API_KEY = "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"

// Función para limpiar la respuesta del modelo
function cleanMarkdownResponse(text: string): string {
  let cleaned = text.trim()
  
  if (cleaned.startsWith("```markdown")) {
    cleaned = cleaned.replace(/^```markdown\s*/, "")
  }
  
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.replace(/\s*```$/, "")
  }
  
  cleaned = cleaned.replace(/^```[\w]*\s*/, "").replace(/\s*```$/, "")
  
  return cleaned.trim()
}

// Función para llamar a OpenRouter con reintentos
async function callOpenRouter(systemPrompt: string, userPrompt: string, retryCount = 3): Promise<string> {
  console.log("🚀 Llamando a OpenRouter...")
  console.log("📝 System prompt length:", systemPrompt.length)
  console.log("📝 User prompt length:", userPrompt.length)
  
  for (let attempt = 1; attempt <= retryCount; attempt++) {
    try {
      console.log(`⚡ Attempt ${attempt}/${retryCount}`)
      const startTime = Date.now()
      
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://mejorar.cv",
          "X-Title": "Mejorar CV Generator"
        },
        body: JSON.stringify({
          model: "openrouter/free",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.3,
          max_tokens: 8192,
          stream: false
        })
      })

      const responseTime = Date.now() - startTime
      console.log(`⏱️ OpenRouter response time: ${responseTime}ms`)

      if (!response.ok) {
        const errorData = await response.text()
        console.error(`❌ OpenRouter API error (attempt ${attempt}):`, errorData)
        console.error("📊 Status:", response.status)
        
        // Si es rate limit y quedan reintentos
        if (response.status === 429 && attempt < retryCount) {
          const waitTime = Math.min(2000 * attempt, 5000)
          console.log(`⏳ Rate limited. Waiting ${waitTime}ms before retry...`)
          await new Promise(resolve => setTimeout(resolve, waitTime))
          continue
        }
        
        throw new Error(`OpenRouter API error: ${response.status} - ${errorData}`)
      }

      const data = await response.json()
      console.log("✅ OpenRouter response received successfully")
      
      // Verificar estructura de respuesta
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error("❌ Invalid response structure:", JSON.stringify(data, null, 2))
        
        if (attempt < retryCount) {
          console.log(`⚠️ Retrying due to invalid structure...`)
          await new Promise(resolve => setTimeout(resolve, 1000))
          continue
        }
        
        throw new Error("Invalid response from OpenRouter")
      }

      const content = data.choices[0].message.content
      
      // Verificar que el contenido no sea null o vacío
      if (!content || content.trim() === "") {
        console.error("❌ Empty content received")
        
        if (attempt < retryCount) {
          console.log(`⚠️ Retrying due to empty content...`)
          await new Promise(resolve => setTimeout(resolve, 1000))
          continue
        }
        
        throw new Error("Empty content from OpenRouter")
      }

      console.log("📝 Generated content length:", content.length)
      console.log("🎯 Model used:", data.model)
      
      return content
      
    } catch (error: any) {
      console.error(`❌ Error in attempt ${attempt}:`, error.message)
      
      if (attempt === retryCount) {
        throw error
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
    }
  }
  
  throw new Error("Max retries exceeded")
}

// Función para generar HTML visual
async function generateVisualHTML(roadmapMarkdown: string, userName: string): Promise<string> {
  console.log("🎨 Starting HTML generation for user:", userName)
  
  const systemPrompt = `Eres un experto diseñador web y especialista en experiencia de usuario. Tu tarea es convertir un texto en formato Markdown a un HTML estático de visualización de datos, profesional y fácil de leer para una ruta de búsqueda laboral.

INSTRUCCIONES CRÍTICAS:
- Crea un HTML completo con estructura semánticamente correcta
- Usa CSS moderno con colores profesionales y tipografía clara
- Implementa un diseño responsive que se vea bien en móvil y desktop
- Usa un color profesional azul/teal como tema principal
- Incluye iconos visuales para secciones importantes
- Haz que sea visualmente atractivo con secciones bien diferenciadas
- NO INCLUYAS elementos interactivos: sin botones, sin navegación por anclas, sin enlaces de acción
- El HTML debe ser estático, solo para visualización de información
- El HTML debe ser autocontenido (CSS inline)
- Usa clases CSS modernas y atractivas`

  const prompt = `Convierte el siguiente roadmap de búsqueda laboral a un HTML estático de visualización de datos:

# Ruta de Búsqueda Laboral para ${userName}

${roadmapMarkdown}

REQUISITOS DE DISEÑO:
1. Header claro con título y nombre del usuario
2. Secciones bien definidas con colores de fondo sutiles
3. Colores profesionales: azul (#2563eb), teal (#0891b2), grises
4. Tipografía: Inter o similar, legible y profesional
5. Iconos para cada sección (usa emojis o SVG simple)
6. Tarjetas (cards) estáticas para información organizada
7. Barras de progreso visuales (solo para mostrar información, no interactivas)
8. NO incluyas botones, enlaces de acción, ni navegación
9. Footer con información adicional
10. Todo el contenido debe ser estático y fácil de leer

IMPORTANTE: Responde SOLO con el código HTML completo, sin explicaciones ni texto adicional. El HTML debe ser estático para visualización de datos.`

  console.log("🎨 Calling OpenRouter for HTML generation...")
  const htmlContent = await callOpenRouter(systemPrompt, prompt)
  console.log("✅ HTML generation completed")
  
  return htmlContent
}

export async function POST(req: NextRequest) {
  try {
    console.log("🔥 API request received")
    const requestData = await req.json()
    console.log("📋 Request data:", JSON.stringify(requestData, null, 2))
    
    const data = requestData as {
      personalInfo: { name: string; email: string; phone: string; location: string }
      jobDescription: string
      currentExperience: string
      education: string
      skills: string
      promptType: "harvard" | "experience" | "roadmap"
    }

    const { personalInfo, jobDescription, currentExperience, education, skills, promptType } = data
    
    console.log("🎯 Prompt type:", promptType)
    console.log("👤 User name:", personalInfo.name)

    if (promptType === "roadmap") {
      console.log("🛣️ Generating roadmap...")
      
      const systemPrompt = `Eres un asesor de empleabilidad experto, especializado en ayudar a personas a conseguir trabajo en el mercado actual. 

INSTRUCCIONES CRÍTICAS:
- Responde ÚNICAMENTE con el contenido de la ruta de búsqueda laboral en formato Markdown
- NO agregues explicaciones, comentarios, ni texto adicional
- NO digas "Aquí tienes", "Absolutamente", ni frases similares
- Comienza directamente con el título de la ruta
- Usa formato Markdown profesional: ## para secciones, **texto** para negritas, - para listas
- Responde siempre en español
- Sé extenso, detallado y específico con acciones concretas`

      const userInfo = `
INFORMACIÓN PERSONAL:
Nombre: ${personalInfo.name}
Ubicación: ${personalInfo.location}

EXPERIENCIA LABORAL:
${currentExperience}

EDUCACIÓN:
${education}

HABILIDADES TÉCNICAS:
${skills}
      `.trim()

      const prompt = `Actuá como un asesor de empleabilidad experto. 

Tu objetivo es crear un plan personalizado y EXTENSO de búsqueda laboral basado ÚNICAMENTE en el perfil del candidato, incluyendo:

## ESTRUCTURA REQUERIDA:
1. **Análisis del Perfil Profesional** - Fortalezas, áreas de mejora, posicionamiento
2. **Estrategia de Búsqueda Personalizada** - Canales, plataformas, networking
3. **Optimización de Herramientas** - CV, LinkedIn, portafolio
4. **Plan de Acción Semanal** - Tareas específicas por semana (12 semanas)
5. **Acciones Diarias Recomendadas** - Rutina diaria de búsqueda
6. **Seguimiento y Métricas** - KPIs y tracking de progreso
7. **Preparación para Entrevistas** - Técnicas y práctica específica
8. **Networking Estratégico** - Contactos clave y eventos
9. **Desarrollo Profesional Continuo** - Cursos, certificaciones
10. **Plan de Contingencia** - Alternativas y pivoteo

## REQUISITOS ESPECÍFICOS:
- Adaptá las sugerencias al perfil específico del candidato
- Incluye acciones DIARIAS concretas y medibles
- Proporciona cronograma SEMANAL detallado para 12 semanas
- Sugiere plataformas específicas según el sector
- Incluye templates de mensajes y emails
- Proporciona métricas de seguimiento
- Sé específico con nombres de plataformas, herramientas y recursos
- El objetivo es lograr resultados visibles en 2-3 meses

IMPORTANTE: Responde SOLO con la ruta de búsqueda laboral completa en Markdown. No agregues explicaciones ni comentarios.

${userInfo}`

      console.log("📝 Starting roadmap generation...")
      const text = await callOpenRouter(systemPrompt, prompt)
      console.log("🎯 Roadmap generation completed")
      
      const cleanedRoadmap = cleanMarkdownResponse(text)
      console.log("🧹 Roadmap cleaned, length:", cleanedRoadmap.length)
      
      // Ahora generar el HTML visual
      console.log("🎨 Starting HTML generation...")
      const htmlContent = await generateVisualHTML(cleanedRoadmap, personalInfo.name)
      console.log("🎨 HTML generation completed, length:", htmlContent.length)
      
      return NextResponse.json({ 
        success: true, 
        roadmap: cleanedRoadmap,
        html: htmlContent 
      })

    } else {
      console.log("📄 Generating CV...")
      
      const systemPrompt = `Eres un experto en recursos humanos y creación de currículums para el sector IT. 

INSTRUCCIONES CRÍTICAS:
- Responde ÚNICAMENTE con el contenido del currículum en formato Markdown
- NO agregues explicaciones, comentarios, ni texto adicional
- NO digas "Aquí tienes", "Absolutamente", ni frases similares
- Comienza directamente con el nombre de la persona
- Usa formato Markdown profesional: ## para secciones, **texto** para negritas, - para listas
- Responde siempre en español`

      const userInfo = `
INFORMACIÓN PERSONAL:
Nombre: ${personalInfo.name}
Email: ${personalInfo.email}
Teléfono: ${personalInfo.phone}
Ubicación: ${personalInfo.location}

EXPERIENCIA LABORAL:
${currentExperience}

EDUCACIÓN:
${education}

HABILIDADES TÉCNICAS:
${skills}

${jobDescription ? `DESCRIPCIÓN DEL PUESTO DE INTERÉS:\n${jobDescription}` : ""}
      `.trim()

      let prompt = ""
      switch (promptType) {
        case "harvard":
          prompt = `Genera un currículum profesional estilo Harvard optimizado para ATS. Estructura:

# ${personalInfo.name}

## Datos Personales
## Perfil Profesional  
## Experiencia Laboral
## Educación
## Habilidades Técnicas

IMPORTANTE: Responde SOLO con el currículum en Markdown. No agregues explicaciones ni comentarios.

${userInfo}`
          break
        case "experience":
          prompt = `Mejora las experiencias laborales con verbos de acción y logros cuantificables. Enfócate en resultados medibles.

IMPORTANTE: Responde SOLO con el currículum completo en Markdown. No agregues explicaciones ni comentarios.

${userInfo}`
          break
        default:
          console.error("❌ Invalid prompt type:", promptType)
          return NextResponse.json({ success: false, error: "Tipo de prompt inválido" }, { status: 400 })
      }

      const text = await callOpenRouter(systemPrompt, prompt)
      const cleanedCV = cleanMarkdownResponse(text)
      console.log("📄 CV generation completed, length:", cleanedCV.length)
      
      return NextResponse.json({ success: true, cv: cleanedCV })
    }
  } catch (err: any) {
    console.error("❌ API error:", err.message || err)
    console.error("❌ Error stack:", err.stack)
    return NextResponse.json({ success: false, error: "Error interno al generar el contenido" }, { status: 500 })
  }
}
