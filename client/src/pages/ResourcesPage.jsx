import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BookOpen, 
  Search, 
  ExternalLink, 
  Star, 
  Filter, 
  Tag, 
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { SkeletonLoader, StatusBadge, EmptyState } from '../components/UIState';

export default function ResourcesPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedCost, setSelectedCost] = useState('ALL');

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/demand/resources');
      setResources(res.data.resources || []);
    } catch (err) {
      console.error('Failed to load resources', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const filtered = resources.filter((r) => {
    const matchesSearch = 
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.provider?.toLowerCase().includes(search.toLowerCase()) ||
      r.skill_name?.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType === 'ALL' || r.type?.toUpperCase() === selectedType;
    const matchesCost = selectedCost === 'ALL' || (selectedCost === 'FREE' ? r.cost === 0 || r.cost === '0' || r.cost === 'FREE' : r.cost > 0 || r.cost === 'PAID');
    return matchesSearch && matchesType && matchesCost;
  });

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <SkeletonLoader count={4} className="h-28" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-100">
            Curated Academic & Industry Courses
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-900 mt-2">
            Learning Resources Catalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Top-rated tutorials, hands-on labs, documentation, and certifications to eliminate skill gaps
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by skill, title, or platform..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-brand-600 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-medium text-slate-700 outline-none"
          >
            <option value="ALL">All Media Types</option>
            <option value="COURSE">Online Courses</option>
            <option value="TUTORIAL">Hands-on Tutorials</option>
            <option value="DOCUMENTATION">Official Documentation</option>
            <option value="PROJECT">Guided Capstones</option>
          </select>

          <select
            value={selectedCost}
            onChange={(e) => setSelectedCost(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-medium text-slate-700 outline-none"
          >
            <option value="ALL">All Price Levels</option>
            <option value="FREE">Free Only</option>
            <option value="PAID">Paid / Certification</option>
          </select>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full">
            <EmptyState title="No matching resources" description="Try broadening your search term or clearing filter selections." />
          </div>
        ) : (
          filtered.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold text-brand-700 uppercase tracking-wider bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-100">
                    {r.skill_name || 'Technical'}
                  </span>
                  <StatusBadge 
                    status={r.cost === 0 || r.cost === '0' || r.cost === 'FREE' ? 'VERIFIED' : 'PENDING'} 
                    label={r.cost === 0 || r.cost === '0' || r.cost === 'FREE' ? 'Free Resource' : 'Paid / Grant Eligible'} 
                  />
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">{r.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  Provided by <strong className="text-slate-700">{r.provider || 'Open Source Community'}</strong>. Focused on modern production patterns.
                </p>

                <div className="flex items-center gap-3 text-xs text-slate-600 mb-6 font-semibold">
                  <span className="flex items-center gap-1 text-amber-600">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    {r.rating || 4.8}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="capitalize">{r.type?.toLowerCase() || 'Course'}</span>
                </div>
              </div>

              <a
                href={r.url}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-brand-800 hover:text-white text-brand-900 text-xs font-bold transition flex items-center justify-center gap-2"
              >
                Access Resource
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
