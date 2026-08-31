"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Muted } from "@/components/ui/typography";
import {
  GOAL_CATEGORIES,
  GOAL_STATUSES,
  monthFromIsoDate,
} from "@/lib/wealth/goals";
import type { ClientGoal, GoalStatus } from "@/lib/wealth/types";

export type GoalFormState = {
  category: string;
  name: string;
  targetUsd: string;
  currentUsd: string;
  targetMonth: string;
  isOngoing: boolean;
  probabilityPct: string;
  status: GoalStatus;
  advisorNote: string;
};

export const EMPTY_GOAL_FORM: GoalFormState = {
  category: "",
  name: "",
  targetUsd: "",
  currentUsd: "0",
  targetMonth: "",
  isOngoing: false,
  probabilityPct: "",
  status: "in-progress",
  advisorNote: "",
};

export function goalFormToPayload(values: GoalFormState) {
  return {
    name: values.name,
    category: values.category,
    targetUsd: values.targetUsd,
    currentUsd: values.currentUsd,
    targetMonth: values.targetMonth,
    isOngoing: values.isOngoing,
    probabilityPct: values.probabilityPct,
    status: values.status,
    advisorNote: values.advisorNote,
  };
}

export function goalFormFromClientGoal(goal: ClientGoal): GoalFormState {
  return {
    category: goal.category,
    name: goal.name,
    targetUsd: String(goal.target_usd),
    currentUsd: String(goal.current_usd),
    targetMonth: monthFromIsoDate(goal.target_date),
    isOngoing: goal.is_ongoing,
    probabilityPct: String(goal.probability_pct),
    status: goal.status,
    advisorNote: goal.advisor_note,
  };
}

type GoalFormFieldsProps = {
  idPrefix: string;
  values: GoalFormState;
  onChange: (next: GoalFormState) => void;
};

function GoalFormFields({ idPrefix, values, onChange }: GoalFormFieldsProps) {
  function patch(partial: Partial<GoalFormState>) {
    onChange({ ...values, ...partial });
  }

  return (
    <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 py-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${idPrefix}-category`}>Category</Label>
        <Select
          id={`${idPrefix}-category`}
          value={values.category}
          onChange={(event) => patch({ category: event.target.value })}
        >
          <option value="">Select category</option>
          {GOAL_CATEGORIES.map((item) => (
            <option key={item.label} value={item.label}>
              {item.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${idPrefix}-name`}>Goal name</Label>
        <Input
          id={`${idPrefix}-name`}
          value={values.name}
          onChange={(event) => patch({ name: event.target.value })}
          placeholder="e.g. Retirement at 60"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${idPrefix}-target`}>Target amount (USD)</Label>
          <Input
            id={`${idPrefix}-target`}
            type="number"
            min="0"
            step="0.01"
            value={values.targetUsd}
            onChange={(event) => patch({ targetUsd: event.target.value })}
            placeholder="5000000"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${idPrefix}-current`}>Current amount (USD)</Label>
          <Input
            id={`${idPrefix}-current`}
            type="number"
            min="0"
            step="0.01"
            value={values.currentUsd}
            onChange={(event) => patch({ currentUsd: event.target.value })}
            placeholder="0"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${idPrefix}-date`}>Target month</Label>
          <Input
            id={`${idPrefix}-date`}
            type="month"
            value={values.targetMonth}
            disabled={values.isOngoing}
            onChange={(event) => patch({ targetMonth: event.target.value })}
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={values.isOngoing}
            onChange={(event) =>
              patch({
                isOngoing: event.target.checked,
                targetMonth: event.target.checked ? "" : values.targetMonth,
              })
            }
          />
          Ongoing (no target month)
        </label>
        <Muted className="text-xs">
          This month and the amounts appear on the client Goals page.
        </Muted>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${idPrefix}-probability`}>Success probability (%)</Label>
          <Input
            id={`${idPrefix}-probability`}
            type="number"
            min="0"
            max="100"
            value={values.probabilityPct}
            onChange={(event) => patch({ probabilityPct: event.target.value })}
            placeholder="75"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${idPrefix}-status`}>Status</Label>
          <Select
            id={`${idPrefix}-status`}
            value={values.status}
            onChange={(event) => patch({ status: event.target.value as GoalStatus })}
          >
            {GOAL_STATUSES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${idPrefix}-note`}>Advisor note (visible to client)</Label>
        <Textarea
          id={`${idPrefix}-note`}
          rows={4}
          value={values.advisorNote}
          onChange={(event) => patch({ advisorNote: event.target.value })}
          placeholder="Write context or recommendations for this goal..."
        />
      </div>
    </div>
  );
}

export { GoalFormFields };
