import crypto from 'crypto';

// In-memory OTP storage: Map<lowercase_email, { otp, expiresAt, attempts, createdAt }>
const otpStore = new Map();

// Default sender configuration
const DEFAULT_SENDER_EMAIL = 'darkpearl251103@gmail.com';
const DEFAULT_SENDER_NAME = 'RTI Assist Verification';

/**
 * Generate a cryptographically secure 6-digit numeric OTP
 */
export function generateOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

/**
 * Helper to extract raw Brevo API key if passed as base64 JSON token
 */
function resolveBrevoApiKey() {
  let key = process.env.BREVO_API_KEY?.trim() || '';
  if (key.startsWith('eyJ')) {
    try {
      const decoded = Buffer.from(key, 'base64').toString('utf8');
      const parsed = JSON.parse(decoded);
      if (parsed.api_key) return parsed.api_key.trim();
    } catch {
      // If base64 parse fails, keep original
    }
  }
  return key;
}

/**
 * Send an OTP verification email using Brevo Transactional Email REST API
 */
export async function sendOtpEmail({ toEmail, toName = 'Citizen', otp, expiresInMinutes = 10 }) {
  const brevoApiKey = resolveBrevoApiKey();
  const senderEmail = process.env.BREVO_SENDER_EMAIL?.trim() || 'darkpearl251103@gmail.com';
  const senderName = process.env.BREVO_SENDER_NAME?.trim() || DEFAULT_SENDER_NAME;

  console.log(`[Brevo Service] 📩 Preparing OTP email for ${toEmail}...`);

  // HTML Email Template with RTI Assist branding
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>RTI Assist OTP Verification</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a; }
    .container { max-width: 560px; margin: 0 auto; background: #ffffff; border: 2px solid #0f172a; box-shadow: 6px 6px 0px 0px #0f172a; border-radius: 8px; overflow: hidden; }
    .header { background: #2563eb; padding: 24px 32px; color: #ffffff; border-bottom: 2px solid #0f172a; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 4px 0 0 0; font-size: 13px; opacity: 0.9; }
    .content { padding: 32px; }
    .salutation { font-size: 15px; font-weight: 600; margin-bottom: 16px; }
    .otp-box { background: #eff6ff; border: 2px dashed #2563eb; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0; }
    .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 900; letter-spacing: 10px; color: #1e40af; margin: 0; }
    .otp-expiry { font-size: 12px; color: #64748b; margin-top: 8px; font-weight: 600; }
    .notice { background: #fffbeb; border: 1px solid #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; font-size: 13px; color: #92400e; border-radius: 4px; margin: 20px 0; }
    .footer { background: #f1f5f9; padding: 20px 32px; font-size: 12px; color: #64748b; border-top: 2px solid #0f172a; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>RTI Assist Verification</h1>
      <p>Right to Information Intelligence & Tracking Portal</p>
    </div>
    <div class="content">
      <div class="salutation">Hello ${toName || 'Citizen'},</div>
      <p style="font-size: 14px; line-height: 1.6; color: #334155;">
        You requested a verification code to access your citizen account on <strong>RTI Assist</strong>. Use the One-Time Password (OTP) below to complete your verification:
      </p>
      
      <div class="otp-box">
        <div class="otp-code">${otp}</div>
        <div class="otp-expiry">Valid for ${expiresInMinutes} minutes • Single Use Only</div>
      </div>

      <div class="notice">
        <strong>Security Notice:</strong> Never share this OTP with anyone, including RTI Assist staff or public authorities. If you did not request this code, you can safely ignore this email.
      </div>

      <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
        This email was generated in accordance with the security standards for the Right to Information Act, 2005 Citizen Portal.
      </p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} RTI Assist. Empowering Indian Citizens under Section 6(1) of the RTI Act.
    </div>
  </div>
</body>
</html>
  `.trim();

  // If no Brevo API key is configured or set to placeholder
  if (!brevoApiKey || brevoApiKey.includes('your_brevo') || brevoApiKey === '') {
    console.warn(`[Brevo Service] ⚠️ BREVO_API_KEY is not configured in .env.`);
    console.log(`[Brevo Service] 🔑 [DEV OTP CODE] =================================`);
    console.log(`[Brevo Service] 👉 EMAIL: ${toEmail}`);
    console.log(`[Brevo Service] 👉 OTP CODE: ${otp} (Valid for ${expiresInMinutes} mins)`);
    console.log(`[Brevo Service] ====================================================`);
    return {
      sent: false,
      devMode: true,
      message: 'Brevo API key not configured. OTP printed in backend console for testing.',
      otp,
    };
  }

  // Dispatch real email via Brevo REST API
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': brevoApiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: senderName,
          email: senderEmail,
        },
        to: [
          {
            email: toEmail,
            name: toName || 'Citizen User',
          },
        ],
        subject: `${otp} is your RTI Assist Verification Code`,
        htmlContent,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`[Brevo Service] ✅ Email delivered to ${toEmail} via Brevo! MessageId: ${data.messageId}`);
      return {
        sent: true,
        messageId: data.messageId,
      };
    } else {
      console.error(`[Brevo Service] ❌ Brevo API error (${response.status}):`, data);
      console.log(`[Brevo Service] 🔑 [FALLBACK DEV OTP CODE] -> ${otp}`);
      return {
        sent: false,
        error: data.message || 'Brevo API rejected email dispatch',
        devMode: true,
        otp,
      };
    }
  } catch (err) {
    console.error('[Brevo Service] ❌ Network error contacting Brevo API:', err.message);
    console.log(`[Brevo Service] 🔑 [FALLBACK DEV OTP CODE] -> ${otp}`);
    return {
      sent: false,
      error: err.message,
      devMode: true,
      otp,
    };
  }
}

/**
 * Issue and send an OTP for an email address
 */
export async function createAndSendOtp(email, name = 'Citizen') {
  const normalizedEmail = email.toLowerCase().trim();
  const otp = generateOtp();
  const expiresInMinutes = 10;
  const expiresAt = Date.now() + expiresInMinutes * 60 * 1000;

  // Rate limiting check: prevent spamming resend within 30 seconds
  const existing = otpStore.get(normalizedEmail);
  if (existing && Date.now() - existing.createdAt < 30 * 1000) {
    const waitSeconds = Math.ceil((30 * 1000 - (Date.now() - existing.createdAt)) / 1000);
    return {
      success: false,
      rateLimited: true,
      message: `Please wait ${waitSeconds} seconds before requesting a new OTP code.`,
    };
  }

  // Store in memory
  otpStore.set(normalizedEmail, {
    otp,
    expiresAt,
    attempts: 0,
    createdAt: Date.now(),
  });

  console.log(`[Brevo Service] 🔑 [OTP DISPATCH] Email: ${normalizedEmail} | Code: ${otp}`);

  const sendResult = await sendOtpEmail({
    toEmail: normalizedEmail,
    toName: name,
    otp,
    expiresInMinutes,
  });

  return {
    success: true,
    message: sendResult.sent
      ? `Verification OTP sent to ${normalizedEmail}`
      : `OTP generated for ${normalizedEmail} (logged to backend console)`,
    sentViaBrevo: sendResult.sent,
    devOtp: process.env.NODE_ENV !== 'production' ? otp : (sendResult.devMode ? otp : undefined),
  };
}

/**
 * Verify the user-entered OTP against the stored record
 */
export function verifyOtp(email, enteredOtp) {
  const normalizedEmail = email.toLowerCase().trim();
  const record = otpStore.get(normalizedEmail);

  if (!record) {
    return {
      valid: false,
      message: 'No active OTP found for this email. Please request a new code.',
    };
  }

  // Check expiration
  if (Date.now() > record.expiresAt) {
    otpStore.delete(normalizedEmail);
    return {
      valid: false,
      message: 'This OTP has expired. Please request a new one.',
    };
  }

  // Check attempt limit
  if (record.attempts >= 5) {
    otpStore.delete(normalizedEmail);
    return {
      valid: false,
      message: 'Too many incorrect attempts. Please request a new OTP code.',
    };
  }

  // Compare codes
  const cleanEntered = String(enteredOtp || '').trim();
  if (cleanEntered !== record.otp) {
    record.attempts += 1;
    const remaining = 5 - record.attempts;
    return {
      valid: false,
      message: `Invalid OTP code. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`,
    };
  }

  // Successfully verified! Consume OTP so it cannot be reused
  otpStore.delete(normalizedEmail);
  return {
    valid: true,
    message: 'OTP verified successfully.',
  };
}
