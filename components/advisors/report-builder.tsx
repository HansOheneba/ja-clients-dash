"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Muted, TextSmall } from "@/components/ui/typography";
import { REPORT_TEMPLATES, type ReportSectionKey } from "@/lib/wealth/wm-types";

const SECTION_LABELS: Record<ReportSectionKey, string> = {
  executive_summary: "Executive summary",
  portfolio_overview: "Portfolio overview",
  performance: "Performance",
  transactions: "Transactions",
};

export function ReportBuilder({
  clientOptions,
}: {
  clientOptions: { id: string; name: string }[];
}) {
  const [templateKey, setTemplateKey] = useState("standard_monthly");
  const [sections, setSections] = useState<ReportSectionKey[]>(
    REPORT_TEMPLATES.standard_monthly.sections,
  );
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  function applyTemplate(key: string) {
    setTemplateKey(key);
    const template = REPORT_TEMPLATES[key];
    if (template) setSections([...template.sections]);
  }

  function toggleSection(key: ReportSectionKey) {
    setSections((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key],
    );
  }

  async function runBatch() {
    setLoading(true);
    setResult(null);
    const clientIds =
      selectedClients.size > 0 ? [...selectedClients] : clientOptions.map((c) => c.id);
    const res = await fetch("/api/reports/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientIds, templateKey, sections }),
    });
    const data = await res.json();
    const ok = (data.results ?? []).filter((r: { ok: boolean }) => r.ok).length;
    const fail = (data.results ?? []).length - ok;
    setResult(`Generated ${ok} reports${fail > 0 ? `, ${fail} failed` : ""}.`);
    setLoading(false);
    window.dispatchEvent(new CustomEvent("ja:report-generated"));
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <TextSmall className="font-semibold">Report builder</TextSmall>
      <Muted className="mb-4 text-sm">
        Choose a template, sections, and clients for batch generation.
      </Muted>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="template">Template</Label>
          <Select
            id="template"
            value={templateKey}
            onChange={(e) => applyTemplate(e.target.value)}
          >
            {Object.entries(REPORT_TEMPLATES).map(([key, t]) => (
              <option key={key} value={key}>
                {t.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="mt-4">
        <Label>Sections to include</Label>
        <div className="mt-2 flex flex-wrap gap-3">
          {(Object.keys(SECTION_LABELS) as ReportSectionKey[]).map((key) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={sections.includes(key)}
                onChange={() => toggleSection(key)}
                className="size-4 rounded border-border"
              />
              {SECTION_LABELS[key]}
            </label>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <Label>Clients (leave empty for all active)</Label>
        <div className="mt-2 max-h-40 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
          {clientOptions.map((c) => (
            <label key={c.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selectedClients.has(c.id)}
                onChange={(e) => {
                  const next = new Set(selectedClients);
                  if (e.target.checked) next.add(c.id);
                  else next.delete(c.id);
                  setSelectedClients(next);
                }}
                className="size-4 rounded border-border"
              />
              {c.name}
            </label>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Button size="sm" disabled={loading} onClick={runBatch}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : null}
          Run month-end batch
        </Button>
        {result ? <Muted className="text-sm">{result}</Muted> : null}
      </div>
    </div>
  );
}
