import crypto from 'crypto';
import { ENV } from '../config/env.js';

export const generateVerificationToken = () => {
  // 6-digit verification code + hex token
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const token = crypto.randomBytes(32).toString('hex');
  return { code, token };
};

export const sendVerificationEmail = async ({ to, name, code, token }) => {
  const verifyUrl = `${ENV.CLIENT_URL}/verify-email?token=${token}&email=${encodeURIComponent(to)}`;

  console.log('\n================ COLLEGE EMAIL VERIFICATION ================');
  console.log(`To: ${name} <${to}>`);
  console.log(`Verification Code: [ ${code} ]`);
  console.log(`Verification Link: ${verifyUrl}`);
  console.log('============================================================\n');

  // In production with configured SMTP, nodemailer can be used here.
  return { success: true, code, token };
};
