import type { HouseholdMember, SacramentAnswer, SacramentKey, Sacraments } from "@/services/parishRegistration.service";

/** Option lists and helpers shared by the registration form components. */

export type Option<T extends string> = { value: T; label: string; description?: string };

export const SACRAMENT_LABELS: Record<SacramentKey, string> = {
  baptism: "Baptism",
  first_communion: "First Holy Communion",
  confirmation: "Confirmation",
  marriage: "Married in the Church",
};

export const ANSWERS: Option<SacramentAnswer>[] = [
  { value: "received", label: "Received" },
  { value: "not_yet", label: "Not yet" },
  { value: "unsure", label: "Not sure" },
];

export const MARRIAGE_ANSWERS: Option<SacramentAnswer>[] = [
  { value: "received", label: "Yes" },
  { value: "not_yet", label: "No" },
  { value: "unsure", label: "Not sure" },
];

export function answerLabel(key: SacramentKey, answer: SacramentAnswer): string {
  return (key === "marriage" ? MARRIAGE_ANSWERS : ANSWERS).find((option) => option.value === answer)?.label ?? answer;
}

export type HouseholdDraft = {
  key: string;
  name: string;
  relationship: HouseholdMember["relationship"] | "";
  dateOfBirth: string;
  sacraments: Sacraments;
};

export const RELATIONSHIPS: Option<HouseholdMember["relationship"]>[] = [
  { value: "spouse", label: "Spouse" },
  { value: "child", label: "Child" },
  { value: "parent", label: "Parent" },
  { value: "sibling", label: "Brother or sister" },
  { value: "relative", label: "Other relative" },
  { value: "other", label: "Other" },
];

export const MAX_HOUSEHOLD = 12;
export const MEMBER_SACRAMENTS: SacramentKey[] = ["baptism", "first_communion", "confirmation"];

export function newHouseholdMember(): HouseholdDraft {
  return { key: crypto.randomUUID(), name: "", relationship: "", dateOfBirth: "", sacraments: {} };
}

