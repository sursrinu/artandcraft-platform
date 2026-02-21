import nodemailer from 'nodemailer';


const transporter = nodemailer.createTransport({
  host: 'smtp.mail.yahoo.com',
  port: 465,
  secure: true,
  auth: {
    user: 'sur_srinu@yahoo.co.in',
    pass: 'weonipmjnywvubhx',
  },
});


const mailOptions = {
  from: 'sur_srinu@yahoo.co.in',
  to: 'srinivasu@gmail.com',
  subject: 'Test OTP Email',
  text: 'Your OTP code is: 123456',
  html: '<p>Your OTP code is: <b>123456</b></p>'
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    return console.error('Error sending email:', error);
  }
  console.log('Email sent:', info.messageId);
});
