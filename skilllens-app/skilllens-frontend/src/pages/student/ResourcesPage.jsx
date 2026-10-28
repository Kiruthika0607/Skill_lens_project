import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BookOpen,
  Search,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Sparkles,
  Filter,
  CheckCircle2,
  PlayCircle
} from 'lucide-react';
import api from '../../services/api';
import Button from '../../components/common/Button';
import Card, { CardHeader, CardBody } from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Skeleton, { CardSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';

export const ResourcesPage = () => {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState('recommended'); // recommended | all | saved
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [typeFilter, setTypeFilter] = useState('');
  const [costFilter, setCostFilter] = useState('');
  const [savedResourceIds, setSavedResourceIds] = useState(new Set());
  const [savingId, setSavingId] = useState(null);

  const fetchResources = async () => {
    setLoading(true);
    try {
      if (tab === 'recommended') {
        const res = await api.get('/student/resources/recommended');
        setResources(res.data || []);
      } else if (tab === 'saved') {
        const res = await api.get('/student/resources/saved');
        setResources(res.data || []);
      } else {
        const res = await api.get(`/resources?search=${encodeURIComponent(search)}&size=50`);
        setResources(res.data?.content || []);
      }

      // Also get saved resource IDs to show bookmark state
      try {
        const savedRes = await api.get('/student/resources/saved');
        const ids = new Set((savedRes.data || []).map((r) => r.id));
        setSavedResourceIds(ids);
      } catch {
        // ignore
      }
    } catch (err) {
      console.error('Failed to load resources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [tab, search]);

  const handleToggleSave = async (resourceId) => {
    setSavingId(resourceId);
    const isSaved = savedResourceIds.has(resourceId);

    try {
      if (isSaved) {
        await api.delete(`/student/resources/${resourceId}/save`);
        setSavedResourceIds((prev) => {
          const next = new Set(prev);
          next.delete(resourceId);
          return next;
        });
      } else {
        await api.post(`/student/resources/${resourceId}/save`);
        setSavedResourceIds((prev) => new Set([...prev, resourceId]));
      }
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    } finally {
      setSavingId(null);
    }
  };

  const filteredResources = resources.filter((r) => {
    if (typeFilter && r.resourceType !== typeFilter) return false;
    if (costFilter && r.costType !== costFilter) return false;
    if (search && !r.title?.toLowerCase().includes(search.toLowerCase()) && !r.skillName?.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold text-navy-900 tracking-tight">Curated Learning Resources</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          High-yield technical tutorials, courses, and documentation matched to your active skill gap deficiencies.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setTab('recommended')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            tab === 'recommended'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Recommended For My Gaps</span>
        </button>
        <button
          onClick={() => setTab('all')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-colors ${
            tab === 'all'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          All Resources Catalog
        </button>
        <button
          onClick={() => setTab('saved')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            tab === 'saved'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookmarkCheck className="w-4 h-4" />
          <span>Saved ({savedResourceIds.size})</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by topic, skill, or course title..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Formats</option>
            <option value="COURSE">Online Course</option>
            <option value="BOOK">Textbook / Documentation</option>
            <option value="VIDEO">Video Tutorial</option>
            <option value="TUTORIAL">Interactive Tutorial</option>
          </select>

          <select
            value={costFilter}
            onChange={(e) => setCostFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Pricing</option>
            <option value="FREE">Free Only</option>
            <option value="PAID">Paid / Certificate</option>
          </select>
        </div>
      </div>

      {/* Resources Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filteredResources.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No resources found"
          description="Try broadening your search term or switching to the catalog tab."
          actionLabel={tab !== 'all' ? 'Browse All Resources' : undefined}
          onAction={tab !== 'all' ? () => setTab('all') : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredResources.map((res) => {
            const isSaved = savedResourceIds.has(res.id);

            return (
              <Card key={res.id} hover className="flex flex-col justify-between">
                <CardBody className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge
                        status={res.costType === 'FREE' ? 'ACTIVE' : 'SAMPLE'}
                        label={res.costType}
                        size="sm"
                      />
                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        {res.resourceType}
                      </span>
                      {res.difficultyLevel && (
                        <span className="text-[10px] font-medium text-slate-500">
                          {res.difficultyLevel}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={savingId === res.id}
                      onClick={() => handleToggleSave(res.id)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        isSaved
                          ? 'bg-brand-50 border-brand-200 text-brand-600'
                          : 'border-slate-200 text-slate-400 hover:text-slate-600'
                      }`}
                      aria-label="Bookmark resource"
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  <h3 className="text-sm font-bold text-navy-900 leading-snug mb-1.5 line-clamp-2">
                    {res.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-4">
                    {res.description}
                  </p>

                  <div className="text-xs text-slate-400 flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="font-semibold text-slate-700">
                      Target: {res.skillName || 'General'}
                    </span>
                    {res.estimatedHours && (
                      <span>~{res.estimatedHours} hrs</span>
                    )}
                  </div>
                </CardBody>

                <div className="p-4 bg-slate-50 rounded-b-xl border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">
                    {res.provider || 'Self-Paced'}
                  </span>
                  {res.url && (
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex"
                    >
                      <Button variant="primary" size="sm" icon={ExternalLink} iconPosition="right">
                        Access Material
                      </Button>
                    </a>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ResourcesPage;
