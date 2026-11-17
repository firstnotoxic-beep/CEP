import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FUNDING, KPIS, PEOPLE, SECTION4_LEAD, STEWARDS, type Scene } from '../content';
import { EASE, Figure, Lead, Reveal, Section, cx } from '../components/ui';

export default function Section4({ scene }: { scene: Scene }) {
  return (
    <Section scene={scene}>
      <Lead num="4.1" title="ให้ชุมชนเดินต่อเองได้">
        {SECTION4_LEAD}
      </Lead>

      <Reveal className="mt-10">
        <KpiPanel />
      </Reveal>

      <div className="mt-8 grid grid-cols-12 gap-5">
        <Reveal className="col-span-12 lg:col-span-6">
          <HandoverModel />
        </Reveal>
        <Reveal delay={0.1} className="col-span-12 lg:col-span-6">
          <FundingModel />
        </Reveal>
      </div>
    </Section>
  );
}

/* ================= FIG. 4.1 — 5 KPIs ================= */

function KpiPanel() {
  const [active, setActive] = useState(0);
  const k = KPIS[active];

  return (
    <Figure
      code="FIG. 4.1"
      title="ตัวชี้วัด 5 ข้อที่จะเก็บค่าจริงในพื้นที่"
      note="ยังไม่มีผลการทดลอง · กดเพื่อดูรายละเอียด"
      bodyClassName="p-6"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {KPIS.map((kpi, i) => {
          const on = i === active;
          return (
            <motion.button
              key={kpi.code}
              type="button"
              onClick={() => setActive(i)}
              onMouseEnter={() => setActive(i)}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.55, ease: EASE, delay: 0.07 * i }}
              className={cx(
                'flex min-h-[176px] flex-col rounded-xl p-4 text-left ring-1 transition-[background-color,box-shadow] duration-300',
                on ? 'bg-white shadow-[0_10px_30px_-14px_rgba(20,22,21,0.3)] ring-stone-900/15' : 'bg-stone-50 ring-stone-900/[0.05] hover:ring-stone-900/15',
              )}
            >
              <div className="flex items-center justify-between">
                <span className={cx('mono-label', on ? 'text-rust' : 'text-faint')}>{kpi.code}</span>
                <span className="relative flex h-2.5 w-2.5">
                  <motion.span
                    className="absolute inset-0 rounded-full bg-rust"
                    animate={{ scale: [1, 2.2], opacity: [0.5, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.2 }}
                  />
                  <span className="relative h-2.5 w-2.5 rounded-full bg-rust" />
                </span>
              </div>
              <span className="mt-3 text-[16px] font-semibold leading-snug">{kpi.name}</span>
              <span className="mt-auto pt-4">
                <span className="block font-mono text-[1.6rem] leading-none text-rule-strong">— —</span>
                <span className="th-label mt-1.5 block text-faint">รอเก็บค่าจริง</span>
              </span>
              <motion.span
                className="mt-3 block h-[3px] origin-left bg-rust"
                initial={false}
                animate={{ scaleX: on ? 1 : 0 }}
                transition={{ duration: 0.4, ease: EASE }}
              />
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="mt-5 grid grid-cols-12 gap-5 border-t border-rule pt-5"
        >
          <div className="col-span-12 md:col-span-4">
            <span className="mono-label text-rust">{k.code}</span>
            <div className="mt-1 text-[1.2rem] font-semibold leading-snug">{k.name}</div>
          </div>
          <div className="col-span-12 md:col-span-4">
            <div className="th-label text-faint">วิธีเทียบผล</div>
            <div className="mt-1 text-[15px] leading-relaxed">{k.compare}</div>
          </div>
          <div className="col-span-12 md:col-span-4">
            <div className="th-label text-faint">เชื่อมกับ</div>
            <div className="mt-1 text-[15px] leading-relaxed">{k.links}</div>
          </div>
        </motion.div>
      </AnimatePresence>
    </Figure>
  );
}

/* ================= FIG. 4.2 — handover model ================= */

function HandoverModel() {
  return (
    <Figure code="FIG. 4.2" title="โมเดลส่งมอบให้ชุมชนดูแลต่อ" className="h-full">
      <div className="relative">
        <div className="mx-auto w-fit rounded-xl bg-stone-800 px-5 py-3 text-center text-white shadow-md">
          <span className="text-[15px] font-semibold">ถังพัก · คอกหมัก · แปลงทดลอง</span>
        </div>

        <svg viewBox="0 0 300 40" className="h-10 w-full" preserveAspectRatio="none" aria-hidden="true">
          {[50, 150, 250].map((x, i) => (
            <motion.line
              key={x}
              x1={150}
              y1={0}
              x2={x}
              y2={40}
              stroke="#9A4A24"
              strokeWidth={1.25}
              vectorEffect="non-scaling-stroke"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.2 + i * 0.12 }}
            />
          ))}
        </svg>

        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {STEWARDS.map((s, i) => (
            <motion.li
              key={s.person}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.5 + i * 0.1 }}
              className="flex flex-col rounded-xl bg-stone-50 p-4 ring-1 ring-stone-900/[0.05]"
            >
              <span className="th-label text-faint">{s.group}</span>
              <span className="mt-1 text-[17px] font-semibold">{PEOPLE[s.person].name}</span>
              <span className="mt-3 border-t border-rule pt-3 text-[14px] leading-relaxed text-muted">{s.role}</span>
            </motion.li>
          ))}
        </ul>
      </div>
    </Figure>
  );
}

