const nodemailer = require('nodemailer');

const FROM_EMAIL = process.env.EMAIL_USER || 'mylesmiller2014@gmail.com';
const APP_PASSWORD = process.env.EMAIL_APP_PASSWORD || '';

let transporter = null;
function getTransporter() {
  if (transporter) return transporter;
  if (!APP_PASSWORD) {
    console.warn('[mailer] EMAIL_APP_PASSWORD not set — emails will be logged only.');
    return null;
  }
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: FROM_EMAIL, pass: APP_PASSWORD }
  });
  return transporter;
}

async function sendCredentialsEmail({ to, name, username, password, role }) {
  const subject = 'Your Airport System Login Credentials';
  const text = `Hello ${name},

A user account has been created for you in the Airport Baggage Tracking System.

  Role:     ${role}
  Username: ${username}
  Password: ${password}

You will be required to change your password on first login.

— Airport Operations`;
  const html = `<p>Hello <b>${name}</b>,</p>
<p>A user account has been created for you in the Airport Baggage Tracking System.</p>
<ul>
  <li><b>Role:</b> ${role}</li>
  <li><b>Username:</b> ${username}</li>
  <li><b>Password:</b> ${password}</li>
</ul>
<p>You will be required to change your password on first login.</p>
<p>— Airport Operations</p>`;

  const t = getTransporter();
  if (!t) {
    console.log(`[mailer] (logged) To: ${to} | ${username} / ${password}`);
    return { sent: false, logged: true };
  }
  const info = await t.sendMail({ from: `"Airport Ops" <${FROM_EMAIL}>`, to, subject, text, html });
  console.log(`[mailer] Sent credentials to ${to} (id=${info.messageId})`);
  return { sent: true, messageId: info.messageId };
}

module.exports = { sendCredentialsEmail };
