import {
  StudentDiscussionPost,
  MarketProjectGuide,
  TopicRequirementSection,
  GroupPoll
} from '../types';

export interface OnlinePeer {
  id: string;
  name: string;
  rollNumber: string;
  badge: string;
  avatar: string;
  status: string;
  isMentor?: boolean;
}

export const ONLINE_PEERS: OnlinePeer[] = [
  {
    id: 'peer-1',
    name: 'Rohit Sharma',
    rollNumber: '21CS014',
    badge: 'Placed @ Microsoft SDE-1 (₹44 LPA)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    status: 'Reviewing project architectures & Redis designs',
    isMentor: true
  },
  {
    id: 'peer-2',
    name: 'Tanya Sengupta',
    rollNumber: '22CS031',
    badge: 'Incoming Intern @ Amazon AWS (₹1.1L/mo)',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    status: 'Sharing NeetCode 150 & Graph patterns',
    isMentor: true
  },
  {
    id: 'peer-3',
    name: 'Varun M.',
    rollNumber: '22CS091',
    badge: 'Intern @ Cisco Systems',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    status: 'Helping with OS Concurrency & TCP Socket questions',
    isMentor: false
  },
  {
    id: 'peer-4',
    name: 'Ananya Rao',
    rollNumber: '21CS032',
    badge: 'Placed @ Goldman Sachs Tech (₹32 LPA)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    status: 'Guiding on SQL Transaction Isolation & Low-Level Design',
    isMentor: true
  },
  {
    id: 'peer-5',
    name: 'Karthik N.',
    rollNumber: '22CS104',
    badge: '3rd Year CSE • Active Learner',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    status: 'Building Distributed Task Queue project',
    isMentor: false
  }
];

