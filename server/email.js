import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "T/R Agency <onboarding@resend.dev>";
const REPLY_TO = "tragency.ops@proton.me";

export async function sendVerificationEmail(email, code) {
  const { error } = await resend.emails.send({
    from: FROM,
    to: email,
    reply_to: REPLY_TO,
    subject: "Verify Your Operational Access",
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0b0f19;font-family:'Inter',system-ui,sans-serif;color:#e6edf7;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0b0f19;padding:48px 24px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#0f1525;border:1px solid rgba(56,189,248,0.2);border-radius:16px;padding:40px;">
        <tr><td>
          <p style="margin:0 0 8px;font-family:'JetBrains Mono',monospace;font-size:11px;color:#38bdf8;letter-spacing:0.15em;text-transform:uppercase;">// T/R Agency Operational Access</p>
          <h1 style="margin:0 0 32px;font-size:22px;font-weight:800;letter-spacing:-0.02em;color:#e6edf7;">Verify Your Access</h1>
          <p style="margin:0 0 24px;font-size:15px;color:#8b97ad;line-height:1.6;">Your verification code:</p>
          <div style="background:#0b0f19;border:1px solid rgba(56,189,248,0.35);border-radius:12px;padding:24px;text-align:center;margin-bottom:28px;">
            <span style="font-family:'JetBrains Mono',monospace;font-size:36px;font-weight:700;letter-spacing:0.22em;color:#38bdf8;">${code}</span>
          </div>
          <p style="margin:0 0 16px;font-size:14px;color:#8b97ad;line-height:1.6;">Enter this code to activate your operational access account. This code expires in <strong style="color:#e6edf7;">10 minutes</strong>.</p>
          <p style="margin:0 0 32px;font-size:13px;color:#5c6781;line-height:1.5;">If you did not request this access, you may ignore this email.</p>
          <hr style="border:none;border-top:1px solid rgba(56,189,248,0.1);margin:0 0 24px;">
          <p style="margin:0;font-size:12px;color:#5c6781;">T/R Agency Operations · Check spam/promotions folder if email is delayed.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
  if (error) throw new Error(error.message);
}

export async function sendResetEmail(email, code) {
  const { error } = await resend.emails.send({
    from: FROM,
    to: email,
    reply_to: REPLY_TO,
    subject: "Reset Your Operational Access Password",
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0b0f19;font-family:'Inter',system-ui,sans-serif;color:#e6edf7;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0b0f19;padding:48px 24px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#0f1525;border:1px solid rgba(56,189,248,0.2);border-radius:16px;padding:40px;">
        <tr><td>
          <p style="margin:0 0 8px;font-family:'JetBrains Mono',monospace;font-size:11px;color:#38bdf8;letter-spacing:0.15em;text-transform:uppercase;">// T/R Agency Operational Access</p>
          <h1 style="margin:0 0 32px;font-size:22px;font-weight:800;letter-spacing:-0.02em;color:#e6edf7;">Password Reset</h1>
          <p style="margin:0 0 24px;font-size:15px;color:#8b97ad;line-height:1.6;">Your password reset code:</p>
          <div style="background:#0b0f19;border:1px solid rgba(56,189,248,0.35);border-radius:12px;padding:24px;text-align:center;margin-bottom:28px;">
            <span style="font-family:'JetBrains Mono',monospace;font-size:36px;font-weight:700;letter-spacing:0.22em;color:#38bdf8;">${code}</span>
          </div>
          <p style="margin:0 0 16px;font-size:14px;color:#8b97ad;line-height:1.6;">Enter this code to reset your password. This code expires in <strong style="color:#e6edf7;">15 minutes</strong>.</p>
          <p style="margin:0 0 32px;font-size:13px;color:#5c6781;line-height:1.5;">If you did not request this reset, ignore this email.</p>
          <hr style="border:none;border-top:1px solid rgba(56,189,248,0.1);margin:0 0 24px;">
          <p style="margin:0;font-size:12px;color:#5c6781;">T/R Agency Operations · Check spam/promotions folder if email is delayed.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
  if (error) throw new Error(error.message);
}
