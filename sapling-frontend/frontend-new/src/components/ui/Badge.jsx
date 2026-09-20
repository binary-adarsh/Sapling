const tones = {
  gold: "bg-[var(--color-gold-soft)] text-[var(--color-gold-deep)]",
  teal: "bg-[var(--color-teal-soft)] text-[var(--color-teal-deep)]",
  coral: "bg-[var(--color-coral-soft)] text-[var(--color-coral)]",
  neutral: "bg-[var(--color-paper-dim)] text-[var(--color-ink-soft)]",
};

export default function Badge({ children, tone = "neutral", className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
