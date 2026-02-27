import mailgun from 'mailgun-js';

const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN;
const MAILGUN_FROM_EMAIL = process.env.MAILGUN_FROM_EMAIL;

const mg = mailgun({ apiKey: MAILGUN_API_KEY, domain: MAILGUN_DOMAIN });

export async function sendWithMailgun({ to, subject, text, html }) {
  if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN) throw new Error('Mailgun API key or domain not set');
  const data = {
    from: MAILGUN_FROM_EMAIL,
    to,
    subject,
    text,
    html,
  };
  return mg.messages().send(data);
}
import mailgun from 'mailgun-js';

const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN;
const MAILGUN_FROM_EMAIL = process.env.MAILGUN_FROM_EMAIL;

const mg = mailgun({ apiKey: MAILGUN_API_KEY, domain: MAILGUN_DOMAIN });

export async function sendWithMailgun({ to, subject, text, html }) {
  if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN) throw new Error('Mailgun API key or domain not set');
  const data = {
    from: MAILGUN_FROM_EMAIL,
    to,
    subject,
    text,
    html,
  };
  return mg.messages().send(data);
}
