import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Search,
  PlusCircle,
  Users,
  ArrowRight,
  Sparkles,
  Loader2,
} from 'lucide-react';
import api from '../api/client.js';

const CATEGORIES = [
  'All',
  'Web App',
  'Mobile App',
  'AI/ML',
  'Blockchain',
  'Cybersecurity',
  'IoT / Hardware',
  'Game Dev',
  'Open Source',
  'Research',
];

export const DiscoverProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });

  useEffect(() => {
    fetchProjects();
  }, [selectedCategory, selectedSkill, page]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 9);

      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (selectedSkill) params.append('skill', selectedSkill);
      if (searchTerm) params.append('search', searchTerm);

      const res = await api.get(`/projects?${params.toString()}`);
      if (res.success && res.data?.items) {
        setProjects(res.data.items);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProjects();
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F4F7F2] flex items-center gap-2">
            <Compass className="w-6 h-6 text-[#B7FF5A]" />
            <span>Discover Projects</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#A1AAA0]">
            Explore collaborative student initiatives and join teams building real software
          </p>
        </div>

        <Link
          to="/projects/create"
          className="inline-flex items-center gap-2 rounded-xl bg-[#B7FF5A] px-4 py-2.5 text-xs font-bold text-[#090B0A] hover:bg-[#CAFF8C] transition-all shadow-sm whitespace-nowrap self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4 stroke-[2.5]" />
          <span>Post a Project</span>
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#101310] border border-[#282F28] shadow-card space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#70796F] absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search projects by title, keywords, or tags..."
              className="w-full rounded-xl border border-[#282F28] bg-[#151915] pl-10 pr-3.5 py-2 text-sm text-[#F4F7F2] placeholder-[#70796F] focus:outline-none focus:border-[#B7FF5A] focus:ring-1 focus:ring-[#B7FF5A]"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-[#B7FF5A] px-4 py-2 text-xs font-bold text-[#090B0A] hover:bg-[#CAFF8C] transition-colors"
          >
            Search
          </button>
        </form>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setPage(1);
              }}
              className={`rounded-xl px-3 py-1.5 font-semibold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#B7FF5A] text-[#090B0A]'
                  : 'bg-[#151915] text-[#A1AAA0] border border-[#282F28] hover:text-[#F4F7F2] hover:border-[#384238]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-[#151915] border border-[#282F28] animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#151915] border border-[#282F28] space-y-3">
          <Compass className="w-10 h-10 text-[#70796F] mx-auto" />
          <h3 className="text-base font-bold text-[#F4F7F2]">
            No projects found matching your search.
          </h3>
          <p className="text-xs text-[#70796F] max-w-sm mx-auto">
            Try adjusting your category filter, clearing your keywords, or start your own project!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => (
            <div
              key={project._id}
              className="p-5 rounded-2xl bg-[#151915] border border-[#282F28] shadow-card hover:border-[#384238] transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#1B211B] text-[#A1AAA0] border border-[#282F28]">
                    {project.category}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      project.status === 'published'
                        ? 'bg-[#B7FF5A]/10 text-[#B7FF5A] border-[#B7FF5A]/30'
                        : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {project.status.toUpperCase()}
                  </span>
                </div>

                <Link
                  to={`/projects/${project._id}`}
                  className="block text-base font-bold text-[#F4F7F2] group-hover:text-[#B7FF5A] transition-colors line-clamp-1"
                >
                  {project.title}
                </Link>

                <p className="text-xs text-[#A1AAA0] line-clamp-3 leading-relaxed">
                  {project.description}
                </p>

                {/* Required Skills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(project.requiredSkills || []).slice(0, 4).map((skill) => (
                    <span
                      key={skill}
                      className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#1B211B] text-[#A1AAA0] border border-[#282F28]"
                    >
                      {skill}
                    </span>
                  ))}
                  {(project.requiredSkills || []).length > 4 && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 text-[#70796F]">
                      +{project.requiredSkills.length - 4}
                    </span>
                  )}
                </div>

                {/* Open Positions Summary */}
                {project.openPositions && project.openPositions.length > 0 && (
                  <div className="pt-1 text-xs text-[#70796F]">
                    <span className="font-semibold text-[#A1AAA0]">
                      Looking for:{' '}
                    </span>
                    {project.openPositions
                      .map((p) => p.role)
                      .slice(0, 2)
                      .join(', ')}
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="mt-5 pt-3 border-t border-[#282F28] flex items-center justify-between text-xs text-[#70796F]">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-[#1B211B] border border-[#282F28] text-[#B7FF5A] font-bold text-[10px] flex items-center justify-center uppercase overflow-hidden">
                    {project.owner?.avatar ? (
                      <img src={project.owner.avatar} alt="" className="h-full w-full object-cover" />
                    ) : (
                      project.owner?.name?.charAt(0) || 'U'
                    )}
                  </div>
                  <span className="truncate max-w-[110px] text-[#A1AAA0]">{project.owner?.name}</span>
                </div>

                <Link
                  to={`/projects/${project._id}`}
                  className="font-bold text-[#B7FF5A] hover:underline flex items-center gap-1"
                >
                  <span>Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="btn-secondary text-xs px-3.5 py-1.5"
          >
            Previous
          </button>
          <span className="text-xs font-semibold text-[#70796F]">
            Page {page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, pagination.totalPages))}
            disabled={page === pagination.totalPages}
            className="btn-secondary text-xs px-3.5 py-1.5"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default DiscoverProjects;
