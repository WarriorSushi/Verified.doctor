"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Clock,
  ThumbsUp,
  Users,
  Calendar,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Play,
  Pause,
  Building2,
  Stethoscope,
  Heart,
  BookOpen,
  CheckCircle,
  Video,
  Globe,
  Award,
  Newspaper,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTheme } from "@/lib/theme-config";

// Extended sample doctor profiles data with all new fields
const SAMPLE_DOCTORS = [
  {
    id: "1",
    handle: "priya-sharma",
    full_name: "Dr. Priya Sharma",
    specialty: "Cardiologist",
    qualifications: "MBBS, MD (Cardiology), DM",
    years_experience: 15,
    clinic_name: "HeartCare Clinic",
    clinic_location: "Bandra, Mumbai",
    profile_photo_url: "/doctors/doctor-1.webp",
    bio: "Dedicated to providing comprehensive cardiac care with a focus on preventive cardiology and heart failure management.",
    recommendation_count: 127,
    connection_count: 34,
    is_verified: true,
    layout: "classic",
    theme: "blue",
    services: ["ECG", "Echocardiography", "Stress Test", "Holter Monitoring"],
    // New fields
    education_timeline: [
      { institution: "AIIMS, New Delhi", degree: "MBBS", year: "2005" },
      { institution: "AIIMS, New Delhi", degree: "MD (Cardiology)", year: "2009" },
      { institution: "Apollo Hospital", degree: "DM (Cardiology)", year: "2012" },
    ],
    hospital_affiliations: [
      { name: "Lilavati Hospital", role: "Consultant", department: "Cardiology" },
      { name: "Breach Candy Hospital", role: "Visiting", department: "Cardiac ICU" },
    ],
    conditions_treated: "Heart Failure, Coronary Artery Disease, Hypertension, Arrhythmias, Valve Disorders",
    procedures_performed: "Angioplasty, Pacemaker Implantation, Cardiac Catheterization, Stress Testing",
    approach_to_care: "I believe in a patient-centered approach combining evidence-based medicine with lifestyle modifications. Every heart is unique, and so is my treatment plan for each patient.",
    case_studies: [
      { title: "Complex Triple Vessel Disease", description: "Successful management of a 65-year-old patient with multiple blockages", outcome: "Complete recovery with stent placement" },
    ],
    first_visit_guide: "Please bring all previous reports, ECGs, and a list of current medications. Fasting for 12 hours is recommended if blood tests are needed.",
    is_available: true,
    availability_note: "Accepting new patients",
    offers_telemedicine: true,
    professional_memberships: [
      { organization: "Cardiological Society of India", year: "2010" },
      { organization: "American College of Cardiology", year: "2015" },
    ],
    media_publications: [
      { title: "Heart Health in Urban India", publication: "Times of India", link: "#", year: "2023" },
    ],
  },
  {
    id: "2",
    handle: "arjun-patel",
    full_name: "Dr. Arjun Patel",
    specialty: "Orthopedic Surgeon",
    qualifications: "MBBS, MS (Ortho), Fellowship",
    years_experience: 12,
    clinic_name: "BoneHealth Hospital",
    clinic_location: "Koramangala, Bangalore",
    profile_photo_url: "/doctors/doctor-2.webp",
    bio: "Specialized in joint replacement surgery and sports medicine. Committed to getting you back to your active lifestyle.",
    recommendation_count: 89,
    connection_count: 28,
    is_verified: true,
    layout: "hero",
    theme: "ocean",
    services: ["Joint Replacement", "Arthroscopy", "Sports Medicine", "Trauma Care"],
    education_timeline: [
      { institution: "KMC Manipal", degree: "MBBS", year: "2008" },
      { institution: "NIMHANS", degree: "MS (Orthopedics)", year: "2013" },
      { institution: "Germany", degree: "Fellowship - Arthroplasty", year: "2015" },
    ],
    hospital_affiliations: [
      { name: "Manipal Hospital", role: "Senior Consultant", department: "Orthopedics" },
      { name: "Fortis Hospital", role: "Visiting", department: "Joint Replacement" },
    ],
    conditions_treated: "Osteoarthritis, ACL Injuries, Fractures, Back Pain, Sports Injuries, Rheumatoid Arthritis",
    procedures_performed: "Total Knee Replacement, Hip Replacement, ACL Reconstruction, Arthroscopic Surgery",
    approach_to_care: "My philosophy is to exhaust all conservative treatments before recommending surgery. When surgery is needed, I use minimally invasive techniques for faster recovery.",
    case_studies: [
      { title: "Bilateral Knee Replacement", description: "Young patient (52) with severe osteoarthritis in both knees", outcome: "Walking independently within 3 weeks" },
    ],
    first_visit_guide: "Bring X-rays and MRI scans if available. Wear comfortable clothing that allows examination of the affected joint.",
    is_available: true,
    availability_note: "Limited slots available",
    offers_telemedicine: true,
    professional_memberships: [
      { organization: "Indian Orthopaedic Association", year: "2013" },
      { organization: "SICOT", year: "2016" },
    ],
    media_publications: [
      { title: "Advances in Robotic Knee Surgery", publication: "Indian Express", link: "#", year: "2024" },
    ],
  },
  {
    id: "3",
    handle: "fatima-khan",
    full_name: "Dr. Fatima Khan",
    specialty: "Dermatologist",
    qualifications: "MBBS, MD (Dermatology)",
    years_experience: 8,
    clinic_name: "SkinGlow Clinic",
    clinic_location: "Jubilee Hills, Hyderabad",
    profile_photo_url: "/doctors/doctor-3.webp",
    bio: "Expert in medical and cosmetic dermatology. Helping patients achieve healthy, beautiful skin through personalized treatments.",
    recommendation_count: 156,
    connection_count: 42,
    is_verified: true,
    layout: "magazine",
    theme: "warm",
    services: ["Acne Treatment", "Laser Therapy", "Hair Loss", "Skin Cancer Screening"],
    education_timeline: [
      { institution: "Osmania Medical College", degree: "MBBS", year: "2012" },
      { institution: "JIPMER", degree: "MD (Dermatology)", year: "2016" },
    ],
    hospital_affiliations: [
      { name: "Apollo Hospital", role: "Consultant", department: "Dermatology" },
      { name: "KIMS Hospital", role: "Visiting", department: "Cosmetic Dermatology" },
    ],
    conditions_treated: "Acne, Eczema, Psoriasis, Pigmentation, Hair Loss, Skin Allergies, Vitiligo",
    procedures_performed: "Laser Treatment, Chemical Peels, Botox, Dermal Fillers, PRP Therapy, Microneedling",
    approach_to_care: "Skin health is a journey, not a destination. I combine advanced treatments with personalized skincare routines for lasting results.",
    case_studies: [
      { title: "Severe Cystic Acne", description: "Teenage patient with treatment-resistant acne affecting self-esteem", outcome: "Clear skin achieved in 6 months with isotretinoin therapy" },
    ],
    first_visit_guide: "Come with clean skin, no makeup if possible. List all skincare products you currently use.",
    is_available: true,
    availability_note: "Evening slots available",
    offers_telemedicine: true,
    professional_memberships: [
      { organization: "Indian Association of Dermatologists", year: "2016" },
      { organization: "American Academy of Dermatology", year: "2019" },
    ],
    media_publications: [
      { title: "Monsoon Skincare Tips", publication: "Femina", link: "#", year: "2024" },
    ],
  },
  {
    id: "4",
    handle: "rajesh-verma",
    full_name: "Dr. Rajesh Verma",
    specialty: "Neurologist",
    qualifications: "MBBS, MD, DM (Neurology)",
    years_experience: 20,
    clinic_name: "NeuroLife Center",
    clinic_location: "Connaught Place, Delhi",
    profile_photo_url: "/doctors/doctor-4.webp",
    bio: "Leading neurologist with expertise in stroke management, epilepsy, and neurodegenerative disorders.",
    recommendation_count: 203,
    connection_count: 56,
    is_verified: true,
    layout: "grid",
    theme: "sage",
    services: ["Stroke Care", "Epilepsy Treatment", "Headache Clinic", "Movement Disorders"],
    education_timeline: [
      { institution: "Maulana Azad Medical College", degree: "MBBS", year: "2000" },
      { institution: "AIIMS Delhi", degree: "MD (Medicine)", year: "2004" },
      { institution: "NIMHANS", degree: "DM (Neurology)", year: "2007" },
    ],
    hospital_affiliations: [
      { name: "Max Hospital", role: "Director", department: "Neurology" },
      { name: "Sir Ganga Ram Hospital", role: "Consultant", department: "Stroke Unit" },
    ],
    conditions_treated: "Stroke, Epilepsy, Parkinson's Disease, Multiple Sclerosis, Migraine, Dementia, Neuropathy",
    procedures_performed: "EEG, EMG, Nerve Conduction Studies, Botox for Migraines, Lumbar Puncture",
    approach_to_care: "Early diagnosis and intervention are key in neurology. I leverage the latest technology and research to provide the best outcomes for my patients.",
    case_studies: [
      { title: "Acute Stroke Intervention", description: "58-year-old patient brought in within golden hour with paralysis", outcome: "Full recovery after thrombectomy" },
    ],
    first_visit_guide: "Bring all previous brain scans (CT/MRI), medication list, and a family member who can provide history if needed.",
    is_available: true,
    availability_note: "Urgent cases prioritized",
    offers_telemedicine: true,
    professional_memberships: [
      { organization: "Indian Academy of Neurology", year: "2008" },
      { organization: "World Stroke Organization", year: "2012" },
    ],
    media_publications: [
      { title: "Recognizing Stroke Signs", publication: "Hindustan Times", link: "#", year: "2023" },
      { title: "Living with Epilepsy", publication: "Health Magazine", link: "#", year: "2024" },
    ],
  },
  {
    id: "5",
    handle: "ananya-reddy",
    full_name: "Dr. Ananya Reddy",
    specialty: "Pediatrician",
    qualifications: "MBBS, MD (Pediatrics), Fellowship",
    years_experience: 10,
    clinic_name: "Little Stars Hospital",
    clinic_location: "Anna Nagar, Chennai",
    profile_photo_url: "/doctors/doctor-5.webp",
    bio: "Compassionate pediatric care with a focus on child development and preventive healthcare for your little ones.",
    recommendation_count: 178,
    connection_count: 38,
    is_verified: true,
    layout: "minimal",
    theme: "teal",
    services: ["Well Child Visits", "Vaccinations", "Growth Monitoring", "Developmental Assessment"],
    education_timeline: [
      { institution: "Madras Medical College", degree: "MBBS", year: "2010" },
      { institution: "ICH Egmore", degree: "MD (Pediatrics)", year: "2014" },
      { institution: "UK", degree: "Fellowship - Neonatology", year: "2016" },
    ],
    hospital_affiliations: [
      { name: "Rainbow Children's Hospital", role: "Consultant", department: "Pediatrics" },
      { name: "Apollo Children's Hospital", role: "Visiting", department: "NICU" },
    ],
    conditions_treated: "Common Childhood Illnesses, Asthma, Allergies, Growth Disorders, Behavioral Issues, ADHD",
    procedures_performed: "Vaccinations, Developmental Screening, Allergy Testing, Minor Procedures",
    approach_to_care: "Children are not mini-adults. I provide age-appropriate care with a gentle approach, ensuring both the child and parents feel comfortable and informed.",
    case_studies: [
      { title: "Failure to Thrive", description: "Infant with poor weight gain and feeding difficulties", outcome: "Identified underlying condition, normal growth achieved in 6 months" },
    ],
    first_visit_guide: "Bring the child's vaccination record, any previous medical records, and a list of concerns or questions you have.",
    is_available: true,
    availability_note: "Same-day appointments for sick children",
    offers_telemedicine: true,
    professional_memberships: [
      { organization: "Indian Academy of Pediatrics", year: "2014" },
      { organization: "National Neonatology Forum", year: "2016" },
    ],
    media_publications: [
      { title: "Importance of Breastfeeding", publication: "The Hindu", link: "#", year: "2023" },
    ],
  },
];

