import { useEffect, useLayoutEffect, useMemo, useRef, type ReactNode } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Edges, Grid, Html, OrbitControls } from '@react-three/drei';

/* =====================================================================
   Procedural engineering cutaways for Section 2
   FIG. 2.1  ถังพักหน้าร้าน (แยก 2 ถัง ฝาปิดสนิท + แกลบดำ)
   FIG. 2.2  คอกหมักเปลือกกุ้ง + ท่อ PVC เจาะรู (0 W)
   FIG. 2.3  โคกยกสูงผสมเปลือกหอย + ชั้นคลุมดิน + ถังหมักกากน้ำตาล
   ===================================================================== */

export type ModelId = 0 | 1 | 2;

type Vec3 = [number, number, number];

const INK = '#141615';

const C = {
  bin: '#ECEAE4',
  shrimp: '#C99580',
  shrimpChip: '#B97B63',
  shell: '#DED7C8',
  shellChip: '#F3EFE6',
  charcoal: '#2E2F2C',
  charcoalGrain: '#1B1C1A',
  dry: '#CDB384',
  dryGrain: '#A88A57',
  pvc: '#FBFBF8',
  hole: '#3A3C39',
  post: '#B9A688',
  tarp: '#E6E2D7',
  soil: '#6F5A48',
  bed: '#8C735C',
  mulch: '#E3DDCF',
  liquid: '#9A6A36',
  o2: '#2F5F9E',
  heat: '#D47A26',
  odor: '#7E817A',
  salt: '#F8F7F3',
  bubble: '#E9C891',
};

/* ---------- helpers ---------- */

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shade(hex: string, k: number): string {
  return '#' + new THREE.Color(hex).multiplyScalar(k).getHexString();
}

// Cylinders keep 3/4 of their volume; the quarter facing the camera is removed.
const T0 = Math.PI / 2;
const TL = Math.PI * 1.5;

type Spot = { p: Vec3; r: Vec3; s: number };

function wedgeSpots(seed: number, count: number, radius: number, height: number, size: number): Spot[] {
  const r = rng(seed);
  const out: Spot[] = [];
  for (let i = 0; i < count; i++) {
    const face = r();
    const rr = 0.04 + r() * (radius - 0.08);
    let p: Vec3;
    if (face < 0.4) p = [rr, r() * height, 0.012];
    else if (face < 0.8) p = [0.012, r() * height, rr];
    else {
      const th = T0 + r() * TL;
      p = [Math.sin(th) * rr, height + 0.006, Math.cos(th) * rr];
    }
    out.push({ p, r: [r() * Math.PI, r() * Math.PI, r() * Math.PI], s: size * (0.6 + r() * 0.8) });
  }
  return out;
}

function rectSpots(seed: number, count: number, w: number, h: number, size: number, z = 0.012): Spot[] {
  const r = rng(seed);
  return Array.from({ length: count }, () => ({
    p: [(r() - 0.5) * (w - 0.06), 0.02 + r() * (h - 0.04), z] as Vec3,
    r: [r() * Math.PI, r() * Math.PI, r() * Math.PI] as Vec3,
    s: size * (0.6 + r() * 0.8),
  }));
}

function trapezoidSpots(seed: number, count: number, bw: number, tw: number, h: number, size: number): Spot[] {
  const r = rng(seed);
  return Array.from({ length: count }, () => {
    const y = 0.03 + r() * (h - 0.06);
    const half = bw / 2 - ((bw - tw) / 2) * (y / h) - 0.04;
    return {
      p: [(r() * 2 - 1) * half, y, 0.012] as Vec3,
      r: [r() * Math.PI, r() * Math.PI, r() * Math.PI] as Vec3,
      s: size * (0.6 + r() * 0.8),
    };
  });
}

/* ---------- primitives ---------- */

function Mat({ color, opacity }: { color: string; opacity?: number }) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={0.85}
      metalness={0}
      side={THREE.DoubleSide}
      transparent={opacity !== undefined}
      opacity={opacity ?? 1}
    />
  );
}

type WedgeProps = { radius: number; height: number; color: string; open?: boolean; opacity?: number };

/** Cylinder with a quarter removed, cut faces closed and outlined like a textbook section. */
function Wedge({ radius, height, color, open = false, opacity }: WedgeProps) {
  const cut = useMemo(() => shade(color, 0.86), [color]);
  return (
    <group position={[0, height / 2, 0]}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius, height, 56, 1, open, T0, TL]} />
        <Mat color={color} opacity={opacity} />
        <Edges color={INK} threshold={20} />
      </mesh>
      {!open &&
        [T0, T0 + TL].map((th) => (
          <mesh
            key={th}
            position={[(Math.sin(th) * radius) / 2, 0, (Math.cos(th) * radius) / 2]}
            rotation={[0, th - Math.PI / 2, 0]}
            receiveShadow
          >
            <planeGeometry args={[radius, height]} />
            <Mat color={cut} opacity={opacity} />
            <Edges color={INK} threshold={20} />
          </mesh>
        ))}
    </group>
  );
}

