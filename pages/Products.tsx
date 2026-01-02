import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Star, Sparkles, Heart } from 'lucide-react';
import { useTranslations } from '../i18n/I18nContext';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';
import { SmoothScrollProvider } from '../components/landing/SmoothScrollProvider';
import { Reveal } from '../components/landing/motion/Reveal';
import { Stagger, StaggerItem } from '../components/landing/motion/Stagger';

const Products: React.FC = () => {
  const { t } = useTranslations();

  const plans = [
    {
      name: t('products.free'),
      price: "0",
      features: ["Basic Health Tracking", "Vaccine Tracker", "Weekly Tips", "Public Community"],
      icon: <Heart className="text-gray-400" />,
      cta: "Current Plan",
      featured: false
    },
    {
      name: t('products.premium'),
      price: "1,200",
      features: ["All Essential Features", "AI Health Assistant", "Video Consultations", "Priority Pharmacy Delivery", "Private Community"],
      icon: <Star className="text-[#E6C77A]" />,
      cta: t('products.upgrade'),
      featured: true
    },
    {
      name: t('products.family'),
      price: "2,500",
      features: ["Up to 3 Family Members", "Dedicated Support Manager", "Home Sample Collection", "Emergency Response Team"],
      icon: <Sparkles className="text-purple-400" />,
      cta: t('products.upgrade'),
      featured: false
    }
  ];

  const faqs = [
    { q: "Is Nurture Glow free?", a: "Yes, our Essential plan is free forever with core tracking features." },
    { q: "How do premium consultations work?", a: "Premium users can book unlimited instant video calls with our on-call medical staff." },
    { q: "Can I cancel my subscription?", a: "Yes, you can cancel any paid plan at any time through your settings." },
  ];

  return (
    <SmoothScrollProvider>
      <div className="min-h-screen bg-[#F7F5EF]">
        <Navbar />
        <main className="pt-24">
          {/* Hero */}
          <section className="py-20 px-6 text-center">
            <div className="max-w-4xl mx-auto">
              <Reveal>
                <h1 className="text-5xl md:text-7xl font-serif font-bold text-gray-900 mb-6">{t('products.title')}</h1>
              </Reveal>
              <Reveal delay={0.2}>
                <p className="text-xl text-gray-500">{t('products.subtitle')}</p>
              </Reveal>
            </div>
          </section>

          {/* Plans */}
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-6">
              <Stagger staggerDelay={0.15}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {plans.map((p, i) => (
                    <StaggerItem key={i} y={30}>
                      <div className={`p-10 rounded-[48px] border-2 transition-all flex flex-col h-full ${p.featured ? 'border-[#E6C77A] bg-[#F7F5EF] shadow-xl scale-105' : 'border-gray-50 bg-white shadow-sm'}`}>
                        <div className="flex justify-between items-start mb-8">
                          <div className="p-4 bg-white rounded-2xl shadow-inner">{p.icon}</div>
                          {p.featured && <span className="bg-[#E6C77A] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Popular</span>}
                        </div>
                        <h3 className="text-2xl font-bold mb-2">{p.name}</h3>
                        <div className="flex items-baseline gap-1 mb-8">
                          <span className="text-4xl font-bold">৳{p.price}</span>
                          <span className="text-gray-400 text-sm">/ month</span>
                        </div>
                        <ul className="space-y-4 mb-10 flex-1">
                          {p.features.map((f, j) => (
                            <li key={j} className="flex gap-3 text-sm text-gray-600">
                              <Check size={18} className="text-[#E6C77A] shrink-0" /> {f}
                            </li>
                          ))}
                        </ul>
                        <button className={`w-full py-4 rounded-2xl font-bold transition-all ${p.featured ? 'bg-[#E6C77A] text-white shadow-lg shadow-[#E6C77A]/30 hover:scale-105' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                          {p.cta}
                        </button>
                      </div>
                    </StaggerItem>
                  ))}
                </div>
              </Stagger>
            </div>
          </section>

          {/* FAQs */}
          <section className="py-24 px-6">
            <div className="max-w-4xl mx-auto">
              <Reveal>
                <h2 className="text-4xl font-serif font-bold text-center mb-16">{t('products.faqTitle')}</h2>
              </Reveal>
              <Stagger staggerDelay={0.1}>
                <div className="space-y-6">
                  {faqs.map((faq, i) => (
                    <StaggerItem key={i} y={20}>
                      <div className="p-8 bg-white rounded-[32px] shadow-sm border border-gray-100">
                        <h4 className="font-bold text-lg mb-3">{faq.q}</h4>
                        <p className="text-gray-500">{faq.a}</p>
                      </div>
                    </StaggerItem>
                  ))}
                </div>
              </Stagger>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </SmoothScrollProvider>
  );
};

export default Products;
