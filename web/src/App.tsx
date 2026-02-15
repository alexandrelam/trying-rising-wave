import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Separator } from "@/components/ui/separator";
import { PipelineControls } from "./components/PipelineControls";
import { ProducerForms, type PractitionerPrefill } from "./components/ProducerForms";
import { PipelineView } from "./components/PipelineView";

function App() {
  const [prefill, setPrefill] = useState<PractitionerPrefill | null>(null);

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6">
      <PipelineControls />
      <Separator />
      <ProducerForms prefill={prefill} onPrefillConsumed={() => setPrefill(null)} />
      <Separator />
      <PipelineView onUpdate={setPrefill} />
      <Toaster />
    </div>
  );
}

export default App;