function Block({ size, position, color, opacity }: { size: Vec3; position: Vec3; color: string; opacity?: number }) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <Mat color={color} opacity={opacity} />
      <Edges color={INK} threshold={20} />
    </mesh>
  );
}

function Chips({ spots, color, kind }: { spots: Spot[]; color: string; kind: 'flake' | 'grain' | 'husk' }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const o = new THREE.Object3D();
    spots.forEach((sp, i) => {
      o.position.set(sp.p[0], sp.p[1], sp.p[2]);
      o.rotation.set(sp.r[0], sp.r[1], sp.r[2]);
      o.scale.setScalar(sp.s);
      o.updateMatrix();
      mesh.setMatrixAt(i, o.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [spots]);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, spots.length]} frustumCulled={false} castShadow>
      {kind === 'flake' ? <boxGeometry args={[1, 0.2, 0.75]} /> : null}
      {kind === 'grain' ? <dodecahedronGeometry args={[0.5, 0]} /> : null}
      {kind === 'husk' ? <boxGeometry args={[1, 0.28, 0.35]} /> : null}
      <meshStandardMaterial color={color} roughness={0.7} />
    </instancedMesh>
  );
}

/** Group that slides apart when "Explode Layers" is on. */
function Layer({ base, lift, exploded, children }: { base: Vec3; lift: Vec3; exploded: boolean; children: ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_state, dt) => {
    const g = ref.current;
    if (!g) return;
    const k = 1 - Math.exp(-dt * 6);
    const f = exploded ? 1 : 0;
    g.position.x += (base[0] + lift[0] * f - g.position.x) * k;
    g.position.y += (base[1] + lift[1] * f - g.position.y) * k;
    g.position.z += (base[2] + lift[2] * f - g.position.z) * k;
  });
  return (
    <group ref={ref} position={base}>
      {children}
    </group>
  );
}

type ParticleFn = (i: number, t: number, out: THREE.Vector3) => number;