type Doctor = typeof SAMPLE_DOCTORS[0];
type ThemeColors = ReturnType<typeof getTheme>['colors'];

// Auto-scrolling wrapper component for profile content
function AutoScrollContainer({
  children,
  isActive
}: {
  children: React.ReactNode;
  isActive: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const [scrollDirection, setScrollDirection] = useState<'down' | 'up'>('down');

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const maxScroll = container.scrollHeight - container.clientHeight;

    if (maxScroll <= 0) return; // No need to scroll

    let startTime: number | null = null;
    const scrollDuration = 2500; // 2.5 seconds to scroll down
    const pauseDuration = 500; // 0.5 seconds pause at ends
    const totalCycleDuration = (scrollDuration + pauseDuration) * 2;

    const easeInOutCubic = (t: number) => {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = (timestamp - startTime) % totalCycleDuration;

      if (elapsed < scrollDuration) {
        // Scrolling down
        const progress = elapsed / scrollDuration;
        container.scrollTop = maxScroll * easeInOutCubic(progress);
        setScrollDirection('down');
      } else if (elapsed < scrollDuration + pauseDuration) {
        // Paused at bottom
        container.scrollTop = maxScroll;
      } else if (elapsed < scrollDuration * 2 + pauseDuration) {
        // Scrolling up
        const progress = (elapsed - scrollDuration - pauseDuration) / scrollDuration;
        container.scrollTop = maxScroll * (1 - easeInOutCubic(progress));
        setScrollDirection('up');
      } else {
        // Paused at top
        container.scrollTop = 0;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    // Start animation after a short delay
    const timeout = setTimeout(() => {
      animationRef.current = requestAnimationFrame(animate);
    }, 300);

    return () => {
      clearTimeout(timeout);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive]);

  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto scrollbar-hide"
      style={{ scrollBehavior: 'auto' }}
    >
      {children}
    </div>
  );
}

// Mini profile card that mimics actual profile page
function ProfileCard({ doctor, isActive }: { doctor: Doctor; isActive: boolean }) {
  const theme = getTheme(doctor.theme);
  const colors = theme.colors;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{
        opacity: isActive ? 1 : 0.6,
        scale: isActive ? 1 : 0.9,
        y: isActive ? 0 : 10
      }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`relative transition-all duration-500 ${isActive ? 'z-10' : 'z-0'}`}
    >
      {/* Phone Frame */}
      <div className={`relative rounded-[32px] p-2 transition-all duration-500 ${
        isActive
          ? 'bg-gradient-to-br from-slate-800 to-slate-900 shadow-2xl shadow-slate-900/50'
          : 'bg-slate-800/80 shadow-xl'
      }`}>
        {/* Screen */}
        <div
          className="relative rounded-[24px] overflow-hidden w-[280px] sm:w-[320px] h-[500px] sm:h-[560px]"
          style={{ backgroundColor: colors.background }}
        >
          {/* Status Bar */}
          <div
            className="absolute top-0 left-0 right-0 h-8 flex items-center justify-between px-5 z-20"
            style={{ backgroundColor: `${colors.text}05` }}
          >
            <span className="text-xs font-medium" style={{ color: colors.textMuted }}>9:41</span>
            <div className="flex items-center gap-1">
              <div className="w-4 h-2.5 rounded-sm" style={{ backgroundColor: colors.textMuted }} />
            </div>
          </div>

          {/* Content based on layout */}
          <div className="absolute inset-0 pt-8 overflow-hidden">
            {doctor.layout === "classic" && (
              <ClassicLayout doctor={doctor} colors={colors} isActive={isActive} />
            )}
            {doctor.layout === "hero" && (
              <HeroLayout doctor={doctor} colors={colors} isActive={isActive} />
            )}
            {doctor.layout === "magazine" && (
              <MagazineLayout doctor={doctor} colors={colors} isActive={isActive} />
            )}
            {doctor.layout === "grid" && (
              <GridLayout doctor={doctor} colors={colors} isActive={isActive} />
            )}
            {doctor.layout === "minimal" && (
              <MinimalLayout doctor={doctor} colors={colors} isActive={isActive} />
            )}
          </div>
        </div>
      </div>

      {/* Label */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: isActive ? 1 : 0.5, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-4 text-center"
      >
        <p className={`font-semibold text-sm ${isActive ? 'text-slate-800' : 'text-slate-500'}`}>
          {doctor.full_name}
        </p>
        <p className="text-xs text-slate-400">
          {doctor.specialty} • {doctor.layout.charAt(0).toUpperCase() + doctor.layout.slice(1)} Layout
        </p>
      </motion.div>
    </motion.div>
  );
}

