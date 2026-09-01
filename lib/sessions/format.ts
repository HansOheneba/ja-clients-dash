export const SESSION_FORMAT_OPTIONS = [
  { value: "video", label: "Video call" },
  { value: "phone", label: "Phone call" },
  { value: "in_person", label: "In person" },
] as const;

export function formatSessionFormat(value: string) {
  const match = SESSION_FORMAT_OPTIONS.find((option) => option.value === value);
  return match?.label ?? value.replaceAll("_", " ");
}