function Particles({ count, color, size, speed, fn, visible }: {
  count: number;
  color: string;
  size: number;
  speed: number;
  fn: ParticleFn;
  visible: boolean;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const tmp = useMemo(() => ({ o: new THREE.Object3D(), v: new THREE.Vector3() }), []);
  useFrame(({ clock }) => {
    const mesh = ref.current;
    if (!mesh || !visible) return;
    const time = clock.elapsedTime * speed;
    for (let i = 0; i < count; i++) {
      const t = (time + ((i * 0.61803) % 1)) % 1;
      const s = Math.max(0, fn(i, t, tmp.v));
      tmp.o.position.copy(tmp.v);
      tmp.o.scale.setScalar(size * s);
      tmp.o.updateMatrix();
      mesh.setMatrixAt(i, tmp.o.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} frustumCulled={false} visible={visible}>
      <sphereGeometry args={[1, 10, 8]} />
      <meshBasicMaterial color={color} />
    </instancedMesh>
  );
}

/* ---------- research-style callout ---------- */

// Minimum gap between a callout box and the canvas edge.
const EDGE_PX = 8;

function Callout({ position, code, text, left = false }: { position: Vec3; code: string; text: string; left?: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const boxRef = useRef<HTMLSpanElement>(null);
  const v = useMemo(() => new THREE.Vector3(), []);

  // Keep the label box inside the canvas: if it would cross the edge, slide it inward
  // (over the model) while the marker stays on the anchor point.
  useFrame(({ camera, size }) => {
    const g = groupRef.current;
    const box = boxRef.current;
    if (!g || !box) return;
    v.setFromMatrixPosition(g.matrixWorld).project(camera);
    const px = ((v.x + 1) / 2) * size.width;
    const w = box.offsetWidth;
    const lead = (box.parentElement?.offsetWidth ?? w) - w; // marker + leader line between anchor and box
    let shift = 0;
    if (left) {
      const boxLeft = px + 5 - lead - w;
      shift = Math.max(0, EDGE_PX - boxLeft);
    } else {
      const boxRight = px - 5 + lead + w;
      shift = -Math.max(0, boxRight - (size.width - EDGE_PX));
    }
    const next = shift ? `translateX(${shift.toFixed(1)}px)` : '';
    if (box.style.transform !== next) box.style.transform = next;
  });

  return (
    <group ref={groupRef} position={position}>
    <Html zIndexRange={[30, 0]} style={{ pointerEvents: 'none' }}>
      <div
        className="flex items-center"
        style={{
          transform: left ? 'translate(calc(-100% + 5px), -50%)' : 'translate(-5px, -50%)',
          flexDirection: left ? 'row-reverse' : 'row',
        }}
      >
        <span className="block h-2.5 w-2.5 shrink-0 rounded-full border-2 border-white bg-stone-900 shadow-sm" />
        <span className="block h-px w-7 shrink-0 bg-stone-900/50" />
        <span
          ref={boxRef}
          className="flex items-baseline gap-2 whitespace-nowrap rounded-lg bg-white/95 px-2.5 py-1 shadow-[0_4px_14px_-6px_rgba(20,22,21,0.25)] ring-1 ring-stone-900/10"
        >
          <span className="font-mono text-[10px] font-semibold tracking-[0.12em] text-rust">{code}</span>
          <span className="text-[12px] leading-tight text-ink">{text}</span>
        </span>
      </div>
    </Html>
    </group>
  );
}

/* =====================================================================
   FIG. 2.1 — ถังพักหน้าร้าน
   ===================================================================== */

const BIN_R = 0.6;
const BIN_H = 1.2;
const FILL_H = 0.74;
const CHAR_H = 0.16;

function SourceBin({ x, kind, exploded, seed }: { x: number; kind: 'shrimp' | 'shell'; exploded: boolean; seed: number }) {
  const fill = kind === 'shrimp' ? C.shrimp : C.shell;
  const chip = kind === 'shrimp' ? C.shrimpChip : C.shellChip;
  const fillSpots = useMemo(() => wedgeSpots(seed, 150, BIN_R - 0.03, FILL_H, 0.07), [seed]);
  const charSpots = useMemo(() => wedgeSpots(seed + 7, 160, BIN_R - 0.03, CHAR_H, 0.035), [seed]);

  return (
    <group position={[x, 0, 0]}>
      {/* bin wall + base */}
      <Wedge radius={BIN_R} height={BIN_H} color={C.bin} open />
      <Wedge radius={BIN_R} height={0.03} color={C.bin} />

      {/* shells */}
      <Layer base={[0, 0.03, 0]} lift={[0, 0, 0]} exploded={exploded}>
        <Wedge radius={BIN_R - 0.03} height={FILL_H} color={fill} />
        <Chips spots={fillSpots} color={chip} kind="flake" />
      </Layer>

      {/* rice-husk charcoal cap layer */}
      <Layer base={[0, 0.03 + FILL_H, 0]} lift={[0, 0.45, 0]} exploded={exploded}>
        <Wedge radius={BIN_R - 0.03} height={CHAR_H} color={C.charcoal} />
        <Chips spots={charSpots} color={C.charcoalGrain} kind="grain" />
      </Layer>

      {/* sealed lid */}
      <Layer base={[0, BIN_H, 0]} lift={[0, 0.9, 0]} exploded={exploded}>
        <Wedge radius={BIN_R + 0.04} height={0.07} color={C.bin} />
        <group position={[0, 0.07, 0]}>
          <Wedge radius={0.12} height={0.05} color={C.bin} />
        </group>
      </Layer>
    </group>
  );
}

function ModelSourceBins({ exploded }: { exploded: boolean }) {
  const odor = useMemo<ParticleFn>(() => {
    const r = rng(3);
    const P = Array.from({ length: 70 }, () => ({
      cx: r() < 0.5 ? -0.85 : 0.85,
      rr: 0.08 + r() * 0.42,
      y0: 0.1 + r() * 0.4,
    }));
    const top = 0.03 + FILL_H + CHAR_H * 0.55;
    return (i, t, v) => {
      const p = P[i];
      v.set(p.cx + p.rr + Math.sin(t * 9 + i) * 0.015, p.y0 + (top - p.y0) * t, 0.04);
      return t < 0.75 ? Math.min(1, t * 6) : (1 - t) / 0.25;
    };
  }, []);

  return (
    <group>
      <SourceBin x={-0.85} kind="shrimp" exploded={exploded} seed={21} />
      <SourceBin x={0.85} kind="shell" exploded={exploded} seed={42} />
      <Particles count={70} color={C.odor} size={0.022} speed={0.22} fn={odor} visible={!exploded} />

      <Callout position={[-1.45, BIN_H + 0.45, 0]} code="2.1-A" text="ถังเปลือกกุ้ง" left />
      <Callout position={[1.45, BIN_H + 0.45, 0]} code="2.1-B" text="ถังเปลือกหอย" />
      <Callout
        position={[1.45, exploded ? BIN_H + 1.0 : BIN_H + 0.05, 0]}
        code="2.1-C"
        text="ฝาปิดสนิท"
      />
      <Callout
        position={[1.45, exploded ? 0.03 + FILL_H + 0.53 : 0.03 + FILL_H + 0.08, 0]}
        code="2.1-D"
        text="แกลบดำโรยทับหน้า: ดูดน้ำและกลิ่น"
      />
      <Callout position={[-1.45, 0.4, 0]} code="2.1-E" text="เปลือกที่แยกไว้ตั้งแต่ต้นทาง" left />
    </group>
  );
}

/* =====================================================================
   FIG. 2.2 — คอกหมักเปลือกกุ้ง + ท่อ PVC เจาะรู
   ===================================================================== */

const PEN_W = 2.5;
const PEN_D = 1.25;
const STRATA: Array<{ kind: 'dry' | 'shrimp'; h: number }> = [
  { kind: 'dry', h: 0.24 },
  { kind: 'shrimp', h: 0.12 },
  { kind: 'dry', h: 0.24 },
  { kind: 'shrimp', h: 0.12 },
  { kind: 'dry', h: 0.24 },
  { kind: 'shrimp', h: 0.12 },
];
const PILE_TOP = STRATA.reduce((a, s) => a + s.h, 0);
const PIPE_Y = 0.12;
const PIPE_R = 0.055;
const RISERS = [-0.62, 0.62];
const ROOF_Y = 1.95;

function Pipe({ from, to }: { from: Vec3; to: Vec3 }) {
  const { pos, quat, len } = useMemo(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const dir = b.clone().sub(a);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    return { pos: a.add(b).multiplyScalar(0.5), quat: q, len: dir.length() };
  }, [from, to]);
  return (
    <mesh position={pos} quaternion={quat} castShadow>
      <cylinderGeometry args={[PIPE_R, PIPE_R, len, 28, 1, true]} />
      <meshStandardMaterial color={C.pvc} roughness={0.35} side={THREE.DoubleSide} />
      <Edges color={INK} threshold={20} />
    </mesh>
  );
}

function Holes({ points }: { points: Vec3[] }) {
  return (
    <>
      {points.map((p) => (
        <mesh key={p.join(',')} position={p}>
          <circleGeometry args={[0.017, 14]} />
          <meshBasicMaterial color={C.hole} />
        </mesh>
      ))}
    </>
  );
}

function ModelCompostPen({ exploded }: { exploded: boolean }) {
  let y = 0;
  const strata = STRATA.map((s, i) => {
    const item = { ...s, y, i };
    y += s.h;
    return item;
  });

  const spots = useMemo(
    () =>
      STRATA.map((s, i) =>
        s.kind === 'dry'
          ? rectSpots(100 + i, 90, PEN_W, s.h, 0.045)
          : rectSpots(100 + i, 70, PEN_W, s.h, 0.06),
      ),
    [],
  );

  const baseHoles = useMemo<Vec3[]>(
    () => Array.from({ length: 11 }, (_, i) => [-1.1 + i * 0.22, PIPE_Y, PIPE_R + 0.002]),
    [],
  );
  const riserHoles = useMemo<Vec3[]>(
    () => RISERS.flatMap((x) => Array.from({ length: 6 }, (_, i) => [x, 0.3 + i * 0.14, PIPE_R + 0.002] as Vec3)),
    [],
  );

  const o2 = useMemo<ParticleFn>(() => {
    const r = rng(11);
    const P = Array.from({ length: 140 }, () => ({
      side: r() < 0.5 ? -1 : 1,
      hole: (r() * 2 - 1) * 1.05,
      ty: 0.28 + r() * 0.72,
      dx: (r() - 0.5) * 0.5,
    }));
    return (i, t, v) => {
      const p = P[i];
      const endX = p.side * 1.75;
      if (t < 0.38) {
        const k = t / 0.38;
        v.set(endX + (p.hole - endX) * k, PIPE_Y, 0.09);
        return Math.min(1, k * 5);
      }
      const k = (t - 0.38) / 0.62;
      const e = 1 - (1 - k) * (1 - k);
      v.set(p.hole + p.dx * e, PIPE_Y + (p.ty - PIPE_Y) * e, 0.075);
      return 1 - k * k;
    };
  }, []);

  const heat = useMemo<ParticleFn>(() => {
    const r = rng(29);
    const P = Array.from({ length: 110 }, () => ({
      x: (r() * 2 - 1) * 1.1,
      y0: 0.2 + r() * 0.8,
      ph: r() * 6,
    }));
    return (i, t, v) => {
      const p = P[i];
      v.set(p.x + Math.sin(t * 6 + p.ph) * 0.06, p.y0 + t * (1.82 - p.y0), 0.06);
      return Math.sin(Math.PI * t);
    };
  }, []);

  const posts: Vec3[] = [
    [-PEN_W / 2 - 0.05, ROOF_Y / 2, -PEN_D],
    [PEN_W / 2 + 0.05, ROOF_Y / 2, -PEN_D],
    [-PEN_W / 2 - 0.05, ROOF_Y / 2, 0],
    [PEN_W / 2 + 0.05, ROOF_Y / 2, 0],
  ];

  return (
    <group>
      {/* pen frame (back half — section cut at z = 0) */}
      {posts.map((p) => (
        <Block key={p.join(',')} size={[0.07, ROOF_Y, 0.07]} position={p} color={C.post} />
      ))}
      {[0.25, 0.6, 0.95].map((ry) => (
        <group key={ry}>
          <Block size={[PEN_W + 0.1, 0.06, 0.03]} position={[0, ry, -PEN_D - 0.03]} color={C.post} />
          <Block size={[0.03, 0.06, PEN_D]} position={[-PEN_W / 2 - 0.07, ry, -PEN_D / 2]} color={C.post} />
          <Block size={[0.03, 0.06, PEN_D]} position={[PEN_W / 2 + 0.07, ry, -PEN_D / 2]} color={C.post} />
        </group>
      ))}

      {/* compost strata: shrimp shell 1 part : dry material 2 parts */}
      {strata.map((s) => (
        <Layer key={s.i} base={[0, s.y, 0]} lift={[0, s.i * 0.14, 0]} exploded={exploded}>
          <Block
            size={[PEN_W, s.h, PEN_D]}
            position={[0, s.h / 2, -PEN_D / 2]}
            color={s.kind === 'dry' ? C.dry : C.shrimp}
          />
          <Chips
            spots={spots[s.i]}
            color={s.kind === 'dry' ? C.dryGrain : C.shrimpChip}
            kind={s.kind === 'dry' ? 'husk' : 'flake'}
          />
        </Layer>
      ))}

      {/* perforated PVC aeration pipes */}
      <Layer base={[0, 0, 0]} lift={[0, 0, 0.9]} exploded={exploded}>
        <Pipe from={[-1.75, PIPE_Y, 0]} to={[1.75, PIPE_Y, 0]} />
        {RISERS.map((x) => (
          <Pipe key={x} from={[x, PIPE_Y, 0]} to={[x, PILE_TOP + 0.45, 0]} />
        ))}
        <Holes points={baseHoles} />
        <Holes points={riserHoles} />
      </Layer>

      {/* tarp roof */}
      <Layer base={[0, ROOF_Y, -PEN_D / 2]} lift={[0, 0.8, 0]} exploded={exploded}>
        <mesh rotation={[0.08, 0, 0]} castShadow>
          <boxGeometry args={[PEN_W + 0.5, 0.02, PEN_D + 0.5]} />
          <Mat color={C.tarp} opacity={0.88} />
          <Edges color={INK} threshold={20} />
        </mesh>
      </Layer>

      <Particles count={140} color={C.o2} size={0.024} speed={0.16} fn={o2} visible={!exploded} />
      <Particles count={110} color={C.heat} size={0.022} speed={0.13} fn={heat} visible={!exploded} />

      <Callout position={[-1.4, exploded ? ROOF_Y + 0.8 : ROOF_Y, -0.2]} code="2.2-A" text="หลังคาผ้าใบ (กันฝน)" left />
      <Callout
        position={[1.75, PIPE_Y, exploded ? 0.9 : 0]}
        code="2.2-B"
        text="ท่อ PVC เจาะรู · ปลายท่อเปิดรับอากาศ"
      />
      <Callout
        position={[0.62, PILE_TOP + 0.45, exploded ? 0.9 : 0]}
        code="2.2-C"
        text="ท่อตั้งเจาะรู"
      />
      {/* left side: keeps it clear of 2.2-B / 2.2-E, which share the right edge */}
      <Callout
        position={[-1.3, exploded ? 0.24 + 0.12 / 2 + 0.14 : 0.24 + 0.06, -0.1]}
        code="2.2-D"
        text="เปลือกกุ้ง 1 ส่วน (โปรตีนสูง)"
        left
      />
      <Callout
        position={[1.3, exploded ? 0.36 + 0.12 + 0.28 : 0.36 + 0.12, -0.1]}
        code="2.2-E"
        text="แกลบ / ขุยมะพร้าว 2 ส่วน"
      />
      <Callout position={[-1.3, 0.9, 0]} code="2.2-F" text="0 วัตต์ · ไม่ใช้ไฟฟ้า" left />
    </group>
  );
}

/* =====================================================================
   FIG. 2.3 — โคกยกสูงผสมเปลือกหอย + ชั้นคลุมดิน + ถังหมักกากน้ำตาล
   ===================================================================== */

const SOIL_W = 3.6;
const SOIL_H = 0.7;
const SOIL_D = 1.4;
const BED_BW = 1.8;
const BED_TW = 1.3;
const BED_H = 0.45;
const MULCH_H = 0.035;
const BUCKET_X = 2.55;
const BUCKET_R = 0.36;
const BUCKET_H = 0.8;
const LIQ_H = 0.56;

function RaisedBed() {
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-BED_BW / 2, 0);
    s.lineTo(BED_BW / 2, 0);
    s.lineTo(BED_TW / 2, BED_H);
    s.lineTo(-BED_TW / 2, BED_H);
    s.closePath();
    return new THREE.ExtrudeGeometry(s, { depth: SOIL_D, bevelEnabled: false });
  }, []);
  useEffect(() => () => geo.dispose(), [geo]);
  return (
    <mesh geometry={geo} position={[0, 0, -SOIL_D]} castShadow receiveShadow>
      <Mat color={C.bed} />
      <Edges color={INK} threshold={20} />
    </mesh>
  );
}

