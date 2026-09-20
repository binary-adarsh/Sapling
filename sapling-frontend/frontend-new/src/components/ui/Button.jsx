import { motion } from "framer-motion";

const variants = {
  primary:
    "bg-[var(--color-gold)] text-[var(--color-ink)] hover:bg-[var(--color-gold-deep)] hover:text-white shadow-[0_1px_0_rgba(0,0,0,0.05)]",
  dark:
    "bg-[var(--color-ink)] text-[var(--color-paper)] hover:bg-[var(--color-teal-deep)]",
  ghost:
    "bg-transparent text-[var(--color-ink)] border border-[var(--color-line-strong)] hover:border-[var(--color-ink)]",
  danger:
    "bg-transparent text-[var(--color-coral)] border border-[var(--color-coral-soft)] hover:bg-[var(--color-coral-soft)]",
  link: "bg-transparent text-[var(--color-teal)] hover:text-[var(--color-teal-deep)] underline-offset-4 hover:underline p-0",
};

const sizes = {
  sm: "text-sm px-3.5 py-1.5",
  md: "text-sm px-5 py-2.5",
  lg: "text-base px-7 py-3.5",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  className = "",
  type = "button",
  onClick,
  ...rest
}) {
  const isDisabled = disabled || loading;
  return (
    <motion.button
      type={type}
      whileHover={!isDisabled ? { y: -1 } : undefined}
      whileTap={!isDisabled ? { scale: 0.97, y: 0 } : undefined}
      disabled={isDisabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${
        variant !== "link" ? sizes[size] : ""
      } ${variants[variant]} ${variant === "primary" ? "btn-shimmer" : ""} ${className}`}
      {...rest}
    >
      {loading && (
        <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
      )}
      {children}
    </motion.button>
  );
}
