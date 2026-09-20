import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, FileSearch, MessagesSquare, Code2, Sparkles } from "lucide-react";
import Logo from "../components/Logo";
import ThemeToggle from "../components/ThemeToggle";

const ease = [0.16, 1, 0.3, 1];

function FadeUp({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SproutField() {
  // A small orchestrated illustrative moment for the hero: sprouts of
  // varying height growing in, standing in for candidates being evaluated.
  const stems = [38, 62, 48, 74, 30, 56];
  return (
    <div className="relative h-72 w-full max-w-md mx-auto">
      <svg viewBox="0 0 400 260" className="h-full w-full">
        <line x1="10" y1="230" x2="390" y2="230" stroke="var(--color-line-strong)" strokeWidth="1.5" />
        {stems.map((h, i) => {
          const x = 40 + i * 62;
          return (
            <motion.g
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 + i * 0.12, ease }}
            >
              <motion.line
                x1={x}
                y1={230}
                x2={x}
                y2={230 - h}
                stroke="var(--color-teal)"
                strokeWidth="3"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, delay: 0.5 + i * 0.12, ease }}
              />
              <ellipse
                cx={x - 9}
                cy={230 - h + 4}
                rx="13"
                ry="8"
                fill="var(--color-gold)"
                opacity={i % 2 === 0 ? 0.9 : 0.65}
                transform={`rotate(-25 ${x - 9} ${230 - h + 4})`}
              />
              <ellipse
                cx={x + 9}
                cy={230 - h - 6}
                rx="13"
                ry="8"
                fill="var(--color-teal-deep)"
                opacity={i % 2 === 0 ? 0.65 : 0.9}
                transform={`rotate(25 ${x + 9} ${230 - h - 6})`}
              />
              {i === 3 && (
                <circle cx={x} cy={230 - h - 20} r="5" fill="var(--color-coral)">
                  <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}

const rows = [
  {
    icon: FileSearch,
    title: "Resume analysis that reads like a hiring manager",
    body: "Upload a resume once and get a structured breakdown of strengths, gaps, and a score you can defend in a debrief — not a keyword count.",
  },
  {
    icon: MessagesSquare,
    title: "Interviews that adapt to the answer, not a script",
    body: "Every follow-up question is generated from what the candidate just said, scored individually, and rolled into one final interview score.",
  },
  {
    icon: Code2,
    title: "Coding rounds candidates can't game",
    body: "Three randomized problems per session, judged automatically, so two candidates rarely see the same paper twice.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 sm:px-8">
        <div className="flex items-center gap-2.5">
          <Logo size={30} />
          <span className="font-display text-xl">Sapling</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link to="/login" className="text-sm text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]">
            Sign in
          </Link>
          <Link
            to="/register"
            className="rounded-full bg-[var(--color-ink)] px-5 py-2 text-sm text-[var(--color-paper)] hover:bg-[var(--color-teal-deep)] transition-colors"
          >
            Get started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mx-auto grid max-w-6xl gap-10 overflow-hidden px-6 pb-20 pt-10 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-6 lg:pt-16">
        {/* Ambient background blobs — subtle, slow-drifting, decorative only */}
        <div className="pointer-events-none absolute -left-24 -top-16 h-72 w-72 rounded-full bg-[var(--color-teal-soft)] opacity-40 blur-3xl" style={{ animation: "drift 14s ease-in-out infinite alternate" }} />
        <div className="pointer-events-none absolute -right-16 top-24 h-64 w-64 rounded-full bg-[var(--color-gold-soft)] opacity-30 blur-3xl" style={{ animation: "drift 18s ease-in-out infinite alternate-reverse" }} />
        <div className="pointer-events-none absolute left-1/3 bottom-0 h-56 w-56 rounded-full bg-[var(--color-coral-soft)] opacity-20 blur-3xl" style={{ animation: "sway 10s ease-in-out infinite" }} />
        <div className="relative">
          <FadeUp>
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-line-strong)] px-3.5 py-1.5 text-xs text-[var(--color-ink-soft)]">
              <Sparkles size={13} className="text-[var(--color-gold-deep)]" />
              AI screening for both sides of the table
            </span>
          </FadeUp>
          <FadeUp delay={0.08}>
            <h1 className="font-display mt-6 text-[42px] leading-[1.08] sm:text-[54px] lg:text-[58px]">
              Hiring, given room to grow.
            </h1>
          </FadeUp>
          <FadeUp delay={0.16}>
            <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-[var(--color-ink-soft)]">
              Sapling scores resumes, runs adaptive AI interviews, and sets up
              randomized coding rounds — so candidates get a fair shot, and
              recruiters get a shortlist they can trust.
            </p>
          </FadeUp>
          <FadeUp delay={0.24} className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 btn-shimmer rounded-full bg-[var(--color-gold)] px-6 py-3 text-sm font-medium text-[var(--color-ink)] hover:bg-[var(--color-gold-deep)] hover:text-white transition-colors"
            >
              Create your account
              <ArrowUpRight size={16} />
            </Link>
            <Link to="/login" className="text-sm font-medium text-[var(--color-ink)] underline underline-offset-4">
              I already have one
            </Link>
          </FadeUp>

          <FadeUp delay={0.32} className="mt-14 grid max-w-md grid-cols-3 gap-6 border-t border-[var(--color-line)] pt-6">
            <div>
              <p className="font-display text-2xl">3</p>
              <p className="text-xs text-[var(--color-ink-faint)] mt-1">stages of screening</p>
            </div>
            <div>
              <p className="font-display text-2xl">1:1</p>
              <p className="text-xs text-[var(--color-ink-faint)] mt-1">adaptive interview</p>
            </div>
            <div>
              <p className="font-display text-2xl">0</p>
              <p className="text-xs text-[var(--color-ink-faint)] mt-1">repeated question sets</p>
            </div>
          </FadeUp>
        </div>

        <FadeUp delay={0.2} className="relative flex items-center">
          <div className="paper-panel w-full rounded-3xl p-6">
            <SproutField />
            <p className="text-center text-sm text-[var(--color-ink-faint)] mt-2">
              Every candidate grows through the same three rounds.
            </p>
          </div>
        </FadeUp>
      </section>

      {/* Feature rows — alternating, editorial, not a 3-up card grid */}
      <section className="mx-auto max-w-4xl px-6 py-16 sm:px-8">
        <div className="divide-y divide-[var(--color-line)]">
          {rows.map((row) => (
            <div key={row.title} className="flex flex-col gap-4 py-10 sm:flex-row sm:items-start sm:gap-8">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-teal-soft)] text-[var(--color-teal-deep)]">
                <row.icon size={20} strokeWidth={1.7} />
              </div>
              <div>
                <h3 className="font-display text-xl">{row.title}</h3>
                <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-[var(--color-ink-soft)]">
                  {row.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pull quote */}
      <section className="mx-auto max-w-3xl px-6 pb-24 sm:px-8">
        <div className="border-l-2 border-[var(--color-gold)] pl-6">
          <p className="font-display text-2xl leading-snug text-[var(--color-ink)] sm:text-3xl">
            "We stopped guessing who to shortlist. The interview score and the
            coding score usually agree, and when they don't, that's worth a
            second look."
          </p>
          <p className="mt-4 text-sm text-[var(--color-ink-faint)]">— a recruiter, on a Tuesday</p>
        </div>
      </section>

      <footer className="border-t border-[var(--color-line)]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-[var(--color-ink-faint)] sm:flex-row sm:px-8">
          <div className="flex items-center gap-2">
            <Logo size={18} mono />
            Sapling
          </div>
          <p>Built for candidates and recruiters who'd rather look at evidence.</p>
        </div>
      </footer>
    </div>
  );
}
