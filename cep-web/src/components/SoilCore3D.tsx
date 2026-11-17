import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Edges, Grid, OrbitControls } from '@react-three/drei';
import { Callout } from './Callout3D';

/* =====================================================================
   SIM. 3.1 — soil core cutaway (schematic, not to scale)
   saline : clay stays clumped, water carries dissolved Na⁺ down
   sodic  : Na⁺-loaded clay plates disperse and pack flat, water ponds on top
   gypsum : Ca²⁺ from gypsum replaces Na⁺, plates flocculate, water drains
   ===================================================================== */

export type SoilState = 'saline' | 'sodic' | 'gypsum';

type Vec3 = [number, number, number];

const INK = '#141615';
const COL = {
  wall: '#7A6450',
  sub: '#5E4B3B',
  clay: '#CDBB9E',
  na: '#D9772B',
  ca: '#2F5F9E',
  water: '#7FA6CF',
  gypsum: '#FFFFFF',
};

const W = 2.4; // x
const D = 1.2; // z
const SUB_H = 0.25; // subsoil slab
const TOP = 1.65; // top of the test zone

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------- clay plates: two layouts ---------- */

const N = 48;

type Pose = { p: THREE.Vector3; q: THREE.Quaternion };

// sodic: plates repel each other and lie flat in tight parallel sheets — no open pores
const PACKED: Pose[] = Array.from({ length: N }, (_, i) => {
  const r = rng(100 + i);
  const col = i % 6;
  const row = Math.floor(i / 6);
  return {
    p: new THREE.Vector3(-0.95 + col * 0.38 + (r() - 0.5) * 0.04, 0.38 + row * 0.155, row % 2 ? 0.2 : -0.2),
    q: new THREE.Quaternion().setFromEuler(new THREE.Euler(0, (r() - 0.5) * 0.2, (r() - 0.5) * 0.06)),
  };
});

// flocculated: plates gather into clumps; the gaps between clumps are the pores
const CLUMPS: Vec3[] = [
  [-0.72, 0.55, 0.18],
  [0.08, 0.5, -0.2],
  [0.78, 0.6, 0.16],
  [-0.45, 1.25, -0.16],
  [0.32, 1.22, 0.2],
  [0.9, 1.35, -0.18],
];
const CLUMPED: Pose[] = Array.from({ length: N }, (_, i) => {
  const r = rng(300 + i);
  const c = CLUMPS[i % CLUMPS.length];
  return {
    p: new THREE.Vector3(c[0] + (r() - 0.5) * 0.34, c[1] + (r() - 0.5) * 0.3, c[2] + (r() - 0.5) * 0.24),
    q: new THREE.Quaternion().setFromEuler(new THREE.Euler((r() - 0.5) * 1.6, r() * Math.PI, (r() - 0.5) * 1.6)),
  };
});

function ionTarget(state: SoilState, i: number): string {
  if (state === 'gypsum') return COL.ca;
  if (state === 'sodic') return i % 6 === 0 ? COL.ca : COL.na;
  return i % 5 === 0 ? COL.na : COL.ca;
}

function ClayPlates({ state }: { state: SoilState }) {
  const groups = useRef<Array<THREE.Group | null>>([]);
  const ionMats = useMemo(
    () => Array.from({ length: N }, (_, i) => new THREE.MeshStandardMaterial({ color: ionTarget('sodic', i), roughness: 0.5 })),
    [],
  );
  const tmp = useMemo(() => new THREE.Color(), []);

  useFrame((_s, dt) => {
    const layout = state === 'sodic' ? PACKED : CLUMPED;
    const k = 1 - Math.exp(-Math.min(dt, 0.1) * 2.2);
    groups.current.forEach((g, i) => {
      if (!g) return;
      g.position.lerp(layout[i].p, k);
      g.quaternion.slerp(layout[i].q, k);
      // ions swap one after another rather than all at once
      const ik = 1 - Math.exp(-Math.min(dt, 0.1) * (0.9 + (i % 7) * 0.35));
      ionMats[i].color.lerp(tmp.set(ionTarget(state, i)), ik);
    });
  });

  return (
    <>
      {PACKED.map((pose, i) => (
        <group
          key={i}
          ref={(g) => {
            groups.current[i] = g;
          }}
          position={pose.p}
          quaternion={pose.q}
        >
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.34, 0.035, 0.22]} />
            <meshStandardMaterial color={COL.clay} roughness={0.9} />
            <Edges color={INK} threshold={20} />
          </mesh>
          <mesh position={[0.19, 0.035, 0]} material={ionMats[i]}>
            <sphereGeometry args={[0.042, 16, 12]} />
          </mesh>
        </group>
      ))}
    </>
  );
}

