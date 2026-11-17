import React, { useRef } from 'react';
import { useScroll, useTransform, motion, type MotionValue } from 'framer-motion';

/**
 * A card that starts tilted back (rotateX 15deg) and stands upright as the page scrolls.
 * Adapted from the Aceternity "container scroll" pattern.
 */
export const ContainerScroll = ({
  titleComponent,
  children,
}: {
  titleComponent: React.ReactNode;
  children: React.ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end start'] });
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // reach upright a little before the frame leaves, so it holds flat while you read it
  const rotate = useTransform(scrollYProgress, [0, 0.45], [15, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.45], isMobile ? [0.82, 0.92] : [0.95, 1]);
  const translate = useTransform(scrollYProgress, [0, 0.45], [0, -60]);

  return (
    <div ref={containerRef} className="relative flex items-start justify-center pb-10 pt-2 md:pb-16">
      <div className="w-full" style={{ perspective: '1100px' }}>
        <motion.div style={{ translateY: translate }} className="mx-auto max-w-5xl">
          {titleComponent}
        </motion.div>
        <ScrollCard rotate={rotate} scale={scale}>
          {children}
        </ScrollCard>
      </div>
    </div>
  );
};

const ScrollCard = ({
  rotate,
  scale,
  children,
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  children: React.ReactNode;
}) => (
  <motion.div
    style={{
      rotateX: rotate,
      scale,
      transformOrigin: 'center top',
      boxShadow:
        '0 1px 2px rgba(20,22,21,0.04), 0 12px 24px -8px rgba(20,22,21,0.08), 0 40px 80px -24px rgba(20,22,21,0.14)',
    }}
    className="mx-auto mt-10 w-full max-w-6xl rounded-[22px] bg-white p-2 ring-1 ring-rule md:p-3"
  >
    <div className="h-full w-full overflow-hidden rounded-[16px] bg-white ring-1 ring-rule">{children}</div>
  </motion.div>
);
