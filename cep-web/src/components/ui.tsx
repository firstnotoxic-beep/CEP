import { type CSSProperties, type ReactNode } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import type { Scene } from '../content';

export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/* ---------- Surfaces ----------
   Flat white with a hairline. No blur, no shadow, no cursor light: the content carries the page. */

export const SURFACE = 'rounded-lg border border-rule bg-white';

// Tinted block inside a card.
export const INSET = 'rounded-md bg-paper';

type CardProps = {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  as?: 'div' | 'figure';
};

/** Plain card. (Kept under its old name so existing call sites don't change.) */
export function SpotlightCard({ className, style, children, as = 'div' }: CardProps) {
  const Tag = as;
  return (
    <Tag className={cx('relative', SURFACE, className)} style={style}>
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
        <header className="mb-10 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-ink pb-3">
          <span className="text-[14px] font-semibold text-accent">{scene.kicker}</span>
          <span className="text-[14px] text-ink">{scene.title}</span>
        </header>
        {children}
      </div>
    </section>
  );
}

/** Section intro: heading on the left, a short lead on the right. */
export function Lead({ num, title, children }: { num: string; title: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-12 gap-5">
      <div className="col-span-12 lg:col-span-3">
        <div className="text-[13px] text-faint">{num}</div>
        <h2 className="mt-1 text-2xl font-semibold">{title}</h2>
      </div>
      <p className="col-span-12 max-w-3xl text-[1.2rem] leading-[1.85] text-ink lg:col-span-9">{children}</p>
    </div>
  );
}

/* ---------- Reveal ----------
   Used to fade every block in on scroll. That uniform motion is a template tell, so it is now a
   plain wrapper; motion is kept only where it explains something (3D, simulations, timeline). */

type RevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
};

export function Reveal({ children, className }: RevealProps) {
  return <div className={className}>{children}</div>;
}

/* ---------- Figure: card with FIG. / SIM. caption ---------- */

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
        <span className="mono-label shrink-0 text-accent">{code}</span>
        <span className="flex-1 text-[15.5px] font-semibold leading-snug text-ink">{title}</span>
        {note ? <span className="hidden shrink-0 text-[13px] text-faint md:inline">{note}</span> : null}
      </figcaption>
      <div className={cx('relative', bodyClassName ?? 'px-6 pb-6 pt-4')}>{children}</div>
    </SpotlightCard>
  );
}

/* ---------- Source labels: keep proposal text and explanation apart ---------- */

export function SourceTag({ kind }: { kind: 'proposal' | 'science' }) {
  return kind === 'proposal' ? (
    <span className="text-[13px] font-semibold text-accent">จากใบสมัคร</span>
  ) : (
    <span className="text-[13px] font-semibold text-olive">หลักการที่อธิบายเพิ่ม</span>
  );
}

/* ---------- Segmented control ---------- */

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
    <div className={cx('inline-flex rounded-md border border-rule bg-paper p-0.5', className)} role="tablist">
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
              'relative rounded font-medium transition-colors duration-200',
              size === 'sm' ? 'px-3 py-1 text-[12.5px]' : 'px-4 py-1.5 text-[14px]',
              on ? 'text-white' : 'text-muted hover:text-ink',
            )}
          >
            {on ? (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded bg-accent"
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
  'inline-flex items-center gap-2 rounded-md border border-rule bg-white px-3 py-1.5 text-[13px] font-medium text-ink transition-colors hover:border-accent hover:text-accent disabled:opacity-35';
export const BTN_SOLID =
  'inline-flex items-center gap-2 rounded-md bg-accent px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-[#12573C] disabled:opacity-35';

/* ---------- Scroll progress hairline ---------- */

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });
  return (
    <motion.div aria-hidden="true" className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-accent" style={{ scaleX }} />
  );
}

/* ---------- Numbers ----------
   Shown as they are. A count-up animation adds nothing a judge needs and reads as template. */

export function CountUp({ to, className }: { to: number; duration?: number; className?: string }) {
  return <span className={className}>{to.toLocaleString('th-TH')}</span>;
}
