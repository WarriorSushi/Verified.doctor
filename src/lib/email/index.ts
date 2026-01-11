export {
  sendEmail,
  sendWelcomeEmail,
  sendVerificationApprovedEmail,
  sendNewMessageEmail,
  sendProfileViewsEmail,
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
