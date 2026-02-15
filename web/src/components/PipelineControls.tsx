import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { setupPipeline, resetPipeline, getPipelineStatus } from "@/lib/api";
import { toast } from "sonner";

export function PipelineControls() {
  const [status, setStatus] = useState<{
    sources: string[];
    materialized_views: string[];
  } | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  async function refreshStatus() {
    try {
      setStatus(await getPipelineStatus());
    } catch {
      /* pipeline not ready */
    }
  }

  async function handleSetup() {
    setLoading("setup");
    try {
      await setupPipeline();
      toast.success("Pipeline created");
      await refreshStatus();
    } catch {
      toast.error("Setup failed");
    } finally {
      setLoading(null);
    }
  }

  async function handleReset() {
    setLoading("reset");
    try {
      await resetPipeline();
      toast.success("Pipeline reset");
      setStatus(null);
    } catch {
      toast.error("Reset failed");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <h1 className="text-2xl font-bold mr-auto">
        Kafka → RisingWave Pipeline
      </h1>
      {status && (
        <div className="flex gap-2">
          <Badge variant="secondary">
            {status.sources.length} sources
          </Badge>
          <Badge variant="secondary">
            {status.materialized_views.length} MVs
          </Badge>
        </div>
      )}
      <Button onClick={handleSetup} disabled={loading !== null}>
        {loading === "setup" ? "Setting up…" : "Setup"}
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
