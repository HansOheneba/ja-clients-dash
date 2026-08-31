"use client";

import { useState } from "react";

import { EditGoalSheet } from "@/components/advisors/edit-goal-sheet";
import type { GoalFormState } from "@/components/advisors/goal-form-fields";
import { GoalCard } from "@/components/goals/goal-card";
import { clientGoalToGoal } from "@/lib/wealth/goals";
import type { ClientGoal } from "@/lib/wealth/types";

type AdvisorGoalCardProps = {
  goal: ClientGoal;
  formatValue: (usd: number, opts?: { compact?: boolean }) => string;
  onSave: (input: GoalFormState) => Promise<void>;
  onRemove: () => Promise<void>;
};

/** Advisor portal wrapper. Keeps advisor edit UI out of the client-safe GoalCard. */
function AdvisorGoalCard({
  goal,
  formatValue,
  onSave,
  onRemove,
}: AdvisorGoalCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [removing, setRemoving] = useState(false);

  async function handleSave(input: GoalFormState) {
    await onSave(input);
    setEditOpen(false);
  }

  async function handleRemove() {
    if (removing) return;
    const confirmed = window.confirm(
      `Remove "${goal.name}"? This also hides it from the client portal.`,
    );
    if (!confirmed) return;
    setRemoving(true);
    try {
      await onRemove();
    } finally {
      setRemoving(false);
    }
  }

  return (
    <>
      <GoalCard
        goal={clientGoalToGoal(goal)}
        variant="advisor"
        formatValue={formatValue}
        onEdit={() => setEditOpen(true)}
        onRemove={handleRemove}
      />
      <EditGoalSheet
        goal={goal}
        open={editOpen}
        onOpenChange={setEditOpen}
        hideTrigger
        onSave={handleSave}
      />
    </>
  );
}

export { AdvisorGoalCard };
