import { useState } from "react";
import { Button } from "@/components/ui/button";
import { setupPipeline, resetPipeline, seedPipeline } from "@/lib/api";
import { toast } from "sonner";

interface PipelineControlsProps {
  onStatusChange?: () => void;
}

export function PipelineControls({ onStatusChange }: PipelineControlsProps) {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleSetup() {
    setLoading("setup");
    try {
      await setupPipeline();
      toast.success("Pipeline created");
      onStatusChange?.();
    } catch {
      toast.error("Setup failed");
    } finally {
      setLoading(null);
    }
  }

  async function handleSeed() {
    setLoading("seed");
    try {
      await seedPipeline();
      toast.success("Sample data ingested");
    } catch {
      toast.error("Seed failed");
    } finally {
      setLoading(null);
    }
  }

  async function handleReset() {
    setLoading("reset");
    try {
      await resetPipeline();
      toast.success("Pipeline reset");
      onStatusChange?.();
    } catch {
      toast.error("Reset failed");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Button onClick={handleSetup} disabled={loading !== null}>
        {loading === "setup" ? "Setting up…" : "Setup"}
      </Button>
      <Button variant="outline" onClick={handleSeed} disabled={loading !== null}>
        {loading === "seed" ? "Seeding…" : "Seed Data"}
      </Button>
      <Button
        variant="destructive"
        onClick={handleReset}
        disabled={loading !== null}
      >
        {loading === "reset" ? "Resetting…" : "Reset"}
      </Button>
    </div>
  );
}
