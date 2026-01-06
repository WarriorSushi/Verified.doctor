export interface TourStep {
  id: string;
  target: string; // CSS selector for target element
  title: string;
  description: string;
  placement: "top" | "bottom" | "left" | "right";
  route?: string; // If step requires navigation
}

export const DASHBOARD_TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    target: "[data-tour='profile-preview']",
    title: "Welcome to Your Dashboard",
    description: "This is your command center. Here you can see your profile preview, stats, and quick actions at a glance.",
    placement: "bottom",
    route: "/dashboard",
  },
  {
    id: "metrics",
    target: "[data-tour='metrics-row']",
    title: "Your Profile Stats",
    description: "Track your views, recommendations, connections, and messages. These metrics show how patients are engaging with your profile.",
    placement: "bottom",
  },
  {
    id: "qr-code",
    target: "[data-tour='qr-code']",
    title: "Your QR Code",
    description: "Download and print this QR code for your clinic. When patients scan it, they can instantly save your contact and access your profile.",
    placement: "left",
  },
  {
    id: "invite",
    target: "[data-tour='invite-section']",
    title: "Grow Your Network",
    description: "Invite colleagues to connect. A larger network builds credibility and increases your visibility to patients.",
    placement: "left",
  },
  {
    id: "messages",
    target: "[data-tour='nav-messages']",
    title: "Patient Messages",
    description: "Receive and respond to patient inquiries here. Your personal number stays private - replies are sent via SMS.",
    placement: "bottom",
  },
  {
    id: "connections",
    target: "[data-tour='nav-connections']",
    title: "Professional Network",
    description: "Manage your connections with other verified doctors. Accept requests and grow your professional network.",
    placement: "bottom",
  },
  {
    id: "analytics",
    target: "[data-tour='nav-analytics']",
    title: "Profile Analytics",
    description: "Coming soon: Detailed analytics about your profile views, popular times, and patient demographics.",
    placement: "bottom",
  },
  {
    id: "edit-profile",
    target: "[data-tour='edit-profile-btn']",
    title: "Edit Your Profile",
    description: "Customize your public profile here. Add your bio, education, services, and more to make your profile stand out.",
    placement: "bottom",
  },
  {
    id: "view-profile",
    target: "[data-tour='view-profile-btn']",
    title: "View Public Profile",
    description: "See how patients see your profile. Share this link with patients or add it to your social media.",
    placement: "bottom",
  },
  {
    id: "user-menu",
    target: "[data-tour='user-menu']",
    title: "Account Menu",
    description: "Access settings, help, and restart this tour anytime from here. You're all set to start building your professional presence!",
    placement: "bottom",
  },
];
