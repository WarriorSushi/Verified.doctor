"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Video,
  GraduationCap,
  Building2,
  Stethoscope,
  Scissors,
  Heart,
  BookOpen,
  CalendarCheck,
  Clock,
  MonitorSmartphone,
  Award,
  Users,
  Newspaper,
  Image as ImageIcon,
  Check,
  Loader2,
  Camera,
  Layout,
  Palette,
  Shield,
  Power,
  LogOut,
  AlertTriangle,
  Upload,
  User,
  Layers,
  ChevronRight,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Profile } from "@/types/database";
import { SectionWrapper } from "./section-wrapper";
import { ArrayEditor } from "./array-editor";
import { TagInput } from "./tag-input";
import { VideoEmbedPreview } from "./video-embed-preview";
import { ImageGalleryEditor } from "./image-gallery-editor";
import { AIEnhanceButton } from "@/components/ui/ai-enhance-button";
import { AISuggestTags } from "@/components/ui/ai-suggest-tags";
import { ImageCropper } from "@/components/ui/image-cropper";
import { VerificationUpload } from "../verification-upload";
import { uploadProfilePhoto } from "@/lib/upload";
import { getUser } from "@/lib/auth/client";
import { LAYOUTS, THEMES } from "@/lib/theme-config";
import { cn } from "@/lib/utils";

interface ProfileBuilderProps {
  profile: Profile;
  initialTab?: string;
}

type EducationItem = {
  institution: string;
  degree: string;
  year: string;
  [key: string]: string;
};

type HospitalItem = {
  name: string;
  role: string;
  department: string;
  [key: string]: string;
};

type CaseStudyItem = {
  title: string;
  description: string;
  outcome: string;
  [key: string]: string;
};

type MembershipItem = {
  organization: string;
  year: string;
  [key: string]: string;
};

type MediaItem = {
  title: string;
  publication: string;
  link: string;
  year: string;
  [key: string]: string;
};

interface GalleryImage {
  url: string;
  caption?: string;
}

type SectionVisibility = Record<string, boolean>;

