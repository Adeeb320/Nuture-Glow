
import React from 'react';
import { Syringe, Calendar, Baby, Apple, Users, ShoppingBag } from 'lucide-react';

const Features: React.FC = () => {
  const features = [
    {
      icon: <Syringe size={24} />,
      title: 'Vaccine Tracker',
      description: 'Never miss a dose with personalized vaccine schedules for your little one.',
      color: 'bg-blue-50 text-blue-600'
    },
    {
      icon: <Calendar size={24} />,
      title: 'Expert Appointments',
      description: 'Book online or offline consultations with top gynaecologists and pediatricians.',
      color: 'bg-[#E6C77A]/20 text-orange-600'
    },
    {
      icon: <Baby size={24} />,
      title: 'Pregnancy Tracker',
      description: 'Track your baby growth week-by-week with helpful tips and symptom logs.',
      color: 'bg-pink-50 text-pink-600'
    },
    {
      icon: <Apple size={24} />,
      title: 'Nutrition Support',
      description: 'Plan healthy meals and track hydration levels during your pregnancy.',
      color: 'bg-green-50 text-green-600'
    },
    {
      icon: <Users size={24} />,
      title: 'Anonymous Community',
      description: 'Connect with other mothers in a safe, anonymous space to share experiences.',
      color: 'bg-purple-50 text-purple-600'
    },
    {
      icon: <ShoppingBag size={24} />,
      title: 'Medicine Store',
      description: 'Order essential supplements and medicines directly to your doorstep.',
      color: 'bg-teal-50 text-teal-600'
    }
  ];

  return (
    <section className="py-24 bg-[#FAFAFC]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-[#E6C77A] font-bold text-xs uppercase tracking-[0.3em] mb-4 block">Our Services</span>
          <h2 className="text-4xl font-serif font-bold text-gray-900 mb-4">Complete Care Platform</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">Everything you need from prenatal vitamins to post-natal checkups, all in one place.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-50 hover:shadow-xl hover:shadow-gray-200/40 transition-all group">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 ${feature.color} group-hover:scale-110 transition-transform`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;