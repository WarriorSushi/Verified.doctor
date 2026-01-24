"use client";

import { motion } from "framer-motion";
import { Search, Globe, FileText, Camera, ShieldCheck } from "lucide-react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

const steps = [
  {
    icon: Search,
    label: "Patient Searches",
    detail: "Googles your name",
    color: "from-slate-500 to-slate-600",
    bgColor: "bg-slate-50",
    borderColor: "border-slate-200",
  },
  {
    icon: Globe,
    label: "Finds Your Page",
    detail: "verified.doctor/you",
    color: "from-sky-500 to-sky-600",
    bgColor: "bg-sky-50",
    borderColor: "border-sky-200",
  },
  {
    icon: FileText,
    label: "Sees Everything",
    detail: "Credentials, services, location",
    color: "from-violet-500 to-violet-600",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-200",
  },
  {
    icon: Camera,
    label: "Gets the Full Picture",
    detail: "Photos, videos, personal touch",
    color: "from-amber-500 to-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
  {
    icon: ShieldCheck,
    label: "Trusts You Instantly",
    detail: "Verified, recommended, credible",
    color: "from-emerald-500 to-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
  },
];

export function PatientJourney() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="mt-10 sm:mt-14">
      {/* Desktop: horizontal flow with arrows */}
      <div className="hidden lg:flex items-center justify-center gap-2">
        {steps.map((step, index) => (
          <div key={step.label} className="flex items-center">
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
              whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.12, duration: 0.5, ease: "easeOut" }}
              className={`relative flex flex-col items-center text-center px-4 py-4 rounded-2xl border ${step.borderColor} ${step.bgColor} w-[155px]`}
            >
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${step.color} flex items-center justify-center shadow-sm mb-2`}>
                <step.icon className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <p className="text-xs font-semibold text-slate-800 leading-tight">{step.label}</p>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">{step.detail}</p>
            </motion.div>

            {/* Connector */}
            {index < steps.length - 1 && (
              <motion.div
                initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.5 }}
                whileInView={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.12 + 0.08, duration: 0.3 }}
                className="flex items-center justify-center w-5"
              >
                <div className="w-4 h-[2px] bg-slate-200 rounded-full" />
              </motion.div>
            )}
          </div>
        ))}
      </div>

      {/* Tablet: 3+2 grid */}
      <div className="hidden sm:flex lg:hidden flex-wrap items-center justify-center gap-3">
        {steps.map((step, index) => (
          <motion.div
            key={step.label}
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${step.borderColor} ${step.bgColor} min-w-[180px]`}
          >
            <div className={`flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br ${step.color} flex items-center justify-center shadow-sm`}>
              <step.icon className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800 leading-tight">{step.label}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{step.detail}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Mobile: vertical stack */}
      <div className="flex sm:hidden flex-col items-center gap-2">
        {steps.map((step, index) => (
          <div key={step.label} className="flex flex-col items-center">
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 15 }}
              whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ delay: index * 0.08, duration: 0.4, ease: "easeOut" }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${step.borderColor} ${step.bgColor} w-[260px]`}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br ${step.color} flex items-center justify-center shadow-sm`}>
                <step.icon className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800 leading-tight">{step.label}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{step.detail}</p>
              </div>
            </motion.div>

            {/* Vertical connector */}
            {index < steps.length - 1 && (
              <div className="w-[2px] h-2 bg-slate-200 rounded-full" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