/* ---------- falling particles (water drops, leached Na⁺, incoming Ca²⁺) ---------- */

type FallProps = {
  count: number;
  seed: number;
  color: string;
  radius: number;
  from: number;
  to: number | ((i: number) => number);
  speed: number;
  active: boolean;
  spread?: number;
};

function Falling({ count, seed, color, radius, from, to, speed, active, spread = 1 }: FallProps) {
  const meshes = useRef<Array<THREE.Mesh | null>>([]);
  const amt = useRef(0);
  const spots = useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: count }, () => ({
      x: (r() - 0.5) * (W - 0.3) * spread,
      z: (r() - 0.5) * (D - 0.3) * spread,
      off: r(),
    }));
  }, [count, seed, spread]);

  useFrame(({ clock }, dt) => {
    amt.current += ((active ? 1 : 0) - amt.current) * (1 - Math.exp(-Math.min(dt, 0.1) * 3));
    const t = clock.getElapsedTime();
    meshes.current.forEach((m, i) => {
      if (!m) return;
      const s = spots[i];
      const end = typeof to === 'function' ? to(i) : to;
      const f = (t * speed + s.off) % 1;
      m.position.set(s.x + Math.sin(t * 2 + i) * 0.01, from + (end - from) * f, s.z);
      // fade in at the top and out at the bottom of each run
      const edge = Math.min(1, f * 6, (1 - f) * 6);
      m.scale.setScalar(Math.max(0.0001, amt.current * edge));
    });
  });

  return (
    <>
      {spots.map((_, i) => (
        <mesh
          key={i}
          ref={(m) => {
            meshes.current[i] = m;
          }}
        >
          <sphereGeometry args={[radius, 12, 10]} />
          <meshStandardMaterial color={color} roughness={0.35} />
        </mesh>
      ))}
    </>
  );
}

/* ---------- ponded water + gypsum granules ---------- */

function WaterLayer({ state }: { state: SoilState }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_s, dt) => {
    const m = ref.current;
    if (!m) return;
    const h = state === 'sodic' ? 0.24 : 0.03;
    const k = 1 - Math.exp(-Math.min(dt, 0.1) * 2);
    m.scale.y += (h - m.scale.y) * k;
    m.position.y = TOP + m.scale.y / 2;
  });
  return (
    <mesh ref={ref} position={[0, TOP + 0.015, 0]} scale={[1, 0.03, 1]}>
      <boxGeometry args={[W - 0.06, 1, D - 0.06]} />
      <meshStandardMaterial color={COL.water} transparent opacity={0.42} roughness={0.15} depthWrite={false} />
      <Edges color="#3E6D9C" threshold={20} />
    </mesh>
  );
}

const GRANULES = (() => {
  const r = rng(77);
  return Array.from({ length: 22 }, () => ({ x: (r() - 0.5) * (W - 0.4), z: (r() - 0.5) * (D - 0.3), s: 0.05 + r() * 0.03 }));
})();

function Gypsum({ on }: { on: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_s, dt) => {
    const g = ref.current;
    if (!g) return;
    const k = 1 - Math.exp(-Math.min(dt, 0.1) * 4);
    const target = on ? 1 : 0.0001;
    g.scale.setScalar(g.scale.x + (target - g.scale.x) * k);
  });
  return (
    <group ref={ref} position={[0, TOP + 0.06, 0]} scale={0.0001}>
      {GRANULES.map((g, i) => (
        <mesh key={i} position={[g.x, 0, g.z]} castShadow>
          <boxGeometry args={[g.s, g.s * 0.7, g.s]} />
          <meshStandardMaterial color={COL.gypsum} roughness={0.7} />
          <Edges color={INK} threshold={20} />
        </mesh>
      ))}
    </group>
  );
}

/* ---------- the core itself: cut open at the front and right ---------- */

