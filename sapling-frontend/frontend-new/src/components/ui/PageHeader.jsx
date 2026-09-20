export default function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
      <div>
        {eyebrow && (
          <p className="text-sm text-[var(--color-teal-deep)] font-medium mb-1.5">{eyebrow}</p>
        )}
        <h1 className="font-display text-[28px] sm:text-[32px] font-semibold text-[var(--color-ink)] leading-tight">
          {title}
        </h1>
        {description && (
          <p className="text-[var(--color-ink-soft)] mt-1.5 max-w-xl text-[15px]">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
    </div>
  );
}
