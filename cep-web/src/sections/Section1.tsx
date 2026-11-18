import { useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  DATA_PLAN,
  IMPACT_TIERS,
  OBSERVATION,
  PEOPLE,
  PROBLEM_STATEMENT,
  PROJECT,
  ROOT_CAUSES,
  STATS,
  SYMPTOMS,
  type Scene,
} from '../content';
import { CountUp, EASE, Figure, INSET, Lead, Reveal, Section, cx } from '../components/ui';
import { ContainerScroll } from '../components/ui/container-scroll-animation';

export default function Section1({ scene }: { scene: Scene }) {
  return (
    <Section scene={scene}>
      <Hero />
      <div className="mt-6">
        <Lead num="1.1" title="ปัญหาที่พบ">
          {PROBLEM_STATEMENT}
        </Lead>
      </div>
      <CauseDiagram />
      <ImpactPanel />
      <DataPlanGrid />
    </Section>
  );
}

/* ================= Hero: editorial masthead + scroll frame ================= */

function Hero() {
  const title = (
    <header className="text-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: EASE }}
        className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[13px] text-muted"
      >
        <span>{PROJECT.program}</span>
        <span className="hidden h-1 w-1 rounded-full bg-rule-strong md:block" />
        <span className="text-accent">{PROJECT.community}</span>
        <span className="hidden h-1 w-1 rounded-full bg-rule-strong md:block" />
        <span>{PROJECT.school}</span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
        className="mx-auto mt-7 max-w-4xl text-balance text-[1.9rem] font-semibold leading-[1.42] tracking-[-0.005em] text-ink md:text-[2.5rem]"
      >
        {PROJECT.title}
      </motion.h1>

      {/* journal-style byline */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.25 }}
        className="mx-auto mt-8 max-w-4xl"
      >
        {/* flex-wrap: each name stays whole, the row breaks between names on narrow screens */}
        <p className="flex flex-wrap justify-center gap-x-1 text-[15.5px] leading-[1.9] text-ink">
          {PROJECT.team.map((name, i) => (
            <span key={name} className="whitespace-nowrap">
              {name}
              {i < PROJECT.team.length - 1 ? <span className="mx-2 text-faint">·</span> : null}
            </span>
          ))}
        </p>
        <p className="mt-2 text-[14px] text-muted">
          ครูที่ปรึกษา <span className="ml-1.5 text-ink">{PROJECT.advisor}</span>
        </p>
      </motion.div>
    </header>
  );

  return (
    <ContainerScroll titleComponent={title}>
      <div className="space-y-7 p-6 md:p-9">
        <SystemFlow />
        <StatBento />
      </div>
    </ContainerScroll>
  );
}

/* ---------- system overview inside the scroll frame ---------- */

function FlowNode({ title, sub, tone = 'plain', delay }: { title: string; sub: string; tone?: 'plain' | 'rust' | 'olive' | 'out'; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.6, ease: EASE, delay }}
      className={cx(
        'flex flex-col border-l-2 py-1 pl-3',
        tone === 'plain' && 'border-rule-strong',
        tone === 'rust' && 'border-accent',
        tone === 'olive' && 'border-olive',
        tone === 'out' && 'border-l-[3px] border-ink',
      )}
    >
      <span className={cx('leading-snug text-ink', tone === 'out' ? 'text-[15.5px] font-bold' : 'text-[14px] font-semibold')}>{title}</span>
      <span className="mt-0.5 text-[12px] leading-snug text-muted">{sub}</span>
    </motion.div>
  );
}

