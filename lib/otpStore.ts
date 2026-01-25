

const otpMap = new Map<string, string>();

export function saveOtp(email: string, otp: string) {
  otpMap.set(email, otp);
}

export function verifyOtp(email: string, otp: string) {
  const savedOtp = otpMap.get(email);
  return savedOtp === otp;
}

export function deleteOtp(email: string) {
  otpMap.delete(email);
}

