import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import { CONCEPT, COCREATION_STEPS, FIT_REASONS, PEOPLE, SOLUTION_STEPS, type Scene, type SolutionStep } from '../content';
import type { ModelId } from '../components/Cutaway3D';
import { EASE, Figure, Reveal, Section, cx } from '../components/ui';

const Cutaway3D = lazy(() => import('../components/Cutaway3D'));

export default function Section2({ scene }: { scene: Scene }) {
  const [model, setModel] = useState<ModelId>(0);
  const [exploded, setExploded] = useState(false);

  return (
    <Section scene={scene}>
      <Reveal className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-3">
          <div className="mono-label text-faint">2.1</div>
          <h2 className="mt-2 text-2xl font-semibold">แนวคิด</h2>
        </div>
        <p className="col-span-12 text-[1.2rem] leading-[1.9] lg:col-span-9">{CONCEPT}</p>
      </Reveal>

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

        {/* right: sticky 3D stage */}
        <div className="col-span-12 lg:col-span-7">
          {/* ends above the fixed presenter bar (~112px) so it never covers the legend */}
          <div className="sticky top-6 h-[calc(100vh-9.5rem)] min-h-[440px]">
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
      <div
        className={cx(
          'border-l-2 pl-6 transition-opacity duration-500',
          active ? 'border-rust opacity-100' : 'border-rule opacity-45',
        )}
      >
        <div className="flex items-baseline gap-3">
          <span className="mono-label text-rust">{step.fig}</span>
          <span className="mono-label text-faint">Step {index + 1} / 3</span>
        </div>
        <h3 className="mt-3 text-[1.45rem] font-semibold leading-snug">{step.title}</h3>

        <div className="mt-6 border border-rule bg-card p-5">
          <div className="th-label text-faint">ข้อเสนอในใบสมัคร</div>
          <p className="mt-2 text-[15px] leading-[1.85] text-ink">{step.proposal}</p>
        </div>

        <div className="th-label mt-6 text-faint">หลักการทางวิทยาศาสตร์</div>
        <ol className="mt-3 space-y-3">
          {step.science.map((s, i) => (
            <li key={s} className="grid grid-cols-[2rem_1fr] gap-2 text-[15px] leading-relaxed text-muted">
              <span className="font-mono text-xs leading-7 text-faint">{String(i + 1).padStart(2, '0')}</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>

        {step.note ? (
          <div className="mt-6 border border-olive/40 bg-paper p-4">
            <div className="th-label text-olive">เงื่อนไขตามผลตรวจดิน</div>
            <p className="mt-1.5 text-[15px] leading-relaxed text-ink">{step.note}</p>
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-2">
          {step.specs.map((s) => (
            <span key={s} className="border border-rule bg-card px-2.5 py-1 text-xs font-medium text-ink">
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
      bodyClassName="relative flex-1 overflow-hidden"
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
        <div className="pointer-events-auto flex border border-rule bg-card/95">
          {SOLUTION_STEPS.map((s, i) => (
            <button
              key={s.fig}
              type="button"
              onClick={() => onModel(i as ModelId)}
              className={cx(
                'border-r border-rule px-3 py-2 font-mono text-[11px] tracking-[0.12em] transition-colors last:border-r-0',
                model === i ? 'bg-ink text-paper' : 'text-muted hover:text-ink',
              )}
            >
              {s.fig}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onExplode}
          className={cx(
            'pointer-events-auto border px-3 py-2 text-[13px] font-medium transition-colors',
            exploded ? 'border-rust bg-rust text-paper' : 'border-ink bg-card/95 text-ink hover:bg-ink hover:text-paper',
          )}
        >
          <span className="mr-2 font-mono text-[11px] tracking-[0.12em]">EXPLODE LAYERS</span>
          (แยกชั้นโครงสร้าง)
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
            className="border border-rule bg-card/95 px-3 py-2"
          >
            {exploded ? (
              <span className="text-[12px] text-muted">มุมมองแยกชั้น: ซ่อนอนุภาคเพื่อให้เห็นโครงสร้างชัดเจน</span>
            ) : (
              <ul className="space-y-1">
                {step.legend.map((l) => (
                  <li key={l.label} className="flex items-center gap-2 text-[12px] text-ink">
                    <span className="h-2.5 w-2.5 rounded-full border border-ink/40" style={{ background: l.color }} />
                    {l.label}
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        </AnimatePresence>
        <span className="mono-label text-faint">Drag to rotate</span>
      </div>
    </Figure>
  );
}

/* ---------- why it fits + co-creation process ---------- */

function FitAndProcess() {
  return (
    <div className="mt-16 space-y-5">
      <Reveal>
        <Figure code="FIG. 2.4" title="เหตุที่เหมาะกับชุมชน">
          <ol className="grid gap-5 md:grid-cols-3">
            {FIT_REASONS.map((r, i) => (
              <li key={r} className="flex gap-4 border-rule md:border-l md:pl-5 md:first:border-l-0 md:first:pl-0">
                <span className="font-mono text-2xl font-semibold leading-none text-ink">{String(i + 1).padStart(2, '0')}</span>
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

/* ---------- FIG. 2.5 interactive co-creation timeline ---------- */

function CoCreationTimeline() {
  const [active, setActive] = useState(0);
  const last = COCREATION_STEPS.length - 1;
  const step = COCREATION_STEPS[active];

  return (
    <Figure
      code="FIG. 2.5"
      title="ขั้นตอนการทำงานร่วมกับชุมชน 5 ขั้น"
      note="กดแต่ละขั้นเพื่อดูรายละเอียด"
      bodyClassName="p-6"
    >
      {/* rail */}
      <div className="relative">
        <div className="absolute left-[10%] right-[10%] top-[19px] h-px bg-rule-strong" />
        <motion.div
          className="absolute left-[10%] top-[18px] h-[3px] origin-left bg-rust"
          style={{ width: '80%' }}
          initial={false}
          animate={{ scaleX: active / last }}
          transition={{ duration: 0.6, ease: EASE }}
        />
        <ol className="relative grid grid-cols-5">
          {COCREATION_STEPS.map((s, i) => {
            const done = i <= active;
            return (
              <li key={s.short} className="flex flex-col items-center px-2 text-center">
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  aria-current={i === active ? 'step' : undefined}
                  className={cx(
                    'grid h-10 w-10 place-items-center border font-mono text-[12px] transition-colors duration-300',
                    i === active
                      ? 'border-rust bg-rust text-paper'
                      : done
                        ? 'border-rust bg-rust-soft text-rust'
                        : 'border-ink bg-card text-ink hover:bg-paper',
                  )}
                >
                  {String(i + 1).padStart(2, '0')}
                </button>
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  className={cx(
                    'mt-3 text-[14px] font-medium leading-snug transition-colors',
                    i === active ? 'text-ink' : 'text-muted hover:text-ink',
                  )}
                >
                  {s.short}
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      {/* detail */}
      <div className="mt-6 grid grid-cols-12 gap-5 border-t border-rule pt-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="col-span-12 grid grid-cols-12 gap-5 lg:col-span-10"
          >
            <div className="col-span-12 md:col-span-7">
              <div className="th-label text-faint">ข้อเสนอในใบสมัคร · ขั้นที่ {active + 1}</div>
              <p className="mt-2 text-[17px] leading-[1.8] text-ink">{step.detail}</p>
            </div>
            <div className="col-span-12 md:col-span-5">
              <div className="th-label text-faint">ผู้ร่วมดำเนินการ</div>
              <ul className="mt-2 flex flex-wrap gap-2">
                <li className="border border-ink bg-ink px-2.5 py-1 text-[13px] text-paper">คณะผู้จัดทำ</li>
                {step.people.map((p) => (
                  <li key={p} className="border border-rule bg-paper px-2.5 py-1 text-[13px] text-ink">
                    {PEOPLE[p].name}
                    <span className="ml-1.5 text-muted">· {PEOPLE[p].role}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </AnimatePresence>
        <div className="col-span-12 flex items-start justify-end gap-2 lg:col-span-2">
          <button
            type="button"
            onClick={() => setActive((a) => Math.max(0, a - 1))}
            disabled={active === 0}
            className="border border-rule px-3 py-2 font-mono text-[11px] tracking-[0.12em] text-ink transition-colors hover:border-ink disabled:opacity-30"
          >
            PREV
          </button>
          <button
            type="button"
            onClick={() => setActive((a) => Math.min(last, a + 1))}
            disabled={active === last}
            className="border border-ink bg-ink px-3 py-2 font-mono text-[11px] tracking-[0.12em] text-paper transition-opacity disabled:opacity-30"
          >
            NEXT
          </button>
        </div>
      </div>
    </Figure>
  );
}