function Joint({ kind }: { kind: 'line' | 'split' | 'merge' }) {
  const d =
    kind === 'line'
      ? 'M0 50 L24 50'
      : kind === 'split'
        ? 'M0 50 C12 50, 12 25, 24 25 M0 50 C12 50, 12 75, 24 75'
        : 'M0 25 C12 25, 12 50, 24 50 M0 75 C12 75, 12 50, 24 50';
  // absolutely positioned so the SVG takes the grid cell's height instead of setting it
  return (
    <div className="relative h-full w-full">
      <svg viewBox="0 0 24 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <path d={d} fill="none" stroke="#C7D2CA" strokeWidth={1.25} vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}

function SystemFlow() {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[15px] font-semibold text-ink">ภาพรวมระบบ</span>
        <span className="mono-label text-faint">0 W · ไม่ใช้ไฟฟ้า</span>
      </div>
      {/* on narrow screens the flow scrolls inside its card instead of widening the page */}
      <div className="-mx-1 mt-6 overflow-x-auto overflow-y-hidden px-1 pb-1">
      <div
        className="grid h-[150px] min-w-[760px]"
        style={{ gridTemplateColumns: '1fr 28px 1fr 28px 1.1fr 28px 1.15fr 28px 1fr', gridTemplateRows: '1fr 1fr' }}
      >
        <div className="row-span-2 self-center" style={{ gridColumn: 1, gridRow: '1 / 3' }}>
          <FlowNode title="เปลือกกุ้ง-หอย" sub="กองหน้าร้าน >300 กก./วัน" delay={0} />
        </div>
        <div style={{ gridColumn: 2, gridRow: '1 / 3' }}>
          <Joint kind="line" />
        </div>
        <div className="self-center" style={{ gridColumn: 3, gridRow: '1 / 3' }}>
          <FlowNode title="แยก 2 ถังที่ต้นทาง" sub="ฝาปิดสนิท โรยแกลบดำ" delay={0.08} />
        </div>
        <div style={{ gridColumn: 4, gridRow: '1 / 3' }}>
          <Joint kind="split" />
        </div>
        <div className="self-center" style={{ gridColumn: 5, gridRow: 1 }}>
          <FlowNode title="คอกหมักเติมอากาศ" sub="เปลือกกุ้ง : วัสดุแห้ง 1 : 2" tone="rust" delay={0.16} />
        </div>
        <div className="self-center" style={{ gridColumn: 5, gridRow: 2 }}>
          <FlowNode title="ล้าง ผึ่ง ทุบหยาบ" sub="เปลือกหอย" tone="olive" delay={0.16} />
        </div>
        <div style={{ gridColumn: 6, gridRow: 1 }}>
          <Joint kind="line" />
        </div>
        <div style={{ gridColumn: 6, gridRow: 2 }}>
          <Joint kind="line" />
        </div>
        <div className="self-center" style={{ gridColumn: 7, gridRow: 1 }}>
          <FlowNode title="ปุ๋ยหมัก" sub="ย่อยแบบใช้อากาศ ไม่เหม็นเน่า" tone="rust" delay={0.24} />
        </div>
        <div className="self-center" style={{ gridColumn: 7, gridRow: 2 }}>
          <FlowNode title="โคกยกสูง + น้ำหมักแคลเซียม" sub="คลุมหน้าดิน รดเสริม" tone="olive" delay={0.24} />
        </div>
        <div style={{ gridColumn: 8, gridRow: '1 / 3' }}>
          <Joint kind="merge" />
        </div>
        <div className="self-center" style={{ gridColumn: 9, gridRow: '1 / 3' }}>
          <FlowNode title="ชุดฟื้นฟูดินเค็ม" sub="ทดลองที่แปลงลุงชัย" tone="out" delay={0.32} />
        </div>
      </div>
      </div>
      <p className="mt-4 text-[12.5px] leading-relaxed text-muted">
        ถ้าผลตรวจดินออกมาเป็นดินโซดิก จะใช้ยิปซัมเป็นตัวแก้หลัก ของจากเปลือกเป็นตัวเสริม
      </p>
    </div>
  );
}

function StatBento() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {STATS.map((s, i) => (
        <motion.div
          key={s.code}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.1 * i }}
          className={cx(INSET, 'flex flex-col p-5')}
        >
          <div className="mt-2 flex items-baseline gap-1.5">
            {s.prefix ? <span className="text-xl font-light text-muted">{s.prefix}</span> : null}
            <CountUp
              to={s.value}
              className="text-[2.8rem] font-semibold leading-none tabular-nums tracking-tight text-ink"
            />
            <span className="text-[14px] text-muted">{s.unit}</span>
          </div>
          <p className="mt-2.5 text-[13px] leading-relaxed text-muted">{s.label}</p>
          <p className="mt-auto pt-2 text-[11.5px] text-faint">ที่มา: {s.source}</p>
        </motion.div>
      ))}
    </div>
  );
}

/* ================= FIG. 01 — what people see vs. the real causes ================= */

type Focus = { kind: 'cause' | 'symptom'; index: number } | null;

const ROW_H = 168;

