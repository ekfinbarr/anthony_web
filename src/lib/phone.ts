/** Canonical Nigerian numbers: 080…, 234…, and +234… become +234 plus 10 digits. */
export function canonicalNigerianPhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  let national: string;

  if (digits.startsWith("234") && digits.length === 13) {
    national = digits.slice(3);
  } else if (digits.startsWith("0") && digits.length === 11) {
    national = digits.slice(1);
  } else if (digits.length === 10) {
    national = digits;
  } else {
    return null;
  }

  return /^[789]\d{9}$/.test(national) ? `+234${national}` : null;
}
