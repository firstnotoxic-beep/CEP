import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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

type SoilState = 'saline' | 'sodic' | 'gypsum';

type Pose = { x: number; y: number; r: number };

const PLATELETS = 18;

// sodic: platelets dispersed evenly and clogging the pore space
const DISPERSED: Pose[] = Array.from({ length: PLATELETS }, (_, i) => {
  const col = i % 6;
  const row = Math.floor(i / 6);
  return {
    x: 60 + col * 88 + (row % 2 ? 22 : 0),
    y: 95 + row * 78 + ((col * 7) % 5) * 3,
    r: ((i * 37) % 17) - 8,
  };
});

// saline / after gypsum: platelets flocculated into aggregates with open pores between
const CLUSTERS = [
  { x: 135, y: 125, r: -10 },
  { x: 410, y: 115, r: 8 },
  { x: 275, y: 235, r: -3 },
];
const AGGREGATED: Pose[] = Array.from({ length: PLATELETS }, (_, i) => {
  const c = CLUSTERS[i % 3];
  const k = Math.floor(i / 3);
  return { x: c.x + (k % 2 ? 7 : -7), y: c.y + (k - 2.5) * 13, r: c.r + (k % 2 ? 3 : -3) };
});

type IonKind = 'Na' | 'Ca';

function attachedIon(state: SoilState, i: number, side: 0 | 1): IonKind {
  if (state === 'gypsum') return 'Ca';
  if (state === 'sodic') return (i + side) % 5 === 0 ? 'Ca' : 'Na';
  return (i + side) % 7 === 0 ? 'Na' : 'Ca';
}

function Ion({ kind, size = 8 }: { kind: IonKind; size?: number }) {
  const na = kind === 'Na';
  return (
    <g>
      <circle r={size} fill={na ? '#F3E9E1' : '#EEF0E6'} stroke={na ? '#9A4A24' : '#55603A'} strokeWidth={1} />
      <text
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={size * 0.78}
        fontFamily="JetBrains Mono, monospace"
        fill={na ? '#9A4A24' : '#55603A'}
      >
        {na ? 'Na⁺' : 'Ca²⁺'}
      </text>
    </g>
  );
}

const WATER_X = [100, 225, 345, 470];