export const INITIAL_DISCUSSION_POSTS: StudentDiscussionPost[] = [
  {
    id: 'post-market-projects-1',
    authorName: 'Rohit Sharma',
    authorRoll: '21CS014',
    authorBadge: 'Placed @ Microsoft SDE-1',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    category: 'market-projects',
    title: '🔥 2025-2026 Tech Market Reality: What Projects Actually Get You Hired vs What Gets Filtered Out',
    content: `Hey everyone! Having interviewed across Microsoft, Atlassian, and Swiggy for campus placements, here is the honest truth about resumes today:

Recruiters and engineering managers see hundreds of "E-Commerce Stores", "Netflix Clones", and "MERN Todo Lists" every day. These no longer differentiate you—ATS filters often skim right past them.

To get hired in Tier-1 product companies or land high-paying internships, your projects MUST demonstrate 3 things:
1. Concurrency & Throughput: Can your code handle multiple simultaneous requests without crashing or race conditions? (e.g., Redis distributed lock, Go goroutines, or async worker pools).
2. Failure Scenarios & Edge Cases: What happens when the database goes down? Did you add retries, exponential backoff, and idempotent endpoints?
3. Real Metrics: Put measurable metrics on your resume! Don't write "Built a fast API". Write: "Benchmarked to 8,500 RPS at <45ms p99 latency using Redis caching & connection pooling."

Check the "Market Projects Guide" sub-tab in our group—we curated 5 exact blueprints that got students hired this year!`,
    tags: ['Market Projects', 'Hiring Tips', 'Resume Advice', 'Tier-1 SDE'],
    upvotes: 68,
    hasUpvoted: true,
    bookmarked: true,
    createdAt: 'Today at 09:15 AM',
    isPinned: true,
    replies: [
      {
        id: 'reply-1',
        authorName: 'Tanya Sengupta',
        authorRoll: '22CS031',
        authorBadge: 'Incoming Intern @ Amazon AWS',
        authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        content: '100% agree with Rohit. In my Amazon interview for S3 team, 35 minutes of my 45-minute technical round was diving into how my distributed rate limiter handled race conditions with Redis scripts (Lua). They did not even ask a LeetCode Hard because the project proved systems maturity!',
        timestamp: 'Today at 09:42 AM',
        upvotes: 34,
        hasUpvoted: true
      },
      {
        id: 'reply-2',
        authorName: 'Likith E.',
        authorRoll: '22CS084',
        authorBadge: '3rd Year CSE (You)',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        content: 'Thanks Rohit! What are the exact benchmarks we should run? Is Locust or k6 preferred for load testing?',
        timestamp: 'Today at 10:05 AM',
        upvotes: 12,
        hasUpvoted: false
      },
      {
        id: 'reply-3',
        authorName: 'Rohit Sharma',
        authorRoll: '21CS014',
        authorBadge: 'Placed @ Microsoft SDE-1',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        content: '@Likith Use k6 or autocannon. Export the Grafana summary screenshot and put the link in your GitHub README. Interviewers love seeing actual grafana graphs of memory and latency!',
        timestamp: 'Today at 10:18 AM',
        upvotes: 21,
        hasUpvoted: false
      }
    ]
  },
  {
    id: 'post-topics-1',
    authorName: 'Tanya Sengupta',
    authorRoll: '22CS031',
    authorBadge: 'Incoming Intern @ Amazon AWS',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    category: 'topics-to-cover',
    title: '📚 Master Checklist: What Core Topics MUST be Covered to Clear Coding & Tech Rounds',
    content: `Students often ask: "Should I do 500 LeetCode questions or learn System Design?"

Here is the exact priority breakdown based on what was asked in the last 15 on-campus drives:

1. DSA (Highest Weightage in Round 1 & OA):
   - Sliding Window (Fixed & Dynamic size)
   - Monotonic Stack (Next Greater Element, Stock Span)
   - Trees & Graphs (BFS/DFS, Topological Sort, Dijkstra, Cycle detection)
   - Dynamic Programming (Focus on 1D, 0/1 Knapsack, and Longest Common Subsequence—stop wasting time on 3D DP unless aiming for competitive programming)

2. Core Computer Science (Elimination Round):
   - OS: Threads vs Processes, Race conditions, Semaphores vs Mutex, Virtual memory & Page faults.
   - Networks: TCP 3-way handshake, TCP vs UDP, DNS resolution steps, HTTP/1.1 vs HTTP/2 multiplexing, CORS headers.
   - DBMS: ACID properties (give real banking examples!), Indexing B+ trees vs Hash Index, Normalization up to 3NF.

3. Low-Level System Design (L判 for SDE-1):
   - Implement LRU Cache in 30 mins
   - Design Parking Lot or Tic-Tac-Toe applying SOLID principles.`,
    tags: ['Topics Checklist', 'DSA', 'Core CS', 'Interview Prep'],
    upvotes: 54,
    hasUpvoted: false,
    bookmarked: true,
    createdAt: 'Yesterday at 04:30 PM',
    replies: [
      {
        id: 'reply-t1',
        authorName: 'Ananya Rao',
        authorRoll: '21CS032',
        authorBadge: 'Placed @ Goldman Sachs Tech',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        content: 'Adding to DBMS: Goldman Sachs and Oracle heavily grill on Transaction Isolation levels (Read Committed vs Repeatable Read vs Serializable). Make sure you understand Dirty Reads and Phantom Reads.',
        timestamp: 'Yesterday at 05:12 PM',
        upvotes: 19
      },
      {
        id: 'reply-t2',
        authorName: 'Karthik N.',
        authorRoll: '22CS104',
        authorBadge: '3rd Year CSE',
        authorAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
        content: 'Is NeetCode 150 sufficient or do we also need Striver SDE sheet?',
        timestamp: 'Yesterday at 06:00 PM',
        upvotes: 8
      },
      {
        id: 'reply-t3',
        authorName: 'Tanya Sengupta',
        authorRoll: '22CS031',
        authorBadge: 'Incoming Intern @ Amazon AWS',
        authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        content: '@Karthik Either one is fine! Don’t jump between both. Doing NeetCode 150 thoroughly with understanding patterns is 10x better than memorizing 400 solutions.',
        timestamp: 'Yesterday at 06:25 PM',
        upvotes: 27
      }
    ]
  },
  {
    id: 'post-genai-2',
    authorName: 'Varun M.',
    authorRoll: '22CS091',
    authorBadge: 'Intern @ Cisco Systems',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    category: 'market-projects',
    title: 'Are GenAI / AI projects actually valued by hiring managers, or does it look like toy API wrapper slop?',
    content: `I have seen many 3rd years putting "AI Chatbot" using standard OpenAI or Gemini API calls.

When I talked to my team lead at Cisco who conducts campus hiring, he said:
"If a student simply calls an API with a prompt, that is a 2-hour tutorial project, not an engineering accomplishment. What we look for is: Did they build an evaluation pipeline? Did they test chunking strategies with cosine similarity? Did they handle rate limits, context windows, and hallucination guardrails?"

If you want an AI project that guarantees intern calls:
- Build a Hybrid Search RAG with Pgvector and BM25 reranking.
- Add an evaluation benchmark showing precision@k or faithfulness score.
- Deploy it as a containerized microservice with Docker and latency metrics.`,
    tags: ['AI Projects', 'GenAI', 'Market Trends', 'RAG'],
    upvotes: 47,
    hasUpvoted: false,
    bookmarked: false,
    createdAt: 'Sep 19 at 02:15 PM',
    replies: [
      {
        id: 'reply-g1',
        authorName: 'Rohit Sharma',
        authorRoll: '21CS014',
        authorBadge: 'Placed @ Microsoft SDE-1',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        content: 'Exactly this! Also mention how you cached embeddings in Redis to cut API costs by 60%. Recruiters love engineers who care about cloud infrastructure costs.',
        timestamp: 'Sep 19 at 03:00 PM',
        upvotes: 18
      }
    ]
  },
  {
    id: 'post-internship-3',
    authorName: 'Ananya Rao',
    authorRoll: '21CS032',
    authorBadge: 'Placed @ Goldman Sachs Tech',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    category: 'internship-guide',
    title: 'How to land a good product intern off-campus if on-campus drives are getting delayed',
    content: `For 2nd and 3rd years who want summer internships:
1. Don't rely solely on LinkedIn "Easy Apply" (literally 2,000 applicants per post).
2. Reach out directly to Engineering Leads and Senior Engineers on Twitter/X and LinkedIn with a 3-sentence message showing a Loom video of a project solving their actual problem.
3. Open Source: Submitting 2 pull requests to well-known CNCF or Apache projects got our classmate an interview at Red Hat within 48 hours.
4. Keep your resume strictly 1-page with the Harvard template or Jake's Resume LaTeX format.`,
    tags: ['Internships', 'Cold Outreach', 'Off-Campus', 'Resume Format'],
    upvotes: 61,
    hasUpvoted: true,
    bookmarked: true,
    createdAt: 'Sep 18 at 11:20 AM',
    replies: []
  }
];

