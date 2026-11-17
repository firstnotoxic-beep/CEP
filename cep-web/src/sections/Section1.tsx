import { useState } from 'react';
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
import { CountUp, EASE, Figure, Reveal, Section, cx } from '../components/ui';

export default function Section1({ scene }: { scene: Scene }) {
  return (
    <Section scene={scene}>
      <Cover />
      <StatRow />
      <ProblemLead />
      <CauseDiagram />
      <ImpactPanel />
      <DataPlanGrid />
    </Section>
  );
}

/* ================= Cover ================= */

function Cover() {
  return (
    <div className="grid grid-cols-12 gap-5">
      <Reveal className="col-span-12 flex flex-col justify-between border border-rule bg-card p-8 lg:col-span-8">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <span className="th-label text-muted">{PROJECT.program}</span>
          <span className="text-rule-strong">/</span>
          <span className="th-label text-rust">{PROJECT.community}</span>
        </div>
        <h1 className="mt-8 text-[2.15rem] font-semibold leading-[1.35] tracking-[-0.01em] text-ink">
          {PROJECT.title}
        </h1>
        <div className="mt-10 flex items-center gap-4 border-t border-rule pt-4">
          <span className="mono-label text-faint">Institution</span>
          <span className="text-[15px] text-ink">{PROJECT.school}</span>
        </div>
      </Reveal>

      <Reveal delay={0.1} className="col-span-12 border border-rule bg-card p-8 lg:col-span-4">
        <div className="th-label text-faint">คณะผู้จัดทำ</div>
        <ol className="mt-5 space-y-2.5">
          {PROJECT.team.map((name, i) => (
            <li key={name} className="flex items-baseline gap-4 border-b border-rule pb-2.5 last:border-b-0">
              <span className="font-mono text-[11px] text-faint">{String(i + 1).padStart(2, '0')}</span>
              <span className="text-[15px]">{name}</span>
            </li>
          ))}
        </ol>
        <div className="mt-6 border-t border-ink pt-4">
          <div className="th-label text-faint">ครูที่ปรึกษาโครงการ</div>
          <div className="mt-2 text-[15px]">{PROJECT.advisor}</div>
        </div>
      </Reveal>
    </div>
  );
}

/* ================= Stats ================= */

function StatRow() {
  return (
    <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">
      {STATS.map((s, i) => (
        <Reveal key={s.code} delay={0.08 * i} className="relative border border-rule bg-card p-6">
          <div className="flex items-center justify-between">
            <span className="mono-label text-rust">{s.code}</span>
            <span className="th-label text-faint">ที่มา: {s.source}</span>
          </div>
          <div className="mt-6 flex items-baseline gap-2">
            {s.prefix ? <span className="text-3xl font-light text-muted">{s.prefix}</span> : null}
            <CountUp to={s.value} className="text-[4.2rem] font-semibold leading-none tabular-nums tracking-tight" />
            <span className="ml-1 text-lg text-muted">{s.unit}</span>
          </div>
          <p className="mt-5 border-t border-rule pt-4 text-[15px] leading-relaxed text-muted">{s.label}</p>
        </Reveal>
      ))}
    </div>
  );
}

/* ================= Problem lead ================= */

function ProblemLead() {
  return (
    <Reveal className="mt-16 grid grid-cols-12 gap-5">
      <div className="col-span-12 lg:col-span-3">
        <div className="mono-label text-faint">1.1</div>
        <h2 className="mt-2 text-2xl font-semibold">ปัญหาที่พบ</h2>
      </div>
      <p className="col-span-12 text-[1.2rem] leading-[1.9] text-ink lg:col-span-9">{PROBLEM_STATEMENT}</p>
    </Reveal>
  );
}

/* ================= FIG. 01 — Symptoms vs structural causes ================= */

type Focus = { kind: 'cause' | 'symptom'; index: number } | null;

const ROW_H = 168;