// Section components for new fields
function EducationSection({ education, colors }: { education: Doctor['education_timeline']; colors: ThemeColors }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <GraduationCap className="w-4 h-4" style={{ color: colors.primary }} />
        <span className="text-xs font-semibold" style={{ color: colors.text }}>Education</span>
      </div>
      <div className="space-y-1.5">
        {education.map((edu, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: colors.primary }} />
            <div>
              <p className="text-[10px] font-medium" style={{ color: colors.text }}>{edu.degree}</p>
              <p className="text-[9px]" style={{ color: colors.textMuted }}>{edu.institution}, {edu.year}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HospitalSection({ hospitals, colors }: { hospitals: Doctor['hospital_affiliations']; colors: ThemeColors }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Building2 className="w-4 h-4" style={{ color: colors.primary }} />
        <span className="text-xs font-semibold" style={{ color: colors.text }}>Hospital Affiliations</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {hospitals.map((h, i) => (
          <span key={i} className="px-2 py-0.5 rounded-full text-[9px]" style={{ backgroundColor: colors.backgroundAlt, color: colors.text }}>
            {h.name}
          </span>
        ))}
      </div>
    </div>
  );
}

function ConditionsSection({ conditions, procedures, colors }: { conditions: string; procedures: string; colors: ThemeColors }) {
  const conditionList = conditions.split(', ').slice(0, 4);
  const procedureList = procedures.split(', ').slice(0, 3);

  return (
    <div className="space-y-3">
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <Stethoscope className="w-3.5 h-3.5" style={{ color: colors.primary }} />
          <span className="text-[10px] font-semibold" style={{ color: colors.text }}>Conditions Treated</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {conditionList.map((c, i) => (
            <span key={i} className="px-1.5 py-0.5 rounded text-[8px]" style={{ backgroundColor: `${colors.primary}15`, color: colors.primary }}>
              {c}
            </span>
          ))}
        </div>
      </div>
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <Heart className="w-3.5 h-3.5" style={{ color: colors.primary }} />
          <span className="text-[10px] font-semibold" style={{ color: colors.text }}>Procedures</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {procedureList.map((p, i) => (
            <span key={i} className="px-1.5 py-0.5 rounded text-[8px]" style={{ backgroundColor: colors.backgroundAlt, color: colors.text }}>
              {p}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ApproachSection({ approach, colors }: { approach: string; colors: ThemeColors }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <BookOpen className="w-3.5 h-3.5" style={{ color: colors.primary }} />
        <span className="text-[10px] font-semibold" style={{ color: colors.text }}>Approach to Care</span>
      </div>
      <p className="text-[9px] leading-relaxed" style={{ color: colors.textMuted }}>
        {approach.slice(0, 150)}...
      </p>
    </div>
  );
}

function AvailabilitySection({ isAvailable, note, telemedicine, colors }: { isAvailable: boolean; note: string; telemedicine: boolean; colors: ThemeColors }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {isAvailable && (
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ backgroundColor: '#10B98120' }}>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-[9px] text-emerald-600">{note}</span>
        </div>
      )}
      {telemedicine && (
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ backgroundColor: `${colors.primary}15` }}>
          <Globe className="w-3 h-3" style={{ color: colors.primary }} />
          <span className="text-[9px]" style={{ color: colors.primary }}>Telemedicine</span>
        </div>
      )}
    </div>
  );
}

