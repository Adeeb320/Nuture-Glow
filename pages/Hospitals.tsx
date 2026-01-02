import React, { useState, useMemo } from 'react';
import { Hospital as HospitalIcon, Phone, MapPin, Search, ExternalLink, Activity, Info, CheckCircle, AlertCircle, X, Copy } from 'lucide-react';
import { SEED_HOSPITALS } from '../services/mockDb';
import { Hospital } from '../types';

const Hospitals: React.FC = () => {
  const [query, setQuery] = useState('');
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(SEED_HOSPITALS[0]);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleEmergencyClick = () => {
    // Primary: Try to dial
    window.location.href = "tel:999";
    
    // Fallback: Copy to clipboard
    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText("999")
          .then(() => {
            showToast("Emergency number 999 copied", "success");
          })
          .catch(() => {
            setShowEmergencyModal(true);
          });
      } else {
        setShowEmergencyModal(true);
      }
    } catch (err) {
      setShowEmergencyModal(true);
    }
  };

  const sortedHospitals = useMemo(() => {
    let result = [...SEED_HOSPITALS];
    if (query) {
      result = result.filter(h => 
        h.name.toLowerCase().includes(query.toLowerCase()) || 
        h.location.toLowerCase().includes(query.toLowerCase())
      );
    }
    return result;
  }, [query]);

  // OpenStreetMap Embed URL Builder
  const getMapUrl = (lat: number, lng: number) => {
    const offset = 0.005;
    const bbox = `${lng - offset},${lat - offset},${lng + offset},${lat + offset}`;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500 pb-20 relative">
      {/* Toast Feedback */}
      {toast && (
        <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[1000] px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 ${
          toast.type === 'success' ? 'bg-teal-600 text-white' : 
          toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-[#E6C77A] text-teal-900'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={18}/> : toast.type === 'error' ? <X size={18}/> : <AlertCircle size={18}/>}
          <span className="text-sm font-bold">{toast.message}</span>
        </div>
      )}

      {/* Emergency Modal Fallback */}
      {showEmergencyModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] p-10 max-w-sm w-full shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Activity size={40} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">Emergency Number</h3>
              <p className="text-gray-500 mt-2">Dial 999 immediately for assistance.</p>
            </div>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText("999");
                  showToast("Copied: 999", "success");
                  setShowEmergencyModal(false);
                }}
                className="w-full py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all flex items-center justify-center gap-2"
              >
                <Copy size={18} /> Copy 999
              </button>
              <button 
                onClick={() => setShowEmergencyModal(false)}
                className="w-full py-4 bg-gray-50 text-gray-400 rounded-2xl font-bold hover:bg-gray-100 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hospital Directory</h1>
          <p className="text-gray-500">Find maternal care facilities near you.</p>
        </div>
        <button 
          onClick={handleEmergencyClick}
          className="bg-red-50 p-4 rounded-3xl border border-red-100 flex items-center gap-4 text-red-600 hover:bg-red-100 hover:scale-105 transition-all shadow-sm group"
        >
           <Activity className="animate-pulse group-hover:scale-110 transition-transform" />
           <div className="text-xs font-bold text-left">
              <p className="uppercase tracking-widest text-[10px] opacity-70">Emergency</p>
              <p className="text-lg">999</p>
           </div>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: List & Search */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 sticky top-20 z-10">
            <div className="pl-4 text-gray-400"><Search size={20}/></div>
            <input 
              type="text" 
              placeholder="Search hospital or area..." 
              className="flex-1 py-2 bg-transparent outline-none font-medium text-gray-700 text-sm"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>

          <div className="space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto pr-2 custom-scrollbar">
            {sortedHospitals.length === 0 ? (
              <div className="p-12 text-center text-gray-300 italic">No hospitals found.</div>
            ) : (
              sortedHospitals.map(h => (
                <div 
                  key={h.id} 
                  onClick={() => setSelectedHospital(h)}
                  className={`cursor-pointer bg-white rounded-[32px] border-2 transition-all p-6 space-y-4 group ${
                    selectedHospital?.id === h.id ? 'border-teal-500 shadow-lg scale-[1.02]' : 'border-transparent shadow-sm hover:border-teal-100 hover:shadow-md'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                        selectedHospital?.id === h.id ? 'bg-teal-600 text-white' : 'bg-[#BFE6DA]/20 text-teal-600'
                      }`}>
                        <HospitalIcon size={24}/>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 leading-tight">{h.name}</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{h.type} Facility</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-2 text-gray-500">
                      <MapPin size={14} className="text-teal-500 shrink-0 mt-0.5" />
                      <span className="text-xs font-medium line-clamp-1">{h.location}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <a 
                      href={`tel:${h.contact}`} 
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 py-3 bg-teal-50 text-teal-700 rounded-xl font-bold text-[10px] uppercase tracking-widest text-center hover:bg-teal-100 transition-all flex items-center justify-center gap-2"
                    >
                      <Phone size={12}/> Call
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Map Preview */}
        <div className="lg:col-span-7 sticky top-20">
          <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden h-[600px] flex flex-col">
            {selectedHospital ? (
              <>
                <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-[#F7F5EF]/30">
                  <div>
                    <h3 className="font-bold text-gray-900">{selectedHospital.name}</h3>
                    <p className="text-xs text-gray-500 truncate max-w-[300px]">{selectedHospital.location}</p>
                  </div>
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${selectedHospital.lat},${selectedHospital.lng}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-teal-700 shadow-lg shadow-teal-600/20 transition-all"
                  >
                    Open in Google Maps <ExternalLink size={14}/>
                  </a>
                </div>
                
                <div className="flex-1 relative bg-gray-100">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    scrolling="no" 
                    marginHeight={0} 
                    marginWidth={0} 
                    title="Map Preview"
                    src={getMapUrl(selectedHospital.lat, selectedHospital.lng)}
                    className="grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
                  />
                  
                  {/* Map Overlay Info Box */}
                  <div className="absolute bottom-6 left-6 right-6 p-6 bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-end">
                      <div className="space-y-3">
                        <div className={`inline-block px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                          selectedHospital.beds === 'Available' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          Beds: {selectedHospital.beds}
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone size={16} className="text-blue-500" />
                          <span className="text-sm font-bold text-gray-700">{selectedHospital.contact}</span>
                        </div>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Status</p>
                         <p className="text-sm font-bold text-teal-600">Open 24/7</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-6 opacity-30">
                <MapPin size={80} className="text-gray-300" />
                <div>
                  <h3 className="text-xl font-bold">Select a Hospital</h3>
                  <p className="text-sm">Click on a hospital from the list to view its location.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hospitals;