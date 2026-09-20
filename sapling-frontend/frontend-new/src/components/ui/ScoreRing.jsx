import { motion } from "framer-motion";

// Radial score indicator used everywhere a 0-100 (or 0-10) score needs a
// visual signature: resume score, interview score, coding score, match score.
export default function ScoreRing({ value = 0, max = 100, size = 88, stroke = 8, label, tone = "gold" }) {
  const pct = Math.max(0, Math.min(1, (value ?? 0) / max));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const colors = {
    gold: "var(--color-gold)",
    teal: "var(--color-teal)",
    coral: "var(--color-coral)",
  };
  const color = colors[tone] || colors.gold;

  return (
    <div className="relative inline-flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--color-line)"
          strokeWidth={stroke}
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - pct) }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-lg font-semibold text-[var(--color-ink)] leading-none">
          {value != null ? Math.round(value) : "–"}
        </span>
        {label && <span className="text-[10px] text-[var(--color-ink-faint)] mt-1">{label}</span>}
      </div>
    </div>
  );
}
