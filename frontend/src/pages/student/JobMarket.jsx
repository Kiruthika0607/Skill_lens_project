import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Briefcase,
  Search,
  MapPin,
  DollarSign,
  Calendar,
  Bookmark,
  ExternalLink,
  Filter,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { ProgressBar } from '../../components/common/UIComponents';

const JobMarket = () => {
  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalJobs, setTotalJobs] = useState(0);
  const [search, setSearch] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [jobType, setJobType] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, [page, remoteOnly, jobType]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      let url = `/jobs?page=${page}&size=8`;
      if (search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;
      if (remoteOnly) url += `&remote=true`;
      if (jobType) url += `&jobType=${jobType}`;

      const res = await api.get(url);
      if (res.data.success) {
        setJobs(res.data.data.content);
        setTotalPages(res.data.data.totalPages);
        setTotalJobs(res.data.data.totalElements);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchJobs();
  };

  const handleToggleSave = async (jobId) => {
    try {
      const res = await api.post(`/jobs/${jobId}/save`);
      if (res.data.success) {
        setJobs(jobs.map(j => j.id === jobId ? { ...j, saved: res.data.data } : j));
      }
    } catch (err) {
      console.error('Error toggling save job:', err);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Industry Job Market & Matcher</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Explore real engineering openings and evaluate your skills match against each employer's specific tech stack.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.25rem' }}>
        <form onSubmit={handleSearchSubmit}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search by job title, company, or city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                id="job-search-input"
              />
            </div>

            <select
              className="form-select"
              style={{ width: 'auto', minWidth: '160px' }}
              value={jobType}
              onChange={(e) => { setJobType(e.target.value); setPage(0); }}
            >
              <option value="">All Job Types</option>
              <option value="FULL_TIME">Full Time</option>
              <option value="INTERNSHIP">Internship</option>
              <option value="CONTRACT">Contract</option>
            </select>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
              <input
                type="checkbox"
                checked={remoteOnly}
                onChange={(e) => { setRemoteOnly(e.target.checked); setPage(0); }}
                style={{ width: '16px', height: '16px', accentColor: 'var(--accent-primary)' }}
              />
              <span>Remote Only</span>
            </label>

            <button type="submit" className="btn btn-primary btn-sm" id="job-search-btn">
              <Search size={15} /> Search
            </button>
          </div>
        </form>
      </div>

      {/* Results Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Showing {jobs.length} of {totalJobs} active postings
        </span>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh' }}>
          <div className="loading-spinner" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Briefcase size={44} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>No Jobs Found Matching Your Criteria</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Try adjusting your search terms or unchecking the remote filter.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {jobs.map((job) => (
            <div key={job.id} className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>{job.title}</h3>
                    <span className="badge badge-primary">{job.company}</span>
                    {job.remote && <span className="badge badge-info">REMOTE</span>}
                  </div>

                  <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <MapPin size={14} /> {job.location}
                    </span>
                    {job.salary && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#38bdf8' }}>
                        <DollarSign size={14} /> {job.salary}
                      </span>
                    )}
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Calendar size={14} /> Posted {job.postedDate}
                    </span>
                  </div>
                </div>

                {/* Match Score Badge */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Your Profile Match
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color: job.matchPercentage >= 70 ? 'var(--success)' : '#818cf8' }}>
                    {job.matchPercentage}%
                  </div>
                  <div style={{ width: '100px', marginTop: '0.2rem' }}>
                    <ProgressBar percentage={job.matchPercentage} height={5} color={job.matchPercentage >= 70 ? 'success' : 'primary'} />
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: '1.5' }}>
                {job.description}
              </p>

              {/* Matched vs Missing Skills */}
              <div style={{ background: 'var(--bg-subtle)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                  {job.matchedSkills?.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--success)' }}>MATCHED:</span>
                      {job.matchedSkills.map((s, idx) => (
                        <span key={idx} className="badge badge-success" style={{ fontSize: '0.75rem' }}>
                          <CheckCircle2 size={11} /> {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {job.missingSkills?.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--danger)' }}>MISSING:</span>
                      {job.missingSkills.map((s, idx) => (
                        <span key={idx} className="badge badge-danger" style={{ fontSize: '0.75rem' }}>
                          <AlertCircle size={11} /> {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  onClick={() => handleToggleSave(job.id)}
                  className={`btn btn-sm ${job.saved ? 'btn-primary' : 'btn-secondary'}`}
                >
                  <Bookmark size={15} />
                  <span>{job.saved ? 'Saved' : 'Save Job'}</span>
                </button>

                <a
                  href={job.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                >
                  <span>Apply on Employer Portal</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          ))}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="btn btn-secondary btn-sm"
              >
                Previous
              </button>
              <span style={{ display: 'flex', alignItems: 'center', padding: '0 1rem', fontSize: '0.875rem' }}>
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="btn btn-secondary btn-sm"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JobMarket;
