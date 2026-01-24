export {
  sendEmail,
  sendWelcomeEmail,
  sendVerificationApprovedEmail,
  sendNewMessageEmail,

  sendTrialOfferEmail,
  sendTrialClaimedEmail,
  sendInviteEmail,
  sendAccountBannedEmail,
  sendAdminMessageEmail,
  type SendEmailParams,
  type SendEmailResult,
} from "./send";

export {
  processTemplate,
  getDefaultVars,
  type TemplateVars,
} from "./templates";
