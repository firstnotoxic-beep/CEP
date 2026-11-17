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

  return (
    <div className="fixed bottom-5 right-5 z-50 font-mono text-[11px]">
      <AnimatePresence mode="wait" initial={false}>
        {visible ? (
          <motion.div
            key="bar"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.25 }}
            className="relative border border-rule bg-card/95 shadow-[0_8px_24px_-12px_rgba(20,22,21,0.25)] backdrop-blur"
          >
            <div className="flex items-stretch">
              {/* scene navigation */}
              <div className="flex items-center gap-1 px-3 py-2">
                <span className="mr-2 uppercase tracking-[0.16em] text-faint">Scene</span>
                {scenes.map((scene, i) => (
                  <button
                    key={scene.id}
                    type="button"
                    title={`${scene.kicker} — ${scene.title}`}
                    onClick={() => onGo(i)}
                    className={cx(
                      'h-7 w-8 border transition-colors',
                      i === active
                        ? 'border-ink bg-ink text-paper'
                        : 'border-rule text-muted hover:border-ink hover:text-ink',
                    )}
                  >
                    {scene.code}
                  </button>
                ))}
              </div>

              <div className="w-px bg-rule" />

              {/* talk timer */}
              <div className="flex items-center gap-2 px-3 py-2">
                <span className="uppercase tracking-[0.16em] text-faint">
                  {mode === 'down' ? 'Remain' : 'Elapsed'}
                </span>
                <span
                  className={cx(
                    'min-w-[58px] text-center text-[15px] font-semibold tabular-nums',
                    overtime || warning ? 'text-rust' : 'text-ink',
                  )}
                >
                  {display}
                </span>
                <button
                  type="button"
                  onClick={toggle}
                  title="เริ่ม/หยุดเวลา (T)"
                  className="h-7 border border-rule px-2 text-muted hover:border-ink hover:text-ink"
                >
                  {running ? 'PAUSE' : 'START'}
                </button>
                <button
                  type="button"
                  onClick={reset}
                  title="รีเซ็ตเวลา (R)"
                  className="h-7 border border-rule px-2 text-muted hover:border-ink hover:text-ink"
                >
                  RESET
                </button>
                <button
                  type="button"
                  onClick={() => setMode((m) => (m === 'down' ? 'up' : 'down'))}
                  title="สลับนับถอยหลัง / เดินหน้า"
                  className="h-7 border border-rule px-2 text-muted hover:border-ink hover:text-ink"
                >
                  {mode === 'down' ? 'CNT DN' : 'CNT UP'}
                </button>
              </div>

              <div className="w-px bg-rule" />

              <button
                type="button"
                onClick={() => setVisible(false)}
                title="ซ่อนแถบ (H)"
                className="px-3 uppercase tracking-[0.16em] text-faint hover:text-ink"
              >
                Hide
              </button>
            </div>

            {/* 12-minute progress rule */}
            <div className="h-[3px] w-full bg-rule">
              <div
                className={cx('h-full transition-[width] duration-200', overtime ? 'bg-rust' : 'bg-ink')}
                style={{ width: `${progress * 100}%` }}
              />
            </div>

            <div className="flex justify-between border-t border-rule px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-faint">
              <span className="truncate pr-4 normal-case tracking-normal">
                {scenes[active]?.kicker} · {scenes[active]?.titleEn}
              </span>
              <span className="shrink-0">Keys: Left/Right · 1–5 · T · R · H</span>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="tab"
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setVisible(true)}
            className="border border-rule bg-card/95 px-3 py-2 uppercase tracking-[0.16em] text-faint hover:text-ink"
          >
            {scenes[active]?.code} / {String(scenes.length).padStart(2, '0')} · {display}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
