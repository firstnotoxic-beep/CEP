import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView, useScroll, useSpring } from 'framer-motion';
import {
  CONCEPT,
  COCREATION_STEPS,
  FIT_REASONS,
  PEOPLE,
  SOLUTION_STEPS,
  type CoCreationStep,
  type Scene,
  type SolutionStep,
} from '../content';
import type { ModelId } from '../components/Cutaway3D';
import { BTN_GHOST, EASE, Figure, Lead, PillTabs, Reveal, Section, SourceTag, cx } from '../components/ui';

const Cutaway3D = lazy(() => import('../components/Cutaway3D'));

export default function Section2({ scene }: { scene: Scene }) {
  const [model, setModel] = useState<ModelId>(0);
  const [exploded, setExploded] = useState(false);

  return (
    <Section scene={scene}>
      <Lead num="2.1" title="แนวคิด">
        {CONCEPT}
      </Lead>

      <div className="mt-10 grid grid-cols-12 gap-8">
        {/* left: scrolling explanation */}
        <div className="col-span-12 lg:col-span-5">
          {SOLUTION_STEPS.map((step, i) => (
            <StepBlock
              key={step.fig}
              step={step}
              index={i}
              active={model === i}
              onEnter={() => setModel(i as ModelId)}
            />
          ))}
        </div>

        {/* right: sticky 3D stage — ends above the floating dock */}
        <div className="col-span-12 lg:col-span-7">
          <div className="sticky top-6 h-[calc(100vh-6.5rem)] min-h-[440px]">
            <Stage model={model} exploded={exploded} onModel={setModel} onExplode={() => setExploded((e) => !e)} />
          </div>
        </div>
      </div>

      <FitAndProcess />
    </Section>
  );
}

/* ---------- left column step ---------- */