function CauseDiagram() {
  const [focus, setFocus] = useState<Focus>(null);

  const linkActive = (c: number, s: number) =>
    focus !== null &&
    ((focus.kind === 'cause' && focus.index === c) || (focus.kind === 'symptom' && focus.index === s));

  const symptomActive = (s: number) =>
    focus !== null &&
    (focus.kind === 'symptom'
      ? focus.index === s
      : ROOT_CAUSES[focus.index].affects.includes(s));

  const causeActive = (c: number) =>
    focus !== null &&
    (focus.kind === 'cause' ? focus.index === c : ROOT_CAUSES[c].affects.includes(focus.index));

  const dimmed = focus !== null;

  return (
    <Reveal className="mt-10">
      <Figure
        code="FIG. 01"
        title="ปลายเหตุที่มองเห็น เทียบกับสาเหตุเชิงโครงสร้าง 3 ประการ"
        note="ชี้ที่กล่องเพื่อดูความเชื่อมโยง"
        bodyClassName="p-6"
      >
        <div className="grid grid-cols-[1fr_140px_1.35fr] gap-0">
          <div className="th-label pb-4 text-faint">ปลายเหตุ (Symptoms)</div>
          <div />
          <div className="th-label pb-4 text-faint">สาเหตุเชิงโครงสร้าง (Root Causes)</div>

          {/* symptoms column */}
          <div className="grid" style={{ gridTemplateRows: `repeat(3, ${ROW_H}px)` }}>
            {SYMPTOMS.map((s, i) => {
              const on = symptomActive(i);
              return (
                <div key={s.code} className="flex items-center py-2">
                  <button
                    type="button"
                    onMouseEnter={() => setFocus({ kind: 'symptom', index: i })}
                    onMouseLeave={() => setFocus(null)}
                    onFocus={() => setFocus({ kind: 'symptom', index: i })}
                    onBlur={() => setFocus(null)}
                    className={cx(
                      'relative h-full w-full border bg-paper px-5 py-4 text-left transition-all duration-300',
                      on ? 'border-rust bg-rust-soft' : 'border-rule',
                      dimmed && !on && 'opacity-40',
                    )}
                  >
                    <span className="mono-label text-rust">{s.code}</span>
                    <span className="mt-2 block text-[17px] font-semibold leading-snug">{s.title}</span>
                    <span className="mt-1.5 block text-sm leading-relaxed text-muted">{s.detail}</span>
                    <span
                      className={cx(
                        'absolute -right-[5px] top-1/2 h-2.5 w-2.5 -translate-y-1/2 border',
                        on ? 'border-rust bg-rust' : 'border-ink bg-card',
                      )}
                    />
                  </button>
                </div>
              );
            })}
          </div>

          {/* connector column */}
          <svg
            className="w-full"
            style={{ height: ROW_H * 3 }}
            viewBox={`0 0 100 ${ROW_H * 3}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
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
                    stroke={on ? '#9A4A24' : '#C9C6BC'}
                    strokeWidth={on ? 2.25 : 1.25}
                    strokeDasharray={on ? undefined : '4 4'}
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
                  <button
                    type="button"
                    onMouseEnter={() => setFocus({ kind: 'cause', index: i })}
                    onMouseLeave={() => setFocus(null)}
                    onFocus={() => setFocus({ kind: 'cause', index: i })}
                    onBlur={() => setFocus(null)}
                    className={cx(
                      'relative h-full w-full border bg-card px-5 py-4 text-left transition-all duration-300',
                      on ? 'border-ink shadow-[4px_4px_0_0_#141615]' : 'border-rule',
                      dimmed && !on && 'opacity-40',
                    )}
                  >
                    <span
                      className={cx(
                        'absolute -left-[5px] top-1/2 h-2.5 w-2.5 -translate-y-1/2 border',
                        on ? 'border-ink bg-ink' : 'border-ink bg-card',
                      )}
                    />
                    <span className="flex items-baseline gap-3">
                      <span className="mono-label text-ink">{c.code}</span>
                      <span className="text-[17px] font-semibold leading-snug">{c.title}</span>
                    </span>
                    <span className="mt-2 block text-sm leading-relaxed text-muted">{c.detail}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-12 gap-5 border-t border-rule pt-5">
          <div className="th-label col-span-12 text-olive lg:col-span-2">ข้อสังเกตเพิ่มเติม</div>
          <p className="col-span-12 text-[15px] leading-relaxed text-ink lg:col-span-10">{OBSERVATION}</p>
        </div>
      </Figure>
    </Reveal>
  );
}

/* ================= FIG. 02 — Impact ranking + stakeholder voices ================= */

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
      <Reveal className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-3">
          <div className="mono-label text-faint">1.2</div>
          <h2 className="mt-2 text-2xl font-semibold">กลุ่มผู้ได้รับผลกระทบ</h2>
        </div>
        <p className="col-span-12 text-[15px] leading-relaxed text-muted lg:col-span-9">
          จัดลำดับตามความรุนแรงของผลกระทบ เลือกกลุ่มหรือบุคคลเพื่อดูเสียงสะท้อนจากคนในพื้นที่ (ยกมาตามกรณีศึกษา)
        </p>
      </Reveal>

      <Reveal className="mt-6">
        <Figure code="FIG. 02" title="ลำดับกลุ่มผู้ได้รับผลกระทบ และเสียงสะท้อนจากคนในพื้นที่" bodyClassName="p-0">
          <div className="grid grid-cols-12">
            {/* ranking ladder */}
            <div className="col-span-12 border-rule lg:col-span-7 lg:border-r">
              {IMPACT_TIERS.map((t, i) => {
                const on = tier === i;
                return (
                  <div
                    key={t.code}
                    className={cx(
                      'relative border-b border-rule transition-colors last:border-b-0',
                      on ? 'bg-paper' : 'bg-card',
                    )}
                  >
                    <span
                      className={cx(
                        'absolute inset-y-0 left-0 w-[3px] transition-colors',
                        on ? (i === 0 ? 'bg-rust' : 'bg-ink') : 'bg-transparent',
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => selectTier(i)}
                      className="block w-full px-6 pb-3 pt-5 text-left"
                    >
                      <span className="flex items-baseline gap-4">
                        <span className={cx('mono-label', i === 0 ? 'text-rust' : 'text-ink')}>{t.code}</span>
                        <span className="th-label text-faint">{t.rank}</span>
                      </span>
                      <span className="mt-2 block text-lg font-semibold leading-snug">{t.group}</span>
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
                    <div className="flex flex-wrap gap-2 px-6 pb-5">
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
                              'border px-3 py-1.5 text-sm transition-colors',
                              selected
                                ? 'border-ink bg-ink text-paper'
                                : 'border-rule bg-card text-ink hover:border-ink',
                            )}
                          >
                            {i === 0 ? 'หลักฐาน: ' : ''}
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
            <div className="relative col-span-12 flex min-h-[380px] flex-col bg-paper p-8 lg:col-span-5">
              <div className="mono-label text-faint">Stakeholder Voice</div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={person.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="flex flex-1 flex-col"
                >
                  <div className="mt-5 flex items-baseline justify-between gap-4 border-b border-ink pb-3">
                    <span className="text-xl font-semibold">{person.name}</span>
                    <span className="font-mono text-xs text-muted">
                      {person.role} · อายุ {person.age} ปี
                    </span>
                  </div>
                  <blockquote className="relative mt-6 flex-1 pl-6 text-[1.05rem] leading-[1.95] text-ink">
                    <span className="absolute left-0 top-0 h-full w-px bg-rule-strong" />
                    “{person.quote}”
                  </blockquote>
                  <div className="th-label mt-6 text-faint">ที่มา: เสียงสะท้อนจากคนในพื้นที่ ชุมชนที่ 1</div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </Figure>
      </Reveal>
    </div>
  );
}

/* ================= FIG. 03 — Field data plan ================= */

function DataPlanGrid() {
  return (
    <div className="mt-16">
      <Reveal className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-3">
          <div className="mono-label text-faint">1.3</div>
          <h2 className="mt-2 text-2xl font-semibold">แผนการเก็บข้อมูลเมื่อลงพื้นที่</h2>
        </div>
        <p className="col-span-12 text-[15px] leading-relaxed text-muted lg:col-span-9">
          ข้อมูลทั้ง 4 ด้านจะเก็บจริงเมื่อลงพื้นที่ เพื่อยืนยันปัญหาและใช้เป็นฐานเปรียบเทียบผลหลังดำเนินโครงการ
        </p>
      </Reveal>

      <Reveal className="mt-6">
        <Figure code="FIG. 03" title="กรอบการเก็บข้อมูลภาคสนาม 4 ด้าน" note="สถานะ: รอลงพื้นที่" bodyClassName="p-0">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
            {DATA_PLAN.map((d, i) => (
              <motion.div
                key={d.code}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, ease: EASE, delay: 0.08 * i }}
                className={cx(
                  'flex flex-col border-rule p-6',
                  i < DATA_PLAN.length - 1 && 'xl:border-r',
                  'border-b xl:border-b-0',
                )}
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-2xl font-semibold text-ink">{d.code}</span>
                  <span className="mono-label text-faint">{String(i + 1).padStart(2, '0')} / 04</span>
                </div>
                <div className="mt-5 text-lg font-semibold">{d.domain}</div>
                <div className="mt-2 inline-flex self-start border border-rule bg-paper px-2 py-1 text-xs font-medium text-rust">
                  {d.method}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted">{d.detail}</p>
                <div className="mt-auto flex items-center gap-2 pt-6">
                  <span className="h-2 w-2 border border-ink" />
                  <span className="mono-label text-faint">Pending field visit</span>
                </div>
              </motion.div>
            ))}
          </div>
        </Figure>
      </Reveal>
    </div>
  );
}
