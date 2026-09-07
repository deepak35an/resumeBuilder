import { describe, expect, it } from 'vitest';

import {
  changePasswordSchema,
  loginSchema,
  passwordStrength,
  registerSchema,
} from './schemas';

describe('auth schemas', () => {
  it('rejects an empty login', () => {
    const result = loginSchema.safeParse({ email: '', password: '' });
    expect(result.success).toBe(false);
  });

  it('accepts a valid login', () => {
    const result = loginSchema.safeParse({
      email: 'jordan.hale@example.com',
      password: 'secret',
    });
    expect(result.success).toBe(true);
  });

  it('requires terms on register', () => {
    const result = registerSchema.safeParse({
      fullName: 'Jordan Hale',
      email: 'jordan.hale@example.com',
      password: 'Secret123',
      acceptTerms: false,
    });
    expect(result.success).toBe(false);
  });

  it('requires a letter and a number in new passwords', () => {
    const weak = registerSchema.safeParse({
      fullName: 'Jordan Hale',
      email: 'jordan.hale@example.com',
      password: 'allletters',
      acceptTerms: true,
    });
    expect(weak.success).toBe(false);

    const ok = registerSchema.safeParse({
      fullName: 'Jordan Hale',
      email: 'jordan.hale@example.com',
      password: 'Secret123',
      acceptTerms: true,
    });
    expect(ok.success).toBe(true);
  });

  it('requires matching passwords when changing', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'Oldpass1',
      newPassword: 'Newpass1',
      confirmPassword: 'Mismatch1',
    });
    expect(result.success).toBe(false);
  });

  it('scores password strength', () => {
    expect(passwordStrength('').score).toBe(0);
    expect(passwordStrength('abcdefgh').label).toBe('Weak');
    expect(passwordStrength('Abcdefgh12!').score).toBeGreaterThan(2);
  });
});
