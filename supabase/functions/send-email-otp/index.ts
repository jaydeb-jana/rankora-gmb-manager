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

    const isRegistration = purpose === "registration";
    const subject = isRegistration
      ? `${otpCode} is your RANKORA verification code`
      : `${otpCode} is your RANKORA password reset code`;

    const greeting = customerName ? `Hello ${customerName},` : "Hello,";
    const purposeTitle = isRegistration
      ? "Verify Your Email Address"
      : "Reset Your Account Password";
    const purposeSubtitle = isRegistration
      ? "Thank you for joining RANKORA. Confirm your email to start growing your Google Business reviews."
      : "We received a request to reset the password for your RANKORA account.";
    const actionText = isRegistration
      ? "complete your account registration"
      : "reset your account password";

    // Split code digits for individual display if 6 or 8 digits
    const digits = otpCode.toString().trim().split("");
    const digitsHtml = digits
      .map(
        (d: string) => `
        <td style="padding: 0 4px;">
          <div style="width: 38px; height: 50px; line-height: 50px; background: #ffffff; border: 2px solid #1a73e8; border-radius: 8px; font-size: 26px; font-weight: 800; color: #1a73e8; font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace; text-align: center; box-shadow: 0 2px 4px rgba(26, 115, 232, 0.1);">
            ${d}
          </div>
        </td>
      `
      )
      .join("");

    const currentYear = new Date().getFullYear();
    const formattedDate = new Date().toUTCString();

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>${subject}</title>
        <style type="text/css">
          @media only screen and (max-width: 600px) {
            .email-container { width: 100% !important; padding: 12px !important; }
            .card-body { padding: 24px 18px !important; }
            .otp-digit { width: 32px !important; height: 44px !important; line-height: 44px !important; font-size: 22px !important; }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f0f4f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #202124;">
        
        <!-- Outer Table Container -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f0f4f9; padding: 32px 0;">
          <tr>
            <td align="center">
              
              <!-- Main Email Card (Max 580px) -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="580" class="email-container" style="max-width: 580px; width: 100%; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04); border: 1px solid #e2e8f0;">
                
                <!-- Google 4-Color Gradient Top Accent Bar -->
                <tr>
                  <td height="5" style="background: linear-gradient(90deg, #1a73e8 0%, #4285f4 35%, #34a853 65%, #fbbc04 85%, #ea4335 100%);"></td>
                </tr>

                <!-- Header / Branding Bar -->
                <tr>
                  <td style="padding: 28px 36px 20px 36px; border-bottom: 1px solid #f1f3f4;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="left">
                          <!-- Logo & Brand Badge -->
                          <div style="display: inline-flex; align-items: center; gap: 10px;">
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="width: 38px; height: 38px; background: linear-gradient(135deg, #1a73e8 0%, #1557b0 100%); border-radius: 10px; text-align: center; vertical-align: middle;">
                                  <span style="font-size: 20px; line-height: 38px; color: #ffffff;">★</span>
                                </td>
                                <td style="padding-left: 12px;">
                                  <div style="font-size: 19px; font-weight: 800; color: #1a73e8; letter-spacing: -0.3px; line-height: 1.1;">RANKORA</div>
                                  <div style="font-size: 11px; font-weight: 600; color: #5f6368; letter-spacing: 0.2px; text-transform: uppercase;">Google Business Manager</div>
                                </td>
                              </tr>
                            </table>
                          </div>
                        </td>
                        <td align="right">
                          <!-- Official Verification Badge -->
                          <div style="display: inline-block; padding: 5px 12px; background: #e6f4ea; border: 1px solid #ceead6; border-radius: 20px; font-size: 11px; font-weight: 700; color: #137333;">
                            ● Official Notice
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Card Body -->
                <tr>
                  <td class="card-body" style="padding: 36px;">
                    
                    <!-- Title & Subtitle -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="left" style="padding-bottom: 16px;">
                          <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #202124; letter-spacing: -0.5px; line-height: 1.3;">
                            ${purposeTitle}
                          </h1>
                          <p style="margin: 8px 0 0 0; font-size: 14px; color: #5f6368; line-height: 1.5;">
                            ${purposeSubtitle}
                          </p>
                        </td>
                      </tr>

                      <!-- Personalized Greeting -->
                      <tr>
                        <td style="padding: 12px 0 20px 0; font-size: 14px; color: #3c4043; line-height: 1.6;">
                          <strong>${greeting}</strong><br>
                          Please use the one-time verification code below to ${actionText}. This security code is valid for <strong>10 minutes</strong>.
                        </td>
                      </tr>

                      <!-- OTP Verification Box -->
                      <tr>
                        <td style="padding: 8px 0 24px 0;">
                          <div style="background: linear-gradient(135deg, #f8fafd 0%, #eef5fc 100%); border: 1.5px solid #d2e3fc; border-radius: 16px; padding: 24px 16px; text-align: center;">
                            <div style="font-size: 11px; font-weight: 700; color: #1a73e8; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 12px;">
                              ONE-TIME VERIFICATION CODE
                            </div>

                            <!-- Digits Row Table -->
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto;">
                              <tr>
                                ${digitsHtml}
                              </tr>
                            </table>

                            <!-- Expiry Countdown Badge -->
                            <div style="margin-top: 14px; display: inline-block; padding: 4px 12px; background: #ffffff; border: 1px solid #d2e3fc; border-radius: 12px; font-size: 11px; font-weight: 600; color: #5f6368;">
                              ⏱ Expires in 10 minutes &bull; Single-use only
                            </div>
                          </div>
                        </td>
                      </tr>

                      <!-- Security Tips Alert -->
                      <tr>
                        <td style="padding-bottom: 24px;">
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: #fff8e1; border-left: 4px solid #f9ab00; border-radius: 8px; padding: 14px 16px;">
                            <tr>
                              <td width="24" valign="top" style="padding-right: 10px; font-size: 16px;">
                                🛡️
                              </td>
                              <td style="font-size: 12px; color: #795548; line-height: 1.5;">
                                <strong>Security Reminder:</strong> RANKORA or Arventa Ventures team members will <strong>NEVER</strong> ask you for this OTP code via phone call, WhatsApp, or email. If you did not make this request, please ignore this email.
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <!-- Fast 3-Step Guide -->
                      <tr>
                        <td style="padding: 16px; background: #f8f9fa; border-radius: 12px; border: 1px solid #f1f3f4;">
                          <div style="font-size: 12px; font-weight: 700; color: #202124; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">
                            What happens next?
                          </div>
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 12px; color: #5f6368; line-height: 1.6;">
                            <tr>
                              <td width="20" valign="top"><strong>1.</strong></td>
                              <td>Copy or enter the ${digits.length}-digit code on the RANKORA portal screen.</td>
                            </tr>
                            <tr>
                              <td width="20" valign="top"><strong>2.</strong></td>
                              <td>Connect your Google Business Profile via official OAuth 2.0.</td>
                            </tr>
                            <tr>
                              <td width="20" valign="top"><strong>3.</strong></td>
                              <td>Download custom QR stands &amp; automate 5-star AI review replies.</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>

                <!-- Footer & Compliance -->
                <tr>
                  <td style="padding: 24px 36px; background: #fafafa; border-top: 1px solid #eeeeee;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="center" style="font-size: 11px; color: #70757a; line-height: 1.6;">
                          <div style="font-weight: 700; color: #202124; margin-bottom: 4px;">
                            RANKORA &bull; Powered by <a href="https://arventaventures.online/" target="_blank" style="color: #1a73e8; text-decoration: none; font-weight: 700;">Arventa Ventures</a>
                          </div>
                          <div>
                            This is an automated security transmission dispatched to <strong>${toEmail}</strong> on ${formattedDate}.
                          </div>
                          <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e8eaed; font-size: 10px; color: #9aa0a6;">
                            Kolkata, West Bengal, India &bull; Support: <a href="mailto:info@arventaventures.online" style="color: #1a73e8; text-decoration: none;">info@arventaventures.online</a>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>
              <!-- End Main Email Card -->

            </td>
          </tr>
        </table>

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
        message: `An ${digits.length}-digit verification code has been dispatched to ${toEmail}.`,
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
