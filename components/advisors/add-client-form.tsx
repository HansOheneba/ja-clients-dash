"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { H1, Muted } from "@/components/ui/typography";
import { AddressFields } from "@/components/ui/address-fields";
import { normalizeCountryCode, normalizeRegionCode } from "@/lib/wealth/countries";
import { BUCKET_LABELS, ALL_BUCKETS, ESTATE_STATUS_OPTIONS } from "@/lib/wealth/constants";
import type { AdvisorListRow, PortfolioBucket } from "@/lib/wealth/types";
import { isValidPhoneNumber } from "react-phone-number-input";

function Section({
  step,
  title,
  description,
  children,
}: {
  step: number;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
      <div className="flex items-start gap-4 border-b border-border bg-muted/40 px-6 py-5">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-sidebar text-xs font-semibold text-sidebar-foreground">
          {step}
        </span>
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="flex flex-col gap-5 px-6 py-6">{children}</div>
    </div>
  );
}

function FieldGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-1.5">{children}</div>;
}

function FieldLabel({
  htmlFor,
  required,
  children,
}: {
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Label htmlFor={htmlFor} className="items-baseline">
      <span>{children}</span>
      <span
        className={
          required
            ? "text-xs font-normal text-foreground/70"
            : "text-xs font-normal text-muted-foreground"
        }
      >
        {required ? "Required" : "Optional"}
      </span>
    </Label>
  );
}

function FormRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>;
}

const EMPTY_BUCKETS = Object.fromEntries(
  ALL_BUCKETS.map((b) => [b, { previous: "", current: "" }]),
) as Record<PortfolioBucket, { previous: string; current: string }>;

