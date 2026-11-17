import { useEffect, useRef, type CSSProperties, type MouseEvent, type ReactNode } from 'react';
import { animate, motion, useInView, useScroll, useSpring } from 'framer-motion';
import type { Scene } from '../content';

export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/* ---------- Surfaces ---------- */

// Soft card surface shared by every panel on the page.
export const SURFACE =
  'rounded-2xl bg-white/90 backdrop-blur-md ring-1 ring-stone-900/[0.06] shadow-[0_2px_8px_-2px_rgba(20,22,21,0.04),0_16px_36px_-12px_rgba(20,22,21,0.06)]';

// Quieter inset block used inside a card.
export const INSET = 'rounded-xl bg-stone-50 ring-1 ring-stone-900/[0.05]';

type SpotlightProps = {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  as?: 'div' | 'figure';
};

/** Card with a faint light that follows the cursor. Updates CSS vars only, so no re-renders. */
export function SpotlightCard({ className, style, children, as = 'div' }: SpotlightProps) {
  const ref = useRef<HTMLElement | null>(null);
  const onMove = (e: MouseEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--sx', `${e.clientX - r.left}px`);
    el.style.setProperty('--sy', `${e.clientY - r.top}px`);
  };
  const Tag = as;
  return (
    <Tag
      ref={(el: HTMLElement | null) => {
        ref.current = el;
      }}
      onMouseMove={onMove}
      className={cx('group/spot relative', SURFACE, className)}
      style={style}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover/spot:opacity-100"
        style={{
          background:
            'radial-gradient(520px circle at var(--sx, 50%) var(--sy, 0%), rgba(154,74,36,0.055), transparent 62%)',
        }}
      />
      {children}
    </Tag>
  );
}

/* ---------- Section shell ---------- */

type SectionProps = {
  scene: Scene;
  children: ReactNode;
};

export function Section({ scene, children }: SectionProps) {
  return (
    <section id={scene.id} className="relative min-h-screen">
      <div className="mx-auto max-w-[1440px] px-8 pb-24 pt-14 lg:px-12">
        <header className="mb-10 flex items-end justify-between gap-6 border-b border-stone-900/10 pb-3">
          <div className="mono-label flex items-center gap-3 text-muted">
            <span className="text-ink">SEC. {scene.code}</span>
            <span className="h-1 w-1 rounded-full bg-stone-400" />
            <span className="th-label normal-case">{scene.kicker}</span>
          </div>
          <div className="mono-label text-right text-faint">{scene.titleEn}</div>
        </header>
        {children}
      </div>
    </section>
  );
}

/** Section intro: number + heading on the left, a short lead on the right. */
export function Lead({ num, title, children }: { num: string; title: string; children: ReactNode }) {
  return (
    <Reveal className="grid grid-cols-12 gap-5">
      <div className="col-span-12 lg:col-span-3">
        <div className="mono-label text-faint">{num}</div>
        <h2 className="mt-2 text-2xl font-semibold">{title}</h2>
      </div>
      <p className="col-span-12 max-w-3xl text-[1.2rem] leading-[1.85] text-ink lg:col-span-9">{children}</p>
    </Reveal>
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

/* ---------- Figure: spotlight card with FIG. / SIM. caption ---------- */

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
    <SpotlightCard as="figure" className={className}>
      <figcaption className="relative flex items-baseline gap-3 px-6 pb-1 pt-5">
        <span className="mono-label shrink-0 text-rust">{code}</span>
        <span className="flex-1 text-[15.5px] font-semibold leading-snug text-ink">{title}</span>
        {note ? <span className="th-label hidden shrink-0 font-normal text-faint md:inline">{note}</span> : null}
      </figcaption>
      <div className={cx('relative', bodyClassName ?? 'px-6 pb-6 pt-4')}>{children}</div>
    </SpotlightCard>
  );
}

/* ---------- Source tags: keep proposal text and explanation apart ---------- */

export function SourceTag({ kind }: { kind: 'proposal' | 'science' }) {
  return kind === 'proposal' ? (
    <span className="inline-flex items-center rounded-full bg-rust-soft px-2.5 py-0.5 text-[12px] font-medium text-rust">
      ใบสมัคร
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-[#EEF0E6] px-2.5 py-0.5 text-[12px] font-medium text-olive">
      หลักการ
    </span>
  );
}

/* ---------- Sliding pill tabs ---------- */

type PillItem<T extends string | number> = { id: T; label: ReactNode };

type PillTabsProps<T extends string | number> = {
  items: Array<PillItem<T>>;
  value: T;
  onChange: (id: T) => void;
  layoutId: string;
  className?: string;
  size?: 'sm' | 'md';
};

export function PillTabs<T extends string | number>({
  items,
  value,
  onChange,
  layoutId,
  className,
  size = 'md',
}: PillTabsProps<T>) {
  return (
    <div className={cx('inline-flex rounded-full bg-stone-200/70 p-1', className)} role="tablist">
      {items.map((it) => {
        const on = it.id === value;
        return (
          <button
            key={String(it.id)}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(it.id)}
            className={cx(
              'relative rounded-full font-medium transition-colors duration-200',
              size === 'sm' ? 'px-3 py-1 text-[12px]' : 'px-4 py-1.5 text-[14px]',
              on ? 'text-white' : 'text-stone-600 hover:text-stone-900',
            )}
          >
            {on ? (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-full bg-stone-900 shadow-sm"
                transition={{ type: 'spring', stiffness: 420, damping: 36 }}
              />
            ) : null}
            <span className="relative z-10 whitespace-nowrap">{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Buttons ---------- */

export const BTN_GHOST =
  'inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-[13px] font-medium text-stone-700 ring-1 ring-stone-900/10 transition-colors hover:bg-stone-50 hover:text-stone-900 disabled:opacity-35';
export const BTN_SOLID =
  'inline-flex items-center gap-2 rounded-full bg-stone-900 px-3.5 py-1.5 text-[13px] font-medium text-white shadow-sm transition-colors hover:bg-stone-800 disabled:opacity-35';

/* ---------- Scroll progress hairline ---------- */

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });
  return (
    <motion.div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-[#0F766E]"
      style={{ scaleX }}
    />
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
