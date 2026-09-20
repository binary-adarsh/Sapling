import { motion } from "framer-motion";

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      {Icon && (
        <motion.div
          animate={{ rotate: [-3, 3, -3], y: [0, -3, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-teal-soft)] text-[var(--color-teal-deep)]"
        >
          <Icon size={26} strokeWidth={1.6} />
        </motion.div>
      )}
      <h3 className="font-display text-lg text-[var(--color-ink)] mb-1.5">{title}</h3>
      {description && (
        <p className="text-sm text-[var(--color-ink-soft)] max-w-sm mb-5">{description}</p>
      )}
      {action}
    </div>
  );
}
