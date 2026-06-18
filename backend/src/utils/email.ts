import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS, // For Gmail, use an App Password
  },
});

export async function sendPasswordResetEmail(to: string, newPassword: string, name: string) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('⚠️ SMTP_USER or SMTP_PASS not set in environment variables. Email sending skipped.');
    return;
  }

  const mailOptions = {
    from: `"StockSense Admin" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Your StockSense Password Has Been Reset',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; color: #334155;">
        <h2 style="color: #0f172a; margin-top: 0;">Password Reset</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>Your password for StockSense has been recently reset by the administration.</p>
        <div style="background-color: #f1f5f9; padding: 16px; border-radius: 8px; text-align: center; margin: 24px 0;">
          <p style="margin: 0; font-size: 14px; color: #64748b;">Your new temporary password is:</p>
          <p style="margin: 8px 0 0 0; font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #020617;">${newPassword}</p>
        </div>
        <p>Please log in with this new password. If you didn't request a password reset, please contact the administrator immediately.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
          StockSense System &copy; ${new Date().getFullYear()}
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}
