"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";

export const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Farm to Table Marketplace",
      description:
        "Connect directly with local farmers and buy fresh poultry products at fair prices.",
      primaryButton: { text: "Shop Now", link: "/marketplace" },
      secondaryButton: { text: "Sell Your Products", link: "/become-seller" },
    },
    {
      title: "Fresh Organic Chicken",
      description:
        "Discover our selection of free-range, organic chicken from trusted local farms.",
      primaryButton: {
        text: "Shop Chicken",
        link: "/marketplace?category=chicken",
      },
      secondaryButton: { text: "Learn More", link: "/about-organic" },
    },
    {
      title: "Join Our Farmer Network",
      description:
        "Are you a poultry farmer? Sell directly to consumers and grow your business.",
      primaryButton: { text: "Become a Seller", link: "/become-seller" },
      secondaryButton: { text: "See Success Stories", link: "/seller-success" },
    },
  ];

  // Simple manual navigation
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  // Auto-advance slides
  useEffect(() => {
    const timer = setTimeout(() => {
      nextSlide();
    }, 5000);

    return () => clearTimeout(timer);
  }, [currentSlide, nextSlide]);

  return (
    <section className="relative mx-auto mt-4 max-w-6xl px-4">
      <div className="container">
        <div
          className="relative overflow-hidden rounded-lg bg-gradient-to-r from-gray-900 to-gray-800"
          style={{ height: "384px" }}
        >
          {/* Background image */}
          <Image
            src="/placeholder.svg?height=500&width=1200"
            alt="Background"
            className="absolute inset-0 h-full w-full object-cover opacity-50 mix-blend-overlay"
            fill
          />

          {/* Content */}
          <div className="absolute inset-0 flex items-center">
            <div className="relative max-w-md px-6 md:px-12 lg:px-16">
              <h1 className="mb-4 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
                {slides[currentSlide].title}
              </h1>
              <p className="mb-6 text-lg text-white/90">
                {slides[currentSlide].description}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href={slides[currentSlide].primaryButton.link}>
                  <Button size="lg">
                    {slides[currentSlide].primaryButton.text}
                  </Button>
                </Link>
                <Link href={slides[currentSlide].secondaryButton.link}>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                  >
                    {slides[currentSlide].secondaryButton.text}
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            className="absolute left-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-6 w-6" />
            <span className="sr-only">Previous slide</span>
          </button>

          <button
            className="absolute right-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50"
            onClick={nextSlide}
          >
            <ChevronRight className="h-6 w-6" />
            <span className="sr-only">Next slide</span>
          </button>

          {/* Slide Indicators */}
          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`h-2 rounded-full transition-all ${
                  currentSlide === index ? "w-8 bg-white" : "w-2 bg-white/50"
                }`}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
