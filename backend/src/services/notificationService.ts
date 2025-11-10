import mongoose from 'mongoose';
import * as nodemailer from 'nodemailer';
import User, { IUser } from '../models/User';

// Define User interface for this service
interface UserDocument {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  messId?: string;
  role: string;
  isActive: boolean;
  preferences?: {
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
}

export interface NotificationPayload {
  userId: string;
  title: string;
  message: string;
  type: string;
  channels: ('email' | 'sms' | 'push' | 'whatsapp')[];
  data?: any;
}

// Email transporter setup
const emailTransporter = nodemailer.createTransport({
  host: process.env['SMTP_HOST'] || 'smtp.gmail.com',
  port: parseInt(process.env['SMTP_PORT'] || '587'),
  secure: false,
  auth: {
    user: process.env['SMTP_USER'],
    pass: process.env['SMTP_PASS']
  }
});

export async function sendNotification(payload: NotificationPayload): Promise<boolean> {
  try {
    const user = await User.findById(payload.userId).lean();
    if (!user) {
      console.error('User not found for notification:', payload.userId);
      return false;
    }

    // Check user preferences for notification channels
    const userDoc: UserDocument = {
      _id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive || false
    };

    if (user.messId) {
      userDoc.messId = user.messId.toString();
    }

    if (user.preferences) {
      userDoc.preferences = {
        notifications: {
          email: user.preferences.notifications.email,
          push: user.preferences.notifications.push,
          sms: user.preferences.notifications.sms
        }
      };
    }

    // Filter channels based on user preferences
    const allowedChannels = payload.channels.filter(channel => {
      if (!userDoc.preferences?.notifications) return true;
      switch (channel) {
        case 'email':
          return userDoc.preferences.notifications.email;
        case 'push':
          return userDoc.preferences.notifications.push;
        case 'sms':
          return userDoc.preferences.notifications.sms;
        case 'whatsapp':
          return userDoc.preferences.notifications.sms; // WhatsApp uses SMS preference
        default:
          return true;
      }
    });

    if (allowedChannels.length === 0) {
      console.log('No allowed notification channels for user:', payload.userId);
      return true; // Consider this a success since user has disabled notifications
    }

    const results = await Promise.allSettled([
      ...allowedChannels.map(channel => sendChannelNotification(channel, userDoc, payload))
    ]);

    // Return true if at least one channel succeeded
    return results.some((result: PromiseSettledResult<boolean>) => 
      result.status === 'fulfilled' && result.value === true
    );
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
}

async function sendChannelNotification(
  channel: 'email' | 'sms' | 'push' | 'whatsapp',
  user: UserDocument,
  payload: NotificationPayload
): Promise<boolean> {
  switch (channel) {
    case 'email':
      return await sendEmailNotification(user, payload);
    case 'push':
      return await sendPushNotification(user, payload);
    case 'sms':
      return await sendSMSNotification(user, payload);
    case 'whatsapp':
      return await sendWhatsAppNotification(user, payload);
    default:
      console.warn('Unknown notification channel:', channel);
      return false;
  }
}

async function sendEmailNotification(user: UserDocument, payload: NotificationPayload): Promise<boolean> {
  try {
    if (!user.email) {
      console.warn('User has no email address:', user._id);
      return false;
    }

    const userName = user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}` 
      : user.firstName || 'User';

    const mailOptions = {
      from: process.env['FROM_EMAIL'] || 'noreply@SmartMess.com',
      to: user.email,
      subject: payload.title,
      html: generateEmailTemplate(payload.title, payload.message, userName),
      text: payload.message
    };

    await emailTransporter.sendMail(mailOptions);
    console.log('Email sent successfully to:', user.email);
    return true;
  } catch (error) {
    console.error('Error sending email notification:', error);
    return false;
  }
}

async function sendPushNotification(user: UserDocument, payload: NotificationPayload): Promise<boolean> {
  try {
    // TODO: Implement push notification using FCM or similar service
    console.log('Push notification would be sent to:', user._id);
    
    // For now, just log the notification
    console.log('Push Notification:', {
      userId: user._id,
      title: payload.title,
      message: payload.message,
      type: payload.type
    });
    
    return true;
  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
}

async function sendSMSNotification(user: UserDocument, payload: NotificationPayload): Promise<boolean> {
  try {
    if (!user.phone) {
      console.warn('User has no phone number:', user._id);
      return false;
    }

    // TODO: Implement SMS using Twilio or similar service
    console.log('SMS would be sent to:', user.phone);
    console.log('SMS Content:', payload.message);
    
    return true;
  } catch (error) {
    console.error('Error sending SMS notification:', error);
    return false;
  }
}

async function sendWhatsAppNotification(user: UserDocument, payload: NotificationPayload): Promise<boolean> {
  try {
    if (!user.phone) {
      console.warn('User has no phone number for WhatsApp:', user._id);
      return false;
    }

    // TODO: Implement WhatsApp Business API
    console.log('WhatsApp message would be sent to:', user.phone);
    console.log('WhatsApp Content:', payload.message);
    
    return true;
  } catch (error) {
    console.error('Error sending WhatsApp notification:', error);
    return false;
  }
}

function generateEmailTemplate(title: string, message: string, userName: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>SmartMess Notification</h1>
        </div>
        <div class="content">
          <h2>${title}</h2>
          <p>Hi ${userName},</p>
          <p>${message}</p>
          <p>Thank you for using SmartMess!</p>
        </div>
        <div class="footer">
          <p>This is an automated message from SmartMess. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Bulk notification function for mess-wide announcements
export async function sendBulkNotification(
  messId: string,
  title: string,
  message: string,
  channels: ('email' | 'sms' | 'push' | 'whatsapp')[],
  userFilter?: Record<string, any>
): Promise<{ success: number; failed: number }> {
  try {
    const filter = { 
      messId: new mongoose.Types.ObjectId(messId), 
      role: 'user', 
      isActive: true, 
      ...userFilter 
    };
    const users = await User.find(filter).lean();

    const results = await Promise.allSettled(
      users.map((user: IUser) => sendNotification({
        userId: user._id.toString(),
        title,
        message,
        type: 'bulk_notification',
        channels
      }))
    );

    const success = results.filter((r: PromiseSettledResult<boolean>) => 
      r.status === 'fulfilled' && r.value === true
    ).length;
    const failed = results.length - success;

    return { success, failed };
  } catch (error) {
    console.error('Error sending bulk notification:', error);
    return { success: 0, failed: 0 };
  }
}
