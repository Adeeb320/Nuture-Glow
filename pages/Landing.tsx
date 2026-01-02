import React, { useEffect } from 'react';
import { 
  CheckCircle2, Mail, Send,
  Syringe, Calendar, Baby, Apple, Users, ShoppingBag, 
  BrainCircuit, Heart, Sparkles, Star, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import Footer from '../components/landing/Footer';
import { useTranslations } from '../i18n/I18nContext';

const Landing: React.FC = () => {
  const { t } = useTranslations();

  // Robust Scroll Reveal Observer
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.15
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          // Once revealed, we don't need to observe it anymore
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const reveals = document.querySelectorAll('.reveal');
    reveals.forEach(el => observer.observe(el));
    
    return () => observer.disconnect();
  }, []);

  const featureCards = [
    { icon: <Calendar />, title: "Expert Appointments", desc: "Book gynaecologists and pediatricians instantly.", color: "bg-orange-50 text-orange-600" },
    { icon: <Syringe />, title: "Vaccine Butler", desc: "Smart schedules and automated reminders for baby.", color: "bg-blue-50 text-blue-600" },
    { icon: <Apple />, title: "Clinical Nutrition", desc: "Personalized diet plans for every trimester.", color: "bg-green-50 text-green-600" },
    { icon: <Baby />, title: "Journey Tracker", desc: "Week-by-week pregnancy and development logs.", color: "bg-pink-50 text-pink-600" },
    { icon: <BrainCircuit />, title: "Care Assistant", desc: "Ask our medical AI anything about your pregnancy.", color: "bg-teal-50 text-teal-800" },
    { icon: <ShoppingBag />, title: "Quick Pharmacy", desc: "Prenatal essentials delivered to your door.", color: "bg-teal-50 text-teal-600" },
  ];

  return (
    <div className="min-h-screen bg-[#F7F5EF] selection:bg-[#BFE6DA] selection:text-teal-900 overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />

        {/* Section: About */}
        <section id="about" className="py-40 bg-white">
          <div className="max-w-[1500px] mx-auto px-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              <div className="reveal">
                <span className="text-[#E6C77A] font-bold text-xs uppercase tracking-[0.5em] mb-6 block">Our Mission</span>
                <h2 className="text-6xl md:text-8xl font-serif font-bold text-gray-900 leading-[1] tracking-tighter">
                  Bridging Tech with Maternal <span className="italic font-medium text-[#E6C77A]">Empathy.</span>
                </h2>
                <p className="text-xl text-gray-500 leading-relaxed font-light mt-10 mb-12 max-w-xl">
                  Nurture Glow ensures every mother has access to elite digital health tools. We combine clinical accuracy with a sanctuary-like digital experience.
                </p>
                <div className="grid grid-cols-2 gap-12 pt-6">
                  <div className="space-y-2">
                    <p className="text-5xl font-serif font-bold text-teal-600">95%</p>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Medical Accuracy</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-5xl font-serif font-bold text-[#E6C77A]">24/7</p>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">AI Care Support</p>
                  </div>
                </div>
              </div>
              <div className="reveal relative" style={{ transitionDelay: '0.3s' }}>
                <div className="aspect-[4/5] rounded-[100px] overflow-hidden shadow-2xl border-[15px] border-[#F7F5EF]">
                  <img src="https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover" alt="Nurturing" />
                </div>
                <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-[#BFE6DA] rounded-full z-10 flex items-center justify-center shadow-2xl border-8 border-white">
                   <Heart className="text-teal-700" size={56} fill="currentColor" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Features */}
        <section id="features" className="py-40 bg-[#F7F5EF]">
          <div className="max-w-[1500px] mx-auto px-10">
            <div className="reveal text-center max-w-4xl mx-auto mb-24">
              <span className="text-[#E6C77A] font-bold text-xs uppercase tracking-[0.4em] mb-6 block">Capabilities</span>
              <h2 className="text-6xl md:text-7xl font-serif font-bold text-gray-900 mb-8 tracking-tighter">Everything You Need.</h2>
              <p className="text-gray-400 text-2xl font-light italic">Integrated tools that handle the logistics, so you can focus on the glow.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {featureCards.map((f, i) => (
                <div 
                  key={i} 
                  className="reveal p-12 bg-white rounded-[60px] hover:shadow-2xl hover:-translate-y-2 transition-all group border border-gray-100"
                  style={{ transitionDelay: `${i * 0.1}s` }}
                >
                  <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center mb-10 shadow-sm transition-transform group-hover:scale-110 ${f.color}`}>
                    {React.cloneElement(f.icon as React.ReactElement<any>, { size: 32 })}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-5">{f.title}</h3>
                  <p className="text-gray-500 text-lg leading-relaxed font-light">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section: Pricing */}
        <section id="products" className="py-40 bg-white">
          <div className="max-w-[1500px] mx-auto px-10">
            <div className="reveal flex flex-col lg:flex-row justify-between items-end mb-24 gap-12">
              <div className="max-w-3xl">
                <span className="text-[#E6C77A] font-bold text-xs uppercase tracking-[0.5em] mb-6 block">Membership</span>
                <h2 className="text-6xl md:text-7xl font-serif font-bold text-gray-900 leading-tight tracking-tighter">Elevated Plans.</h2>
              </div>
              <Link to="/signup" className="px-12 py-5 bg-[#F7F5EF] text-teal-800 rounded-xl font-bold text-[11px] uppercase tracking-[0.3em] hover:bg-teal-50 transition-all">Compare All Plans</Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { name: "Essential", price: "0", icon: <Heart size={36}/>, features: ["Basic Health Logs", "Public Community", "Vaccine Alerts"] },
                { name: "Glowing", price: "1,200", icon: <Star size={36}/>, featured: true, features: ["AI Health Ally", "Video Consults", "Priority Pharmacy"] },
                { name: "Legacy", price: "2,500", icon: <Sparkles size={36}/>, features: ["Family Hub", "Emergency Care", "Home Sample Pickup"] },
              ].map((plan, i) => (
                <div 
                  key={i} 
                  className={`reveal p-16 rounded-[80px] border-2 transition-all flex flex-col h-full group ${plan.featured ? 'border-[#E6C77A] bg-[#F7F5EF]/30 shadow-2xl scale-105 relative z-10' : 'border-gray-100 bg-white'}`}
                  style={{ transitionDelay: `${i * 0.15}s` }}
                >
                  <div className="mb-10 p-6 bg-white rounded-[30px] w-fit text-[#E6C77A] shadow-sm group-hover:scale-110 transition-transform">{plan.icon}</div>
                  <h3 className="text-3xl font-bold mb-3 text-gray-800">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-12">
                    <span className="text-5xl font-bold text-gray-900">৳{plan.price}</span>
                    <span className="text-gray-400 text-sm font-medium">/mo</span>
                  </div>
                  <ul className="space-y-6 mb-16 flex-1">
                    {plan.features.map((f, j) => (
                      <li key={j} className="text-base text-gray-500 flex items-center gap-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#E6C77A]" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Link 
                    to="/signup" 
                    className={`w-full py-6 rounded-2xl font-bold text-[11px] uppercase tracking-[0.2em] text-center transition-all ${plan.featured ? 'bg-[#E6C77A] text-white shadow-xl shadow-[#E6C77A]/30 hover:scale-[1.02]' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                  >
                    Select Plan
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section: Contact */}
        <section id="contact" className="py-40 bg-[#1F1F1F]">
          <div className="max-w-[1500px] mx-auto px-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                <div className="reveal text-white space-y-12">
                  <div>
                    <h2 className="text-7xl md:text-9xl font-serif font-bold leading-[0.85] tracking-tighter">Start Your <br /><span className="text-[#E6C77A] italic">Journey.</span></h2>
                    <p className="text-white/40 text-2xl font-light mt-12 leading-relaxed max-w-lg">Our care coordinators are standing by to guide you through our premium health ecosystem.</p>
                  </div>
                  <div className="flex gap-10 items-center group">
                    <div className="w-20 h-20 bg-white/5 rounded-[30px] flex items-center justify-center text-[#E6C77A] group-hover:bg-[#E6C77A] group-hover:text-black transition-all duration-700"><Mail size={32} /></div>
                    <div>
                      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.3em] mb-2">Direct Concierge</p>
                      <p className="font-bold text-3xl tracking-tight">hello@nurtureglow.com</p>
                    </div>
                  </div>
                </div>

                <div className="reveal bg-white p-16 md:p-20 rounded-[100px] shadow-2xl relative" style={{ transitionDelay: '0.3s' }}>
                    <form className="space-y-10" onSubmit={(e) => { e.preventDefault(); alert('Thank you for contacting us!'); }}>
                      <div className="space-y-3">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.3em] ml-6">Full Name</label>
                        <input required className="w-full p-7 bg-[#F7F5EF] rounded-[30px] outline-none border-2 border-transparent focus:border-[#BFE6DA] transition-all font-medium text-xl text-gray-800" placeholder="Sarah Jenkins" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.3em] ml-6">Email Address</label>
                        <input type="email" required className="w-full p-7 bg-[#F7F5EF] rounded-[30px] outline-none border-2 border-transparent focus:border-[#BFE6DA] transition-all font-medium text-xl text-gray-800" placeholder="sarah@example.com" />
                      </div>
                      <button type="submit" className="w-full py-8 bg-[#E6C77A] text-white font-bold rounded-[30px] shadow-2xl shadow-[#E6C77A]/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 uppercase tracking-[0.3em] text-xs">
                        Connect with Us <Send size={24} />
                      </button>
                    </form>
                </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Landing;