function SoilMicroscope({ state }: { state: SoilState }) {
  const poses = state === 'sodic' ? DISPERSED : AGGREGATED;
  const drains = state !== 'sodic';

  return (
    <svg viewBox="0 0 560 340" className="h-auto w-full" role="img" aria-label="ภาพจำลองอนุภาคดินระดับจุลภาค">
      <defs>
        <pattern id="soil-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="#E5E3DC" strokeWidth="1" />
        </pattern>
      </defs>

      {/* frame */}
      <rect x="20" y="40" width="520" height="262" fill="#FBFAF7" stroke="#141615" strokeWidth="1" />
      <line x1="20" y1="40" x2="540" y2="40" stroke="#141615" strokeWidth="2" />
      <text x="24" y="30" fontSize="11" fill="#5B5F59">ผิวดิน</text>
      <rect x="20" y="302" width="520" height="22" fill="url(#soil-hatch)" stroke="#C9C6BC" strokeWidth="1" />
      <text x="24" y="318" fontSize="10" fill="#8D9089">ชั้นดินล่าง / น้ำชะลงไป</text>

      {/* water infiltration */}
      {WATER_X.map((x, i) =>
        drains ? (
          <motion.line
            key={`w-${x}`}
            x1={x}
            y1={8}
            x2={x}
            y2={318}
            stroke="#2F5F9E"
            strokeOpacity={0.45}
            strokeWidth={1.5}
            strokeDasharray="6 6"
            initial={{ strokeDashoffset: '0' }}
            animate={{ strokeDashoffset: ['0', '-24'] }}
            transition={{ duration: 0.9, repeat: Infinity, ease: 'linear', delay: i * 0.1 }}
          />
        ) : (
          <g key={`w-${x}`}>
            <line x1={x} y1={8} x2={x} y2={46} stroke="#2F5F9E" strokeOpacity={0.55} strokeWidth={1.5} strokeDasharray="6 6" />
            <line x1={x - 9} y1={50} x2={x + 9} y2={50} stroke="#9A4A24" strokeWidth={2} />
            <text x={x + 12} y={22} fontSize="10" fill="#9A4A24">
              ×
            </text>
          </g>
        ),
      )}

      {/* gypsum at the surface */}
      <AnimatePresence>
        {state === 'gypsum' ? (
          <motion.g initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {Array.from({ length: 14 }, (_, i) => (
              <rect key={i} x={40 + i * 36 + (i % 3) * 4} y={33 + (i % 2) * 2} width={8} height={5} fill="#FFFFFF" stroke="#141615" strokeWidth={0.75} />
            ))}
            <text x="536" y="30" fontSize="11" textAnchor="end" fill="#141615">
              ยิปซัม CaSO₄·2H₂O
            </text>
          </motion.g>
        ) : null}
      </AnimatePresence>

      {/* clay platelets with exchangeable cations */}
      {poses.map((p, i) => (
        <motion.g
          key={i}
          initial={false}
          animate={{ x: p.x, y: p.y, rotate: p.r }}
          transition={{ duration: 1.1, ease: EASE, delay: (i % 6) * 0.03 }}
        >
          <rect x={-26} y={-4.5} width={52} height={9} fill="#CDBB9E" stroke="#141615" strokeWidth={0.75} />
          {([0, 1] as const).map((side) => {
            const kind = attachedIon(state, i, side);
            return (
              <motion.g key={`${side}-${kind}`} initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4, delay: 0.5 }}>
                <g transform={`translate(${side ? 34 : -34} 0)`}>
                  <Ion kind={kind} size={7.5} />
                </g>
              </motion.g>
            );
          })}
        </motion.g>
      ))}

      {/* saline: dissolved salt floating in pore water */}
      {state === 'saline'
        ? [
            [250, 110],
            [300, 160],
            [200, 200],
            [470, 220],
            [90, 250],
            [380, 270],
          ].map(([x, y], i) => (
            <motion.g
              key={`salt-${i}`}
              initial={{ opacity: 0, x, y }}
              animate={{ opacity: 1, x, y: [y, y - 6, y] }}
              transition={{ y: { duration: 2.4, repeat: Infinity, delay: i * 0.3 }, opacity: { duration: 0.5 } }}
            >
              {i % 2 ? (
                <g>
                  <circle r={7} fill="#FFFFFF" stroke="#8D9089" />
                  <text textAnchor="middle" dominantBaseline="central" fontSize={5.5} fontFamily="JetBrains Mono, monospace" fill="#5B5F59">
                    Cl⁻
                  </text>
                </g>
              ) : (
                <Ion kind="Na" size={7} />
              )}
            </motion.g>
          ))
        : null}

      {/* gypsum: displaced Na+ leached downward */}
      {state === 'gypsum'
        ? [130, 270, 400, 210, 470].map((x, i) => (
            <motion.g
              key={`leach-${i}`}
              initial={{ x, y: 120, opacity: 0 }}
              animate={{ y: [120, 330], opacity: [0, 1, 1, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 0.8 + i * 0.6, ease: 'easeIn' }}
            >
              <Ion kind="Na" size={7} />
            </motion.g>
          ))
        : null}

      {/* status tag */}
      <g transform="translate(536 287)">
        <rect x={-150} y={-12} width={150} height={22} fill={drains ? '#EEF0E6' : '#F3E9E1'} stroke={drains ? '#55603A' : '#9A4A24'} />
        <text x={-75} y={0} textAnchor="middle" dominantBaseline="central" fontSize="11" fill={drains ? '#55603A' : '#9A4A24'}>
          {drains ? 'ช่องว่างเปิด · น้ำซึมผ่านได้' : 'อนุภาคกระจาย · น้ำซึมผ่านยาก'}
        </text>
      </g>
    </svg>
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

      {/* right: microscope view + remedy hierarchy */}
      <div className={cx(INSET, 'col-span-12 flex flex-col p-5 lg:col-span-7')}>
        <div className="flex items-center justify-between">
          <span className="text-[12.5px] text-faint">ภาพจำลองระดับอนุภาค</span>
          <div className="flex items-center gap-4 text-[12px] text-muted">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-5 rounded-sm bg-[#CDBB9E] ring-1 ring-stone-900/30" /> อนุภาคดินเหนียว
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full border border-rust bg-rust-soft" /> Na⁺
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full border border-olive bg-[#EEF0E6]" /> Ca²⁺
            </span>
          </div>
        </div>
        <div className="mt-3">
          <SoilMicroscope state={state} />
        </div>

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
    <Figure code="FIG. 3.4" title="แม่ค้ากับเกษตรกรได้อะไรกันคนละฝั่ง" note="ชี้ที่แต่ละฝ่าย" bodyClassName="px-6 pb-6 pt-4">
      <div className="grid grid-cols-12 items-stretch gap-4">
        <PartyCard side="vendor" focus={focus} setFocus={setFocus} />

        <div className="col-span-12 flex flex-col justify-center gap-3 md:col-span-4">
          <ExchangeRow label={CONFLICT.vendor.gives} dir="right" on={focus !== 'farmer'} dim={focus === 'farmer'} />
          <ExchangeRow label={CONFLICT.vendor.gets} dir="left" on={focus !== 'farmer'} dim={focus === 'farmer'} />
          <div className="my-1 rounded-xl bg-stone-800 px-4 py-3 text-center text-white shadow-md">
            <span className="text-[15px] font-semibold">คอกหมักของชุมชน</span>
          </div>
          <ExchangeRow label={CONFLICT.farmer.gives} dir="left" on={focus !== 'vendor'} dim={focus === 'vendor'} />
          <ExchangeRow label={CONFLICT.farmer.gets} dir="right" on={focus !== 'vendor'} dim={focus === 'vendor'} />
        </div>

        <PartyCard side="farmer" focus={focus} setFocus={setFocus} />
      </div>

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

function PartyCard({ side, focus, setFocus }: { side: 'vendor' | 'farmer'; focus: Side; setFocus: (s: Side) => void }) {
  const p = CONFLICT[side];
  const on = focus === side;
  return (
    <button
      type="button"
      onMouseEnter={() => setFocus(side)}
      onMouseLeave={() => setFocus(null)}
      onFocus={() => setFocus(side)}
      onBlur={() => setFocus(null)}
      className={cx(
        'col-span-12 rounded-xl p-5 text-left ring-1 transition-all duration-300 md:col-span-4',
        on ? 'bg-rust-soft ring-rust/25' : 'bg-stone-50 ring-stone-900/[0.05]',
        focus !== null && !on && 'opacity-40',
      )}
    >
      <span className="block text-[1.4rem] font-semibold">{p.who}</span>
      <dl className="mt-4 space-y-3 text-[15px]">
        <div>
          <dt className="th-label text-faint">ลงแรง</dt>
          <dd className="mt-0.5 font-medium">{p.gives}</dd>
        </div>
        <div>
          <dt className="th-label text-faint">ได้รับ</dt>
          <dd className="mt-0.5 font-medium">{p.gets}</dd>
        </div>
        <div className="border-t border-stone-900/[0.06] pt-3 text-muted">{p.note}</div>
      </dl>
    </button>
  );
}

function ExchangeRow({ label, dir, on, dim }: { label: string; dir: 'left' | 'right'; on: boolean; dim: boolean }) {
  return (
    <div className={cx('flex items-center gap-2 transition-opacity duration-300', dim && 'opacity-30')}>
      {dir === 'left' ? <span className={cx('text-lg leading-none', on ? 'text-rust' : 'text-faint')}>←</span> : null}
      <span className="h-px flex-1 bg-rule-strong" />
      <span className="text-[14px] font-medium text-ink">{label}</span>
      <span className="h-px flex-1 bg-rule-strong" />
      {dir === 'right' ? <span className={cx('text-lg leading-none', on ? 'text-rust' : 'text-faint')}>→</span> : null}
    </div>
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
