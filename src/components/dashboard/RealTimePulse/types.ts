/**
 * Type definitions for real-time pulse components and data structures.
 */
export interface PulseSeries {
  key: string;
  label: string;
}

export interface PulseData {
  series: PulseSeries[];
  data: Array<Record<string, string | number>>;
}

export interface RealTimePulseProps {
  className?: string;
}

export interface PulseHeaderProps {
  recentCount?: number;
}

export interface LiveChartProps {
  pulseData: PulseData;
}

export interface TooltipPayload {
  dataKey: string;
  name: string;
  value: number;
  color: string;
  payload: {
    time: number;
    [key: string]: string | number;
  };
}

export interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  pulseData: PulseData;
}
