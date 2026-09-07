import { z } from 'zod';

const password = z
  .string()
  .min(8, 'Use at least 8 characters.')
  .max(128, 'That password is too long.')
  .regex(/[A-Za-z]/, 'Include at least one letter.')
  .regex(/\d/, 'Include at least one number.');

export const loginSchema = z.object({
  email: z.string().min(1, 'Enter your email address.').email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
});

export const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Enter your name.')
    .max(160, 'That name is too long.'),
  email: z.string().min(1, 'Enter your email address.').email('Enter a valid email address.'),
  password,
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'Please accept the terms to continue.' }),
  }),
});

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Enter your email address.').email('Enter a valid email address.'),
});

export const resetPasswordSchema = z
  .object({
    password,
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password.'),
    newPassword: password,
    confirmPassword: z.string(),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  });

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

/** Simple strength hint - guidance only, never a hard gate beyond the schema. */
export function passwordStrength(value: string): {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
} {
  let score = 0;
  if (value.length >= 8) score += 1;
  if (value.length >= 12) score += 1;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1;
  if (/\d/.test(value) && /[^A-Za-z0-9]/.test(value)) score += 1;

  const labels = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];
  const clamped = Math.min(score, 4) as 0 | 1 | 2 | 3 | 4;
  return { score: clamped, label: labels[clamped] };
}
