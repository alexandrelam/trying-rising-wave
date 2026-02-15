import { useEffect, useRef, useState } from "react";

const BASE = import.meta.env.VITE_API_BASE ?? "/api";

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
  speciality_ids: number[];
}) {
  const res = await fetch(`${BASE}/practitioners`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function createSpeciality(data: { id: number; name: string }) {
  const res = await fetch(`${BASE}/specialities`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deletePractitioner(id: number) {
  const res = await fetch(`${BASE}/practitioners/${id}`, { method: "DELETE" });
  return res.json();
}

export async function deleteSpeciality(id: number) {
  const res = await fetch(`${BASE}/specialities/${id}`, { method: "DELETE" });
  return res.json();
}

export type EventLogEntry = {
  type: "INSERT" | "TOMBSTONE";
  topic: string;
  key: string;
  value: Record<string, unknown> | null;
  timestamp: string;
};

export type PipelineEvent = Record<
  string,
  { count: number; latest: Record<string, unknown>[] }
> & { event_log?: EventLogEntry[] };

export function subscribeEvents(callback: (data: PipelineEvent) => void) {
  const es = new EventSource(`${BASE}/events`);
  es.addEventListener("pipeline", (e) => {
    callback(JSON.parse(e.data));
  });
  return () => es.close();
}

export type SSEStatus = "connected" | "disconnected" | "loading";

export function useSSEConnection(callback: (data: PipelineEvent) => void) {
  const [status, setStatus] = useState<SSEStatus>("loading");
  const cbRef = useRef(callback);
  cbRef.current = callback;

  useEffect(() => {
    const es = new EventSource(`${BASE}/events`);

    es.addEventListener("pipeline", (e) => {
      cbRef.current(JSON.parse(e.data));
    });

    es.onopen = () => setStatus("connected");
    es.onerror = () => {
      setStatus(es.readyState === EventSource.CONNECTING ? "loading" : "disconnected");
    };

    return () => {
      es.close();
      setStatus("disconnected");
    };
  }, []);

  return status;
}
