import { type FormEvent, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createPractitioner, createSpeciality, deletePractitioner, deleteSpeciality } from "@/lib/api";
import { toast } from "sonner";

export function ProducerForms() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <PractitionerForm />
      <SpecialityForm />
      <TombstoneForm />
    </div>
  );
}

function PractitionerForm() {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [specialityIds, setSpecialityIds] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      const ids = specialityIds
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map(Number);
      await createPractitioner({ id: Number(id), name, email, speciality_ids: ids });
      toast.success(`Produced practitioner ${name}`);
      setId("");
      setName("");
      setEmail("");
      setSpecialityIds("");
    } catch {
      toast.error("Failed to produce practitioner");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Practitioner</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <Label htmlFor="p-id">ID</Label>
            <Input
              id="p-id"
              type="number"
              value={id}
              onChange={(e) => setId(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="p-name">Name</Label>
            <Input
              id="p-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="p-email">Email</Label>
            <Input
              id="p-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="p-sids">Speciality IDs (comma-separated)</Label>
            <Input
              id="p-sids"
              value={specialityIds}
              onChange={(e) => setSpecialityIds(e.target.value)}
              placeholder="1, 2, 3"
            />
          </div>
          <Button type="submit" className="w-full">
            Produce
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function TombstoneForm() {
  const [id, setId] = useState("");
  const [topic, setTopic] = useState<"practitioner" | "speciality">("practitioner");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      if (topic === "practitioner") {
        await deletePractitioner(Number(id));
        toast.success(`Tombstone produced for practitioner ${id}`);
      } else {
        await deleteSpeciality(Number(id));
        toast.success(`Tombstone produced for speciality ${id}`);
      }
      setId("");
    } catch {
      toast.error("Failed to produce tombstone");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Delete (Tombstone)</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={topic === "practitioner" ? "default" : "outline"}
              size="sm"
              onClick={() => setTopic("practitioner")}
            >
              Practitioner
            </Button>
            <Button
              type="button"
              variant={topic === "speciality" ? "default" : "outline"}
              size="sm"
              onClick={() => setTopic("speciality")}
            >
              Speciality
            </Button>
          </div>
          <div>
            <Label htmlFor="t-id">{topic === "practitioner" ? "Practitioner" : "Speciality"} ID</Label>
            <Input
              id="t-id"
              type="number"
              value={id}
              onChange={(e) => setId(e.target.value)}
              required
            />
          </div>
          <Button type="submit" variant="destructive" className="w-full">
            Delete (Tombstone)
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function SpecialityForm() {
  const [id, setId] = useState("");
  const [name, setName] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await createSpeciality({ id: Number(id), name });
      toast.success(`Produced speciality "${name}"`);
      setId("");
      setName("");
    } catch {
      toast.error("Failed to produce speciality");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Speciality</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <Label htmlFor="s-id">ID</Label>
            <Input
              id="s-id"
              type="number"
              value={id}
              onChange={(e) => setId(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="s-name">Name</Label>
            <Input
              id="s-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Produce
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
