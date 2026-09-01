"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { H3, Muted, TextSmall } from "@/components/ui/typography";
import type { DocumentRequest, VaultDocument } from "@/lib/wealth/wm-types";

export function ClientDocumentsTab({ clientId }: { clientId: string }) {
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  const load = useCallback(async () => {
    const res = await fetch(`/api/clients/${clientId}/documents`);
    const data = await res.json();
    setRequests(data.requests ?? []);
    setDocuments(data.documents ?? []);
    setLoading(false);
  }, [clientId]);

  useEffect(() => {
    load();
  }, [load]);

  async function createRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, title, description, dueDate: dueDate || null }),
    });
    setTitle("");
    setDescription("");
    setDueDate("");
    load();
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      <section>
        <H3 className="mb-3 text-base">Request documents</H3>
        <form onSubmit={createRequest} className="flex flex-col gap-3 rounded-xl border border-border p-4">
          <div>
            <Label htmlFor="doc-title">What to request</Label>
            <Input id="doc-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="doc-desc">Details</Label>
            <Textarea
              id="doc-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="doc-due">Due date</Label>
            <Input
              id="doc-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <Button type="submit" size="sm" className="w-fit">
            Send request
          </Button>
        </form>
      </section>

      <section>
        <H3 className="mb-3 text-base">Outstanding requests</H3>
        {requests.length === 0 ? (
          <Muted>No document requests.</Muted>
        ) : (
          <div className="flex flex-col gap-2">
            {requests.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-xl border border-border p-4">
                <div>
                  <TextSmall className="font-medium">{r.title}</TextSmall>
                  {r.due_date ? (
                    <Muted className="text-sm">
                      Due{" "}
                      {new Date(`${r.due_date}T12:00:00`).toLocaleDateString("en-GB")}
                    </Muted>
                  ) : null}
                </div>
                <Badge
                  variant={
                    r.status === "pending"
                      ? "destructive"
                      : r.status === "uploaded"
                        ? "secondary"
                        : "outline"
                  }
                >
                  {r.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <H3 className="mb-3 text-base">Uploaded documents</H3>
        {documents.length === 0 ? (
          <Muted>No documents on file.</Muted>
        ) : (
          <div className="flex flex-col gap-2">
            {documents.map((d) => (
              <div key={d.id} className="flex items-center justify-between rounded-xl border border-border p-4">
                <div>
                  <TextSmall className="font-medium">{d.title}</TextSmall>
                  <Muted className="text-sm">
                    {d.category} · {d.uploaded_by_role}
                  </Muted>
                </div>
                {d.expires_on ? (
                  <Badge variant="outline">
                    Expires{" "}
                    {new Date(`${d.expires_on}T12:00:00`).toLocaleDateString("en-GB")}
                  </Badge>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
