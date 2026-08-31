import { allCountries } from "country-region-data";

export type CountryOption = {
  code: string;
  name: string;
};

export type RegionOption = {
  code: string;
  name: string;
};

export const COUNTRY_OPTIONS: CountryOption[] = allCountries
  .map(([name, code]) => ({ code, name }))
  .sort((a, b) => a.name.localeCompare(b.name, "en"));

const REGIONS_BY_COUNTRY = new Map<string, RegionOption[]>(
  allCountries.map(([, code, regions]) => [
    code,
    regions
      .map(([name, regionCode]) => ({
        code: regionCode || name,
        name,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, "en")),
  ]),
);

export function getRegionsForCountry(countryCode: string): RegionOption[] {
  return REGIONS_BY_COUNTRY.get(countryCode) ?? [];
}

export function normalizeCountryCode(value: string | null | undefined): string {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return "US";

  const upper = trimmed.toUpperCase();
  if (COUNTRY_OPTIONS.some((country) => country.code === upper)) return upper;

  const byName = COUNTRY_OPTIONS.find(
    (country) => country.name.toLowerCase() === trimmed.toLowerCase(),
  );
  return byName?.code ?? "US";
}

export function normalizeRegionCode(
  countryCode: string,
  value: string | null | undefined,
): string {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return "";

  const regions = getRegionsForCountry(countryCode);
  const upper = trimmed.toUpperCase();
  const byCode = regions.find((region) => region.code.toUpperCase() === upper);
  if (byCode) return byCode.code;

  const byName = regions.find(
    (region) => region.name.toLowerCase() === trimmed.toLowerCase(),
  );
  return byName?.code ?? trimmed;
}

export function formatCountryName(value: string | null | undefined): string {
  if (!value) return "";
  const code = normalizeCountryCode(value);
  return COUNTRY_OPTIONS.find((country) => country.code === code)?.name ?? value;
}

export function formatRegionName(
  countryCode: string | null | undefined,
  region: string | null | undefined,
): string {
  if (!region) return "";
  const code = countryCode ? normalizeCountryCode(countryCode) : "";
  const regions = code ? getRegionsForCountry(code) : [];
  const match = regions.find(
    (item) =>
      item.code.toLowerCase() === region.toLowerCase() ||
      item.name.toLowerCase() === region.toLowerCase(),
  );
  return match?.name ?? region;
}
