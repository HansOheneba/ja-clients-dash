"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, FileText, Loader2, Paperclip, Upload } from "lucide-react";

import { ComplianceAuditPanel } from "@/components/advisors/compliance-audit-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { H3, Muted, TextSmall } from "@/components/ui/typography";
import type { ClientAdvisorNote, ClientInternalDocument } from "@/lib/wealth/wm-types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatFileSize(bytes: number | null) {
  if (bytes == null) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ClientNotesWorkspace({ clientId }: { clientId: string }) {
  const [notes, setNotes] = useState<ClientAdvisorNote[]>([]);
  const [documents, setDocuments] = useState<ClientInternalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [selectedAttachmentIds, setSelectedAttachmentIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const [notesRes, docsRes] = await Promise.all([
      fetch(`/api/clients/${clientId}/notes`),
      fetch(`/api/clients/${clientId}/internal-documents`),
    ]);
    const notesData = await notesRes.json();
    const docsData = await docsRes.json();
    setNotes(notesData.notes ?? []);
    setDocuments(docsData.documents ?? []);
    setLoading(false);
  }, [clientId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveNote() {
    const text = body.trim();
    if (!text) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/clients/${clientId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text, attachmentIds: selectedAttachmentIds }),
      });
      if (!res.ok) return;
      setBody("");
      setSelectedAttachmentIds([]);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function uploadDocument(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", uploadTitle.trim() || file.name);
      const res = await fetch(`/api/clients/${clientId}/internal-documents`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) return;
      setUploadTitle("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      await load();
    } finally {
      setUploading(false);
    }
  }

  async function downloadDocument(docId: string) {
    const res = await fetch(
      `/api/clients/${clientId}/internal-documents/${docId}/download`,
    );
    const data = await res.json();
    if (data.url) window.open(data.url, "_blank", "noopener,noreferrer");
  }

  function toggleAttachment(id: string) {
    setSelectedAttachmentIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex max-w-3xl flex-col gap-8 pb-12">
      <section className="flex flex-col gap-4">
        <div>
          <H3 className="text-base">Handover journal</H3>
          <Muted className="text-sm">
            Timestamped notes for the team. These stay on the client file across reassignments.
          </Muted>
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-border p-4">
          <Textarea
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Add context for the next wealth manager..."
          />
          {documents.length > 0 ? (
            <div className="flex flex-col gap-2">
              <TextSmall className="font-medium">Attach internal files</TextSmall>
              <div className="flex flex-wrap gap-2">
                {documents.map((doc) => {
                  const selected = selectedAttachmentIds.includes(doc.id);
                  return (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => toggleAttachment(doc.id)}
                      className={
                        selected
                          ? "inline-flex items-center gap-1.5 rounded-full border border-brand-primary bg-brand-primary/10 px-3 py-1 text-xs font-medium text-brand-primary"
                          : "inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:border-brand-primary/40"
                      }
                    >
                      <Paperclip className="size-3" aria-hidden />
                      {doc.title}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
          <Button className="w-fit" onClick={() => void saveNote()} disabled={saving || !body.trim()}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : null}
            Add note
          </Button>
        </div>

        {notes.length === 0 ? (
          <Muted className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm">
            No handover notes yet. Add context that will help the next wealth manager work with this
            client.
          </Muted>
        ) : (
          <div className="flex flex-col gap-3">
            {notes.map((note) => (
              <article
                key={note.id}
                className="flex flex-col gap-2 rounded-xl border border-border/70 bg-card px-4 py-3"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <TextSmall className="font-semibold">{note.author_name}</TextSmall>
                  <Muted className="text-xs">{formatDate(note.created_at)}</Muted>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                  {note.body}
                </p>
                {note.attachments.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {note.attachments.map((doc) => (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => void downloadDocument(doc.id)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <FileText className="size-3" aria-hidden />
                        {doc.title}
                      </button>
                    ))}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <div>
          <H3 className="text-base">Internal archive</H3>
          <Muted className="text-sm">
            Advisor-only files on this client file. Not shared with the client portal.
          </Muted>
        </div>

        <form
          className="flex flex-col gap-3 rounded-xl border border-border p-4"
          onSubmit={(e) => {
            e.preventDefault();
            const file = fileInputRef.current?.files?.[0];
            if (file) void uploadDocument(file);
          }}
        >
          <div>
            <Label htmlFor="internal-doc-title">Title</Label>
            <Input
              id="internal-doc-title"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              placeholder="Handover summary, compliance memo..."
            />
          </div>
          <div>
            <Label htmlFor="internal-doc-file">File</Label>
            <Input
              id="internal-doc-file"
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.csv,.xlsx"
            />
          </div>
          <Button type="submit" variant="outline" className="w-fit" disabled={uploading}>
            {uploading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Upload className="size-4" />
            )}
            Upload to archive
          </Button>
        </form>

        {documents.length === 0 ? (
          <Muted className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm">
            No internal files yet. Upload documents to build a handover archive.
          </Muted>
        ) : (
          <ul className="flex flex-col gap-2">
            {documents.map((doc) => (
              <li
                key={doc.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border/70 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <TextSmall className="font-medium">{doc.title}</TextSmall>
                  <Muted className="text-xs">
                    {doc.uploader_name} · {formatDate(doc.created_at)}
                    {doc.file_size_bytes ? ` · ${formatFileSize(doc.file_size_bytes)}` : ""}
                  </Muted>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => void downloadDocument(doc.id)}
                  aria-label={`Download ${doc.title}`}
                >
                  <Download className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <TextSmall className="font-semibold">Audit trail</TextSmall>
        <ComplianceAuditPanel clientId={clientId} />
      </section>
    </div>
  );
}
