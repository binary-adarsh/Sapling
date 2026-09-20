import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";

export default function AuthLayout({ eyebrow, title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen bg-[var(--color-paper)] lg:grid lg:grid-cols-2">
      {/* Visual side */}
      <div className="relative hidden overflow-hidden bg-[var(--color-shell)] lg:flex lg:flex-col lg:justify-between px-12 py-12">
        <div className="flex items-center justify-between">
          <Link to="/home" className="flex items-center gap-2.5">
            <Logo size={28} mono />
            <span className="font-display text-lg text-[var(--color-shell-text)]">Sapling</span>
          </Link>
          <ThemeToggle dark />
        </div>

        <div className="max-w-md">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-sm text-[var(--color-gold-soft)] mb-4"
          >
            {eyebrow}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl leading-tight text-[var(--color-shell-text)]"
          >
            {title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 text-[15px] leading-relaxed text-[var(--color-shell-text)]/60"
          >
            {subtitle}
          </motion.p>
        </div>

        <div className="relative h-40">
          <svg viewBox="0 0 300 140" className="h-full w-full opacity-90">
            <motion.path
              d="M20 120 C 60 40, 120 40, 150 90 S 240 130, 280 30"
              stroke="var(--color-teal)"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
            {[20, 150, 280].map((x, i) => (
              <motion.circle
                key={x}
                cx={x}
                cy={i === 0 ? 120 : i === 1 ? 90 : 30}
                r="4.5"
                fill="var(--color-gold)"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6 + i * 0.5, type: "spring" }}
              />
            ))}
          </svg>
        </div>
      </div>

      {/* Form side */}
      <div className="flex flex-col justify-center px-6 py-14 sm:px-12 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto w-full max-w-sm"
        >
          <div className="mb-10 flex items-center justify-between lg:hidden">
            <Link to="/home" className="flex items-center gap-2.5">
              <Logo size={26} />
              <span className="font-display text-lg">Sapling</span>
            </Link>
            <ThemeToggle />
          </div>
          {children}
          {footer}
        </motion.div>
      </div>
    </div>
  );
}
