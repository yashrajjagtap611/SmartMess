export const sanitizeOtp = (raw: string): string => raw.replace(/\D/g, '').slice(0, 6);

export const isOtpComplete = (digits: string[]): boolean => digits.join('').length === 6;

export const formatCountdown = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};


