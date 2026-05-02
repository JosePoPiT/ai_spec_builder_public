import Anthropic from '@anthropic-ai/sdk';
import type { NextRequest } from 'next/server';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimit.get(ip);
  if (!record || now > record.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (record.count >= RATE_LIMIT_MAX) return false;
  record.count++;
  return true;
}

const SYSTEM_PROMPT = `You are an expert software architect. Given a project description, generate a comprehensive technical specification.

Respond ONLY with a valid JSON object — no markdown, no code blocks, no extra text outside the JSON.

The JSON must have exactly these 6 keys:

- "vision": string — 2 to 4 sentences describing the product vision, the problem it solves, and its unique value proposition.
- "usuarios": string[] — 2 to 4 sentences describing user profiles and stakeholders with their specific needs.
- "funcionalidades": string[] — between 5 and 8 items. Each item must start with "El usuario puede..." or "El sistema permite...".
- "flujos": string[] — between 3 and 5 strings, each describing one main user flow or system process end to end.
- "arquitectura": string — 2 to 4 sentences describing the proposed technical architecture, tech stack, and key components.
- "requisitos": string[] — 2 to 4 sentences covering the most critical functional and non-functional requirements.

Example of the expected output shape (replace all values with real content):
{
  "vision": "La plataforma resuelve X problema para Y audiencia. Su propuesta de valor única es Z. A diferencia de las soluciones existentes, ofrece W.",
  "usuarios": "El usuario principal es un profesional que necesita X. También participan administradores que gestionan Y. Ambos perfiles requieren Z.",
  "funcionalidades": [
    "El usuario puede registrarse y autenticarse con correo o proveedor OAuth.",
    "El usuario puede crear, editar y eliminar proyectos desde su dashboard.",
    "El sistema permite enviar notificaciones automáticas por correo ante eventos clave.",
    "El usuario puede invitar colaboradores y asignarles roles específicos.",
    "El sistema permite exportar reportes en formato PDF o CSV."
  ],
  "flujos": [
    "El usuario se registra, verifica su correo y accede al dashboard principal.",
    "El usuario crea un proyecto, configura sus parámetros y lo publica.",
    "Un colaborador recibe la invitación, acepta y accede al proyecto compartido."
  ],
  "arquitectura": "El frontend se construye con Next.js y se despliega en Vercel. El backend expone una API REST con Node.js y usa PostgreSQL como base de datos principal. Los archivos estáticos se almacenan en S3.",
  "requisitos": "El sistema debe responder en menos de 500 ms para el 95 % de las peticiones. Toda la comunicación debe ir cifrada con TLS. La aplicación debe soportar al menos 1000 usuarios concurrentes."
}`;

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown';

  if (!checkRateLimit(ip)) {
    return Response.json(
      { error: 'Demasiadas solicitudes. Espera unos minutos antes de intentarlo de nuevo.' },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: 'El cuerpo de la solicitud debe ser JSON válido.' },
      { status: 400 }
    );
  }

  const description = (body as Record<string, unknown>)?.description;

  if (!description || typeof description !== 'string' || !description.trim()) {
    return Response.json(
      { error: 'El campo "description" es requerido y debe ser un string no vacío.' },
      { status: 400 }
    );
  }

  try {
    const stream = client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 8192,
      thinking: { type: 'adaptive' },
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [{ role: 'user', content: description.trim() }],
    });

    const response = await stream.finalMessage();

    const textBlock = response.content.find(
      (b): b is Anthropic.TextBlock => b.type === 'text'
    );

    if (!textBlock) {
      return Response.json(
        { error: 'Claude no devolvió una respuesta de texto.' },
        { status: 500 }
      );
    }

    // Strip markdown fences if Claude wrapped the JSON despite instructions
    const raw = textBlock.text
      .trim()
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '')
      .trim();

    let spec: unknown;
    try {
      spec = JSON.parse(raw);
    } catch {
      return Response.json(
        { error: 'La respuesta de Claude no es JSON válido.', raw: textBlock.text },
        { status: 500 }
      );
    }

    return Response.json(spec);
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return Response.json(
        { error: 'API key de Anthropic inválida o no configurada.' },
        { status: 401 }
      );
    }
    if (error instanceof Anthropic.RateLimitError) {
      return Response.json(
        { error: 'Límite de solicitudes excedido. Intenta de nuevo en unos momentos.' },
        { status: 429 }
      );
    }
    if (error instanceof Anthropic.BadRequestError) {
      return Response.json(
        { error: `Solicitud inválida: ${error.message}` },
        { status: 400 }
      );
    }
    if (error instanceof Anthropic.APIError) {
      return Response.json(
        { error: `Error de la API de Anthropic: ${error.message}` },
        { status: error.status ?? 500 }
      );
    }
    return Response.json(
      { error: 'Error interno del servidor. Intenta de nuevo.' },
      { status: 500 }
    );
  }
}
