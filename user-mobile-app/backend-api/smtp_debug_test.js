import 'dotenv/config';
import nodemailer from 'nodemailer';

console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PASSWORD:', process.env.SMTP_PASSWORD ? '***set***' : '***not set***');


const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mail.yahoo.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

transporter.verify()
  .then(() => console.log('SMTP connection valid'))
  .catch(e => console.error('SMTP connection failed:', e));
