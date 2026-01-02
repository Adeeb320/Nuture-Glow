import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowRight } from 'lucide-react';

const Hero: React.FC = () => {
  const { user } = useAuth();
  const [imgError, setImgError] = useState(false);

  // High-res professional maternal image matching the requested "soft, warm, caring" vibe
  const primaryHeroImg = "https://images.unsplash.com/photo-1544126592-807daa2b567b?q=80&w=2574&auto=format&fit=crop";
  const fallbackImg = "https://images.unsplash.com/photo-1531983412531-1f49a365ffed?q=80&w=2574&auto=format&fit=crop";

  return (
    <section id="home" className="relative h-screen w-full overflow-hidden flex items-center">
      {/* Background Layer: Slow Cinematic Zoom */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img 
          src={imgError ? fallbackImg : primaryHeroImg} 
          alt="Nurture Glow - Premium Mother & Baby Care" 
          className="w-full h-full object-cover object-center animate-hero-bg"
          onError={() => setImgError(true)}
        />
        
        {/* Refined Premium Overlay: Soft Mint to Cream Gradient (25-40% Opacity) */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#BFE6DA]/40 via-[#F7F5EF]/30 to-transparent z-10" />
        
        {/* Secondary subtle directional gradients to anchor text legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-white/10 via-transparent to-transparent z-10" />
        
        {/* Dynamic Bokeh Layer */}
        <div className="absolute inset-0 hero-bokeh opacity-40 z-10" />
      </div>

      {/* Content Layer with Staggered Rise Effect */}
      <div className="relative z-20 max-w-[1500px] mx-auto px-10 w-full pt-16">
        <div className="max-w-4xl space-y-10">
          
          {/* Badge Pill - Entry 1 */}
          <div className="animate-hero-content" style={{ animationDelay: '0.2s' }}>
            <div className="inline-flex items-center gap-3 px-6 py-1.5 bg-white/60 backdrop-blur-lg rounded-full border border-white/60 shadow-sm">
              <span className="text-[11px] font-bold text-teal-800/80 uppercase tracking-[0.35em]">
                Premium Mother & Baby Sanctuary
              </span>
            </div>
          </div>

          {/* Main Headline - Entry 2 & 3 */}
          <div className="space-y-0">
            <h1 
              className="text-[100px] md:text-[160px] font-serif font-bold text-[#1F1F1F] leading-[0.85] tracking-tighter animate-hero-content"
              style={{ animationDelay: '0.4s' }}
            >
              Nurturing
            </h1>
            <h2 
              className="text-[85px] md:text-[145px] font-serif text-[#E6C77A] italic font-medium leading-[0.9] tracking-tighter animate-hero-content opacity-90"
              style={{ animationDelay: '0.6s' }}
            >
              Every Step
            </h2>
          </div>

          {/* Subtitle - Entry 4 */}
          <p 
            className="text-xl md:text-2xl text-gray-800 leading-relaxed max-w-xl font-light animate-hero-content"
            style={{ animationDelay: '0.8s' }}
          >
            A sanctuary of expert care for your parenting journey. We combine clinical precision with intuitive design to support your glow.
          </p>

          {/* Primary Action - Entry 5 */}
          <div 
            className="flex flex-col sm:flex-row items-center gap-6 pt-4 animate-hero-content"
            style={{ animationDelay: '1.0s' }}
          >
            <Link 
              to={user ? "/dashboard" : "/signup"} 
              className="w-full sm:w-auto px-12 py-5 bg-[#E6C77A] text-white rounded-xl font-bold shadow-2xl shadow-[#E6C77A]/40 hover:scale-105 active:scale-95 transition-all text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3"
            >
              Get Started
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 opacity-30 animate-pulse">
        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.5em]">Discover More</span>
        <div className="w-px h-10 bg-gradient-to-b from-gray-400 to-transparent" />
      </div>
    </section>
  );
};

export default Hero;