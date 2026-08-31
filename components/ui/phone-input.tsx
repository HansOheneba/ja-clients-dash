"use client";

import PhoneInputLib from "react-phone-number-input";
import en from "react-phone-number-input/locale/en";

import { cn } from "@/lib/utils";

import "react-phone-number-input/style.css";

export function PhoneInput({
  value,
  onChange,
  id = "phone",
  required,
  placeholder = "555 010 1234",
}: {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <PhoneInputLib
      international
      countryCallingCodeEditable={false}
      defaultCountry="US"
      labels={en}
      value={value || undefined}
      onChange={(next) => onChange(next ?? "")}
      className={cn("phone-input-field")}
      numberInputProps={{
        id,
        required,
        placeholder,
        "aria-label": "Phone number",
      }}
    />
  );
}
