import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';

/* ---------- research-style callout shared by the 3D figures ---------- */

type Vec3 = [number, number, number];

// Minimum gap between a callout box and the canvas edge.
const EDGE_PX = 8;

export function Callout({ position, code, text, left = false }: { position: Vec3; code: string; text: string; left?: boolean }) {
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
          <span className="block h-2.5 w-2.5 shrink-0 rounded-full border-2 border-white bg-ink shadow-sm" />
          <span className="block h-px w-7 shrink-0 bg-ink" />
          <span
            ref={boxRef}
            className="flex items-baseline gap-2 whitespace-nowrap rounded-lg bg-white/95 px-2.5 py-1 shadow-[0_4px_14px_-6px_rgba(20,22,21,0.25)] ring-1 ring-rule-strong"
          >
            <span className="font-mono text-[10px] font-semibold tracking-[0.12em] text-accent">{code}</span>
            <span className="text-[12px] leading-tight text-ink">{text}</span>
          </span>
        </div>
      </Html>
    </group>
  );
}
