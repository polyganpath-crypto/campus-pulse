import React, { useState } from 'react';
import {
  Briefcase,
  MessageSquare,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Clock,
  Building,
  Send,
  Sparkles,
  Award,
  ChevronRight,
  BookOpen,
  Users
} from 'lucide-react';
import { PlacementTopic, CompanyDrive, PlacementChatMessage, UserProfile } from '../../types';
import { INITIAL_PLACEMENT_TOPICS, INITIAL_COMPANY_DRIVES } from '../../data/mockData';

interface PlacementsTabProps {
  currentUser: UserProfile;
  onNavigateTab?: (tab: string) => void;
}

export const PlacementsTab: React.FC<PlacementsTabProps> = ({ currentUser, onNavigateTab }) => {
  const [topics, setTopics] = useState<PlacementTopic[]>(INITIAL_PLACEMENT_TOPICS);
  const [drives, setDrives] = useState<CompanyDrive[]>(INITIAL_COMPANY_DRIVES);
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'coordinator-chat' | 'drives'>('dashboard');
  const [selectedTopicId, setSelectedTopicId] = useState<string>(topics[0].id);

  // Chat with Coordinator State
  const [coordinatorMessages, setCoordinatorMessages] = useState<PlacementChatMessage[]>([
    {
      id: 'coord-1',
      sender: 'coordinator',
      text: `Hello Likith! I am Dr. Rajesh Sharma, Head of Training & Placements. Your current CGPA of 8.92 makes you eligible for Tier-1 engineering drives (Google, Microsoft, Atlassian, Amazon). Feel free to ask any doubt regarding resume vetting, interview rounds, or off-campus internship exemptions.`,
      timestamp: 'Yesterday, 11:00 AM'
    },
    {
      id: 'coord-2',
      sender: 'student',
      text: 'Good morning Sir, does the Google SDE-1 drive require physical attendance on campus for Round 2, or will it be conducted virtually?',
      timestamp: 'Yesterday, 03:20 PM'
    },
    {
      id: 'coord-3',
      sender: 'coordinator',
      text: 'All technical rounds for Google will be conducted virtually via Google Meet. However, the pre-placement talk in the convention center on Sept 27th is mandatory for shortlisted candidates.',
      timestamp: 'Yesterday, 04:05 PM'
    }
  ]);
  const [chatInput, setChatInput] = useState<string>('');

  const handleSendToCoordinator = () => {
    if (!chatInput.trim()) return;

    const userMsg: PlacementChatMessage = {
      id: `coord-msg-${Date.now()}`,
      sender: 'student',
      text: chatInput,
      timestamp: 'Just now'
    };

    setCoordinatorMessages((prev) => [...prev, userMsg]);
    setChatInput('');

    // Simulated Coordinator Reply
    setTimeout(() => {
      const replyMsg: PlacementChatMessage = {
        id: `coord-rep-${Date.now()}`,
        sender: 'coordinator',
        text: `Thank you for your inquiry, Likith. I have noted this in your T&P dossier. Please also keep your verified 5th semester grade transcript updated in the documentation cell. Let me know if you need a mock HR interview before next Monday.`,
        timestamp: 'Just now'
      };
      setCoordinatorMessages((prev) => [...prev, replyMsg]);
    }, 1200);
  };

  const handleApplyDrive = (driveId: string) => {
    setDrives((prev) =>
      prev.map((d) => (d.id === driveId ? { ...d, isApplied: true } : d))
    );
  };

  const selectedTopic = topics.find((t) => t.id === selectedTopicId) || topics[0];

  // Aggregate stats
  const totalSolved = topics.reduce((acc, t) => acc + t.solvedQuestions, 0);
  const totalQuestions = topics.reduce((acc, t) => acc + t.totalQuestions, 0);
  const overallMastery = ((totalSolved / totalQuestions) * 100).toFixed(0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase tracking-wide">
              Directorate of Training, Internships & Placements
            </span>
            <span className="text-xs text-slate-500">Tier-1 Corporate Recruitment Cell</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-2">Placement Prep & Coordinator Direct Desk</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Track interview preparation across high-yield focus topics, match company drive criteria, and chat directly with Chief Placement Officer Dr. Rajesh Sharma for career guidance.
          </p>
        </div>

        {/* Sub-nav tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl self-start md:self-auto shrink-0">
          <button
            onClick={() => setActiveSubTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'dashboard'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Prep Dashboard
          </button>
          <button
            id="open-coordinator-chat-subtab-btn"
            onClick={() => setActiveSubTab('coordinator-chat')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'coordinator-chat'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat Coordinator</span>
          </button>
          <button
            onClick={() => setActiveSubTab('drives')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'drives'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Company Drives ({drives.length})
          </button>
          {onNavigateTab && (
            <button
              id="placements-quick-branch-proj-btn"
              onClick={() => onNavigateTab('peer-group')}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 text-amber-950 bg-amber-100 hover:bg-amber-200 border border-amber-300 shadow-2xs"
            >
              <Award className="w-3.5 h-3.5 text-amber-700" />
              <span>Select High-CTC Branch Project</span>
            </button>
          )}
        </div>
      </div>

      {/* Subtab 1: Prep Dashboard */}
      {activeSubTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Top Progress Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold uppercase tracking-wider">Overall Placement Readiness</span>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-3xl font-black text-slate-900 mt-2 flex items-baseline gap-2">
                <span>{overallMastery}%</span>
                <span className="text-xs font-bold text-emerald-600">FAANG Benchmarked</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${overallMastery}%` }} />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold uppercase tracking-wider">Interview Problems Solved</span>
                <CheckCircle2 className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-3xl font-black text-slate-900 mt-2 flex items-baseline gap-2">
                <span>{totalSolved}</span>
                <span className="text-xs font-bold text-slate-500">/ {totalQuestions} Curated Questions</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Covers LeetCode Medium/Hard + System Design + OS/DBMS Core
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold uppercase tracking-wider">Academic Eligibility Check</span>
                <Award className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-3xl font-black text-slate-900 mt-2 flex items-baseline gap-2">
                <span>8.92</span>
                <span className="text-xs font-bold text-emerald-600">Eligible for 100% Drives</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                All Tier-1 criteria cleared (Min cut-off: 7.5 to 8.5 CGPA)
              </p>
            </div>
          </div>

          {/* Topics Grid & Deep-Dive Tips */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: High-Yield Focus Topics */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Core Technical Focus Topics for Campus Placements
                </h3>
                <p className="text-xs text-slate-500">
                  Prioritized by recurrence frequency in Google, Microsoft, Amazon & Atlassian technical rounds
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {topics.map((topic) => {
                  const isSelected = topic.id === selectedTopicId;
                  return (
                    <div
                      key={topic.id}
                      onClick={() => setSelectedTopicId(topic.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50/60 border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                          {topic.category}
                        </span>
                        <span className="text-xs font-bold text-slate-900">
                          {topic.masteryPercentage}%
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 mt-2">{topic.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{topic.description}</p>

                      <div className="w-full h-1.5 bg-slate-200 rounded-full mt-3 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${topic.masteryPercentage}%` }}
                        />
                      </div>

                      <div className="mt-2 text-[10px] text-slate-400 flex justify-between">
                        <span>{topic.solvedQuestions} / {topic.totalQuestions} Solved</span>
                        <span className="text-indigo-600 font-semibold">Inspect Interview Tips →</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right 1 Col: Topic Inspector & High-Yield Interview Tips */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="pb-3 border-b border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    High Yield Guide
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-2">{selectedTopic.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{selectedTopic.description}</p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Crucial Interview Room Insights:
                  </h4>
                  <div className="space-y-2">
                    {selectedTopic.keyInterviewTips.map((tip, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                        💡 {tip}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={() => setActiveSubTab('coordinator-chat')}
                  className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200 transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Discuss Strategy with Placement Head →</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 2: Direct Chat with Placement Coordinator */}
      {activeSubTab === 'coordinator-chat' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[650px] overflow-hidden">
          {/* Coordinator Header Card */}
          <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
                alt="Dr. Rajesh Sharma"
                className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">Dr. Rajesh Sharma</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Online / Active in T&P Cell
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium">Chief Placement & Internship Directorate Officer</p>
                <p className="text-[11px] text-slate-400">Cabin: Placement Cell, Administrative Block 2nd Floor • rajesh.sharma.placements@campus.edu</p>
              </div>
            </div>

            <div className="hidden sm:block text-right">
              <span className="text-xs font-bold text-slate-700">Office Hours:</span>
              <p className="text-[11px] text-slate-500">Mon - Fri: 10:00 AM - 05:00 PM</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
            {coordinatorMessages.map((msg) => {
              const isStudent = msg.sender === 'student';
              return (
                <div
                  key={msg.id}
                  className={`flex ${isStudent ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                      isStudent
                        ? 'bg-indigo-600 text-white rounded-br-none shadow-xs'
                        : 'bg-slate-100 border border-slate-200 text-slate-800 rounded-bl-none'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 mb-1.5 text-[10px] opacity-70">
                      <span className="font-bold">
                        {isStudent ? 'You (Likith E. - Roll 22CS084)' : 'Dr. Rajesh Sharma (Head, Placements)'}
                      </span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick FAQ Chips */}
          <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/70 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-bold text-slate-400 shrink-0">Ask coordinator:</span>
            {[
              'Can I sit for Google and Microsoft on-campus drives simultaneously?',
              'What are the mandatory documents to carry for in-person technical interviews?',
              'How to request attendance exemption during my 6-month corporate internship?'
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => setChatInput(chip)}
                className="px-2.5 py-1 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] whitespace-nowrap transition-colors cursor-pointer shadow-2xs"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-3 sm:p-4 border-t border-slate-200 bg-white flex items-center gap-2">
            <input
              type="text"
              id="coordinator-chat-input"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendToCoordinator()}
              placeholder="Ask Dr. Rajesh Sharma any doubt regarding placements or internships..."
              className="flex-1 text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
            <button
              id="coordinator-send-btn"
              onClick={handleSendToCoordinator}
              disabled={!chatInput.trim()}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-xs"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Subtab 3: Company Drives Tracker */}
      {activeSubTab === 'drives' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {drives.map((drive) => {
              const userEligible = (currentUser.cgpa || 8.92) >= drive.eligibilityCgpa;

              return (
                <div
                  key={drive.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-indigo-300 transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-indigo-600" />
                          <h3 className="text-base font-bold text-slate-900">{drive.companyName}</h3>
                        </div>
                        <p className="text-xs font-semibold text-slate-700 mt-1">{drive.role}</p>
                      </div>

                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                          userEligible
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {userEligible ? 'Eligible (CGPA Match)' : 'Not Eligible'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div>
                        <span className="text-slate-400">Compensation:</span>
                        <p className="font-bold text-emerald-700">{drive.ctcPackage}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Min CGPA Required:</span>
                        <p className="font-bold text-slate-900">{drive.eligibilityCgpa} / 10.0</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Registration Closes:</span>
                        <p className="font-semibold text-rose-600">{drive.deadline}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Work Location:</span>
                        <p className="font-medium text-slate-700">{drive.location}</p>
                      </div>
                    </div>

                    <div className="mt-3 text-xs">
                      <span className="font-bold text-slate-600">Interview Rounds:</span>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {drive.rounds.map((round, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200"
                          >
                            {round}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500">Official Campus Recruitment Drive</span>
                    <button
                      onClick={() => handleApplyDrive(drive.id)}
                      disabled={drive.isApplied}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        drive.isApplied
                          ? 'bg-emerald-100 text-emerald-800 cursor-default'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                      }`}
                    >
                      {drive.isApplied ? 'Application Registered ✓' : 'Apply for Drive →'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
