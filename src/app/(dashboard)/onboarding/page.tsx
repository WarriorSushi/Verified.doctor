"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  ArrowRight,
  Check,
  Upload,
  X,
  ExternalLink,
  Sparkles,
  Users,
  AlertCircle,
  Layout,
  Palette,
  Star,
  MapPin,
  Clock,
  ThumbsUp,
  Calendar,
  Smartphone,
  GraduationCap,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageCropper } from "@/components/ui/image-cropper";
import { AIEnhanceButton } from "@/components/ui/ai-enhance-button";
import { AISuggestTags } from "@/components/ui/ai-suggest-tags";
import { uploadProfilePhoto } from "@/lib/upload";
import { getUser } from "@/lib/auth/client";
import { LAYOUTS, THEMES, ThemeConfig } from "@/lib/theme-config";

// Progress Bar Component
function ProgressBar({ step, totalSteps }: { step: number; totalSteps: number }) {
  const progress = (step / totalSteps) * 100;

  return (
    <div className="w-full max-w-md mx-auto mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-medium text-slate-500">Step {step} of {totalSteps}</span>
        <span className="text-xs font-semibold text-[#0099F7]">{Math.round(progress)}%</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-[#0099F7] to-[#0080CC] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

// Doctor Data Interface for Previews
interface DoctorPreviewData {
  fullName: string;
  specialty: string;
  profilePhoto: string | null;
  clinicLocation: string;
  qualifications: string;
  yearsExperience: string;
}

// Phone Frame Wrapper for Preview Cards
function PhoneFrame({ children, selected }: { children: React.ReactNode; selected?: boolean }) {
  return (
    <div className={`relative transition-all duration-300 ${selected ? 'scale-[1.02]' : ''}`}>
      {/* Phone Frame */}
      <div className="relative rounded-[16px] bg-slate-900 p-1 shadow-xl">
        {/* Screen */}
        <div className="relative rounded-[12px] overflow-hidden bg-white aspect-[9/16] w-full">
          {/* Status Bar */}
          <div className="absolute top-0 left-0 right-0 h-4 bg-black/5 flex items-center justify-between px-3 z-10">
            <span className="text-[6px] text-slate-400 font-medium">9:41</span>
            <div className="flex items-center gap-0.5">
              <div className="w-2 h-1.5 bg-slate-400 rounded-sm" />
              <div className="w-1 h-1 bg-slate-400 rounded-full" />
            </div>
          </div>
          {/* Content */}
          <div className="absolute inset-0 pt-4 overflow-hidden">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// Mini preview components for layout selection with actual doctor data
function LayoutPreview({ layoutId, doctor }: { layoutId: string; doctor: DoctorPreviewData }) {
  const displayName = doctor.fullName || "Dr. Your Name";
  const displaySpecialty = doctor.specialty || "Your Specialty";
  const displayLocation = doctor.clinicLocation || "Location";
  const initials = displayName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  // Profile Photo Component
  const ProfilePhoto = ({ size = "w-8 h-8", className = "" }: { size?: string; className?: string }) => (
    <div className={`${size} rounded-full overflow-hidden bg-gradient-to-br from-[#0099F7] to-[#0080CC] flex items-center justify-center ${className}`}>
      {doctor.profilePhoto ? (
        <Image src={doctor.profilePhoto} alt="" fill className="object-cover" />
      ) : (
        <span className="text-white text-[8px] font-bold">{initials}</span>
      )}
    </div>
  );

  switch (layoutId) {
    case "classic":
      return (
        <div className="h-full flex flex-col items-center p-3 bg-white">
          {/* Classic: Clean centered single-column */}
          <ProfilePhoto size="w-10 h-10" className="mb-2 relative" />
          <div className="flex items-center gap-1 mb-0.5">
            <p className="text-[7px] font-semibold text-slate-800 truncate max-w-[60px]">{displayName}</p>
            <div className="w-2.5 h-2.5 relative flex-shrink-0">
              <Image src="/verified-doctor-logo.svg" alt="" fill />
            </div>
          </div>
          <p className="text-[6px] text-[#0099F7] font-medium mb-1">{displaySpecialty}</p>
          <div className="flex items-center gap-0.5 text-[5px] text-slate-400 mb-2">
            <MapPin className="w-1.5 h-1.5" />
            <span className="truncate max-w-[50px]">{displayLocation}</span>
          </div>
          <div className="w-full h-px bg-slate-100 my-2" />
          <div className="flex gap-3 text-center">
            <div>
              <p className="text-[8px] font-bold text-slate-800">42</p>
              <p className="text-[5px] text-slate-400 uppercase">Recs</p>
            </div>
            <div>
              <p className="text-[8px] font-bold text-slate-800">18</p>
              <p className="text-[5px] text-slate-400 uppercase">Conns</p>
            </div>
          </div>
          <div className="w-full mt-auto">
            <div className="bg-[#0099F7] text-white text-[5px] py-1.5 rounded-full text-center font-medium">
              Book Appointment
            </div>
          </div>
        </div>
      );

    case "hero":
      return (
        <div className="h-full flex flex-col bg-white">
          {/* Hero: Bold full-bleed header */}
          <div className="h-[45%] bg-gradient-to-br from-[#0099F7] to-[#0080CC] relative">
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
              <div className="w-12 h-12 rounded-full border-2 border-white shadow-lg overflow-hidden bg-gradient-to-br from-[#0099F7] to-[#0080CC] flex items-center justify-center">
                {doctor.profilePhoto ? (
                  <Image src={doctor.profilePhoto} alt="" fill className="object-cover" />
                ) : (
                  <span className="text-white text-[10px] font-bold">{initials}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex-1 pt-6 px-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <p className="text-[7px] font-bold text-slate-800 truncate max-w-[60px]">{displayName}</p>
              <div className="w-2.5 h-2.5 relative flex-shrink-0">
                <Image src="/verified-doctor-logo.svg" alt="" fill />
              </div>
            </div>
            <p className="text-[5px] text-[#0099F7] font-medium">{displaySpecialty}</p>
            <div className="flex justify-center gap-2 mt-2">
              <div className="bg-slate-100 rounded-lg px-2 py-1">
                <p className="text-[6px] font-bold text-slate-700">42</p>
                <p className="text-[4px] text-slate-400">Recs</p>
              </div>
              <div className="bg-slate-100 rounded-lg px-2 py-1">
                <p className="text-[6px] font-bold text-slate-700">18</p>
                <p className="text-[4px] text-slate-400">Conns</p>
              </div>
            </div>
          </div>
        </div>
      );

    case "timeline":
      return (
        <div className="h-full bg-[#FFFBF7] p-3">
          {/* Timeline: Editorial with vertical line */}
          <div className="flex gap-2">
            <div className="flex flex-col items-center">
              <ProfilePhoto size="w-8 h-8" className="relative" />
              <div className="w-px flex-1 bg-amber-200 mt-1" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1">
                <p className="text-[7px] font-serif font-semibold text-amber-900 truncate max-w-[50px]">{displayName}</p>
                <div className="w-2 h-2 relative flex-shrink-0">
                  <Image src="/verified-doctor-logo.svg" alt="" fill />
                </div>
              </div>
              <p className="text-[5px] text-amber-600 italic">{displaySpecialty}</p>
              <div className="mt-2 space-y-1.5">
                <div className="flex items-start gap-1">
                  <div className="w-1 h-1 rounded-full bg-amber-400 mt-0.5" />
                  <p className="text-[5px] text-amber-700">MBBS, MD</p>
                </div>
                <div className="flex items-start gap-1">
                  <div className="w-1 h-1 rounded-full bg-amber-300 mt-0.5" />
                  <p className="text-[5px] text-amber-600">12+ Years</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case "magazine":
      return (
        <div className="h-full flex bg-white">
          {/* Magazine: Asymmetric split layout */}
          <div className="w-[45%] bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden">
            {doctor.profilePhoto ? (
              <Image src={doctor.profilePhoto} alt="" fill className="object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#0099F7]/20 to-[#0080CC]/20">
                <span className="text-[#0099F7] text-lg font-bold">{initials}</span>
              </div>
            )}
          </div>
          <div className="flex-1 p-3 flex flex-col justify-center">
            <p className="text-[5px] text-[#0099F7] font-medium uppercase tracking-wider mb-0.5">{displaySpecialty}</p>
            <div className="flex items-center gap-1">
              <p className="text-[8px] font-bold text-slate-800 leading-tight">{displayName}</p>
              <div className="w-2.5 h-2.5 relative flex-shrink-0">
                <Image src="/verified-doctor-logo.svg" alt="" fill />
              </div>
            </div>
            <div className="flex items-center gap-0.5 text-[4px] text-slate-400 mt-1">
              <MapPin className="w-1.5 h-1.5" />
              <span className="truncate max-w-[40px]">{displayLocation}</span>
            </div>
            <div className="flex gap-1 mt-2">
              <div className="text-[4px] px-1 py-0.5 bg-slate-100 rounded text-slate-600">42 Recs</div>
              <div className="text-[4px] px-1 py-0.5 bg-slate-100 rounded text-slate-600">18 Conns</div>
            </div>
          </div>
        </div>
      );

    case "grid":
      return (
        <div className="h-full bg-slate-50 p-2">
          {/* Grid: Bento-style cards */}
          <div className="grid grid-cols-3 gap-1 h-full">
            <div className="col-span-2 row-span-2 bg-white rounded-lg p-2 flex flex-col items-center justify-center shadow-sm">
              <ProfilePhoto size="w-8 h-8" className="mb-1 relative" />
              <p className="text-[6px] font-bold text-slate-800 truncate max-w-[50px]">{displayName}</p>
              <p className="text-[4px] text-[#0099F7]">{displaySpecialty}</p>
            </div>
            <div className="bg-[#0099F7] rounded-lg p-1 flex flex-col items-center justify-center">
              <p className="text-[8px] font-bold text-white">42</p>
              <p className="text-[4px] text-white/80">Recs</p>
            </div>
            <div className="bg-white rounded-lg p-1 flex flex-col items-center justify-center shadow-sm">
              <p className="text-[8px] font-bold text-slate-800">18</p>
              <p className="text-[4px] text-slate-400">Conns</p>
            </div>
            <div className="col-span-2 bg-white rounded-lg p-1.5 flex items-center gap-1 shadow-sm">
              <MapPin className="w-2 h-2 text-slate-400" />
              <p className="text-[5px] text-slate-600 truncate">{displayLocation}</p>
            </div>
            <div className="bg-gradient-to-br from-[#0099F7] to-[#0080CC] rounded-lg flex items-center justify-center">
              <Calendar className="w-3 h-3 text-white" />
            </div>
          </div>
        </div>
      );

    case "minimal":
      return (
        <div className="h-full bg-white p-4 flex flex-col justify-center">
          {/* Minimal: Swiss/Bauhaus typography-focused */}
          <p className="text-[5px] text-slate-400 uppercase tracking-[0.2em] mb-2">Verified Doctor</p>
          <div className="flex items-center gap-1.5 mb-1">
            <h1 className="text-[10px] font-bold text-slate-900 tracking-tight">{displayName}</h1>
            <div className="w-3 h-3 relative flex-shrink-0">
              <Image src="/verified-doctor-logo.svg" alt="" fill />
            </div>
          </div>
          <p className="text-[6px] text-[#0099F7] font-medium mb-3">{displaySpecialty}</p>
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-[#0099F7] to-[#0080CC] flex items-center justify-center mb-3">
            {doctor.profilePhoto ? (
              <Image src={doctor.profilePhoto} alt="" fill className="object-cover" />
            ) : (
              <span className="text-white text-[10px] font-bold">{initials}</span>
            )}
          </div>
          <div className="flex gap-4">
            <div>
              <p className="text-[10px] font-bold text-slate-800">42</p>
              <p className="text-[4px] text-slate-400 uppercase tracking-wider">Recommendations</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-800">18</p>
              <p className="text-[4px] text-slate-400 uppercase tracking-wider">Connections</p>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
}

// Theme preview with actual doctor data
function ThemePreview({ theme, doctor }: { theme: ThemeConfig; doctor: DoctorPreviewData }) {
  const { colors } = theme;
  const displayName = doctor.fullName || "Dr. Your Name";
  const displaySpecialty = doctor.specialty || "Your Specialty";
  const initials = displayName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div
      className="h-full flex flex-col p-3"
      style={{ backgroundColor: colors.background }}
    >
      {/* Mini profile card with theme colors */}
      <div
        className="rounded-xl p-2.5 flex-1 flex flex-col border"
        style={{ backgroundColor: colors.card, borderColor: colors.cardBorder }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden"
            style={{ backgroundColor: `${colors.primary}20` }}
          >
            {doctor.profilePhoto ? (
              <Image src={doctor.profilePhoto} alt="" fill className="object-cover" />
            ) : (
              <span className="text-[8px] font-bold" style={{ color: colors.primary }}>{initials}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <p
                className="text-[7px] font-semibold truncate max-w-[50px]"
                style={{ color: colors.text }}
              >
                {displayName}
              </p>
              <div className="w-2 h-2 relative flex-shrink-0">
                <Image src="/verified-doctor-logo.svg" alt="" fill />
              </div>
            </div>
            <p
              className="text-[5px] font-medium"
              style={{ color: colors.primary }}
            >
              {displaySpecialty}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-2 mb-2">
          <div
            className="flex-1 rounded-lg p-1.5 text-center"
            style={{ backgroundColor: colors.backgroundAlt }}
          >
            <p className="text-[7px] font-bold" style={{ color: colors.text }}>42</p>
            <p className="text-[4px]" style={{ color: colors.textMuted }}>Recs</p>
          </div>
          <div
            className="flex-1 rounded-lg p-1.5 text-center"
            style={{ backgroundColor: colors.backgroundAlt }}
          >
            <p className="text-[7px] font-bold" style={{ color: colors.text }}>18</p>
            <p className="text-[4px]" style={{ color: colors.textMuted }}>Conns</p>
          </div>
        </div>

        {/* Button */}
        <div
          className="mt-auto rounded-lg py-1.5 flex items-center justify-center gap-1"
          style={{ backgroundColor: colors.primary }}
        >
          <Calendar className="w-2 h-2" style={{ color: colors.textOnPrimary }} />
          <span className="text-[5px] font-medium" style={{ color: colors.textOnPrimary }}>Book</span>
        </div>
      </div>
    </div>
  );
}

function OnboardingForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlHandle = searchParams.get("handle");
  const urlInviteCode = searchParams.get("invite");

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Basic Info
  const [handle, setHandle] = useState("");
  const [fullName, setFullName] = useState("");

  // Step 2: Professional Details
  const [specialty, setSpecialty] = useState("");
  const [qualifications, setQualifications] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");

  // Step 3: Practice Details
  const [clinicName, setClinicName] = useState("");
  const [clinicLocation, setClinicLocation] = useState("");
  const [languages, setLanguages] = useState("");
  const [consultationFee, setConsultationFee] = useState("");
  const [services, setServices] = useState("");

  // Step 4: Photo & Bio
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [originalImageForCrop, setOriginalImageForCrop] = useState<string | null>(null);
  const [bio, setBio] = useState("");
  const [externalBookingUrl, setExternalBookingUrl] = useState("");

  // Step 5 & 6: Layout & Theme (no defaults - user must select)
  const [profileLayout, setProfileLayout] = useState("");
  const [profileTheme, setProfileTheme] = useState("");

  // Handle availability check
  const [handleStatus, setHandleStatus] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");

  // Retrieve invite code from URL or localStorage
  const [inviteCode, setInviteCode] = useState<string | null>(urlInviteCode);
  const [inviteStatus, setInviteStatus] = useState<{
    valid: boolean | null;
    inviterName?: string;
    error?: string;
  }>({ valid: null });

  // Validate invite code
  const validateInvite = async (code: string) => {
    try {
      const response = await fetch(`/api/invites/${code}`);
      const data = await response.json();

      if (data.valid) {
        setInviteStatus({
          valid: true,
          inviterName: data.invite?.inviter?.full_name,
        });
      } else {
        setInviteStatus({
          valid: false,
          error: data.error || "Invalid invite code",
        });
        // Clear invalid invite code
        setInviteCode(null);
      }
    } catch {
      setInviteStatus({
        valid: false,
        error: "Could not validate invite",
      });
    }
  };

  // On mount, check for handle and invite code from localStorage (set during signup)
  useEffect(() => {
    // Priority: URL params > localStorage
    const storedHandle = localStorage.getItem("claimed_handle");
    const storedInviteCode = localStorage.getItem("invite_code");

    // Set handle from URL or localStorage
    const prefilledHandle = urlHandle || storedHandle;
    if (prefilledHandle) {
      setHandle(prefilledHandle);
      setHandleStatus("available");
    }

    // Set invite code from URL or localStorage
    const finalInviteCode = urlInviteCode || storedInviteCode;
    if (finalInviteCode) {
      setInviteCode(finalInviteCode);
      validateInvite(finalInviteCode);
    }

    // Clean up localStorage after retrieving
    if (storedHandle) localStorage.removeItem("claimed_handle");
    if (storedInviteCode) localStorage.removeItem("invite_code");
  }, [urlHandle, urlInviteCode]);

  const checkHandle = async () => {
    if (!handle.trim() || handle.length < 3) return;

    setHandleStatus("checking");
    try {
      const response = await fetch("/api/check-handle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: handle.toLowerCase().trim() }),
      });
      const data = await response.json();
      setHandleStatus(data.available ? "available" : "taken");
    } catch {
      setHandleStatus("idle");
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Read file and show cropper
    const reader = new FileReader();
    reader.onloadend = () => {
      setOriginalImageForCrop(reader.result as string);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setShowCropper(false);
    setIsUploadingPhoto(true);
    setError("");

    try {
      // Show preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
      };
      reader.readAsDataURL(croppedBlob);

      // Get user ID for upload
      const { data: userData } = await getUser();
      if (!userData?.user?.id) {
        throw new Error("Please sign in to upload a photo");
      }

      // Convert Blob to File for upload
      const croppedFile = new File([croppedBlob], "profile-photo.jpg", {
        type: "image/jpeg",
      });

      // Upload to Supabase Storage
      const publicUrl = await uploadProfilePhoto(croppedFile, userData.user.id);
      setProfilePhotoUrl(publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload photo");
      setProfilePhoto(null);
      setProfilePhotoUrl(null);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handle: handle.toLowerCase().trim(),
          fullName,
          specialty,
          qualifications: qualifications || undefined,
          yearsExperience: yearsExperience ? parseInt(yearsExperience) : undefined,
          registrationNumber: registrationNumber || undefined,
          clinicName: clinicName || undefined,
          clinicLocation: clinicLocation || undefined,
          languages: languages || undefined,
          consultationFee: consultationFee || undefined,
          services: services || undefined,
          profilePhotoUrl: profilePhotoUrl || undefined,
          bio: bio || undefined,
          externalBookingUrl: externalBookingUrl || undefined,
          profileLayout,
          profileTheme,
          inviteCode: inviteCode || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create profile");
      }

      router.push(`/onboarding/success?handle=${handle}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const canProceedStep1 =
    handle.length >= 3 && handleStatus === "available" && fullName.length >= 2;
  const canProceedStep2 = specialty.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Image Cropper Modal */}
      {originalImageForCrop && (
        <ImageCropper
          imageSrc={originalImageForCrop}
          open={showCropper}
          onClose={() => {
            setShowCropper(false);
            setOriginalImageForCrop(null);
          }}
          onCropComplete={handleCropComplete}
          aspectRatio={1}
          cropShape="round"
        />
      )}

      {/* Background */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#0099F7]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#A4FDFF]/20 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-1.5 sm:gap-2 mb-6 sm:mb-8">
          <div className="relative w-8 h-8 sm:w-10 sm:h-10">
            <Image
              src="/verified-doctor-logo.svg"
              alt="Verified.Doctor"
              fill
              className="object-contain"
            />
          </div>
          <span className="text-lg sm:text-xl font-semibold text-slate-800 tracking-tight">
            verified<span className="text-[#0099F7]">.doctor</span>
          </span>
        </Link>

        {/* Progress Bar */}
        <ProgressBar step={step} totalSteps={6} />

        {/* Card */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl sm:rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-5 sm:p-8"
        >
          <form onSubmit={handleSubmit}>
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <>
                {/* Invite Status Banner */}
                {inviteCode && inviteStatus.valid === true && (
                  <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-3">
                    <Users className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-emerald-800">
                        <span className="font-medium">{inviteStatus.inviterName || "A colleague"}</span> invited you to join!
                      </p>
                      <p className="text-xs text-emerald-600">You&apos;ll be connected automatically</p>
                    </div>
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  </div>
                )}

                {inviteCode && inviteStatus.valid === false && (
                  <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-amber-800">{inviteStatus.error}</p>
                      <p className="text-xs text-amber-600">You can still create your profile</p>
                    </div>
                  </div>
                )}

                <div className="text-center mb-6 sm:mb-8">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
                    Let&apos;s set up your profile
                  </h1>
                  <p className="text-sm sm:text-base text-slate-600">
                    This takes less than 3 minutes
                  </p>
                </div>

                <div className="space-y-5 sm:space-y-6">
                  {/* Handle */}
                  <div className="space-y-2">
                    <Label htmlFor="handle" className="text-sm sm:text-base">Your URL</Label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="flex items-center h-10 sm:h-12 px-3 sm:px-4 bg-slate-50 border border-slate-200 rounded-lg">
                        <span className="text-slate-500 font-medium text-sm sm:text-base">
                          verified.doctor/
                        </span>
                      </div>
                      <div className="flex-1 relative">
                        <Input
                          id="handle"
                          type="text"
                          value={handle}
                          onChange={(e) => {
                            setHandle(
                              e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")
                            );
                            setHandleStatus("idle");
                          }}
                          onBlur={checkHandle}
                          placeholder="yourname"
                          className="h-10 sm:h-12 text-sm sm:text-base"
                        />
                        {handleStatus === "checking" && (
                          <Loader2 className="absolute right-3 top-2.5 sm:top-3.5 w-4 h-4 sm:w-5 sm:h-5 animate-spin text-slate-400" />
                        )}
                        {handleStatus === "available" && (
                          <Check className="absolute right-3 top-2.5 sm:top-3.5 w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
                        )}
                        {handleStatus === "taken" && (
                          <X className="absolute right-3 top-2.5 sm:top-3.5 w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                        )}
                      </div>
                    </div>
                    {handleStatus === "taken" && (
                      <p className="text-xs sm:text-sm text-red-500">
                        This handle is already taken
                      </p>
                    )}
                    {handleStatus !== "taken" && (
                      <p className="text-xs text-slate-500 flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-sky-500" />
                        <span>
                          Tip: Use your name (e.g., <span className="font-medium">sharma</span> or <span className="font-medium">arjun-sharma</span>) — no need to add &quot;doctor&quot; since the domain already says verified<span className="text-sky-600 font-medium">.doctor</span>
                        </span>
                      </p>
                    )}
                  </div>

                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm sm:text-base">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Dr. Arjun Sharma"
                      className="h-10 sm:h-12 text-sm sm:text-base"
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!canProceedStep1}
                  className="w-full h-10 sm:h-12 mt-6 sm:mt-8 bg-gradient-to-r from-[#0099F7] to-[#0080CC] hover:from-[#0088E0] hover:to-[#0070B8] text-white font-semibold text-sm sm:text-base"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </Button>
              </>
            )}

            {/* Step 2: Professional Details */}
            {step === 2 && (
              <>
                <div className="text-center mb-6 sm:mb-8">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
                    Professional Details
                  </h1>
                  <p className="text-sm sm:text-base text-slate-600">
                    Your qualifications and expertise
                  </p>
                </div>

                <div className="space-y-4 sm:space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="specialty" className="text-sm sm:text-base">Specialty *</Label>
                    <Input
                      id="specialty"
                      type="text"
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      placeholder="e.g. Cardiologist, Dermatologist"
                      className="h-10 sm:h-12 text-sm sm:text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="qualifications" className="text-sm sm:text-base">
                      Qualifications
                      <span className="ml-1 text-slate-400 font-normal text-xs sm:text-sm">
                        (optional)
                      </span>
                    </Label>
                    <Input
                      id="qualifications"
                      type="text"
                      value={qualifications}
                      onChange={(e) => setQualifications(e.target.value)}
                      placeholder="e.g. MBBS, MD (Cardiology), DM"
                      className="h-10 sm:h-12 text-sm sm:text-base"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="yearsExperience" className="text-sm sm:text-base">
                        Experience
                        <span className="ml-1 text-slate-400 font-normal text-xs sm:text-sm">
                          (optional)
                        </span>
                      </Label>
                      <Input
                        id="yearsExperience"
                        type="number"
                        min="0"
                        max="70"
                        value={yearsExperience}
                        onChange={(e) => setYearsExperience(e.target.value)}
                        placeholder="12"
                        className="h-10 sm:h-12 text-sm sm:text-base"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="registrationNumber" className="text-sm sm:text-base">
                        Reg. No.
                        <span className="ml-1 text-slate-400 font-normal text-xs sm:text-sm hidden sm:inline">
                          (optional)
                        </span>
                      </Label>
                      <Input
                        id="registrationNumber"
                        type="text"
                        value={registrationNumber}
                        onChange={(e) => setRegistrationNumber(e.target.value)}
                        placeholder="MCI/12345"
                        className="h-10 sm:h-12 text-sm sm:text-base"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 sm:gap-4 mt-6 sm:mt-8">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1 h-10 sm:h-12 text-sm sm:text-base"
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setStep(3)}
                    disabled={!canProceedStep2}
                    className="flex-1 h-10 sm:h-12 bg-gradient-to-r from-[#0099F7] to-[#0080CC] hover:from-[#0088E0] hover:to-[#0070B8] text-white font-semibold text-sm sm:text-base"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                  </Button>
                </div>
              </>
            )}

            {/* Step 3: Practice Details */}
            {step === 3 && (
              <>
                <div className="text-center mb-6 sm:mb-8">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
                    Practice Details
                  </h1>
                  <p className="text-sm sm:text-base text-slate-600">
                    Where and how patients can reach you
                  </p>
                </div>

                <div className="space-y-4 sm:space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="clinicName" className="text-sm sm:text-base">
                      Clinic/Hospital Name
                      <span className="ml-1 text-slate-400 font-normal text-xs sm:text-sm">
                        (optional)
                      </span>
                    </Label>
                    <Input
                      id="clinicName"
                      type="text"
                      value={clinicName}
                      onChange={(e) => setClinicName(e.target.value)}
                      placeholder="HeartCare Clinic"
                      className="h-10 sm:h-12 text-sm sm:text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clinicLocation" className="text-sm sm:text-base">
                      Location
                      <span className="ml-1 text-slate-400 font-normal text-xs sm:text-sm">
                        (optional)
                      </span>
                    </Label>
                    <Input
                      id="clinicLocation"
                      type="text"
                      value={clinicLocation}
                      onChange={(e) => setClinicLocation(e.target.value)}
                      placeholder="Bandra West, Mumbai"
                      className="h-10 sm:h-12 text-sm sm:text-base"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="languages" className="text-sm sm:text-base">
                        Languages
                        <span className="ml-1 text-slate-400 font-normal text-xs sm:text-sm">
                          (optional)
                        </span>
                      </Label>
                      <Input
                        id="languages"
                        type="text"
                        value={languages}
                        onChange={(e) => setLanguages(e.target.value)}
                        placeholder="English, Hindi"
                        className="h-10 sm:h-12 text-sm sm:text-base"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="consultationFee" className="text-sm sm:text-base">
                        Fee
                        <span className="ml-1 text-slate-400 font-normal text-xs sm:text-sm">
                          (optional)
                        </span>
                      </Label>
                      <Input
                        id="consultationFee"
                        type="text"
                        value={consultationFee}
                        onChange={(e) => setConsultationFee(e.target.value)}
                        placeholder="₹500-1000"
                        className="h-10 sm:h-12 text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="services" className="text-sm sm:text-base">
                        Services
                        <span className="ml-1 text-slate-400 font-normal text-xs sm:text-sm">
                          (optional, comma separated)
                        </span>
                      </Label>
                      <Input
                        id="services"
                        type="text"
                        value={services}
                        onChange={(e) => setServices(e.target.value)}
                        placeholder="ECG, Echocardiography, Stress Test"
                        className="h-10 sm:h-12 text-sm sm:text-base"
                      />
                    </div>
                    {specialty && (
                      <AISuggestTags
                        currentTags={services ? services.split(",").map(t => t.trim()).filter(Boolean) : []}
                        specialty={specialty}
                        type="procedures"
                        onAddTag={(tag) => {
                          const currentTags = services ? services.split(",").map(t => t.trim()).filter(Boolean) : [];
                          if (!currentTags.includes(tag)) {
                            setServices([...currentTags, tag].join(", "));
                          }
                        }}
                      />
                    )}
                  </div>
                </div>

                <div className="flex gap-3 sm:gap-4 mt-6 sm:mt-8">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="flex-1 h-10 sm:h-12 text-sm sm:text-base"
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setStep(4)}
                    className="flex-1 h-10 sm:h-12 bg-gradient-to-r from-[#0099F7] to-[#0080CC] hover:from-[#0088E0] hover:to-[#0070B8] text-white font-semibold text-sm sm:text-base"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                  </Button>
                </div>
              </>
            )}

            {/* Step 4: Photo, Bio & Template */}
            {step === 4 && (
              <>
                <div className="text-center mb-6 sm:mb-8">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
                    Final Touches
                  </h1>
                  <p className="text-sm sm:text-base text-slate-600">
                    Add your photo and choose a style
                  </p>
                </div>

                <div className="space-y-5 sm:space-y-6">
                  {/* Profile Photo */}
                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base">
                      Profile Photo
                      <span className="ml-1 text-slate-400 font-normal text-xs sm:text-sm">
                        (optional)
                      </span>
                    </Label>
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-100 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {profilePhoto ? (
                          <Image
                            src={profilePhoto}
                            alt="Profile"
                            fill
                            className="object-cover"
                          />
                        ) : isUploadingPhoto ? (
                          <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400 animate-spin" />
                        ) : (
                          <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1 flex flex-wrap gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          disabled={isUploadingPhoto}
                          className="hidden"
                          id="photo-upload"
                        />
                        <label htmlFor="photo-upload">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="cursor-pointer text-xs sm:text-sm"
                            disabled={isUploadingPhoto}
                            asChild
                          >
                            <span>
                              {isUploadingPhoto ? "Uploading..." : profilePhoto ? "Change" : "Upload"}
                            </span>
                          </Button>
                        </label>
                        {profilePhoto && !isUploadingPhoto && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setProfilePhoto(null);
                              setProfilePhotoUrl(null);
                            }}
                            className="text-red-500 hover:text-red-600 text-xs sm:text-sm"
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-sm sm:text-base">
                      Short Bio
                      <span className="ml-1 text-slate-400 font-normal text-xs sm:text-sm">
                        (optional)
                      </span>
                    </Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="A brief introduction about yourself..."
                      rows={3}
                      maxLength={500}
                      className="resize-none text-sm sm:text-base"
                    />
                    <div className="flex items-center justify-between">
                      <AIEnhanceButton
                        text={bio}
                        type="bio"
                        onEnhance={(text) => setBio(text)}
                        showLengthSelector={true}
                      />
                      <p className="text-xs text-slate-400">
                        {bio.length}/500
                      </p>
                    </div>
                  </div>

                  {/* Booking URL */}
                  <div className="space-y-2">
                    <Label htmlFor="bookingUrl" className="text-sm sm:text-base">
                      Booking Link
                      <span className="ml-1 text-slate-400 font-normal text-xs sm:text-sm">
                        (optional)
                      </span>
                    </Label>
                    <div className="relative">
                      <ExternalLink className="absolute left-3 top-2.5 sm:top-3.5 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                      <Input
                        id="bookingUrl"
                        type="url"
                        value={externalBookingUrl}
                        onChange={(e) => setExternalBookingUrl(e.target.value)}
                        placeholder="https://practo.com/dr-sharma"
                        className="h-10 sm:h-12 pl-9 sm:pl-10 text-sm sm:text-base"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 sm:gap-4 mt-6 sm:mt-8">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(3)}
                    className="flex-1 h-10 sm:h-12 text-sm sm:text-base"
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setStep(5)}
                    className="flex-1 h-10 sm:h-12 bg-gradient-to-r from-[#0099F7] to-[#0080CC] hover:from-[#0088E0] hover:to-[#0070B8] text-white font-semibold text-sm sm:text-base"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                  </Button>
                </div>
              </>
            )}

            {/* Step 5: Layout Selection */}
            {step === 5 && (
              <>
                <div className="text-center mb-6 sm:mb-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-[#0099F7]/10 to-[#0080CC]/10 mb-4">
                    <Layout className="w-6 h-6 text-[#0099F7]" />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
                    Choose Your Layout
                  </h1>
                  <p className="text-sm sm:text-base text-slate-600">
                    See how your profile will look with each style
                  </p>
                </div>

                {/* Layout Preview Grid with Phone Frames */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5">
                  {LAYOUTS.map((layout) => (
                    <button
                      key={layout.id}
                      type="button"
                      onClick={() => setProfileLayout(layout.id)}
                      className={`group relative flex flex-col items-center transition-all duration-300 ${
                        profileLayout === layout.id
                          ? "transform scale-105"
                          : "hover:scale-102"
                      }`}
                    >
                      {/* Phone Frame Preview */}
                      <div className={`relative rounded-[20px] p-1.5 transition-all duration-300 ${
                        profileLayout === layout.id
                          ? "bg-gradient-to-br from-[#0099F7] to-[#0080CC] shadow-lg shadow-[#0099F7]/30"
                          : "bg-slate-800 shadow-xl"
                      }`}>
                        {/* Screen */}
                        <div className="relative rounded-[14px] overflow-hidden bg-white w-[110px] sm:w-[120px] aspect-[9/16]">
                          {/* Status Bar */}
                          <div className="absolute top-0 left-0 right-0 h-3 bg-black/5 flex items-center justify-between px-2 z-10">
                            <span className="text-[5px] text-slate-400 font-medium">9:41</span>
                            <div className="flex items-center gap-0.5">
                              <div className="w-1.5 h-1 bg-slate-400 rounded-sm" />
                            </div>
                          </div>
                          {/* Content */}
                          <div className="absolute inset-0 pt-3 overflow-hidden">
                            <LayoutPreview
                              layoutId={layout.id}
                              doctor={{
                                fullName,
                                specialty,
                                profilePhoto,
                                clinicLocation,
                                qualifications,
                                yearsExperience,
                              }}
                            />
                          </div>
                          {/* Selection Overlay */}
                          {profileLayout === layout.id && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="absolute inset-0 bg-[#0099F7]/20 flex items-center justify-center"
                            >
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-8 h-8 rounded-full bg-[#0099F7] flex items-center justify-center shadow-lg"
                              >
                                <Check className="w-5 h-5 text-white" />
                              </motion.div>
                            </motion.div>
                          )}
                        </div>
                      </div>
                      {/* Label */}
                      <div className="mt-3 text-center">
                        <p className={`font-semibold text-sm transition-colors ${
                          profileLayout === layout.id ? "text-[#0099F7]" : "text-slate-700"
                        }`}>
                          {layout.name}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1 max-w-[100px]">
                          {layout.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex gap-3 sm:gap-4 mt-6 sm:mt-8">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(4)}
                    className="flex-1 h-10 sm:h-12 text-sm sm:text-base"
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setStep(6)}
                    disabled={!profileLayout}
                    className="flex-1 h-10 sm:h-12 bg-gradient-to-r from-[#0099F7] to-[#0080CC] hover:from-[#0088E0] hover:to-[#0070B8] text-white font-semibold text-sm sm:text-base"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                  </Button>
                </div>

                {!profileLayout && (
                  <p className="text-center text-xs text-slate-500 mt-3">
                    Please select a layout to continue
                  </p>
                )}
              </>
            )}

            {/* Step 6: Theme Selection */}
            {step === 6 && (
              <>
                <div className="text-center mb-6 sm:mb-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-[#0099F7]/10 to-[#0080CC]/10 mb-4">
                    <Palette className="w-6 h-6 text-[#0099F7]" />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
                    Pick Your Colors
                  </h1>
                  <p className="text-sm sm:text-base text-slate-600">
                    See your profile with different color themes
                  </p>
                </div>

                {/* Theme Preview Grid with Phone Frames */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5">
                  {THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setProfileTheme(theme.id)}
                      className={`group relative flex flex-col items-center transition-all duration-300 ${
                        profileTheme === theme.id
                          ? "transform scale-105"
                          : "hover:scale-102"
                      }`}
                    >
                      {/* Phone Frame Preview */}
                      <div className={`relative rounded-[20px] p-1.5 transition-all duration-300 ${
                        profileTheme === theme.id
                          ? `shadow-lg`
                          : "bg-slate-800 shadow-xl"
                      }`}
                      style={profileTheme === theme.id ? {
                        background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryHover})`
                      } : {}}
                      >
                        {/* Screen */}
                        <div className="relative rounded-[14px] overflow-hidden w-[110px] sm:w-[120px] aspect-[9/16]"
                          style={{ backgroundColor: theme.colors.background }}
                        >
                          {/* Status Bar */}
                          <div className="absolute top-0 left-0 right-0 h-3 flex items-center justify-between px-2 z-10"
                            style={{ backgroundColor: `${theme.colors.text}08` }}
                          >
                            <span className="text-[5px] font-medium" style={{ color: theme.colors.textMuted }}>9:41</span>
                            <div className="flex items-center gap-0.5">
                              <div className="w-1.5 h-1 rounded-sm" style={{ backgroundColor: theme.colors.textMuted }} />
                            </div>
                          </div>
                          {/* Content */}
                          <div className="absolute inset-0 pt-3 overflow-hidden">
                            <ThemePreview
                              theme={theme}
                              doctor={{
                                fullName,
                                specialty,
                                profilePhoto,
                                clinicLocation,
                                qualifications,
                                yearsExperience,
                              }}
                            />
                          </div>
                          {/* Selection Overlay */}
                          {profileTheme === theme.id && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="absolute inset-0 flex items-center justify-center"
                              style={{ backgroundColor: `${theme.colors.primary}20` }}
                            >
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-lg"
                              >
                                <Check className="w-5 h-5" style={{ color: theme.colors.primary }} />
                              </motion.div>
                            </motion.div>
                          )}
                        </div>
                      </div>
                      {/* Label */}
                      <div className="mt-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <div
                            className="w-3 h-3 rounded-full shadow-sm"
                            style={{ backgroundColor: theme.colors.primary }}
                          />
                          <p className={`font-semibold text-sm transition-colors ${
                            profileTheme === theme.id ? "text-slate-900" : "text-slate-700"
                          }`}>
                            {theme.name}
                          </p>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {theme.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                {error && (
                  <div className="mt-4 p-2.5 sm:p-3 rounded-lg bg-red-50 border border-red-200">
                    <p className="text-xs sm:text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div className="flex gap-3 sm:gap-4 mt-6 sm:mt-8">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(5)}
                    className="flex-1 h-10 sm:h-12 text-sm sm:text-base"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading || !profileTheme}
                    className="flex-1 h-10 sm:h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold text-sm sm:text-base"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                        Create Profile
                      </>
                    )}
                  </Button>
                </div>

                {!profileTheme && (
                  <p className="text-center text-xs text-slate-500 mt-3">
                    Please select a color theme to continue
                  </p>
                )}
              </>
            )}
          </form>
        </motion.div>

        {/* Preview */}
        <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-slate-500">
          Your profile will be live at{" "}
          <span className="font-medium text-[#0099F7]">
            verified.doctor/{handle || "yourname"}
          </span>
        </div>
      </div>
    </div>
  );
}

function OnboardingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#0099F7] mx-auto mb-4" />
        <p className="text-slate-600">Loading...</p>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<OnboardingFallback />}>
      <OnboardingForm />
    </Suspense>
  );
}
