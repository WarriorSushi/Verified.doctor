"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import Image from "next/image";

const testimonials = [
  {
    quote: "Finally, a platform that understands what doctors need. My patients can now find and verify me instantly. The QR code in my clinic has been a game changer.",
    name: "Dr. Priya Sharma",
    specialty: "Cardiologist",
    location: "Mumbai, India",
    image: "/testimonials/testimonial-1.webp",
  },
  {
    quote: "I was skeptical at first, but the verified badge gives my patients instant confidence. It's like having a digital seal of approval that speaks for itself.",
    name: "Dr. Michael Chen",
    specialty: "Orthopedic Surgeon",
    location: "New York, USA",
    image: "/testimonials/testimonial-2.webp",
  },
  {
    quote: "The AI-powered profile builder saved me hours. It helped me articulate my approach to patient care in a way I never could have done alone. Bellissimo!",
    name: "Dr. Marco Benedetti",
    specialty: "Dermatologist",
    location: "Milan, Italy",
    image: "/testimonials/testimonial-3.webp",
  },
  {
    quote: "Being connected with other verified doctors has opened doors to referrals I never expected. This platform is more than just a profile page.",
    name: "Dr. Ananya Reddy",
    specialty: "Neurologist",
    location: "Bangalore, India",
    image: "/testimonials/testimonial-4.webp",
  },
  {
    quote: "The no-negative-reviews policy won me over. My recommendations keep growing, and it feels great to have a reputation system that actually works for doctors.",
    name: "Dr. Rajesh Kapoor",
    specialty: "Gastroenterologist",
    location: "Delhi, India",
    image: "/testimonials/testimonial-5.webp",
  },
  {
    quote: "Patient messaging without sharing my personal number was exactly what I needed. Professional boundaries maintained, patient care improved.",
    name: "Dr. James Wilson",
    specialty: "Pulmonologist",
    location: "Los Angeles, USA",
    image: "/testimonials/testimonial-6.webp",
  },
  {
    quote: "From claiming my handle to going live took just 5 minutes. Now parents find me easily and trust the verified badge instantly.",
    name: "Dr. Meera Iyer",
    specialty: "Pediatrician",
    location: "Chennai, India",
    image: "/testimonials/testimonial-7.webp",
  },
];

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 200 : -200,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 200 : -200,
      opacity: 0,
    }),
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prev) => {
      const next = prev + newDirection;
      if (next < 0) return testimonials.length - 1;
      if (next >= testimonials.length) return 0;
      return next;
    });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      paginate(1);
    }, 6000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  const current = testimonials[currentIndex];

  return (
    <section className="py-20 sm:py-28 bg-white overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-600 text-sm font-medium mb-5">
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-[2.75rem] font-bold text-slate-900 mb-5 leading-tight">
            Trusted by medical{" "}
            <span className="text-sky-600">professionals</span>
          </h2>
        </motion.div>

        {/* Testimonial Card */}
        <div className="relative">
          <div className="relative bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden min-h-[280px] sm:min-h-[240px]">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="p-7 sm:p-10"
              >
                <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-gradient-to-br from-sky-100 to-slate-100 border-2 border-white shadow-sm">
                      <Image
                        src={current.image}
                        alt={current.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <Quote className="w-6 h-6 text-sky-200 mb-3" />
                    <p className="text-slate-700 text-base sm:text-lg leading-relaxed mb-5">
                      {current.quote}
                    </p>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{current.name}</p>
                      <p className="text-slate-400 text-sm">
                        {current.specialty} · {current.location}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-5">
            {/* Dots */}
            <div className="flex gap-1.5">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setDirection(index > currentIndex ? 1 : -1);
                    setCurrentIndex(index);
                  }}
                  className={`rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "w-6 h-1.5 bg-sky-500"
                      : "w-1.5 h-1.5 bg-slate-300 hover:bg-slate-400"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            {/* Arrows */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => paginate(-1)}
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>
              <button
                onClick={() => paginate(1)}
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
