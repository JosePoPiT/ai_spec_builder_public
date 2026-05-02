'use client';

import { useEffect, useState } from 'react';
import { type Spec } from '@/lib/types';

interface SpecOutputProps {
  spec: Spec;
  onReset: () => void;
}

function formatSpecAsMarkdown(spec: Spec): string {
  return [
    `# Visión\n${spec.vision}`,
    `# Usuarios\n${spec.usuarios}`,
    `# Funcionalidades\n${spec.funcionalidades.map((f) => `- ${f}`).join('\n')}`,
    `# Flujos principales\n${spec.flujos.map((f, i) => `${i + 1}. ${f}`).join('\n')}`,
    `# Arquitectura\n${spec.arquitectura}`,
    `# Requisitos\n${spec.requisitos}`,
  ].join('\n\n');
}

function Card({
  children,
  delay,
  visible,
}: {
  children: React.ReactNode;
  delay: number;
  visible: boolean;
}) {
  return (
    <div
      className="rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-500 dark:border-zinc-800 dark:bg-zinc-900"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
      {title}
    </span>
  );
}

function FloatingCopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      aria-label={copied ? 'Especificación copiada' : 'Copiar especificación completa'}
      className="fixed bottom-8 right-8 z-50 flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-zinc-700 active:scale-95 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
    >
      {copied ? (
        <>
          <CheckIcon className="h-4 w-4" />
          Copiado
        </>
      ) : (
        <>
          <CopyIcon className="h-4 w-4" />
          Copiar spec
        </>
      )}
    </button>
  );
}

export default function SpecOutput({ spec, onReset }: SpecOutputProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(t);
  }, [spec]);

  return (
    <>
      <div className="flex flex-col gap-5 pb-24">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
            Especificación generada
          </h2>
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          >
            <ResetIcon />
            Nueva especificación
          </button>
        </div>

        {/* Visión */}
        <Card delay={0} visible={visible}>
          <div className="px-5 pt-5">
            <SectionTitle title="Visión" />
          </div>
          <p className="px-5 pb-5 pt-3 text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
            {spec.vision}
          </p>
        </Card>

        {/* Usuarios */}
        <Card delay={80} visible={visible}>
          <div className="px-5 pt-5">
            <SectionTitle title="Usuarios" />
          </div>
          <p className="px-5 pb-5 pt-3 leading-relaxed text-zinc-600 dark:text-zinc-400">
            {spec.usuarios}
          </p>
        </Card>

        {/* Funcionalidades — checklist */}
        <Card delay={160} visible={visible}>
          <div className="px-5 pt-5">
            <SectionTitle title="Funcionalidades" />
          </div>
          <ul className="flex flex-col divide-y divide-zinc-100 px-5 pb-2 pt-1 dark:divide-zinc-800">
            {spec.funcionalidades.map((item, i) => (
              <li key={item} className="flex items-start gap-3 py-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950">
                  <CheckIcon className="h-3 w-3 text-emerald-500" />
                </span>
                <span className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Flujos — pasos numerados */}
        <Card delay={240} visible={visible}>
          <div className="px-5 pt-5">
            <SectionTitle title="Flujos principales" />
          </div>
          <ol className="flex flex-col px-5 pb-4 pt-2">
            {spec.flujos.map((item, i) => (
              <li key={item} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
                    {i + 1}
                  </span>
                  {i < spec.flujos.length - 1 && (
                    <span className="my-1 w-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
                  )}
                </div>
                <p className="pb-3 pt-0.5 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {item}
                </p>
              </li>
            ))}
          </ol>
        </Card>

        {/* Arquitectura */}
        <Card delay={320} visible={visible}>
          <div className="px-5 pt-5">
            <SectionTitle title="Arquitectura" />
          </div>
          <p className="px-5 pb-5 pt-3 font-mono text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {spec.arquitectura}
          </p>
        </Card>

        {/* Requisitos */}
        <Card delay={400} visible={visible}>
          <div className="px-5 pt-5">
            <SectionTitle title="Requisitos" />
          </div>
          <p className="px-5 pb-5 pt-3 leading-relaxed text-zinc-600 dark:text-zinc-400">
            {spec.requisitos}
          </p>
        </Card>
      </div>

      <FloatingCopyButton text={formatSpecAsMarkdown(spec)} />
    </>
  );
}

function CopyIcon({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ResetIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 3v5h5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
