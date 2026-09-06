import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Zap, ShieldCheck, Clock, CreditCard, Sparkles } from 'lucide-react';
import { INITIAL_BANNERS } from '../data/initialData';
import { useStore } from '../context/StoreContext';

export const MovingBanners: React.FC = () => {
  const { storeConfig, setSelectedCategory } = useStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % INITIAL_BANNERS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % INITIAL_BANNERS.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + INITIAL_BANNERS.length) % INITIAL_BANNERS.length);
  };

  const currentBanner = INITIAL_BANNERS[currentSlide];

  return (
    <div id="moving-banners-section" className="w-full space-y-4">
      {/* 1. Moving Marquee Ticker */}
      <div 
        id="ticker-marquee"
        className="w-full bg-gradient-to-r from-orange-500 via-emerald-600 to-indigo-600 text-white text-xs sm:text-sm font-semibold py-2 overflow-hidden shadow-inner flex items-center"
      >
        <div className="animate-marquee whitespace-nowrap flex items-center gap-8">
          <span className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300" />
            {storeConfig.announcementTicker}
          </span>
          <span className="text-white/60 font-black">•</span>
          <span className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-200" />
            Pay via UPI QR or Cards directly at Store Pickup Counter #2
          </span>
          <span className="text-white/60 font-black">•</span>
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-200" />
            Store Timings: {storeConfig.timings}
          </span>
          <span className="text-white/60 font-black">•</span>
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-200" />
            100% Freshness Guarantee • Inspect before payment
          </span>
        </div>
      </div>

      {/* 2. Interactive Moving Banner Carousel */}
      <div 
        id="promo-banner-carousel"
        className="relative mx-auto max-w-7xl px-4 sm:px-8"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="relative overflow-hidden rounded-3xl shadow-md border border-slate-200/80 bg-slate-900 min-h-[220px] sm:min-h-[260px] md:min-h-[280px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentBanner.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className={`absolute inset-0 bg-gradient-to-br ${currentBanner.bgGradient} flex flex-col md:flex-row items-center justify-between p-6 sm:p-8 md:p-10 text-white overflow-hidden`}
            >
              {/* Background decorative circles from Vibrant Palette design */}
              <div className="absolute top-4 right-1/3 opacity-20 pointer-events-none hidden md:block">
                <div className="w-40 h-40 bg-white rounded-full"></div>
              </div>
              <div className="absolute -bottom-10 -right-10 opacity-20 pointer-events-none">
                <div className="w-48 h-48 bg-white rounded-full"></div>
              </div>

              {/* Left Content */}
              <div className="z-10 max-w-xl space-y-3 sm:space-y-4 text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider border border-white/20 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  {currentBanner.badge}
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight drop-shadow-xs">
                  {currentBanner.title}
                </h2>
                <p className="text-white/95 text-sm sm:text-base leading-relaxed max-w-lg font-medium">
                  {currentBanner.subtitle}
                </p>
                <div className="pt-1 sm:pt-2 flex items-center gap-3">
                  <button
                    id={`banner-cta-${currentBanner.id}`}
                    onClick={() => {
                      if (currentBanner.categoryLink) {
                        setSelectedCategory(currentBanner.categoryLink);
                        const el = document.getElementById('products-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="cursor-pointer px-5 py-2.5 sm:px-6 sm:py-3 bg-white text-slate-900 font-black text-xs sm:text-sm rounded-xl shadow-md hover:bg-slate-100 active:scale-95 transition-all duration-150 flex items-center gap-2 group"
                  >
                    <span>{currentBanner.cta}</span>
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                  <div className="hidden sm:flex items-center gap-1.5 text-xs text-white/90 font-semibold bg-black/15 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                    <Clock className="w-3.5 h-3.5 text-yellow-300" />
                    <span>Avg pickup ready: 8-12 mins</span>
                  </div>
                </div>
              </div>

              {/* Right Image */}
              <div className="hidden md:block relative w-72 h-56 lg:w-88 lg:h-60 rounded-3xl overflow-hidden shadow-2xl border-2 border-white/30 transform rotate-1 hover:rotate-0 transition-transform duration-300">
                <img
                  src={currentBanner.image}
                  alt={currentBanner.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 bg-slate-900/60 backdrop-blur-md rounded-xl p-2.5 text-xs text-white flex items-center justify-between border border-white/15">
                  <span className="font-bold">Indiranagar Counter #04</span>
                  <span className="text-emerald-300 font-extrabold uppercase text-[10px] bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-400/30">UPI / Card POS</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Prev / Next controls */}
          <button
            id="banner-prev-btn"
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="cursor-pointer absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-900/40 hover:bg-slate-900/70 backdrop-blur-md text-white flex items-center justify-center transition-all z-20 border border-white/20"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            id="banner-next-btn"
            onClick={nextSlide}
            aria-label="Next Slide"
            className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-900/40 hover:bg-slate-900/70 backdrop-blur-md text-white flex items-center justify-center transition-all z-20 border border-white/20"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 bg-slate-900/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            {INITIAL_BANNERS.map((banner, idx) => (
              <button
                key={banner.id}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  currentSlide === idx ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
