"use client"

import { useState } from "react"
import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Loader2, Download, FileText, MapPin,
  CheckCircle2, Target, FileSearch, Calendar, Zap, Sparkles,
  Check, ArrowLeft, RotateCcw,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/toaster"

// ─── Types ────────────────────────────────────────────────────────────────────

type FileStatus = "idle" | "loading" | "done" | "error"

// ─── Sub-components ───────────────────────────────────────────────────────────

function AuroraBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 grid-overlay" />
      <div className="absolute w-[700px] h-[700px] rounded-full bg-violet-600 opacity-[0.18] blur-[140px] -top-40 -left-40 animate-aurora-1" />
      <div className="absolute w-[560px] h-[560px] rounded-full bg-blue-700 opacity-[0.11] blur-[130px] -bottom-24 -right-24 animate-aurora-2" />
      <div className="absolute w-[420px] h-[420px] rounded-full bg-violet-500 opacity-[0.09] blur-[100px] top-1/3 right-1/4 animate-aurora-3" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,transparent_35%,#0A0E1A_100%)]" />
    </div>
  )
}

function SaltaDevBadge() {
  return (
    <span className="inline-flex items-center gap-1.5">
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M8 1.5L13.5 4.5V11.5L8 14.5L2.5 11.5V4.5L8 1.5Z"
          fill="rgba(139,92,246,0.20)"
          stroke="rgba(139,92,246,0.60)"
          strokeWidth="1"
        />
        <path
          d="M5.5 8L7 9.5L10.5 6"
          stroke="rgba(167,139,250,0.95)"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-violet-400/80 font-medium">Salta Dev</span>
    </span>
  )
}

function StepIndicator({ currentStep }: { currentStep: 1 | 2 }) {
  return (
    <div className="flex items-center justify-center mb-10">
      {/* Paso 1 */}
      <div className="flex flex-col items-center gap-1.5">
        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-semibold transition-all duration-300
          ${currentStep >= 1 ? "border-blue-500 bg-blue-500 text-white shadow-[0_0_16px_rgba(37,99,235,0.35)]" : "border-white/20 bg-transparent text-white/40"}`}>
          {currentStep > 1 ? <Check className="w-4 h-4" /> : "1"}
        </div>
        <span className={`text-[11px] transition-colors duration-300 ${currentStep === 1 ? "text-white/65" : "text-white/35"}`}>
          Tus datos
        </span>
      </div>
      {/* Línea */}
      <div className="relative w-24 mx-3 mb-4">
        <div className="h-px bg-white/[0.10] w-full" />
        <div
          className="h-px bg-blue-500/60 absolute top-0 left-0 transition-all duration-700 ease-out"
          style={{ width: currentStep > 1 ? "100%" : "0%" }}
        />
      </div>
      {/* Paso 2 */}
      <div className="flex flex-col items-center gap-1.5">
        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-semibold transition-all duration-300
          ${currentStep === 2 ? "border-blue-500 bg-blue-500 text-white shadow-[0_0_16px_rgba(37,99,235,0.35)]" : "border-white/15 bg-transparent text-white/25"}`}>
          2
        </div>
        <span className={`text-[11px] transition-colors duration-300 ${currentStep === 2 ? "text-white/65" : "text-white/25"}`}>
          Resultados
        </span>
      </div>
    </div>
  )
}