function ModelSoilBed({ exploded }: { exploded: boolean }) {
  const bedChips = useMemo(() => trapezoidSpots(301, 170, BED_BW, BED_TW, BED_H, 0.05), []);
  const mulchChips = useMemo(() => {
    const r = rng(77);
    return Array.from({ length: 220 }, () => {
      const front = r() < 0.35;
      return {
        p: [
          (r() - 0.5) * (BED_TW - 0.05),
          front ? r() * MULCH_H : MULCH_H + 0.004,
          front ? 0.012 : -r() * (SOIL_D - 0.05),
        ] as Vec3,
        r: [front ? r() * Math.PI : 0, r() * Math.PI, front ? r() * Math.PI : 0] as Vec3,
        s: 0.055 * (0.6 + r() * 0.8),
      };
    });
  }, []);
  const saltCrust = useMemo(() => {
    const r = rng(55);
    return Array.from({ length: 160 }, () => {
      const side = r() < 0.5 ? -1 : 1;
      return {
        p: [side * (BED_BW / 2 + 0.05 + r() * 0.7), SOIL_H + 0.004, -0.03 - r() * (SOIL_D - 0.08)] as Vec3,
        r: [0, r() * Math.PI, 0] as Vec3,
        s: 0.03 * (0.6 + r() * 0.8),
      };
    });
  }, []);
  const bucketShells = useMemo(() => wedgeSpots(88, 60, BUCKET_R - 0.05, 0.14, 0.05), []);

  const salt = useMemo<ParticleFn>(() => {
    const r = rng(9);
    const P = Array.from({ length: 80 }, () => {
      const underBed = r() < 0.35;
      const side = r() < 0.5 ? -1 : 1;
      return {
        x: underBed ? (r() * 2 - 1) * 0.7 : side * (BED_BW / 2 + 0.05 + r() * 0.7),
        y0: 0.05 + r() * 0.2,
        y1: underBed ? SOIL_H + 0.12 : SOIL_H - 0.01,
      };
    });
    return (i, t, v) => {
      const p = P[i];
      v.set(p.x, p.y0 + (p.y1 - p.y0) * t, 0.03);
      return t < 0.85 ? Math.min(1, t * 6) : (1 - t) / 0.15;
    };
  }, []);

  const bubbles = useMemo<ParticleFn>(() => {
    const r = rng(14);
    const P = Array.from({ length: 36 }, () => ({ rr: 0.05 + r() * 0.24, y0: 0.18 + r() * 0.1 }));
    return (i, t, v) => {
      const p = P[i];
      v.set(BUCKET_X + p.rr + Math.sin(t * 8 + i) * 0.01, 0.03 + p.y0 + (LIQ_H - 0.04 - p.y0) * t, 0.03);
      return Math.sin(Math.PI * t);
    };
  }, []);

  return (
    <group position={[-0.45, 0, 0]}>
      {/* original saline soil */}
      <Block size={[SOIL_W, SOIL_H, SOIL_D]} position={[0, SOIL_H / 2, -SOIL_D / 2]} color={C.soil} />
      <Chips spots={saltCrust} color={C.salt} kind="flake" />

      {/* raised bed mixed with coarse-crushed shell */}
      <Layer base={[0, SOIL_H, 0]} lift={[0, 0.35, 0]} exploded={exploded}>
        <RaisedBed />
        <Chips spots={bedChips} color={C.shellChip} kind="flake" />
      </Layer>

      {/* shell mulch on bed surface */}
      <Layer base={[0, SOIL_H + BED_H, 0]} lift={[0, 0.8, 0]} exploded={exploded}>
        <Block size={[BED_TW, MULCH_H, SOIL_D]} position={[0, MULCH_H / 2, -SOIL_D / 2]} color={C.mulch} />
        <Chips spots={mulchChips} color={C.shellChip} kind="flake" />
      </Layer>

      {/* fermentation bucket: shell + molasses */}
      <group position={[BUCKET_X, 0, 0]}>
        <Wedge radius={BUCKET_R} height={BUCKET_H} color={C.bin} open />
        <Wedge radius={BUCKET_R} height={0.03} color={C.bin} />
        <group position={[0, 0.03, 0]}>
          <Wedge radius={BUCKET_R - 0.025} height={LIQ_H} color={C.liquid} opacity={0.82} />
          <Chips spots={bucketShells} color={C.shellChip} kind="flake" />
        </group>
        <Layer base={[0, BUCKET_H, 0]} lift={[0, 0.6, 0]} exploded={exploded}>
          <Wedge radius={BUCKET_R + 0.03} height={0.06} color={C.bin} />
        </Layer>
      </group>

      <Particles count={80} color={C.salt} size={0.02} speed={0.12} fn={salt} visible={!exploded} />
      <Particles count={36} color={C.bubble} size={0.018} speed={0.3} fn={bubbles} visible={!exploded} />

      <Callout
        position={[-BED_TW / 2, exploded ? SOIL_H + BED_H + 0.85 : SOIL_H + BED_H + 0.05, -0.2]}
        code="2.3-A"
        text="คลุมหน้าดินด้วยเปลือกหอยทุบหยาบ"
        left
      />
      <Callout
        position={[-BED_BW / 2 + 0.1, exploded ? SOIL_H + 0.35 + 0.22 : SOIL_H + 0.22, 0]}
        code="2.3-B"
        text="โคกยกสูง: ดินผสมเปลือกหอย (CaCO₃)"
        left
      />
      <Callout position={[-SOIL_W / 2, 0.3, 0]} code="2.3-C" text="ดินเค็มเดิม" left />
      <Callout position={[BED_BW / 2 + 0.45, SOIL_H + 0.02, -0.5]} code="2.3-D" text="ร่อง: ผิวดินเปลือย เกลือสะสม" />
      <Callout
        position={[BUCKET_X + BUCKET_R, exploded ? BUCKET_H + 0.65 : BUCKET_H + 0.05, 0]}
        code="2.3-E"
        text="ถังหมัก: เปลือกหอย + กากน้ำตาล"
      />
    </group>
  );
}

