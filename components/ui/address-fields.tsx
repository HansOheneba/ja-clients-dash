"use client";

import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  COUNTRY_OPTIONS,
  getRegionsForCountry,
  normalizeCountryCode,
  normalizeRegionCode,
} from "@/lib/wealth/countries";

function FieldGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-1.5">{children}</div>;
}

function FormRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>;
}

function FieldLabel({
  htmlFor,
  required,
  showHints,
  children,
}: {
  htmlFor: string;
  required?: boolean;
  showHints?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Label htmlFor={htmlFor} className="items-baseline">
      <span>{children}</span>
      {showHints ? (
        <span
          className={
            required
              ? "text-xs font-normal text-foreground/70"
              : "text-xs font-normal text-muted-foreground"
          }
        >
          {required ? "Required" : "Optional"}
        </span>
      ) : null}
    </Label>
  );
}

type AddressFieldsProps = {
  required?: boolean;
  showHints?: boolean;
  defaultCountry?: string | null;
  defaultRegion?: string | null;
  defaultLine1?: string | null;
  defaultLine2?: string | null;
  defaultCity?: string | null;
  defaultPostalCode?: string | null;
};

function AddressFields({
  required = false,
  showHints = false,
  defaultCountry = "US",
  defaultRegion = "",
  defaultLine1 = "",
  defaultLine2 = "",
  defaultCity = "",
  defaultPostalCode = "",
}: AddressFieldsProps) {
  const [country, setCountry] = useState(() => normalizeCountryCode(defaultCountry));
  const [region, setRegion] = useState(() =>
    normalizeRegionCode(normalizeCountryCode(defaultCountry), defaultRegion),
  );

  const regions = useMemo(() => getRegionsForCountry(country), [country]);
  const regionKnown = regions.some((item) => item.code === region);

  return (
    <div className="flex flex-col gap-5">
      <FormRow>
        <FieldGroup>
          <FieldLabel htmlFor="country" required={required} showHints={showHints}>
            Country
          </FieldLabel>
          <Select
            id="country"
            name="country"
            required={required}
            value={country}
            autoComplete="country"
            onChange={(event) => {
              const next = event.target.value;
              setCountry(next);
              setRegion("");
            }}
          >
            {COUNTRY_OPTIONS.map((item) => (
              <option key={item.code} value={item.code}>
                {item.name}
              </option>
            ))}
          </Select>
        </FieldGroup>
        <FieldGroup>
          <FieldLabel htmlFor="region" showHints={showHints}>
            State / region
          </FieldLabel>
          {regions.length > 0 ? (
            <Select
              id="region"
              name="region"
              value={regionKnown ? region : ""}
              autoComplete="address-level1"
              onChange={(event) => setRegion(event.target.value)}
            >
              <option value="">Select state / region</option>
              {!regionKnown && region ? (
                <option value={region}>{region}</option>
              ) : null}
              {regions.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.name}
                </option>
              ))}
            </Select>
          ) : (
            <Input
              id="region"
              name="region"
              value={region}
              onChange={(event) => setRegion(event.target.value)}
              placeholder="If applicable"
              autoComplete="address-level1"
            />
          )}
        </FieldGroup>
      </FormRow>

      <FieldGroup>
        <FieldLabel htmlFor="line1" required={required} showHints={showHints}>
          Address line 1
        </FieldLabel>
        <Input
          id="line1"
          name="line1"
          required={required}
          defaultValue={defaultLine1 ?? ""}
          placeholder="Street address"
          autoComplete="address-line1"
        />
      </FieldGroup>
      <FieldGroup>
        <FieldLabel htmlFor="line2" showHints={showHints}>
          Address line 2
        </FieldLabel>
        <Input
          id="line2"
          name="line2"
          defaultValue={defaultLine2 ?? ""}
          placeholder="Apartment, suite, or floor"
          autoComplete="address-line2"
        />
      </FieldGroup>
      <FormRow>
        <FieldGroup>
          <FieldLabel htmlFor="city" required={required} showHints={showHints}>
            City
          </FieldLabel>
          <Input
            id="city"
            name="city"
            required={required}
            defaultValue={defaultCity ?? ""}
            placeholder="City"
            autoComplete="address-level2"
          />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel htmlFor="postalCode" showHints={showHints}>
            Postal code
          </FieldLabel>
          <Input
            id="postalCode"
            name="postalCode"
            defaultValue={defaultPostalCode ?? ""}
            placeholder="Postal code"
            autoComplete="postal-code"
          />
        </FieldGroup>
      </FormRow>
    </div>
  );
}

export { AddressFields };
