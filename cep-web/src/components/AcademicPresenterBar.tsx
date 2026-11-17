import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Scene } from '../content';
import { cx } from './ui';

const TALK_SECONDS = 12 * 60;

type Mode = 'down' | 'up';

type Props = {
  scenes: Scene[];
  active: number;
  onGo: (index: number) => void;
};

function fmt(totalSeconds: number): string {
  const s = Math.abs(totalSeconds);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}

function useTalkTimer() {
  const [running, setRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const baseRef = useRef(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    startRef.current = performance.now();
    const id = window.setInterval(() => {
      if (startRef.current !== null) {
        setElapsedMs(baseRef.current + performance.now() - startRef.current);
      }
    }, 200);
    return () => {
      window.clearInterval(id);
      if (startRef.current !== null) {
        baseRef.current += performance.now() - startRef.current;
        startRef.current = null;
      }
      setElapsedMs(baseRef.current);
    };
  }, [running]);

  const toggle = useCallback(() => setRunning((r) => !r), []);

  const reset = useCallback(() => {
    baseRef.current = 0;
    startRef.current = startRef.current !== null ? performance.now() : null;
    setElapsedMs(0);
  }, []);

  return { running, elapsedSeconds: Math.floor(elapsedMs / 1000), toggle, reset };
}

export default function AcademicPresenterBar({ scenes, active, onGo }: Props) {
  const [visible, setVisible] = useState(true);
  const [mode, setMode] = useState<Mode>('down');
  const { running, elapsedSeconds, toggle, reset } = useTalkTimer();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const key = e.key.toLowerCase();
      if (key === 'h') setVisible((v) => !v);
      else if (key === 't') toggle();
      else if (key === 'r') reset();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggle, reset]);

  const remaining = TALK_SECONDS - elapsedSeconds;
  const overtime = remaining < 0;
  const warning = !overtime && remaining <= 60;
  const display =
    mode === 'down' ? `${overtime ? '+' : ''}${fmt(remaining)}` : fmt(elapsedSeconds);
  const progress = Math.min(1, elapsedSeconds / TALK_SECONDS);

  const iconBtn =
    'grid h-7 place-items-center rounded-full px-2.5 text-[10.5px] tracking-[0.12em] text-stone-300 transition-colors hover:bg-white/10 hover:text-white';

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center font-mono text-[11px]">
      <AnimatePresence mode="wait" initial={false}>
        {visible ? (
          <motion.div
            key="dock"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            title="คีย์ลัด: ← → · 1–5 · T เริ่ม/หยุด · R รีเซ็ต · H ซ่อน"
            className="pointer-events-auto relative flex items-center gap-1 overflow-hidden rounded-full bg-stone-900/[0.88] px-2 py-1.5 text-stone-100 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl"
          >
            {/* scene navigation */}
            <div className="flex items-center">
              {scenes.map((scene, i) => (
                <button
                  key={scene.id}
                  type="button"
                  title={`${scene.kicker} — ${scene.title}`}
                  onClick={() => onGo(i)}
                  className={cx(
                    'relative h-7 w-9 rounded-full transition-colors',
                    i === active ? 'text-stone-900' : 'text-stone-400 hover:text-white',
                  )}
                >
                  {i === active ? (
                    <motion.span
                      layoutId="dock-scene"
                      className="absolute inset-0 rounded-full bg-stone-100"
                      transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                    />
                  ) : null}
                  <span className="relative z-10">{scene.code}</span>
                </button>
              ))}
            </div>

            <span className="mx-1 h-4 w-px bg-white/15" />

            {/* talk timer */}
            <button
              type="button"
              onClick={() => setMode((m) => (m === 'down' ? 'up' : 'down'))}
              title={mode === 'down' ? 'เวลาที่เหลือ (กดเพื่อสลับเป็นเวลาที่ใช้ไป)' : 'เวลาที่ใช้ไป (กดเพื่อสลับเป็นเวลาที่เหลือ)'}
              className={cx(
                'min-w-[62px] rounded-full px-2 text-center text-[14px] font-semibold tabular-nums',
                overtime || warning ? 'text-[#F2A07B]' : 'text-white',
              )}
            >
              {display}
            </button>
            <button type="button" onClick={toggle} title="เริ่ม/หยุดเวลา (T)" className={iconBtn}>
              {running ? 'PAUSE' : 'START'}
            </button>
            <button type="button" onClick={reset} title="รีเซ็ตเวลา (R)" className={iconBtn}>
              RESET
            </button>

            <span className="mx-1 h-4 w-px bg-white/15" />

            <button type="button" onClick={() => setVisible(false)} title="ซ่อนแถบ (H)" className={iconBtn}>
              HIDE
            </button>

            {/* 12-minute progress hairline */}
            <span className="absolute inset-x-4 bottom-0 h-[2px] overflow-hidden rounded-full bg-white/10">
              <span
                className={cx('block h-full transition-[width] duration-200', overtime ? 'bg-[#F2A07B]' : 'bg-[#5EBCB2]')}
                style={{ width: `${progress * 100}%` }}
              />
            </span>
          </motion.div>
        ) : (
          <motion.button
            key="tab"
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setVisible(true)}
            className="pointer-events-auto rounded-full bg-stone-900/80 px-3.5 py-1.5 tracking-[0.12em] text-stone-200 shadow-lg backdrop-blur-xl hover:text-white"
          >
            {scenes[active]?.code} / {String(scenes.length).padStart(2, '0')} · {display}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
