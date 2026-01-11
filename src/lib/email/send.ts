import { Resend } from "resend";

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// For development, use Resend's test domain
// For production, verify your domain at resend.com and use noreply@verified.doctor
const FROM_EMAIL = process.env.NODE_ENV === "production"
  ? "Verified.Doctor <noreply@verified.doctor>"
  : "Verified.Doctor <onboarding@resend.dev>";

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send an email using Resend
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  replyTo,
}: SendEmailParams): Promise<SendEmailResult> {
  // Check if API key is configured
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY not configured, skipping email send");
    return { success: false, error: "Email service not configured. Please set RESEND_API_KEY." };
  }

  // Log sender info for debugging
  console.log(`[email] Attempting to send from: ${FROM_EMAIL} to: ${to}`);
  console.log(`[email] Environment: ${process.env.NODE_ENV || "development"}`);

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      text,
      replyTo,
    });

    if (error) {
      console.error("[email] Resend API error:", JSON.stringify(error, null, 2));
      // Provide more helpful error messages
      let errorMessage = error.message;
      if (error.message?.includes("domain")) {
        errorMessage = "Email domain not verified. Verify verified.doctor in Resend dashboard.";
      } else if (error.message?.includes("not allowed")) {
        errorMessage = "Sender email not authorized. Check Resend domain settings.";
      }
      return { success: false, error: errorMessage };
    }

    console.log(`[email] Successfully sent to ${to}: ${subject} (ID: ${data?.id})`);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error("[email] Send exception:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown email error",
    };
  }
}

/**
 * Send a welcome email to a new user
 */
