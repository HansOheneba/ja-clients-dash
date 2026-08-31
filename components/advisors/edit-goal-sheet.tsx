"use client";

import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";

import {
  GoalFormFields,
  goalFormFromClientGoal,
  type GoalFormState,
} from "@/components/advisors/goal-form-fields";
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
import type { ClientGoal } from "@/lib/wealth/types";

type EditGoalSheetProps = {
  goal: ClientGoal;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
  onSave: (input: GoalFormState) => Promise<void>;
};

function EditGoalSheet({
  goal,
  open,
  onOpenChange,
  hideTrigger,
  onSave,
}: EditGoalSheetProps) {
  const [values, setValues] = useState<GoalFormState>(() => goalFormFromClientGoal(goal));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setValues(goalFormFromClientGoal(goal));
    setError(null);
  }, [goal]);

  async function submit() {
    setSaving(true);
    setError(null);
    try {
      await onSave(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save goal");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {!hideTrigger && (
        <SheetTrigger
          render={
            <Button variant="outline" size="sm">
              <Pencil className="size-4" />
              Edit
            </Button>
          }
        />
      )}
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Edit goal</SheetTitle>
          <SheetDescription>Update the details for &ldquo;{goal.name}&rdquo;.</SheetDescription>
        </SheetHeader>

        <GoalFormFields idPrefix="eg" values={values} onChange={setValues} />

        {error ? <p className="px-4 text-sm text-destructive">{error}</p> : null}

        <SheetFooter className="flex gap-2">
          <SheetClose render={<Button variant="outline" className="flex-1">Cancel</Button>} />
          <Button type="button" className="flex-1" onClick={submit} disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export { EditGoalSheet };
