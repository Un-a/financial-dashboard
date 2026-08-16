type LimitTheme = "amber" | "indigo";

interface TaxLimitCardProps {
  title: string;
  subtitle: string;
  currentAmount: number;
  limitAmount: number;
  ceilingLabel: string; // e.g. 'annual ceiling', 'threshold'
  theme: LimitTheme;
}

const formatRsd = (amount: number) =>
  `${Math.round(amount).toLocaleString("en-US")} RSD`;

// Thresholds override the card's base theme once usage gets risky —
// same amber/indigo palette below 80%, then yellow, then red.
const resolveTheme = (
  percentage: number,
  baseTheme: LimitTheme,
): LimitTheme | "yellow" | "red" => {
  if (percentage > 95) return "red";
  if (percentage > 80) return "yellow";
  return baseTheme;
};

const THEME_CLASSES: Record<
  LimitTheme | "yellow" | "red",
  { badgeBg: string; badgeText: string; barTrack: string; barFill: string }
> = {
  amber: {
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-600",
    barTrack: "bg-amber-100",
    barFill: "bg-amber-500",
  },
  indigo: {
    badgeBg: "bg-indigo-50",
    badgeText: "text-indigo-600",
    barTrack: "bg-indigo-100",
    barFill: "bg-indigo-500",
  },
  yellow: {
    badgeBg: "bg-yellow-50",
    badgeText: "text-yellow-600",
    barTrack: "bg-yellow-100",
    barFill: "bg-yellow-500",
  },
  red: {
    badgeBg: "bg-red-50",
    badgeText: "text-red-600",
    barTrack: "bg-red-100",
    barFill: "bg-red-500",
  },
};

export const TaxLimitCard = ({
  title,
  subtitle,
  currentAmount,
  limitAmount,
  ceilingLabel,
  theme,
}: TaxLimitCardProps) => {
  const percentage = Math.min((currentAmount / limitAmount) * 100, 100);
  const remaining = Math.max(limitAmount - currentAmount, 0);
  const resolvedTheme = resolveTheme(percentage, theme);
  const classes = THEME_CLASSES[resolvedTheme];

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
        </div>

        <span
          className={`whitespace-nowrap rounded-full px-3 py-1 text-sm font-semibold ${classes.badgeBg} ${classes.badgeText}`}
        >
          {Math.round(percentage)}% used
        </span>
      </div>

      <p className="mt-4 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
        {formatRsd(currentAmount)}
      </p>

      <div
        className={`mt-4 h-2 w-full overflow-hidden rounded-full ${classes.barTrack}`}
      >
        <div
          className={`h-full rounded-full ${classes.barFill}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className="mt-3 text-sm text-gray-500">
        {formatRsd(limitAmount)} {ceilingLabel} · {formatRsd(remaining)}{" "}
        remaining
      </p>
    </div>
  );
};
