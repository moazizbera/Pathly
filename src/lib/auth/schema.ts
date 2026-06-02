import { z } from "zod";

export const categoryOptions = ["Student", "Employee", "Teacher"] as const;

const validCategorySet = new Set(categoryOptions.map((item) => item.toLowerCase()));

export function parseRoleCategories(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function isValidRoleCategory(value: string): boolean {
  const roles = parseRoleCategories(value);
  return roles.length > 0 && roles.every((role) => validCategorySet.has(role.toLowerCase()));
}

export const signupSchema = z.object({
  fullName: z.string().trim().min(2, "Enter a name with at least 2 characters."),
  category: z
    .string()
    .trim()
    .refine((value) => isValidRoleCategory(value), "Choose at least one valid category."),
  email: z.string().trim().email("Enter a valid email address."),
  password: z
    .string()
    .min(8, "Use at least 8 characters.")
    .regex(/[A-Z]/, "Include at least one uppercase letter.")
    .regex(/[A-Za-z]/, "Include at least one letter.")
    .regex(/[0-9]/, "Include at least one number."),
  mainGoal: z.string().trim().min(8, "Describe a real goal for this week."),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(8, "Use at least 8 characters."),
});

export type AuthFormState = {
  success?: string;
  error?: string;
  verificationEmail?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  values?: {
    fullName?: string;
    category?: string;
    email?: string;
    mainGoal?: string;
  };
};
