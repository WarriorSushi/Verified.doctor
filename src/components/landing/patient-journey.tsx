"use client";

import { motion } from "framer-motion";
import { Search, Globe, ShieldCheck, ArrowRight } from "lucide-react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

const steps = [
  {
    icon: Search,
    label: "Patient Searches",
    detail: "Googles your name",
    color: "from-slate-500 to-slate-600",
    bgColor: "bg-slate-50",
    borderColor: "border-slate-200",
    iconColor: "text-slate-600",
  },
  {
    icon: Globe,
    label: "Finds Your Page",
    detail: "verified.doctor/you",
    color: "from-sky-500 to-sky-600",
    bgColor: "bg-sky-50",
    borderColor: "border-sky-200",
    iconColor: "text-sky-600",
  },
  {
    icon: ShieldCheck,
    label: "Trusts You Instantly",
    detail: "Verified credentials",
    color: "from-emerald-500 to-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    iconColor: "text-emerald-600",
  },
];

export function PatientJourney() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="mt-10 sm:mt-14">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-0">
        {steps.map((step, index) => (
          <div key={step.label} className="flex items-center">
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
              whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.15, duration: 0.5, ease: "easeOut" }}
              className={`relative flex items-center gap-3 px-5 py-4 rounded-2xl border ${step.borderColor} ${step.bgColor} min-w-[200px] sm:min-w-[190px]`}
            >
              <div className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-sm`}>
                <step.icon className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 leading-tight">{step.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{step.detail}</p>
              </div>
            </motion.div>

            {/* Connector arrow */}
            {index < steps.length - 1 && (
              <motion.div
                initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.5 }}
                whileInView={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.15 + 0.1, duration: 0.3 }}
                className="hidden sm:flex items-center justify-center w-8"
              >
                <ArrowRight className="w-4 h-4 text-slate-300" />
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
