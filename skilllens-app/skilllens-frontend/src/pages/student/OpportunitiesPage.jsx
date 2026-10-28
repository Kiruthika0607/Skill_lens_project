import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Search,
  Filter,
  ExternalLink,
  Bookmark,
  Building2,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  Award,
  Globe
} from 'lucide-react';
import api from '../../services/api';
import Button from '../../components/common/Button';
import Card, { CardHeader, CardBody } from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Skeleton, { CardSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';

export const OpportunitiesPage = () => {
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, JOB, INTERNSHIP, SCHOLARSHIP, HACKATHON
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [locationFilter, setLocationFilter] = useState('');
  const [savedIds, setSavedIds] = useState(new Set());
  const [savingId, setSavingId] = useState(null);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      // First get recommended matches
      const matchRes = await api.get('/student/opportunities/recommended?limit=50');
      const matches = matchRes.data || [];

      // Extract opportunity and match score
      const combined = matches.map((m) => ({
        ...m.opportunity,
        matchPercentage: m.matchPercentage,
        matchedSkillCount: m.matchedSkillCount,
        totalRequiredSkillCount: m.totalRequiredSkillCount,
        matchedSkillNames: m.matchedSkillNames,
        missingSkillNames: m.missingSkillNames,
      }));

      setOpportunities(combined);

      // Check saved
      try {
        const savedRes = await api.get('/student/opportunities/saved');
        const ids = new Set((savedRes.data || []).map((o) => o.id));
        setSavedIds(ids);
      } catch {
        // ignore
      }
    } catch (err) {
      console.error('Failed to load opportunities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const handleToggleSave = async (oppId) => {
    setSavingId(oppId);
    const isSaved = savedIds.has(oppId);
    try {
      if (isSaved) {
        await api.delete(`/student/opportunities/${oppId}/save`);
        setSavedIds((prev) => {
          const next = new Set(prev);
          next.delete(oppId);
          return next;
        });
      } else {
        await api.post(`/student/opportunities/${oppId}/save`);
        setSavedIds((prev) => new Set([...prev, oppId]));
      }
    } catch (err) {
      console.error('Failed to toggle saved opportunity:', err);
    } finally {
      setSavingId(null);
    }
  };

  const handleStatusChange = async (oppId, nextStatus) => {
    try {
      await api.patch(`/student/opportunities/${oppId}/status`, { status: nextStatus });
      setSavedIds((prev) => new Set([...prev, oppId]));
      setOpportunities((prev) =>
        prev.map((o) => (o.id === oppId ? { ...o, applicationStatus: nextStatus } : o))
      );
    } catch (err) {
      console.error('Failed to update application status:', err);
    }
  };

  const filteredOpportunities = opportunities.filter((opp) => {
    if (activeTab !== 'ALL' && opp.opportunityType !== activeTab) return false;
    if (remoteOnly && !opp.isRemote) return false;
    if (locationFilter && !opp.location?.toLowerCase().includes(locationFilter.toLowerCase())) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchTitle = opp.title?.toLowerCase().includes(q);
      const matchOrg = opp.organization?.toLowerCase().includes(q);
      if (!matchTitle && !matchOrg) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold text-navy-900 tracking-tight">Verified Opportunities Feed</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Aggregated technical jobs, internships, research scholarships, and hackathons scored against your verified competency profile.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto">
        {[
          { key: 'ALL', label: 'All Opportunities' },
          { key: 'JOB', label: 'Full-Time Jobs' },
          { key: 'INTERNSHIP', label: 'Internships' },
          { key: 'SCHOLARSHIP', label: 'Scholarships & Grants' },
          { key: 'HACKATHON', label: 'Hackathons & Contests' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`py-3 px-5 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by role, skill, or organization..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <label className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer hover:bg-slate-50">
            <input
              type="checkbox"
              checked={remoteOnly}
              onChange={(e) => setRemoteOnly(e.target.checked)}
              className="rounded text-brand-600 focus:ring-brand-500"
            />
            <span>Remote Only</span>
          </label>

          <input
            type="text"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            placeholder="Filter location (e.g. Bangalore, SF)..."
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 w-44"
          />
        </div>
      </div>

      {/* Opportunities Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filteredOpportunities.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No opportunities found"
          description="Try clearing your search query or adjusting remote filters."
          actionLabel="Reset Filters"
          onAction={() => {
            setSearch('');
            setRemoteOnly(false);
            setLocationFilter('');
            setActiveTab('ALL');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredOpportunities.map((opp) => {
            const isSaved = savedIds.has(opp.id);
            const matchScore = Math.round(opp.matchPercentage || 100);

            return (
              <Card key={opp.id} hover className="flex flex-col justify-between">
                <CardBody className="p-6">
                  {/* Top Badges */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge
                        status={opp.opportunityType}
                        label={opp.opportunityType}
                        size="sm"
                      />
                      <Badge
                        status="VERIFIED"
                        label="VERIFIED"
                        size="sm"
                      />
                      {opp.isRemote && (
                        <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                          Remote
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200">
                        {matchScore}% Match
                      </span>
                      <button
                        type="button"
                        disabled={savingId === opp.id}
                        onClick={() => handleToggleSave(opp.id)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          isSaved
                            ? 'bg-brand-50 border-brand-200 text-brand-600'
                            : 'border-slate-200 text-slate-400 hover:text-slate-600'
                        }`}
                        aria-label="Bookmark opportunity"
                      >
                        <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Title & Organization */}
                  <h3 className="text-base font-bold text-navy-900 leading-snug mb-1">
                    {opp.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mb-3">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {opp.organization}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {opp.location || 'Remote'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                    {opp.description}
                  </p>

                  {/* Required skills tags */}
                  {opp.requiredSkills && opp.requiredSkills.length > 0 && (
                    <div className="pt-3 border-t border-slate-100">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Matched Skills
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {opp.requiredSkills.map((sk, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-50 text-slate-700 border border-slate-200"
                          >
                            {sk.skillName}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Metadata Row: Last verified date & deadline */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-4 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Deadline: {opp.deadline ? new Date(opp.deadline).toLocaleDateString() : 'Rolling'}
                    </span>
                    <span>
                      Verified: {opp.lastVerifiedAt ? new Date(opp.lastVerifiedAt).toLocaleDateString() : 'Active'}
                    </span>
                  </div>
                </CardBody>

                {/* Bottom Action Footer with Application Status Tracker */}
                <div className="p-4 bg-slate-50 rounded-b-xl border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-slate-500">Stage:</span>
                    <select
                      value={opp.applicationStatus || 'SAVED'}
                      onChange={(e) => handleStatusChange(opp.id, e.target.value)}
                      className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    >
                      <option value="SAVED">Saved</option>
                      <option value="APPLIED">Applied</option>
                      <option value="INTERVIEWING">Interviewing</option>
                      <option value="OFFERED">Offered</option>
                      <option value="REJECTED">Archived</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    {opp.applicationUrl && (
                      <a
                        href={opp.applicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex w-full sm:w-auto"
                      >
                        <Button variant="primary" size="sm" icon={ExternalLink} iconPosition="right" className="w-full sm:w-auto">
                          Official Apply Link
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OpportunitiesPage;
