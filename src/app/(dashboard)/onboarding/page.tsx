"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
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

// Mini preview components for layout and theme selection
function LayoutPreview({ layoutId }: { layoutId: string }) {
  const previewImage = "/doctor-3.jpg";

  // Each layout gets a unique visual preview showing its structure
  switch (layoutId) {
    case "classic":
      return (
        <div className="absolute inset-2 flex flex-col items-center">
          {/* Single column centered layout */}
          <div className="w-8 h-8 rounded-full bg-slate-300 mb-2 overflow-hidden">
            <Image src={previewImage} alt="" fill className="object-cover" />
          </div>
          <div className="w-12 h-1.5 bg-slate-300 rounded mb-1" />
          <div className="w-8 h-1 bg-slate-200 rounded mb-2" />
          <div className="w-full h-px bg-slate-200 my-2" />
          <div className="w-full space-y-1.5">
            <div className="h-1.5 bg-slate-200 rounded w-full" />
            <div className="h-1.5 bg-slate-200 rounded w-3/4" />
          </div>
        </div>
      );
    case "hero":
      return (
        <div className="absolute inset-0 flex flex-col">
          {/* Full-width hero banner */}
          <div className="h-1/2 bg-gradient-to-r from-slate-400 to-slate-300 relative">
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white border-2 border-white overflow-hidden shadow-lg">
              <Image src={previewImage} alt="" fill className="object-cover" />
            </div>
          </div>
          <div className="flex-1 bg-white p-2 pt-5">
            <div className="w-10 h-1.5 bg-slate-300 rounded mx-auto mb-1" />
            <div className="w-6 h-1 bg-slate-200 rounded mx-auto" />
          </div>
        </div>
      );
    case "timeline":
      return (
        <div className="absolute inset-2 flex">
          {/* Vertical timeline on left */}
          <div className="w-px bg-slate-300 mr-2 relative">
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-slate-400" />
            <div className="absolute top-5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-slate-300" />
            <div className="absolute top-9 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-slate-200" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden">
                <Image src={previewImage} alt="" fill className="object-cover" />
              </div>
              <div className="flex-1">
                <div className="h-1.5 bg-slate-300 rounded w-3/4" />
              </div>
            </div>
            <div className="h-1 bg-slate-200 rounded w-full" />
            <div className="h-1 bg-slate-200 rounded w-2/3" />
          </div>
        </div>
      );
    case "magazine":
      return (
        <div className="absolute inset-2 flex gap-2">
          {/* Asymmetric 2-column layout */}
          <div className="w-1/2 rounded bg-slate-200 overflow-hidden">
            <Image src={previewImage} alt="" fill className="object-cover" />
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <div className="h-2 bg-slate-300 rounded w-full mb-1" />
            <div className="h-1.5 bg-slate-200 rounded w-3/4 mb-2" />
            <div className="h-1 bg-slate-200 rounded w-1/2" />
          </div>
        </div>
      );
    case "grid":
      return (
        <div className="absolute inset-2 grid grid-cols-3 gap-1">
          {/* Bento grid layout */}
          <div className="col-span-2 row-span-2 rounded bg-slate-200 flex items-center justify-center overflow-hidden">
            <div className="w-6 h-6 rounded-full overflow-hidden">
              <Image src={previewImage} alt="" fill className="object-cover" />
            </div>
          </div>
          <div className="rounded bg-slate-300" />
          <div className="rounded bg-slate-200" />
          <div className="col-span-2 rounded bg-slate-200" />
          <div className="rounded bg-slate-300" />
        </div>
      );
    case "minimal":
      return (
        <div className="absolute inset-3 flex flex-col justify-center">
          {/* Ultra minimal typography-focused */}
          <div className="text-[8px] font-bold text-slate-400 mb-1">DR. JANE DOE</div>
          <div className="w-6 h-6 rounded-full bg-slate-200 mb-2 overflow-hidden">
            <Image src={previewImage} alt="" fill className="object-cover" />
          </div>
          <div className="h-1 bg-slate-300 rounded w-1/2 mb-1" />
          <div className="h-0.5 bg-slate-200 rounded w-1/3" />
        </div>
      );
    default:
      return null;
  }
}

function ThemePreview({ theme }: { theme: ThemeConfig }) {
  const { colors } = theme;

  return (
    <div className="absolute inset-3 flex flex-col">
      {/* Mini profile card preview with theme colors */}
      <div
        className="rounded-lg p-2 flex-1 flex flex-col"
        style={{ backgroundColor: colors.card, borderColor: colors.cardBorder, borderWidth: 1 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-6 h-6 rounded-full"
            style={{ backgroundColor: colors.accent }}
          />
          <div className="flex-1">
            <div
              className="h-1.5 rounded w-3/4 mb-1"
              style={{ backgroundColor: colors.text }}
            />
            <div
              className="h-1 rounded w-1/2"
              style={{ backgroundColor: colors.textMuted }}
            />
          </div>
        </div>
        <div
          className="h-1 rounded w-full mb-1"
          style={{ backgroundColor: colors.backgroundAlt }}
        />
        <div
          className="h-1 rounded w-2/3 mb-2"
          style={{ backgroundColor: colors.backgroundAlt }}
        />
        <div
          className="h-4 rounded flex items-center justify-center mt-auto"
          style={{ backgroundColor: colors.primary }}
        >
          <Star className="w-2 h-2" style={{ color: colors.textOnPrimary }} />
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

        {/* Progress */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-6 sm:mb-8">
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <div
              key={s}
              className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-colors ${
                s <= step ? "bg-[#0099F7]" : "bg-slate-200"
              }`}
            />
          ))}
        </div>

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
                    Select how your profile will be structured
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {LAYOUTS.map((layout) => (
                    <button
                      key={layout.id}
                      type="button"
                      onClick={() => setProfileLayout(layout.id)}
                      className={`group relative overflow-hidden rounded-xl border-2 text-left transition-all ${
                        profileLayout === layout.id
                          ? "border-[#0099F7] ring-2 ring-[#0099F7]/20"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {/* Preview Image Area */}
                      <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
                        {/* Mini Preview based on layout type */}
                        <LayoutPreview layoutId={layout.id} />
                        {profileLayout === layout.id && (
                          <div className="absolute inset-0 bg-[#0099F7]/10 flex items-center justify-center">
                            <div className="w-8 h-8 rounded-full bg-[#0099F7] flex items-center justify-center">
                              <Check className="w-5 h-5 text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-3 sm:p-4">
                        <p className="font-semibold text-slate-900 text-sm sm:text-base">
                          {layout.name}
                        </p>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
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
                    Choose a color theme for your profile
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setProfileTheme(theme.id)}
                      className={`group relative overflow-hidden rounded-xl border-2 text-left transition-all ${
                        profileTheme === theme.id
                          ? "border-[#0099F7] ring-2 ring-[#0099F7]/20"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {/* Color Preview */}
                      <div
                        className="relative aspect-[4/3] overflow-hidden"
                        style={{ backgroundColor: theme.colors.background }}
                      >
                        <ThemePreview theme={theme} />
                        {profileTheme === theme.id && (
                          <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-lg">
                              <Check className="w-5 h-5 text-[#0099F7]" />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-3 sm:p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: theme.colors.primary }}
                          />
                          <p className="font-semibold text-slate-900 text-sm sm:text-base">
                            {theme.name}
                          </p>
                        </div>
                        <p className="text-xs text-slate-500">
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