function CoreShell() {
  const wallT = 0.03;
  const zoneH = TOP - SUB_H;
  return (
    <group>
      {/* subsoil slab */}
      <mesh position={[0, SUB_H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[W, SUB_H, D]} />
        <meshStandardMaterial color={COL.sub} roughness={0.95} />
        <Edges color={INK} threshold={20} />
      </mesh>
      {/* back wall */}
      <mesh position={[0, SUB_H + zoneH / 2, -D / 2 + wallT / 2]} receiveShadow>
        <boxGeometry args={[W, zoneH, wallT]} />
        <meshStandardMaterial color={COL.wall} roughness={0.95} />
        <Edges color={INK} threshold={20} />
      </mesh>
      {/* left wall */}
      <mesh position={[-W / 2 + wallT / 2, SUB_H + zoneH / 2, 0]} receiveShadow>
        <boxGeometry args={[wallT, zoneH, D]} />
        <meshStandardMaterial color={COL.wall} roughness={0.95} />
        <Edges color={INK} threshold={20} />
      </mesh>
      {/* glass outline of the removed faces */}
      <mesh position={[0, SUB_H + zoneH / 2, 0]}>
        <boxGeometry args={[W, zoneH, D]} />
        <meshBasicMaterial transparent opacity={0.03} color="#FFFFFF" depthWrite={false} />
        <Edges color="#8D9089" threshold={20} />
      </mesh>
    </group>
  );
}

/* ---------- labels ---------- */

function Labels({ state }: { state: SoilState }) {
  const drains = state !== 'sodic';
  return (
    <>
      <Callout
        position={[-W / 2, TOP + (state === 'sodic' ? 0.14 : 0.03), 0.3]}
        code="A"
        text={state === 'sodic' ? 'น้ำขังอยู่บนผิวดิน' : 'น้ำซึมลงไปได้'}
        left
      />
      <Callout
        position={[-W / 2, 0.85, 0.3]}
        code="B"
        text={state === 'sodic' ? 'แผ่นดินเหนียวอัดแน่น ปิดช่องว่าง' : 'ดินเหนียวจับกันเป็นก้อน มีช่องว่าง'}
        left
      />
      <Callout
        position={[W / 2, 1.3, 0]}
        code="C"
        text={state === 'sodic' ? 'Na⁺ เกาะผิวดินเหนียว' : state === 'gypsum' ? 'Ca²⁺ เข้าแทนที่ Na⁺' : 'เกลือละลายอยู่ในน้ำ'}
      />
      <Callout position={[W / 2, 0.14, 0]} code="D" text={drains ? 'Na⁺ ถูกน้ำชะลงชั้นล่าง' : 'น้ำซึมลงชั้นล่างไม่ได้'} />
      {state === 'gypsum' ? <Callout position={[0.4, TOP + 0.1, -0.3]} code="E" text="ยิปซัม CaSO₄·2H₂O" /> : null}
    </>
  );
}

/* ---------- canvas ---------- */

export default function SoilCore3D({ state, running }: { state: SoilState; running: boolean }) {
  const drains = state !== 'sodic';
  return (
    <Canvas
      flat
      shadows
      dpr={[1, 2]}
      frameloop={running ? 'always' : 'never'}
      camera={{ position: [2.7, 2.35, 4.9], fov: 34, near: 0.1, far: 100 }}
      gl={{ antialias: true }}
    >
      <color attach="background" args={['#F6F5F0']} />
      <hemisphereLight args={['#FFFFFF', '#DCD8CE', 0.9]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 7, 5]} intensity={1.5} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004} />
      <directionalLight position={[-5, 3, -3]} intensity={0.35} />

      <CoreShell />
      <ClayPlates state={state} />
      <WaterLayer state={state} />
      <Gypsum on={state === 'gypsum'} />

      {/* water dripping through the pores */}
      <Falling count={26} seed={11} color={COL.water} radius={0.03} from={TOP + 0.02} to={SUB_H + 0.02} speed={0.32} active={drains} />
      {/* Na⁺ washed out through the bottom */}
      <Falling count={14} seed={23} color={COL.na} radius={0.04} from={1.3} to={0.02} speed={0.22} active={drains} spread={0.8} />
      {/* Ca²⁺ dissolving out of the gypsum and moving in */}
      <Falling
        count={16}
        seed={37}
        color={COL.ca}
        radius={0.04}
        from={TOP + 0.08}
        to={(i) => 0.5 + (i % 5) * 0.2}
        speed={0.28}
        active={state === 'gypsum'}
        spread={0.85}
      />

      <Labels state={state} />

      <Grid
        position={[0, -0.002, 0]}
        args={[20, 20]}
        cellSize={0.25}
        cellThickness={0.6}
        cellColor="#E5E3DC"
        sectionSize={1}
        sectionThickness={1}
        sectionColor="#D3D0C6"
        fadeDistance={12}
        fadeStrength={1.5}
        infiniteGrid
      />
      <ContactShadows position={[0, 0, 0]} scale={8} blur={2.4} far={3} opacity={0.35} resolution={1024} />
      <OrbitControls makeDefault enablePan={false} enableZoom={false} minPolarAngle={0.5} maxPolarAngle={1.35} target={[0, 0.95, 0]} />
    </Canvas>
  );
}