function StepBlock({ step, index, active, onEnter }: {
  step: SolutionStep;
  index: number;
  active: boolean;
  onEnter: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.55 });

  useEffect(() => {
    if (inView) onEnter();
    // react only to visibility changes, not to the fresh onEnter closure
  }, [inView]);

  return (
    <div ref={ref} className="flex min-h-[88vh] items-center py-10">
      <div className={cx('border-l-2 pl-6 transition-all duration-500', active ? 'border-rust opacity-100' : 'border-stone-200 opacity-45')}>
        <div className="flex items-baseline gap-3">
          <span className="mono-label text-rust">{step.fig}</span>
          <span className="mono-label text-faint">
            {index + 1} / {SOLUTION_STEPS.length}
          </span>
        </div>
        <h3 className="mt-3 text-[1.45rem] font-semibold leading-snug">{step.title}</h3>

        <div className="mt-5">
          <SourceTag kind="proposal" />
          <p className="mt-2 text-[16.5px] leading-[1.8] text-ink">{step.lead}</p>
        </div>

        <div className="mt-6">
          <SourceTag kind="science" />
          <ul className="mt-3 space-y-2.5">
            {step.science.map((s) => (
              <li key={s} className="flex gap-3 text-[15px] leading-relaxed text-muted">
                <span className="mt-[11px] h-1 w-1 shrink-0 rounded-full bg-stone-400" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {step.note ? (
          <div className="mt-6 rounded-xl bg-[#EEF0E6] px-4 py-3 ring-1 ring-olive/15">
            <div className="th-label text-olive">ถ้าผลตรวจดินเป็นดินโซดิก</div>
            <p className="mt-1 text-[15px] leading-relaxed text-ink">{step.note}</p>
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-1.5">
          {step.specs.map((s) => (
            <span key={s} className="rounded-full bg-stone-100 px-2.5 py-1 text-[12.5px] font-medium text-stone-700">
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- right column 3D stage ---------- */

function Stage({ model, exploded, onModel, onExplode }: {
  model: ModelId;
  exploded: boolean;
  onModel: (m: ModelId) => void;
  onExplode: () => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const near = useInView(wrapRef, { amount: 0.1 });
  const step = SOLUTION_STEPS[model];

  return (
    <Figure
      code={`SIM. ${step.fig.replace('FIG. ', '')}`}
      title={step.title.split(':')[0]}
      className="flex h-full flex-col"
      bodyClassName="relative flex-1 overflow-hidden rounded-b-2xl"
    >
      <div ref={wrapRef} className="absolute inset-0">
        <Suspense
          fallback={
            <div className="grid h-full place-items-center">
              <span className="mono-label text-faint">Loading 3D model</span>
            </div>
          }
        >
          <Cutaway3D model={model} exploded={exploded} running={near} />
        </Suspense>
      </div>

      {/* controls */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
        <PillTabs
          className="pointer-events-auto"
          size="sm"
          layoutId="sim2-model"
          value={model}
          onChange={(id) => onModel(id as ModelId)}
          items={SOLUTION_STEPS.map((s, i) => ({ id: i, label: <span className="font-mono tracking-[0.08em]">{s.fig}</span> }))}
        />
        <button
          type="button"
          onClick={onExplode}
          aria-pressed={exploded}
          className={cx('pointer-events-auto', exploded ? 'inline-flex items-center gap-2 rounded-full bg-rust px-3.5 py-1.5 text-[13px] font-medium text-white shadow-sm' : BTN_GHOST)}
        >
          {exploded ? 'รวมชั้นกลับ' : 'แยกชั้นให้ดู'}
        </button>
      </div>

      {/* legend */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${model}-${exploded ? 'x' : 'n'}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="rounded-xl bg-white/90 px-3 py-2 shadow-sm ring-1 ring-stone-900/[0.06] backdrop-blur"
          >
            {exploded ? (
              <span className="text-[12px] text-muted">ซ่อนอนุภาคไว้ก่อน จะได้เห็นแต่ละชั้นชัดๆ</span>
            ) : (
              <ul className="space-y-1">
                {step.legend.map((l) => (
                  <li key={l.label} className="flex items-center gap-2 text-[12px] text-ink">
                    <span className="h-2.5 w-2.5 rounded-full ring-1 ring-stone-900/20" style={{ background: l.color }} />
                    {l.label}
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        </AnimatePresence>
        <span className="text-[11.5px] text-faint">ลากเพื่อหมุนดู</span>
      </div>
    </Figure>
  );
}

/* ---------- why it fits + co-creation process ---------- */

function FitAndProcess() {
  return (
    <div className="mt-16 space-y-5">
      <Reveal>
        <Figure code="FIG. 2.4" title="ทำไมแบบนี้ถึงเหมาะกับที่นี่">
          <ol className="grid gap-5 md:grid-cols-3">
            {FIT_REASONS.map((r, i) => (
              <li key={r} className="flex gap-4">
                <span className="font-mono text-2xl font-semibold leading-none text-stone-300">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-[15px] leading-relaxed">{r}</span>
              </li>
            ))}
          </ol>
        </Figure>
      </Reveal>

      <Reveal delay={0.1}>
        <CoCreationTimeline />
      </Reveal>
    </div>
  );
}

/* ---------- FIG. 2.5 co-creation timeline: the line fills as you scroll ---------- */

const TEAL = '#0F766E';

function CoCreationTimeline() {
  const listRef = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start 72%', 'end 55%'] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });

  return (
    <Figure code="FIG. 2.5" title="ทำงานกับชุมชน 5 ขั้น" note="เลื่อนลงเพื่อเดินตามขั้นตอน" bodyClassName="px-6 pb-8 pt-5">
      <div className="mb-6 flex items-center gap-2">
        <SourceTag kind="proposal" />
        <span className="text-[13px] text-faint">ทุกขั้นทำร่วมกับคนในพื้นที่ ไม่ได้ทำแทน</span>
      </div>

      <div className="relative">
        {/* rail + scroll-linked fill */}
        <span className="absolute bottom-6 left-[19px] top-5 w-[2px] rounded-full bg-stone-200" aria-hidden="true" />
        <motion.span
          aria-hidden="true"
          className="absolute bottom-6 left-[19px] top-5 w-[2px] origin-top rounded-full"
          style={{ scaleY: fill, background: TEAL }}
        />

        <ol ref={listRef} className="relative space-y-3">
          {COCREATION_STEPS.map((s, i) => (
            <TimelineStep key={s.short} index={i} step={s} />
          ))}
        </ol>
      </div>
    </Figure>
  );
}

function TimelineStep({ index, step }: { index: number; step: CoCreationStep }) {
  const ref = useRef<HTMLLIElement>(null);
  // lights up once the reader's eye line (a bit above centre) reaches the step
  const reached = useInView(ref, { margin: '0px 0px -45% 0px' });

  return (
    <li ref={ref} className="relative grid grid-cols-[40px_1fr] gap-5">
      <motion.span
        className="relative z-10 mt-3 grid h-10 w-10 place-items-center rounded-full font-mono text-[13px] ring-1"
        animate={{
          backgroundColor: reached ? TEAL : '#FFFFFF',
          color: reached ? '#FFFFFF' : '#78716C',
          scale: reached ? 1 : 0.92,
        }}
        style={{ ['--tw-ring-color' as string]: reached ? TEAL : 'rgba(28,25,23,0.12)' }}
        transition={{ duration: 0.35, ease: EASE }}
      >
        {index + 1}
      </motion.span>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6, ease: EASE }}
        className={cx(
          'grid gap-4 rounded-xl p-5 transition-colors duration-500 md:grid-cols-[1.4fr_1fr]',
          reached ? 'bg-white shadow-[0_10px_30px_-16px_rgba(20,22,21,0.25)] ring-1 ring-stone-900/[0.07]' : 'bg-stone-50 ring-1 ring-stone-900/[0.04]',
        )}
      >
        <div>
          <h4 className="text-[17px] font-semibold leading-snug text-ink">{step.short}</h4>
          <p className="mt-1.5 text-[15px] leading-[1.75] text-muted">{step.detail}</p>
        </div>
        <ul className="flex flex-wrap content-start gap-1.5">
          <li className="rounded-full bg-stone-200/70 px-2.5 py-1 text-[12.5px] text-ink">คณะผู้จัดทำ</li>
          {step.people.map((p) => (
            <li key={p} className="rounded-full bg-white px-2.5 py-1 text-[12.5px] text-ink ring-1 ring-stone-900/10">
              {PEOPLE[p].name}
              <span className="ml-1 text-muted">· {PEOPLE[p].role}</span>
            </li>
          ))}
        </ul>
      </motion.div>
    </li>
  );
}

