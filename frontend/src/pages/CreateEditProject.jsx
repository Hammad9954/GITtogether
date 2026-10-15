import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trash2, Loader2, ArrowLeft, Plus } from 'lucide-react';
import api from '../api/client.js';
import { useToast } from '../context/ToastContext.jsx';

const CATEGORIES = [
  'Web App',
  'Mobile App',
  'AI/ML',
  'Blockchain',
  'Cybersecurity',
  'IoT / Hardware',
  'Game Dev',
  'Open Source',
  'Research',
  'Other',
];

export const CreateEditProject = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Web App',
    requiredSkills: [],
    openPositions: [{ role: 'Frontend Developer', count: 1, description: '' }],
    teamSize: 4,
    deadline: '',
    githubUrl: '',
    liveUrl: '',
    status: 'published',
  });

  useEffect(() => {
    if (isEdit) {
      fetchProjectToEdit();
    }
  }, [id]);

  const fetchProjectToEdit = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/projects/${id}`);
      if (res.success && res.data?.project) {
        const p = res.data.project;
        setFormData({
          title: p.title || '',
          description: p.description || '',
          category: p.category || 'Web App',
          requiredSkills: p.requiredSkills || [],
          openPositions: p.openPositions?.length ? p.openPositions : [{ role: 'Developer', count: 1, description: '' }],
          teamSize: p.teamSize || 4,
          deadline: p.deadline ? p.deadline.split('T')[0] : '',
          githubUrl: p.githubUrl || '',
          liveUrl: p.liveUrl || '',
          status: p.status || 'published',
        });
      }
    } catch (err) {
      toast.error('Failed to load project details for editing');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmed = skillInput.trim().toLowerCase();
      if (trimmed && !formData.requiredSkills.includes(trimmed)) {
        setFormData({
          ...formData,
          requiredSkills: [...formData.requiredSkills, trimmed],
        });
        setSkillInput('');
      }
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      requiredSkills: formData.requiredSkills.filter((s) => s !== skillToRemove),
    });
  };

  const addPosition = () => {
    setFormData({
      ...formData,
      openPositions: [...formData.openPositions, { role: '', count: 1, description: '' }],
    });
  };

  const updatePosition = (index, field, value) => {
    const updated = [...formData.openPositions];
    updated[index][field] = value;
    setFormData({ ...formData, openPositions: updated });
  };

  const removePosition = (index) => {
    setFormData({
      ...formData,
      openPositions: formData.openPositions.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      toast.error('Please enter a title and description');
      return;
    }

    try {
      setSubmitting(true);
      if (isEdit) {
        const res = await api.put(`/projects/${id}`, formData);
        if (res.success) {
          toast.success('Project updated successfully!');
          navigate(`/projects/${id}`);
        }
      } else {
        const res = await api.post('/projects', formData);
        if (res.success && res.data?.project) {
          toast.success('Project and team workspace created!');
          navigate(`/projects/${res.data.project._id}`);
        }
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save project');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#B7FF5A] mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in py-4 px-4">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A1AAA0] hover:text-[#F4F7F2] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F4F7F2]">
          {isEdit ? 'Edit Project' : 'Create a New Project'}
        </h1>
        <p className="text-xs sm:text-sm text-[#A1AAA0]">
          Share your concept and assemble teammates with complementary skills
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-6 sm:p-8 rounded-2xl bg-[#151915] border border-[#282F28] shadow-card space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-[#A1AAA0] mb-1.5">
              Project Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. EduFlow: Adaptive Socratic STEM Tutor"
              className="input-surface"
            />
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#A1AAA0] mb-1.5">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input-surface"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A1AAA0] mb-1.5">
                Visibility / Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="input-surface"
              >
                <option value="published">Published (Accepting Applications)</option>
                <option value="paused">Paused</option>
                <option value="draft">Draft (Hidden)</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[#A1AAA0] mb-1.5">
              Description & Objectives *
            </label>
            <textarea
              rows={5}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What problem does this project solve? What is the planned architecture? What milestone are you aiming for?"
              className="input-surface resize-none"
            />
          </div>

          {/* Required Skills Tag Input */}
          <div>
            <label className="block text-xs font-semibold text-[#A1AAA0] mb-1.5">
              Required Skills (Type skill and press Enter)
            </label>
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleAddSkill}
              placeholder="e.g. react, python, pytorch, figma..."
              className="input-surface"
            />
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {formData.requiredSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-[#1B211B] text-[#B7FF5A] border border-[#282F28] font-medium"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="text-[#70796F] hover:text-rose-400 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Target Team Size & Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#A1AAA0] mb-1.5">
                Target Team Size (2 - 20)
              </label>
              <input
                type="number"
                min={2}
                max={20}
                value={formData.teamSize}
                onChange={(e) => setFormData({ ...formData, teamSize: parseInt(e.target.value, 10) || 4 })}
                className="input-surface"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A1AAA0] mb-1.5">
                Target Deadline
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="input-surface"
              />
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#A1AAA0] mb-1.5">
                GitHub Repository URL
              </label>
              <input
                type="url"
                value={formData.githubUrl}
                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                placeholder="https://github.com/..."
                className="input-surface"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A1AAA0] mb-1.5">
                Live Prototype / Demo URL
              </label>
              <input
                type="url"
                value={formData.liveUrl}
                onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                placeholder="https://myproject.vercel.app"
                className="input-surface"
              />
            </div>
          </div>
        </div>

        {/* Open Positions Builder */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#151915] border border-[#282F28] shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#F4F7F2]">
              Open Positions You Need Filled
            </h3>
            <button
              type="button"
              onClick={addPosition}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#B7FF5A] hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Position</span>
            </button>
          </div>

          <div className="space-y-3">
            {formData.openPositions.map((pos, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[#101310] border border-[#282F28] flex flex-col sm:flex-row items-start sm:items-center gap-3"
              >
                <div className="flex-1 w-full space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Role title (e.g. Backend Lead, UI Designer)"
                      value={pos.role}
                      onChange={(e) => updatePosition(idx, 'role', e.target.value)}
                      className="flex-1 rounded-xl border border-[#282F28] bg-[#151915] px-3 py-1.5 text-xs font-bold text-[#F4F7F2] placeholder-[#70796F] focus:outline-none focus:border-[#B7FF5A]"
                    />
                    <input
                      type="number"
                      min={1}
                      max={10}
                      title="Spots count"
                      value={pos.count}
                      onChange={(e) => updatePosition(idx, 'count', parseInt(e.target.value, 10) || 1)}
                      className="w-20 rounded-xl border border-[#282F28] bg-[#151915] px-3 py-1.5 text-xs text-[#F4F7F2] focus:outline-none focus:border-[#B7FF5A] text-center"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Short description of responsibilities..."
                    value={pos.description}
                    onChange={(e) => updatePosition(idx, 'description', e.target.value)}
                    className="w-full rounded-xl border border-[#282F28] bg-[#151915] px-3 py-1.5 text-xs text-[#A1AAA0] placeholder-[#70796F] focus:outline-none focus:border-[#B7FF5A]"
                  />
                </div>

                {formData.openPositions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePosition(idx)}
                    className="p-1.5 text-[#70796F] hover:text-rose-400 rounded-lg hover:bg-[#1B211B] self-end sm:self-center transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin text-[#090B0A]" />}
            <span>{isEdit ? 'Save Changes' : 'Create & Launch Team'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEditProject;
