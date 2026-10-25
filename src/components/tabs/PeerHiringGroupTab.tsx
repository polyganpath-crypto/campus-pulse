import React, { useState } from 'react';
import {
  Users,
  MessageSquare,
  Sparkles,
  Briefcase,
  TrendingUp,
  Target,
  Send,
  ThumbsUp,
  Share2,
  Bookmark,
  CheckCircle2,
  AlertTriangle,
  Code2,
  CheckSquare,
  Square,
  Layers,
  Cpu,
  Database,
  Terminal,
  HelpCircle,
  Plus,
  X,
  Filter,
  Flame,
  Award,
  BookOpen,
  ArrowRight,
  ExternalLink,
  BarChart3,
  Copy,
  Check
} from 'lucide-react';
import { UserProfile, StudentDiscussionPost, MarketProjectGuide, TopicRequirementSection, GroupPoll } from '../../types';
import {
  ONLINE_PEERS,
  INITIAL_DISCUSSION_POSTS,
  MARKET_PROJECT_GUIDES,
  TOPIC_REQUIREMENT_SECTIONS,
  INITIAL_POLLS,
  OnlinePeer
} from '../../data/hiringDiscussionData';
import { BranchProjectSelectionSection } from './BranchProjectSelectionSection';

interface PeerHiringGroupTabProps {
  currentUser: UserProfile;
}

