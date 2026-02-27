import nodemailer from 'nodemailer';

const EMAIL_METHOD = process.env.EMAIL_METHOD || 'smtp';

export async function sendOtpEmail(to, otp, method = EMAIL_METHOD) {
  // Debug: Log config and recipient
  console.log('[OTP EMAIL] Preparing to send OTP email');
  console.log('[OTP EMAIL] Method:', method);
  console.log('[OTP EMAIL] Recipient:', to);
  // Debug: Print all SMTP env vars
  console.log('[OTP EMAIL] SMTP_HOST:', process.env.SMTP_HOST);
  console.log('[OTP EMAIL] SMTP_PORT:', process.env.SMTP_PORT);
  console.log('[OTP EMAIL] SMTP_USER:', process.env.SMTP_USER);
  console.log('[OTP EMAIL] SMTP_PASSWORD:', process.env.SMTP_PASSWORD);
  console.log('[OTP EMAIL] SMTP_FROM:', process.env.SMTP_FROM);
  if (method === 'mailgun') {
    try {
      await sendWithMailgun({
        to,
        subject: 'Your OTP for Art & Craft Registration',
        text: `Your OTP code is: ${otp}`,
        html: `<p>Your OTP code is: <b>${otp}</b></p>`
      });
      console.log('[OTP EMAIL] Email sent via Mailgun');
    } catch (err) {
      console.error('[OTP EMAIL] Failed to send OTP email via Mailgun:', err);
      throw err;
    }
  } else {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_PORT == '465' ? true : false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      const mailOptions = {
        from: process.env.SMTP_FROM || 'no-reply@artandcraft.com',
        to,
        subject: 'Your OTP for Art & Craft Registration',
        text: `Your OTP code is: ${otp}`,
        html: `<p>Your OTP code is: <b>${otp}</b></p>`
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('[OTP EMAIL] Email sent via SMTP:', info.messageId);
    } catch (err) {
      console.error('[OTP EMAIL] Failed to send OTP email via SMTP:', err);
      throw err;
    }
  }
}
import nodemailer from 'nodemailer';
import { sendWithMailgun } from './sendgridMailer.js';

const EMAIL_METHOD = process.env.EMAIL_METHOD || 'smtp';

export async function sendOtpEmail(to, otp, method = EMAIL_METHOD) {
  // Debug: Log config and recipient
  console.log('[OTP EMAIL] Preparing to send OTP email');
  console.log('[OTP EMAIL] Method:', method);
  console.log('[OTP EMAIL] Recipient:', to);
  // Debug: Print all SMTP env vars
  console.log('[OTP EMAIL] SMTP_HOST:', process.env.SMTP_HOST);
  console.log('[OTP EMAIL] SMTP_PORT:', process.env.SMTP_PORT);
  console.log('[OTP EMAIL] SMTP_USER:', process.env.SMTP_USER);
  console.log('[OTP EMAIL] SMTP_PASSWORD:', process.env.SMTP_PASSWORD);
  console.log('[OTP EMAIL] SMTP_FROM:', process.env.SMTP_FROM);
  if (method === 'mailgun') {
    try {
      await sendWithMailgun({
        to,
        subject: 'Your OTP for Art & Craft Registration',
        text: `Your OTP code is: ${otp}`,
        html: `<p>Your OTP code is: <b>${otp}</b></p>`
      });
      console.log('[OTP EMAIL] Email sent via Mailgun');
    } catch (err) {
      console.error('[OTP EMAIL] Failed to send OTP email via Mailgun:', err);
      throw err;
    }
  } else {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_PORT == '465' ? true : false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      const mailOptions = {
        from: process.env.SMTP_FROM || 'no-reply@artandcraft.com',
        to,
        subject: 'Your OTP for Art & Craft Registration',
        text: `Your OTP code is: ${otp}`,
        html: `<p>Your OTP code is: <b>${otp}</b></p>`
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('[OTP EMAIL] Email sent via SMTP:', info.messageId);
    } catch (err) {
      console.error('[OTP EMAIL] Failed to send OTP email via SMTP:', err);
      throw err;
    }
  }
}
