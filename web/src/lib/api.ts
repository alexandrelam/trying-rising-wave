const BASE = "http://localhost:8000/api";

export async function setupPipeline() {
  const res = await fetch(`${BASE}/pipeline/setup`, { method: "POST" });
  return res.json();
}

export async function resetPipeline() {
  const res = await fetch(`${BASE}/pipeline/reset`, { method: "POST" });
  return res.json();
}

export async function seedPipeline() {
  const res = await fetch(`${BASE}/pipeline/seed`, { method: "POST" });
  return res.json();
}

export async function getPipelineStatus() {
  const res = await fetch(`${BASE}/pipeline/status`);
  return res.json();
}

export async function createPractitioner(data: {
  id: number;
  name: string;
  email: string;
}) {
  const res = await fetch(`${BASE}/practitioners`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function createSpeciality(data: {
  practitioner_id: number;
  speciality: string;
}) {
  const res = await fetch(`${BASE}/specialities`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export type PipelineEvent = Record<
  string,
  { count: number; latest: Record<string, unknown>[] }
>;

export function subscribeEvents(callback: (data: PipelineEvent) => void) {
  const es = new EventSource(`${BASE}/events`);
  es.addEventListener("pipeline", (e) => {
    callback(JSON.parse(e.data));
  });
  return () => es.close();
}