function CauseDiagram() {
  const [focus, setFocus] = useState<Focus>(null);

  const linkActive = (c: number, s: number) =>
    focus !== null &&
    ((focus.kind === 'cause' && focus.index === c) || (focus.kind === 'symptom' && focus.index === s));

  const symptomActive = (s: number) =>
    focus !== null &&
    (focus.kind === 'symptom' ? focus.index === s : ROOT_CAUSES[focus.index].affects.includes(s));

  const causeActive = (c: number) =>
    focus !== null &&
    (focus.kind === 'cause' ? focus.index === c : ROOT_CAUSES[c].affects.includes(focus.index));

  const dimmed = focus !== null;

  return (
    <Reveal className="mt-10">
      <Figure code="FIG. 01" title="สิ่งที่เห็น กับต้นเหตุจริง 3 ข้อ" note="ชี้เพื่อดูว่าเชื่อมกันอย่างไร" bodyClassName="px-6 pb-6 pt-4">
        <div className="grid grid-cols-[1fr_140px_1.35fr] gap-0">
          <div className="th-label pb-4 text-faint">ปลายเหตุ</div>
          <div />
          <div className="th-label pb-4 text-faint">ต้นเหตุ</div>

          {/* symptoms column */}
          <div className="grid" style={{ gridTemplateRows: `repeat(3, ${ROW_H}px)` }}>
            {SYMPTOMS.map((s, i) => {
              const on = symptomActive(i);
              return (
                <div key={s.code} className="flex items-center py-2">
                  <HoverBox
                    on={on}
                    dim={dimmed && !on}
                    tone="rust"
                    onEnter={() => setFocus({ kind: 'symptom', index: i })}
                    onLeave={() => setFocus(null)}
                    dot="right"
                  >
                    <span className="mono-label text-accent">{s.code}</span>
                    <span className="mt-2 block text-[17px] font-semibold leading-snug">{s.title}</span>
                    <span className="mt-1.5 block text-sm leading-relaxed text-muted">{s.detail}</span>
                  </HoverBox>
                </div>
              );
            })}
          </div>

          {/* connector column */}
          <svg className="w-full" style={{ height: ROW_H * 3 }} viewBox={`0 0 100 ${ROW_H * 3}`} preserveAspectRatio="none" aria-hidden="true">
            {ROOT_CAUSES.flatMap((cause, c) =>
              cause.affects.map((s) => {
                const y1 = ROW_H * s + ROW_H / 2;
                const y2 = ROW_H * c + ROW_H / 2;
                const on = linkActive(c, s);
                return (
                  <motion.path
                    key={`${c}-${s}`}
                    d={`M0 ${y1} C50 ${y1}, 50 ${y2}, 100 ${y2}`}
                    fill="none"
                    stroke={on ? '#17694A' : '#C7D2CA'}
                    strokeWidth={on ? 2 : 1.25}
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.1, ease: EASE, delay: 0.2 + 0.12 * c }}
                    style={{ opacity: dimmed && !on ? 0.25 : 1 }}
                  />
                );
              }),
            )}
          </svg>

          {/* causes column */}
          <div className="grid" style={{ gridTemplateRows: `repeat(3, ${ROW_H}px)` }}>
            {ROOT_CAUSES.map((c, i) => {
              const on = causeActive(i);
              return (
                <div key={c.code} className="flex items-center py-2">
                  <HoverBox
                    on={on}
                    dim={dimmed && !on}
                    tone="ink"
                    onEnter={() => setFocus({ kind: 'cause', index: i })}
                    onLeave={() => setFocus(null)}
                    dot="left"
                  >
                    <span className="flex items-baseline gap-3">
                      <span className="mono-label text-ink">{c.code}</span>
                      <span className="text-[17px] font-semibold leading-snug">{c.title}</span>
                    </span>
                    <span className="mt-2 block text-sm leading-relaxed text-muted">{c.detail}</span>
                  </HoverBox>
                </div>
              );
            })}
          </div>
        </div>

        <div className={cx(INSET, 'mt-6 flex flex-col gap-2 p-5 lg:flex-row lg:gap-6')}>
          <div className="th-label shrink-0 text-olive">ข้อสังเกต</div>
          <p className="text-[15px] leading-relaxed text-ink">{OBSERVATION}</p>
        </div>
      </Figure>
    </Reveal>
  );
}

function HoverBox({
  on,
  dim,
  tone,
  dot,
  onEnter,
  onLeave,
  children,
}: {
  on: boolean;
  dim: boolean;
  tone: 'rust' | 'ink';
  dot: 'left' | 'right';
  onEnter: () => void;
  onLeave: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
      className={cx(
        'relative h-full w-full rounded-md px-5 py-4 text-left ring-1 transition-all duration-300',
        on
          ? tone === 'rust'
            ? 'bg-accent-soft ring-accent/30'
            : 'bg-white shadow-[0_10px_30px_-12px_rgba(20,22,21,0.25)] ring-rule-strong'
          : 'bg-paper ring-rule',
        dim && 'opacity-40',
      )}
    >
      {children}
      <span
        className={cx(
          'absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full ring-2 ring-white',
          dot === 'right' ? '-right-[5px]' : '-left-[5px]',
          on ? (tone === 'rust' ? 'bg-accent' : 'bg-ink') : 'bg-rule-strong',
        )}
      />
    </button>
  );
}

/* ================= FIG. 02 — who is hurt most + their own words ================= */