export const MARKET_PROJECT_GUIDES: MarketProjectGuide[] = [
  {
    id: 'proj-dist-queue',
    title: 'Distributed High-Throughput Task Queue & Token Bucket Rate Limiter',
    roleTarget: 'Backend SDE / Infrastructure Intern (Amazon, Uber, Swiggy)',
    hiringRating: 9.8,
    whyRecruitersLoveIt: 'Shows you understand distributed state, asynchronous processing, Redis atomic scripts, worker thread pools, and prevention of cascading failures under load.',
    bannedClichésToAvoid: 'Avoid simple in-memory setTimeout or local arrays. Must have Redis persistence, Dead-Letter Queues (DLQ), and exponential backoff retry.',
    architectureCore: [
      'Token Bucket / Sliding Window Log rate limiter executed as an atomic Redis Lua script',
      'Worker pool processing priority jobs with acknowledgment & heartbeat signals',
      'Dead-Letter Queue (DLQ) for failed payload retention with replay triggers',
      'Benchmarked with Locust/k6 hitting 10,000 RPS with <30ms p99 latency'
    ],
    suggestedTechStack: ['Go or Node.js/TypeScript', 'Redis (Lua)', 'PostgreSQL', 'Docker', 'k6/Locust'],
    keyResumeBullets: [
      'Architected distributed rate limiter handling 10,000+ RPS using Redis Lua atomic scripts, eliminating race conditions across multi-instance nodes.',
      'Engineered asynchronous job worker queue with exponential backoff retries and DLQ, achieving 99.98% successful message delivery during simulated broker drops.',
      'Containerized system with Docker Compose and published reproducible k6 benchmark results documenting <25ms p95 latency.'
    ],
    targetCompanies: ['Amazon', 'Uber', 'Swiggy', 'Zomato', 'Salesforce']
  },
  {
    id: 'proj-crdt-collab',
    title: 'Real-Time Collaborative Document Canvas (CRDTs & WebSockets)',
    roleTarget: 'Fullstack / Frontend Systems Intern (Atlassian, Notion, Figma, Canva)',
    hiringRating: 9.7,
    whyRecruitersLoveIt: 'Proves deep knowledge of complex client-side state, event-driven networking, Conflict-Free Replicated Data Types (CRDTs), and optimistic UI updates under latency.',
    bannedClichésToAvoid: 'Avoid basic socket.io chat room. Must show concurrent conflict-free document/canvas editing with multiple simultaneous cursor positions.',
    architectureCore: [
      'CRDT state sync engine using Yjs or Automerge with delta message compression',
      'WebSocket gateway with room authentication, heartbeat ping-pong, and reconnect recovery',
      'Presence awareness channel displaying live remote user cursor coordinates and selections',
      'Local IndexedDB offline persistence with automatic reconciliation upon reconnection'
    ],
    suggestedTechStack: ['React', 'TypeScript', 'WebSockets', 'Yjs / CRDT', 'Redis Pub/Sub', 'Tailwind CSS'],
    keyResumeBullets: [
      'Engineered real-time collaborative workspace utilizing Yjs CRDTs and WebSockets, enabling peer-to-peer sync with sub-50ms latency across 50+ concurrent editors.',
      'Implemented optimistic offline-first edits stored in IndexedDB, auto-merging conflicting changes upon reconnection without data loss.',
      'Designed remote presence indicators with debounced coordinate broadcasts, slashing network payload volume by 65%.'
    ],
    targetCompanies: ['Atlassian', 'Notion', 'Microsoft', 'Postman', 'Canva']
  },
  {
    id: 'proj-fintech-ledger',
    title: 'Fintech Idempotent Ledger & Multi-Party Escrow Settlement Engine',
    roleTarget: 'Core FinTech / Payments SDE Intern (Razorpay, Stripe, CRED, Goldman Sachs)',
    hiringRating: 9.9,
    whyRecruitersLoveIt: 'Payments engineering is one of the highest-paid specializations. Interviewers test for ACID guarantees, prevention of double spending, and idempotency.',
    bannedClichésToAvoid: 'Avoid simple CRUD payment buttons with fake Stripe tokens. Must implement double-entry bookkeeping ledgers where total debits strictly equal total credits.',
    architectureCore: [
      'Immutable double-entry general ledger with strictly balanced journal entries',
      'Idempotency Key validation layer preventing duplicate charges on client retries or network drops',
      'PostgreSQL row-level locking (`SELECT ... FOR UPDATE`) preventing race conditions on user wallet balances',
      'Webhook signature verification and reconciliation worker reconciling mismatched transaction states'
    ],
    suggestedTechStack: ['Java Spring Boot or Go', 'PostgreSQL', 'Redis (Distributed Lock)', 'Docker', 'Stripe API'],
    keyResumeBullets: [
      'Developed double-entry accounting engine in Go/Postgres ensuring immutable ledger records where sum(debits) = sum(credits) at every transaction state.',
      'Implemented distributed idempotency filter utilizing Redis TTL locks, guaranteeing zero duplicate transactions during network retry storms.',
      'Employed pessimistic row locking on wallet ledgers to eliminate concurrency race conditions under simultaneous debit requests.'
    ],
    targetCompanies: ['Razorpay', 'Stripe', 'CRED', 'Goldman Sachs', 'J.P. Morgan']
  },
  {
    id: 'proj-rag-eval',
    title: 'Enterprise Hybrid Search RAG Platform with Evaluation & Guardrails',
    roleTarget: 'AI/ML & GenAI Engineering Intern (Google, Microsoft, Adobe, Cohere)',
    hiringRating: 9.6,
    whyRecruitersLoveIt: 'Separates serious AI systems engineers from script-kiddies. Proves you know vector indexing, hybrid search math, token economics, and hallucination metrics.',
    bannedClichésToAvoid: 'Avoid 10-line basic OpenAI tutorial scripts. Must feature document chunking comparisons, hybrid dense+sparse retrieval (Pgvector + BM25), and Ragas metrics.',
    architectureCore: [
      'Hybrid retrieval combining vector dense embeddings with BM25 sparse keyword search',
      'Cross-encoder reranking pass improving top-k document retrieval relevance by 35%',
      'Automated evaluation pipeline using Ragas measuring Faithfulness, Answer Relevance, and Context Precision',
      'Semantic caching layer in Redis reducing external LLM API costs and query response times by 55%'
    ],
    suggestedTechStack: ['Python', 'FastAPI', 'Pgvector / Qdrant', 'LangChain / LlamaIndex', 'Redis', 'Docker'],
    keyResumeBullets: [
      'Constructed enterprise RAG system featuring hybrid dense (Pgvector) and sparse (BM25) search with Cohere reranking, elevating Context Precision to 91%.',
      'Implemented semantic embedding caching via Redis, dropping p90 query latency from 2.4s to 180ms and cutting LLM token expenditures by 55%.',
      'Automated synthetic test evaluation harness with Ragas, continuously grading hallucination rates and output fidelity.'
    ],
    targetCompanies: ['Google', 'Microsoft', 'Adobe', 'Databricks', 'Cohere']
  }
];

