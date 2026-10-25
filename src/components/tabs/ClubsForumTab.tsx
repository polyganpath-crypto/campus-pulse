import React, { useState } from 'react';
import {
  Users,
  Lightbulb,
  MessageSquare,
  ThumbsUp,
  Plus,
  Calendar,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  X,
  Code2
} from 'lucide-react';
import { CampusClub, ProjectIdeaPost, UserProfile } from '../../types';
import { INITIAL_CLUBS, INITIAL_IDEAS } from '../../data/mockData';

interface ClubsForumTabProps {
  currentUser: UserProfile;
}

export const ClubsForumTab: React.FC<ClubsForumTabProps> = ({ currentUser }) => {
  const [clubs, setClubs] = useState<CampusClub[]>(INITIAL_CLUBS);
  const [ideas, setIdeas] = useState<ProjectIdeaPost[]>(INITIAL_IDEAS);
  const [activeView, setActiveView] = useState<'forum' | 'clubs'>('forum');
  const [showNewIdeaModal, setShowNewIdeaModal] = useState<boolean>(false);

  // New Idea form state
  const [title, setTitle] = useState<string>('');
  const [desc, setDesc] = useState<string>('');
  const [tags, setTags] = useState<string>('Next.js, Python, OpenCV');
  const [roles, setRoles] = useState<string>('ML Engineer, Frontend Dev');

  const handleToggleJoinClub = (clubId: string) => {
    setClubs((prev) =>
      prev.map((c) =>
        c.id === clubId
          ? {
              ...c,
              isJoined: !c.isJoined,
              membersCount: c.isJoined ? c.membersCount - 1 : c.membersCount + 1
            }
          : c
      )
    );
  };

  const handleUpvoteIdea = (ideaId: string) => {
    setIdeas((prev) =>
      prev.map((idea) => {
        if (idea.id === ideaId) {
          const hasUpvoted = idea.hasUpvoted;
          return {
            ...idea,
            hasUpvoted: !hasUpvoted,
            upvotes: hasUpvoted ? idea.upvotes - 1 : idea.upvotes + 1
          };
        }
        return idea;
      })
    );
  };

  const handlePostIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newIdea: ProjectIdeaPost = {
      id: `idea-${Date.now()}`,
      authorName: currentUser.name,
      authorRoll: currentUser.rollNumber || '22CS084',
      authorAvatar: currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      title,
      description: desc,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      rolesNeeded: roles.split(',').map((r) => r.trim()).filter(Boolean),
      upvotes: 1,
      hasUpvoted: true,
      commentsCount: 0,
      createdAt: 'Just now'
    };

    setIdeas([newIdea, ...ideas]);
    setShowNewIdeaModal(false);
    setTitle('');
    setDesc('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-violet-50 text-violet-800 border border-violet-200 uppercase tracking-wide">
              Student Innovation & Technical Communities
            </span>
            <span className="text-xs text-slate-500">Peer Collaboration Hub</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-2">Campus Clubs & Project Idea Exchange</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Pitch hackathon projects, recruit skilled teammates for capstone projects, and engage with official university technical societies and coding clubs.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveView('forum')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeView === 'forum'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ideas & Teams
            </button>
            <button
              onClick={() => setActiveView('clubs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeView === 'clubs'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Campus Clubs ({clubs.length})
            </button>
          </div>

          <button
            onClick={() => setShowNewIdeaModal(true)}
            className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Post Project Pitch</span>
          </button>
        </div>
      </div>

      {/* Ideas Exchange View */}
      {activeView === 'forum' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ideas.map((idea) => (
              <div
                key={idea.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-violet-300 transition-all"
              >
                <div>
                  {/* Author Meta */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={idea.authorAvatar}
                        alt={idea.authorName}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{idea.authorName}</h4>
                        <p className="text-[11px] text-slate-500 font-mono">{idea.authorRoll} • {idea.createdAt}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleUpvoteIdea(idea.id)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        idea.hasUpvoted
                          ? 'bg-violet-50 text-violet-700 border-violet-200 shadow-2xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${idea.hasUpvoted ? 'fill-violet-700 text-violet-700' : ''}`} />
                      <span>{idea.upvotes}</span>
                    </button>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mt-3">{idea.title}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{idea.description}</p>

                  {/* Tech stack tags */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {idea.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700 border border-slate-200"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Roles Needed */}
                  <div className="mt-3 p-3 rounded-xl bg-violet-50/50 border border-violet-100 text-xs">
                    <span className="font-bold text-violet-900">Seeking Teammates:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {idea.rolesNeeded.map((role, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-white text-violet-700 border border-violet-200 shadow-2xs"
                        >
                          + {role}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">
                    {idea.commentsCount} comments & team invites
                  </span>
                  <button
                    onClick={() => alert(`Connection request sent to ${idea.authorName}! Direct message thread initiated.`)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Connect with Creator →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clubs Directory View */}
      {activeView === 'clubs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clubs.map((club) => (
            <div
              key={club.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-violet-300 transition-all"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2 rounded-xl bg-slate-50 border border-slate-200">
                      {club.badgeEmoji}
                    </span>
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-violet-50 text-violet-700 border border-violet-200">
                        {club.category}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 mt-1">{club.name}</h3>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-slate-500">
                    {club.membersCount} Members
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-3 leading-relaxed">{club.description}</p>

                <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                  <p><strong>Faculty Mentor:</strong> {club.facultyCoordinator}</p>
                  <p className="flex items-center gap-1.5 text-indigo-700 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Next Activity: {club.upcomingActivity}</span>
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">Campus Recognized Chapter</span>
                <button
                  onClick={() => handleToggleJoinClub(club.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    club.isJoined
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-violet-600 hover:bg-violet-700 text-white shadow-xs'
                  }`}
                >
                  {club.isJoined ? 'Member Joined ✓' : 'Join Chapter +'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Project Idea Modal */}
      {showNewIdeaModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-violet-600" />
                <h3 className="font-bold text-slate-900 text-sm">Post a Technical Project Pitch</h3>
              </div>
              <button
                onClick={() => setShowNewIdeaModal(false)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePostIdea} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Project Title:
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Distributed Edge Video Analytics for Traffic..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-violet-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description & Objective:
                </label>
                <textarea
                  rows={3}
                  required
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Explain the problem statement, planned architecture, and target hackathon..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-violet-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tech Stack Tags (comma separated):
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="React, FastAPI, Docker, PyTorch"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-violet-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Teammate Roles Needed (comma separated):
                </label>
                <input
                  type="text"
                  value={roles}
                  onChange={(e) => setRoles(e.target.value)}
                  placeholder="Backend Developer, UI Designer, Data Analyst"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-violet-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewIdeaModal(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors shadow-sm cursor-pointer"
                >
                  Publish to Campus Hub
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