/* =====================================================================
   Scene, camera rig, canvas
   ===================================================================== */

const VIEWS: Record<ModelId, { pos: Vec3; target: Vec3 }> = {
  0: { pos: [3.1, 2.7, 4.3], target: [0, 0.75, 0] },
  1: { pos: [3.4, 2.9, 4.6], target: [0, 0.85, -0.3] },
  2: { pos: [1.9, 2.9, 5.3], target: [0.3, 0.6, -0.3] },
};

// World-space box each view must keep on screen: model extents incl. exploded parts and callout anchors.
const FIT_BOX: Record<ModelId, { min: Vec3; max: Vec3 }> = {
  0: { min: [-1.45, 0, -0.6], max: [1.45, BIN_H + 1.05, 0.6] },
  1: { min: [-1.45, 0, -PEN_D - 0.1], max: [1.8, ROOF_Y + 0.85, 0.95] },
  2: { min: [-0.45 - SOIL_W / 2, 0, -SOIL_D], max: [-0.45 + BUCKET_X + BUCKET_R, SOIL_H + BED_H + 0.9, 0] },
};

// Screen room kept free around the model: sides leave space for callout leaders (the boxes
// themselves clamp inside the canvas, see Callout), top/bottom clear the overlaid controls and legend.
const SIDE_FRACTION = 0.17;
const TOP_PX = 72;
const BOTTOM_PX = 64;

