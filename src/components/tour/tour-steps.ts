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
    id: "welcome",
    target: "[data-tour='profile-preview']",
    title: "Your Profile at a Glance",
    description: "Welcome! This card shows how you appear to patients. Your photo, name, specialty, and profile link are all here.",
    placement: "bottom",
    route: "/dashboard",
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
    description: "Receive and reply to patient messages. Your personal number stays private — replies go via SMS.",
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
    description: "Coming soon: Deep insights into your profile performance, visitor trends, and engagement metrics.",
    placement: "bottom",
    mobilePlacement: "top",
  },
  {
    id: "edit-profile",
    target: "[data-tour='edit-profile-btn']",
    title: "Customize Your Page",
    description: "Add your bio, education, services, and more. A complete profile gets more patient trust.",
    placement: "bottom",
  },
  {
    id: "view-profile",
    target: "[data-tour='view-profile-btn']",
    title: "Preview & Share",
    description: "See exactly what patients see. Copy the link to share on social media or your website.",
    placement: "bottom",
  },
  {
    id: "user-menu",
    target: "[data-tour='user-menu']",
    title: "You're All Set!",
    description: "Access settings, help, or restart this tour anytime from your profile menu. Welcome aboard!",
    placement: "bottom",
  },
];