function FileCard({
  icon: Icon,
  title,
  description,
  status,
  onDownload,
  onRetry,
}: {
  icon: LucideIcon
  title: string
  description: string
  status: FileStatus
  onDownload: () => void
  onRetry?: () => void
}) {
  return (
    <div className={`glass-card rounded-2xl p-5 flex items-center gap-4 transition-all duration-500
      ${status === "done" ? "border-blue-500/[0.22]" : ""}`}>
      {/* Ícono */}
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300
        ${status === "done"    ? "bg-blue-500/15 border border-blue-500/25" :
          status === "error"   ? "bg-red-500/10 border border-red-500/20" :
          status === "loading" ? "bg-white/[0.06] border border-white/10" :
                                 "bg-white/[0.04] border border-white/[0.08]"}`}>
        {status === "loading"
          ? <Loader2 className="w-5 h-5 text-white/40 animate-spin" />
          : <Icon className={`w-5 h-5 transition-colors duration-300
              ${status === "done" ? "text-blue-400" : status === "error" ? "text-red-400" : "text-white/22"}`} />
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={`font-medium text-sm transition-colors duration-300
          ${status === "done" ? "text-white" : "text-white/65"}`}>
          {title}
        </p>
        <p className={`text-xs mt-0.5 transition-colors duration-300
          ${status === "loading" ? "text-white/35" :
            status === "done"    ? "text-blue-400/65" :
            status === "error"   ? "text-red-400/65" :
                                   "text-white/28"}`}>
          {status === "idle"    ? description :
           status === "loading" ? "Generando con IA..." :
           status === "done"    ? "Listo para descargar" :
                                  "Error al generar — podés reintentar"}
        </p>
        {status === "loading" && (
          <div className="mt-2.5 space-y-1.5">
            {[58, 36, 72].map((w, i) => (
              <div key={i} className="h-1.5 rounded-full skeleton" style={{ width: `${w}%` }} />
            ))}
          </div>
        )}
      </div>

      {/* Acción */}
      <div className="flex-shrink-0">
        {status === "error" && onRetry ? (
          <Button
            onClick={onRetry}
            size="sm"
            className="h-9 px-3 bg-white/[0.06] border border-white/[0.14] hover:bg-white/10 text-white/60 hover:text-white transition-all duration-200"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
            Reintentar
          </Button>
        ) : (
          <Button
            onClick={onDownload}
            disabled={status !== "done"}
            size="sm"
            className="h-9 px-4 bg-blue-600 hover:bg-blue-500 text-white shadow-[0_4px_16px_-4px_rgba(37,99,235,0.4)] hover:shadow-[0_4px_24px_-4px_rgba(37,99,235,0.6)] disabled:opacity-20 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Descargar
          </Button>
        )}
      </div>
    </div>
  )
}

// ─── Shared constants ─────────────────────────────────────────────────────────

const inputCls =
  "bg-white/[0.04] border-white/[0.10] text-white placeholder:text-white/25 focus-visible:border-blue-500/40 focus-visible:ring-1 focus-visible:ring-blue-500/20 transition-colors duration-200"

const labelCls = "text-[10px] uppercase tracking-widest text-white/45 mb-1.5 block"

const tabsTriggerCls =
  "flex-1 rounded-full text-white/45 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm text-xs py-1.5 transition-all duration-200"

const tips: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: CheckCircle2, title: "Revisá el resultado",   body: "Ajustalo para que suene auténtico." },
  { icon: Target,       title: "Seguí el plan",         body: "La ruta funciona paso a paso." },
  { icon: FileSearch,   title: "Sin fotos ni gráficos", body: "Necesario para el ATS." },
  { icon: Zap,          title: "Palabras clave",        body: "Usá términos del puesto objetivo." },
  { icon: Calendar,     title: "Constancia diaria",     body: "La ruta requiere dedicación." },
  { icon: Sparkles,     title: "IA personalizada",      body: "Generación adaptada a tu perfil." },
]

// ─── Main component ───────────────────────────────────────────────────────────

export default function CVGenerator() {
  const [currentStep, setCurrentStep]   = useState<1 | 2>(1)
  const [personalInfo, setPersonalInfo] = useState({ name: "", email: "", phone: "", location: "" })
  const [jobDescription, setJobDescription]       = useState("")
  const [currentExperience, setCurrentExperience] = useState("")
  const [education, setEducation]                 = useState("")
  const [skills, setSkills]                       = useState("")
  const [cvContent, setCvContent]                 = useState("")
  const [roadmapContent, setRoadmapContent]       = useState("")
  const [cvStatus, setCvStatus]                   = useState<FileStatus>("idle")
  const [roadmapStatus, setRoadmapStatus]         = useState<FileStatus>("idle")
  const [formError, setFormError]                 = useState("")
  const { toast } = useToast()

  // ─── API helpers ──────────────────────────────────────────────────────────

  async function fetchCV(): Promise<string> {
    const res = await fetch("/api/generate-cv", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        personalInfo, jobDescription, currentExperience, education, skills,
        promptType: "harvard",
      }),
    })
    if (!res.ok) {
      const { error } = await res.json()
      throw new Error(error)
    }
    const { cv } = await res.json()
    return cv
  }

  async function fetchRoadmap(): Promise<string> {
    const res = await fetch("/api/generate-cv", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        personalInfo, currentExperience, education, skills,
        promptType: "roadmap",
      }),
    })
    if (!res.ok) {
      const { error } = await res.json()
      throw new Error(error)
    }
    const { roadmap } = await res.json()
    return roadmap
  }

  // ─── Generation flow ──────────────────────────────────────────────────────

  async function runGeneration() {
    setCvContent("")
    setRoadmapContent("")
    setCvStatus("loading")
    setRoadmapStatus("idle")

    try {
      const cv = await fetchCV()
      setCvContent(cv)
      setCvStatus("done")
      toast({ title: "¡CV listo!", description: "Generando tu ruta de búsqueda laboral..." })
    } catch (err) {
      console.error(err)
      setCvStatus("error")
      toast({ title: "Error al generar el CV", description: "Verificá tu conexión e intentá de nuevo.", variant: "destructive" })
      return
    }

    setRoadmapStatus("loading")
    try {
      const roadmap = await fetchRoadmap()
      setRoadmapContent(roadmap)
      setRoadmapStatus("done")
      toast({ title: "¡Todo listo!", description: "Tus archivos están listos para descargar." })
    } catch (err) {
      console.error(err)
      setRoadmapStatus("error")
      toast({ title: "Error al generar la ruta", description: "Podés reintentarla desde el botón.", variant: "destructive" })
    }
  }

  async function retryCV() {
    setCvStatus("loading")
    setCvContent("")
    setRoadmapStatus("idle")
    setRoadmapContent("")
    try {
      const cv = await fetchCV()
      setCvContent(cv)
      setCvStatus("done")
      setRoadmapStatus("loading")
      const roadmap = await fetchRoadmap()
      setRoadmapContent(roadmap)
      setRoadmapStatus("done")
      toast({ title: "¡Todo listo!", description: "Tus archivos están listos para descargar." })
    } catch (err) {
      console.error(err)
      setCvStatus("error")
    }
  }

  async function retryRoadmap() {
    setRoadmapStatus("loading")
    setRoadmapContent("")
    try {
      const roadmap = await fetchRoadmap()
      setRoadmapContent(roadmap)
      setRoadmapStatus("done")
      toast({ title: "¡Ruta generada!", description: "Tu hoja de ruta está lista." })
    } catch (err) {
      console.error(err)
      setRoadmapStatus("error")
    }
  }

  // ─── Navigation ───────────────────────────────────────────────────────────

  function handleContinue() {
    if (!personalInfo.name.trim()) {
      setFormError("Tu nombre completo es requerido para continuar.")
      return
    }
    if (!currentExperience.trim()) {
      setFormError("Describí tu experiencia laboral para poder generar el CV.")
      return
    }
    setFormError("")
    setCurrentStep(2)
    runGeneration()
  }

  function handleBack() {
    setCurrentStep(1)
    setCvStatus("idle")
    setRoadmapStatus("idle")
    setCvContent("")
    setRoadmapContent("")
  }

  // ─── PDF download (lógica original intacta) ───────────────────────────────

  async function downloadPDF(content: string, fileName: string) {
    if (!content) return
    const { default: jsPDF } = await import("jspdf")
    const pdf = new jsPDF()
    const pageWidth = pdf.internal.pageSize.getWidth()
    const margin = 20
    const maxWidth = pageWidth - 2 * margin
    let yPosition = margin

    const addFormattedText = (text: string, fontSize = 12, defaultBold = false) => {
      pdf.setFontSize(fontSize)
      const estimatedHeight = fontSize * 0.6 + 5
      if (yPosition + estimatedHeight > pdf.internal.pageSize.getHeight() - margin) {
        pdf.addPage()
        yPosition = margin
      }
      const parts = text.split(/(\*\*.*?\*\*)/g)
      let xPosition = margin
      parts.forEach((part) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          const boldText = part.replace(/\*\*/g, "")
          pdf.setFont("helvetica", "bold")
          const lines = pdf.splitTextToSize(boldText, maxWidth - (xPosition - margin))
          lines.forEach((line: string, index: number) => {
            if (index > 0) { yPosition += fontSize * 0.6; xPosition = margin }
            pdf.text(line, xPosition, yPosition)
            xPosition += pdf.getTextWidth(line)
          })
        } else if (part.trim()) {
          pdf.setFont("helvetica", defaultBold ? "bold" : "normal")
          const lines = pdf.splitTextToSize(part, maxWidth - (xPosition - margin))
          lines.forEach((line: string, index: number) => {
            if (index > 0) { yPosition += fontSize * 0.6; xPosition = margin }
            pdf.text(line, xPosition, yPosition)
            xPosition += pdf.getTextWidth(line)
          })
        }
      })
      yPosition += fontSize * 0.6 + 5
    }

    const addSimpleText = (text: string, fontSize = 12, isBold = false) => {
      pdf.setFontSize(fontSize)
      pdf.setFont("helvetica", isBold ? "bold" : "normal")
      const lines = pdf.splitTextToSize(text, maxWidth)
      if (yPosition + lines.length * fontSize * 0.5 > pdf.internal.pageSize.getHeight() - margin) {
        pdf.addPage()
        yPosition = margin
      }
      pdf.text(lines, margin, yPosition)
      yPosition += lines.length * fontSize * 0.5 + 5
    }

    content.split("\n").forEach((line) => {
      line = line.trim()
      if (!line) { yPosition += 5; return }
      if (line.startsWith("# "))        { addSimpleText(line.replace("# ", ""),   18, true); yPosition += 5 }
      else if (line.startsWith("## "))  { addSimpleText(line.replace("## ", ""),  14, true); yPosition += 3 }
      else if (line.startsWith("### ")) { addSimpleText(line.replace("### ", ""), 12, true) }
      else if (line.startsWith("- "))   { addFormattedText("• " + line.replace("- ", ""), 11, false) }
      else                              { addFormattedText(line, 11, false) }
    })

    pdf.save(fileName)
  }

  // ─── JSX ──────────────────────────────────────────────────────────────────

  const isGenerating = cvStatus === "loading" || roadmapStatus === "loading"
  const allDone = cvStatus === "done" && roadmapStatus === "done"

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "#0A0E1A" }}>
      <AuroraBackground />

      <div className="relative z-10 min-h-screen flex flex-col">

        {/* ── Navbar ── */}
        <nav className="flex items-center justify-between px-6 py-4 border-b border-white/[0.055]">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.7)]" />
            <span className="text-white font-semibold tracking-tight text-sm select-none">
              Mejorar<span className="text-blue-400">.</span>cv
            </span>
          </div>
          <a
            href="https://www.instagram.com/juanpa.soy/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-white/35 hover:text-white/65 transition-colors duration-200 text-xs"
          >
            <span>por Juan Guzmán</span>
            <div className="w-3.5 h-3.5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
              <svg width="8" height="6" viewBox="0 0 10 8" fill="none">
                <path d="M8.5 1L3.5 6L1.5 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </a>
        </nav>

        {/* ── Hero ── */}
        <header className="text-center pt-12 pb-8 px-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.045] border border-white/[0.08] text-[11px] text-white/50 mb-8">
            <SaltaDevBadge />
            <span className="mx-1 text-white/20">·</span>
            <span>Desarrollado por Juan Guzmán</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-[3.75rem] font-bold tracking-tight leading-[1.1] mb-4 bg-gradient-to-br from-white via-white/95 to-blue-200/55 bg-clip-text text-transparent">
            Generador de CV<br className="hidden sm:block" /> y Ruta Laboral
          </h1>
          <p className="text-white/38 text-base max-w-md mx-auto leading-relaxed">
            Completá tus datos y tu CV y ruta de búsqueda quedan listos para descargar.
          </p>
        </header>

        {/* ── Stepper ── */}
        <div className="px-4">
          <div className="max-w-2xl mx-auto">
            <StepIndicator currentStep={currentStep} />
          </div>
        </div>

        {/* ── Main ── */}
        <main className="flex-1 px-4 sm:px-6 pb-20">
          <div className="max-w-2xl mx-auto">

            {currentStep === 1 ? (

              /* ═══ PASO 1: Formulario ═══ */
              <div className="space-y-4">

                {/* Información personal */}
                <div className="glass-card rounded-2xl p-6">
                  <h2 className="text-white font-semibold text-sm mb-0.5">Tu información personal</h2>
                  <p className="text-white/30 text-xs mb-5">Datos básicos que aparecerán en tu CV</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="name" className={labelCls}>Nombre completo *</Label>
                      <Input
                        id="name"
                        value={personalInfo.name}
                        onChange={(e) => { setPersonalInfo({ ...personalInfo, name: e.target.value }); setFormError("") }}
                        placeholder="Juan Pérez"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className={labelCls}>Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={personalInfo.email}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                        placeholder="juan@email.com"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className={labelCls}>Teléfono</Label>
                      <Input
                        id="phone"
                        value={personalInfo.phone}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                        placeholder="+54 11 1234-5678"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <Label htmlFor="location" className={labelCls}>Ubicación</Label>
                      <Input
                        id="location"
                        value={personalInfo.location}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, location: e.target.value })}
                        placeholder="Buenos Aires, Argentina"
                        className={inputCls}
                      />
                    </div>
                  </div>
                </div>

                {/* Descripción del puesto */}
                <div className="glass-card rounded-2xl p-6">
                  <h2 className="text-white font-semibold text-sm mb-0.5">Descripción del puesto</h2>
                  <p className="text-white/30 text-xs mb-5">Opcional — mejora la personalización del CV</p>
                  <Textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Pegá la descripción completa del puesto de LinkedIn o cualquier portal de empleo..."
                    className={`min-h-[100px] ${inputCls}`}
                  />
                </div>

                {/* Trayectoria */}
                <div className="glass-card rounded-2xl p-6">
                  <h2 className="text-white font-semibold text-sm mb-0.5">Tu trayectoria *</h2>
                  <p className="text-white/30 text-xs mb-5">Experiencia laboral, educación y habilidades técnicas</p>
                  <Tabs defaultValue="experience" className="w-full">
                    <TabsList className="w-full bg-white/[0.04] border border-white/[0.08] rounded-full p-1 h-auto mb-4">
                      <TabsTrigger value="experience" className={tabsTriggerCls}>Experiencia</TabsTrigger>
                      <TabsTrigger value="education"  className={tabsTriggerCls}>Educación</TabsTrigger>
                      <TabsTrigger value="skills"     className={tabsTriggerCls}>Habilidades</TabsTrigger>
                    </TabsList>
                    <TabsContent value="experience">
                      <Textarea
                        value={currentExperience}
                        onChange={(e) => { setCurrentExperience(e.target.value); setFormError("") }}
                        placeholder={"Ejemplo:\n\nDesarrollador Full Stack - TechCorp (2022-presente)\n- Desarrollo de aplicaciones web con React y Node.js\n- Implementación de APIs REST\n\nJunior Developer - StartupXYZ (2020-2022)\n- Mantenimiento de código legacy"}
                        className={`min-h-[180px] ${inputCls}`}
                      />
                    </TabsContent>
                    <TabsContent value="education">
                      <Textarea
                        value={education}
                        onChange={(e) => setEducation(e.target.value)}
                        placeholder={"Ejemplo:\n\nLicenciatura en Sistemas - Universidad XYZ (2018-2022)\nCertificación AWS Solutions Architect (2023)\nCurso Full Stack - Coderhouse (2020)"}
                        className={`min-h-[130px] ${inputCls}`}
                      />
                    </TabsContent>
                    <TabsContent value="skills">
                      <Textarea
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        placeholder={"Ejemplo:\n\nLenguajes: JavaScript, Python, Java\nFrontend: React, Vue.js, HTML, CSS\nBackend: Node.js, Express, Django\nBases de datos: MySQL, MongoDB\nHerramientas: Git, Docker, AWS"}
                        className={`min-h-[130px] ${inputCls}`}
                      />
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Error + CTA */}
                <div className="space-y-3 pt-1">
                  {formError && (
                    <p className="text-red-400/75 text-xs text-center">{formError}</p>
                  )}
                  <Button
                    onClick={handleContinue}
                    className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-base shadow-[0_4px_24px_-4px_rgba(37,99,235,0.45)] hover:shadow-[0_4px_32px_-4px_rgba(37,99,235,0.65)] transition-all duration-200"
                    size="lg"
                  >
                    Continuar
                    <svg className="ml-2 w-4 h-4" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8H13M8 3L13 8L8 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Button>
                  <p className="text-center text-white/20 text-xs">
                    Se generarán automáticamente tu CV Harvard + ATS y tu ruta de búsqueda laboral
                  </p>
                </div>
              </div>

            ) : (

              /* ═══ PASO 2: Resultados ═══ */
              <div className="space-y-4">

                {/* Volver */}
                <button
                  onClick={handleBack}
                  disabled={isGenerating}
                  className="flex items-center gap-1.5 text-white/30 hover:text-white/60 text-xs transition-colors duration-200 disabled:opacity-25 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Editar datos
                </button>

                {/* Estado global */}
                <div className="text-center py-1">
                  {allDone ? (
                    <p className="text-white/45 text-sm">Tus archivos están listos para descargar</p>
                  ) : isGenerating ? (
                    <p className="text-white/30 text-sm">Generando tus documentos...</p>
                  ) : null}
                </div>

                {/* Tarjeta CV */}
                <FileCard
                  icon={FileText}
                  title="CV Harvard + ATS Optimizado"
                  description="CV profesional personalizado a tu perfil"
                  status={cvStatus}
                  onDownload={() => downloadPDF(cvContent, `CV_${personalInfo.name.replace(/\s+/g, "_")}.pdf`)}
                  onRetry={retryCV}
                />

                {/* Tarjeta Ruta Laboral */}
                <FileCard
                  icon={MapPin}
                  title="Ruta de Búsqueda Laboral"
                  description={cvStatus !== "done" ? "Se genera automáticamente una vez que el CV está listo" : "Plan de acción personalizado de 12 semanas"}
                  status={roadmapStatus}
                  onDownload={() => downloadPDF(roadmapContent, `Ruta_Laboral_${personalInfo.name.replace(/\s+/g, "_")}.pdf`)}
                  onRetry={retryRoadmap}
                />

                {/* Tips */}
                <div className="glass-card rounded-2xl p-5 mt-1">
                  <h3 className="text-white/38 font-medium text-[10px] uppercase tracking-widest mb-3">
                    Mientras esperás
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {tips.map(({ icon: Icon, title, body }) => (
                      <div
                        key={title}
                        className="flex items-start gap-2 p-2.5 rounded-xl bg-white/[0.025] border border-white/[0.05] hover:bg-white/[0.045] transition-colors duration-200"
                      >
                        <Icon className="w-3 h-3 text-blue-400/50 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-white/50 text-[11px] font-medium leading-snug">{title}</p>
                          <p className="text-white/22 text-[9.5px] mt-0.5 leading-relaxed">{body}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

          </div>
        </main>

        {/* ── Footer ── */}
        <footer className="border-t border-white/[0.055] py-5 px-6">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
              <span className="text-white/20 text-xs">Mejorar.cv — {new Date().getFullYear()}</span>
            </div>
            <a
              href="https://www.instagram.com/juanpa.soy/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/20 hover:text-white/48 text-xs transition-colors duration-200"
            >
              @juanpa.soy
            </a>
          </div>
        </footer>

        <Toaster />
      </div>
    </div>
  )
}