function MembershipsSection({ memberships, colors }: { memberships: Doctor['professional_memberships']; colors: ThemeColors }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <Award className="w-3.5 h-3.5" style={{ color: colors.primary }} />
        <span className="text-[10px] font-semibold" style={{ color: colors.text }}>Professional Memberships</span>
      </div>
      <div className="space-y-1">
        {memberships.map((m, i) => (
          <p key={i} className="text-[9px]" style={{ color: colors.textMuted }}>{m.organization}</p>
        ))}
      </div>
    </div>
  );
}

function FirstVisitSection({ guide, colors }: { guide: string; colors: ThemeColors }) {
  return (
    <div className="p-2.5 rounded-lg" style={{ backgroundColor: colors.backgroundAlt }}>
      <div className="flex items-center gap-2 mb-1.5">
        <CheckCircle className="w-3.5 h-3.5" style={{ color: colors.primary }} />
        <span className="text-[10px] font-semibold" style={{ color: colors.text }}>First Visit Guide</span>
      </div>
      <p className="text-[9px] leading-relaxed" style={{ color: colors.textMuted }}>
        {guide.slice(0, 120)}...
      </p>
    </div>
  );
}

// Classic Layout with all sections
function ClassicLayout({ doctor, colors, isActive }: { doctor: Doctor; colors: ThemeColors; isActive: boolean }) {
  return (
    <AutoScrollContainer isActive={isActive}>
      <div className="flex flex-col p-5 pb-8" style={{ backgroundColor: colors.background }}>
        {/* Nav */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 relative">
              <Image src="/verified-doctor-logo.svg" alt="" fill />
            </div>
            <span className="text-xs font-medium" style={{ color: colors.textMuted }}>verified.doctor</span>
          </div>
        </div>

        {/* Profile */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-20 h-20 rounded-full overflow-hidden mb-3 shadow-lg" style={{ boxShadow: `0 4px 20px ${colors.primary}20` }}>
            <Image src={doctor.profile_photo_url} alt={doctor.full_name} width={80} height={80} className="object-cover w-full h-full" />
          </div>
          <div className="flex items-center gap-1.5 mb-1">
            <h2 className="text-lg font-semibold" style={{ color: colors.text }}>{doctor.full_name}</h2>
            <div className="w-4 h-4 relative">
              <Image src="/verified-doctor-logo.svg" alt="Verified" fill />
            </div>
          </div>
          <p className="text-sm font-medium mb-2" style={{ color: colors.primary }}>{doctor.specialty}</p>
          <div className="flex items-center gap-1 text-xs" style={{ color: colors.textMuted }}>
            <MapPin className="w-3 h-3" />
            <span>{doctor.clinic_location}</span>
          </div>
        </div>

        {/* Availability */}
        <div className="flex justify-center mb-4">
          <AvailabilitySection
            isAvailable={doctor.is_available}
            note={doctor.availability_note}
            telemedicine={doctor.offers_telemedicine}
            colors={colors}
          />
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-6 mb-5 py-3 border-y" style={{ borderColor: colors.cardBorder }}>
          <div className="text-center">
            <p className="text-xl font-bold" style={{ color: colors.text }}>{doctor.recommendation_count}</p>
            <p className="text-[10px] uppercase tracking-wider" style={{ color: colors.textMuted }}>Recommendations</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold" style={{ color: colors.text }}>{doctor.connection_count}</p>
            <p className="text-[10px] uppercase tracking-wider" style={{ color: colors.textMuted }}>Connections</p>
          </div>
        </div>

        {/* Education */}
        <div className="mb-4">
          <EducationSection education={doctor.education_timeline} colors={colors} />
        </div>

        {/* Hospitals */}
        <div className="mb-4">
          <HospitalSection hospitals={doctor.hospital_affiliations} colors={colors} />
        </div>

        {/* Conditions & Procedures */}
        <div className="mb-4">
          <ConditionsSection conditions={doctor.conditions_treated} procedures={doctor.procedures_performed} colors={colors} />
        </div>

        {/* Approach */}
        <div className="mb-4">
          <ApproachSection approach={doctor.approach_to_care} colors={colors} />
        </div>

        {/* First Visit */}
        <div className="mb-4">
          <FirstVisitSection guide={doctor.first_visit_guide} colors={colors} />
        </div>

        {/* Memberships */}
        <div className="mb-6">
          <MembershipsSection memberships={doctor.professional_memberships} colors={colors} />
        </div>

        {/* CTA */}
        <div className="space-y-2 mt-auto">
          <button
            className="w-full py-3 rounded-full text-sm font-semibold"
            style={{ backgroundColor: colors.primary, color: colors.textOnPrimary }}
          >
            Book Appointment
          </button>
          <button
            className="w-full py-3 rounded-full text-sm font-semibold border"
            style={{ borderColor: colors.cardBorder, color: colors.text }}
          >
            Send Inquiry
          </button>
        </div>
      </div>
    </AutoScrollContainer>
  );
}

// Hero Layout with all sections
function HeroLayout({ doctor, colors, isActive }: { doctor: Doctor; colors: ThemeColors; isActive: boolean }) {
  return (
    <AutoScrollContainer isActive={isActive}>
      <div className="flex flex-col pb-8" style={{ backgroundColor: colors.background }}>
        {/* Hero Banner */}
        <div
          className="h-36 relative flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryHover})` }}
        >
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-4 left-4 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute bottom-8 right-8 w-24 h-24 rounded-full bg-white/10 blur-xl" />
          </div>
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
            <div className="w-24 h-24 rounded-full border-4 overflow-hidden shadow-xl" style={{ borderColor: colors.background }}>
              <Image src={doctor.profile_photo_url} alt={doctor.full_name} width={96} height={96} className="object-cover w-full h-full" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="pt-14 px-5">
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <h2 className="text-lg font-bold" style={{ color: colors.text }}>{doctor.full_name}</h2>
              <div className="w-4 h-4 relative">
                <Image src="/verified-doctor-logo.svg" alt="Verified" fill />
              </div>
            </div>
            <p className="text-sm font-medium mb-1" style={{ color: colors.primary }}>{doctor.specialty}</p>
            <p className="text-xs mb-3" style={{ color: colors.textMuted }}>{doctor.qualifications}</p>

            {/* Availability */}
            <div className="flex justify-center">
              <AvailabilitySection
                isAvailable={doctor.is_available}
                note={doctor.availability_note}
                telemedicine={doctor.offers_telemedicine}
                colors={colors}
              />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="flex gap-3 mb-4">
            <div className="flex-1 p-3 rounded-xl" style={{ backgroundColor: colors.backgroundAlt }}>
              <p className="text-lg font-bold" style={{ color: colors.text }}>{doctor.recommendation_count}</p>
              <p className="text-[10px]" style={{ color: colors.textMuted }}>Recommendations</p>
            </div>
            <div className="flex-1 p-3 rounded-xl" style={{ backgroundColor: colors.backgroundAlt }}>
              <p className="text-lg font-bold" style={{ color: colors.text }}>{doctor.connection_count}</p>
              <p className="text-[10px]" style={{ color: colors.textMuted }}>Connections</p>
            </div>
          </div>

          {/* Education */}
          <div className="mb-4">
            <EducationSection education={doctor.education_timeline} colors={colors} />
          </div>

          {/* Hospitals */}
          <div className="mb-4">
            <HospitalSection hospitals={doctor.hospital_affiliations} colors={colors} />
          </div>

          {/* Conditions */}
          <div className="mb-4">
            <ConditionsSection conditions={doctor.conditions_treated} procedures={doctor.procedures_performed} colors={colors} />
          </div>

          {/* Approach */}
          <div className="mb-4">
            <ApproachSection approach={doctor.approach_to_care} colors={colors} />
          </div>

          {/* First Visit */}
          <div className="mb-4">
            <FirstVisitSection guide={doctor.first_visit_guide} colors={colors} />
          </div>

          {/* CTA */}
          <button
            className="w-full py-3 rounded-xl text-sm font-semibold shadow-lg"
            style={{ backgroundColor: colors.primary, color: colors.textOnPrimary }}
          >
            Book Appointment
          </button>
        </div>
      </div>
    </AutoScrollContainer>
  );
}

// Magazine Layout with all sections
function MagazineLayout({ doctor, colors, isActive }: { doctor: Doctor; colors: ThemeColors; isActive: boolean }) {
  return (
    <AutoScrollContainer isActive={isActive}>
      <div className="flex flex-col pb-8" style={{ backgroundColor: colors.background }}>
        {/* Top Section - Photo */}
        <div className="relative h-44 overflow-hidden flex-shrink-0">
          <Image
            src={doctor.profile_photo_url}
            alt={doctor.full_name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <p className="text-xs font-medium mb-1 uppercase tracking-wider" style={{ color: colors.accent }}>{doctor.specialty}</p>
            <div className="flex items-center gap-1.5">
              <h2 className="text-xl font-bold text-white">{doctor.full_name}</h2>
              <div className="w-4 h-4 relative">
                <Image src="/verified-doctor-logo.svg" alt="Verified" fill />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs" style={{ backgroundColor: colors.backgroundAlt, color: colors.textMuted }}>
              <MapPin className="w-3 h-3" />
              {doctor.clinic_location}
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs" style={{ backgroundColor: colors.backgroundAlt, color: colors.textMuted }}>
              <Clock className="w-3 h-3" />
              {doctor.years_experience}+ yrs
            </div>
          </div>

          {/* Availability */}
          <div className="mb-3">
            <AvailabilitySection
              isAvailable={doctor.is_available}
              note={doctor.availability_note}
              telemedicine={doctor.offers_telemedicine}
              colors={colors}
            />
          </div>

          <p className="text-xs leading-relaxed mb-4" style={{ color: colors.textMuted }}>
            {doctor.bio}
          </p>

          {/* Stats */}
          <div className="flex gap-4 mb-4 py-3 border-y" style={{ borderColor: colors.cardBorder }}>
            <div className="flex items-center gap-1.5">
              <ThumbsUp className="w-4 h-4" style={{ color: colors.primary }} />
              <span className="text-sm font-semibold" style={{ color: colors.text }}>{doctor.recommendation_count}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4" style={{ color: colors.primary }} />
              <span className="text-sm font-semibold" style={{ color: colors.text }}>{doctor.connection_count}</span>
            </div>
          </div>

          {/* Education */}
          <div className="mb-4">
            <EducationSection education={doctor.education_timeline} colors={colors} />
          </div>

          {/* Hospitals */}
          <div className="mb-4">
            <HospitalSection hospitals={doctor.hospital_affiliations} colors={colors} />
          </div>

          {/* Conditions */}
          <div className="mb-4">
            <ConditionsSection conditions={doctor.conditions_treated} procedures={doctor.procedures_performed} colors={colors} />
          </div>

          {/* Approach */}
          <div className="mb-4">
            <ApproachSection approach={doctor.approach_to_care} colors={colors} />
          </div>

          {/* Memberships */}
          <div className="mb-4">
            <MembershipsSection memberships={doctor.professional_memberships} colors={colors} />
          </div>

          {/* CTA */}
          <button
            className="w-full py-3 rounded-xl text-sm font-semibold"
            style={{ backgroundColor: colors.primary, color: colors.textOnPrimary }}
          >
            Book Appointment
          </button>
        </div>
      </div>
    </AutoScrollContainer>
  );
}

// Grid Layout with all sections
function GridLayout({ doctor, colors, isActive }: { doctor: Doctor; colors: ThemeColors; isActive: boolean }) {
  return (
    <AutoScrollContainer isActive={isActive}>
      <div className="p-3 pb-8" style={{ backgroundColor: colors.backgroundAlt }}>
        <div className="grid grid-cols-3 gap-2">
          {/* Main Card */}
          <div className="col-span-2 row-span-2 rounded-2xl p-4 flex flex-col items-center justify-center" style={{ backgroundColor: colors.card }}>
            <div className="w-16 h-16 rounded-full overflow-hidden mb-2 shadow-md">
              <Image src={doctor.profile_photo_url} alt={doctor.full_name} width={64} height={64} className="object-cover w-full h-full" />
            </div>
            <div className="flex items-center gap-1 mb-1">
              <h2 className="text-sm font-bold text-center" style={{ color: colors.text }}>{doctor.full_name}</h2>
              <div className="w-3 h-3 relative">
                <Image src="/verified-doctor-logo.svg" alt="Verified" fill />
              </div>
            </div>
            <p className="text-xs" style={{ color: colors.primary }}>{doctor.specialty}</p>
          </div>

          {/* Recs Card */}
          <div className="rounded-2xl p-2 flex flex-col items-center justify-center" style={{ backgroundColor: colors.primary }}>
            <p className="text-xl font-bold" style={{ color: colors.textOnPrimary }}>{doctor.recommendation_count}</p>
            <p className="text-[8px]" style={{ color: `${colors.textOnPrimary}CC` }}>Recs</p>
          </div>

          {/* Conns Card */}
          <div className="rounded-2xl p-2 flex flex-col items-center justify-center" style={{ backgroundColor: colors.card }}>
            <p className="text-xl font-bold" style={{ color: colors.text }}>{doctor.connection_count}</p>
            <p className="text-[8px]" style={{ color: colors.textMuted }}>Conns</p>
          </div>

          {/* Location Card */}
          <div className="col-span-2 rounded-2xl p-3 flex items-center gap-2" style={{ backgroundColor: colors.card }}>
            <MapPin className="w-4 h-4" style={{ color: colors.primary }} />
            <span className="text-xs truncate" style={{ color: colors.text }}>{doctor.clinic_location}</span>
          </div>

          {/* Availability Card */}
          <div className="rounded-2xl p-2 flex flex-col items-center justify-center" style={{ backgroundColor: colors.card }}>
            {doctor.offers_telemedicine ? (
              <>
                <Globe className="w-4 h-4 mb-0.5" style={{ color: colors.primary }} />
                <span className="text-[8px]" style={{ color: colors.textMuted }}>Telehealth</span>
              </>
            ) : (
              <>
                <Calendar className="w-4 h-4 mb-0.5" style={{ color: colors.primary }} />
                <span className="text-[8px]" style={{ color: colors.textMuted }}>In-person</span>
              </>
            )}
          </div>

          {/* Services Card */}
          <div className="col-span-3 rounded-2xl p-3" style={{ backgroundColor: colors.card }}>
            <div className="flex flex-wrap gap-1">
              {doctor.services.slice(0, 3).map((service, i) => (
                <span key={i} className="px-2 py-0.5 rounded-full text-[10px]" style={{ backgroundColor: colors.backgroundAlt, color: colors.text }}>
                  {service}
                </span>
              ))}
              {doctor.services.length > 3 && (
                <span className="px-2 py-0.5 rounded-full text-[10px]" style={{ backgroundColor: colors.primary, color: colors.textOnPrimary }}>
                  +{doctor.services.length - 3}
                </span>
              )}
            </div>
          </div>

          {/* Education Card */}
          <div className="col-span-3 rounded-2xl p-3" style={{ backgroundColor: colors.card }}>
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className="w-4 h-4" style={{ color: colors.primary }} />
              <span className="text-xs font-semibold" style={{ color: colors.text }}>Education</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {doctor.education_timeline.map((edu, i) => (
                <span key={i} className="px-2 py-0.5 rounded-full text-[9px]" style={{ backgroundColor: colors.backgroundAlt, color: colors.text }}>
                  {edu.degree}
                </span>
              ))}
            </div>
          </div>

          {/* Hospitals Card */}
          <div className="col-span-3 rounded-2xl p-3" style={{ backgroundColor: colors.card }}>
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4" style={{ color: colors.primary }} />
              <span className="text-xs font-semibold" style={{ color: colors.text }}>Hospitals</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {doctor.hospital_affiliations.map((h, i) => (
                <span key={i} className="px-2 py-0.5 rounded-full text-[9px]" style={{ backgroundColor: colors.backgroundAlt, color: colors.text }}>
                  {h.name}
                </span>
              ))}
            </div>
          </div>

          {/* Conditions Card */}
          <div className="col-span-3 rounded-2xl p-3" style={{ backgroundColor: colors.card }}>
            <div className="flex items-center gap-2 mb-2">
              <Stethoscope className="w-4 h-4" style={{ color: colors.primary }} />
              <span className="text-xs font-semibold" style={{ color: colors.text }}>Conditions</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {doctor.conditions_treated.split(', ').slice(0, 4).map((c, i) => (
                <span key={i} className="px-2 py-0.5 rounded-full text-[9px]" style={{ backgroundColor: `${colors.primary}15`, color: colors.primary }}>
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* CTA Card */}
          <div className="col-span-3 rounded-2xl p-3 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryHover})` }}>
            <span className="text-sm font-semibold" style={{ color: colors.textOnPrimary }}>Book Appointment</span>
          </div>
        </div>
      </div>
    </AutoScrollContainer>
  );
}

// Minimal Layout with all sections
function MinimalLayout({ doctor, colors, isActive }: { doctor: Doctor; colors: ThemeColors; isActive: boolean }) {
  return (
    <AutoScrollContainer isActive={isActive}>
      <div className="p-6 pb-8 flex flex-col" style={{ backgroundColor: colors.background }}>
        <p className="text-[10px] uppercase tracking-[0.25em] mb-6" style={{ color: colors.textMuted }}>Verified Doctor</p>

        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-2xl font-bold tracking-tight" style={{ color: colors.text }}>{doctor.full_name}</h2>
          <div className="w-5 h-5 relative">
            <Image src="/verified-doctor-logo.svg" alt="Verified" fill />
          </div>
        </div>
        <p className="text-sm font-medium mb-4" style={{ color: colors.primary }}>{doctor.specialty}</p>

        {/* Availability */}
        <div className="mb-4">
          <AvailabilitySection
            isAvailable={doctor.is_available}
            note={doctor.availability_note}
            telemedicine={doctor.offers_telemedicine}
            colors={colors}
          />
        </div>

        <div className="w-20 h-20 rounded-full overflow-hidden mb-6">
          <Image src={doctor.profile_photo_url} alt={doctor.full_name} width={80} height={80} className="object-cover w-full h-full" />
        </div>

        <div className="flex gap-8 mb-6">
          <div>
            <p className="text-3xl font-bold" style={{ color: colors.text }}>{doctor.recommendation_count}</p>
            <p className="text-[10px] uppercase tracking-wider" style={{ color: colors.textMuted }}>Recommendations</p>
          </div>
          <div>
            <p className="text-3xl font-bold" style={{ color: colors.text }}>{doctor.connection_count}</p>
            <p className="text-[10px] uppercase tracking-wider" style={{ color: colors.textMuted }}>Connections</p>
          </div>
        </div>

        {/* Bio */}
        <p className="text-xs leading-relaxed mb-6" style={{ color: colors.textMuted }}>
          {doctor.bio}
        </p>

        {/* Education - Minimal style */}
        <div className="mb-5">
          <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: colors.textMuted }}>Education</p>
          {doctor.education_timeline.map((edu, i) => (
            <p key={i} className="text-xs mb-1" style={{ color: colors.text }}>{edu.degree} — {edu.institution}</p>
          ))}
        </div>

        {/* Hospitals */}
        <div className="mb-5">
          <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: colors.textMuted }}>Affiliations</p>
          {doctor.hospital_affiliations.map((h, i) => (
            <p key={i} className="text-xs mb-1" style={{ color: colors.text }}>{h.name}</p>
          ))}
        </div>

        {/* Conditions */}
        <div className="mb-5">
          <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: colors.textMuted }}>Specializes In</p>
          <p className="text-xs" style={{ color: colors.text }}>{doctor.conditions_treated}</p>
        </div>

        {/* Approach */}
        <div className="mb-6">
          <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: colors.textMuted }}>Philosophy</p>
          <p className="text-xs leading-relaxed" style={{ color: colors.text }}>{doctor.approach_to_care}</p>
        </div>

        {/* CTA */}
        <div className="mt-auto">
          <button
            className="w-full py-3 rounded-lg text-sm font-semibold"
            style={{ backgroundColor: colors.primary, color: colors.textOnPrimary }}
          >
            Book Appointment
          </button>
        </div>
      </div>
    </AutoScrollContainer>
  );
}

