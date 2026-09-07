import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Layers, Plus, Trash2, CheckCircle2, AlertCircle, Sparkles, Filter } from 'lucide-react';

const SkillProfile = () => {
  const [profile, setProfile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [proficiency, setProficiency] = useState('INTERMEDIATE');
  const [yearsExp, setYearsExp] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfileAndCategories();
  }, []);

  const fetchProfileAndCategories = async () => {
    try {
      setLoading(true);
      const [profRes, catRes] = await Promise.all([
        api.get('/student/profile'),
        api.get('/skills/categories'),
      ]);

      if (profRes.data.success) setProfile(profRes.data.data);
      if (catRes.data.success) setCategories(catRes.data.data);
    } catch (err) {
      console.error('Error fetching skills:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!skillInput.trim()) return;

    setSubmitting(true);
    setError('');
    setFeedback(null);

    try {
      const res = await api.post('/student/skills', {
        skillName: skillInput.trim(),
        proficiencyLevel: proficiency,
        yearsExperience: yearsExp,
      });

      if (res.data.success) {
        setProfile(res.data.data);
        setFeedback(`Skill "${skillInput}" was successfully normalized and saved into your master profile!`);
        setSkillInput('');
        setTimeout(() => setFeedback(null), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Could not add skill');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickAdd = async (canonicalName) => {
    setSkillInput(canonicalName);
  };

  const handleRemoveSkill = async (skillId) => {
    try {
      const res = await api.delete(`/student/skills/${skillId}`);
      if (res.data.success) {
        setProfile(res.data.data);
      }
    } catch (err) {
      console.error('Error removing skill:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  const studentSkills = profile?.skills || [];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Technical Skills Portfolio</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Add your technical capabilities. Variations (e.g. "JS", "Java Script") are automatically normalized into canonical industry skills.
        </p>
      </div>

      {feedback && (
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
          <span>{feedback}</span>
        </div>
      )}

      {error && (
        <div style={{
          background: 'var(--danger-bg)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: 'var(--danger)',
          fontSize: '0.9rem'
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Add Skill Form with Normalization */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h3 className="card-title">
            <Sparkles size={20} color="var(--accent-primary)" />
            Add Skill with Smart Normalization
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Try typing: "JS", "ML", "ReactJS", "K8s", "Postgres"
          </span>
        </div>

        <form onSubmit={handleAddSkill}>
          <div className="grid-3" style={{ alignItems: 'flex-end' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Skill Name or Alias</label>
              <input
                type="text"
                className="form-input"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="e.g. JavaScript, ML, Docker"
                required
                id="add-skill-input"
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Proficiency Level</label>
              <select
                className="form-select"
                value={proficiency}
                onChange={(e) => setProficiency(e.target.value)}
              >
                <option value="BEGINNER">Beginner (Foundational)</option>
                <option value="INTERMEDIATE">Intermediate (Competent)</option>
                <option value="ADVANCED">Advanced (Production Experience)</option>
              </select>
            </div>

            <div>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', height: '42px' }}
                disabled={submitting}
                id="add-skill-btn"
              >
                {submitting ? <div className="loading-spinner" style={{ width: '1.2rem', height: '1.2rem' }} /> : (
                  <>
                    <Plus size={18} /> Add & Normalize Skill
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Current Verified Skills */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h3 className="card-title">
            <Layers size={20} color="var(--accent-secondary)" />
            My Verified Technical Skills ({studentSkills.length})
          </h3>
        </div>

        {studentSkills.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
            No skills added yet. Type a skill above or click quick tags from the taxonomy below.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {studentSkills.map((ss) => (
              <div key={ss.id} style={{
                padding: '1rem',
                background: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{ss.skillName}</div>
                  <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.35rem' }}>
                    <span className="badge badge-primary">{ss.categoryName}</span>
                    <span className="badge badge-info">{ss.proficiencyLevel}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveSkill(ss.skillId)}
                  className="btn btn-danger btn-sm"
                  title="Remove Skill"
                  style={{ padding: '0.35rem', borderRadius: 'var(--radius-sm)' }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Taxonomy Browser */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Filter size={18} color="var(--text-secondary)" />
            Quick-Add from Verified Industry Taxonomy
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {categories.map((cat) => (
            <div key={cat.id}>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: '700' }}>
                {cat.name}
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {cat.skills?.map((s) => {
                  const alreadyHas = studentSkills.some(ss => ss.skillId === s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => !alreadyHas && handleQuickAdd(s.name)}
                      className={`btn btn-sm ${alreadyHas ? 'btn-secondary' : 'btn-secondary'}`}
                      style={{
                        opacity: alreadyHas ? 0.45 : 1,
                        cursor: alreadyHas ? 'default' : 'pointer',
                        borderColor: alreadyHas ? 'transparent' : 'var(--border-card)'
                      }}
                      disabled={alreadyHas}
                    >
                      {alreadyHas ? <CheckCircle2 size={12} color="var(--success)" /> : <Plus size={12} />}
                      {s.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkillProfile;
