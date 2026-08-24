export const CHILD_AGE_LIMIT = 14;
export const ADOLESCENT_AGE_LIMIT = 18;

export type NnaCategory = "child" | "adolescent" | "adult";

export function ageFromBirthDate(birthDate: Date, now = new Date()): number {
  let age = now.getFullYear() - birthDate.getFullYear();
  const monthDelta = now.getMonth() - birthDate.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age;
}

export function parseBirthDateInput(value: string | null | undefined): Date | null {
  if (!value || !value.trim()) return null;
  const parsed = new Date(`${value.trim()}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

export function nnaCategoryFromAge(age: number): NnaCategory {
  if (age < CHILD_AGE_LIMIT) return "child";
  if (age < ADOLESCENT_AGE_LIMIT) return "adolescent";
  return "adult";
}

export function isChildBirthDate(value: string | Date | null | undefined): boolean {
  const date = value instanceof Date ? value : parseBirthDateInput(typeof value === "string" ? value : null);
  if (!date) return false;
  return nnaCategoryFromAge(ageFromBirthDate(date)) === "child";
}