export async function sendWelcomeEmail(
  to: string,
  name: string,
  handle: string
): Promise<SendEmailResult> {
  const profileUrl = `https://verified.doctor/${handle}`;
  const dashboardUrl = "https://verified.doctor/dashboard";

  const subject = `Welcome to Verified.Doctor, ${name}!`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; margin: 0; padding: 0; background: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background: white; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { width: 48px; height: 48px; }
    h1 { color: #0f172a; font-size: 24px; margin: 0 0 16px 0; }
    p { color: #475569; line-height: 1.6; margin: 0 0 16px 0; }
    .profile-url { background: #f1f5f9; padding: 12px 16px; border-radius: 8px; font-family: monospace; color: #0099F7; text-decoration: none; display: block; margin: 16px 0; }
    .button { display: inline-block; background: linear-gradient(135deg, #0099F7 0%, #0080CC 100%); color: white !important; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 16px 0; }
    .footer { text-align: center; margin-top: 30px; color: #94a3b8; font-size: 14px; }
    .steps { background: #f8fafc; border-radius: 8px; padding: 20px; margin: 24px 0; }
    .step { display: flex; align-items: flex-start; margin-bottom: 12px; }
    .step:last-child { margin-bottom: 0; }
    .step-num { background: #0099F7; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; margin-right: 12px; flex-shrink: 0; }
    .step-text { color: #475569; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <img src="https://verified.doctor/verified-doctor-logo.svg" alt="Verified.Doctor" class="logo" />
      </div>

      <h1>Welcome to Verified.Doctor, ${name}!</h1>

      <p>Your professional profile is now live. Patients can find you at:</p>

      <a href="${profileUrl}" class="profile-url">${profileUrl}</a>

      <div class="steps">
        <p style="font-weight: 600; margin-bottom: 16px; color: #0f172a;">Next steps to maximize your profile:</p>
        <div class="step">
          <span class="step-num">1</span>
          <span class="step-text">Complete your profile with photo, bio, and qualifications</span>
        </div>
        <div class="step">
          <span class="step-num">2</span>
          <span class="step-text">Upload verification documents to get your verified badge</span>
        </div>
        <div class="step">
          <span class="step-num">3</span>
          <span class="step-text">Invite colleagues to grow your professional network</span>
        </div>
      </div>

      <center>
        <a href="${dashboardUrl}" class="button">Go to Dashboard</a>
      </center>
    </div>

    <div class="footer">
      <p>Verified.Doctor - Your Digital Identity, Verified.</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
Welcome to Verified.Doctor, ${name}!

Your professional profile is now live at: ${profileUrl}

Next steps:
1. Complete your profile with photo, bio, and qualifications
2. Upload verification documents to get your verified badge
3. Invite colleagues to grow your professional network

Go to your dashboard: ${dashboardUrl}

- The Verified.Doctor Team
  `.trim();

  return sendEmail({ to, subject, html, text });
}

/**
 * Send a verification approved email
 */
export async function sendVerificationApprovedEmail(
  to: string,
  name: string,
  handle: string
): Promise<SendEmailResult> {
  const profileUrl = `https://verified.doctor/${handle}`;

  const subject = `Congratulations! You're now a Verified Physician`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; margin: 0; padding: 0; background: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background: white; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 30px; }
    .badge { width: 80px; height: 80px; margin: 0 auto 20px; }
    h1 { color: #0f172a; font-size: 24px; margin: 0 0 16px 0; text-align: center; }
    p { color: #475569; line-height: 1.6; margin: 0 0 16px 0; }
    .highlight { background: linear-gradient(135deg, #0099F7 0%, #0080CC 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 24px 0; }
    .highlight p { color: white; margin: 0; }
    .button { display: inline-block; background: linear-gradient(135deg, #0099F7 0%, #0080CC 100%); color: white !important; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; }
    .footer { text-align: center; margin-top: 30px; color: #94a3b8; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <img src="https://verified.doctor/verified-doctor-logo.svg" alt="Verified Badge" class="badge" />
      </div>

      <h1>Congratulations, Dr. ${name}!</h1>

      <p>Your credentials have been verified. You now have the <strong>Verified Physician</strong> badge on your profile.</p>

      <div class="highlight">
        <p>Your verified profile is live at:</p>
        <p style="font-size: 18px; font-weight: 600; margin-top: 8px;">${profileUrl}</p>
      </div>

      <p>The verified badge helps patients trust your credentials and distinguishes you as a legitimate medical professional.</p>

      <center>
        <a href="${profileUrl}" class="button">View Your Profile</a>
      </center>
    </div>

    <div class="footer">
      <p>Verified.Doctor - Your Digital Identity, Verified.</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
Congratulations, Dr. ${name}!

Your credentials have been verified. You now have the Verified Physician badge on your profile.

Your verified profile is live at: ${profileUrl}

The verified badge helps patients trust your credentials and distinguishes you as a legitimate medical professional.

- The Verified.Doctor Team
  `.trim();

  return sendEmail({ to, subject, html, text });
}

/**
 * Send an invite email to a colleague
 */
export async function sendInviteEmail(
  to: string,
  inviterName: string,
  inviterHandle: string,
  inviteUrl: string
): Promise<SendEmailResult> {
  const inviterProfileUrl = `https://verified.doctor/${inviterHandle}`;

  const subject = `${inviterName} invited you to join Verified.Doctor`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; margin: 0; padding: 0; background: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background: white; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { width: 48px; height: 48px; }
    h1 { color: #0f172a; font-size: 24px; margin: 0 0 16px 0; }
    p { color: #475569; line-height: 1.6; margin: 0 0 16px 0; }
    .inviter-card { background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 1px solid #bae6fd; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center; }
    .inviter-name { font-size: 18px; font-weight: 600; color: #0369a1; margin-bottom: 4px; }
    .inviter-handle { font-size: 14px; color: #0284c7; }
    .button { display: inline-block; background: linear-gradient(135deg, #0099F7 0%, #0080CC 100%); color: white !important; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; }
    .footer { text-align: center; margin-top: 30px; color: #94a3b8; font-size: 14px; }
    .benefits { background: #f8fafc; border-radius: 8px; padding: 20px; margin: 24px 0; }
    .benefit { display: flex; align-items: flex-start; margin-bottom: 12px; }
    .benefit:last-child { margin-bottom: 0; }
    .benefit-icon { color: #0099F7; margin-right: 12px; font-weight: bold; }
    .benefit-text { color: #475569; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <img src="https://verified.doctor/verified-doctor-logo.svg" alt="Verified.Doctor" class="logo" />
      </div>

      <h1>You've been invited!</h1>

      <p>${inviterName} has invited you to join Verified.Doctor, the professional network for verified medical professionals.</p>

      <div class="inviter-card">
        <div class="inviter-name">${inviterName}</div>
        <div class="inviter-handle">verified.doctor/${inviterHandle}</div>
      </div>

      <div class="benefits">
        <p style="font-weight: 600; margin-bottom: 16px; color: #0f172a;">Why join Verified.Doctor?</p>
        <div class="benefit">
          <span class="benefit-icon">✓</span>
          <span class="benefit-text">Get your own verified profile URL</span>
        </div>
        <div class="benefit">
          <span class="benefit-icon">✓</span>
          <span class="benefit-text">Build your professional network with peers</span>
        </div>
        <div class="benefit">
          <span class="benefit-icon">✓</span>
          <span class="benefit-text">Receive patient recommendations (no negative reviews)</span>
        </div>
        <div class="benefit">
          <span class="benefit-icon">✓</span>
          <span class="benefit-text">Automatically connect with ${inviterName}</span>
        </div>
      </div>

      <center>
        <a href="${inviteUrl}" class="button">Accept Invitation</a>
      </center>

      <p style="margin-top: 24px; font-size: 14px; color: #64748b;">
        By accepting this invitation, you'll automatically be connected with ${inviterName} on Verified.Doctor.
      </p>
    </div>

    <div class="footer">
      <p>Verified.Doctor - Your Digital Identity, Verified.</p>
      <p style="font-size: 12px; margin-top: 8px;">
        <a href="${inviterProfileUrl}" style="color: #0099F7;">View ${inviterName}'s profile</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
${inviterName} has invited you to join Verified.Doctor!

Verified.Doctor is the professional network for verified medical professionals.

Why join?
- Get your own verified profile URL
- Build your professional network with peers
- Receive patient recommendations (no negative reviews)
- Automatically connect with ${inviterName}

Accept the invitation: ${inviteUrl}

By accepting, you'll automatically be connected with ${inviterName}.

- The Verified.Doctor Team
  `.trim();

  return sendEmail({ to, subject, html, text });
}

/**
 * Send a new message notification email
 */
export async function sendNewMessageEmail(
  to: string,
  doctorName: string,
  senderName: string,
  messagePreview: string
): Promise<SendEmailResult> {
  const dashboardUrl = "https://verified.doctor/dashboard/messages";

  const subject = `New inquiry from ${senderName}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; margin: 0; padding: 0; background: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background: white; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    h1 { color: #0f172a; font-size: 20px; margin: 0 0 16px 0; }
    p { color: #475569; line-height: 1.6; margin: 0 0 16px 0; }
    .message-box { background: #f1f5f9; padding: 16px; border-radius: 8px; border-left: 4px solid #0099F7; margin: 20px 0; }
    .message-box p { margin: 0; color: #334155; }
    .sender { font-weight: 600; color: #0f172a; margin-bottom: 8px; }
    .button { display: inline-block; background: linear-gradient(135deg, #0099F7 0%, #0080CC 100%); color: white !important; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; }
    .footer { text-align: center; margin-top: 30px; color: #94a3b8; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <h1>New inquiry for Dr. ${doctorName}</h1>

      <p>You received a new message from a patient:</p>

      <div class="message-box">
        <p class="sender">${senderName}</p>
        <p>${messagePreview}${messagePreview.length >= 100 ? "..." : ""}</p>
      </div>

      <center>
        <a href="${dashboardUrl}" class="button">View & Reply</a>
      </center>
    </div>

    <div class="footer">
      <p>Verified.Doctor - Your Digital Identity, Verified.</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
New inquiry for Dr. ${doctorName}

You received a new message from ${senderName}:

"${messagePreview}${messagePreview.length >= 100 ? "..." : ""}"

View and reply: ${dashboardUrl}

- The Verified.Doctor Team
  `.trim();

  return sendEmail({ to, subject, html, text });
}

/**
 * Send a profile views notification email
 */
export async function sendProfileViewsEmail(
  to: string,
  name: string,
  handle: string,
  viewCount: number
): Promise<SendEmailResult> {
  const dashboardUrl = "https://verified.doctor/dashboard";
  const profileBuilderUrl = "https://verified.doctor/dashboard/profile-builder?tab=content";

  const subject = `${viewCount} people viewed your profile on Verified.Doctor`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; margin: 0; padding: 0; background: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background: white; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 30px; }
    .highlight { font-size: 48px; font-weight: bold; background: linear-gradient(135deg, #10B981 0%, #059669 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    h1 { color: #0f172a; font-size: 24px; margin: 0 0 16px 0; text-align: center; }
    p { color: #475569; line-height: 1.6; margin: 0 0 16px 0; }
    .tip-box { background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 12px; padding: 24px; margin: 24px 0; }
    .tip-box h3 { color: #0369a1; font-size: 16px; margin: 0 0 12px 0; }
    .tip-item { display: flex; align-items: flex-start; margin-bottom: 10px; }
    .tip-item:last-child { margin-bottom: 0; }
    .tip-icon { color: #0099F7; margin-right: 10px; font-weight: bold; }
    .tip-text { color: #475569; font-size: 14px; }
    .button { display: inline-block; background: linear-gradient(135deg, #0099F7 0%, #0080CC 100%); color: white !important; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; }
    .footer { text-align: center; margin-top: 30px; color: #94a3b8; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <div class="highlight">${viewCount}</div>
        <p style="color: #64748b; margin-top: 8px;">people viewed your profile</p>
      </div>

      <h1>Great news, ${name}!</h1>

      <p>Your profile at <strong>verified.doctor/${handle}</strong> is getting noticed. Keep building your presence to attract more patients and colleagues.</p>

      <div class="tip-box">
        <h3>Boost your profile with these features:</h3>
        <div class="tip-item">
          <span class="tip-icon">+</span>
          <span class="tip-text"><strong>Video Introduction</strong> - Share a personal message with visitors</span>
        </div>
        <div class="tip-item">
          <span class="tip-icon">+</span>
          <span class="tip-text"><strong>Education Timeline</strong> - Showcase your qualifications</span>
        </div>
        <div class="tip-item">
          <span class="tip-icon">+</span>
          <span class="tip-text"><strong>Case Studies</strong> - Highlight your expertise</span>
        </div>
        <div class="tip-item">
          <span class="tip-icon">+</span>
          <span class="tip-text"><strong>Hospital Affiliations</strong> - Build credibility</span>
        </div>
        <div class="tip-item">
          <span class="tip-icon">+</span>
          <span class="tip-text"><strong>Clinic Gallery</strong> - Show your practice space</span>
        </div>
      </div>

      <center>
        <a href="${profileBuilderUrl}" class="button">Enhance Your Profile</a>
      </center>
    </div>

    <div class="footer">
      <p>Verified.Doctor - Your Digital Identity, Verified.</p>
      <p style="font-size: 12px; margin-top: 8px;">
        <a href="${dashboardUrl}" style="color: #0099F7;">Go to Dashboard</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
Great news, ${name}!

${viewCount} people viewed your profile at verified.doctor/${handle}.

Boost your profile with these features:
- Video Introduction - Share a personal message with visitors
- Education Timeline - Showcase your qualifications
- Case Studies - Highlight your expertise
- Hospital Affiliations - Build credibility
- Clinic Gallery - Show your practice space

Enhance your profile: ${profileBuilderUrl}

- The Verified.Doctor Team
  `.trim();

  return sendEmail({ to, subject, html, text });
}

/**
 * Send a trial offer email to new users
 */
export async function sendTrialOfferEmail(
  to: string,
  name: string,
  handle: string
): Promise<SendEmailResult> {
  const dashboardUrl = "https://verified.doctor/dashboard";

  const subject = `You've been selected for free Pro access!`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; margin: 0; padding: 0; background: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background: white; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 30px; }
    .badge { display: inline-block; background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: white; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    h1 { color: #0f172a; font-size: 24px; margin: 16px 0; }
    p { color: #475569; line-height: 1.6; margin: 0 0 16px 0; }
    .offer-box { background: linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%); border: 2px solid #FCD34D; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center; }
    .offer-box h2 { color: #92400E; font-size: 20px; margin: 0 0 8px 0; }
    .offer-box p { color: #A16207; margin: 0; }
    .features { background: #f8fafc; border-radius: 12px; padding: 24px; margin: 24px 0; }
    .features h3 { color: #0f172a; font-size: 16px; margin: 0 0 16px 0; }
    .feature-item { display: flex; align-items: center; margin-bottom: 12px; }
    .feature-item:last-child { margin-bottom: 0; }
    .feature-check { color: #10B981; margin-right: 10px; font-weight: bold; }
    .feature-text { color: #475569; font-size: 14px; }
    .button { display: inline-block; background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: white !important; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; }
    .footer { text-align: center; margin-top: 30px; color: #94a3b8; font-size: 14px; }
    .fine-print { font-size: 12px; color: #94a3b8; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <span class="badge">Exclusive Offer</span>
        <h1>Congratulations, ${name}!</h1>
        <p>Your profile has been randomly selected for our Pro trial program.</p>
      </div>

      <div class="offer-box">
        <h2>30 Days of Pro - FREE</h2>
        <p>Invite 2 colleagues to join Verified.Doctor</p>
      </div>

      <div class="features">
        <h3>What you'll unlock with Pro:</h3>
        <div class="feature-item">
          <span class="feature-check">&#10003;</span>
          <span class="feature-text">Premium profile templates (Timeline, Magazine, Grid, Minimal)</span>
        </div>
        <div class="feature-item">
          <span class="feature-check">&#10003;</span>
          <span class="feature-text">Exclusive color themes (Sage, Warm, Teal, Executive)</span>
        </div>
        <div class="feature-item">
          <span class="feature-check">&#10003;</span>
          <span class="feature-text">Video introduction & clinic gallery</span>
        </div>
        <div class="feature-item">
          <span class="feature-check">&#10003;</span>
          <span class="feature-text">Unlimited connections & messages</span>
        </div>
        <div class="feature-item">
          <span class="feature-check">&#10003;</span>
          <span class="feature-text">Extended analytics (90 days, 1 year)</span>
        </div>
        <div class="feature-item">
          <span class="feature-check">&#10003;</span>
          <span class="feature-text">Custom QR code colors</span>
        </div>
      </div>

      <center>
        <a href="${dashboardUrl}" class="button">Claim Your Free Pro</a>
        <p class="fine-print">No credit card required. No strings attached.</p>
      </center>
    </div>

    <div class="footer">
      <p>Verified.Doctor - Your Digital Identity, Verified.</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
Congratulations, ${name}!

Your profile has been randomly selected for our Pro trial program.

30 DAYS OF PRO - FREE
Invite 2 colleagues to join Verified.Doctor

What you'll unlock with Pro:
- Premium profile templates (Timeline, Magazine, Grid, Minimal)
- Exclusive color themes (Sage, Warm, Teal, Executive)
- Video introduction & clinic gallery
- Unlimited connections & messages
- Extended analytics (90 days, 1 year)
- Custom QR code colors

Claim your free Pro: ${dashboardUrl}

No credit card required. No strings attached.

- The Verified.Doctor Team
  `.trim();

  return sendEmail({ to, subject, html, text });
}

/**
 * Send a trial claimed/activated email
 */
export async function sendTrialClaimedEmail(
  to: string,
  name: string,
  expiryDate: Date
): Promise<SendEmailResult> {
  const dashboardUrl = "https://verified.doctor/dashboard";
  const formattedExpiry = expiryDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const subject = `Your 30-day Pro trial is now active!`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; margin: 0; padding: 0; background: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background: white; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 30px; }
    .celebration { font-size: 48px; margin-bottom: 16px; }
    h1 { color: #0f172a; font-size: 24px; margin: 0 0 16px 0; }
    p { color: #475569; line-height: 1.6; margin: 0 0 16px 0; }
    .pro-badge { display: inline-block; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 12px 24px; border-radius: 8px; font-weight: 600; margin: 16px 0; }
    .expiry-box { background: #f8fafc; border-radius: 8px; padding: 16px; text-align: center; margin: 24px 0; }
    .expiry-box p { margin: 0; color: #64748b; font-size: 14px; }
    .expiry-box .date { color: #0f172a; font-weight: 600; font-size: 16px; margin-top: 4px; }
    .button { display: inline-block; background: linear-gradient(135deg, #0099F7 0%, #0080CC 100%); color: white !important; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; }
    .footer { text-align: center; margin-top: 30px; color: #94a3b8; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <div class="celebration">&#127881;</div>
        <h1>Welcome to Pro, ${name}!</h1>
        <p>Your 30-day Pro trial is now active. Enjoy all premium features!</p>
        <div class="pro-badge">PRO ACCESS UNLOCKED</div>
      </div>

      <div class="expiry-box">
        <p>Your trial ends on</p>
        <p class="date">${formattedExpiry}</p>
      </div>

      <p>Here's what you can do now:</p>
      <ul style="color: #475569; line-height: 2;">
        <li>Switch to premium templates in Profile Builder</li>
        <li>Try exclusive color themes</li>
        <li>Add video introduction and clinic gallery</li>
        <li>View extended analytics</li>
        <li>Connect with unlimited colleagues</li>
      </ul>

      <center>
        <a href="${dashboardUrl}" class="button">Explore Pro Features</a>
      </center>
    </div>

    <div class="footer">
      <p>Verified.Doctor - Your Digital Identity, Verified.</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
Welcome to Pro, ${name}!

Your 30-day Pro trial is now active. Enjoy all premium features!

Your trial ends on: ${formattedExpiry}

Here's what you can do now:
- Switch to premium templates in Profile Builder
- Try exclusive color themes
- Add video introduction and clinic gallery
- View extended analytics
- Connect with unlimited colleagues

Explore Pro features: ${dashboardUrl}

- The Verified.Doctor Team
  `.trim();

  return sendEmail({ to, subject, html, text });
}

/**
 * Send an admin message notification email
 */
export async function sendAdminMessageEmail(
  to: string,
  doctorName: string,
  message: string
): Promise<SendEmailResult> {
  const dashboardUrl = "https://verified.doctor/dashboard/messages";

  const subject = `Important message from the Verified.Doctor Team`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; margin: 0; padding: 0; background: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background: white; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { width: 48px; height: 48px; margin-bottom: 16px; }
    .badge { display: inline-flex; align-items: center; gap: 6px; background: linear-gradient(135deg, #EC4899 0%, #DB2777 100%); color: white; padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; }
    h1 { color: #0f172a; font-size: 22px; margin: 16px 0 8px 0; }
    p { color: #475569; line-height: 1.6; margin: 0 0 16px 0; }
    .message-box { background: linear-gradient(135deg, #FDF2F8 0%, #FCE7F3 100%); border: 1px solid #FBCFE8; border-left: 4px solid #EC4899; border-radius: 8px; padding: 20px; margin: 24px 0; }
    .message-box p { margin: 0; color: #831843; line-height: 1.7; }
    .button { display: inline-block; background: linear-gradient(135deg, #0099F7 0%, #0080CC 100%); color: white !important; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; }
    .footer { text-align: center; margin-top: 30px; color: #94a3b8; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <img src="https://verified.doctor/verified-doctor-logo.svg" alt="Verified.Doctor" class="logo" />
        <div class="badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          Admin Message
        </div>
        <h1>Hello, Dr. ${doctorName}</h1>
        <p>You have an important message from our team:</p>
      </div>

      <div class="message-box">
        <p>${message.replace(/\\n/g, '<br>')}</p>
      </div>

      <p>This message has also been added to your inbox on Verified.Doctor.</p>

      <center>
        <a href="${dashboardUrl}" class="button">View in Dashboard</a>
      </center>
    </div>

    <div class="footer">
      <p>Verified.Doctor - Your Digital Identity, Verified.</p>
      <p style="font-size: 12px; margin-top: 8px;">
        This is an official communication from the Verified.Doctor team.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
Hello, Dr. ${doctorName}

You have an important message from the Verified.Doctor Team:

---
${message}
---

This message has also been added to your inbox on Verified.Doctor.

View in dashboard: ${dashboardUrl}

- The Verified.Doctor Team
  `.trim();

  return sendEmail({ to, subject, html, text });
}