export const TOPIC_REQUIREMENT_SECTIONS: TopicRequirementSection[] = [
  {
    id: 'topic-dsa',
    category: 'Data Structures & Algorithms (Round 1 & OA Filter)',
    importance: 'Essential',
    estimatedPrepTime: '6 - 8 Weeks',
    description: 'Mandatory coding round hurdle. 90% of companies eliminate 70% of applicants in the Online Assessment (OA) through these core algorithmic patterns.',
    topics: [
      {
        name: 'Sliding Window & Two Pointers',
        description: 'Fixed & dynamic windows, longest substring without repeating characters, minimum window substring.',
        askedBy: ['Amazon', 'Microsoft', 'Google', 'Flipkart'],
        proficiencyRequired: 'Hands-on Coding'
      },
      {
        name: 'Monotonic Stacks & Queues',
        description: 'Next Greater Element I/II, Daily Temperatures, Largest Rectangle in Histogram, Sliding Window Maximum.',
        askedBy: ['Google', 'Atlassian', 'Zepto'],
        proficiencyRequired: 'Hands-on Coding'
      },
      {
        name: 'Graph Algorithms & Traversal',
        description: 'BFS/DFS matrix & adjacency list, Cycle detection (Directed & Undirected), Topological Sort (Kahn’s), Dijkstra shortest path.',
        askedBy: ['Amazon', 'Uber', 'Salesforce', 'Cisco'],
        proficiencyRequired: 'Hands-on Coding'
      },
      {
        name: 'Dynamic Programming Patterns',
        description: '0/1 Knapsack, Coin Change, Longest Increasing Subsequence (LIS in O(N log N)), Partition Equal Subset.',
        askedBy: ['Google', 'Microsoft', 'Goldman Sachs'],
        proficiencyRequired: 'Hands-on Coding'
      },
      {
        name: 'Trees & Binary Search Trees',
        description: 'Lowest Common Ancestor, Tree Diameter, Binary Tree Maximum Path Sum, Level Order & Vertical Traversal.',
        askedBy: ['All Tier-1 & Tier-2 Companies'],
        proficiencyRequired: 'Hands-on Coding'
      }
    ]
  },
  {
    id: 'topic-system-design',
    category: 'System Design & Scalability (Rounds 2 & 3)',
    importance: 'High-Yield',
    estimatedPrepTime: '3 - 4 Weeks',
    description: 'What transforms an applicant from an average programmer into an in-demand hire. Essential for high CTC offers (₹20L+).',
    topics: [
      {
        name: 'Caching Strategies & Redis',
        description: 'Cache-Aside, Write-Through, Write-Behind, Cache Invalidation (TTL vs Event), Thundering Herd & Cache Stampede mitigation.',
        askedBy: ['Swiggy', 'Zomato', 'Uber', 'Amazon'],
        proficiencyRequired: 'System Scale'
      },
      {
        name: 'Database Scaling & Indexing Internals',
        description: 'B+ Tree structure vs Hash index, Composite index leftmost prefix rule, Vertical vs Horizontal sharding, Read replicas & replication lag.',
        askedBy: ['Razorpay', 'Atlassian', 'Microsoft'],
        proficiencyRequired: 'System Scale'
      },
      {
        name: 'Message Queues & Event Streaming',
        description: 'Kafka partition architecture, Consumer Groups, Idempotent producers, RabbitMQ AMQP routing vs Kafka log streams.',
        askedBy: ['Uber', 'Swiggy', 'Flipkart'],
        proficiencyRequired: 'System Scale'
      },
      {
        name: 'Low-Level Design (LLD) & Clean Architecture',
        description: 'SOLID principles in code, Factory, Strategy, Observer, Decorator patterns. Implementing LRU Cache, Parking Lot, Rate Limiter.',
        askedBy: ['Amazon', 'Salesforce', 'Adobe'],
        proficiencyRequired: 'Hands-on Coding'
      }
    ]
  },
  {
    id: 'topic-core-cs',
    category: 'Core CS Fundamentals (Operating Systems, Networks, DBMS)',
    importance: 'Essential',
    estimatedPrepTime: '3 Weeks',
    description: 'Frequent elimination rounds by technical leads. Missing these answers makes candidates look like superficial bootcamp grads.',
    topics: [
      {
        name: 'Operating Systems & Concurrency',
        description: 'Process vs Thread memory layout, Context Switching overhead, Mutex vs Semaphore, Deadlock conditions (Coffman) & prevention, Virtual Memory & Paging.',
        askedBy: ['Google', 'Microsoft', 'Cisco', 'Qualcomm'],
        proficiencyRequired: 'Conceptual'
      },
      {
        name: 'Computer Networks & Web Protocols',
        description: 'TCP 3-Way Handshake & 4-Way Teardown, TCP vs UDP flow control, DNS lookup step-by-step, HTTP/1.1 vs HTTP/2 vs HTTP/3, WebSockets, CORS and HTTPS TLS.',
        askedBy: ['Amazon', 'Cisco', 'Cloudflare', 'Akamai'],
        proficiencyRequired: 'Conceptual'
      },
      {
        name: 'Database Management Systems (DBMS)',
        description: 'ACID guarantees in detail, Transaction Isolation levels (Dirty Read, Non-Repeatable Read, Phantom Read), SQL Joins performance, 1NF to BCNF.',
        askedBy: ['Oracle', 'Goldman Sachs', 'Morgan Stanley'],
        proficiencyRequired: 'Conceptual'
      }
    ]
  },
  {
    id: 'topic-devops-tools',
    category: 'Production Engineering & Tools (Recruiter Magnet)',
    importance: 'Differentiator',
    estimatedPrepTime: '2 Weeks',
    description: 'Interviewers love when an intern can clone a repo, run tests, spin up Docker, and write clean CI/CD YAML on Day 1.',
    topics: [
      {
        name: 'Docker & Containerization',
        description: 'Writing multi-stage Dockerfiles, Docker Compose networking, volume persistence, container image size optimization.',
        askedBy: ['Startups & Product Scale-ups'],
        proficiencyRequired: 'Hands-on Coding'
      },
      {
        name: 'Git & Production Workflows',
        description: 'Git rebase vs merge, resolving merge conflicts, conventional commits, GitHub Actions CI/CD pipeline automation.',
        askedBy: ['All Modern Engineering Teams'],
        proficiencyRequired: 'Hands-on Coding'
      }
    ]
  }
];

