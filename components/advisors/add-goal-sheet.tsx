"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { GoalFormFields, EMPTY_GOAL_FORM, type GoalFormState } from "@/components/advisors/goal-form-fields";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type AddGoalSheetProps = {
  clientName: string;
  onCreate: (input: GoalFormState) => Promise<void>;
};

function AddGoalSheet({ clientName, onCreate }: AddGoalSheetProps) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<GoalFormState>(EMPTY_GOAL_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setSaving(true);
    setError(null);
    try {
      await onCreate(values);
      setValues(EMPTY_GOAL_FORM);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add goal");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setError(null);
          setValues(EMPTY_GOAL_FORM);
        }
      }}
    >
      <SheetTrigger render={<Button size="sm"><Plus className="size-4" />Add goal</Button>} />
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Add goal</SheetTitle>
          <SheetDescription>
            One goal for {clientName}. Save this, then add another if they have more.
          </SheetDescription>
        </SheetHeader>

        <GoalFormFields idPrefix="goal" values={values} onChange={setValues} />

        {error ? <p className="px-4 text-sm text-destructive">{error}</p> : null}

        <SheetFooter className="flex gap-2">
          <SheetClose render={<Button variant="outline" className="flex-1">Cancel</Button>} />
          <Button type="button" className="flex-1" onClick={submit} disabled={saving}>
            {saving ? "Saving..." : "Add goal"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export { AddGoalSheet };
