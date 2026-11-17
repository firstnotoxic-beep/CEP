import { useCallback, useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import { SCENES } from './content';
import AcademicPresenterBar from './components/AcademicPresenterBar';
import { ScrollProgress } from './components/ui';
import Section1 from './sections/Section1';
import Section2 from './sections/Section2';
import Section3 from './sections/Section3';
import Section4 from './sections/Section4';
import Section5 from './sections/Section5';

export default function App() {
  const lenisRef = useRef<Lenis | null>(null);
  const activeRef = useRef(0);
  const navLockRef = useRef(false);
  const [active, setActive] = useState(0);

  const updateActive = useCallback((i: number) => {
    activeRef.current = i;
    setActive(i);
  }, []);

  // Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenisRef.current = lenis;
    let frame = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Track which scene is on screen
  useEffect(() => {
    const onScroll = () => {
      if (navLockRef.current) return;
      const probe = window.innerHeight * 0.4;
      let current = 0;
      SCENES.forEach((scene, i) => {
        const el = document.getElementById(scene.id);
        if (el && el.getBoundingClientRect().top <= probe) current = i;
      });
      if (current !== activeRef.current) updateActive(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [updateActive]);

  const goTo = useCallback(
    (index: number) => {
      const target = Math.max(0, Math.min(SCENES.length - 1, index));
      const el = document.getElementById(SCENES[target].id);
      if (!el) return;
      updateActive(target);
      const lenis = lenisRef.current;
      if (lenis) {
        navLockRef.current = true;
        const unlock = () => {
          navLockRef.current = false;
        };
        // fallback in case the animation is interrupted by manual scrolling
        window.setTimeout(unlock, 1400);
        lenis.scrollTo(el, { duration: 1.2, onComplete: unlock });
      } else {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    },
    [updateActive],
  );

  // Keyboard: Left/Right and 1–5
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target;
      if (t instanceof HTMLElement && (t.isContentEditable || t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) {
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        goTo(activeRef.current + 1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goTo(activeRef.current - 1);
      } else if (/^[1-9]$/.test(e.key)) {
        const n = Number(e.key) - 1;
        if (n < SCENES.length) goTo(n);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goTo]);

  return (
    <>
      <ScrollProgress />
      <main className="pb-32">
        <Section1 scene={SCENES[0]} />
        <Section2 scene={SCENES[1]} />
        <Section3 scene={SCENES[2]} />
        <Section4 scene={SCENES[3]} />
        <Section5 scene={SCENES[4]} />
      </main>
      <AcademicPresenterBar scenes={SCENES} active={active} onGo={goTo} />
    </>
  );
}
