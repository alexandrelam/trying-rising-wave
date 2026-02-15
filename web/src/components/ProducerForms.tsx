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
import { createPractitioner, createSpeciality, deletePractitioner } from "@/lib/api";
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

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await createPractitioner({ id: Number(id), name, email });
      toast.success(`Produced practitioner ${name}`);
      setId("");
      setName("");
      setEmail("");
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

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await deletePractitioner(Number(id));
      toast.success(`Tombstone produced for practitioner ${id}`);
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
          <div>
            <Label htmlFor="t-id">Practitioner ID</Label>
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
  const [practitionerId, setPractitionerId] = useState("");
  const [speciality, setSpeciality] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await createSpeciality({
        practitioner_id: Number(practitionerId),
        speciality,
      });
      toast.success(`Produced speciality "${speciality}"`);
      setPractitionerId("");
      setSpeciality("");
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
            <Label htmlFor="s-pid">Practitioner ID</Label>
            <Input
              id="s-pid"
              type="number"
              value={practitionerId}
              onChange={(e) => setPractitionerId(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="s-spec">Speciality</Label>
            <Input
              id="s-spec"
              value={speciality}
              onChange={(e) => setSpeciality(e.target.value)}
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
