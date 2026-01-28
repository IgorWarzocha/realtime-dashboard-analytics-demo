/**
 * Customized tooltip for the real-time pulse chart showing campaign breakdown.
 */
import { formatNumber } from "@/lib/format";
import { CustomTooltipProps, TooltipPayload } from "./types";

export function CustomTooltip({
  active,
  payload,
  pulseData,
}: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const campaignPayload = payload.filter((p) =>
      p.dataKey.startsWith("ts:campaign:"),
    );
    const totalPayload = payload.find(
      (p) => p.dataKey.includes(":global") || p.dataKey.includes(":brand:"),
    );

    const campaignsSum = campaignPayload.reduce(
      (acc: number, p: TooltipPayload) => acc + p.value,
      0,
    );
    const totalValue = (totalPayload?.value as number) ?? 0;
    const otherValue = Math.max(0, totalValue - campaignsSum);

    return (
      <div className="bg-background/95 border border-border p-2 rounded-lg shadow-xl text-[10px] backdrop-blur-sm min-w-[140px]">
        <p className="font-bold mb-1 opacity-50 border-b border-border/50 pb-1">
          {new Date(payload[0].payload.time).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>

        {campaignPayload.map((entry, index) => {
          const series = pulseData.series.find((s) => s.key === entry.dataKey);
          return (
            <div
              key={index}
              className="flex items-center justify-between gap-4 py-0.5"
            >
              <div className="flex items-center gap-1.5 truncate max-w-[110px]">
                <div
                  className="h-1.5 w-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="truncate opacity-80">{series?.label}</span>
              </div>
              <span className="font-mono">{formatNumber(entry.value)}</span>
            </div>
          );
        })}

        {otherValue > 0 && (
          <div className="flex items-center justify-between gap-4 py-0.5 italic">
            <div className="flex items-center gap-1.5 truncate max-w-[110px]">
              <div className="h-1.5 w-1.5 rounded-full shrink-0 bg-muted-foreground/30" />
              <span className="truncate text-muted-foreground">
                Other Campaigns
              </span>
            </div>
            <span className="font-mono text-muted-foreground">
              {formatNumber(otherValue)}
            </span>
          </div>
        )}

        {totalPayload && (
          <div className="flex items-center justify-between gap-4 mt-1.5 pt-1.5 border-t border-border font-bold">
            <div className="flex items-center gap-1.5">
              <div
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: totalPayload.color }}
              />
              <span>
                {
                  pulseData.series.find((s) => s.key === totalPayload.dataKey)
                    ?.label
                }
              </span>
            </div>
            <span className="font-mono text-primary">
              {formatNumber(totalValue)}
            </span>
          </div>
        )}
      </div>
    );
  }
  return null;
}
