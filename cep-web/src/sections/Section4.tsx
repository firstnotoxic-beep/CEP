import { motion } from 'framer-motion';
import { FUNDING, KPIS, PEOPLE, SECTION4_LEAD, STEWARDS, type Scene } from '../content';
import { EASE, Figure, Lead, Reveal, Section } from '../components/ui';

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

/* ================= FIG. 4.1 — what we will measure ================= */

function KpiPanel() {
  return (
    <Figure code="FIG. 4.1" title="ตัวชี้วัด 5 ข้อ ที่จะเก็บค่าจริงในพื้นที่" note="ยังไม่มีผลการทดลอง" bodyClassName="px-6 pb-4 pt-3">
      <div className="hidden grid-cols-[1.2fr_1.3fr_1.1fr_7rem] gap-4 border-b border-rule-strong pb-2 text-[12.5px] text-faint md:grid">
        <span>วัดอะไร</span>
        <span>เทียบกับอะไร</span>
        <span>ตอบโจทย์เรื่องไหน</span>
        <span className="text-right">ค่าที่ได้</span>
      </div>
      <ol>
        {KPIS.map((k, i) => (
          <motion.li
            key={k.code}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.06 * i }}
            className="grid gap-x-4 gap-y-1 border-b border-rule py-4 transition-colors last:border-b-0 hover:bg-paper md:grid-cols-[1.2fr_1.3fr_1.1fr_7rem] md:items-baseline"
          >
            <span className="text-[16px] font-semibold leading-snug text-ink">{k.name}</span>
            <span className="text-[14.5px] leading-relaxed text-muted">{k.compare}</span>
            <span className="text-[14.5px] leading-relaxed text-muted">{k.links}</span>
            <span className="text-[13px] text-faint md:text-right">ยังไม่ได้วัด</span>
          </motion.li>
        ))}
      </ol>
    </Figure>
  );
}

/* ================= FIG. 4.2 — who keeps it running ================= */

function HandoverModel() {
  return (
    <Figure code="FIG. 4.2" title="ส่งต่อให้ใครดูแล" className="h-full" bodyClassName="px-6 pb-6 pt-2">
      <p className="text-[14.5px] leading-relaxed text-muted">
        สิ่งที่ส่งมอบคือ ถังพัก คอกหมัก และแปลงทดลอง โดยแบ่งงานให้คนที่อยู่ในพื้นที่อยู่แล้ว
      </p>
      <ul className="mt-4">
        {STEWARDS.map((s, i) => (
          <motion.li
            key={s.person}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.1 + i * 0.08 }}
            className="grid grid-cols-[9.5rem_1fr] gap-4 border-t border-rule py-3.5"
          >
            <span>
              <span className="block text-[16px] font-semibold text-ink">{PEOPLE[s.person].name}</span>
              <span className="block text-[12.5px] text-faint">{s.group}</span>
            </span>
            <span className="text-[15px] leading-relaxed text-ink">{s.role}</span>
          </motion.li>
        ))}
      </ul>
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
          <li className="rounded-md bg-paper p-4 ring-1 ring-rule">
            <span className="text-[13px] font-semibold text-faint">ระยะที่ 1</span>
            <div className="mt-1 text-[1.15rem] font-semibold">{FUNDING.phaseA.when}</div>
            <div className="mt-0.5 text-[15px] text-muted">{FUNDING.phaseA.what}</div>
          </li>
          <li className="text-center text-faint">↓</li>
          <li className="rounded-md bg-paper p-4 ring-1 ring-olive/20">
            <span className="text-[13px] font-semibold text-accent">ระยะที่ 2</span>
            <div className="mt-1 text-[1.15rem] font-semibold">{FUNDING.phaseB.when}</div>
            <div className="mt-0.5 text-[15px] text-muted">{FUNDING.phaseB.what}</div>
          </li>
        </ol>

        {/* revolving loop */}
        <div className="col-span-12 sm:col-span-8">
          <svg viewBox="0 0 360 262" className="h-auto w-full" role="img" aria-label="วงจรกองทุนหมุนเวียน">
            <circle cx={C.x} cy={C.y} r={R} fill="none" stroke="#C7D2CA" strokeDasharray="4 5" />
            <g transform={`translate(${C.x} ${C.y})`}>
              <motion.g animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}>
                {/* invisible ring keeps the group's box centred on the circle centre */}
                <circle r={R + 5} fill="none" stroke="none" />
                <circle cy={-R} r={5} fill="#17694A" />
              </motion.g>
            </g>
            <text x={C.x} y={C.y + 5} textAnchor="middle" fontSize="14" fill="#142019">
              เงินหมุนเวียน
            </text>
            {nodes.map((nd, i) => (
              <g key={nd.label}>
                <rect
                  x={nd.x - 62}
                  y={nd.y - 16}
                  width={124}
                  height={32}
                  rx={16}
                  fill={i === 1 ? '#17694A' : '#FFFFFF'}
                  stroke={i === 1 ? '#17694A' : '#C7D2CA'}
                />
                <text
                  x={nd.x}
                  y={nd.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="13"
                  fill={i === 1 ? '#F4F7F5' : '#142019'}
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
