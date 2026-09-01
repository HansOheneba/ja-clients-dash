"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { H3 } from "@/components/ui/typography";

export function SessionRecapForm({
  sessionTitle,
  onSave,
  onCancel,
}: {
  sessionTitle: string;
  onSave: (recap: {
    topics: string[];
    decisions: string[];
    actionItems: string[];
    nextSteps: string[];
  }) => Promise<void>;
  onCancel: () => void;
}) {
  const [recap, setRecap] = useState({
    topics: "",
    decisions: "",
    actionItems: "",
    nextSteps: "",
  });
  const [saving, setSaving] = useState(false);

  async function submit() {
    setSaving(true);
    try {
      await onSave({
        topics: recap.topics.split("\n").filter(Boolean),
        decisions: recap.decisions.split("\n").filter(Boolean),
        actionItems: recap.actionItems.split("\n").filter(Boolean),
        nextSteps: recap.nextSteps.split("\n").filter(Boolean),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-muted/20 p-4">
      <H3 className="mb-1 text-base">Log session recap</H3>
      <p className="mb-3 text-sm text-muted-foreground">{sessionTitle}</p>
      <div className="grid gap-3">
        <div>
          <Label>Topics (one per line)</Label>
          <Textarea
            value={recap.topics}
            onChange={(e) => setRecap((current) => ({ ...current, topics: e.target.value }))}
          />
        </div>
        <div>
          <Label>Decisions</Label>
          <Textarea
            value={recap.decisions}
            onChange={(e) => setRecap((current) => ({ ...current, decisions: e.target.value }))}
          />
        </div>
        <div>
          <Label>Action items</Label>
          <Textarea
            value={recap.actionItems}
            onChange={(e) => setRecap((current) => ({ ...current, actionItems: e.target.value }))}
          />
        </div>
        <div>
          <Label>Next steps</Label>
          <Textarea
            value={recap.nextSteps}
            onChange={(e) => setRecap((current) => ({ ...current, nextSteps: e.target.value }))}
          />
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <Button size="sm" disabled={saving} onClick={() => void submit()}>
          Save recap
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
