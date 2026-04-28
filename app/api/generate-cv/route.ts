import { NextResponse, type NextRequest } from "next/server"

// API key de OpenRouter
const OPENROUTER_API_KEY = "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"

// Función para limpiar la respuesta del modelo
function cleanMarkdownResponse(text: string): string {
  let cleaned = text.trim()

  // Remover ```markdown al inicio
  if (cleaned.startsWith("```markdown")) {
    cleaned = cleaned.replace(/^```markdown\s*/, "")
  }

  // Remover ``` al final
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.replace(/\s*```$/, "")
  }

  // Remover cualquier otro bloque de código markdown
  cleaned = cleaned.replace(/^```[\w]*\s*/, "").replace(/\s*```$/, "")

  return cleaned.trim()
}

// Función para llamar a OpenRouter (compatible con OpenAI API)
async function callOpenRouter(systemPrompt: string, userPrompt: string): Promise<string> {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://mejorar.cv", // Tu dominio
      "X-Title": "Mejorar CV Generator" // Nombre de tu app
    },
    body: JSON.stringify({
      model: "openrouter/free", // Free Models Router - elige automáticamente el mejor modelo gratuito
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user", 
          content: userPrompt
        }
      ],
      temperature: 0.3,
      max_tokens: 8192,
      stream: false
    })
  })

  if (!response.ok) {
    const errorData = await response.text()
    console.error("OpenRouter API error:", errorData)
    throw new Error(`OpenRouter API error: ${response.status}`)
  }

  const data = await response.json()
  
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error("Invalid response from OpenRouter")
  }

  return data.choices[0].message.content
}

export async function POST(req: NextRequest) {
  try {
    const data = (await req.json()) as {
      personalInfo: {
        name: string
        email: string
        phone: string
        location: string
      }
      jobDescription: string
      currentExperience: string
      education: string
      skills: string
      promptType: "harvard" | "experience" | "roadmap"
    }

    const { personalInfo, jobDescription, currentExperience, education, skills, promptType } = data

    if (promptType === "roadmap") {
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

      const prompt = `Actuá como un asesor de empleabilidad experto, especializado en ayudar a personas a conseguir trabajo en el mercado actual. 

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

      const text = await callOpenRouter(systemPrompt, prompt)
      const cleanedRoadmap = cleanMarkdownResponse(text)
      return NextResponse.json({ success: true, roadmap: cleanedRoadmap })

    } else {
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
          return NextResponse.json({ success: false, error: "Tipo de prompt inválido" }, { status: 400 })
      }

      const text = await callOpenRouter(systemPrompt, prompt)
      const cleanedCV = cleanMarkdownResponse(text)
      return NextResponse.json({ success: true, cv: cleanedCV })
    }
  } catch (err: any) {
    console.error("OpenRouter error:", err.message || err)
    return NextResponse.json({ success: false, error: "Error interno al generar el contenido" }, { status: 500 })
  }
}
