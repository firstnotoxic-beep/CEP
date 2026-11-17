import { Suspense, lazy, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import type { SoilState } from '../components/SoilCore3D';
import {
  BACKUP_TRIGGER,
  CONFLICT,
  CONSTRAINTS,
  LIME_TEAM,
  LIME_WRONG,
  SCHEDULE,
  SECTION3_LEAD,
  SOIL_CASES,
  SOIL_EQUATION,
  SOIL_PROPOSAL,
  type Constraint,
  type Scene,
} from '../content';
import { BTN_GHOST, EASE, Figure, INSET, Lead, PillTabs, Reveal, Section, SourceTag, cx } from '../components/ui';

const SoilCore3D = lazy(() => import('../components/SoilCore3D'));

export default function Section3({ scene }: { scene: Scene }) {
  return (
    <Section scene={scene}>
      <Lead num="3.1" title="สิ่งที่ต้องรับมือ">
        {SECTION3_LEAD}
      </Lead>

      <Reveal className="mt-10">
        <SoilSim />
      </Reveal>
      <Reveal className="mt-8">
        <LimeSim />
      </Reveal>
      <ConstraintGrid />
      <Reveal className="mt-8">
        <ConflictPanel />
      </Reveal>
    </Section>
  );
}

/* =====================================================================
   SIM. 3.1 — soil classification & the role of gypsum
   ===================================================================== */

function SoilStage({ state }: { state: SoilState }) {
  const ref = useRef<HTMLDivElement>(null);
  const near = useInView(ref, { amount: 0.1 });
  return (
    <div ref={ref} className="relative mt-3 h-[400px] overflow-hidden rounded-xl bg-[#F6F5F0] ring-1 ring-stone-900/[0.05]">
      <Suspense
        fallback={
          <div className="grid h-full place-items-center">
            <span className="mono-label text-faint">Loading 3D model</span>
          </div>
        }
      >
        <SoilCore3D state={state} running={near} />
      </Suspense>
      <span className="pointer-events-none absolute bottom-3 right-4 text-[11.5px] text-faint">ลากเพื่อหมุนดู</span>
    </div>
  );
}

function SoilSim() {
  const [kind, setKind] = useState<'saline' | 'sodic'>('sodic');
  const [gypsum, setGypsum] = useState(false);
  const state: SoilState = kind === 'saline' ? 'saline' : gypsum ? 'gypsum' : 'sodic';
  const info = SOIL_CASES.find((c) => c.id === kind) ?? SOIL_CASES[0];

  return (
    <Figure
      code="SIM. 3.1"
      title="ดินเค็มแบบไหน และยิปซัมมีหน้าที่อะไร"
      note="สลับผลตรวจดินเพื่อเทียบกัน"
      bodyClassName="grid grid-cols-12 gap-2 p-2 pt-3"
    >
      {/* left: controls + explanation */}
      <div className="col-span-12 p-4 lg:col-span-5">
        <SourceTag kind="proposal" />
        <p className="mt-2 text-[16px] leading-[1.8]">{SOIL_PROPOSAL}</p>

        <div className="th-label mt-6 text-faint">ถ้าผลตรวจจากสถานีพัฒนาที่ดินออกมาเป็น…</div>
        <PillTabs
          className="mt-2"
          layoutId="soil-kind"
          value={kind}
          onChange={(id) => {
            setKind(id);
            setGypsum(false);
          }}
          items={SOIL_CASES.map((c) => ({ id: c.id, label: c.label }))}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={kind}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            {kind === 'sodic' ? (
              <button
                type="button"
                onClick={() => setGypsum((g) => !g)}
                className={cx(
                  'mt-4 flex w-full items-center justify-between rounded-xl px-4 py-3 text-left ring-1 transition-colors',
                  gypsum ? 'bg-olive text-white ring-olive' : 'bg-white text-ink ring-stone-900/10 hover:bg-stone-50',
                )}
              >
                <span className="text-[15px] font-medium">{gypsum ? 'ใส่ยิปซัมแล้ว: Ca²⁺ เข้าไปแทนที่ Na⁺' : 'ลองใส่ยิปซัมดู'}</span>
                <span className="text-[12.5px] opacity-70">{gypsum ? 'ย้อนกลับ' : 'CaSO₄·2H₂O'}</span>
              </button>
            ) : null}

            <div className="mt-6">
              <SourceTag kind="science" />
            </div>
            <ul className="mt-3 space-y-2.5">
              {info.science.map((s) => (
                <li key={s} className="flex gap-3 text-[14.5px] leading-relaxed text-muted">
                  <span className="mt-[10px] h-1 w-1 shrink-0 rounded-full bg-stone-400" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* right: 3D soil core + remedy hierarchy */}
      <div className={cx(INSET, 'col-span-12 flex flex-col p-5 lg:col-span-7')}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[12.5px] text-faint">แท่งดินตัดขวาง · ภาพจำลอง ไม่ได้ย่อส่วนจริง</span>
          <div className="flex items-center gap-4 text-[12px] text-muted">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-5 rounded-sm bg-[#CDBB9E] ring-1 ring-stone-900/30" /> ดินเหนียว
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-[#D9772B]" /> Na⁺
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-[#2F5F9E]" /> Ca²⁺
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-[#7FA6CF]" /> น้ำ
            </span>
          </div>
        </div>
        <SoilStage state={state} />

        <AnimatePresence mode="wait">
          <motion.div
            key={state}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 grid grid-cols-12 gap-4"
          >
            <div className="col-span-12 md:col-span-7">
              <SourceTag kind="proposal" />
              <div className="mt-2 rounded-xl bg-white p-3.5 shadow-sm ring-1 ring-stone-900/10">
                <div className="th-label text-rust">ตัวแก้หลัก</div>
                <div className="mt-1 text-[17px] font-semibold leading-snug">{info.primary}</div>
              </div>
              <div className="ml-6 mt-2 rounded-xl border border-dashed border-stone-300 bg-white/60 p-3.5">
                <div className="th-label text-faint">ตัวเสริม</div>
                <div className="mt-1 text-[15px] text-muted">{info.support}</div>
              </div>
            </div>
            <div className="col-span-12 md:col-span-5">
              {kind === 'sodic' ? (
                <>
                  <div className="th-label text-faint">ปฏิกิริยาแลกเปลี่ยนไอออน</div>
                  <div className="mt-2 rounded-xl bg-white p-3.5 font-mono text-[12px] leading-relaxed text-ink ring-1 ring-stone-900/[0.07]">
                    <div>{SOIL_EQUATION.lhs}</div>
                    <div className="my-1 text-rust">→</div>
                    <div>{SOIL_EQUATION.rhs}</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="th-label text-faint">ข้อควรระวัง</div>
                  <p className="mt-2 rounded-xl bg-white p-3.5 text-[13.5px] leading-relaxed text-muted ring-1 ring-stone-900/[0.07]">
                    ถ้าออกมาเป็นดินโซดิก เปลือกหอยแก้เองไม่ได้ เพราะ CaCO₃ ละลายน้ำได้น้อยมาก ต้องใช้ยิปซัมเป็นตัวหลัก
                  </p>
                </>
              )}
              <div className="mt-3 text-[11.5px] leading-relaxed text-faint">
                เกณฑ์ทั่วไปของ US Salinity Laboratory: <span className="font-mono">{info.criteria}</span> ไม่ใช่ผลตรวจของพื้นที่นี้
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </Figure>
  );
}

/* =====================================================================
   SIM. 3.2 — backup plan & why lime must not be added
   ===================================================================== */

const PKA = 9.25;
const PH_MIN = 6;
const PH_MAX = 13;
const G = { x0: 56, x1: 500, y0: 250, y1: 30 };

const nh3Fraction = (ph: number) => 1 / (1 + 10 ** (PKA - ph));
const gx = (ph: number) => G.x0 + ((ph - PH_MIN) / (PH_MAX - PH_MIN)) * (G.x1 - G.x0);
const gy = (f: number) => G.y0 - f * (G.y0 - G.y1);

const CURVE = Array.from({ length: 141 }, (_, i) => {
  const ph = PH_MIN + (i / 140) * (PH_MAX - PH_MIN);
  return `${i ? 'L' : 'M'}${gx(ph).toFixed(1)} ${gy(nh3Fraction(ph)).toFixed(1)}`;
}).join(' ');

const PH_START = 7.5;
const PH_LIME = 12.4; // saturated Ca(OH)2
const PATH_KEYS = Array.from({ length: 16 }, (_, i) => PH_START + (i / 15) * (PH_LIME - PH_START));

function AmmoniaGraph({ play }: { play: number }) {
  return (
    <svg viewBox="0 0 520 300" className="h-auto w-full" role="img" aria-label="กราฟสัดส่วนแอมโมเนียในรูปก๊าซตาม pH">
      {/* near-neutral band */}
      <rect x={gx(6.5)} y={G.y1} width={gx(8) - gx(6.5)} height={G.y0 - G.y1} fill="#EEF0E6" />
      <text x={(gx(6.5) + gx(8)) / 2} y={G.y1 + 14} textAnchor="middle" fontSize="10" fill="#55603A">
        ใกล้เป็นกลาง
      </text>

      {/* grid + axes */}
      {[0, 0.25, 0.5, 0.75, 1].map((f) => (
        <g key={f}>
          <line x1={G.x0} x2={G.x1} y1={gy(f)} y2={gy(f)} stroke="#E5E3DC" />
          <text x={G.x0 - 8} y={gy(f)} textAnchor="end" dominantBaseline="central" fontSize="10" fontFamily="JetBrains Mono, monospace" fill="#8D9089">
            {f * 100}
          </text>
        </g>
      ))}
      {Array.from({ length: PH_MAX - PH_MIN + 1 }, (_, i) => PH_MIN + i).map((ph) => (
        <text key={ph} x={gx(ph)} y={G.y0 + 16} textAnchor="middle" fontSize="10" fontFamily="JetBrains Mono, monospace" fill="#8D9089">
          {ph}
        </text>
      ))}
      <line x1={G.x0} x2={G.x1} y1={G.y0} y2={G.y0} stroke="#141615" />
      <line x1={G.x0} x2={G.x0} y1={G.y0} y2={G.y1} stroke="#141615" />
      <text x={(G.x0 + G.x1) / 2} y={G.y0 + 36} textAnchor="middle" fontSize="11" fill="#5B5F59">
        pH ของกองหมัก
      </text>
      <text x={14} y={(G.y0 + G.y1) / 2} textAnchor="middle" fontSize="11" fill="#5B5F59" transform={`rotate(-90 14 ${(G.y0 + G.y1) / 2})`}>
        NH₃ ในรูปก๊าซ (%)
      </text>

      {/* pKa marker */}
      <line x1={gx(PKA)} x2={gx(PKA)} y1={G.y0} y2={G.y1} stroke="#C9C6BC" strokeDasharray="3 4" />
      <text x={gx(PKA) + 5} y={G.y0 - 8} fontSize="10" fontFamily="JetBrains Mono, monospace" fill="#8D9089">
        pKa ≈ 9.25
      </text>

      {/* lime marker */}
      <line x1={gx(PH_LIME)} x2={gx(PH_LIME)} y1={G.y0} y2={G.y1} stroke="#9A4A24" strokeDasharray="3 4" />
      <text x={gx(PH_LIME) - 5} y={G.y0 - 60} textAnchor="end" fontSize="10" fill="#9A4A24">
        Ca(OH)₂ อิ่มตัว ≈ pH 12.4
      </text>

      {/* curve */}
      <motion.path
        key={`curve-${play}`}
        d={CURVE}
        fill="none"
        stroke="#141615"
        strokeWidth={2}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, ease: EASE }}
      />

      {/* moving marker: pH pushed up by lime */}
      <motion.g
        key={`m-${play}`}
        initial={{ x: gx(PH_START), y: gy(nh3Fraction(PH_START)) }}
        animate={{
          x: PATH_KEYS.map((ph) => gx(ph)),
          y: PATH_KEYS.map((ph) => gy(nh3Fraction(ph))),
        }}
        transition={{ duration: 2.2, ease: 'easeInOut', delay: 1 }}
      >
        <circle r={7} fill="#9A4A24" stroke="#FFFFFF" strokeWidth={2} />
      </motion.g>

      {/* NH3 escaping */}
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.text
          key={`nh3-${play}-${i}`}
          x={gx(11.2) + i * 14}
          fontSize="10"
          fontFamily="JetBrains Mono, monospace"
          fill="#9A4A24"
          initial={{ y: G.y1 + 40, opacity: 0 }}
          animate={{ y: [G.y1 + 40, G.y1 - 10], opacity: [0, 1, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, delay: 3.2 + i * 0.35, ease: 'easeOut' }}
        >
          NH₃↑
        </motion.text>
      ))}
    </svg>
  );
}

function TeamPlanDiagram({ play }: { play: number }) {
  // ratio from the application: shrimp shell : dry material = 1 : 2 ; backup adds +30% dry material
  const unit = 120;
  return (
    <svg viewBox="0 0 520 300" className="h-auto w-full" role="img" aria-label="แผนสำรอง: หยุดเติมเปลือกสด และเติมวัสดุแห้งเพิ่ม 30%">
      <text x="20" y="34" fontSize="11" fill="#5B5F59">
        ส่วนผสมในคอกหมัก (สัดส่วนเดิมตามใบสมัคร 1 : 2)
      </text>

      {/* fresh shell input – stopped */}
      <text x="20" y="80" fontSize="13" fill="#141615">
        เปลือกกุ้งสด
      </text>
      <rect x="150" y="64" width={unit} height="24" fill="#E3B9A3" stroke="#141615" />
      <motion.g key={`stop-${play}`} initial={{ opacity: 0, scale: 1.4 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.4 }}>
        <line x1="290" y1="76" x2="350" y2="76" stroke="#141615" strokeWidth="1.5" markerEnd="url(#arrow-team)" />
        <line x1="306" y1="64" x2="334" y2="88" stroke="#9A4A24" strokeWidth="2.5" />
        <line x1="334" y1="64" x2="306" y2="88" stroke="#9A4A24" strokeWidth="2.5" />
        <rect x="362" y="64" width="128" height="24" fill="#F3E9E1" stroke="#9A4A24" />
        <text x="426" y="77" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#9A4A24">
          หยุดเติมเปลือกสด
        </text>
      </motion.g>

      {/* dry material grows +30% */}
      <text x="20" y="140" fontSize="13" fill="#141615">
        วัสดุแห้ง
      </text>
      <rect x="150" y="124" width={unit * 2} height="24" fill="#D9CDB4" stroke="#141615" />
      <motion.rect
        key={`grow-${play}`}
        x={150 + unit * 2}
        y="124"
        height="24"
        fill="#55603A"
        fillOpacity={0.85}
        stroke="#141615"
        initial={{ width: 0 }}
        animate={{ width: unit * 2 * 0.3 }}
        transition={{ duration: 1, ease: EASE, delay: 0.8 }}
      />
      <motion.text
        key={`lbl-${play}`}
        x={150 + unit * 2.6 + 10}
        y="137"
        dominantBaseline="central"
        fontSize="14"
        fontWeight="600"
        fill="#55603A"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
      >
        +30%
      </motion.text>
      <text x="150" y="166" fontSize="10" fill="#8D9089">
        แกลบ / ขุยมะพร้าว
      </text>

      {/* effect chain */}
      {['ซับน้ำส่วนเกิน', 'อากาศจากท่อ PVC ไหลผ่านได้', 'จุลินทรีย์ใช้อากาศกลับมาย่อย'].map((t, i) => (
        <motion.g
          key={`${t}-${play}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 1.8 + i * 0.25 }}
        >
          <rect x={20 + i * 168} y="212" width="150" height="44" fill="#FFFFFF" stroke="#55603A" />
          <text x={95 + i * 168} y="234" textAnchor="middle" dominantBaseline="central" fontSize="11.5" fill="#141615">
            {t}
          </text>
          {i < 2 ? <line x1={172 + i * 168} y1="234" x2={186 + i * 168} y2="234" stroke="#55603A" strokeWidth="1.5" markerEnd="url(#arrow-olive)" /> : null}
        </motion.g>
      ))}
      <text x="20" y="282" fontSize="10.5" fill="#8D9089">
        ไม่ต้องดัน pH ให้สูงขึ้น ไนโตรเจนจึงยังอยู่ในกองเป็นปุ๋ย
      </text>

      <defs>
        <marker id="arrow-team" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="#141615" />
        </marker>
        <marker id="arrow-olive" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="#55603A" />
        </marker>
      </defs>
    </svg>
  );
}

function LimeSim() {
  const [mode, setMode] = useState<'wrong' | 'team'>('wrong');
  const [play, setPlay] = useState(0);
  const pick = (m: 'wrong' | 'team') => {
    setMode(m);
    setPlay((p) => p + 1);
  };
  const wrong = mode === 'wrong';
  const panel = wrong ? LIME_WRONG : LIME_TEAM;

  return (
    <Figure
      code="SIM. 3.2"
      title="ถ้ากองหมักแฉะหรือเริ่มมีกลิ่น ทำอะไร และทำไมห้ามโรยปูนขาว"
      note="กดเทียบ 2 วิธี"
      bodyClassName="grid grid-cols-12 gap-2 p-2 pt-3"
    >
      <div className="col-span-12 p-4 lg:col-span-5">
        <div className="rounded-xl bg-rust-soft px-4 py-3 ring-1 ring-rust/15">
          <span className="th-label text-rust">สถานการณ์</span>
          <span className="mt-0.5 block text-[16px] font-semibold text-ink">{BACKUP_TRIGGER}</span>
        </div>

        <PillTabs
          className="mt-4"
          layoutId="lime-mode"
          value={mode}
          onChange={pick}
          items={[
            { id: 'wrong', label: 'ถ้าเผลอโรยปูนขาว' },
            { id: 'team', label: 'แผนสำรองของทีม' },
          ]}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <h3 className={cx('mt-6 text-[1.25rem] font-semibold', wrong ? 'text-rust' : 'text-olive')}>{panel.title}</h3>

            {wrong ? (
              <div className="mt-3 space-y-2">
                {LIME_WRONG.equations.map((eq) => (
                  <div key={eq.lhs} className={cx(INSET, 'px-4 py-3')}>
                    <div className="font-mono text-[15px] text-ink">
                      {eq.lhs} <span className="mx-1 text-rust">→</span> {eq.rhs}
                    </div>
                    <div className="mt-1 text-[13px] text-muted">{eq.note}</div>
                  </div>
                ))}
              </div>
            ) : (
              <ol className="mt-3 space-y-2">
                {LIME_TEAM.actions.map((a, i) => (
                  <li key={a} className="flex items-center gap-3 rounded-xl bg-[#EEF0E6] px-4 py-3 ring-1 ring-olive/15">
                    <span className="font-mono text-[12px] text-olive">{String(i + 1).padStart(2, '0')}</span>
                    <span className="text-[16px] font-semibold">{a}</span>
                  </li>
                ))}
              </ol>
            )}

            <div className="mt-6">
              <SourceTag kind="science" />
            </div>
            <ul className="mt-3 space-y-2.5">
              {panel.science.map((s) => (
                <li key={s} className="flex gap-3 text-[14.5px] leading-relaxed text-muted">
                  <span className="mt-[10px] h-1 w-1 shrink-0 rounded-full bg-stone-400" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className={cx(INSET, 'col-span-12 flex flex-col p-5 lg:col-span-7')}>
        <div className="flex items-center justify-between">
          <span className="text-[12.5px] text-faint">{wrong ? 'สมดุล NH₄⁺ ⇌ NH₃ ตาม pH' : 'ปรับส่วนผสมในคอก'}</span>
          <button type="button" onClick={() => setPlay((p) => p + 1)} className={BTN_GHOST}>
            เล่นอีกครั้ง
          </button>
        </div>
        <div className="mt-3 flex-1">
          {wrong ? <AmmoniaGraph play={play} /> : <TeamPlanDiagram play={play} />}
        </div>
        <p className="mt-2 text-[11.5px] leading-relaxed text-faint">
          {wrong
            ? 'คำนวณจากสมดุลกรด-เบสของแอมโมเนียม (pKa ≈ 9.25 ที่ 25°C) เป็นกราฟหลักการ ไม่ใช่ผลการทดลอง'
            : 'สัดส่วน 1 : 2 และ +30% มาจากใบสมัคร ความยาวแท่งวาดเพื่อเทียบให้เห็นภาพเท่านั้น'}
        </p>
      </div>
    </Figure>
  );
}

/* =====================================================================
   FIG. 3.3 — constraints
   ===================================================================== */

function ConstraintGrid() {
  return (
    <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
      {CONSTRAINTS.map((c, i) => (
        <Reveal key={c.code} delay={0.08 * i} className="h-full">
          <Figure code={`FIG. 3.3-${c.code}`} title={c.topic} className="h-full">
            <div className="text-[1.3rem] font-semibold leading-snug">{c.headline}</div>
            <ul className="mt-4 space-y-2">
              {c.points.map((p) => (
                <li key={p} className="flex gap-3 text-[15px] leading-relaxed text-muted">
                  <span className="mt-[10px] h-1.5 w-1.5 shrink-0 rounded-full bg-rust" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
            <ConstraintVisual c={c} />
          </Figure>
        </Reveal>
      ))}
    </div>
  );
}

function ConstraintVisual({ c }: { c: Constraint }) {
  if (c.code === 'L2') {
    return (
      <div className="mt-5 pt-1">
        <div className="th-label text-faint">ตารางเวรเก็บเปลือก</div>
        <div className="mt-2 grid grid-cols-7 gap-1">
          {SCHEDULE.map((d) => (
            <div
              key={d.day}
              className={cx(
                'flex min-h-[64px] flex-col items-center justify-start rounded-lg px-1 py-2 text-center',
                d.on ? 'bg-rust-soft ring-1 ring-rust/15' : 'bg-stone-50',
              )}
            >
              <span className={cx('text-[13px] font-semibold', d.on ? 'text-rust' : 'text-faint')}>{d.day}</span>
              {d.on ? <span className="mt-1 text-[10.5px] leading-tight text-ink">{d.slot}</span> : null}
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-between text-[12px] text-muted">
          <span>4 รอบต่อสัปดาห์</span>
          <span className="text-rust">ค้างไม่เกิน 48 ชม.</span>
        </div>
      </div>
    );
  }
  if (c.code === 'L3') {
    return (
      <div className="mt-5 pt-1">
        <div className="th-label text-faint">ก่อนใช้วัสดุทุกครั้ง</div>
        <div className="mt-2 flex items-stretch gap-1.5 text-center text-[13px]">
          <div className="flex-1 rounded-lg bg-stone-50 px-2 py-2.5">ขุยมะพร้าว / แกลบ</div>
          <span className="self-center text-stone-300">→</span>
          <div className="flex-1 rounded-lg bg-rust-soft px-2 py-2.5 font-semibold text-rust ring-1 ring-rust/20">วัด EC</div>
          <span className="self-center text-stone-300">→</span>
          <div className="flex-1 rounded-lg bg-stone-50 px-2 py-2.5">ผสมลงคอก</div>
        </div>
      </div>
    );
  }
  return (
    <div className="mt-5 pt-1">
      <div className="th-label text-faint">เงินกับของมาจากไหน</div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-[13px]">
        <div className="rounded-lg bg-stone-50 px-3 py-2.5">
          <span className="block text-[11.5px] text-faint">งบ</span>
          งบนวัตกรรมชุมชน อบต.
        </div>
        <div className="rounded-lg bg-stone-50 px-3 py-2.5">
          <span className="block text-[11.5px] text-faint">อะไหล่</span>
          ร้านวัสดุก่อสร้างในตำบล
        </div>
      </div>
    </div>
  );
}

/* =====================================================================
   FIG. 3.4 — reducing conflict: vendor vs farmer
   ===================================================================== */

type Side = 'vendor' | 'farmer' | null;

function ConflictPanel() {
  const [focus, setFocus] = useState<Side>(null);

  return (
    <Figure code="FIG. 3.4" title="แม่ค้ากับเกษตรกรได้อะไรกันคนละฝั่ง" note="ชี้ที่แม่ค้าหรือเกษตรกร" bodyClassName="px-6 pb-6 pt-2">
      <ExchangeDiagram focus={focus} setFocus={setFocus} />

      {/* safeguards */}
      <div className="mt-6 grid grid-cols-12 gap-5 border-t border-stone-900/[0.06] pt-5">
        <div className="col-span-12 lg:col-span-5">
          <div className="th-label text-faint">กันไม่ให้ชาวบ้านเดือดร้อน</div>
          <DistanceDiagram />
        </div>
        <ol className="col-span-12 grid gap-3 sm:grid-cols-3 lg:col-span-7">
          {CONFLICT.safeguards.map((s, i) => (
            <li
              key={s}
              className={cx(
                'flex flex-col rounded-xl p-4',
                i === 2 ? 'bg-rust-soft ring-1 ring-rust/20' : 'bg-stone-50 ring-1 ring-stone-900/[0.05]',
              )}
            >
              <span className={cx('font-mono text-[12px]', i === 2 ? 'text-rust' : 'text-faint')}>{String(i + 1).padStart(2, '0')}</span>
              <span className={cx('mt-2 text-[15px] leading-relaxed', i === 2 ? 'font-semibold text-ink' : 'text-ink')}>{s}</span>
              {i === 2 ? (
                <span className="mt-auto pt-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-rust px-3 py-1 text-[12px] font-semibold text-white">
                    <span className="h-2 w-2 rounded-[2px] bg-white" />
                    หยุดได้ทันที
                  </span>
                </span>
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </Figure>
  );
}

/** One drawing instead of mirrored cards: each flow is labelled once, on its own arrow. */
function ExchangeDiagram({ focus, setFocus }: { focus: Side; setFocus: (s: Side) => void }) {
  const flows: Array<{ side: 'vendor' | 'farmer'; d: string; lx: number; ly: number; text: string; sub?: string }> = [
    { side: 'vendor', d: 'M214 112 C 290 58, 340 58, 400 104', lx: 306, ly: 52, text: CONFLICT.vendor.gives, sub: CONFLICT.vendor.note },
    { side: 'vendor', d: 'M400 176 C 340 228, 290 228, 214 182', lx: 306, ly: 250, text: CONFLICT.vendor.gets },
    { side: 'farmer', d: 'M748 112 C 672 58, 622 58, 562 104', lx: 656, ly: 52, text: CONFLICT.farmer.gives },
    { side: 'farmer', d: 'M562 176 C 622 228, 672 228, 748 182', lx: 656, ly: 250, text: CONFLICT.farmer.gets },
  ];

  const party = (side: 'vendor' | 'farmer') => ({
    onMouseEnter: () => setFocus(side),
    onMouseLeave: () => setFocus(null),
    style: { cursor: 'pointer', transition: 'opacity .3s', opacity: focus && focus !== side ? 0.35 : 1 },
  });

  return (
    <svg viewBox="0 0 962 290" className="h-auto w-full" role="img" aria-label="แม่ค้าแยกถังให้คอกหมัก ได้หน้าร้านสะอาด เกษตรกรลงแรงดูแลคอก ได้ปุ๋ย">
      <defs>
        {['ink', 'rust'].map((k) => (
          <marker key={k} id={`xa-${k}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 1 L9 5 L0 9" fill="none" stroke={k === 'rust' ? '#9A4A24' : '#8D9089'} strokeWidth="1.6" />
          </marker>
        ))}
      </defs>

      {/* ground */}
      <line x1="20" y1="190" x2="942" y2="190" stroke="#D9D5CB" />

      {/* vendor: shop front + two lidded bins */}
      <g {...party('vendor')}>
        <rect x="58" y="98" width="148" height="92" fill="#FFFFFF" stroke="#141615" strokeWidth="1.2" />
        <path d="M50 98 L214 98 L202 72 L62 72 Z" fill="#F3E9E1" stroke="#141615" strokeWidth="1.2" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <line key={i} x1={78 + i * 22} y1="72" x2={74 + i * 22} y2="98" stroke="#9A4A24" strokeOpacity="0.35" />
        ))}
        <rect x="76" y="150" width="30" height="40" rx="3" fill="#ECEAE4" stroke="#141615" />
        <rect x="112" y="150" width="30" height="40" rx="3" fill="#ECEAE4" stroke="#141615" />
        <rect x="73" y="145" width="36" height="6" rx="2" fill="#2E2F2C" />
        <rect x="109" y="145" width="36" height="6" rx="2" fill="#2E2F2C" />
        <text x="132" y="224" textAnchor="middle" fontSize="18" fontWeight="600" fill="#141615">
          แม่ค้า
        </text>
      </g>

      {/* compost pen */}
      <g>
        <path d="M414 190 V122 H548 V190" fill="none" stroke="#141615" strokeWidth="1.2" />
        <path d="M402 122 L481 94 L560 122" fill="none" stroke="#141615" strokeWidth="1.2" />
        <path d="M426 190 C 440 150, 520 150, 536 190 Z" fill="#D9CDB4" stroke="#141615" />
        <line x1="452" y1="190" x2="452" y2="142" stroke="#8D9089" strokeDasharray="2 3" />
        <line x1="510" y1="190" x2="510" y2="142" stroke="#8D9089" strokeDasharray="2 3" />
        <text x="481" y="224" textAnchor="middle" fontSize="16" fontWeight="600" fill="#141615">
          คอกหมักของชุมชน
        </text>
      </g>

      {/* farmer: raised bed with seedlings */}
      <g {...party('farmer')}>
        <path d="M758 190 L780 160 L882 160 L904 190 Z" fill="#8C735C" stroke="#141615" strokeWidth="1.2" />
        {[798, 831, 864].map((x) => (
          <g key={x}>
            <line x1={x} y1="160" x2={x} y2="128" stroke="#55603A" strokeWidth="1.6" />
            <ellipse cx={x - 7} cy="136" rx="8" ry="4" fill="#7C8A55" transform={`rotate(-25 ${x - 7} 136)`} />
            <ellipse cx={x + 7} cy="128" rx="8" ry="4" fill="#7C8A55" transform={`rotate(25 ${x + 7} 128)`} />
          </g>
        ))}
        <text x="831" y="224" textAnchor="middle" fontSize="18" fontWeight="600" fill="#141615">
          เกษตรกร
        </text>
      </g>

      {/* flows */}
      {flows.map((f) => {
        const lit = focus === f.side;
        const dim = focus !== null && !lit;
        return (
          <g key={f.d} style={{ transition: 'opacity .3s' }} opacity={dim ? 0.2 : 1}>
            <motion.path
              d={f.d}
              fill="none"
              stroke={lit ? '#9A4A24' : '#8D9089'}
              strokeWidth={lit ? 1.8 : 1.3}
              strokeDasharray="5 6"
              markerEnd={`url(#xa-${lit ? 'rust' : 'ink'})`}
              animate={{ strokeDashoffset: ['0', '-22'] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            />
            <text x={f.lx} y={f.ly} textAnchor="middle" fontSize="15" fontWeight="500" fill={lit ? '#9A4A24' : '#141615'}>
              {f.text}
            </text>
            {f.sub ? (
              <text x={f.lx} y={f.ly + 18} textAnchor="middle" fontSize="12.5" fill="#8D9089">
                {f.sub}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

function DistanceDiagram() {
  return (
    <svg viewBox="0 0 360 120" className="mt-3 h-auto w-full" role="img" aria-label="จุดหมักห่างบ้านอย่างน้อย 50 เมตร">
      {/* house */}
      <path d="M30 88 V58 L58 36 L86 58 V88 Z" fill="#FFFFFF" stroke="#141615" strokeWidth="1.25" />
      <rect x="50" y="68" width="16" height="20" fill="#FAF9F5" stroke="#141615" />
      <text x="58" y="106" textAnchor="middle" fontSize="11" fill="#5B5F59">
        บ้าน
      </text>
      {/* pen */}
      <path d="M262 88 V60 H330 V88" fill="none" stroke="#141615" strokeWidth="1.25" />
      <path d="M254 60 L296 44 L338 60" fill="none" stroke="#141615" strokeWidth="1.25" />
      <rect x="270" y="70" width="52" height="18" fill="#D9CDB4" stroke="#141615" />
      <text x="296" y="106" textAnchor="middle" fontSize="11" fill="#5B5F59">
        จุดหมัก
      </text>
      {/* ground */}
      <line x1="10" y1="88" x2="350" y2="88" stroke="#141615" />
      {/* dimension line */}
      <line x1="86" y1="20" x2="86" y2="32" stroke="#9A4A24" />
      <line x1="262" y1="20" x2="262" y2="32" stroke="#9A4A24" />
      <motion.line
        x1="86"
        y1="26"
        x2="262"
        y2="26"
        stroke="#9A4A24"
        strokeWidth="1.5"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: EASE }}
      />
      <rect x="138" y="16" width="72" height="20" fill="#FAF9F5" />
      <text x="174" y="27" textAnchor="middle" dominantBaseline="central" fontSize="13" fontWeight="600" fill="#9A4A24">
        ≥ 50 ม.
      </text>
    </svg>
  );
}