type ControlsLike = { target: THREE.Vector3; update: () => void };

/** Smallest camera distance along `dir` that keeps every corner of `box` inside the safe area. */
function fitCamera(
  base: THREE.PerspectiveCamera,
  model: ModelId,
  width: number,
  height: number,
): { pos: THREE.Vector3; target: THREE.Vector3 } {
  const v = VIEWS[model];
  const box = FIT_BOX[model];
  const target = new THREE.Vector3(
    (box.min[0] + box.max[0]) / 2,
    v.target[1],
    (box.min[2] + box.max[2]) / 2,
  );
  const dir = new THREE.Vector3(v.pos[0] - v.target[0], v.pos[1] - v.target[1], v.pos[2] - v.target[2]).normalize();

  const cam = base.clone();
  cam.aspect = width / Math.max(1, height);
  cam.updateProjectionMatrix();

  // safe NDC limits
  const xMax = 1 - 2 * SIDE_FRACTION;
  const xMin = -xMax;
  const top = 1 - Math.min(0.5, (2 * TOP_PX) / Math.max(1, height));
  const bottom = -1 + Math.min(0.5, (2 * BOTTOM_PX) / Math.max(1, height));

  const corners: THREE.Vector3[] = [];
  for (const x of [box.min[0], box.max[0]])
    for (const y of [box.min[1], box.max[1]])
      for (const z of [box.min[2], box.max[2]]) corners.push(new THREE.Vector3(x, y, z));

  const p = new THREE.Vector3();
  const fits = (d: number) => {
    cam.position.copy(target).addScaledVector(dir, d);
    cam.lookAt(target);
    cam.updateMatrixWorld();
    return corners.every((c) => {
      p.copy(c).project(cam);
      return p.z < 1 && p.x >= xMin && p.x <= xMax && p.y <= top && p.y >= bottom;
    });
  };

  let lo = 2;
  let hi = 40;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (fits(mid)) hi = mid;
    else lo = mid;
  }
  return { pos: target.clone().addScaledVector(dir, hi), target };
}

