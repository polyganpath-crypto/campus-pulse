import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Award,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Users,
  MessageSquare,
  Layers,
  Send,
  ThumbsUp,
  Code2,
  Cpu,
  Flame,
  Database,
  TrendingUp,
  ArrowRight,
  FolderGit2,
  CheckSquare,
  Square,
  Briefcase,
  ShieldCheck,
  Search,
  BookOpen
} from 'lucide-react';
import {
  UserProfile,
  EngineeringBranchId,
  BranchProjectItem,
  ProjectSquadMessage,
  UserSelectedProject
} from '../../types';
import {
  ENGINEERING_BRANCHES,
  BRANCH_PROJECTS,
  INITIAL_SQUAD_MESSAGES
} from '../../data/branchProjectsData';

interface BranchProjectSelectionSectionProps {
  currentUser: UserProfile;
}

export const BranchProjectSelectionSection: React.FC<BranchProjectSelectionSectionProps> = ({
  currentUser
}) => {
  // Map user department to initial branch if available
  const getInitialBranch = (): EngineeringBranchId => {
    const dept = (currentUser.department || '').toLowerCase();
    if (dept.includes('cse') || dept.includes('computer') || dept.includes('information')) {
      return 'CSE_IT';
    }
    if (dept.includes('ai') || dept.includes('data') || dept.includes('aiml')) {
      return 'AIML_DS';
    }
    if (dept.includes('ece') || dept.includes('electronic')) {
      return 'ECE_EMBEDDED';
    }
    if (dept.includes('eee') || dept.includes('electrical')) {
      return 'EEE_SMART';
    }
    if (dept.includes('mech')) {
      return 'MECH_ROBOTICS';
    }
    if (dept.includes('civil')) {
      return 'CIVIL_GIS';
    }
    return 'ALL';
  };

  const [selectedBranch, setSelectedBranch] = useState<EngineeringBranchId>(getInitialBranch());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeProjectId, setActiveProjectId] = useState<string>(BRANCH_PROJECTS[0].id);

  // User's selected project stored in state and localStorage
  const [userSelectedProject, setUserSelectedProject] = useState<UserSelectedProject>(() => {
    try {
      const saved = localStorage.getItem(`user_selected_project_${currentUser.id}`);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      projectId: 'proj-cse-distributed-queue',
      selectedAt: 'Selected Recently',
      currentMilestoneStep: 2,
      completedMilestones: [1],
      repoUrl: 'https://github.com/my-profile/distributed-rate-limiter',
      personalNotes: 'Focusing on Redis Lua atomic script benchmarks before on-campus drives.'
    };
  });

  // Squad discussions
  const [squadMessages, setSquadMessages] = useState<ProjectSquadMessage[]>(INITIAL_SQUAD_MESSAGES);
  const [newSquadMessageText, setNewSquadMessageText] = useState<string>('');

  // Project details sub-tabs: 'overview' | 'architecture' | 'milestones' | 'resume-bullets' | 'interview-prep' | 'squad-room'
  const [detailTab, setDetailTab] = useState<'overview' | 'architecture' | 'milestones' | 'resume-bullets' | 'interview-prep' | 'squad-room'>('overview');

  // Copy indicator for resume bullets
  const [copiedBulletId, setCopiedBulletId] = useState<string | null>(null);

  // Save selected project to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`user_selected_project_${currentUser.id}`, JSON.stringify(userSelectedProject));
    } catch {
      // ignore
    }
  }, [userSelectedProject, currentUser.id]);

  // Handle selecting a project as My Official Placement Project
  const handleSelectProject = (project: BranchProjectItem) => {
    const isCurrentlySelected = userSelectedProject.projectId === project.id;
    if (isCurrentlySelected) return;

    setUserSelectedProject({
      projectId: project.id,
      selectedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      currentMilestoneStep: 1,
      completedMilestones: [],
      repoUrl: '',
      personalNotes: `Started project for ${project.branchLabel} placement preparation target.`
    });
  };

  // Toggle milestone completion
  const handleToggleMilestone = (stepNumber: number) => {
    setUserSelectedProject((prev) => {
      const isDone = prev.completedMilestones.includes(stepNumber);
      const newCompleted = isDone
        ? prev.completedMilestones.filter((s) => s !== stepNumber)
        : [...prev.completedMilestones, stepNumber];
      return {
        ...prev,
        completedMilestones: newCompleted,
        currentMilestoneStep: Math.min(4, Math.max(1, newCompleted.length + 1))
      };
    });
  };

  // Update repository URL
  const handleSaveRepoUrl = (url: string) => {
    setUserSelectedProject((prev) => ({ ...prev, repoUrl: url }));
  };

  // Copy resume bullet to clipboard
  const handleCopyBullet = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBulletId(id);
    setTimeout(() => setCopiedBulletId(null), 2500);
  };

  // Post message to project squad
  const handleSendSquadMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSquadMessageText.trim()) return;

    const newMsg: ProjectSquadMessage = {
      id: `squad-msg-${Date.now()}`,
      projectId: activeProjectId,
      authorName: currentUser.name,
      authorBranch: `${currentUser.department || 'Student'} (You)`,
      authorAvatar: currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      timestamp: 'Just now',
      message: newSquadMessageText.trim(),
      likes: 1,
      hasLiked: true
    };

    setSquadMessages([newMsg, ...squadMessages]);
    setNewSquadMessageText('');
  };

  // Like a squad message
  const handleToggleLikeSquadMsg = (msgId: string) => {
    setSquadMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === msgId) {
          const hasLiked = msg.hasLiked;
          return {
            ...msg,
            hasLiked: !hasLiked,
            likes: hasLiked ? Math.max(0, msg.likes - 1) : msg.likes + 1
          };
        }
        return msg;
      })
    );
  };

  // Filter projects by branch and search
  const filteredProjects = BRANCH_PROJECTS.filter((proj) => {
    const matchesBranch = selectedBranch === 'ALL' || proj.branch === selectedBranch;
    const matchesSearch =
      searchQuery.trim() === '' ||
      proj.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.techStack.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      proj.targetCompanies.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase())) ||
      proj.branchLabel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBranch && matchesSearch;
  });

  // Active selected project for the detail drawer
  const activeProject =
    BRANCH_PROJECTS.find((p) => p.id === activeProjectId) || BRANCH_PROJECTS[0];

  // The project currently selected as "My Portfolio Project"
  const mySelectedProject = BRANCH_PROJECTS.find(
    (p) => p.id === userSelectedProject.projectId
  );

  const activeSquadMessages = squadMessages.filter(
    (m) => m.projectId === activeProject.id
  );

  return (
    <div className="space-y-6">
      {/* SECTION HEADER: Branch Project Group Identity */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl border border-indigo-900/60 p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-40 bottom-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                <Sparkles className="w-3.5 h-3.5" />
                Branch-Specific Project Selection & High-CTC Group
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Briefcase className="w-3.5 h-3.5" />
                Target Packages: ₹18 - ₹52 LPA
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Select Your Industry-Critical Engineering Project
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              Recruiters at Tier-1 product companies and high-paying tech firms filter out generic clones.
              Here, students select <strong className="text-white">vetted projects mapped to their branch topics</strong> that prove deep architectural understanding, real concurrency, hardware/streaming protocols, and measurable production impact to secure top placement offers.
            </p>
          </div>

          {/* Quick Active Student Counter */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 p-4 sm:p-5 shrink-0 space-y-2 text-center lg:text-right">
            <div className="flex items-center justify-center lg:justify-end gap-2 text-emerald-400 font-bold text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              168 Active Campus Peers
            </div>
            <div className="text-2xl font-black text-white">6 Engineering Branches</div>
            <div className="text-[11px] text-slate-300">
              Form squads, co-build milestones, and review PRs together
            </div>
          </div>
        </div>

        {/* MY ACTIVE PORTFOLIO PROJECT STRIP (IF SELECTED) */}
        {mySelectedProject && (
          <div className="mt-6 pt-5 border-t border-slate-800/80 bg-white/5 -mx-6 sm:-mx-8 -mb-6 sm:-mb-8 p-5 sm:p-6 rounded-b-3xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-300 text-[10px] font-bold uppercase tracking-wider border border-indigo-400/30">
                    Your Selected Placement Project
                  </span>
                  <span className="text-xs text-slate-300">
                    Selected for {mySelectedProject.branchLabel}
                  </span>
                </div>
                <h3 className="font-extrabold text-base text-white hover:text-indigo-200 transition-colors cursor-pointer"
                    onClick={() => setActiveProjectId(mySelectedProject.id)}>
                  {mySelectedProject.title}
                </h3>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <div className="text-xs font-bold text-emerald-400">
                    Milestones: {userSelectedProject.completedMilestones.length} / 4 Completed
                  </div>
                  <div className="w-32 bg-slate-700/80 rounded-full h-2 mt-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-400 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${(userSelectedProject.completedMilestones.length / 4) * 100}%`
                      }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveProjectId(mySelectedProject.id);
                    setDetailTab('milestones');
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
                >
                  <FolderGit2 className="w-3.5 h-3.5" />
                  Open Workspace
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BRANCH SELECTOR FILTER TABS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Select Your Engineering Branch / Domain</span>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by topic, tech, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Branch Buttons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
          {ENGINEERING_BRANCHES.map((branch) => {
            const isSelected = selectedBranch === branch.id;
            return (
              <button
                key={branch.id}
                onClick={() => setSelectedBranch(branch.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20 scale-[1.02]'
                    : 'bg-slate-50/70 hover:bg-slate-100 border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {branch.shortLabel}
                  </span>
                  <span
                    className={`text-[10px] font-semibold ${
                      isSelected ? 'text-indigo-200' : 'text-slate-400'
                    }`}
                  >
                    {branch.activeStudentsInPortal} peers
                  </span>
                </div>

                <div className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                  {branch.shortLabel}
                </div>

                <div className={`text-[10px] font-medium ${isSelected ? 'text-indigo-100' : 'text-emerald-700'}`}>
                  {branch.averageHighPackage}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN WORKSPACE: PROJECT LIST & SELECTED PROJECT DETAILS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: PROJECT CARDS LIST (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span className="font-bold uppercase tracking-wider text-slate-700">
              Available Industry Projects ({filteredProjects.length})
            </span>
            <span>Click any project to inspect blueprint</span>
          </div>

          <div className="space-y-3.5">
            {filteredProjects.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 space-y-2">
                <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-sm font-semibold">No projects found matching your search</p>
                <button
                  onClick={() => {
                    setSelectedBranch('ALL');
                    setSearchQuery('');
                  }}
                  className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                >
                  Reset filters & view all branch projects
                </button>
              </div>
            ) : (
              filteredProjects.map((project) => {
                const isActive = project.id === activeProjectId;
                const isSelectedByStudent = userSelectedProject.projectId === project.id;

                return (
                  <div
                    key={project.id}
                    onClick={() => setActiveProjectId(project.id)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 relative overflow-hidden ${
                      isActive
                        ? 'bg-white border-indigo-600 shadow-md ring-2 ring-indigo-500/20'
                        : 'bg-white hover:border-slate-300 border-slate-200 shadow-2xs hover:shadow-xs'
                    }`}
                  >
                    {/* Top Badges */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {project.branchLabel}
                        </span>
                        {isSelectedByStudent && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500 text-white">
                            <CheckCircle2 className="w-3 h-3" />
                            My Selected Project
                          </span>
                        )}
                      </div>

                      <div className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg shrink-0">
                        <Award className="w-3.5 h-3.5 text-emerald-600" />
                        {project.industryImportanceScore}/10 Impact
                      </div>
                    </div>

                    {/* Title */}
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                        {project.title}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                        {project.summary}
                      </p>
                    </div>

                    {/* Target CTC & Role */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                      <div className="text-slate-700 font-semibold truncate max-w-[180px]">
                        🎯 {project.roleTarget}
                      </div>
                      <div className="font-extrabold text-indigo-900 shrink-0">
                        {project.packageTier}
                      </div>
                    </div>

                    {/* Tech Stack Pills */}
                    <div className="flex flex-wrap gap-1">
                      {project.techStack.slice(0, 4).map((tech, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.techStack.length > 4 && (
                        <span className="text-[10px] text-slate-400 px-1 py-0.5">
                          +{project.techStack.length - 4} more
                        </span>
                      )}
                    </div>

                    {/* Footer: Peer Squad Count */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Users className="w-3.5 h-3.5 text-indigo-500" />
                        {project.activePeersCount} peers building this
                      </span>
                      <span className="font-bold text-indigo-600 flex items-center gap-1">
                        View Blueprint <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: ACTIVE PROJECT DEEP DIVE & WORKSPACE (7 cols on lg) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-6">
          {/* Header of Active Project */}
          <div className="space-y-4 pb-5 border-b border-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {activeProject.branchLabel}
                </span>
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {activeProject.packageTier}
                </span>
              </div>

              {/* ACTION: SELECT THIS PROJECT */}
              <button
                id="select-project-btn"
                onClick={() => handleSelectProject(activeProject)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-xs ${
                  userSelectedProject.projectId === activeProject.id
                    ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
                }`}
              >
                {userSelectedProject.projectId === activeProject.id ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Selected as My Portfolio Project
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Select This Project for My Placement
                  </>
                )}
              </button>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                {activeProject.title}
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {activeProject.summary}
              </p>
            </div>

            {/* Target Companies Strip */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="font-bold text-slate-700">Target Companies:</span>
              {activeProject.targetCompanies.map((company, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-900 font-semibold text-[11px]"
                >
                  {company}
                </span>
              ))}
            </div>
          </div>

          {/* PROJECT DETAIL TABS */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setDetailTab('overview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                detailTab === 'overview'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Industry Value
            </button>
            <button
              onClick={() => setDetailTab('architecture')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                detailTab === 'architecture'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Architecture & Stack
            </button>
            <button
              onClick={() => setDetailTab('milestones')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                detailTab === 'milestones'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Milestone Checklist
            </button>
            <button
              onClick={() => setDetailTab('resume-bullets')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                detailTab === 'resume-bullets'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Resume Bullets
            </button>
            <button
              onClick={() => setDetailTab('interview-prep')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                detailTab === 'interview-prep'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Interview Q&A
            </button>
            <button
              onClick={() => setDetailTab('squad-room')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                detailTab === 'squad-room'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Project Squad ({activeSquadMessages.length})
            </button>
          </div>

          {/* TAB 1: OVERVIEW & INDUSTRY SIGNIFICANCE */}
          {detailTab === 'overview' && (
            <div className="space-y-5 animate-in fade-in">
              {/* Why Very Important in Software Industry */}
              <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2">
                <div className="flex items-center gap-2 text-indigo-950 font-bold text-xs uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  Why This Project Is Very Important in the Software Industry
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {activeProject.industrySignificance}
                </p>
              </div>

              {/* What Recruiters Look For */}
              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-2">
                <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs uppercase tracking-wider">
                  <Award className="w-4 h-4 text-emerald-600" />
                  What Top Hiring Managers & Tech Leads Look For
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {activeProject.whyCompaniesHireThis}
                </p>
              </div>

              {/* Core Branch Engineering Concepts Applied */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  Core {activeProject.branchLabel} Concepts Tested in Interviews
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeProject.coreBranchConcepts.map((concept, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-800 flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{concept}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ARCHITECTURE & TECH STACK */}
          {detailTab === 'architecture' && (
            <div className="space-y-5 animate-in fade-in">
              {/* Architecture Pillars */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  Production Architecture Components
                </h4>
                <div className="space-y-2">
                  {activeProject.architectureModules.map((mod, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3"
                    >
                      <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <p className="text-xs text-slate-700 leading-relaxed">{mod}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Production Tech Stack */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Recommended Production Stack
                </h4>
                <div className="flex flex-wrap gap-2">
                  {activeProject.techStack.map((tech, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 font-semibold text-xs"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Reference GitHub Repo */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                    <FolderGit2 className="w-4 h-4" />
                    Reference Repository Blueprint
                  </div>
                  <div className="text-xs text-slate-300 font-mono">
                    {activeProject.sampleGithubRepo}
                  </div>
                </div>
                <a
                  href={activeProject.sampleGithubRepo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1 shrink-0"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Template
                </a>
              </div>
            </div>
          )}

          {/* TAB 3: MILESTONE CHECKLIST (INTERACTIVE PROGRESS) */}
          {detailTab === 'milestones' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Step-by-Step Implementation Roadmap
                  </h4>
                  <p className="text-xs text-slate-500">
                    Complete each phase to prepare yourself for technical system design grilling.
                  </p>
                </div>
                <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                  {userSelectedProject.projectId === activeProject.id
                    ? `${userSelectedProject.completedMilestones.length} / 4 Completed`
                    : 'Select project to track'}
                </span>
              </div>

              <div className="space-y-3">
                {activeProject.milestones.map((milestone) => {
                  const isDone =
                    userSelectedProject.projectId === activeProject.id &&
                    userSelectedProject.completedMilestones.includes(milestone.step);

                  return (
                    <div
                      key={milestone.step}
                      onClick={() => {
                        if (userSelectedProject.projectId === activeProject.id) {
                          handleToggleMilestone(milestone.step);
                        } else {
                          handleSelectProject(activeProject);
                        }
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                        isDone
                          ? 'bg-emerald-50/50 border-emerald-200'
                          : 'bg-white border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      <div className="pt-0.5">
                        {isDone ? (
                          <CheckSquare className="w-5 h-5 text-emerald-600 shrink-0" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-400 shrink-0" />
                        )}
                      </div>

                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-bold ${
                              isDone ? 'line-through text-slate-500' : 'text-slate-900'
                            }`}
                          >
                            Milestone {milestone.step}: {milestone.title}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">
                            Phase {milestone.step}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                          {milestone.description}
                        </p>

                        <div className="pt-1.5 flex items-center gap-1.5 text-[11px] text-indigo-700 bg-indigo-50/60 p-2 rounded-lg font-medium">
                          <strong>Deliverable:</strong> {milestone.deliverable}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Personal Repo URL Linking */}
              {userSelectedProject.projectId === activeProject.id && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Your GitHub Repository URL for this Project:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      placeholder="https://github.com/your-username/my-project"
                      value={userSelectedProject.repoUrl || ''}
                      onChange={(e) => handleSaveRepoUrl(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                    <button
                      onClick={() => alert('Repository linked to your placement profile!')}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer hover:bg-indigo-700"
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: QUANTIFIED RESUME BULLETS */}
          {detailTab === 'resume-bullets' && (
            <div className="space-y-5 animate-in fade-in">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Ready-To-Use Quantified Resume Bullets (ATS-Proof)
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Click copy and paste these directly under your Projects section in LaTeX or Word resumes.
                </p>
              </div>

              <div className="space-y-3">
                {activeProject.keyResumeBullets.map((bullet, i) => {
                  const bulletId = `${activeProject.id}-res-${i}`;
                  const isCopied = copiedBulletId === bulletId;

                  return (
                    <div
                      key={i}
                      className="p-3.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/30 border border-slate-200 transition-colors flex items-start justify-between gap-3"
                    >
                      <p className="text-xs text-slate-800 leading-relaxed font-mono">
                        • {bullet}
                      </p>
                      <button
                        onClick={() => handleCopyBullet(bullet, bulletId)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white transition-colors cursor-pointer shrink-0"
                        title="Copy bullet"
                      >
                        {isCopied ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Tip from Placed Seniors:</strong> Always ensure you can defend each metric (e.g. 12,000 RPS or 92% Precision) when interviewers ask "How did you measure this?".
                </span>
              </div>
            </div>
          )}

          {/* TAB 5: INTERVIEW ROUND PREPARATION (Q&A) */}
          {detailTab === 'interview-prep' && (
            <div className="space-y-5 animate-in fade-in">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Technical Interview Grilling Questions & Answer Blueprint
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Common questions FAANG and Tier-1 engineering interviewers ask about this specific architecture.
                </p>
              </div>

              <div className="space-y-3.5">
                {activeProject.interviewQuestions.map((qa, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2"
                  >
                    <div className="flex items-start gap-2">
                      <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold text-[10px] shrink-0 mt-0.5">
                        Q{i + 1}
                      </span>
                      <h5 className="font-bold text-xs text-slate-900 leading-snug">
                        {qa.question}
                      </h5>
                    </div>

                    <div className="pl-7 pt-1 text-xs text-slate-700 leading-relaxed border-l-2 border-indigo-400 ml-3">
                      <strong className="text-indigo-900">How to Answer with High Impact: </strong>
                      {qa.answerKey}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: PROJECT SQUAD / PEER GROUP DISCUSSION ROOM */}
          {detailTab === 'squad-room' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-indigo-600" />
                    {activeProject.title} — Peer Cohort Squad
                  </h4>
                  <p className="text-xs text-slate-500">
                    Collaborate with peers working on this project. Ask questions, share benchmarks, and review code.
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                  {activeProject.activePeersCount} Students Enrolled
                </span>
              </div>

              {/* Messages list */}
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {activeSquadMessages.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-xs italic bg-slate-50 rounded-2xl">
                    No squad messages yet for this project. Be the first to start the discussion or ask an architectural doubt!
                  </div>
                ) : (
                  activeSquadMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={msg.authorAvatar}
                            alt={msg.authorName}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <span className="font-bold text-xs text-slate-900">{msg.authorName}</span>
                          <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                            {msg.authorBranch}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed pl-8">
                        {msg.message}
                      </p>

                      <div className="pl-8 pt-1 flex items-center gap-3 text-[11px]">
                        <button
                          onClick={() => handleToggleLikeSquadMsg(msg.id)}
                          className={`inline-flex items-center gap-1 font-semibold cursor-pointer ${
                            msg.hasLiked ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          <ThumbsUp className="w-3 h-3" />
                          <span>{msg.likes}</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Message Input Form */}
              <form onSubmit={handleSendSquadMessage} className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <img
                  src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover shrink-0"
                />
                <input
                  type="text"
                  placeholder="Share a milestone question, benchmark result, or code issue..."
                  value={newSquadMessageText}
                  onChange={(e) => setNewSquadMessageText(e.target.value)}
                  className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5 shrink-0 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  Post
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