export function ProfileBuilder({ profile, initialTab }: ProfileBuilderProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  // Valid tabs: basics, appearance, content, settings
  const validTabs = ["basics", "appearance", "content", "settings"];
  const [activeTab, setActiveTab] = useState(
    initialTab && validTabs.includes(initialTab) ? initialTab : "basics"
  );

  // Basic profile state
  const [fullName, setFullName] = useState(profile.full_name);
  const [specialty, setSpecialty] = useState(profile.specialty || "");
  const [clinicName, setClinicName] = useState(profile.clinic_name || "");
  const [clinicLocation, setClinicLocation] = useState(profile.clinic_location || "");
  const [yearsExperience, setYearsExperience] = useState(profile.years_experience?.toString() || "");
  const [externalBookingUrl, setExternalBookingUrl] = useState(profile.external_booking_url || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [qualifications, setQualifications] = useState(profile.qualifications || "");
  const [languages, setLanguages] = useState(profile.languages || "");
  const [consultationFee, setConsultationFee] = useState(profile.consultation_fee || "");
  const [services, setServices] = useState(profile.services || "");
  const [registrationNumber, setRegistrationNumber] = useState(profile.registration_number || "");

  // Photo upload state
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(profile.profile_photo_url);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [originalImageForCrop, setOriginalImageForCrop] = useState<string | null>(null);

  // Layout & Theme state
  const profileData = profile as typeof profile & {
    profile_layout?: string | null;
    profile_theme?: string | null;
    verification_status?: string | null;
    is_verified?: boolean | null;
  };
  const [selectedLayout, setSelectedLayout] = useState(profileData.profile_layout || "classic");
  const [selectedTheme, setSelectedTheme] = useState(profileData.profile_theme || "blue");
  const [isSavingLayout, setIsSavingLayout] = useState(false);
  const [isSavingTheme, setIsSavingTheme] = useState(false);

  // Freeze state
  const [isFrozen, setIsFrozen] = useState(false);
  const [isTogglingFreeze, setIsTogglingFreeze] = useState(false);

  // Section visibility state
  const [visibility, setVisibility] = useState<SectionVisibility>(
    (profile.section_visibility as SectionVisibility) || {}
  );

  // Form state for content sections
  const [formData, setFormData] = useState({
    videoIntroductionUrl: profile.video_introduction_url || "",
    approachToCare: profile.approach_to_care || "",
    firstVisitGuide: profile.first_visit_guide || "",
    availabilityNote: profile.availability_note || "",
    conditionsTreated: profile.conditions_treated || "",
    proceduresPerformed: profile.procedures_performed || "",
    isAvailable: profile.is_available ?? true,
    offersTelemedicine: profile.offers_telemedicine ?? false,
    educationTimeline: (profile.education_timeline as unknown as EducationItem[]) || [],
    hospitalAffiliations: (profile.hospital_affiliations as unknown as HospitalItem[]) || [],
    caseStudies: (profile.case_studies as unknown as CaseStudyItem[]) || [],
    clinicGallery: (profile.clinic_gallery as unknown as GalleryImage[]) || [],
    professionalMemberships: (profile.professional_memberships as unknown as MembershipItem[]) || [],
    mediaPublications: (profile.media_publications as unknown as MediaItem[]) || [],
  });

  // Fetch freeze status on mount
  useEffect(() => {
    const fetchFreezeStatus = async () => {
      try {
        const response = await fetch("/api/profile/freeze");
        if (response.ok) {
          const data = await response.json();
          setIsFrozen(data.isFrozen);
        }
      } catch {
        // Ignore errors
      }
    };
    fetchFreezeStatus();
  }, []);

  const isSectionVisible = (key: string) => visibility[key] === true;

  const toggleVisibility = (key: string, visible: boolean) => {
    setVisibility((prev) => ({ ...prev, [key]: visible }));
  };

  const updateField = useCallback(<K extends keyof typeof formData>(
    field: K,
    value: typeof formData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Detect if there are unsaved changes
  const hasChanges = useMemo(() => {
    // Check basic fields
    if (fullName !== profile.full_name) return true;
    if (specialty !== (profile.specialty || "")) return true;
    if (clinicName !== (profile.clinic_name || "")) return true;
    if (clinicLocation !== (profile.clinic_location || "")) return true;
    if (yearsExperience !== (profile.years_experience?.toString() || "")) return true;
    if (externalBookingUrl !== (profile.external_booking_url || "")) return true;
    if (bio !== (profile.bio || "")) return true;
    if (qualifications !== (profile.qualifications || "")) return true;
    if (languages !== (profile.languages || "")) return true;
    if (consultationFee !== (profile.consultation_fee || "")) return true;
    if (services !== (profile.services || "")) return true;
    if (registrationNumber !== (profile.registration_number || "")) return true;

    // Check content fields
    if (formData.videoIntroductionUrl !== (profile.video_introduction_url || "")) return true;
    if (formData.approachToCare !== (profile.approach_to_care || "")) return true;
    if (formData.firstVisitGuide !== (profile.first_visit_guide || "")) return true;
    if (formData.availabilityNote !== (profile.availability_note || "")) return true;
    if (formData.conditionsTreated !== (profile.conditions_treated || "")) return true;
    if (formData.proceduresPerformed !== (profile.procedures_performed || "")) return true;
    if (formData.isAvailable !== (profile.is_available ?? true)) return true;
    if (formData.offersTelemedicine !== (profile.offers_telemedicine ?? false)) return true;

    // Check visibility changes
    if (JSON.stringify(visibility) !== JSON.stringify(profile.section_visibility || {})) return true;

    // Check array fields (simplified comparison)
    if (JSON.stringify(formData.educationTimeline) !== JSON.stringify(profile.education_timeline || [])) return true;
    if (JSON.stringify(formData.hospitalAffiliations) !== JSON.stringify(profile.hospital_affiliations || [])) return true;
    if (JSON.stringify(formData.caseStudies) !== JSON.stringify(profile.case_studies || [])) return true;
    if (JSON.stringify(formData.clinicGallery) !== JSON.stringify(profile.clinic_gallery || [])) return true;
    if (JSON.stringify(formData.professionalMemberships) !== JSON.stringify(profile.professional_memberships || [])) return true;
    if (JSON.stringify(formData.mediaPublications) !== JSON.stringify(profile.media_publications || [])) return true;

    return false;
  }, [
    fullName, specialty, clinicName, clinicLocation, yearsExperience, externalBookingUrl,
    bio, qualifications, languages, consultationFee, services, registrationNumber,
    formData, visibility, profile
  ]);

  // Photo upload handlers
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(croppedBlob);

      const { data: userData } = await getUser();
      if (!userData?.user?.id) {
        throw new Error("Please sign in to upload a photo");
      }

      const croppedFile = new File([croppedBlob], "profile-photo.jpg", { type: "image/jpeg" });
      const publicUrl = await uploadProfilePhoto(croppedFile, userData.user.id);

      const response = await fetch(`/api/profiles/${profile.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profilePhotoUrl: publicUrl }),
      });

      if (!response.ok) throw new Error("Failed to update profile photo");

      toast.success("Profile photo updated!");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload photo");
      setProfilePhotoPreview(profile.profile_photo_url);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Layout & Theme handlers
  const handleLayoutChange = async (layoutId: string) => {
    setSelectedLayout(layoutId);
    setIsSavingLayout(true);
    try {
      const response = await fetch(`/api/profiles/${profile.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileLayout: layoutId }),
      });

      if (!response.ok) throw new Error("Failed to update layout");
      toast.success("Layout updated!");
      router.refresh();
    } catch {
      toast.error("Failed to update layout");
      setSelectedLayout(profileData.profile_layout || "classic");
    } finally {
      setIsSavingLayout(false);
    }
  };

  const handleThemeChange = async (themeId: string) => {
    setSelectedTheme(themeId);
    setIsSavingTheme(true);
    try {
      const response = await fetch(`/api/profiles/${profile.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileTheme: themeId }),
      });

      if (!response.ok) throw new Error("Failed to update theme");
      toast.success("Theme updated!");
      router.refresh();
    } catch {
      toast.error("Failed to update theme");
      setSelectedTheme(profileData.profile_theme || "blue");
    } finally {
      setIsSavingTheme(false);
    }
  };

  // Freeze handler
  const handleFreezeToggle = async (checked: boolean) => {
    setIsTogglingFreeze(true);
    try {
      const response = await fetch("/api/profile/freeze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFrozen: checked }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsFrozen(data.isFrozen);
        toast.success(data.message);
        router.refresh();
      } else {
        toast.error("Failed to update profile status");
      }
    } catch {
      toast.error("Failed to update profile status");
    } finally {
      setIsTogglingFreeze(false);
    }
  };

  // Save all changes
  const handleSave = async () => {
    setIsSaving(true);

    try {
      const response = await fetch(`/api/profiles/${profile.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          specialty,
          clinicName: clinicName || null,
          clinicLocation: clinicLocation || null,
          yearsExperience: yearsExperience ? parseInt(yearsExperience) : null,
          externalBookingUrl: externalBookingUrl || null,
          bio: bio || null,
          qualifications: qualifications || null,
          languages: languages || null,
          consultationFee: consultationFee || null,
          services: services || null,
          registrationNumber: registrationNumber || null,
          ...formData,
          sectionVisibility: visibility,
        }),
      });

      if (!response.ok) throw new Error("Failed to save");

      toast.success("Profile Updated", {
        description: "Your profile has been saved successfully.",
      });

      router.refresh();
    } catch {
      toast.error("Error", {
        description: "Failed to save profile. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Edit Profile
          </h1>
          <p className="text-sm text-slate-500">
            Customize your public profile and settings
          </p>
        </div>
        <a
          href={`/${profile.handle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#0099F7] hover:text-[#0080CC] transition-colors"
        >
          View Profile
          <ChevronRight className="w-4 h-4" />
        </a>
      </div>

      {/* Tabs Navigation - Scrollable on mobile */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full h-auto p-1.5 bg-slate-100/80 rounded-xl grid grid-cols-4 gap-1.5">
          <TabsTrigger
            value="basics"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg py-2 sm:py-2.5 px-1.5 sm:px-4 text-xs sm:text-sm font-medium flex flex-col sm:flex-row items-center gap-1 sm:gap-2"
          >
            <User className="w-4 h-4" />
            <span className="text-[10px] sm:text-sm">Basics</span>
          </TabsTrigger>
          <TabsTrigger
            value="appearance"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg py-2 sm:py-2.5 px-1.5 sm:px-4 text-xs sm:text-sm font-medium flex flex-col sm:flex-row items-center gap-1 sm:gap-2"
          >
            <Palette className="w-4 h-4" />
            <span className="text-[10px] sm:text-sm">Look</span>
          </TabsTrigger>
          <TabsTrigger
            value="content"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg py-2 sm:py-2.5 px-1.5 sm:px-4 text-xs sm:text-sm font-medium flex flex-col sm:flex-row items-center gap-1 sm:gap-2"
          >
            <Layers className="w-4 h-4" />
            <span className="text-[10px] sm:text-sm">Content</span>
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg py-2 sm:py-2.5 px-1.5 sm:px-4 text-xs sm:text-sm font-medium flex flex-col sm:flex-row items-center gap-1 sm:gap-2"
          >
            <Shield className="w-4 h-4" />
            <span className="text-[10px] sm:text-sm">Settings</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab descriptions - shows what each tab contains */}
        <div className="mt-3 px-1">
          {activeTab === "basics" && (
            <p className="text-xs text-slate-500">Name, photo, specialty, location & contact info</p>
          )}
          {activeTab === "appearance" && (
            <p className="text-xs text-slate-500">Choose layout style and color theme</p>
          )}
          {activeTab === "content" && (
            <p className="text-xs text-slate-500">Education, procedures, videos & more sections</p>
          )}
          {activeTab === "settings" && (
            <p className="text-xs text-slate-500">Verification, visibility & account settings</p>
          )}
        </div>

        {/* BASICS TAB */}
        <TabsContent value="basics" className="space-y-5 mt-5">
          {/* Profile Photo */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Camera className="w-5 h-5 text-slate-500" />
              <h2 className="text-base font-semibold text-slate-900">Profile Photo</h2>
            </div>

            <div className="flex items-center gap-5">
              <div className="relative w-20 h-20 rounded-full bg-slate-100 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                {profilePhotoPreview ? (
                  <Image src={profilePhotoPreview} alt="Profile" fill className="object-cover" />
                ) : isUploadingPhoto ? (
                  <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                ) : (
                  <Upload className="w-5 h-5 text-slate-400" />
                )}
                {isUploadingPhoto && profilePhotoPreview && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm text-slate-600 mb-2">Upload a professional photo</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={isUploadingPhoto}
                  className="hidden"
                  id="photo-upload"
                />
                <label htmlFor="photo-upload">
                  <Button type="button" variant="outline" size="sm" className="cursor-pointer" disabled={isUploadingPhoto} asChild>
                    <span>{isUploadingPhoto ? "Uploading..." : profilePhotoPreview ? "Change" : "Upload"}</span>
                  </Button>
                </label>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-base font-semibold text-slate-900 mb-4">Basic Information</h2>

            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="handle" className="text-sm">Profile URL</Label>
                  <div className="flex items-center h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500">
                    verified.doctor/{profile.handle}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-10"
                    required
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="specialty" className="text-sm">Specialty</Label>
                  <Input
                    id="specialty"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    placeholder="e.g., Cardiologist"
                    className="h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yearsExperience" className="text-sm">Years of Experience</Label>
                  <Input
                    id="yearsExperience"
                    type="number"
                    min="0"
                    max="70"
                    value={yearsExperience}
                    onChange={(e) => setYearsExperience(e.target.value)}
                    className="h-10"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clinicName" className="text-sm">Clinic/Hospital Name</Label>
                  <Input
                    id="clinicName"
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    placeholder="HeartCare Clinic"
                    className="h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clinicLocation" className="text-sm">Location</Label>
                  <Input
                    id="clinicLocation"
                    value={clinicLocation}
                    onChange={(e) => setClinicLocation(e.target.value)}
                    placeholder="Mumbai, India"
                    className="h-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-sm">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell patients about yourself..."
                  className="min-h-[100px]"
                  maxLength={2000}
                />
                <p className="text-xs text-slate-400 text-right">{bio.length}/2000</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="qualifications" className="text-sm">Qualifications</Label>
                  <Input
                    id="qualifications"
                    value={qualifications}
                    onChange={(e) => setQualifications(e.target.value)}
                    placeholder="MBBS, MD, DM"
                    className="h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registrationNumber" className="text-sm">Registration Number</Label>
                  <Input
                    id="registrationNumber"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    placeholder="MCI/NMC Number"
                    className="h-10"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="languages" className="text-sm">Languages Spoken</Label>
                  <Input
                    id="languages"
                    value={languages}
                    onChange={(e) => setLanguages(e.target.value)}
                    placeholder="English, Hindi, Tamil"
                    className="h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="consultationFee" className="text-sm">Consultation Fee</Label>
                  <Input
                    id="consultationFee"
                    value={consultationFee}
                    onChange={(e) => setConsultationFee(e.target.value)}
                    placeholder="Rs. 500 - 1000"
                    className="h-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="services" className="text-sm">Services (comma separated)</Label>
                <Input
                  id="services"
                  value={services}
                  onChange={(e) => setServices(e.target.value)}
                  placeholder="ECG, Echo, Stress Test"
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bookingUrl" className="text-sm">External Booking URL</Label>
                <Input
                  id="bookingUrl"
                  type="url"
                  value={externalBookingUrl}
                  onChange={(e) => setExternalBookingUrl(e.target.value)}
                  placeholder="https://practo.com/dr-yourname"
                  className="h-10"
                />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* APPEARANCE TAB */}
        <TabsContent value="appearance" className="space-y-5 mt-5">
          {/* Layout Selection */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Layout className="w-5 h-5 text-slate-500" />
              <h2 className="text-base font-semibold text-slate-900">Profile Layout</h2>
            </div>
            <p className="text-sm text-slate-500 mb-4">Choose the structure of your profile</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {LAYOUTS.map((layout) => (
                <button
                  key={layout.id}
                  type="button"
                  onClick={() => handleLayoutChange(layout.id)}
                  disabled={isSavingLayout}
                  className={cn(
                    "relative p-3 sm:p-4 rounded-xl border-2 text-left transition-all hover:shadow-md",
                    selectedLayout === layout.id
                      ? "border-[#0099F7] bg-blue-50/50 ring-2 ring-[#0099F7]/20"
                      : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  {selectedLayout === layout.id && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-[#0099F7] rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <p className="font-medium text-slate-900 text-sm sm:text-base mb-1">{layout.name}</p>
                  <p className="text-xs text-slate-500 line-clamp-2">{layout.description}</p>
                </button>
              ))}
            </div>

            {isSavingLayout && (
              <p className="text-sm text-slate-500 mt-3 flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                Saving...
              </p>
            )}
          </div>

          {/* Color Theme Selection */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Palette className="w-5 h-5 text-slate-500" />
              <h2 className="text-base font-semibold text-slate-900">Color Theme</h2>
            </div>
            <p className="text-sm text-slate-500 mb-4">Choose your color palette</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => handleThemeChange(theme.id)}
                  disabled={isSavingTheme}
                  className={cn(
                    "relative p-3 sm:p-4 rounded-xl border-2 text-left transition-all hover:shadow-md",
                    selectedTheme === theme.id
                      ? "border-[#0099F7] bg-blue-50/50 ring-2 ring-[#0099F7]/20"
                      : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  {selectedTheme === theme.id && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-[#0099F7] rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div className="flex gap-1.5 mb-2">
                    <div className="w-5 h-5 rounded-full border border-slate-200/50 shadow-sm" style={{ backgroundColor: theme.colors.background }} />
                    <div className="w-5 h-5 rounded-full border border-slate-200/50 shadow-sm" style={{ backgroundColor: theme.colors.primary }} />
                    <div className="w-5 h-5 rounded-full border border-slate-200/50 shadow-sm" style={{ backgroundColor: theme.colors.accent }} />
                  </div>
                  <p className="font-medium text-slate-900 text-sm">{theme.name}</p>
                  <p className="text-xs text-slate-500">{theme.description}</p>
                </button>
              ))}
            </div>

            {isSavingTheme && (
              <p className="text-sm text-slate-500 mt-3 flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                Saving...
              </p>
            )}
          </div>
        </TabsContent>

        {/* CONTENT TAB */}
        <TabsContent value="content" className="space-y-5 mt-5">
          {/* Video Introduction */}
          <SectionWrapper
            title="Video Introduction"
            description="Add a personal video"
            icon={<Video className="w-5 h-5" />}
            isVisible={isSectionVisible("video")}
            onVisibilityChange={(v) => toggleVisibility("video", v)}
          >
            <VideoEmbedPreview
              value={formData.videoIntroductionUrl}
              onChange={(v) => updateField("videoIntroductionUrl", v)}
            />
          </SectionWrapper>

          {/* Education Timeline */}
          <SectionWrapper
            title="Education & Training"
            description="Your academic background"
            icon={<GraduationCap className="w-5 h-5" />}
            isVisible={isSectionVisible("education")}
            onVisibilityChange={(v) => toggleVisibility("education", v)}
          >
            <ArrayEditor<EducationItem>
              items={formData.educationTimeline}
              onChange={(items) => updateField("educationTimeline", items)}
              fields={[
                { name: "institution", label: "Institution", type: "text", placeholder: "e.g., AIIMS Delhi", required: true },
                { name: "degree", label: "Degree", type: "text", placeholder: "e.g., MBBS, MD", required: true },
                { name: "year", label: "Year", type: "year", placeholder: "2015" },
              ]}
              addLabel="Add Education"
              emptyMessage="No education entries added yet"
              maxItems={10}
            />
          </SectionWrapper>

          {/* Hospital Affiliations */}
          <SectionWrapper
            title="Hospital Affiliations"
            description="Where you practice"
            icon={<Building2 className="w-5 h-5" />}
            isVisible={isSectionVisible("hospitals")}
            onVisibilityChange={(v) => toggleVisibility("hospitals", v)}
          >
            <ArrayEditor<HospitalItem>
              items={formData.hospitalAffiliations}
              onChange={(items) => updateField("hospitalAffiliations", items)}
              fields={[
                { name: "name", label: "Hospital Name", type: "text", placeholder: "e.g., Apollo Hospital", required: true },
                { name: "role", label: "Role", type: "text", placeholder: "e.g., Senior Consultant", required: true },
                { name: "department", label: "Department", type: "text", placeholder: "e.g., Cardiology" },
              ]}
              addLabel="Add Affiliation"
              emptyMessage="No affiliations added yet"
              maxItems={5}
            />
          </SectionWrapper>

          {/* Conditions Treated */}
          <SectionWrapper
            title="Conditions Treated"
            description="What you specialize in"
            icon={<Stethoscope className="w-5 h-5" />}
            isVisible={isSectionVisible("conditions")}
            onVisibilityChange={(v) => toggleVisibility("conditions", v)}
            hasAI
          >
            <div className="space-y-4">
              <TagInput
                value={formData.conditionsTreated}
                onChange={(v) => updateField("conditionsTreated", v)}
                placeholder="e.g., Hypertension"
                maxTags={30}
              />
              <AISuggestTags
                currentTags={formData.conditionsTreated ? formData.conditionsTreated.split(",").map(t => t.trim()).filter(Boolean) : []}
                specialty={profile.specialty || ""}
                type="conditions"
                onAddTag={(tag) => {
                  const currentTags = formData.conditionsTreated ? formData.conditionsTreated.split(",").map(t => t.trim()).filter(Boolean) : [];
                  if (!currentTags.includes(tag)) {
                    updateField("conditionsTreated", [...currentTags, tag].join(", "));
                  }
                }}
                disabled={!profile.specialty}
              />
            </div>
          </SectionWrapper>

          {/* Procedures */}
          <SectionWrapper
            title="Procedures & Treatments"
            description="What you perform"
            icon={<Scissors className="w-5 h-5" />}
            isVisible={isSectionVisible("procedures")}
            onVisibilityChange={(v) => toggleVisibility("procedures", v)}
            hasAI
          >
            <div className="space-y-4">
              <TagInput
                value={formData.proceduresPerformed}
                onChange={(v) => updateField("proceduresPerformed", v)}
                placeholder="e.g., Angioplasty"
                maxTags={30}
              />
              <AISuggestTags
                currentTags={formData.proceduresPerformed ? formData.proceduresPerformed.split(",").map(t => t.trim()).filter(Boolean) : []}
                specialty={profile.specialty || ""}
                type="procedures"
                onAddTag={(tag) => {
                  const currentTags = formData.proceduresPerformed ? formData.proceduresPerformed.split(",").map(t => t.trim()).filter(Boolean) : [];
                  if (!currentTags.includes(tag)) {
                    updateField("proceduresPerformed", [...currentTags, tag].join(", "));
                  }
                }}
                disabled={!profile.specialty}
              />
            </div>
          </SectionWrapper>

          {/* Approach to Care */}
          <SectionWrapper
            title="Approach to Care"
            description="Your philosophy"
            icon={<Heart className="w-5 h-5" />}
            isVisible={isSectionVisible("approach")}
            onVisibilityChange={(v) => toggleVisibility("approach", v)}
            hasAI
          >
            <div className="space-y-3">
              <Textarea
                value={formData.approachToCare}
                onChange={(e) => updateField("approachToCare", e.target.value)}
                placeholder="Describe your approach to patient care..."
                className="min-h-[120px]"
                maxLength={2000}
              />
              <div className="flex items-center justify-between">
                <AIEnhanceButton text={formData.approachToCare} type="approach" onEnhance={(text) => updateField("approachToCare", text)} />
                <p className="text-xs text-slate-400">{formData.approachToCare.length}/2000</p>
              </div>
            </div>
          </SectionWrapper>

          {/* Case Studies */}
          <SectionWrapper
            title="Case Studies"
            description="Notable cases"
            icon={<BookOpen className="w-5 h-5" />}
            isVisible={isSectionVisible("cases")}
            onVisibilityChange={(v) => toggleVisibility("cases", v)}
            badge="PRO"
          >
            <ArrayEditor<CaseStudyItem>
              items={formData.caseStudies}
              onChange={(items) => updateField("caseStudies", items)}
              fields={[
                { name: "title", label: "Title", type: "text", placeholder: "e.g., Complex Surgery", required: true },
                { name: "description", label: "Description", type: "textarea", placeholder: "Describe the case..." },
                { name: "outcome", label: "Outcome", type: "text", placeholder: "e.g., Full recovery" },
              ]}
              addLabel="Add Case"
              emptyMessage="No cases added yet"
              maxItems={5}
            />
          </SectionWrapper>

          {/* First Visit Guide */}
          <SectionWrapper
            title="First Visit Guide"
            description="For new patients"
            icon={<CalendarCheck className="w-5 h-5" />}
            isVisible={isSectionVisible("firstVisit")}
            onVisibilityChange={(v) => toggleVisibility("firstVisit", v)}
            hasAI
          >
            <div className="space-y-3">
              <Textarea
                value={formData.firstVisitGuide}
                onChange={(e) => updateField("firstVisitGuide", e.target.value)}
                placeholder="What should patients bring? What to expect?..."
                className="min-h-[120px]"
                maxLength={2000}
              />
              <div className="flex items-center justify-between">
                <AIEnhanceButton text={formData.firstVisitGuide} type="first_visit" onEnhance={(text) => updateField("firstVisitGuide", text)} />
                <p className="text-xs text-slate-400">{formData.firstVisitGuide.length}/2000</p>
              </div>
            </div>
          </SectionWrapper>

          {/* Availability */}
          <SectionWrapper
            title="Availability Status"
            description="Accepting new patients?"
            icon={<Clock className="w-5 h-5" />}
            isVisible={isSectionVisible("availability")}
            onVisibilityChange={(v) => toggleVisibility("availability", v)}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={cn("w-3 h-3 rounded-full", formData.isAvailable ? "bg-emerald-500" : "bg-red-400")} />
                  <Label className="text-sm font-medium">{formData.isAvailable ? "Accepting New Patients" : "Not Accepting"}</Label>
                </div>
                <Switch checked={formData.isAvailable} onCheckedChange={(v) => updateField("isAvailable", v)} className="data-[state=checked]:bg-emerald-500" />
              </div>
              <Input
                value={formData.availabilityNote}
                onChange={(e) => updateField("availabilityNote", e.target.value)}
                placeholder="e.g., Available Mon & Thu only"
                className="h-10"
                maxLength={500}
              />
            </div>
          </SectionWrapper>

          {/* Telemedicine */}
          <SectionWrapper
            title="Telemedicine"
            description="Online consultations"
            icon={<MonitorSmartphone className="w-5 h-5" />}
            isVisible={isSectionVisible("telemedicine")}
            onVisibilityChange={(v) => toggleVisibility("telemedicine", v)}
          >
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <MonitorSmartphone className={cn("w-5 h-5", formData.offersTelemedicine ? "text-emerald-600" : "text-slate-400")} />
                <Label className="text-sm font-medium">{formData.offersTelemedicine ? "Available" : "Not Available"}</Label>
              </div>
              <Switch checked={formData.offersTelemedicine} onCheckedChange={(v) => updateField("offersTelemedicine", v)} className="data-[state=checked]:bg-emerald-500" />
            </div>
          </SectionWrapper>

          {/* Memberships */}
          <SectionWrapper
            title="Professional Memberships"
            description="Medical associations"
            icon={<Users className="w-5 h-5" />}
            isVisible={isSectionVisible("memberships")}
            onVisibilityChange={(v) => toggleVisibility("memberships", v)}
          >
            <ArrayEditor<MembershipItem>
              items={formData.professionalMemberships}
              onChange={(items) => updateField("professionalMemberships", items)}
              fields={[
                { name: "organization", label: "Organization", type: "text", placeholder: "e.g., IMA", required: true },
                { name: "year", label: "Since", type: "year", placeholder: "2010" },
              ]}
              addLabel="Add Membership"
              emptyMessage="No memberships added yet"
              maxItems={10}
            />
          </SectionWrapper>

          {/* Media */}
          <SectionWrapper
            title="Media & Publications"
            description="Articles and appearances"
            icon={<Newspaper className="w-5 h-5" />}
            isVisible={isSectionVisible("media")}
            onVisibilityChange={(v) => toggleVisibility("media", v)}
          >
            <ArrayEditor<MediaItem>
              items={formData.mediaPublications}
              onChange={(items) => updateField("mediaPublications", items)}
              fields={[
                { name: "title", label: "Title", type: "text", placeholder: "Article title", required: true },
                { name: "publication", label: "Source", type: "text", placeholder: "Times of India", required: true },
                { name: "link", label: "Link", type: "text", placeholder: "https://..." },
                { name: "year", label: "Year", type: "year", placeholder: "2023" },
              ]}
              addLabel="Add Publication"
              emptyMessage="No publications added yet"
              maxItems={10}
            />
          </SectionWrapper>

          {/* Gallery */}
          <SectionWrapper
            title="Clinic Gallery"
            description="Photos of your clinic"
            icon={<ImageIcon className="w-5 h-5" />}
            isVisible={isSectionVisible("gallery")}
            onVisibilityChange={(v) => toggleVisibility("gallery", v)}
          >
            <ImageGalleryEditor
              images={formData.clinicGallery}
              onChange={(images) => updateField("clinicGallery", images)}
              maxImages={6}
              profileId={profile.id}
            />
          </SectionWrapper>
        </TabsContent>

        {/* SETTINGS TAB */}
        <TabsContent value="settings" className="space-y-5 mt-5">
          {/* Verification */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-slate-500" />
              <h2 className="text-base font-semibold text-slate-900">Verification</h2>
            </div>
            <VerificationUpload
              profileId={profile.id}
              currentStatus={profileData.verification_status}
              isVerified={profileData.is_verified}
            />
          </div>

          {/* Profile Visibility */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Power className="w-5 h-5 text-slate-500" />
              <h2 className="text-base font-semibold text-slate-900">Profile Visibility</h2>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 bg-slate-50">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-slate-900">{isFrozen ? "Profile is Offline" : "Profile is Live"}</p>
                  {isFrozen && <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded">Frozen</span>}
                </div>
                <p className="text-sm text-slate-500 mt-1">
                  {isFrozen ? "Hidden from patients" : `Live at verified.doctor/${profile.handle}`}
                </p>
              </div>
              <Switch
                checked={isFrozen}
                onCheckedChange={handleFreezeToggle}
                disabled={isTogglingFreeze}
                className={cn(isFrozen && "data-[state=checked]:bg-amber-500")}
              />
            </div>

            {isFrozen && (
              <div className="mt-4 p-4 rounded-lg bg-amber-50 border border-amber-200">
                <div className="flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">Profile frozen</p>
                    <p className="text-sm text-amber-700 mt-1">Patients cannot find you or send messages.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Account */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <LogOut className="w-5 h-5 text-slate-500" />
              <h2 className="text-base font-semibold text-slate-900">Account</h2>
            </div>
            <p className="text-sm text-slate-500 mb-4">Sign out of your account.</p>
            <Button
              variant="outline"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                window.location.href = "/";
              }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Bottom Save Button - Only shows when there are unsaved changes */}
      {hasChanges && (
        <div className="sticky bottom-[68px] sm:bottom-4 z-30 pt-2 pb-1">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={cn(
              "w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg font-medium text-sm transition-all active:scale-[0.98] shadow-lg",
              isSaving
                ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                : "bg-gradient-to-r from-sky-500 to-blue-500 text-white hover:from-sky-600 hover:to-blue-600"
            )}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
