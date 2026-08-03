import { z } from 'zod';

export const sendOtpSchema = z.object({
  phone: z.string().transform(val => (val || '').replace(/\D/g, '').slice(-10)).refine(val => val.length === 10, {
    message: 'Valid 10-digit mobile number required'
  })
});

export const verifyOtpSchema = z.object({
  phone: z.string().transform(val => (val || '').replace(/\D/g, '').slice(-10)).refine(val => val.length === 10, {
    message: 'Valid 10-digit mobile number required'
  }),
  otp: z.string().trim().length(6, { message: '6-digit OTP code required' })
});

export const customerLoginSchema = z.object({
  phone: z.string().transform(val => (val || '').replace(/\D/g, '').slice(-10)).refine(val => val.length === 10, {
    message: 'Valid 10-digit mobile number required'
  }),
  otp: z.string().trim().length(6, { message: '6-digit OTP code required' }),
  name: z.string().trim().optional(),
  email: z.string().trim().email({ message: 'Invalid email address' }).optional().or(z.literal(''))
});

export const staffLoginSchema = z.object({
  username: z.string().trim().min(3, { message: 'Username must be at least 3 characters' }),
  password: z.string().min(4, { message: 'Password must be at least 4 characters' })
});

export const adminLoginSchema = z.object({
  username: z.string().trim().min(3, { message: 'Username or email required' }),
  password: z.string().min(3, { message: 'Password must be at least 3 characters' })
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().trim().min(1, { message: 'Refresh token is required' })
});

export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type CustomerLoginInput = z.infer<typeof customerLoginSchema>;
export type StaffLoginInput = z.infer<typeof staffLoginSchema>;
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