export function ProfileShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const startAutoPlay = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SAMPLE_DOCTORS.length);
    }, 6000); // Increased to 6 seconds to allow more scroll time
  }, []);

  useEffect(() => {
    if (isAutoPlaying) {
      startAutoPlay();
    }
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isAutoPlaying, startAutoPlay]);

  const goToNext = () => {
    setActiveIndex((prev) => (prev + 1) % SAMPLE_DOCTORS.length);
    if (isAutoPlaying) startAutoPlay();
  };

  const goToPrev = () => {
    setActiveIndex((prev) => (prev - 1 + SAMPLE_DOCTORS.length) % SAMPLE_DOCTORS.length);
    if (isAutoPlaying) startAutoPlay();
  };

  return (
    <section className="py-16 sm:py-24 overflow-hidden bg-gradient-to-b from-white via-slate-50/50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-sky-50 to-cyan-50 border border-sky-100 mb-6">
            <Sparkles className="w-4 h-4 text-sky-500" />
            <span className="text-sm font-medium text-sky-700">See What You Get</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Beautiful Profiles That{" "}
            <span className="bg-gradient-to-r from-sky-600 to-cyan-500 bg-clip-text text-transparent">
              Stand Out
            </span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Choose from stunning layouts and color themes. Each profile is designed to showcase your expertise and build patient trust.
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="relative">
          {/* Cards Container */}
          <div className="flex items-center justify-center gap-4 sm:gap-8 py-8">
            <AnimatePresence mode="popLayout">
              {SAMPLE_DOCTORS.map((doctor, index) => {
                const offset = index - activeIndex;
                const absOffset = Math.abs(offset);

                // Only show 3 cards at a time
                if (absOffset > 1) return null;

                return (
                  <motion.div
                    key={doctor.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: absOffset === 0 ? 1 : 0.4,
                      scale: absOffset === 0 ? 1 : 0.85,
                      x: offset * 100,
                      zIndex: absOffset === 0 ? 10 : 0,
                    }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className={`${absOffset !== 0 ? 'hidden sm:block' : ''}`}
                  >
                    <ProfileCard doctor={doctor} isActive={absOffset === 0} />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPrev}
              className="rounded-full w-10 h-10 border-slate-300"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            {/* Dots */}
            <div className="flex items-center gap-2">
              {SAMPLE_DOCTORS.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setActiveIndex(index);
                    if (isAutoPlaying) startAutoPlay();
                  }}
                  className={`transition-all duration-300 rounded-full ${
                    index === activeIndex
                      ? 'w-8 h-2 bg-sky-500'
                      : 'w-2 h-2 bg-slate-300 hover:bg-slate-400'
                  }`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={goToNext}
              className="rounded-full w-10 h-10 border-slate-300"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>

            {/* Auto-play toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="rounded-full w-10 h-10 text-slate-400 hover:text-slate-600"
            >
              {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link href="/sign-up">
            <Button className="h-12 px-8 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-semibold text-base shadow-lg shadow-sky-500/25 rounded-xl">
              Create Your Profile
              <Sparkles className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <p className="text-sm text-slate-500 mt-3">
            Free to create • No credit card required
          </p>
        </motion.div>
      </div>
    </section>
  );
}
