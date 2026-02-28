// ...existing code...

import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const EMAIL_METHOD = process.env.EMAIL_METHOD || 'smtp';

export async function sendOtpEmail(to, otp, method = EMAIL_METHOD) {
  // Debug: Log config and recipient
  console.log('[OTP EMAIL] Preparing to send OTP email');
  console.log('[OTP EMAIL] Method:', method);
  console.log('[OTP EMAIL] Recipient:', to);
  if (method === 'sendgrid') {
    console.log('[OTP EMAIL] Using SendGrid for email delivery.');
  } else if (method === 'smtp') {
    console.log('[OTP EMAIL] Using SMTP for email delivery.');
  } else {
    console.log('[OTP EMAIL] Unknown EMAIL_METHOD:', method);
  }

  if (method === 'sendgrid') {
    try {
      const msg = {
        to,
        from: process.env.SENDGRID_FROM || process.env.SMTP_FROM,
        subject: 'Your OTP for Urs Art & Craft Registration',
        text: `Your OTP code is: ${otp}`,
        html: `<p>Your OTP code is: <b>${otp}</b></p>`,
      };
      // Removed verbose payload log
      await sgMail.send(msg);
      console.log('[OTP EMAIL] Email sent via SendGrid');
    } catch (err) {
      console.error('[OTP EMAIL] Failed to send OTP email via SendGrid:', err);
      throw err;
    }
    return;
  }

  // Default to SMTP
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

    // Removed verbose payload log
    const info = await transporter.sendMail(mailOptions);
    console.log('[OTP EMAIL] Email sent via SMTP:', info.messageId);
  } catch (err) {
    console.error('[OTP EMAIL] Failed to send OTP email via SMTP:', err);
    throw err;
  }
}