/* ================= FIG. 4.3 — funding: from budget to revolving fund ================= */

const R = 100;
const C = { x: 180, y: 130 };

function FundingModel() {
  const n = FUNDING.loop.length;
  const nodes = FUNDING.loop.map((label, i) => {
    const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
    return { label, x: C.x + Math.cos(a) * R, y: C.y + Math.sin(a) * R };
  });

  return (
    <Figure code="FIG. 4.3" title="แหล่งทุน: จากงบ อบต. สู่กองทุนหมุนเวียน" className="h-full">
      <div className="grid grid-cols-12 gap-4">
        {/* phases */}
        <ol className="col-span-12 space-y-3 sm:col-span-4">
          <li className="rounded-xl bg-stone-50 p-4 ring-1 ring-stone-900/[0.05]">
            <span className="mono-label text-faint">Phase A</span>
            <div className="mt-1 text-[1.15rem] font-semibold">{FUNDING.phaseA.when}</div>
            <div className="mt-0.5 text-[15px] text-muted">{FUNDING.phaseA.what}</div>
          </li>
          <li className="text-center text-faint">↓</li>
          <li className="rounded-xl bg-[#EEF0E6] p-4 ring-1 ring-olive/20">
            <span className="mono-label text-olive">Phase B</span>
            <div className="mt-1 text-[1.15rem] font-semibold">{FUNDING.phaseB.when}</div>
            <div className="mt-0.5 text-[15px] text-muted">{FUNDING.phaseB.what}</div>
          </li>
        </ol>

        {/* revolving loop */}
        <div className="col-span-12 sm:col-span-8">
          <svg viewBox="0 0 360 262" className="h-auto w-full" role="img" aria-label="วงจรกองทุนหมุนเวียน">
            <circle cx={C.x} cy={C.y} r={R} fill="none" stroke="#C9C6BC" strokeDasharray="4 5" />
            <g transform={`translate(${C.x} ${C.y})`}>
              <motion.g animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}>
                {/* invisible ring keeps the group's box centred on the circle centre */}
                <circle r={R + 5} fill="none" stroke="none" />
                <circle cy={-R} r={5} fill="#55603A" />
              </motion.g>
            </g>
            <text x={C.x} y={C.y - 6} textAnchor="middle" fontSize="10" fontFamily="JetBrains Mono, monospace" fill="#8D9089">
              REVOLVING
            </text>
            <text x={C.x} y={C.y + 12} textAnchor="middle" fontSize="14" fill="#141615">
              หมุนเวียน
            </text>
            {nodes.map((nd, i) => (
              <g key={nd.label}>
                <rect
                  x={nd.x - 62}
                  y={nd.y - 16}
                  width={124}
                  height={32}
                  rx={16}
                  fill={i === 1 ? '#55603A' : '#FFFFFF'}
                  stroke={i === 1 ? '#55603A' : 'rgba(20,22,21,0.18)'}
                />
                <text
                  x={nd.x}
                  y={nd.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="13"
                  fill={i === 1 ? '#FAF9F5' : '#141615'}
                >
                  {nd.label}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    </Figure>
  );
}
