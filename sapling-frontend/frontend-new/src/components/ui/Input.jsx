export function Field({ label, hint, error, children }) {
  return (
    <label className="block">
      {label && (
        <span className="block text-sm font-medium text-[var(--color-ink)] mb-1.5">{label}</span>
      )}
      {children}
      {hint && !error && <span className="block text-xs text-[var(--color-ink-faint)] mt-1.5">{hint}</span>}
      {error && <span className="block text-xs text-[var(--color-coral)] mt-1.5">{error}</span>}
    </label>
  );
}

export default function Input({ className = "", error, ...rest }) {
  return (
    <input
      className={`w-full rounded-lg border bg-[var(--color-paper-raised)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] outline-none transition-colors focus:border-[var(--color-teal)] ${
        error ? "border-[var(--color-coral)]" : "border-[var(--color-line-strong)]"
      } ${className}`}
      {...rest}
    />
  );
}

export function Textarea({ className = "", error, ...rest }) {
  return (
    <textarea
      className={`w-full rounded-lg border bg-[var(--color-paper-raised)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] outline-none transition-colors focus:border-[var(--color-teal)] resize-y ${
        error ? "border-[var(--color-coral)]" : "border-[var(--color-line-strong)]"
      } ${className}`}
      {...rest}
    />
  );
}

export function Select({ className = "", error, children, ...rest }) {
  return (
    <select
      className={`w-full rounded-lg border bg-[var(--color-paper-raised)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] outline-none transition-colors focus:border-[var(--color-teal)] ${
        error ? "border-[var(--color-coral)]" : "border-[var(--color-line-strong)]"
      } ${className}`}
      {...rest}
    >
      {children}
    </select>
  );
}
