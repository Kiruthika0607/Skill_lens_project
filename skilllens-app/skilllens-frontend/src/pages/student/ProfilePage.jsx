import React, { useState, useEffect } from 'react';
import {
  User,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Save,
  ExternalLink,
  Trash2,
  Plus,
  Clock,
  Sparkles
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Card, { CardHeader, CardBody } from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Skeleton from '../../components/common/Skeleton';
import ConfirmationModal from '../../components/common/ConfirmationModal';

export const ProfilePage = () => {
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Resume states
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [applyingSkills, setApplyingSkills] = useState(false);
  const [applySuccessMessage, setApplySuccessMessage] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    headline: '',
    university: '',
    major: '',
    graduationYear: '',
    gpa: '',
    bio: '',
    githubUrl: '',
    linkedinUrl: '',
    portfolioUrl: '',
  });

  const fetchProfileAndResumes = async () => {
    setLoading(true);
    try {
      const [profileRes, resumesRes] = await Promise.all([
        api.get('/student/profile'),
        api.get('/student/resume'),
      ]);

      const prof = profileRes.data;
      setProfile(prof);
      setFormData({
        firstName: prof.firstName || '',
        lastName: prof.lastName || '',
        headline: prof.headline || '',
        university: prof.university || '',
        major: prof.major || '',
        graduationYear: prof.graduationYear || '',
        gpa: prof.gpa || '',
        bio: prof.bio || '',
        githubUrl: prof.githubUrl || '',
        linkedinUrl: prof.linkedinUrl || '',
        portfolioUrl: prof.portfolioUrl || '',
      });

      const list = resumesRes.data || [];
      setResumes(list);
      if (list.length > 0) {
        setSelectedResume(list[0]);
      }
    } catch (err) {
      console.error('Failed to load profile data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndResumes();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await api.put('/student/profile', {
        ...formData,
        graduationYear: formData.graduationYear ? Number(formData.graduationYear) : null,
        gpa: formData.gpa ? Number(formData.gpa) : null,
      });
      setProfile(res.data);
      updateUser({ firstName: res.data.firstName, lastName: res.data.lastName });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError('');

    const form = new FormData();
    form.append('file', file);

    try {
      const res = await api.post('/student/resume/upload', form, {
        headers: { 'Content-Type': undefined },
      });
      setResumes((prev) => [res.data, ...prev]);
      setSelectedResume(res.data);
      setApplySuccessMessage('Resume parsed successfully! Skills and profile details automatically synchronized.');
      setTimeout(() => setApplySuccessMessage(''), 4000);
      fetchProfileAndResumes();
    } catch (err) {
      console.error('Upload failed:', err);
      const msg = err.response?.data?.message || err.response?.data?.error || (err.message === 'Network Error' ? 'Cannot connect to backend server.' : 'Failed to upload and parse resume. Please ensure file is PDF/DOCX.');
      setUploadError(msg);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleApplyExtractedSkills = async () => {
    if (!selectedResume) return;
    setApplyingSkills(true);
    try {
      await api.post(`/student/resume/${selectedResume.id}/apply-skills`);
      setApplyModalOpen(false);
      setApplySuccessMessage('Extracted skills successfully added to your profile inventory!');
      setTimeout(() => setApplySuccessMessage(''), 4000);
      fetchProfileAndResumes();
    } catch (err) {
      console.error('Failed to apply skills:', err);
    } finally {
      setApplyingSkills(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900 tracking-tight">Student Profile & Resume</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Maintain your academic details and upload engineering resumes for automated skill catalog extraction.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-medium">Profile successfully saved and updated!</span>
        </div>
      )}

      {applySuccessMessage && (
        <div className="p-4 rounded-xl bg-brand-50 border border-brand-200 flex items-center gap-3 text-brand-800 text-sm">
          <Sparkles className="w-5 h-5 text-brand-600 shrink-0" />
          <span className="font-medium">{applySuccessMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader
              title="Personal & Academic Information"
              subtitle="Keep your engineering specialization and GPA up to date"
            />
            <CardBody className="p-6">
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="block w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="block w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Professional Headline
                  </label>
                  <input
                    type="text"
                    value={formData.headline}
                    onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                    placeholder="e.g. Aspiring Backend Engineer | B.Tech CSE"
                    className="block w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      University / College
                    </label>
                    <input
                      type="text"
                      value={formData.university}
                      onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                      placeholder="e.g. National Institute of Technology"
                      className="block w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Degree / Major
                    </label>
                    <input
                      type="text"
                      value={formData.major}
                      onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                      placeholder="e.g. Computer Science and Engineering"
                      className="block w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Graduation Year
                    </label>
                    <input
                      type="number"
                      value={formData.graduationYear}
                      onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                      placeholder="2026"
                      className="block w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      CGPA / Percentage
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.gpa}
                      onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                      placeholder="8.75"
                      className="block w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Bio / Technical Summary
                  </label>
                  <textarea
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Brief summary of your technical interests, projects, and career aspirations..."
                    className="block w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      GitHub URL
                    </label>
                    <input
                      type="url"
                      value={formData.githubUrl}
                      onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                      placeholder="https://github.com/..."
                      className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      LinkedIn URL
                    </label>
                    <input
                      type="url"
                      value={formData.linkedinUrl}
                      onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                      placeholder="https://linkedin.com/in/..."
                      className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Portfolio URL
                    </label>
                    <input
                      type="url"
                      value={formData.portfolioUrl}
                      onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                      placeholder="https://..."
                      className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    loading={saving}
                    icon={Save}
                  >
                    Save Profile Changes
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>

        {/* Right Column (1 col): Resume Upload & Parsed Review */}
        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Resume Upload & Parser"
              subtitle="Apache Tika automated extraction"
            />
            <CardBody className="p-5">
              {uploadError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-slate-200 hover:border-brand-500 rounded-2xl p-6 text-center transition-colors bg-slate-50/50">
                <input
                  type="file"
                  id="resume-upload"
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
                <label
                  htmlFor="resume-upload"
                  className="cursor-pointer flex flex-col items-center justify-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-3">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-navy-900">
                    {uploading ? 'Analyzing document...' : 'Upload New Resume'}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1">
                    Supports PDF, DOCX (Max 10MB)
                  </span>
                </label>
              </div>

              {/* Uploaded Resumes List */}
              {resumes.length > 0 && (
                <div className="mt-5 space-y-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                    Uploaded Documents
                  </span>
                  {resumes.map((res) => (
                    <div
                      key={res.id}
                      onClick={() => setSelectedResume(res)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                        selectedResume?.id === res.id
                          ? 'border-brand-500 bg-brand-50/50'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                        <span className="text-xs font-medium text-navy-900 truncate">
                          {res.originalFilename}
                        </span>
                      </div>
                      <Badge
                        status={res.status}
                        label={res.status}
                        size="sm"
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Parsed Extracted Skills Viewer */}
          {selectedResume && (
            <Card>
              <CardHeader
                title="Extracted Skills"
                subtitle={`Matched ${selectedResume.extractedSkills?.length || 0} skills from ${selectedResume.originalFilename}`}
                action={
                  selectedResume.extractedSkills?.length > 0 && (
                    <Button
                      variant="brand"
                      size="sm"
                      icon={Plus}
                      onClick={() => setApplyModalOpen(true)}
                    >
                      Apply To Profile
                    </Button>
                  )
                }
              />
              <CardBody className="p-5">
                {selectedResume.extractedSkills?.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">
                    No technical skills recognized in this document.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {selectedResume.extractedSkills.map((sk, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs"
                      >
                        <div>
                          <span className="font-bold text-navy-900 block">{sk.skillName}</span>
                          <span className="text-[10px] text-slate-400">
                            {sk.category} • {sk.matchedOccurrences} occurrences
                          </span>
                        </div>
                        <Badge
                          status="ACTIVE"
                          label={`Suggested Lvl ${sk.suggestedProficiency}`}
                          size="sm"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      {/* Confirmation Dialog before applying skills */}
      <ConfirmationModal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        onConfirm={handleApplyExtractedSkills}
        title="Import Resume Skills"
        message={`Are you sure you want to import ${selectedResume?.extractedSkills?.length || 0} recognized skills into your student profile? Existing assessed proficiency records will be preserved.`}
        confirmText="Confirm Import"
        variant="primary"
        loading={applyingSkills}
      />
    </div>
  );
};

export default ProfilePage;
