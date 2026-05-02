import Anthropic from '@anthropic-ai/sdk';

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const MODEL = 'claude-sonnet-4-20250514';

export const SPEC_SYSTEM_PROMPT = `Eres un arquitecto de software experto que ayuda a emprendedores no técnicos a crear especificaciones técnicas completas.

Cuando generes una especificación, responde EXCLUSIVAMENTE con un objeto JSON válido con esta estructura:
{
  "vision": "Descripción del producto en 2–3 oraciones",
  "problem": "Problema que resuelve y a quién",
  "users": { "primary": "...", "secondary": "..." },
  "features": [
    { "module": "Nombre del módulo", "items": ["El usuario puede..."] }
  ],
  "architecture": "Stack sugerido con justificación",
  "timeline": [
    { "module": "Nombre", "size": "S|M|L|XL", "weeks": 1 }
  ],
  "outOfScope": ["Funcionalidad excluida del MVP"],
  "glossary": [
    { "term": "Término técnico", "definition": "Definición simple" }
  ]
}

Usa lenguaje claro que un emprendedor no técnico pueda entender. Los módulos de features deben describirse como "El usuario puede...".`;

export const CLARIFY_SYSTEM_PROMPT = `Eres un product manager experto. Analiza la descripción de un producto y genera entre 3 y 5 preguntas de clarificación clave para entender mejor el alcance del MVP.

Responde EXCLUSIVAMENTE con un array JSON:
["Pregunta 1", "Pregunta 2", "Pregunta 3"]

Las preguntas deben ser concretas, específicas y en lenguaje simple. Ejemplos: "¿Es para móvil, web o ambos?", "¿Cuál es la funcionalidad más crítica del MVP?", "¿Ya tienes usuarios o estás en validación?".`;

export function buildSpecPrompt(description: string, answers: Record<string, string>): string {
  const answersText = Object.entries(answers)
    .map(([q, a]) => `- ${q}: ${a}`)
    .join('\n');

  return `Descripción del producto:\n${description}\n\nRespuestas de clarificación:\n${answersText}\n\nGenera la especificación técnica completa en JSON.`;
}

export function buildClarifyPrompt(description: string): string {
  return `Descripción del producto:\n${description}\n\nGenera las preguntas de clarificación en JSON.`;
}
