import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { User, Save, CheckCircle2, Briefcase, GraduationCap, FileText } from 'lucide-react';

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [occupations, setOccupations] = useState([]);
  const [formData, setFormData] = useState({
    fullName: '',
    college: '',
    degree: '',
    department: '',
    graduationYear: 2026,
    cgpa: '',
    careerInterest: '',
    targetOccupationId: '',
    bio: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProfileAndOccupations();
  }, []);

  const fetchProfileAndOccupations = async () => {
    try {
      setLoading(true);
      const [profRes, occRes] = await Promise.all([
        api.get('/student/profile'),
        api.get('/occupations'),
      ]);

      if (profRes.data.success) {
        const p = profRes.data.data;
        setProfile(p);
        setFormData({
          fullName: p.fullName || '',
          college: p.college || '',
          degree: p.degree || '',
          department: p.department || '',
          graduationYear: p.graduationYear || 2026,
          cgpa: p.cgpa || '',
          careerInterest: p.careerInterest || '',
          targetOccupationId: p.targetOccupationId || '',
          bio: p.bio || '',
        });
      }

      if (occRes.data.success) {
        setOccupations(occRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const res = await api.put('/student/profile', formData);
      if (res.data.success) {
        setProfile(res.data.data);
        setMessage('Profile updated successfully! Career readiness calculations updated.');
        setTimeout(() => setMessage(''), 4000);
      }
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setSaving(false);
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
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Academic & Career Profile</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Manage your engineering background, GPA, and target career pathway.
        </p>
      </div>

      {message && (
        <div style={{
          background: 'var(--success-bg)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: 'var(--success)',
          fontSize: '0.9rem'
        }}>
          <CheckCircle2 size={18} />
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Academic Details Card */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <h3 className="card-title">
              <GraduationCap size={20} color="var(--accent-primary)" />
              Academic Credentials
            </h3>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="fullName"
                className="form-input"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">College / University</label>
              <input
                type="text"
                name="college"
                className="form-input"
                value={formData.college}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">Degree</label>
              <input
                type="text"
                name="degree"
                className="form-input"
                value={formData.degree}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Department</label>
              <input
                type="text"
                name="department"
                className="form-input"
                value={formData.department}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Graduation Year</label>
              <input
                type="number"
                name="graduationYear"
                className="form-input"
                value={formData.graduationYear}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Cumulative GPA / CGPA (out of 10.0)</label>
              <input
                type="number"
                step="0.01"
                name="cgpa"
                className="form-input"
                value={formData.cgpa}
                onChange={handleChange}
                placeholder="e.g. 8.75"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Registered Account Email</label>
              <input
                type="email"
                className="form-input"
                value={profile?.email || ''}
                disabled
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
            </div>
          </div>
        </div>

        {/* Target Career & Career Goals */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <h3 className="card-title">
              <Briefcase size={20} color="var(--accent-secondary)" />
              Career Focus & Goals
            </h3>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Target Industry Occupation</label>
              <select
                name="targetOccupationId"
                className="form-select"
                value={formData.targetOccupationId}
                onChange={handleChange}
                id="target-occupation-select"
              >
                <option value="">Select Target Occupation...</option>
                {occupations.map((occ) => (
                  <option key={occ.id} value={occ.id}>
                    {occ.title} ({occ.industryDemand} Demand)
                  </option>
                ))}
              </select>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                Your skill gap matrix and readiness scores will calculate against this career track.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Primary Career Interest Keywords</label>
              <input
                type="text"
                name="careerInterest"
                className="form-input"
                value={formData.careerInterest}
                onChange={handleChange}
                placeholder="e.g. Distributed Systems, Cloud Architecture, ML Ops"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Professional Bio / Resume Statement</label>
            <textarea
              name="bio"
              className="form-textarea"
              rows={4}
              value={formData.bio}
              onChange={handleChange}
              placeholder="Summary of engineering projects, internships, and research interests..."
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ padding: '0.85rem 2rem' }}
          disabled={saving}
          id="save-profile-btn"
        >
          {saving ? <div className="loading-spinner" style={{ width: '1.2rem', height: '1.2rem' }} /> : (
            <>
              <Save size={18} /> Save & Recalculate Career Path
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default StudentProfile;
