export default function Logo({ size = 34, mono = false, className = "" }) {
  const stem = mono ? "currentColor" : "var(--color-teal)";
  const leaf = mono ? "currentColor" : "var(--color-gold)";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M20 34V19"
        stroke={stem}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M20 22C20 22 8 21 8 10C8 10 20 9 20 22Z"
        fill={leaf}
        opacity="0.9"
      />
      <path
        d="M20 17C20 17 32 16 32 6C32 6 20 5 20 17Z"
        fill={stem}
      />
    </svg>
  );
}
