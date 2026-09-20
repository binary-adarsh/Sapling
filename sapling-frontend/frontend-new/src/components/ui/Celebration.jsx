import { motion } from "framer-motion";

const colors = ["var(--color-gold)", "var(--color-teal)", "var(--color-coral)", "var(--color-gold-soft)"];

// A small burst of leaf-like particles used on completion screens (interview
// finished, coding round finished). Purely decorative, respects
// prefers-reduced-motion via the global CSS override.
export default function Celebration() {
  const particles = Array.from({ length: 14 }).map((_, i) => {
    const angle = (i / 14) * Math.PI * 2;
    const distance = 70 + (i % 3) * 22;
    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      rotate: (i % 2 === 0 ? 1 : -1) * (30 + i * 8),
      color: colors[i % colors.length],
      delay: i * 0.02,
    };
  });

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible">
      {particles.map((p, i) => (
        <motion.span
          key={i}
          className="absolute h-2.5 w-2.5 rounded-full"
          style={{ background: p.color }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0.4, rotate: 0 }}
          animate={{ x: p.x, y: p.y, opacity: 0, scale: 1, rotate: p.rotate }}
          transition={{ duration: 0.9, delay: p.delay, ease: [0.16, 1, 0.3, 1] }}
        />
      ))}
    </div>
  );
}
