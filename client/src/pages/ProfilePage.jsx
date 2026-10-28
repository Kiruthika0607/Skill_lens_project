import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Building2, 
  BookOpen, 
  GraduationCap, 
  Mail, 
  Upload, 
  FileText, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Save, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { SkeletonLoader, StatusBadge, ConfirmationDialog } from '../components/UIState';

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [resumeParsing, setResumeParsing] = useState(false);
  const [resumeParsedSkills, setResumeParsedSkills] = useState([]);

  // Confirmation dialog state
  const [deleteSkillModal, setDeleteSkillModal] = useState({ open: false, skillId: null, skillName: '' });

  // New skill input
  const [newSkillName, setNewSkillName] = useState('');

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/student/profile');
      setProfile(res.data.student);
      setSkills(res.data.skills || []);
    } catch (err) {
      setErrorMsg('Failed to load profile details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await axios.put('/student/profile', profile);
      setProfile(res.data.student);
      setSuccessMsg('Profile details successfully updated.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResumeParsing(true);
    setErrorMsg('');
    try {
      // Simulate resume parsing endpoint
      await new Promise((r) => setTimeout(r, 1200));
      const extracted = ['React.js', 'Node.js', 'PostgreSQL', 'TypeScript', 'Docker', 'RESTful APIs', 'Git'];
      setResumeParsedSkills(extracted);
      setSuccessMsg(`Parsed ${extracted.length} skills from ${file.name}.`);
    } catch (err) {
      setErrorMsg('Error processing resume file.');
    } finally {
      setResumeParsing(false);
    }
  };

  const handleAddExtractedSkill = (skillName) => {
    if (!skills.some((s) => s.name?.toLowerCase() === skillName.toLowerCase())) {
      setSkills([...skills, { id: `sk_${Date.now()}_${Math.random()}`, name: skillName, proficiency_level: 3.5, category: 'Software Engineering' }]);
    }
    setResumeParsedSkills(resumeParsedSkills.filter((s) => s !== skillName));
  };

  const handleAddManualSkill = (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    setSkills([...skills, { id: `sk_${Date.now()}`, name: newSkillName.trim(), proficiency_level: 3.0, category: 'Custom' }]);
    setNewSkillName('');
  };

  const confirmDeleteSkill = () => {
    setSkills(skills.filter((s) => s.id !== deleteSkillModal.skillId));
    setDeleteSkillModal({ open: false, skillId: null, skillName: '' });
  };

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <SkeletonLoader count={4} className="h-28" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-100">
            Student Identity
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-900 mt-2">
            Profile & Resume Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Keep your academic background and verified competencies current for accurate job matching
          </p>
        </div>

        <button
          onClick={handleProfileSave}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-brand-800 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-brand-900/20 transition disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Profile Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info Form (2 cols) */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-brand-700" />
              Academic Credentials
            </h2>

            <form onSubmit={handleProfileSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profile?.full_name || ''}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-600 focus:ring-2 focus:ring-brand-100 text-sm outline-none transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    College / Institution
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={profile?.college || ''}
                      onChange={(e) => setProfile({ ...profile, college: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-600 focus:ring-2 focus:ring-brand-100 text-sm outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Discipline / Specialization
                  </label>
                  <div className="relative">
                    <BookOpen className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={profile?.discipline || ''}
                      onChange={(e) => setProfile({ ...profile, discipline: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-600 focus:ring-2 focus:ring-brand-100 text-sm outline-none transition"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Graduation Year
                  </label>
                  <div className="relative">
                    <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <select
                      value={profile?.graduation_year || 2026}
                      onChange={(e) => setProfile({ ...profile, graduation_year: parseInt(e.target.value) })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-600 focus:ring-2 focus:ring-brand-100 text-sm outline-none bg-white transition"
                    >
                      <option value={2025}>2025</option>
                      <option value={2026}>2026</option>
                      <option value={2027}>2027</option>
                      <option value={2028}>2028</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Preferred Career Domain
                  </label>
                  <select
                    value={profile?.preferred_domain || 'Full Stack Web Development'}
                    onChange={(e) => setProfile({ ...profile, preferred_domain: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-600 focus:ring-2 focus:ring-brand-100 text-sm outline-none bg-white transition"
                  >
                    <option value="Full Stack Web Development">Full Stack Web Development</option>
                    <option value="Cloud & DevOps Engineering">Cloud & DevOps Engineering</option>
                    <option value="Data Science & AI/ML">Data Science & AI/ML</option>
                    <option value="Mobile App Development">Mobile App Development</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                  </select>
                </div>
              </div>
            </form>
          </div>

          {/* Known Skills List */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Registered Skills & Proficiencies</h2>
                <p className="text-xs text-slate-500">Skills credited to your profile portfolio</p>
              </div>

              {/* Add skill form */}
              <form onSubmit={handleAddManualSkill} className="flex items-center gap-2">
                <input
                  type="text"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  placeholder="e.g. Docker, GraphQL"
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-brand-600"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-brand-800 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </form>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {skills.map((s) => (
                <div
                  key={s.id}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900">{s.name}</p>
                    <span className="text-[11px] text-slate-500">
                      Proficiency: {s.proficiency_level ? `${s.proficiency_level}/5.0` : 'Self-declared'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusBadge status="ACTIVE" label={s.proficiency_level >= 3.5 ? 'Proficient' : 'Learning'} size="sm" />
                    <button
                      onClick={() => setDeleteSkillModal({ open: true, skillId: s.id, skillName: s.name })}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                      title="Remove skill"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Resume Analyzer Panel (1 col) */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-700" />
              Resume Parser
            </h2>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Upload your engineering resume (PDF, DOCX, or TXT) to automatically extract validated skills and match against live job requirements.
            </p>

            <label className="border-2 border-dashed border-blue-200 hover:border-brand-600 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-[#F0F7FF] transition group">
              <Upload className="w-8 h-8 text-brand-600 mb-2 group-hover:scale-110 transition" />
              <span className="text-xs font-bold text-slate-900">
                {resumeParsing ? 'Analyzing Document...' : 'Choose Resume File'}
              </span>
              <span className="text-[10px] text-slate-500 mt-1">PDF, DOCX up to 5MB</span>
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleResumeUpload}
                disabled={resumeParsing}
                className="hidden"
              />
            </label>

            {/* Extracted Skills Preview */}
            {resumeParsedSkills.length > 0 && (
              <div className="mt-5 p-4 rounded-2xl bg-blue-50/70 border border-blue-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-brand-900 mb-2">
                  <Sparkles className="w-4 h-4 text-brand-600" />
                  <span>Detected Skills (Click to Add to Portfolio):</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {resumeParsedSkills.map((sk, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAddExtractedSkill(sk)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-xs font-semibold text-brand-900 hover:bg-blue-600 hover:text-white transition flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      {sk}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-5 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-md">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Audit & Verification
            </span>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Every self-reported or resume-extracted skill can be officially verified through our interactive adaptive assessments.
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteSkillModal.open}
        title="Remove Skill from Portfolio"
        message={`Are you sure you want to remove "${deleteSkillModal.skillName}"? This will recalculate your career gap analysis.`}
        confirmText="Remove Skill"
        isDanger={true}
        onConfirm={confirmDeleteSkill}
        onCancel={() => setDeleteSkillModal({ open: false, skillId: null, skillName: '' })}
      />
    </div>
  );
}
