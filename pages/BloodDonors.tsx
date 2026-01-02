
import React, { useState, useEffect } from 'react';
import { Droplet, Search, Phone, MapPin, Filter, Plus, ShieldCheck, X, Send, CheckCircle2, Copy, Trash2, Clock } from 'lucide-react';
import { db } from '../services/mockDb';
import { Donor, BloodRequest } from '../types';

const BloodDonors: React.FC = () => {
  const [query, setQuery] = useState('');
  const [activeGroup, setActiveGroup] = useState('All');
  const [donors, setDonors] = useState<Donor[]>([]);
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [showBecomeModal, setShowBecomeModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState<Donor | null>(null);
  const [showUrgentModal, setShowUrgentModal] = useState<Donor | null>(null);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'info'} | null>(null);

  // Form states
  const [newDonor, setNewDonor] = useState({ name: '', bloodGroup: 'O+', location: '', phone: '' });
  const [urgentRequest, setUrgentRequest] = useState({ requesterPhone: '', message: '' });

  const groups = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const refreshData = () => {
    setDonors(db.getDonors());
    setRequests(db.getBloodRequests());
  };

  useEffect(() => {
    refreshData();
    window.addEventListener('db-update', refreshData);
    return () => window.removeEventListener('db-update', refreshData);
  }, []);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleBecomeDonor = () => {
    if (!newDonor.name || !newDonor.phone) return;
    db.addDonor({ ...newDonor, id: Math.random().toString(36).substr(2, 9), verified: false });
    setShowBecomeModal(false);
    setNewDonor({ name: '', bloodGroup: 'O+', location: '', phone: '' });
    showToast("You are now registered as a donor!");
  };

  const handleCallClick = (donor: Donor) => {
    if (!donor.phone) {
      showToast("Phone number not available", "info");
      return;
    }
    // Check if mobile
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      window.location.href = `tel:${donor.phone}`;
    } else {
      setShowCallModal(donor);
    }
  };

  const handleUrgentRequest = () => {
    if (!showUrgentModal || !urgentRequest.requesterPhone) return;
    const req: BloodRequest = {
      id: Math.random().toString(36).substr(2, 9),
      donorId: showUrgentModal.id,
      donorName: showUrgentModal.name,
      bloodGroup: showUrgentModal.bloodGroup,
      area: showUrgentModal.location,
      requesterPhone: urgentRequest.requesterPhone,
      message: urgentRequest.message,
      createdAt: new Date().toISOString(),
      status: 'sent'
    };
    db.addBloodRequest(req);
    setShowUrgentModal(null);
    setUrgentRequest({ requesterPhone: '', message: '' });
    showToast(`Urgent request sent to ${showUrgentModal.name}`);
  };

  const handleDeleteRequest = (id: string) => {
    db.deleteBloodRequest(id);
    showToast("Request record removed", "info");
  };

  const filtered = donors.filter(d => 
    (activeGroup === 'All' || d.bloodGroup === activeGroup) &&
    (d.name.toLowerCase().includes(query.toLowerCase()) || d.location.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-10 animate-in fade-in duration-500 pb-20 relative">
      {/* Toast Feedback */}
      {toast && (
        <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[1000] px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 ${toast.type === 'success' ? 'bg-teal-600 text-white' : 'bg-[#E6C77A] text-teal-900'}`}>
          {toast.type === 'success' ? <CheckCircle2 size={18}/> : <Clock size={18}/>}
          <span className="text-sm font-bold">{toast.message}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blood Donor Network</h1>
          <p className="text-gray-500">Connecting mothers with life-saving donors during emergencies.</p>
        </div>
        <button 
          onClick={() => setShowBecomeModal(true)}
          className="flex items-center gap-2 px-8 py-4 bg-red-600 text-white rounded-2xl font-bold shadow-xl shadow-red-600/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={20}/> Become a Donor
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="pl-4 text-gray-400"><Search size={20}/></div>
          <input 
            type="text" 
            placeholder="Search by location or name..." 
            className="flex-1 py-3 bg-transparent outline-none font-medium text-gray-700"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
          {groups.map(g => (
            <button 
              key={g} 
              onClick={() => setActiveGroup(g)}
              className={`px-5 py-4 rounded-2xl text-xs font-bold transition-all border shrink-0 ${activeGroup === g ? 'bg-red-600 border-red-600 text-white shadow-lg' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'}`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map(d => (
          <div key={d.id} className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 flex flex-col gap-6 group hover:border-red-500 transition-all relative">
            <div className="flex justify-between items-start">
               <div className="w-16 h-16 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center font-bold text-xl shadow-inner group-hover:bg-red-500 group-hover:text-white transition-all">
                  {d.bloodGroup}
               </div>
               {d.verified && (
                 <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold uppercase tracking-widest">
                    <ShieldCheck size={12}/> Verified
                 </div>
               )}
            </div>
            <div>
               <h3 className="text-xl font-bold text-gray-800">{d.name}</h3>
               <p className="text-gray-400 flex items-center gap-2 mt-2 text-sm">
                  <MapPin size={14} className="text-red-400"/> {d.location}
               </p>
            </div>
            <div className="pt-4 border-t border-gray-50 flex gap-3">
               <button 
                onClick={() => handleCallClick(d)}
                className="flex-1 py-4 bg-[#F7F5EF] text-gray-700 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center justify-center gap-2 active:scale-95"
               >
                  <Phone size={14}/> Call
               </button>
               <button 
                onClick={() => setShowUrgentModal(d)}
                className="px-6 py-4 bg-red-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:scale-105 transition-all active:scale-95"
               >
                 Urgent Request
               </button>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Requests Section */}
      {requests.length > 0 && (
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 space-y-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
             <Clock className="text-orange-500" /> Recent Urgent Requests
          </h2>
          <div className="divide-y divide-gray-50">
             {requests.map(r => (
               <div key={r.id} className="py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center font-bold text-xs">
                        {r.bloodGroup}
                     </div>
                     <div>
                        <p className="font-bold text-gray-800">To: {r.donorName}</p>
                        <p className="text-xs text-gray-400">Area: {r.area} • {new Date(r.createdAt).toLocaleString()}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-3 w-full md:w-auto">
                     <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold uppercase tracking-widest">Status: Sent</span>
                     <button onClick={() => handleDeleteRequest(r.id)} className="p-2 text-gray-300 hover:text-red-500 transition-all ml-auto md:ml-0"><Trash2 size={16}/></button>
                  </div>
               </div>
             ))}
          </div>
        </div>
      )}

      {/* Become Donor Modal */}
      {showBecomeModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Become a Donor</h2>
              <button onClick={() => setShowBecomeModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={24}/></button>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Full Name</label>
                <input className="w-full p-4 bg-[#F7F5EF] rounded-2xl outline-none" value={newDonor.name} onChange={e => setNewDonor({...newDonor, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Blood Group</label>
                  <select className="w-full p-4 bg-[#F7F5EF] rounded-2xl outline-none" value={newDonor.bloodGroup} onChange={e => setNewDonor({...newDonor, bloodGroup: e.target.value})}>
                    {groups.filter(g => g !== 'All').map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Phone Number</label>
                  <input className="w-full p-4 bg-[#F7F5EF] rounded-2xl outline-none" value={newDonor.phone} onChange={e => setNewDonor({...newDonor, phone: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Area / Location</label>
                <input className="w-full p-4 bg-[#F7F5EF] rounded-2xl outline-none" value={newDonor.location} onChange={e => setNewDonor({...newDonor, location: e.target.value})} />
              </div>
              <button onClick={handleBecomeDonor} className="w-full py-5 bg-red-600 text-white rounded-3xl font-bold shadow-xl">Submit Registration</button>
            </div>
          </div>
        </div>
      )}

      {/* Call Modal Desktop Fallback */}
      {showCallModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-[40px] p-10 shadow-2xl text-center space-y-6 animate-in zoom-in-95">
            <div className="w-20 h-20 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Phone size={40} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Contact {showCallModal.name}</h3>
              <p className="text-gray-400 mt-2 font-mono text-lg">{showCallModal.phone}</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(showCallModal.phone);
                  showToast("Number copied to clipboard");
                  setShowCallModal(null);
                }}
                className="flex-1 py-4 bg-teal-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2"
              >
                <Copy size={16}/> Copy Number
              </button>
              <button onClick={() => setShowCallModal(null)} className="px-6 py-4 bg-gray-50 text-gray-400 rounded-2xl font-bold">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Urgent Request Modal */}
      {showUrgentModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Urgent Request</h2>
              <button onClick={() => setShowUrgentModal(null)} className="p-2 hover:bg-gray-100 rounded-full"><X size={24}/></button>
            </div>
            <div className="p-6 bg-red-50 rounded-3xl mb-8 space-y-2">
               <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Selected Donor</p>
               <p className="font-bold text-red-600">{showUrgentModal.name} ({showUrgentModal.bloodGroup})</p>
               <p className="text-xs text-red-400">{showUrgentModal.location}</p>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Your Phone Number *</label>
                <input 
                  className="w-full p-4 bg-[#F7F5EF] rounded-2xl outline-none font-medium" 
                  placeholder="+880..."
                  value={urgentRequest.requesterPhone} 
                  onChange={e => setUrgentRequest({...urgentRequest, requesterPhone: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Message (Optional)</label>
                <textarea 
                  className="w-full p-4 bg-[#F7F5EF] rounded-2xl outline-none h-24 resize-none text-sm" 
                  placeholder="Explain why the need is urgent..."
                  value={urgentRequest.message}
                  onChange={e => setUrgentRequest({...urgentRequest, message: e.target.value})}
                />
              </div>
              <button 
                onClick={handleUrgentRequest}
                disabled={!urgentRequest.requesterPhone}
                className="w-full py-5 bg-red-600 text-white rounded-3xl font-bold shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <Send size={20}/> Send Urgent Alert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BloodDonors;
