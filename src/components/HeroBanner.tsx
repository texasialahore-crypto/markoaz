import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { ArrowRight, Sparkles, ShieldCheck, Banknote, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const slides = [
  {
    id: 1,
    title: 'Experience Pure Acoustic Clarity',
    subtitle: 'AuraSound ANC Wireless Headphones',
    tag: 'FLASHSALE 24% OFF',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
    category: 'Electronics',
    price: '$189.99',
    oldPrice: '$249.99',
    accentColor: 'from-slate-900 to-indigo-950'
  },
  {
    id: 2,
    title: 'Smart Fitness & Health Wearable',
    subtitle: 'UltraSync SmartWatch Pro Series v8',
    tag: 'NEW ARRIVAL',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80',
    category: 'Electronics',
    price: '$279.00',
    oldPrice: '$329.00',
    accentColor: 'from-slate-900 to-emerald-950'
  },
  {
    id: 3,
    title: 'Precision Crafted Everyday Gear',
    subtitle: 'Full-Grain Artisan Leather Backpack',
    tag: 'BESTSELLER',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=80',
    category: 'Fashion & Apparel',
    price: '$119.50',
    oldPrice: '$149.00',
    accentColor: 'from-slate-900 to-amber-950'
  }
];

export const HeroBanner: React.FC = () => {
  const { setActiveView, setSelectedCategory } = useStore();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[currentSlide];

  return (
    <div className="relative rounded-3xl overflow-hidden bg-slate-900/60 backdrop-blur-xl border border-white/10 text-white shadow-2xl mb-12">
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className={`relative min-h-[440px] sm:min-h-[480px] flex items-center bg-gradient-to-r ${slide.accentColor}`}
        >
          {/* Subtle background glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-6 sm:px-12 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
            {/* Left Column Text */}
            <div className="lg:col-span-7 space-y-6 z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> {slide.tag}
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                {slide.title}
              </h1>

              <p className="text-base sm:text-lg text-slate-300 font-medium">
                {slide.subtitle} — Available now with Cash on Delivery nationwide.
              </p>

              <div className="flex items-center gap-4 pt-2">
                <div>
                  <span className="text-2xl sm:text-3xl font-extrabold text-white">{slide.price}</span>
                  <span className="text-sm text-slate-400 line-through ml-2">{slide.oldPrice}</span>
                </div>

                <button
                  onClick={() => {
                    setSelectedCategory(slide.category);
                    setActiveView('products');
                  }}
                  className="px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition-all transform active:scale-95"
                >
                  Shop Deal <ArrowRight className="w-4 h-4 text-slate-950" />
                </button>
              </div>

              {/* Badges */}
              <div className="pt-4 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-300 border-t border-white/10">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <Banknote className="w-4 h-4 text-cyan-400" /> Cash on Delivery
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <ShieldCheck className="w-4 h-4 text-blue-400" /> 1-Year Warranty
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <Sparkles className="w-4 h-4 text-amber-400" /> 100% Authentic
                </span>
              </div>
            </div>

            {/* Right Column Image */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-2xl overflow-hidden shadow-2xl border border-white/20 group backdrop-blur-md">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Slider Controls */}
      <div className="absolute bottom-4 right-6 flex items-center gap-2 z-20">
        <button
          onClick={() => setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length)}
          className="p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white backdrop-blur-xs border border-white/10 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-xs font-bold text-slate-300 px-2">
          0{currentSlide + 1} / 0{slides.length}
        </span>
        <button
          onClick={() => setCurrentSlide(prev => (prev + 1) % slides.length)}
          className="p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white backdrop-blur-xs border border-white/10 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
