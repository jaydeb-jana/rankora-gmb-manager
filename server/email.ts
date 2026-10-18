import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config({ override: true });

interface SendOtpParams {
  toEmail: string;
  otpCode: string;
  purpose: 'registration' | 'password_reset';
  customerName?: string;
}

export async function sendOtpEmail({
  toEmail,
  otpCode,
  purpose,
  customerName,
}: SendOtpParams): Promise<{ success: boolean; message: string }> {
  const gmailUser = (process.env.GMAIL_USER || '').trim();
  const gmailPass = (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '').trim();

  if (!gmailUser || !gmailPass) {
    throw new Error('Gmail SMTP credentials are not configured in environment variables.');
  }

  const subject =
    purpose === 'registration'
      ? `Verify Your RANKORA Account - OTP: ${otpCode}`
      : `Reset Your RANKORA Password - OTP: ${otpCode}`;

  const greeting = customerName ? `Hello ${customerName},` : 'Hello,';
  const actionText =
    purpose === 'registration'
      ? 'complete your customer account registration'
      : 'reset your account password';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #1e293b; padding: 24px; margin: 0; }
        .card { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .logo { font-size: 22px; font-weight: 700; color: #1a73e8; letter-spacing: -0.5px; margin-bottom: 24px; display: inline-block; }
        .title { font-size: 20px; font-weight: 600; color: #202124; margin-bottom: 12px; }
        .text { font-size: 15px; color: #3c4043; line-height: 1.6; margin-bottom: 24px; }
        .otp-box { text-align: center; background: #e8f0fe; border: 2px dashed #1a73e8; border-radius: 8px; padding: 18px; margin-bottom: 24px; }
        .otp-code { font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #1a73e8; font-family: monospace; }
        .meta { font-size: 13px; color: #5f6368; line-height: 1.5; border-top: 1px solid #f1f3f4; padding-top: 16px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo">RANKORA &bull; Google Business Profile</div>
        <div class="title">${purpose === 'registration' ? 'Verify Your Email Address' : 'Password Reset Request'}</div>
        <div class="text">${greeting}<br>Please use the one-time verification code below to ${actionText}. This code will expire in <strong>10 minutes</strong>.</div>
        <div class="otp-box">
          <div class="otp-code">${otpCode}</div>
        </div>
        <div class="meta">
          If you did not request this verification code, please ignore this email. For your security, never share this code with anyone.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });

    await transporter.sendMail({
      from: `"RANKORA Security" <${gmailUser}>`,
      to: toEmail,
      subject,
      html: htmlContent,
    });

    console.log(`[SMTP PRODUCTION SUCCESS] Dispatched OTP code to ${toEmail} via Gmail.`);
    return {
      success: true,
      message: `A 6-digit verification code has been dispatched to ${toEmail}. Please check your inbox.`,
    };
  } catch (err: any) {
    console.error(`[SMTP ERROR] Failed to send via Gmail SMTP:`, err.message);
    throw new Error(`Failed to dispatch email to ${toEmail}: ${err.message}`);
  }
}

interface SendContactInquiryParams {
  name: string;
  email: string;
  mobile?: string;
  subject: string;
  message: string;
}

export async function sendContactInquiryEmail({
  name,
  email,
  mobile,
  subject,
  message,
}: SendContactInquiryParams): Promise<{ success: boolean; message: string }> {
  const gmailUser = (process.env.GMAIL_USER || '').trim();
  const gmailPass = (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '').trim();

  if (!gmailUser || !gmailPass) {
    throw new Error('Gmail SMTP credentials are not configured in environment variables.');
  }

  const destinationEmail = 'info@arventaventures.online';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #1e293b; padding: 24px; margin: 0; }
        .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .badge { display: inline-block; padding: 4px 10px; background: #e8f0fe; color: #1a73e8; border-radius: 20px; font-size: 12px; font-weight: 700; margin-bottom: 16px; }
        .title { font-size: 20px; font-weight: 700; color: #202124; margin-bottom: 16px; }
        .row { margin-bottom: 12px; font-size: 14px; }
        .label { font-weight: 600; color: #5f6368; display: inline-block; width: 100px; }
        .val { color: #202124; }
        .message-box { background: #f8f9fa; border: 1px solid #dadce0; border-radius: 8px; padding: 16px; margin-top: 20px; font-size: 14px; line-height: 1.6; white-space: pre-wrap; }
        .footer { font-size: 12px; color: #5f6368; margin-top: 24px; border-top: 1px solid #f1f3f4; padding-top: 16px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="badge">RANKORA &bull; Customer Inquiry</div>
        <div class="title">New Inquiry for Arventa Ventures</div>
        <div class="row"><span class="label">From:</span> <span class="val"><strong>${name}</strong></span></div>
        <div class="row"><span class="label">Email:</span> <span class="val"><a href="mailto:${email}">${email}</a></span></div>
        ${mobile ? `<div class="row"><span class="label">Mobile:</span> <span class="val">${mobile}</span></div>` : ''}
        <div class="row"><span class="label">Subject:</span> <span class="val">${subject}</span></div>
        <div class="message-box"><strong>Message:</strong>\n\n${message}</div>
        <div class="footer">Sent via RANKORA Portal to Arventa Ventures Desk &bull; Reply directly to this email to contact ${name}.</div>
      </div>
    </body>
    </html>
  `;

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });

    await transporter.sendMail({
      from: `"RANKORA Desk" <${gmailUser}>`,
      to: destinationEmail,
      replyTo: email,
      subject: `[RANKORA Inquiry] ${subject} - from ${name}`,
      html: htmlContent,
    });

    console.log(`[SMTP INQUIRY SUCCESS] Dispatched message from ${name} (${email}) to ${destinationEmail}`);
    return {
      success: true,
      message: 'Inquiry dispatched to info@arventaventures.online successfully!',
    };
  } catch (err: any) {
    console.error(`[SMTP INQUIRY ERROR]`, err.message);
    throw new Error(`Failed to dispatch inquiry to ${destinationEmail}: ${err.message}`);
  }
}
