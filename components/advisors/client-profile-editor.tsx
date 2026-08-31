"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DashCard,
  DashCardContent,
  DashCardDescription,
  DashCardHeader,
  DashCardTitle,
} from "@/components/ui/dash-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AddressFields } from "@/components/ui/address-fields";
import { ESTATE_STATUS_OPTIONS } from "@/lib/wealth/constants";
import { normalizeCountryCode, normalizeRegionCode } from "@/lib/wealth/countries";
import type { AdvisorListRow, ClientAddress, WealthClient } from "@/lib/wealth/types";

function FieldGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-1.5">{children}</div>;
}

function FormRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>;
}

export function ClientProfileEditor({
  client,
  address,
  advisors,
  onSaved,
}: {
  client: WealthClient;
  address: ClientAddress | null;
  advisors: AdvisorListRow[];
  onSaved: () => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setNotice(null);
    const form = new FormData(event.currentTarget);

    const payload: Record<string, unknown> = {
      fullName: String(form.get("fullName") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      phone: String(form.get("phone") ?? "").trim(),
      currency: String(form.get("currency") ?? "USD"),
      inceptionDate: String(form.get("inceptionDate") ?? "") || undefined,
      status: String(form.get("status") ?? client.status),
      riskProfile: String(form.get("riskProfile") ?? "") || undefined,
      investmentHorizon: String(form.get("investmentHorizon") ?? "") || undefined,
      primaryObjective: String(form.get("primaryObjective") ?? "") || undefined,
      dateOfBirth: String(form.get("dateOfBirth") ?? "") || undefined,
      maritalStatus: String(form.get("maritalStatus") ?? "") || undefined,
      dependents: Number(form.get("dependents") ?? 0),
      estateStatus: String(form.get("estateStatus") ?? "") || undefined,
      financialGoals: String(form.get("financialGoals") ?? "") || undefined,
      advisorId: String(form.get("advisorId") ?? "") || null,
      address: {
        line1: String(form.get("line1") ?? "").trim(),
        line2: String(form.get("line2") ?? "").trim() || null,
        city: String(form.get("city") ?? "").trim(),
        region:
          normalizeRegionCode(
            String(form.get("country") ?? "US"),
            String(form.get("region") ?? ""),
          ) || null,
        postal_code: String(form.get("postalCode") ?? "").trim(),
        country: normalizeCountryCode(String(form.get("country") ?? "US")),
      },
    };

    try {
      const res = await fetch(`/api/clients/${client.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not save client");
      setNotice("Profile saved.");
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save client");
    } finally {
      setPending(false);
    }
  }

  const activeAdvisors = advisors.filter((a) => a.is_active || a.id === client.advisor_id);

  return (
    <form onSubmit={onSubmit} className="flex max-w-3xl flex-col gap-6 pb-12">
      <DashCard>
        <DashCardHeader>
          <div>
            <DashCardTitle>Personal details</DashCardTitle>
            <DashCardDescription>
              Identity, household, and statement address. Clients see this as read-only.
            </DashCardDescription>
          </div>
        </DashCardHeader>
        <DashCardContent className="gap-5">
          <FieldGroup>
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" name="fullName" defaultValue={client.full_name} required />
          </FieldGroup>
          <FormRow>
            <FieldGroup>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={client.email}
                required
              />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" type="tel" defaultValue={client.phone ?? ""} />
            </FieldGroup>
          </FormRow>
          <FormRow>
            <FieldGroup>
              <Label htmlFor="dateOfBirth">Date of birth</Label>
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                defaultValue={client.date_of_birth ?? ""}
              />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="maritalStatus">Marital status</Label>
              <Select
                id="maritalStatus"
                name="maritalStatus"
                defaultValue={client.marital_status ?? ""}
              >
                <option value="">Select</option>
                <option>Single</option>
                <option>Married</option>
                <option>Civil partnership</option>
                <option>Divorced</option>
                <option>Widowed</option>
              </Select>
            </FieldGroup>
          </FormRow>
          <FormRow>
            <FieldGroup>
              <Label htmlFor="dependents">Dependents</Label>
              <Input
                id="dependents"
                name="dependents"
                type="number"
                min="0"
                defaultValue={client.dependents}
              />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="estateStatus">Estate planning</Label>
              <Select
                id="estateStatus"
                name="estateStatus"
                defaultValue={client.estate_status ?? ""}
              >
                <option value="">Not recorded yet</option>
                {client.estate_status &&
                !ESTATE_STATUS_OPTIONS.includes(
                  client.estate_status as (typeof ESTATE_STATUS_OPTIONS)[number],
                ) ? (
                  <option value={client.estate_status}>{client.estate_status}</option>
                ) : null}
                {ESTATE_STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
              <p className="text-xs text-muted-foreground">
                Whether they already have a will, a trust, both, or neither. Not used on the
                investment report.
              </p>
            </FieldGroup>
          </FormRow>
          <AddressFields
            defaultCountry={address?.country}
            defaultRegion={address?.region}
            defaultLine1={address?.line1}
            defaultLine2={address?.line2}
            defaultCity={address?.city}
            defaultPostalCode={address?.postal_code}
          />
        </DashCardContent>
      </DashCard>

      <DashCard>
        <DashCardHeader>
          <div>
            <DashCardTitle>Investment profile</DashCardTitle>
            <DashCardDescription>Used on statements and in the client portal.</DashCardDescription>
          </div>
        </DashCardHeader>
        <DashCardContent className="gap-5">
          <FormRow>
            <FieldGroup>
              <Label htmlFor="status">Status</Label>
              <Select id="status" name="status" defaultValue={client.status}>
                <option value="onboarding">Onboarding</option>
                <option value="active">Active</option>
                <option value="review_due">Review due</option>
                <option value="inactive">Inactive</option>
              </Select>
            </FieldGroup>
            <FieldGroup>
              <Label>Client reference</Label>
              <p className="flex h-8 items-center text-sm font-medium">{client.client_number}</p>
              <p className="text-xs text-muted-foreground">
                Assigned on create. Statement PDFs use this plus the month or quarter.
              </p>
            </FieldGroup>
          </FormRow>
          <FormRow>
            <FieldGroup>
              <Label htmlFor="currency">Reference currency</Label>
              <Select id="currency" name="currency" defaultValue={client.currency}>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
                <option value="EUR">EUR</option>
              </Select>
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="inceptionDate">Inception date</Label>
              <Input
                id="inceptionDate"
                name="inceptionDate"
                type="date"
                defaultValue={client.inception_date ?? ""}
              />
            </FieldGroup>
          </FormRow>
          <FormRow>
            <FieldGroup>
              <Label htmlFor="riskProfile">Risk profile</Label>
              <Select
                id="riskProfile"
                name="riskProfile"
                defaultValue={client.risk_profile ?? ""}
              >
                <option value="">Select profile</option>
                <option>Conservative</option>
                <option>Moderate</option>
                <option>Balanced</option>
                <option>Growth</option>
                <option>Aggressive</option>
              </Select>
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="investmentHorizon">Investment horizon</Label>
              <Select
                id="investmentHorizon"
                name="investmentHorizon"
                defaultValue={client.investment_horizon ?? ""}
              >
                <option value="">Select horizon</option>
                <option>1-3 years (Short term)</option>
                <option>3-7 years (Medium term)</option>
                <option>7-15 years (Long term)</option>
                <option>15+ years (Generational)</option>
              </Select>
            </FieldGroup>
          </FormRow>
          <FieldGroup>
            <Label htmlFor="primaryObjective">Primary investment objective</Label>
            <Select
              id="primaryObjective"
              name="primaryObjective"
              defaultValue={client.primary_objective ?? ""}
            >
              <option value="">Select objective</option>
              <option>Capital preservation</option>
              <option>Income generation</option>
              <option>Capital growth</option>
              <option>Wealth transfer and legacy</option>
            </Select>
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="financialGoals">Planning notes</Label>
            <Textarea
              id="financialGoals"
              name="financialGoals"
              rows={3}
              defaultValue={client.financial_goals ?? ""}
              placeholder="Anything about their objectives that is not a numbered goal..."
            />
            <p className="text-xs text-muted-foreground">
              Optional profile note. Named goals with amounts and dates are on the Goals tab.
            </p>
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="advisorId">Assigned wealth manager</Label>
            <Select
              id="advisorId"
              name="advisorId"
              defaultValue={client.advisor_id ?? ""}
            >
              <option value="">Unassigned</option>
              {client.advisor_id &&
              !activeAdvisors.some((advisor) => advisor.id === client.advisor_id) ? (
                <option value={client.advisor_id}>Current advisor</option>
              ) : null}
              {activeAdvisors.map((advisor) => (
                <option key={advisor.id} value={advisor.id}>
                  {advisor.full_name}
                  {advisor.is_active ? "" : " (inactive)"}
                </option>
              ))}
            </Select>
          </FieldGroup>
        </DashCardContent>
      </DashCard>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {notice ? <p className="text-sm text-muted-foreground">{notice}</p> : null}

      <Button type="submit" className="w-fit" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : null}
        {pending ? "Saving..." : "Save profile"}
      </Button>
    </form>
  );
}
