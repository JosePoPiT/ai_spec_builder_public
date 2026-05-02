'use client';

import { useEffect, useState } from 'react';
import { type Spec, isValidSpec } from '@/lib/types';

const MIN_LENGTH = 20;

interface SpecFormProps {
  description: string;
  onDescriptionChange: (value: string) => void;
  onResult: (spec: Spec) => void;
  onLoadingChange: (loading: boolean) => void;
}

export default function SpecForm({
  description,
  onDescriptionChange,
  onResult,
  onLoadingChange,
}: SpecFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          setError(null);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  function setLoadingState(val: boolean) {
    setLoading(val);
    onLoadingChange(val);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoadingState(true);

    try {
      const res = await fetch('/api/generate-spec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      });

      const data = await res.json();

      if (res.status === 429) {
        const secs = Math.ceil((data.retryAfterMs ?? 60000) / 1000);
        setCountdown(secs);
        setError(`Límite de generaciones por minuto alcanzado.`);
        return;
      }

      if (!res.ok) {
        setError(data.error ?? 'Error desconocido. Intenta de nuevo.');
        return;
      }

      if (!isValidSpec(data)) {
        setError('La respuesta del servidor tiene un formato inesperado. Intenta de nuevo.');
        return;
      }

      onResult(data);
    } catch {
      setError('No se pudo conectar con el servidor. Verifica tu conexión.');
    } finally {
      setLoadingState(false);
    }
  }

  const isShort = description.trim().length < MIN_LENGTH;
  const isRateLimited = countdown > 0;
  const canSubmit = !loading && !isShort && !isRateLimited;

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3">
      <textarea
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
        disabled={loading}
        rows={7}
        aria-label="Descripción del producto"
        placeholder="Describe tu idea de producto... Por ejemplo: una app para que freelancers gestionen sus facturas."
        className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-4 py-3 text-base text-zinc-900 placeholder-zinc-400 shadow-sm outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
      />

      <div className="flex items-start justify-between gap-4 text-xs text-zinc-400 dark:text-zinc-500">
        <p>
          Incluye el problema que resuelve, el público objetivo y las funciones clave.{' '}
          {isShort && description.length > 0 && (
            <span className="text-amber-500">Mínimo {MIN_LENGTH} caracteres.</span>
          )}
        </p>
        <span className={`shrink-0 tabular-nums transition-colors ${!isShort ? 'text-emerald-500' : ''}`}>
          {description.length}
        </span>
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        {loading ? (
          <>
            <SpinnerIcon />
            Generando...
          </>
        ) : isRateLimited ? (
          <>
            <ClockIcon />
            Espera {countdown}s
          </>
        ) : (
          'Generar especificación'
        )}
      </button>

      {error && (
        <div role="alert" className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-950">
          <span className="mt-0.5 text-amber-500">⚠</span>
          <div className="text-sm text-amber-700 dark:text-amber-300">
            <span>{error}</span>
            {isRateLimited && (
              <span className="ml-1 font-medium">Puedes intentarlo de nuevo en {countdown}s.</span>
            )}
          </div>
        </div>
      )}
    </form>
  );
}

function SpinnerIcon() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
