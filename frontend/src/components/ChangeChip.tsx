export default function ChangeChip({ value, className = "" }: { value: number; className?: string }) {
  const pos = value >= 0;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${className}`}
      style={{
        background: pos ? "rgba(0,255,148,0.12)" : "rgba(255,77,109,0.12)",
        color: pos ? "var(--green)" : "var(--red)",
      }}
    >
      {pos ? "▲" : "▼"} {Math.abs(value).toFixed(2)}%
    </span>
  );
}
