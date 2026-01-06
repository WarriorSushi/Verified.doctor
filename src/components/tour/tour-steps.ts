export interface TourStep {
  id: string;
  target: string; // CSS selector for target element (desktop)
  mobileTarget?: string; // CSS selector for mobile target (if different)
  title: string;
  description: string;
  placement: "top" | "bottom" | "left" | "right";
  mobilePlacement?: "top" | "bottom" | "left" | "right"; // Override placement for mobile
  route?: string; // If step requires navigation
}

export const DASHBOARD_TOUR_STEPS: TourStep[] = [
  {
    id: "view-profile",
    target: "[data-tour='view-profile-btn']",
    title: "See Your Public Page",
    description: "Click here to see how patients view your profile. Pro tip: Adding more details makes your page look more professional and trustworthy.",
    placement: "bottom",
    route: "/dashboard",
  },
  {
    id: "edit-profile",
    target: "[data-tour='edit-profile-btn']",
    title: "Customize Everything",
    description: "This is where the magic happens! Add your bio, education, hospital affiliations, services, conditions treated, consultation fees, and much more. A complete profile stands out.",
    placement: "bottom",
  },
  {
    id: "metrics",
    target: "[data-tour='metrics-row']",
    title: "Track Your Impact",
    description: "See real-time stats: profile views, patient recommendations, professional connections, and unread messages.",
    placement: "bottom",
  },
  {
    id: "qr-code",
    target: "[data-tour='qr-code']",
    title: "Your Clinic QR Code",
    description: "Print this for your reception desk. Patients scan to instantly save your contact and access your profile.",
    placement: "top",
    mobilePlacement: "top",
  },
  {
    id: "invite",
    target: "[data-tour='invite-section']",
    title: "Build Your Network",
    description: "Invite colleagues to connect. Doctors with larger networks appear more credible to patients.",
    placement: "top",
    mobilePlacement: "top",
  },
  {
    id: "messages",
    target: "[data-tour='nav-messages']",
    mobileTarget: "[data-tour='mobile-nav-messages']",
    title: "Patient Inquiries",
    description: "Receive and reply to patient messages directly from here. Your personal contact stays private.",
    placement: "bottom",
    mobilePlacement: "top",
  },
  {
    id: "connections",
    target: "[data-tour='nav-connections']",
    mobileTarget: "[data-tour='mobile-nav-connections']",
    title: "Your Connections",
    description: "Manage your professional network. Accept connection requests from colleagues.",
    placement: "bottom",
    mobilePlacement: "top",
  },
  {
    id: "analytics",
    target: "[data-tour='nav-analytics']",
    mobileTarget: "[data-tour='mobile-nav-analytics']",
    title: "Analytics Dashboard",
    description: "View detailed insights about your profile performance, visitor trends, and engagement metrics.",
    placement: "bottom",
    mobilePlacement: "top",
  },
  {
    id: "user-menu",
    target: "[data-tour='user-menu']",
    title: "You're All Set!",
    description: "Access settings, help, or restart this tour anytime from your profile menu. Welcome aboard!",
    placement: "bottom",
  },
];
