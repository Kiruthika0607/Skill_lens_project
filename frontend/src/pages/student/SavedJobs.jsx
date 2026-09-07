import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Bookmark, MapPin, DollarSign, Calendar, ExternalLink, Trash2 } from 'lucide-react';
import { EmptyState, ProgressBar } from '../../components/common/UIComponents';

const SavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/jobs/saved');
      if (res.data.success) {
        setSavedJobs(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching saved jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (jobId) => {
    try {
      await api.post(`/jobs/${jobId}/save`);
      setSavedJobs(savedJobs.filter(j => j.id !== jobId));
    } catch (err) {
      console.error('Error removing job:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Saved Job Postings</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Jobs you've bookmarked for applications and interview preparation.
        </p>
      </div>

      {savedJobs.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No Saved Jobs Yet"
          message="When you browse the Job Market, click 'Save Job' to bookmark opportunities here."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {savedJobs.map((job) => (
            <div key={job.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>{job.title}</h3>
                    <span className="badge badge-primary">{job.company}</span>
                    {job.remote && <span className="badge badge-info">REMOTE</span>}
                  </div>

                  <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <MapPin size={14} /> {job.location}
                    </span>
                    {job.salary && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#38bdf8' }}>
                        <DollarSign size={14} /> {job.salary}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span className="badge badge-success" style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}>
                    {job.matchPercentage}% Profile Match
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button onClick={() => handleRemove(job.id)} className="btn btn-danger btn-sm">
                  <Trash2 size={14} /> Remove
                </button>
                <a href={job.applyUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                  <span>Apply Now</span> <ExternalLink size={14} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedJobs;
