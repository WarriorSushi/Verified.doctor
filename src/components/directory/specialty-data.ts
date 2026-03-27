/**
 * Specialty descriptions and metadata for SEO pages.
 */

export const SPECIALTY_META: Record<
  string,
  { description: string; icon: string; conditions: string[] }
> = {
  cardiology: {
    description:
      "Cardiologists specialize in diagnosing and treating diseases of the heart and cardiovascular system. They manage conditions like coronary artery disease, heart failure, arrhythmias, and hypertension.",
    icon: "❤️",
    conditions: [
      "Heart Disease",
      "Hypertension",
      "Arrhythmia",
      "Heart Failure",
      "Coronary Artery Disease",
    ],
  },
  dermatology: {
    description:
      "Dermatologists diagnose and treat conditions related to the skin, hair, and nails. They address issues ranging from acne and eczema to skin cancer and cosmetic concerns.",
    icon: "🧴",
    conditions: ["Acne", "Eczema", "Psoriasis", "Skin Cancer", "Dermatitis"],
  },
  endocrinology: {
    description:
      "Endocrinologists specialize in the endocrine system, treating hormonal imbalances and metabolic disorders including diabetes, thyroid conditions, and adrenal disorders.",
    icon: "🔬",
    conditions: [
      "Diabetes",
      "Thyroid Disorders",
      "PCOS",
      "Adrenal Disorders",
      "Osteoporosis",
    ],
  },
  "family medicine": {
    description:
      "Family medicine physicians provide comprehensive healthcare for individuals and families across all ages, genders, and conditions, emphasizing preventive care and long-term relationships.",
    icon: "👨‍👩‍👧‍👦",
    conditions: [
      "Preventive Care",
      "Chronic Disease Management",
      "Acute Illness",
      "Wellness Exams",
      "Vaccinations",
    ],
  },
  gastroenterology: {
    description:
      "Gastroenterologists diagnose and treat conditions of the digestive system including the esophagus, stomach, intestines, liver, pancreas, and gallbladder.",
    icon: "🫁",
    conditions: ["IBS", "GERD", "Crohn's Disease", "Ulcerative Colitis", "Liver Disease"],
  },
  "general practice": {
    description:
      "General practitioners provide primary healthcare services, treating a wide range of common conditions and referring patients to specialists when needed.",
    icon: "🏥",
    conditions: [
      "General Health",
      "Preventive Care",
      "Common Illnesses",
      "Health Screenings",
      "Chronic Conditions",
    ],
  },
  "general surgery": {
    description:
      "General surgeons perform surgical procedures on the abdomen, digestive tract, endocrine system, breast, and more. They handle both elective and emergency surgeries.",
    icon: "🔪",
    conditions: [
      "Appendicitis",
      "Hernia",
      "Gallbladder Disease",
      "Breast Surgery",
      "Trauma",
    ],
  },
  gynecology: {
    description:
      "Gynecologists specialize in the female reproductive system, addressing concerns from menstrual disorders and infertility to preventive screenings and surgical care.",
    icon: "👩‍⚕️",
    conditions: [
      "Menstrual Disorders",
      "Infertility",
      "Endometriosis",
      "Ovarian Cysts",
      "Cervical Screening",
    ],
  },
  "internal medicine": {
    description:
      "Internists specialize in the prevention, diagnosis, and treatment of adult diseases. They serve as primary care physicians and manage complex, multi-system conditions.",
    icon: "🩺",
    conditions: [
      "Hypertension",
      "Diabetes",
      "Respiratory Infections",
      "Anemia",
      "Cholesterol Management",
    ],
  },
  nephrology: {
    description:
      "Nephrologists specialize in kidney care, treating conditions from chronic kidney disease and kidney stones to electrolyte imbalances and hypertension related to kidney function.",
    icon: "🫘",
    conditions: [
      "Chronic Kidney Disease",
      "Kidney Stones",
      "Dialysis",
      "Glomerulonephritis",
      "Renal Failure",
    ],
  },
  neurology: {
    description:
      "Neurologists diagnose and treat disorders of the nervous system, including the brain, spinal cord, and peripheral nerves. They address conditions like epilepsy, stroke, and multiple sclerosis.",
    icon: "🧠",
    conditions: [
      "Epilepsy",
      "Stroke",
      "Migraine",
      "Multiple Sclerosis",
      "Parkinson's Disease",
    ],
  },
  obstetrics: {
    description:
      "Obstetricians specialize in pregnancy, childbirth, and postpartum care. They manage both routine and high-risk pregnancies to ensure the health of mother and baby.",
    icon: "🤱",
    conditions: [
      "Pregnancy Care",
      "High-Risk Pregnancy",
      "Prenatal Care",
      "Labor & Delivery",
      "Postpartum Care",
    ],
  },
  oncology: {
    description:
      "Oncologists specialize in the diagnosis and treatment of cancer. They develop treatment plans involving chemotherapy, immunotherapy, targeted therapy, and coordinate multidisciplinary care.",
    icon: "🎗️",
    conditions: [
      "Breast Cancer",
      "Lung Cancer",
      "Colorectal Cancer",
      "Lymphoma",
      "Leukemia",
    ],
  },
  ophthalmology: {
    description:
      "Ophthalmologists are medical doctors who specialize in eye and vision care. They perform eye exams, diagnose and treat eye diseases, and perform surgical procedures.",
    icon: "👁️",
    conditions: [
      "Cataracts",
      "Glaucoma",
      "Macular Degeneration",
      "Diabetic Retinopathy",
      "Refractive Errors",
    ],
  },
  orthopedics: {
    description:
      "Orthopedic specialists diagnose and treat conditions of the musculoskeletal system, including bones, joints, ligaments, tendons, and muscles.",
    icon: "🦴",
    conditions: [
      "Fractures",
      "Arthritis",
      "Joint Replacement",
      "Sports Injuries",
      "Spinal Disorders",
    ],
  },
  pediatrics: {
    description:
      "Pediatricians specialize in the health and medical care of infants, children, and adolescents from birth through age 18. They focus on physical, behavioral, and mental health issues.",
    icon: "👶",
    conditions: [
      "Childhood Infections",
      "Growth Disorders",
      "Vaccinations",
      "Developmental Delays",
      "Allergies",
    ],
  },
  "plastic surgery": {
    description:
      "Plastic surgeons perform both reconstructive and cosmetic procedures to repair or reshape body structures. They address congenital defects, trauma injuries, and aesthetic concerns.",
    icon: "✨",
    conditions: [
      "Reconstructive Surgery",
      "Cosmetic Surgery",
      "Burn Treatment",
      "Hand Surgery",
      "Breast Reconstruction",
    ],
  },
  psychiatry: {
    description:
      "Psychiatrists are medical doctors who specialize in mental health, diagnosing and treating mental, emotional, and behavioral disorders through therapy and medication management.",
    icon: "🧩",
    conditions: [
      "Depression",
      "Anxiety",
      "Bipolar Disorder",
      "PTSD",
      "Schizophrenia",
    ],
  },
  pulmonology: {
    description:
      "Pulmonologists specialize in the respiratory system, diagnosing and treating diseases of the lungs and airways including asthma, COPD, pneumonia, and sleep disorders.",
    icon: "💨",
    conditions: ["Asthma", "COPD", "Pneumonia", "Sleep Apnea", "Pulmonary Fibrosis"],
  },
  radiology: {
    description:
      "Radiologists use medical imaging techniques like X-rays, CT scans, MRI, and ultrasound to diagnose and sometimes treat diseases. They play a critical role in modern healthcare.",
    icon: "📷",
    conditions: [
      "Diagnostic Imaging",
      "Cancer Screening",
      "Interventional Procedures",
      "MRI Interpretation",
      "CT Scan Analysis",
    ],
  },
  rheumatology: {
    description:
      "Rheumatologists specialize in autoimmune and inflammatory conditions that affect joints, muscles, and bones, including rheumatoid arthritis, lupus, and gout.",
    icon: "🦵",
    conditions: [
      "Rheumatoid Arthritis",
      "Lupus",
      "Gout",
      "Osteoarthritis",
      "Fibromyalgia",
    ],
  },
  urology: {
    description:
      "Urologists specialize in the urinary tract system and male reproductive organs. They diagnose and treat conditions like kidney stones, urinary incontinence, and prostate issues.",
    icon: "🔧",
    conditions: [
      "Kidney Stones",
      "Prostate Issues",
      "Urinary Incontinence",
      "UTIs",
      "Male Infertility",
    ],
  },
};

/**
 * Convert a slug to a display-ready specialty name
 */
export function slugToSpecialty(slug: string): string {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Convert a specialty name to a URL slug
 */
export function specialtyToSlug(specialty: string): string {
  return specialty.toLowerCase().replace(/\s+/g, "-");
}

/**
 * Convert a city slug to display name
 */
export function slugToCity(slug: string): string {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Convert a city name to URL slug
 */
export function cityToSlug(city: string): string {
  return city
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

/**
 * Get metadata for a specialty (with fallback)
 */
export function getSpecialtyMeta(specialtySlug: string) {
  const key = specialtySlug.replace(/-/g, " ").toLowerCase();
  return (
    SPECIALTY_META[key] || {
      description: `Find verified ${slugToSpecialty(specialtySlug)} doctors with real credentials, patient recommendations, and transparent profiles.`,
      icon: "🩺",
      conditions: [],
    }
  );
}
