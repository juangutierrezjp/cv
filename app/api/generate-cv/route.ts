import { NextResponse, type NextRequest } from "next/server"

// API key de Gemini
const GEMINI_API_KEY = "AIzaSyC_MDBbQzne6IndYuvzrPR6-6ASkGK-cqQ"

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

// Función para llamar a Gemini 2.5 Flash directamente
async function callGemini(systemPrompt: string, userPrompt: string): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
      }),
    }
  )

  if (!response.ok) {
    const errorData = await response.text()
    console.error("Gemini API error:", errorData)
    throw new Error(`Gemini API error: ${response.status}`)
  }

  const data = await response.json()
  
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    throw new Error("Invalid response from Gemini")
  }

  return data.candidates[0].content.parts[0].text
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

      const text = await callGemini(systemPrompt, prompt)
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

      const text = await callGemini(systemPrompt, prompt)
      const cleanedCV = cleanMarkdownResponse(text)
      return NextResponse.json({ success: true, cv: cleanedCV })
    }
  } catch (err: any) {
    console.error("Gemini error:", err.message || err)
    return NextResponse.json({ success: false, error: "Error interno al generar el contenido" }, { status: 500 })
  }
}