export function AddClientForm({
  defaultAdvisorId = null,
}: {
  defaultAdvisorId?: string | null;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [buckets, setBuckets] = useState(EMPTY_BUCKETS);
  const [advisors, setAdvisors] = useState<AdvisorListRow[]>([]);

  useEffect(() => {
    fetch("/api/advisors")
      .then((res) => res.json())
      .then((data) => setAdvisors((data.advisors ?? []).filter((a: AdvisorListRow) => a.is_active)))
      .catch(() => undefined);
  }, []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    if (phone && !isValidPhoneNumber(phone)) {
      setError("Enter a valid phone number.");
      setPending(false);
      return;
    }

    const form = new FormData(event.currentTarget);

    const payload = {
      fullName: String(form.get("fullName") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      phone: phone.trim(),
      currency: String(form.get("currency") ?? "USD"),
      inceptionDate: String(form.get("inceptionDate") ?? "") || undefined,
      status: "onboarding",
      riskProfile: String(form.get("riskProfile") ?? "") || undefined,
      investmentHorizon: String(form.get("investmentHorizon") ?? "") || undefined,
      primaryObjective: String(form.get("primaryObjective") ?? "") || undefined,
      dateOfBirth: String(form.get("dateOfBirth") ?? "") || undefined,
      maritalStatus: String(form.get("maritalStatus") ?? "") || undefined,
      dependents: Number(form.get("dependents") ?? 0),
      estateStatus: String(form.get("estateStatus") ?? "") || undefined,
      advisorId: String(form.get("advisorId") ?? "") || undefined,
      reviewCadence: String(form.get("reviewCadence") ?? "") || undefined,
      advisorNotes: String(form.get("advisorNotes") ?? "") || undefined,
      sendInvite: true,
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
      buckets: Object.fromEntries(
        ALL_BUCKETS.map((bucket) => [
          bucket,
          {
            previous: Number(buckets[bucket].previous || buckets[bucket].current || 0),
            current: Number(buckets[bucket].current || 0),
          },
        ]),
      ),
    };

    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not create client");
      const inviteQuery = data.inviteError
        ? `inviteError=${encodeURIComponent(data.inviteError)}`
        : "invited=1";
      router.push(
        `/advisors/dashboard/clients/${data.client.id}?tab=Goals&${inviteQuery}`,
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create client");
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-8 sm:px-6">
      <Link
        href="/advisors/dashboard/clients"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        All clients
      </Link>

      <div className="flex flex-col gap-1">
        <H1>Add new client</H1>
        <Muted>
          Required fields cover the portal invite and the statement PDF. A client reference is
          assigned automatically. Household and mandate details can be filled in later on the
          client record.
        </Muted>
      </div>

      <div className="flex flex-col gap-6">
        <Section
          step={1}
          title="Personal details"
          description="Name, email, and statement address are printed on the wealth report. Email is also used for the portal invite."
        >
          <FieldGroup>
            <FieldLabel htmlFor="fullName" required>
              Full name
            </FieldLabel>
            <Input id="fullName" name="fullName" required placeholder="John Doe" />
          </FieldGroup>
          <FormRow>
            <FieldGroup>
              <FieldLabel htmlFor="email" required>
                Email address
              </FieldLabel>
              <Input id="email" name="email" type="email" required placeholder="john.doe@email.com" />
            </FieldGroup>
            <FieldGroup>
              <FieldLabel htmlFor="phone">Phone</FieldLabel>
              <PhoneInput
                id="phone"
                value={phone}
                onChange={setPhone}
                placeholder="555 010 1234"
              />
            </FieldGroup>
          </FormRow>
          <AddressFields required showHints />
          <FormRow>
            <FieldGroup>
              <FieldLabel htmlFor="dateOfBirth">Date of birth</FieldLabel>
              <Input id="dateOfBirth" name="dateOfBirth" type="date" />
            </FieldGroup>
            <FieldGroup>
              <FieldLabel htmlFor="maritalStatus">Marital status</FieldLabel>
              <Select id="maritalStatus" name="maritalStatus">
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
              <FieldLabel htmlFor="dependents">Dependents</FieldLabel>
              <Input id="dependents" name="dependents" type="number" min="0" defaultValue={0} />
              <Muted className="text-xs">Number of people this client supports financially.</Muted>
            </FieldGroup>
            <FieldGroup>
              <FieldLabel htmlFor="estateStatus">Estate planning</FieldLabel>
              <Select id="estateStatus" name="estateStatus">
                <option value="">Not recorded yet</option>
                {ESTATE_STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
              <Muted className="text-xs">
                Whether they already have a will, a trust, both, or neither. This stays on their
                profile. It does not appear on the wealth report.
              </Muted>
            </FieldGroup>
          </FormRow>
        </Section>

        <Section
          step={2}
          title="Investment profile"
          description="Currency appears on the PDF. Client and statement references are assigned automatically. Risk and horizon stay on the client profile. Add named goals with amounts and dates on the Goals tab after you create the record."
        >
          <FormRow>
            <FieldGroup>
              <FieldLabel htmlFor="currency" required>
                Reference currency
              </FieldLabel>
              <Select id="currency" name="currency" defaultValue="USD" required>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
                <option value="EUR">EUR</option>
              </Select>
            </FieldGroup>
            <FieldGroup>
              <FieldLabel htmlFor="inceptionDate">Inception date</FieldLabel>
              <Input id="inceptionDate" name="inceptionDate" type="date" />
              <Muted className="text-xs">When this client started with JA. Shown on their profile.</Muted>
            </FieldGroup>
          </FormRow>
          <FormRow>
            <FieldGroup>
              <FieldLabel htmlFor="riskProfile">Risk profile</FieldLabel>
              <Select id="riskProfile" name="riskProfile">
                <option value="">Select profile</option>
                <option>Conservative</option>
                <option>Moderate</option>
                <option>Balanced</option>
                <option>Growth</option>
                <option>Aggressive</option>
              </Select>
            </FieldGroup>
            <FieldGroup>
              <FieldLabel htmlFor="investmentHorizon">Investment horizon</FieldLabel>
              <Select id="investmentHorizon" name="investmentHorizon">
                <option value="">Select horizon</option>
                <option>1-3 years (Short term)</option>
                <option>3-7 years (Medium term)</option>
                <option>7-15 years (Long term)</option>
                <option>15+ years (Generational)</option>
              </Select>
            </FieldGroup>
            <FieldGroup>
              <FieldLabel htmlFor="reviewCadence">Review cadence</FieldLabel>
              <Select id="reviewCadence" name="reviewCadence" defaultValue="quarterly">
                <option value="quarterly">Quarterly</option>
                <option value="semi_annual">Semi-annual</option>
                <option value="annual">Annual</option>
              </Select>
            </FieldGroup>
          </FormRow>
          <FieldGroup>
            <FieldLabel htmlFor="advisorId">Assigned wealth manager</FieldLabel>
            <Select
              id="advisorId"
              name="advisorId"
              defaultValue={defaultAdvisorId ?? ""}
            >
              <option value="">Unassigned</option>
              {defaultAdvisorId &&
              !advisors.some((advisor) => advisor.id === defaultAdvisorId) ? (
                <option value={defaultAdvisorId}>You</option>
              ) : null}
              {advisors.map((advisor) => (
                <option key={advisor.id} value={advisor.id}>
                  {advisor.full_name}
                </option>
              ))}
            </Select>
            <Muted className="text-xs">Named on the PDF. Defaults to you.</Muted>
          </FieldGroup>
          <FieldGroup>
            <FieldLabel htmlFor="primaryObjective">Primary investment objective</FieldLabel>
            <Select id="primaryObjective" name="primaryObjective">
              <option value="">Select objective</option>
              <option>Capital preservation</option>
              <option>Income generation</option>
              <option>Capital growth</option>
              <option>Wealth transfer and legacy</option>
            </Select>
          </FieldGroup>
        </Section>

        <Section
          step={3}
          title="Initial portfolio values"
          description="These become the first month on the statement and the first PDF figures. Leave at 0 if you will enter them on Statement data."
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {ALL_BUCKETS.map((bucket) => (
              <FieldGroup key={bucket}>
                <FieldLabel htmlFor={`bucket-${bucket}`}>{BUCKET_LABELS[bucket]} (current)</FieldLabel>
                <Input
                  id={`bucket-${bucket}`}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0"
                  value={buckets[bucket].current}
                  onChange={(e) =>
                    setBuckets((prev) => ({
                      ...prev,
                      [bucket]: { ...prev[bucket], current: e.target.value },
                    }))
                  }
                />
              </FieldGroup>
            ))}
          </div>
        </Section>

        <Section
          step={4}
          title="Internal notes"
          description="Private to the advisory team. The client is invited to the portal as soon as you create the record."
        >
          <FieldGroup>
            <FieldLabel htmlFor="advisorNotes">Advisor notes (private)</FieldLabel>
            <Textarea
              id="advisorNotes"
              name="advisorNotes"
              rows={4}
              placeholder="Background, referral source, preferences..."
            />
          </FieldGroup>
        </Section>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/advisors/dashboard/clients"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Cancel
          </Link>
          <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            {pending ? "Creating and sending invite..." : "Create client"}
          </Button>
        </div>
      </div>
    </form>
  );
}
