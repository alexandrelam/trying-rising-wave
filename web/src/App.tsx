import { Toaster } from "@/components/ui/sonner";
import { Separator } from "@/components/ui/separator";
import { PipelineControls } from "./components/PipelineControls";
import { ProducerForms } from "./components/ProducerForms";
import { PipelineView } from "./components/PipelineView";

function App() {
  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6">
      <PipelineControls />
      <Separator />
      <ProducerForms />
      <Separator />
      <PipelineView />
      <Toaster />
    </div>
  );
}

export default App;
