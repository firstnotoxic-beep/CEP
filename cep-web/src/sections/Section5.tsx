import { motion } from 'framer-motion';
import { PROJECT, SUMMARY, type Scene } from '../content';
import { EASE, Reveal, Section, SpotlightCard } from '../components/ui';

export default function Section5({ scene }: { scene: Scene }) {
  return (
    <Section scene={scene}>
      <SummaryTable />
      <TeamCredits />
    </Section>
  );
}

/* ================= Summary ================= */

function SummaryTable() {
  return (
    <div className="grid grid-cols-12 gap-5">
      <Reveal className="col-span-12 lg:col-span-3">
        <div className="mono-label text-faint">5.1</div>
        <h2 className="mt-2 text-2xl font-semibold">สรุป</h2>
      </Reveal>
      <ol className="col-span-12 border-t border-rule-strong lg:col-span-9">
        {SUMMARY.map((row, i) => (
          <motion.li
            key={row.code}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, ease: EASE, delay: i * 0.08 }}
            className="grid grid-cols-12 gap-4 border-b border-rule py-5"
          >
            <span className="col-span-12 text-[1.15rem] font-semibold md:col-span-3">{row.title}</span>
            <span className="col-span-12 text-[16px] leading-[1.8] text-ink md:col-span-9">{row.text}</span>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}

/* ================= Research Team & Advisor ================= */

function TeamCredits() {
  return (
    <Reveal className="mt-20">
      <SpotlightCard className="px-8 py-14 lg:px-16">
        <div className="text-center">
          <div className="text-[13px] font-semibold text-accent">คณะผู้จัดทำและครูที่ปรึกษา</div>
          <h2 className="mx-auto mt-5 max-w-4xl text-balance text-[1.35rem] font-medium leading-[1.6] text-ink">{PROJECT.title}</h2>
          <div className="mx-auto mt-8 h-px w-24 bg-accent/40" />
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl grid-cols-12 gap-y-10 md:gap-x-10">
          <div className="col-span-12 md:col-span-7">
            <div className="th-label text-faint">คณะผู้จัดทำ</div>
            <ol className="mt-4">
              {PROJECT.team.map((name, i) => (
                <motion.li
                  key={name}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, ease: EASE, delay: 0.1 + i * 0.07 }}
                  className="flex items-baseline gap-5 border-b border-rule py-3 last:border-b-0"
                >
                  <span className="text-[1.15rem]">{name}</span>
                </motion.li>
              ))}
            </ol>
          </div>

          <div className="col-span-12 flex flex-col md:col-span-5">
            <div className="th-label text-faint">ครูที่ปรึกษาโครงการ</div>
            <div className="mt-4 border-y border-rule-strong py-4 text-[1.15rem]">{PROJECT.advisor}</div>

            <div className="th-label mt-10 text-faint">สถาบัน</div>
            <div className="mt-4 text-[1.05rem] leading-relaxed">{PROJECT.school}</div>
            <div className="mt-6 space-y-1 text-[14px] text-muted">
              <div>{PROJECT.program}</div>
              <div>{PROJECT.community}</div>
            </div>
          </div>
        </div>

        <div className="mt-14 flex items-center justify-center gap-4 text-faint">
          <span className="h-px w-10 bg-rule-strong" />
          <span className="text-[13px]">ขอบคุณครับ</span>
          <span className="h-px w-10 bg-rule-strong" />
        </div>
      </SpotlightCard>
    </Reveal>
  );
}
