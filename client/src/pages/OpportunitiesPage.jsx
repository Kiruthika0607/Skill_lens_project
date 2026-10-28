import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Briefcase, 
  Sparkles, 
  Award, 
  Code, 
  MapPin, 
  Calendar, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Search, 
  Building2,
  DollarSign,
  Globe
} from 'lucide-react';
import { SkeletonLoader, StatusBadge, EmptyState } from '../components/UIState';

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState([]);
  const [counts, setCounts] = useState({ jobs: 0, internships: 0, scholarships: 0, hackathons: 0 });
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'JOB' | 'INTERNSHIP' | 'SCHOLARSHIP' | 'HACKATHON'
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [workMode, setWorkMode] = useState('ALL');
  const [scope, setScope] = useState('ALL');
  const [setting, setSetting] = useState('ALL');

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/opportunities');
      setOpportunities(res.data.opportunities || []);
      if (res.data.counts) setCounts(res.data.counts);
    } catch (err) {
      console.error('Failed to load opportunities', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const filtered = opportunities.filter((o) => {
    const matchesTab = activeTab === 'ALL' || o.type === activeTab;
    const matchesSearch = 
      o.title.toLowerCase().includes(search.toLowerCase()) ||
      o.organization.toLowerCase().includes(search.toLowerCase()) ||
      (o.skills_required && o.skills_required.toLowerCase().includes(search.toLowerCase()));
    const matchesWorkMode = workMode === 'ALL' || o.work_mode === workMode;
    const matchesScope = scope === 'ALL' || o.scope === scope;
    const matchesSetting = setting === 'ALL' || o.setting === setting;

    return matchesTab && matchesSearch && matchesWorkMode && matchesScope && matchesSetting;
  });

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <SkeletonLoader count={4} className="h-36" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-100">
            Verified Opportunities Hub
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-900 mt-2">
            Industry Jobs, Internships, Scholarships & Hackathons
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Grounded listings verified with institutional eligibility requirements and live deadlines
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {[
          { key: 'ALL', label: 'All Opportunities', count: opportunities.length },
          { key: 'JOB', label: 'Full-time Jobs', count: counts.jobs },
          { key: 'INTERNSHIP', label: 'Internships', count: counts.internships },
          { key: 'SCHOLARSHIP', label: 'Scholarships & Grants', count: counts.scholarships },
          { key: 'HACKATHON', label: 'Hackathons', count: counts.hackathons },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === tab.key
                ? 'bg-brand-800 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
              activeTab === tab.key ? 'bg-brand-900 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by role, company, or skill..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-brand-600 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={workMode}
            onChange={(e) => setWorkMode(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-medium text-slate-700 outline-none"
          >
            <option value="ALL">All Work Modes</option>
            <option value="REMOTE">Remote</option>
            <option value="HYBRID">Hybrid</option>
            <option value="ON_SITE">On-Site</option>
          </select>

          <select
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-medium text-slate-700 outline-none"
          >
            <option value="ALL">All Scopes</option>
            <option value="NATIONAL">National</option>
            <option value="INTERNATIONAL">International</option>
          </select>

          <select
            value={setting}
            onChange={(e) => setSetting(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-medium text-slate-700 outline-none"
          >
            <option value="ALL">All Settings</option>
            <option value="ONLINE">Online</option>
            <option value="OFFLINE">In-Person</option>
          </select>
        </div>
      </div>

      {/* Opportunities List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <EmptyState title="No matching opportunities found" description="Adjust your filter parameters or search term." />
        ) : (
          filtered.map((opp) => (
            <div
              key={opp.id}
              className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-3 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={opp.type} label={opp.type} />
                  <StatusBadge status={opp.status} label={opp.status === 'VERIFIED' ? 'Verified Source' : opp.status} />
                  <span className="text-xs font-semibold text-slate-400">•</span>
                  <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    {opp.scope} ({opp.setting})
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900">{opp.title}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-1">
                    <span className="font-bold text-slate-800 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-brand-600" />
                      {opp.organization}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {opp.location} ({opp.work_mode})
                    </span>
                    {opp.stipend_or_reward && (
                      <>
                        <span>•</span>
                        <span className="font-bold text-emerald-700 flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                          {opp.stipend_or_reward}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                  {opp.description}
                </p>

                {/* Eligibility & Skills */}
                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <span className="text-slate-500 font-medium">
                    <strong>Eligibility:</strong> {opp.eligibility}
                  </span>
                  {opp.skills_required && (
                    <span className="text-brand-800 font-semibold bg-brand-50 px-2 py-0.5 rounded-lg border border-brand-100">
                      Skills: {opp.skills_required}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Column */}
              <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                <div className="text-left md:text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Application Deadline
                  </span>
                  <span className="text-xs font-bold text-rose-600 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(opp.deadline).toLocaleDateString()}
                  </span>
                  {opp.last_verified_at && (
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Verified {new Date(opp.last_verified_at).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <a
                  href={opp.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-brand-800 hover:bg-brand-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-brand-900/10"
                >
                  Apply on Official Portal
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