export const INITIAL_POLLS: GroupPoll[] = [
  {
    id: 'poll-1',
    question: 'Which project type helped you pass the resume screening round most effectively?',
    totalVotes: 142,
    userVotedOptionId: 'opt-dist',
    options: [
      { id: 'opt-dist', label: 'Distributed Systems / Rate Limiters / Queues', votes: 78 },
      { id: 'opt-realtime', label: 'Real-Time Fullstack (CRDT / WebSockets / Canvas)', votes: 38 },
      { id: 'opt-rag', label: 'Enterprise Hybrid Search / RAG with Benchmarks', votes: 21 },
      { id: 'opt-crud', label: 'Standard Fullstack / MERN E-Commerce (CRUD)', votes: 5 }
    ]
  },
  {
    id: 'poll-2',
    question: 'Which topic are you finding hardest to master before campus drives?',
    totalVotes: 119,
    options: [
      { id: 'opt-dp', label: 'Dynamic Programming & Tree Algorithms', votes: 52 },
      { id: 'opt-lld', label: 'Low-Level System Design & Concurrency Locks', votes: 36 },
      { id: 'opt-os', label: 'Operating Systems & Concurrency Theory', votes: 20 },
      { id: 'opt-dbms', label: 'Database Transaction Isolation & Indexing', votes: 11 }
    ]
  }
];
