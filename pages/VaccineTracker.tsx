import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Syringe, CheckCircle, Clock, AlertCircle, Plus, Search, Filter, 
  X, ChevronDown, SortAsc, Calendar as CalendarIcon, Check, RotateCcw
} from 'lucide-react';
import { db } from '../services/mockDb';
import { useAuth } from '../contexts/AuthContext';
import { VaccineRecord } from '../types';

// Standard pediatric vaccine catalog for autocomplete
const VACCINE_CATALOG = [
  "BCG (Tuberculosis)",
  "Pentavalent (DTP, HepB, Hib)",
  "Oral Polio Vaccine (OPV)",
  "Inactivated Polio Vaccine (IPV)",
  "Pneumococcal Conjugate (PCV)",
  "Rotavirus Vaccine",
  "Measles-Rubella (MR)",
  "Vitamin A Supplement",
  "DPT Booster",
  "TT (Tetanus Toxoid)",
  "Hepatitis B",
  "MMR Booster",
  "Typhoid Vaccine",
  "Chickenpox (Varicella)",
  "Hepatitis A"
];

const VaccineTracker: React.FC = () => {
  const { user } = useAuth();
  const [vaccines, setVaccines] = useState<VaccineRecord[]>([]);
  const [query, setQuery] = useState('');
  
  // Modal & Dropdown States
  const [showAdd, setShowAdd] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState(-1);
  
  // Form/Filter States
  const [newV, setNewV] = useState({ name: '', dueDate: '', notes: '' });
  const [filters, setFilters] = useState({
    status: 'All',
    sortBy: 'date-asc'
  });

  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) setVaccines(db.getVaccines(user.id));
  }, [user]);

  // Handle outside clicks to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleStatus = (id: string, current: VaccineRecord['status']) => {
    if (!user) return;
    const nextStatus = current === 'Taken' ? 'Pending' : 'Taken';
    db.updateVaccineStatus(user.id, id, nextStatus);
    setVaccines(db.getVaccines(user.id));
  };

  const handleAdd = () => {
    if (!user || !newV.name) return;
    db.addVaccine(user.id, { ...newV, status: 'Pending' });
    setVaccines(db.getVaccines(user.id));
    setShowAdd(false);
    setNewV({ name: '', dueDate: '', notes: '' });
  };

  // Autocomplete Logic
  const filteredSuggestions = useMemo(() => {
    if (!query.trim()) return [];
    return VACCINE_CATALOG.filter(v => 
      v.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 6);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSuggestionIndex(prev => Math.min(prev + 1, filteredSuggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSuggestionIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      if (suggestionIndex >= 0 && filteredSuggestions[suggestionIndex]) {
        setQuery(filteredSuggestions[suggestionIndex]);
        setShowSuggestions(false);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Filter & Sort Logic
  const filteredAndSorted = useMemo(() => {
    let result = vaccines.filter(v => 
      v.name.toLowerCase().includes(query.toLowerCase())
    );

    // Apply Status Filter
    if (filters.status !== 'All') {
      result = result.filter(v => v.status === filters.status);
    }

    // Apply Sorting
    result.sort((a, b) => {
      if (filters.sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (filters.sortBy === 'date-asc') return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      if (filters.sortBy === 'date-desc') return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      return 0;
    });

    return result;
  }, [vaccines, query, filters]);

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vaccine Tracker</h1>
          <p className="text-gray-500">Manage and track your baby's immunizations.</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-8 py-4 bg-[#E6C77A] text-white rounded-2xl font-bold shadow-xl shadow-[#E6C77A]/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={20}/> Add New Entry
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Input with Autocomplete */}
        <div className="flex-1 relative" ref={searchRef}>
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="pl-4 text-gray-400"><Search size={20}/></div>
            <input 
              type="text" 
              placeholder="Search vaccine name..." 
              className="flex-1 py-3 bg-transparent outline-none font-medium text-gray-700"
              value={query}
              onChange={e => {
                setQuery(e.target.value);
                setShowSuggestions(true);
                setSuggestionIndex(-1);
              }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={handleKeyDown}
            />
            {query && (
              <button onClick={() => setQuery('')} className="p-1 hover:bg-gray-100 rounded-full text-gray-400">
                <X size={16} />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[50] animate-in fade-in slide-in-from-top-2">
              {filteredSuggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(s);
                    setShowSuggestions(false);
                  }}
                  className={`w-full px-6 py-4 text-left text-sm font-medium transition-colors border-b border-gray-50 last:border-none flex items-center gap-3 ${
                    suggestionIndex === idx ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Syringe size={14} className="text-gray-300" />
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filter Trigger Button */}
        <button 
          onClick={() => setShowFilter(true)}
          className={`flex items-center gap-2 px-6 py-4 rounded-3xl font-bold transition-all border ${
            filters.status !== 'All' || filters.sortBy !== 'date-asc' 
            ? 'bg-teal-600 border-teal-600 text-white shadow-lg shadow-teal-600/20' 
            : 'bg-white border-gray-100 text-gray-500 hover:border-teal-200'
          }`}
        >
          <Filter size={20} />
          <span>Filter</span>
          {(filters.status !== 'All' || filters.sortBy !== 'date-asc') && (
             <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
          )}
        </button>
      </div>

      {/* Vaccine List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSorted.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-[40px] border border-dashed border-gray-200">
            <p className="text-gray-400 font-medium italic">No vaccines match your current filters.</p>
            <button 
              onClick={() => { setFilters({ status: 'All', sortBy: 'date-asc' }); setQuery(''); }}
              className="mt-4 text-teal-600 font-bold hover:underline"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          filteredAndSorted.map(v => (
            <div key={v.id} className={`p-8 rounded-[40px] border-2 transition-all group ${v.status === 'Taken' ? 'bg-[#BFE6DA]/10 border-[#BFE6DA]/30' : 'bg-white border-gray-50 shadow-sm hover:border-teal-100 hover:shadow-md'}`}>
              <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl transition-colors ${v.status === 'Taken' ? 'bg-white text-teal-600' : 'bg-[#F7F5EF] text-teal-700'}`}>
                  <Syringe size={24} />
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${v.status === 'Taken' ? 'bg-teal-500 text-white' : 'bg-blue-50 text-blue-500'}`}>
                  {v.status}
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">{v.name}</h3>
              <p className="text-sm text-gray-400 flex items-center gap-2 mb-8">
                <Clock size={14}/> Due: {new Date(v.dueDate).toLocaleDateString()}
              </p>
              <button 
                onClick={() => toggleStatus(v.id, v.status)}
                className={`w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${v.status === 'Taken' ? 'bg-white text-teal-600 border border-teal-100' : 'bg-[#BFE6DA] text-teal-900 shadow-lg shadow-teal-500/10'}`}
              >
                {v.status === 'Taken' ? <><CheckCircle size={18}/> Completed</> : 'Mark as Taken'}
              </button>
            </div>
          ))
        )}
      </div>

      {/* Filter Modal */}
      {showFilter && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[40px] p-10 shadow-2xl space-y-8 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center">
               <h2 className="text-2xl font-bold text-gray-900">Filter Records</h2>
               <button onClick={() => setShowFilter(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24}/></button>
            </div>

            <div className="space-y-6">
              {/* Status Filter */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {['All', 'Taken', 'Pending', 'Missed'].map((s) => (
                    <button 
                      key={s}
                      onClick={() => setFilters({...filters, status: s})}
                      className={`py-3 rounded-2xl text-xs font-bold transition-all border ${filters.status === s ? 'bg-teal-600 border-teal-600 text-white' : 'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sorting Filter */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Sort By</label>
                <div className="space-y-2">
                  {[
                    { id: 'date-asc', label: 'Soonest First', icon: <CalendarIcon size={14}/> },
                    { id: 'date-desc', label: 'Latest First', icon: <Clock size={14}/> },
                    { id: 'name-asc', label: 'Alphabetical (A-Z)', icon: <SortAsc size={14}/> },
                  ].map((s) => (
                    <button 
                      key={s.id}
                      onClick={() => setFilters({...filters, sortBy: s.id as any})}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl text-xs font-bold transition-all border ${filters.sortBy === s.id ? 'bg-white border-teal-600 text-teal-700 shadow-sm' : 'bg-gray-50 border-transparent text-gray-500'}`}
                    >
                      <span className="flex items-center gap-3">{s.icon} {s.label}</span>
                      {filters.sortBy === s.id && <Check size={16} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-50">
               <button 
                onClick={() => { setFilters({ status: 'All', sortBy: 'date-asc' }); setShowFilter(false); }}
                className="flex-1 py-4 bg-gray-50 text-gray-400 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2"
               >
                 <RotateCcw size={14}/> Reset
               </button>
               <button 
                onClick={() => setShowFilter(false)}
                className="flex-1 py-4 bg-teal-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-teal-600/20"
               >
                 Apply
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Entry Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-bold text-gray-800 mb-8">New Vaccine Entry</h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Vaccine Name</label>
                <input 
                  className="w-full p-4 bg-[#F7F5EF] rounded-2xl outline-none focus:ring-2 focus:ring-teal-100 font-medium" 
                  placeholder="e.g. HPV Booster" 
                  value={newV.name}
                  onChange={e => setNewV({...newV, name: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Due Date</label>
                <input 
                  type="date" 
                  className="w-full p-4 bg-[#F7F5EF] rounded-2xl outline-none focus:ring-2 focus:ring-teal-100 font-medium" 
                  value={newV.dueDate}
                  onChange={e => setNewV({...newV, dueDate: e.target.value})} 
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={() => setShowAdd(false)} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold">Cancel</button>
                <button onClick={handleAdd} className="flex-1 py-4 bg-[#E6C77A] text-white rounded-2xl font-bold shadow-xl shadow-[#E6C77A]/20">Save Entry</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VaccineTracker;