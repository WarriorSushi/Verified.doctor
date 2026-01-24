"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Shield, Users, ThumbsUp, MessageSquare } from "lucide-react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

const stats = [
  {
    icon: Shield,
    value: 100,
    suffix: "%",
    label: "Verified Credentials",
    description: "manual review process",
  },
  {
    icon: ThumbsUp,
    value: 0,
    suffix: "",
    label: "Negative Reviews",
    description: "recommendations only",
  },
  {
    icon: MessageSquare,
    value: 100,
    suffix: "%",
    label: "Private Messaging",
    description: "your number stays hidden",
  },
  {
    icon: Users,
    value: 2,
    suffix: " min",
    label: "Profile Setup",
    description: "go live instantly",
  },
];

function AnimatedCounter({ value, suffix, reduceMotion = false }: { value: number; suffix: string; reduceMotion?: boolean }) {
  const [count, setCount] = useState(reduceMotion ? value : 0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  // Intersection Observer to detect when element is in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  // Animate count when visible (skip animation for reduced motion)
  useEffect(() => {
    if (!isVisible || reduceMotion) return;

    const duration = 2000;
    const steps = 60;
    const stepValue = value / steps;
    let current = 0;
    let frame = 0;

    const timer = setInterval(() => {
      frame++;
      current = (value * frame) / steps;

      if (frame >= steps) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(value % 1 !== 0 ? current : Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isVisible, value]);

  const displayValue = value % 1 !== 0 ? count.toFixed(1) : count.toLocaleString('en-US');

  return (
    <span ref={ref} className="tabular-nums">
      {displayValue}{suffix}
    </span>
  );
}

export function TrustSignalsSection() {
  const prefersReducedMotion = useReducedMotion();
  return (
    <section className="py-20 sm:py-24 bg-gradient-to-b from-white to-slate-50 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14 sm:mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-medium mb-4">
            Trusted Platform
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-5">
            Numbers That
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              {" "}Speak for Themselves
            </span>
          </h2>
          <p className="text-slate-600 text-lg sm:text-xl max-w-2xl mx-auto">
            Join a growing community of medical professionals who trust us
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative group"
            >
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 hover:border-emerald-200 hover:shadow-lg transition-all duration-300 text-center">
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="w-6 h-6 text-emerald-600" />
                </div>

                {/* Value */}
                <div className="text-3xl sm:text-4xl font-bold text-slate-900 mb-1">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} reduceMotion={prefersReducedMotion} />
                </div>

                {/* Label */}
                <div className="text-sm sm:text-base font-medium text-slate-700 mb-0.5">
                  {stat.label}
                </div>
                <div className="text-xs sm:text-sm text-slate-500">
                  {stat.description}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
