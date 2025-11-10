import nodemailer from 'nodemailer';
import { generateOTP, getOTPExpiry } from '../utils/otp';
import Otp from '../models/Otp';
import config from '../config';

class EmailService {
  private transporter: nodemailer.Transporter;
  private otpAttempts: Map<string, { count: number; timestamp: number }> = new Map();

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env['EMAIL_HOST'],
      port: parseInt(process.env['EMAIL_PORT'] || '587'),
      secure: false,
      auth: {
        user: process.env['EMAIL_USER'],
        pass: process.env['EMAIL_PASS'],
      },
    });

    // Clean up OTP attempts every hour
    setInterval(() => {
      const now = Date.now();
      for (const [email, data] of this.otpAttempts.entries()) {
        if (now - data.timestamp > 60 * 60 * 1000) { // 1 hour
          this.otpAttempts.delete(email);
        }
      }
    }, 60 * 60 * 1000); // Clean up every hour
  }

  private async sendEmail(to: string, subject: string, text: string, html: string) {
    try {
      await this.transporter.sendMail({
        from: process.env['EMAIL_FROM'],
        to,
        subject,
        text,
        html,
      });
      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error('Failed to send email');
    }
  }

  private generateOtpEmailContent(code: string, type: 'verification' | 'password_reset') {
          const expiryMinutes = process.env['OTP_EXPIRY_MINUTES'] || '10';
    const subject = type === 'verification' ? 'SmartMess Email Verification' : 'SmartMess Password Reset';
    const purpose = type === 'verification' ? 'verify your email address' : 'reset your password';

    const text = `Your OTP code is: ${code}. It will expire in ${expiryMinutes} minute(s).`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 32px 24px; background: #f9f9f9;">
        <h2 style="color: #2b7cff; text-align: center;">SmartMess ${type === 'verification' ? 'Verification' : 'Password Reset'} Code</h2>
        <p style="font-size: 16px; color: #333; text-align: center;">Use the code below to ${purpose}:</p>
        <div style="font-size: 32px; font-weight: bold; color: #2b7cff; letter-spacing: 8px; text-align: center; margin: 24px 0;">${code}</div>
        <p style="font-size: 15px; color: #555; text-align: center;">This code will expire in <b>${expiryMinutes} minute(s)</b>.</p>
        <hr style="margin: 32px 0; border: none; border-top: 1px solid #e0e0e0;" />
        <p style="font-size: 13px; color: #888; text-align: center;">If you did not request this code, you can safely ignore this email.</p>
        <p style="font-size: 13px; color: #888; text-align: center; margin-top: 8px;">&copy; ${new Date().getFullYear()} SmartMess</p>
      </div>
    `;

    return { subject, text, html };
  }

  async sendOTP(email: string, type: 'verification' | 'password_reset' = 'verification'): Promise<string> {
    try {
      // Check rate limiting
      const now = Date.now();
      const attempts = this.otpAttempts.get(email);
      if (attempts) {
        if (now - attempts.timestamp < 60 * 1000) { // 1 minute cooldown
          throw new Error('Please wait 1 minute before requesting another OTP');
        }
        if (attempts.count >= 5) { // Max 5 attempts per hour
          if (now - attempts.timestamp < 60 * 60 * 1000) {
            throw new Error('Too many OTP requests. Please try again in an hour');
          } else {
            // Reset counter after an hour
            this.otpAttempts.delete(email);
          }
        }
      }

      // Generate new OTP
      const code = generateOTP();
              const expiresAt = getOTPExpiry(parseInt(process.env['OTP_EXPIRY_MINUTES'] || '10'));

      // Invalidate any existing unverified OTPs for this email
      await Otp.updateMany(
        { email, verified: false },
        { verified: true, $set: { invalidated: true } }
      );

      // Save new OTP in DB
      await Otp.create({ email, code, type, expiresAt });

      // Check if we're in development mode
      if (process.env['NODE_ENV'] === 'development' && config.development.disableEmail) {
        console.log('🔐 DEVELOPMENT MODE: OTP Code for', email, 'is:', code);
        console.log('📧 In production, this would be sent via email');
        
        // Update rate limiting
        this.otpAttempts.set(email, {
          count: (attempts?.count || 0) + 1,
          timestamp: now
        });
        
        return code;
      }

      // Send OTP via email
      const { subject, text, html } = this.generateOtpEmailContent(code, type);
      await this.sendEmail(email, subject, text, html);

      // Update rate limiting
      this.otpAttempts.set(email, {
        count: (attempts?.count || 0) + 1,
        timestamp: now
      });

      return code;
    } catch (error) {
      console.error('Failed to send OTP:', error);
      throw error instanceof Error ? error : new Error('Failed to send OTP');
    }
  }

  async verifyOTP(email: string, code: string): Promise<boolean> {
    const otpDoc = await Otp.findOne({ 
      email, 
      code, 
      verified: false,
      invalidated: { $ne: true }
    }).sort({ createdAt: -1 });

    if (!otpDoc) {
      throw new Error('Invalid or already used OTP code');
    }

    if (otpDoc.expiresAt < new Date()) {
      // Invalidate expired OTP
      otpDoc.invalidated = true;
      await otpDoc.save();
      throw new Error('OTP has expired. Please request a new one');
    }

    // Mark as verified
    otpDoc.verified = true;
    await otpDoc.save();

    // Reset OTP attempts after successful verification
    this.otpAttempts.delete(email);

    return true;
  }
}

export default new EmailService(); 