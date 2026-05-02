export interface Spec {
  vision: string;
  usuarios: string;
  funcionalidades: string[];
  flujos: string[];
  arquitectura: string;
  requisitos: string;
}

export function isValidSpec(data: unknown): data is Spec {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.vision === 'string' &&
    typeof d.usuarios === 'string' &&
    Array.isArray(d.funcionalidades) &&
    (d.funcionalidades as unknown[]).every((f) => typeof f === 'string') &&
    Array.isArray(d.flujos) &&
    (d.flujos as unknown[]).every((f) => typeof f === 'string') &&
    typeof d.arquitectura === 'string' &&
    typeof d.requisitos === 'string'
  );
}
