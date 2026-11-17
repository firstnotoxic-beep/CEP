import { useEffect, useRef, type ReactNode } from 'react';
import { animate, motion, useInView } from 'framer-motion';
import type { Scene } from '../content';

export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/* ---------- Section shell ---------- */

type SectionProps = {
  scene: Scene;
  children: ReactNode;
};

export function Section({ scene, children }: SectionProps) {
  return (
    <section id={scene.id} className="relative min-h-screen border-b border-rule">
      <div className="mx-auto max-w-[1440px] px-8 pb-24 pt-14 lg:px-12">
        <header className="mb-10 flex items-end justify-between gap-6 border-b border-ink pb-3">
          <div className="mono-label flex items-center gap-4 text-muted">
            <span className="text-ink">SEC. {scene.code}</span>
            <span className="h-3 w-px bg-rule-strong" />
            <span className="th-label normal-case">{scene.kicker}</span>
          </div>
          <div className="mono-label text-right text-faint">{scene.titleEn}</div>
        </header>
        {children}
      </div>
    </section>
  );
}

/* ---------- Reveal on scroll ---------- */

type RevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
};

export function Reveal({ children, delay = 0, className }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/* ---------- Figure frame with FIG. / SIM. numbering ---------- */

type FigureProps = {
  code: string;
  title: string;
  note?: string;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
};

export function Figure({ code, title, note, className, bodyClassName, children }: FigureProps) {
  return (
    <figure className={cx('relative border border-rule bg-card', className)}>
      <CornerTicks />
      <figcaption className="flex items-baseline gap-4 border-b border-rule px-5 py-3">
        <span className="mono-label shrink-0 text-rust">{code}</span>
        <span className="flex-1 text-[15px] font-medium leading-snug text-ink">{title}</span>
        {note ? <span className="th-label shrink-0 text-faint">{note}</span> : null}
      </figcaption>
      <div className={bodyClassName ?? 'p-5'}>{children}</div>
    </figure>
  );
}

function CornerTicks() {
  const tick = 'pointer-events-none absolute h-2.5 w-2.5 border-ink';
  return (
    <>
      <span className={cx(tick, '-left-px -top-px border-l border-t')} />
      <span className={cx(tick, '-right-px -top-px border-r border-t')} />
      <span className={cx(tick, '-bottom-px -left-px border-b border-l')} />
      <span className={cx(tick, '-bottom-px -right-px border-b border-r')} />
    </>
  );
}

/* ---------- Count-up number ---------- */

type CountUpProps = {
  to: number;
  duration?: number;
  className?: string;
};

export function CountUp({ to, duration = 1.6, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration,
      ease: EASE,
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = Math.round(v).toLocaleString('th-TH');
      },
    });
    return () => controls.stop();
  }, [inView, to, duration]);

  return (
    <span ref={ref} className={className}>
      0
    </span>
  );
}
