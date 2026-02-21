
import nodemailer from 'nodemailer';

export async function sendOtpEmail(to, otp) {
  // Debug: Log SMTP config and recipient
  console.log('[OTP EMAIL] Preparing to send OTP email');
  console.log('[OTP EMAIL] SMTP_HOST:', process.env.SMTP_HOST);
  console.log('[OTP EMAIL] SMTP_PORT:', process.env.SMTP_PORT);
  console.log('[OTP EMAIL] SMTP_USER:', process.env.SMTP_USER);
  console.log('[OTP EMAIL] SMTP_FROM:', process.env.SMTP_FROM);
  console.log('[OTP EMAIL] Recipient:', to);
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
    console.log('[OTP EMAIL] Email sent:', info.messageId);
  } catch (err) {
    console.error('[OTP EMAIL] Failed to send OTP email:', err);
    throw err;
  }
}
