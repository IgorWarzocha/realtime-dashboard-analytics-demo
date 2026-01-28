/**
 * SimulationController
 * Controls for starting/stopping the impression simulation and resetting metrics.
 */

"use client";

import * as React from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Square, Zap, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export function SimulationController() {
  const simState = useQuery(api.admin.getSimulationState);
  const startSimulation = useMutation(api.admin.startSimulation);
  const stopSimulation = useMutation(api.admin.stopSimulation);
  const resetUICharts = useMutation(api.admin.resetUICharts);
  const trackEventBatch = useMutation(api.ingest.trackEventBatch);
  const ads = useQuery(api.analytics.listAds);

  const [optimisticRunning, setOptimisticRunning] = React.useState<
    boolean | null
  >(null);
  const isRunning =
    optimisticRunning !== null
      ? optimisticRunning
      : simState?.status === "running";
  const intensity = simState?.intensity ?? 5;

  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const fireRef = React.useRef<() => Promise<void>>(null);

  // Sync optimistic state
  React.useEffect(() => {
    if (simState && optimisticRunning !== null) {
      if ((simState.status === "running") === optimisticRunning) {
        setOptimisticRunning(null);
      }
    }
  }, [simState, optimisticRunning]);

  const fireBatch = React.useCallback(async () => {
    if (!ads || ads.length === 0 || !isRunning) return;

    const devices = ["mobile", "desktop", "tablet"] as const;
    const regions = [
      "US-East",
      "US-West",
      "EU-Central",
      "AP-Southeast",
    ] as const;

    // Batch size based on intensity (e.g., intensity 10 = 50 events per batch)
    const batchSize = Math.max(1, intensity * 5);
    const events = Array.from({ length: batchSize }).map(() => {
      const randomAd = ads[Math.floor(Math.random() * ads.length)];
      return {
        adId: randomAd._id,
        device: devices[Math.floor(Math.random() * devices.length)],
        region: regions[Math.floor(Math.random() * regions.length)],
        isClick: Math.random() < 0.05,
      };
    });

    try {
      await trackEventBatch({ events });
    } catch {
      // Silent fail for simulation
    }

    if (isRunning) {
      // Delay decreases as intensity increases
      const nextDelay = Math.max(100, 2000 - intensity * 180);
      timerRef.current = setTimeout(() => {
        void fireRef.current?.();
      }, nextDelay);
    }
  }, [ads, isRunning, intensity, trackEventBatch]);

  React.useEffect(() => {
    fireRef.current = fireBatch;
  });

  React.useEffect(() => {
    if (isRunning) {
      void fireBatch();
    } else {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isRunning, fireBatch]);

  const toggleSimulation = async () => {
    const nextState = !isRunning;
    setOptimisticRunning(nextState);
    try {
      if (nextState) {
        await startSimulation({ intensity: 7 }); // Default to high intensity for revamp
      } else {
        await stopSimulation();
      }
    } catch {
      setOptimisticRunning(null);
      toast.error("Failed to toggle simulation");
    }
  };

  const handleReset = async () => {
    try {
      await resetUICharts();
      toast.success("Charts reset", {
        description: "Visual history cleared (backend data preserved).",
      });
    } catch {
      toast.error("Failed to reset charts");
    }
  };

  return (
    <div data-slot="simulation-controls" className="flex items-center gap-3">
      {isRunning && (
        <Badge
          variant="outline"
          className="animate-pulse bg-primary/10 text-primary border-primary/20 gap-1.5 px-2"
        >
          <Zap className="h-3 w-3 fill-primary" />
          HIGH GROWTH ACTIVE
        </Badge>
      )}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => void handleReset()}
        className="h-8 w-8 text-muted-foreground hover:text-foreground"
        title="Reset Chart Data"
      >
        <RotateCcw className="h-4 w-4" />
        <span className="sr-only">Reset Chart</span>
      </Button>
      <Button
        variant={isRunning ? "destructive" : "default"}
        size="sm"
        onClick={() => {
          void toggleSimulation();
        }}
        className="h-8 gap-2 font-bold"
        aria-pressed={isRunning}
      >
        {isRunning ? (
          <>
            <Square className="h-3.5 w-3.5 fill-current" />
            Stop
          </>
        ) : (
          <>
            <Play className="h-3.5 w-3.5 fill-current" />
            Live Simulation
          </>
        )}
      </Button>
    </div>
  );
}
