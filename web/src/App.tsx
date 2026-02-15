import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { AppHeader } from "./components/AppHeader";
import { PipelineControls } from "./components/PipelineControls";
import { ProducerForms, type PractitionerPrefill } from "./components/ProducerForms";
import { PipelineView } from "./components/PipelineView";
import { getPipelineStatus, type SSEStatus } from "@/lib/api";

function App() {
  const [prefill, setPrefill] = useState<PractitionerPrefill | null>(null);
  const [sseStatus, setSSEStatus] = useState<SSEStatus>("loading");
  const [pipelineStatus, setPipelineStatus] = useState<{
    sources: string[];
    materialized_views: string[];
  } | null>(null);

  async function refreshStatus() {
    try {
      setPipelineStatus(await getPipelineStatus());
    } catch {
      /* not ready */
    }
  }

  useEffect(() => {
    refreshStatus();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <AppHeader
        sseStatus={sseStatus}
        sources={pipelineStatus?.sources}
        materializedViews={pipelineStatus?.materialized_views}
      />
      <div className="mx-auto max-w-7xl p-6 space-y-6">
        <PipelineControls onStatusChange={refreshStatus} />
        <ProducerForms prefill={prefill} onPrefillConsumed={() => setPrefill(null)} />
        <PipelineView onUpdate={setPrefill} onSSEStatusChange={setSSEStatus} />
        <Toaster />
      </div>
    </div>
  );
}

export default App;