function ImpactPanel() {
  const [tier, setTier] = useState(0);
  const [personId, setPersonId] = useState<string>(IMPACT_TIERS[0].people[0]);
  const person = PEOPLE[personId];

  const selectTier = (i: number) => {
    setTier(i);
    setPersonId(IMPACT_TIERS[i].people[0]);
  };

  return (
    <div className="mt-16">
      <Lead num="1.2" title="ใครเดือดร้อนบ้าง">
        เรียงจากคนที่ได้รับผลกระทบหนักที่สุด กดชื่อเพื่ออ่านสิ่งที่เขาเล่าให้เราฟัง
      </Lead>

      <Reveal className="mt-6">
        <Figure code="FIG. 02" title="ลำดับผู้ได้รับผลกระทบ และเสียงจากคนในพื้นที่" bodyClassName="p-2 pt-3">
          <div className="grid grid-cols-12 gap-2">
            {/* ranking ladder */}
            <div className="col-span-12 space-y-1 lg:col-span-7">
              {IMPACT_TIERS.map((t, i) => {
                const on = tier === i;
                return (
                  <div
                    key={t.code}
                    className={cx('relative rounded-md transition-colors', on ? 'bg-paper ring-1 ring-rule' : 'hover:bg-paper')}
                  >
                    <button type="button" onClick={() => selectTier(i)} className="block w-full px-5 pb-3 pt-4 text-left">
                      <span className="flex items-baseline gap-3">
                        <span className={cx('mono-label', i === 0 ? 'text-accent' : 'text-ink')}>{t.code}</span>
                        <span className="th-label text-faint">{t.rank}</span>
                      </span>
                      <span className="mt-1.5 block text-lg font-semibold leading-snug">{t.group}</span>
                      <AnimatePresence initial={false}>
                        {on ? (
                          <motion.span
                            className="block overflow-hidden"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.35, ease: EASE }}
                          >
                            <span className="block pt-2 text-[15px] leading-relaxed text-muted">{t.detail}</span>
                          </motion.span>
                        ) : null}
                      </AnimatePresence>
                    </button>
                    <div className="flex flex-wrap gap-2 px-5 pb-4">
                      {t.people.map((id) => {
                        const p = PEOPLE[id];
                        const selected = personId === id;
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => {
                              setTier(i);
                              setPersonId(id);
                            }}
                            className={cx(
                              'rounded-full px-3 py-1 text-[13.5px] ring-1 transition-colors',
                              selected ? 'bg-accent-soft text-accent ring-accent/30' : 'bg-white text-ink ring-rule-strong hover:ring-rule-strong',
                            )}
                          >
                            {p.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* voice panel */}
            <div className="relative col-span-12 flex min-h-[380px] flex-col rounded-md bg-paper p-7 ring-1 ring-rule lg:col-span-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={person.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="flex flex-1 flex-col"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-xl font-semibold">{person.name}</span>
                    <span className="text-[13px] text-muted">
                      {person.role} · {person.age} ปี
                    </span>
                  </div>
                  <blockquote className="relative mt-5 flex-1 border-l-2 border-accent/30 pl-5 text-[1.05rem] leading-[1.95] text-ink">
                    “{person.quote}”
                  </blockquote>
                  <div className="mt-6 text-[12.5px] text-faint">เสียงจากคนในพื้นที่ ชุมชนที่ 1 · ยกมาตามต้นฉบับ</div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </Figure>
      </Reveal>
    </div>
  );
}

/* ================= FIG. 03 — what we will measure on site ================= */

function DataPlanGrid() {
  return (
    <div className="mt-16">
      <Lead num="1.3" title="ข้อมูลที่จะเก็บตอนลงพื้นที่">
        ทั้ง 4 ด้านจะเก็บตอนลงพื้นที่จริง ใช้ยืนยันว่าปัญหาเป็นอย่างที่เห็น และเก็บไว้เป็นค่าตั้งต้นเพื่อเทียบผลทีหลัง
      </Lead>

      <Reveal className="mt-6">
        <Figure code="FIG. 03" title="เก็บอะไร ด้วยวิธีไหน" note="ยังไม่ได้ลงพื้นที่" bodyClassName="px-6 pb-6 pt-3">
          <div className="grid gap-y-6 md:grid-cols-2 md:gap-x-8 xl:grid-cols-4 xl:gap-x-0 xl:divide-x xl:divide-rule">
            {DATA_PLAN.map((d, i) => (
              <motion.section
                key={d.code}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.55, ease: EASE, delay: 0.07 * i }}
                className="xl:px-6 xl:first:pl-0 xl:last:pr-0"
              >
                <h4 className="text-[1.05rem] font-semibold text-ink">{d.domain}</h4>
                <div className="mt-0.5 text-[13px] text-accent">{d.method}</div>
                <p className="mt-2.5 text-sm leading-relaxed text-muted">{d.detail}</p>
              </motion.section>
            ))}
          </div>
        </Figure>
      </Reveal>
    </div>
  );
}
