// Supabase Edge Function: send-email-otp
// Deployed via: npx supabase functions deploy send-email-otp --project-ref cdrqdpfqkuaqxwzinkam

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import nodemailer from "npm:nodemailer@6.9.16";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { toEmail, otpCode, purpose, customerName } = await req.json();

    if (!toEmail || !otpCode) {
      return new Response(JSON.stringify({ error: "Missing toEmail or otpCode parameter." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const gmailUser = Deno.env.get("GMAIL_USER") || "sohagifashions@gmail.com";
    const rawPass = Deno.env.get("GMAIL_APP_PASSWORD") || "pyxo obsa ygrn agrq";
    const gmailAppPassword = rawPass.replace(/\s+/g, "");

    const subject =
      purpose === "registration"
        ? `Verify Your RANKORA Account - OTP: ${otpCode}`
        : `Reset Your RANKORA Password - OTP: ${otpCode}`;

    const greeting = customerName ? `Hello ${customerName},` : "Hello,";
    const actionText =
      purpose === "registration"
        ? "complete your customer account registration"
        : "reset your account password";

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #1e293b; padding: 24px; margin: 0; }
          .card { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 14px; border: 1px solid #dadce0; padding: 32px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); }
          .logo { font-size: 22px; font-weight: 800; color: #1a73e8; letter-spacing: -0.5px; margin-bottom: 20px; display: inline-block; }
          .title { font-size: 20px; font-weight: 700; color: #202124; margin-bottom: 12px; }
          .text { font-size: 14px; color: #3c4043; line-height: 1.6; margin-bottom: 24px; }
          .otp-box { text-align: center; background: #e8f0fe; border: 2px dashed #1a73e8; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
          .otp-code { font-size: 38px; font-weight: 800; letter-spacing: 8px; color: #1a73e8; font-family: monospace; display: inline-block; }
          .meta { font-size: 12px; color: #5f6368; line-height: 1.5; border-top: 1px solid #f1f3f4; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="logo">RANKORA &bull; Google Business Profile</div>
          <div class="title">${purpose === "registration" ? "Verify Your Email Address" : "Password Reset Request"}</div>
          <div class="text">${greeting}<br>Please use the 6-digit verification code below to ${actionText}. This code will expire in <strong>10 minutes</strong>.</div>
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

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
    });

    await transporter.sendMail({
      from: `"RANKORA Security" <${gmailUser}>`,
      to: toEmail,
      subject,
      html: htmlContent,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: `A 6-digit verification code has been dispatched to ${toEmail}.`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error?.message || "Failed to dispatch email via Gmail SMTP." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