function CameraRig({ model }: { model: ModelId }) {
  const camera = useThree((s) => s.camera);
  const width = useThree((s) => s.size.width);
  const height = useThree((s) => s.size.height);
  const controls = useThree((s) => s.controls) as unknown as ControlsLike | null;
  // true while easing toward the goal; cleared on arrival so the user can orbit freely afterwards.
  // (Frame-based, not time-based: the canvas is paused off-screen, so a timer could expire before it renders.)
  const moving = useRef(true);

  const goal = useMemo(
    () => fitCamera(camera as THREE.PerspectiveCamera, model, width, height),
    [camera, model, width, height],
  );

  useEffect(() => {
    moving.current = true;
  }, [goal]);

  useFrame((_state, dt) => {
    if (!moving.current) return;
    const k = 1 - Math.exp(-Math.min(dt, 0.1) * 3.5);
    camera.position.lerp(goal.pos, k);
    if (controls) {
      controls.target.lerp(goal.target, k);
      controls.update();
    } else {
      camera.lookAt(goal.target);
    }
    const targetGap = controls ? controls.target.distanceTo(goal.target) : 0;
    if (camera.position.distanceTo(goal.pos) < 0.005 && targetGap < 0.005) moving.current = false;
  });
  return null;
}

function Entrance({ children }: { children: ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_state, dt) => {
    const g = ref.current;
    if (!g) return;
    const k = 1 - Math.exp(-dt * 5);
    const s = g.scale.x + (1 - g.scale.x) * k;
    g.scale.setScalar(s);
  });
  return (
    <group ref={ref} scale={0.9}>
      {children}
    </group>
  );
}