export const PeerHiringGroupTab: React.FC<PeerHiringGroupTabProps> = ({ currentUser }) => {
  const [activeSubTab, setActiveSubTab] = useState<'branch-projects' | 'discussions' | 'market-projects' | 'topics-to-cover' | 'polls'>('branch-projects');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Discussion posts state
  const [posts, setPosts] = useState<StudentDiscussionPost[]>(INITIAL_DISCUSSION_POSTS);
  const [showNewPostModal, setShowNewPostModal] = useState<boolean>(false);

  // New post form
  const [newPostTitle, setNewPostTitle] = useState<string>('');
  const [newPostCategory, setNewPostCategory] = useState<'market-projects' | 'topics-to-cover' | 'internship-guide' | 'resume-vetting'>('market-projects');
  const [newPostContent, setNewPostContent] = useState<string>('');
  const [newPostTags, setNewPostTags] = useState<string>('Market Projects, Hiring, Tech Interview');

  // Reply state for currently opened post
  const [replyInputMap, setReplyInputMap] = useState<{ [postId: string]: string }>({});
  const [expandedReplies, setExpandedReplies] = useState<{ [postId: string]: boolean }>({
    'post-market-projects-1': true,
    'post-topics-1': true
  });

  // Polls state
  const [polls, setPolls] = useState<GroupPoll[]>(INITIAL_POLLS);

  // Topics completed tracking state
  const [completedTopics, setCompletedTopics] = useState<{ [topicName: string]: boolean }>({
    'Sliding Window & Two Pointers': true,
    'Caching Strategies & Redis': true,
    'Operating Systems & Concurrency': true
  });

  // Copy toast indicator
  const [copiedBulletId, setCopiedBulletId] = useState<string | null>(null);

  // Upvote Post
  const handleToggleUpvotePost = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const hasUpvoted = post.hasUpvoted;
          return {
            ...post,
            hasUpvoted: !hasUpvoted,
            upvotes: hasUpvoted ? post.upvotes - 1 : post.upvotes + 1
          };
        }
        return post;
      })
    );
  };

  // Bookmark Post
  const handleToggleBookmark = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, bookmarked: !post.bookmarked } : post
      )
    );
  };

  // Upvote Reply
  const handleToggleUpvoteReply = (postId: string, replyId: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            replies: post.replies.map((reply) => {
              if (reply.id === replyId) {
                const hasUpvoted = reply.hasUpvoted;
                return {
                  ...reply,
                  hasUpvoted: !hasUpvoted,
                  upvotes: hasUpvoted ? reply.upvotes - 1 : reply.upvotes + 1
                };
              }
              return reply;
            })
          };
        }
        return post;
      })
    );
  };

  // Submit Reply to a post
  const handleAddReply = (postId: string) => {
    const text = replyInputMap[postId]?.trim();
    if (!text) return;

    const newReply = {
      id: `reply-${Date.now()}`,
      authorName: currentUser.name,
      authorRoll: currentUser.rollNumber || '22CS084',
      authorBadge: `${currentUser.department} (You)`,
      authorAvatar: currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      content: text,
      timestamp: 'Just now',
      upvotes: 0,
      hasUpvoted: false
    };

    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              replies: [...post.replies, newReply]
            }
          : post
      )
    );

    setReplyInputMap((prev) => ({ ...prev, [postId]: '' }));
    setExpandedReplies((prev) => ({ ...prev, [postId]: true }));
  };

  // Submit New Discussion Post
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) return;

    const tagsArray = newPostTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const newPost: StudentDiscussionPost = {
      id: `post-${Date.now()}`,
      authorName: currentUser.name,
      authorRoll: currentUser.rollNumber || '22CS084',
      authorBadge: '3rd Year CSE (You)',
      authorAvatar: currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      category: newPostCategory,
      title: newPostTitle,
      content: newPostContent,
      tags: tagsArray.length ? tagsArray : ['Hiring', 'Discussion'],
      upvotes: 1,
      hasUpvoted: true,
      bookmarked: false,
      replies: [],
      createdAt: 'Just now',
      isPinned: false
    };

    setPosts([newPost, ...posts]);
    setNewPostTitle('');
    setNewPostContent('');
    setShowNewPostModal(false);
    setActiveSubTab('discussions');
  };

  // Vote on Poll
  const handleVotePoll = (pollId: string, optionId: string) => {
    setPolls((prev) =>
      prev.map((poll) => {
        if (poll.id === pollId) {
          if (poll.userVotedOptionId === optionId) return poll;
          const prevVoted = poll.userVotedOptionId;
          return {
            ...poll,
            totalVotes: prevVoted ? poll.totalVotes : poll.totalVotes + 1,
            userVotedOptionId: optionId,
            options: poll.options.map((opt) => {
              if (opt.id === optionId) {
                return { ...opt, votes: opt.votes + 1 };
              }
              if (prevVoted && opt.id === prevVoted) {
                return { ...opt, votes: Math.max(0, opt.votes - 1) };
              }
              return opt;
            })
          };
        }
        return poll;
      })
    );
  };

  // Toggle Topic Completion Checkbox
  const handleToggleTopicComplete = (topicName: string) => {
    setCompletedTopics((prev) => ({
      ...prev,
      [topicName]: !prev[topicName]
    }));
  };

  // Copy resume bullet to clipboard
  const handleCopyBullet = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBulletId(id);
    setTimeout(() => setCopiedBulletId(null), 2500);
  };

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    const matchesCat = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      post.authorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Hero Banner: Student Group Identity & Online Presence */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl border border-indigo-900/50 shadow-xl p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-20 bottom-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                42 Students & Mentors Online Now
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                <Briefcase className="w-3.5 h-3.5" />
                SDE & Intern Hiring Circle
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Student Career & Market Projects Forum
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              An online peer collaboration circle dedicated to discussing <span className="text-white font-semibold underline decoration-indigo-400">what topics must be covered</span> to pass coding and technical rounds, and <span className="text-white font-semibold underline decoration-cyan-400">what kind of production-grade market projects</span> actually catch recruiters’ eyes to get hired in top companies and high-paying internships.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <button
              id="hero-select-branch-project-btn"
              onClick={() => setActiveSubTab('branch-projects')}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-amber-500/20 transition-all hover:scale-102 cursor-pointer"
            >
              <Award className="w-4 h-4 text-slate-950" />
              Select Branch Project (High-CTC)
            </button>
            <button
              id="start-discussion-btn"
              onClick={() => setShowNewPostModal(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-102 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Start a Topic / Ask Group
            </button>
            <div className="text-xs text-slate-400 text-center lg:text-right">
              Active seniors from Microsoft, Amazon, Goldman Sachs
            </div>
          </div>
        </div>

        {/* Live Active Mentors & Online Students Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-300 shrink-0 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-400" />
              Online Mentors:
            </span>
            <div className="flex -space-x-2 overflow-hidden py-1">
              {ONLINE_PEERS.map((peer) => (
                <img
                  key={peer.id}
                  src={peer.avatar}
                  alt={peer.name}
                  title={`${peer.name} (${peer.badge}) - ${peer.status}`}
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-slate-900 object-cover"
                />
              ))}
            </div>
            <span className="text-xs text-slate-400 hidden sm:inline">
              +37 CSE/ECE peers active in discussion
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-indigo-300">
            <Flame className="w-4 h-4 text-amber-400" />
            <span className="font-semibold">Trending Discussion:</span>
            <span className="text-slate-200 truncate max-w-xs">
              Distributed Task Queues vs Generic MERN clones
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-1.5 shadow-xs flex flex-wrap gap-1.5">
        <button
          onClick={() => setActiveSubTab('branch-projects')}
          className={`flex-1 min-w-[170px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'branch-projects'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4 text-amber-400" />
          <span>Branch Project Selection</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-400/20 text-amber-300 font-extrabold">⚡ High-CTC</span>
        </button>

        <button
          onClick={() => setActiveSubTab('discussions')}
          className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'discussions'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Online Discussions ({posts.length})
        </button>

        <button
          onClick={() => setActiveSubTab('market-projects')}
          className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'market-projects'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          Market Blueprints ({MARKET_PROJECT_GUIDES.length})
        </button>

        <button
          onClick={() => setActiveSubTab('topics-to-cover')}
          className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'topics-to-cover'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Target className="w-4 h-4" />
          Topics to Cover
        </button>

        <button
          onClick={() => setActiveSubTab('polls')}
          className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'polls'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Hiring Polls & Salaries
        </button>
      </div>

      {/* VIEW 0: BRANCH PROJECTS SELECTION (PRIMARY VIEW) */}
      {activeSubTab === 'branch-projects' && (
        <BranchProjectSelectionSection currentUser={currentUser} />
      )}

      {/* VIEW 1: ONLINE DISCUSSIONS FEED */}
      {activeSubTab === 'discussions' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Discussion Column (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Filter Bar & Search */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    selectedCategory === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All Topics
                </button>
                <button
                  onClick={() => setSelectedCategory('market-projects')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    selectedCategory === 'market-projects'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  🚀 Market Projects
                </button>
                <button
                  onClick={() => setSelectedCategory('topics-to-cover')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    selectedCategory === 'topics-to-cover'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  📚 Topics to Cover
                </button>
                <button
                  onClick={() => setSelectedCategory('internship-guide')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    selectedCategory === 'internship-guide'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  💼 Internships
                </button>
              </div>

              {/* Search input */}
              <div className="w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search discussions, tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Posts List */}
            {filteredPosts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
                <MessageSquare className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <p className="font-bold text-slate-700">No discussions found matching your filter.</p>
                <p className="text-xs text-slate-500 mt-1">Be the first to post a query or share a market project idea!</p>
              </div>
            ) : (
              filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className={`bg-white rounded-2xl border transition-all p-5 space-y-4 ${
                    post.isPinned ? 'border-amber-300 bg-amber-50/20 shadow-xs' : 'border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  {/* Post Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={post.authorAvatar}
                        alt={post.authorName}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-100"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{post.authorName}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                            {post.authorRoll}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                            {post.authorBadge}
                          </span>
                          <span className="text-[11px] text-slate-400">• {post.createdAt}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {post.isPinned && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full">
                          <Flame className="w-3.5 h-3.5 text-amber-600" />
                          Pinned Guide
                        </span>
                      )}
                      <button
                        onClick={() => handleToggleBookmark(post.id)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          post.bookmarked ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:text-slate-600'
                        }`}
                        title="Bookmark this discussion"
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Post Title & Content */}
                  <div>
                    <h3 className="font-bold text-base text-slate-900 leading-snug">{post.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-700 mt-2 leading-relaxed whitespace-pre-line">
                      {post.content}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {post.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-medium px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Post Footer Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleToggleUpvotePost(post.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                          post.hasUpvoted
                            ? 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{post.upvotes} Upvotes</span>
                      </button>

                      <button
                        onClick={() =>
                          setExpandedReplies((prev) => ({
                            ...prev,
                            [post.id]: !prev[post.id]
                          }))
                        }
                        className="inline-flex items-center gap-1.5 text-slate-600 hover:text-indigo-600 font-semibold cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{post.replies.length} Student Responses</span>
                      </button>
                    </div>

                    <span className="text-[11px] text-slate-400 hidden sm:inline">
                      Verified Peer Discussion
                    </span>
                  </div>

                  {/* REPLIES SECTION */}
                  {expandedReplies[post.id] && (
                    <div className="pt-3 space-y-3 bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                        {post.replies.length === 0 ? (
                          <p className="text-xs text-slate-500 italic">No responses yet. Share your experience or ask a follow-up!</p>
                        ) : (
                          post.replies.map((reply) => (
                            <div key={reply.id} className="bg-white p-3 rounded-xl border border-slate-200/80 space-y-1.5 shadow-2xs">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <img
                                    src={reply.authorAvatar}
                                    alt={reply.authorName}
                                    className="w-6 h-6 rounded-full object-cover"
                                  />
                                  <span className="font-bold text-xs text-slate-900">{reply.authorName}</span>
                                  <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded">
                                    {reply.authorBadge}
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-400">{reply.timestamp}</span>
                              </div>

                              <p className="text-xs text-slate-700 leading-relaxed pl-8">
                                {reply.content}
                              </p>

                              <div className="pl-8 pt-1 flex items-center gap-3 text-[11px]">
                                <button
                                  onClick={() => handleToggleUpvoteReply(post.id, reply.id)}
                                  className={`inline-flex items-center gap-1 font-semibold cursor-pointer ${
                                    reply.hasUpvoted ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'
                                  }`}
                                >
                                  <ThumbsUp className="w-3 h-3" />
                                  <span>{reply.upvotes}</span>
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Reply Input Box */}
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60">
                        <img
                          src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          alt={currentUser.name}
                          className="w-7 h-7 rounded-full object-cover shrink-0"
                        />
                        <input
                          type="text"
                          placeholder="Write a response or share interview experience..."
                          value={replyInputMap[post.id] || ''}
                          onChange={(e) =>
                            setReplyInputMap({ ...replyInputMap, [post.id]: e.target.value })
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddReply(post.id);
                          }}
                          className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                        />
                        <button
                          onClick={() => handleAddReply(post.id)}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer shrink-0 inline-flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" />
                          Reply
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Right Sidebar: Quick Rules & Market Hot Topics (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Quick Card: Why This Group Exists */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50/50 rounded-2xl border border-indigo-100 p-5 space-y-3">
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                The Market Hiring Rulebook
              </div>
              <ul className="text-xs text-indigo-950/80 space-y-2 leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span><strong>Projects over LeetCode count:</strong> Top companies now spend 50%+ of technical rounds drilling into system architecture and edge cases.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span><strong>Kill the Clones:</strong> Delete generic Netflix / Amazon clones. Replace with Redis rate limiters, CRDT editors, or FinTech ledgers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span><strong>Core CS is non-negotiable:</strong> Threads, Mutex, TCP handshakes, and ACID properties eliminate 50% of candidates in Round 2.</span>
                </li>
              </ul>
            </div>

            {/* Market Project Quick Selector */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Top Market Projects (2025-2026)
                </h4>
                <button
                  onClick={() => setActiveSubTab('market-projects')}
                  className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="space-y-2.5">
                {MARKET_PROJECT_GUIDES.slice(0, 3).map((guide) => (
                  <div
                    key={guide.id}
                    onClick={() => setActiveSubTab('market-projects')}
                    className="p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 truncate max-w-[200px]">{guide.title}</span>
                      <span className="font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
                        ★ {guide.hiringRating}/10
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">{guide.roleTarget}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Topics Checklist Progress Snapshot */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Topics Readiness Tracker
                </h4>
                <span className="text-xs font-bold text-indigo-600">
                  {Object.values(completedTopics).filter(Boolean).length} / 12 Covered
                </span>
              </div>

              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${(Object.values(completedTopics).filter(Boolean).length / 12) * 100}%`
                  }}
                />
              </div>

              <p className="text-xs text-slate-600">
                Track your topic coverage across DSA, Low-Level Design, Operating Systems, and Distributed Caching.
              </p>

              <button
                onClick={() => setActiveSubTab('topics-to-cover')}
                className="w-full py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Open Complete Roadmap</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: MARKET PROJECTS REQUIRED GUIDE */}
      {activeSubTab === 'market-projects' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                🚀
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  The Market Projects Blueprint for 2025 - 2026 Hiring
                </h2>
                <p className="text-xs text-slate-500">
                  Vetted project architectures that guarantee interview shortlists at Google, Amazon, Atlassian, Uber, and high-stipend internships.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {MARKET_PROJECT_GUIDES.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all p-6 space-y-5 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {project.roleTarget}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-2">{project.title}</h3>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-extrabold text-xs">
                        <Award className="w-3.5 h-3.5 text-emerald-600" />
                        {project.hiringRating} / 10
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Recruiter Value</div>
                    </div>
                  </div>

                  {/* Why Recruiters Love It */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Why Hiring Managers Pick This:
                    </span>
                    <p className="text-slate-600 leading-relaxed pl-5">
                      {project.whyRecruitersLoveIt}
                    </p>
                  </div>

                  {/* Clichés to avoid */}
                  <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-100 text-xs space-y-1">
                    <span className="font-bold text-rose-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      Clichés to Strictly Avoid:
                    </span>
                    <p className="text-rose-700 leading-relaxed pl-5">
                      {project.bannedClichésToAvoid}
                    </p>
                  </div>

                  {/* Architecture Core Pillars */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-indigo-600" />
                      Core Architecture Requirements:
                    </span>
                    <ul className="space-y-1.5 pl-1">
                      {project.architectureCore.map((arch, i) => (
                        <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                          <span>{arch}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Tech Stack */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Recommended Production Stack:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {project.suggestedTechStack.map((tech, i) => (
                        <span
                          key={i}
                          className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Copyable Resume Bullets */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">
                        Exact Resume Bullet Format (Quantified):
                      </span>
                    </div>
                    <div className="space-y-2">
                      {project.keyResumeBullets.map((bullet, i) => {
                        const bulletId = `${project.id}-bullet-${i}`;
                        const isCopied = copiedBulletId === bulletId;
                        return (
                          <div
                            key={i}
                            className="group p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50/40 border border-slate-200/80 transition-colors flex items-start justify-between gap-2"
                          >
                            <p className="text-[11px] text-slate-700 leading-relaxed font-mono">
                              • {bullet}
                            </p>
                            <button
                              onClick={() => handleCopyBullet(bullet, bulletId)}
                              className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-white transition-colors cursor-pointer shrink-0"
                              title="Copy bullet to clipboard"
                            >
                              {isCopied ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Target Companies */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold text-slate-600">Target Companies:</span>
                  <span className="font-bold text-indigo-700 truncate max-w-xs">
                    {project.targetCompanies.join(', ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: TOPICS TO COVER CHECKLIST */}
      {activeSubTab === 'topics-to-cover' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                🎯
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Comprehensive SDE & Internship Topics to Cover
                </h2>
                <p className="text-xs text-slate-500">
                  Check off topics as you cover them. Verified against recent technical round question banks.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {TOPIC_REQUIREMENT_SECTIONS.map((section) => (
              <div
                key={section.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4"
              >
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{section.category}</h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          section.importance === 'Essential'
                            ? 'bg-rose-100 text-rose-800'
                            : section.importance === 'High-Yield'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {section.importance}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{section.description}</p>
                  </div>

                  <div className="text-xs text-slate-500 font-semibold shrink-0 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80">
                    ⏱️ Est. Prep Time: <span className="text-slate-900 font-bold">{section.estimatedPrepTime}</span>
                  </div>
                </div>

                {/* Topics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {section.topics.map((topic, i) => {
                    const isDone = !!completedTopics[topic.name];
                    return (
                      <div
                        key={i}
                        onClick={() => handleToggleTopicComplete(topic.name)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                          isDone
                            ? 'bg-emerald-50/40 border-emerald-200 text-slate-800'
                            : 'bg-white border-slate-200 hover:border-indigo-300'
                        }`}
                      >
                        <div className="pt-0.5">
                          {isDone ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400 shrink-0" />
                          )}
                        </div>

                        <div className="space-y-1 flex-1">
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-bold ${isDone ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                              {topic.name}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                              {topic.proficiencyRequired}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            {topic.description}
                          </p>

                          <div className="pt-1 flex items-center gap-1 text-[10px] text-slate-500">
                            <span className="font-semibold">Frequently asked by:</span>
                            <span className="text-indigo-600 font-medium">
                              {topic.askedBy.join(', ')}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 4: PEER POLLS & MARKET STATS */}
      {activeSubTab === 'polls' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {polls.map((poll) => (
            <div
              key={poll.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1">
                    <BarChart3 className="w-3.5 h-3.5" />
                    Campus Poll
                  </span>
                  <span>{poll.totalVotes} Total Student Votes</span>
                </div>

                <h3 className="font-bold text-sm sm:text-base text-slate-900">
                  {poll.question}
                </h3>

                {/* Poll Options */}
                <div className="space-y-2.5 pt-2">
                  {poll.options.map((opt) => {
                    const percentage = poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0;
                    const isSelected = poll.userVotedOptionId === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleVotePoll(poll.id, opt.id)}
                        className={`w-full text-left p-3 rounded-xl border transition-all relative overflow-hidden cursor-pointer ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/50'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        {/* Progress fill bar */}
                        <div
                          className={`absolute top-0 bottom-0 left-0 transition-all duration-500 ${
                            isSelected ? 'bg-indigo-200/50' : 'bg-slate-100'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />

                        <div className="relative z-10 flex items-center justify-between text-xs">
                          <span className={`font-semibold ${isSelected ? 'text-indigo-900 font-bold' : 'text-slate-800'}`}>
                            {opt.label} {isSelected && '✓ (Your Vote)'}
                          </span>
                          <span className="font-bold text-slate-700 ml-2">
                            {percentage}% ({opt.votes})
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span>Click any option to vote or switch vote</span>
                <span className="text-indigo-600 font-semibold">Live Real-Time Data</span>
              </div>
            </div>
          ))}

          {/* Bonus Card: 2025-2026 Salary & Market Insights */}
          <div className="md:col-span-2 bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl border border-indigo-900 p-6 text-white space-y-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-base text-white">
                Market Compensation Impact: What Top Projects & Topics Yield
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-amber-300 font-bold uppercase tracking-wider text-[10px]">Tier-1 Product SDE-1</span>
                <div className="text-xl font-extrabold text-white">₹18L - ₹45L CTC</div>
                <p className="text-slate-300 text-[11px]">Requires: Distributed Concurrency, NeetCode 150, OS Semaphores, Low-Level Design.</p>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-emerald-300 font-bold uppercase tracking-wider text-[10px]">Summer Internships</span>
                <div className="text-xl font-extrabold text-white">₹60k - ₹1.5L / Mo</div>
                <p className="text-slate-300 text-[11px]">Requires: 1 High-Impact project (e.g., CRDT / Redis queue) + Graph BFS/DFS fluency.</p>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-cyan-300 font-bold uppercase tracking-wider text-[10px]">Off-Campus Referrals</span>
                <div className="text-xl font-extrabold text-white">10x Callback Rate</div>
                <p className="text-slate-300 text-[11px]">When submitting a live deployed demo link + clean GitHub README with k6 benchmarks.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NEW POST MODAL */}
      {showNewPostModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-indigo-300" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Post to Student Hiring & Projects Group</h3>
                  <p className="text-[11px] text-indigo-200">Discuss market projects or topics needed for companies</p>
                </div>
              </div>
              <button
                onClick={() => setShowNewPostModal(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Topic Category
                </label>
                <select
                  value={newPostCategory}
                  onChange={(e) => setNewPostCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  <option value="market-projects">🚀 Market Projects Required (Architecture, Benchmarks)</option>
                  <option value="topics-to-cover">📚 Topics to Cover (DSA, System Design, Core CS)</option>
                  <option value="internship-guide">💼 Internship Playbook (Referrals, Cold Outreach)</option>
                  <option value="resume-vetting">📄 Resume & Project Bullet Vetting</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Discussion Title / Question
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Is building a Distributed Cache with Raft enough for Google SDE-1?"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Detailed Query / Market Insights
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Describe your project idea, the tech stack you are planning, or ask what topics to prioritize..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="Market Projects, Redis, Amazon, NeetCode"
                  value={newPostTags}
                  onChange={(e) => setNewPostTags(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewPostModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Post Discussion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
