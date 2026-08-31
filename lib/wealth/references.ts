const CLIENT_NUMBER_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** 8-character key derived from a UUID. Not sequential, so it does not reveal book size. */
export function clientNumberFromId(id: string): string {
  const hex = id.replaceAll("-", "").slice(0, 10);
  let value = BigInt(`0x${hex}`);
  let token = "";
  for (let i = 0; i < 8; i += 1) {
    token = CLIENT_NUMBER_ALPHABET[Number(value % 32n)] + token;
    value /= 32n;
  }
  return `JA-${token}`;
}

export function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}