type CutawayProps = { model: ModelId; exploded: boolean; running: boolean };

export default function Cutaway3D({ model, exploded, running }: CutawayProps) {
  return (
    <Canvas
      flat
      shadows
      dpr={[1, 2]}
      frameloop={running ? 'always' : 'never'}
      camera={{ position: VIEWS[0].pos, fov: 34, near: 0.1, far: 100 }}
      gl={{ antialias: true }}
    >
      <color attach="background" args={['#FAF9F5']} />
      <hemisphereLight args={['#FFFFFF', '#DCD8CE', 0.9]} />
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[4, 7, 5]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[-5, 3, -3]} intensity={0.35} />

      <Entrance key={model}>
        {model === 0 ? <ModelSourceBins exploded={exploded} /> : null}
        {model === 1 ? <ModelCompostPen exploded={exploded} /> : null}
        {model === 2 ? <ModelSoilBed exploded={exploded} /> : null}
      </Entrance>

      <Grid
        position={[0, -0.002, 0]}
        args={[20, 20]}
        cellSize={0.25}
        cellThickness={0.6}
        cellColor="#E5E3DC"
        sectionSize={1}
        sectionThickness={1}
        sectionColor="#D3D0C6"
        fadeDistance={14}
        fadeStrength={1.5}
        infiniteGrid
      />
      <ContactShadows position={[0, 0, 0]} scale={10} blur={2.4} far={3} opacity={0.35} resolution={1024} />

      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom={false}
        minPolarAngle={0.35}
        maxPolarAngle={1.35}
        target={VIEWS[0].target}
      />
      <CameraRig model={model} />
    </Canvas>
  );
}
