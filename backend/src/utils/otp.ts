import crypto from 'crypto';

export function generateOTP(length: number = 6): string {
  return crypto.randomInt(Math.pow(10, length - 1), Math.pow(10, length)).toString();
}

export function getOTPExpiry(minutes: number = 1): Date {
  const now = new Date();
  now.setMinutes(now.getMinutes() + minutes);
  return now;
} 