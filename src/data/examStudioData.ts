import { PresentationDeck, PdfPageItem } from '../types';

export interface PptTemplateOption {
  id: string;
  name: string;
  examType: 'Project Viva' | 'Technical Seminar' | 'Lab Exam Viva' | 'Midterm Presentation';
  description: string;
  defaultSlideCount: number;
  badge: string;
  recommendedTheme: 'academic-indigo' | 'university-navy' | 'emerald-minimal' | 'cyber-dark' | 'sunset-coral';
}

export const PPT_TEMPLATES: PptTemplateOption[] = [
  {
    id: 'tmpl-25-slide-capstone',
    name: 'Full 25-Slide Capstone Defense (Complete Rubric)',
    examType: 'Project Viva',
    description: 'Complete 25-slide master defense covering all university viva requirements from literature survey to benchmarks & Q&A defense.',
    defaultSlideCount: 25,
    badge: '★ Full 25-Slide Master Deck',
    recommendedTheme: 'academic-indigo'
  },
  {
    id: 'tmpl-project-defense',
    name: 'Final Year / Capstone Project Defense',
    examType: 'Project Viva',
    description: 'Designed specifically for external examiners: Problem statement, architectural diagrams, benchmark charts, and future scope.',
    defaultSlideCount: 6,
    badge: 'High Impact Viva',
    recommendedTheme: 'academic-indigo'
  },
  {
    id: 'tmpl-tech-seminar',
    name: 'Technical Seminar & Research Paper',
    examType: 'Technical Seminar',
    description: 'Comprehensive research structure: Literature review, methodology, mathematical formulations, and comparison tables.',
    defaultSlideCount: 5,
    badge: 'Academic Seminar',
    recommendedTheme: 'university-navy'
  },
  {
    id: 'tmpl-lab-viva',
    name: 'Hands-on Lab Demonstration & Viva',
    examType: 'Lab Exam Viva',
    description: 'Concise layout with code snippets, terminal execution outputs, and time complexity proof.',
    defaultSlideCount: 4,
    badge: 'Lab Exam Practical',
    recommendedTheme: 'emerald-minimal'
  },
  {
    id: 'tmpl-midterm-review',
    name: 'Subject Case Study & Algorithm Analysis',
    examType: 'Midterm Presentation',
    description: 'Focus on comparative algorithms, real-world case study bottlenecks, and Q&A defense prep.',
    defaultSlideCount: 5,
    badge: 'Coursework Defense',
    recommendedTheme: 'cyber-dark'
  }
];

export const INITIAL_PRESENTATION_DECKS: PresentationDeck[] = [
  {
    id: 'deck-distributed-rate-limiter',
    title: 'Distributed Token-Bucket Rate Limiter & Concurrency Defense',
    subject: 'CS601: Distributed Systems & Advanced Algorithms',
    authorName: 'Likith E.',
    authorRoll: '22CS084',
    theme: 'academic-indigo',
    examType: 'Project Viva',
    lastEdited: 'Just now',
    slides: [
      {
        id: 'slide-1',
        layout: 'title',
        title: 'High-Throughput Distributed Rate Limiter',
        subtitle: 'Final Examination Project Viva • Dept. of Computer Science & Engineering',
        bullets: [
          'Candidate: Likith E. (Roll: 22CS084)',
          'Faculty Mentor: Dr. Priya Swaminathan',
          'Target Scale: 12,000 Requests/Sec with Zero Race Conditions'
        ],
        speakerNotes: 'Good morning respected external examiners and faculty. Today I present our production-grade distributed rate limiter built using atomic Redis Lua scripts and Go.',
        mistakes: []
      },
      {
        id: 'slide-2',
        layout: 'two-column',
        title: 'Problem Statement & Existing Flaws',
        subtitle: 'Why standard in-memory rate limiters fail under distributed horizontal scaling',
        bullets: [],
        columnLeftTitle: '❌ Standard In-Memory Limitations',
        columnLeft: [
          'Local Node Bias: Multi-instance deployments cannot share token quotas across pods',
          'Race Conditions: Non-atomic GET and SET commands lead to double-spending of tokens',
          'Cascading Failures: Unhandled traffic spikes overwhelm downstream databases'
        ],
        columnRightTitle: '✅ Our Distributed Solution',
        columnRight: [
          'Centralized Atomic Lua scripts executed in single-threaded Redis event loop',
          'Sliding Window Log & Token Bucket dual enforcement for burst tolerance',
          'Dead-Letter Queue (DLQ) integration for resilient worker task offloading'
        ],
        speakerNotes: 'Point out to examiners that naive in-memory limiters fail the moment you deploy more than one Docker container. Emphasize why atomic synchronization in Redis is mathematically sound.',
        mistakes: [
          {
            id: 'mst-1',
            originalText: 'Multi-instance deployments cannot share token quotas across pods',
            suggestedText: 'Multi-pod Kubernetes clusters cannot synchronize local token counters without distributed consensus',
            reason: 'Examiners prefer precise distributed systems terminology (multi-pod clusters vs generic local nodes).',
            field: 'bullets'
          }
        ]
      },
      {
        id: 'slide-3',
        layout: 'code-architecture',
        title: 'Core Engine: Atomic Redis Lua Execution',
        subtitle: 'Preventing check-then-act race conditions at 12,000 RPS',
        bullets: [
          'Atomic execution eliminates mutex locking overhead in application code',
          'Tokens calculated on demand using elapsed milliseconds since last refill'
        ],
        codeSnippet: `-- Atomic Token Bucket in Redis Lua
local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local refill_rate = tonumber(ARGV[2])
local now = tonumber(ARGV[3])
local requested = tonumber(ARGV[4])

local data = redis.call('HMGET', key, 'tokens', 'last_updated')
local tokens = tonumber(data[1]) or capacity
local last_updated = tonumber(data[2]) or now

-- Refill tokens based on elapsed delta
local delta = math.max(0, now - last_updated)
tokens = math.min(capacity, tokens + delta * refill_rate)

if tokens >= requested then
  tokens = tokens - requested
  redis.call('HMSET', key, 'tokens', tokens, 'last_updated', now)
  redis.call('EXPIRE', key, 60)
  return 1 -- Allowed
else
  return 0 -- Rejected (HTTP 429)
end`,
        codeLanguage: 'lua',
        speakerNotes: 'If asked why Lua is faster than distributed locks (e.g. Redlock), explain that Lua runs internally without multiple network round-trips.',
        mistakes: []
      },
      {
        id: 'slide-4',
        layout: 'image-text',
        title: 'Stress Benchmark & Latency Results',
        subtitle: 'Tested using k6 load testing with 500 concurrent virtual users',
        bullets: [
          'Throughput Peak: 12,450 requests/second sustained over 10 minutes',
          'Latency Profile: p95 = 18.2ms, p99 = 27.6ms under maximum saturation',
          'Zero Duplicate Tokens: 0.00% race condition leakage verified by test assertions'
        ],
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600',
        speakerNotes: 'Direct examiners to the p99 latency metric. 27.6ms is well under industry enterprise SLAs (typically <50ms).',
        mistakes: []
      },
      {
        id: 'slide-5',
        layout: 'conclusion',
        title: 'Conclusion & Viva Defense Summary',
        subtitle: 'Key takeaways and industry readiness',
        bullets: [
          'Successfully decoupled rate limiting from application logic into a high-performance proxy',
          'Published open-source benchmark suite reproducible with single Docker Compose command',
          'Ready for questions from the external board'
        ],
        speakerNotes: 'Thank the examination panel and invite questions regarding failure scenarios, Redis cluster failover, or sliding window memory overhead.',
        mistakes: []
      }
    ]
  },
  {
    id: 'deck-enterprise-rag',
    title: 'Enterprise Hybrid RAG with Cross-Encoder & Hallucination Guardrails',
    subject: 'CS603: Artificial Intelligence & Natural Language Systems',
    authorName: 'Aarav Patel',
    authorRoll: '22CS019',
    theme: 'university-navy',
    examType: 'Technical Seminar',
    lastEdited: 'Yesterday',
    slides: [
      {
        id: 'rag-slide-1',
        layout: 'title',
        title: 'Enterprise Hybrid-Search RAG Platform',
        subtitle: 'Technical Seminar Presentation on Mitigating Hallucinations in LLMs',
        bullets: [
          'Presenter: Aarav Patel (22CS019)',
          'Evaluation Framework: Ragas Automated Metric Suite',
          'Hybrid Architecture: Pgvector (Dense) + BM25 (Sparse)'
        ],
        speakerNotes: 'Welcome faculty and classmates. Today I will demonstrate how combining sparse BM25 search with dense vector indexing resolves retrieval failures in domain-specific technical documentation.',
        mistakes: []
      },
      {
        id: 'rag-slide-2',
        layout: 'two-column',
        title: 'Dense Vector Search vs Hybrid Search',
        subtitle: 'Why pure cosine similarity fails on technical code and error IDs',
        bullets: [],
        columnLeftTitle: 'Cosine Embedding Limitations',
        columnLeft: [
          'Fails on exact serial numbers, error codes, and technical identifiers (e.g. ERR_502_BAD_GW)',
          'Embedding models dilute token importance across 1536 dimensions',
          'High API costs for repeated query embeddings without local caching'
        ],
        columnRightTitle: 'Hybrid RRF Advantage',
        columnRight: [
          'BM25 catches exact keyword tokens with frequency scoring',
          'Reciprocal Rank Fusion (RRF) normalizes rank positions fairly',
          'Context Precision elevated from 68% to 92.4%'
        ],
        speakerNotes: 'Give the classic example: if a user searches for an exact error code, vector search returns generic articles about errors, but BM25 retrieves the exact troubleshooting manual.',
        mistakes: []
      },
      {
        id: 'rag-slide-3',
        layout: 'conclusion',
        title: 'Evaluation Metrics & Benchmark Findings',
        subtitle: 'Ragas automated testing results across 200 ground truth queries',
        bullets: [
          'Faithfulness Score: 0.94 (Reduced hallucinations by 42%)',
          'Context Recall: 0.91 across multi-hop reasoning questions',
          'Semantic Redis Caching slashed p90 latency from 2.8s to 180ms'
        ],
        speakerNotes: 'Conclude with quantifiable results. This separates engineering research from basic prompt wrapper demos.',
        mistakes: []
      }
    ]
  }
];

export const SAMPLE_EXAM_IMAGES = [
  {
    id: 'sample-img-1',
    name: 'Distributed_System_Architecture_Diagram.png',
    label: 'Architecture Flowchart (CS601)',
    url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
    description: 'System microservices topology, Redis cluster, and Go worker queues.'
  },
  {
    id: 'sample-img-2',
    name: 'Database_ER_Schema_Diagram.png',
    label: 'ER Relational Schema (CS602)',
    url: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800',
    description: 'Third Normal Form (3NF) relational tables with foreign keys and composite indexes.'
  },
  {
    id: 'sample-img-3',
    name: 'Algorithm_Flowchart_Proof.png',
    label: 'Algorithm Logic Flowchart (CS601)',
    url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
    description: 'Dynamic programming decision tree and state transition diagram.'
  },
  {
    id: 'sample-img-4',
    name: 'Throughput_Benchmark_Graph.png',
    label: 'Throughput Benchmark Curve (CS601)',
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    description: 'Latency vs Concurrency saturation graph showing 12,000 RPS.'
  },
  {
    id: 'sample-img-5',
    name: 'Circuit_Block_Diagram_Hardware.png',
    label: 'Hardware Pinout & Circuit Schematic',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
    description: 'Microcontroller pin assignment, SPI bus, and sensor interface schematic.'
  }
];

export const generate25SlideDeck = (
  deckTitle: string,
  subject: string,
  authorName: string,
  authorRoll: string
): PresentationDeck => {
  return {
    id: `deck-25-slides-${Date.now()}`,
    title: deckTitle || 'Comprehensive 25-Slide Capstone Defense',
    subject: subject || 'CS601: Advanced Engineering Capstone Viva',
    authorName: authorName || 'Candidate',
    authorRoll: authorRoll || '22CS084',
    theme: 'academic-indigo',
    examType: 'Project Viva',
    lastEdited: 'Just now',
    slides: [
      {
        id: 'sl-25-1',
        layout: 'title',
        title: deckTitle || 'High-Throughput Distributed Rate Limiter & Concurrency Engine',
        subtitle: `Bachelor of Technology Capstone Defense • Department of Computer Science`,
        bullets: [
          `Candidate: ${authorName} (${authorRoll})`,
          'Faculty Advisor: Dr. Priya Swaminathan (Associate Professor)',
          'Examination Committee: External & Internal Examiners Panel'
        ],
        speakerNotes: 'Slide 1: Good morning respected external examiners and faculty members. Today I present our comprehensive final examination capstone defense.'
      },
      {
        id: 'sl-25-2',
        layout: 'bullets',
        title: 'Outline & Examination Rubric Roadmap',
        subtitle: 'Structure of the 25-slide technical defense',
        bullets: [
          'Part I: Motivation, Problem Statement, & Rigorous Literature Survey (Slides 3–7)',
          'Part II: Theoretical Formulation, Mathematical Model & Architecture (Slides 8–15)',
          'Part III: Implementation, Atomic Code & Concurrency Proof (Slides 16–19)',
          'Part IV: Empirical Benchmarks, Fault Tolerance & Cost Analysis (Slides 20–22)',
          'Part V: Viva Board Defense Prep, Future Scope & Conclusions (Slides 23–25)'
        ],
        speakerNotes: 'Slide 2: Provide examiners with a quick 30-second roadmap of the presentation covering theory, implementation, and empirical validation.'
      },
      {
        id: 'sl-25-3',
        layout: 'bullets',
        title: 'Motivation & Industry Background',
        subtitle: 'Why high-concurrency rate limiting is critical in modern distributed clouds',
        bullets: [
          'Hyper-Scale Traffic Surges: E-commerce flash sales & FinTech APIs experience 10x traffic spikes within milliseconds',
          'Cascading Server Outages: Unbounded traffic causes thread pool starvation and database connection pool exhaustion',
          'SLA Financial Penalties: Breaching p99 latency SLAs violates contractual enterprise reliability guarantees'
        ],
        speakerNotes: 'Slide 3: Explain why rate limiting is not just an optional security filter, but a foundational survival layer for cloud services.'
      },
      {
        id: 'sl-25-4',
        layout: 'two-column',
        title: 'Problem Statement & Scope of Work',
        subtitle: 'Defining the specific engineering boundaries investigated',
        bullets: [],
        columnLeftTitle: 'Scope Defined',
        columnLeft: [
          'Targeting distributed clusters exceeding 10,000 requests per second',
          'Sub-30ms p99 latency overhead across geo-distributed nodes',
          'Zero data loss during broker partitions with dead-letter queue replay'
        ],
        columnRightTitle: 'Out of Scope',
        columnRight: [
          'Single-process monolithic in-memory mutexes (proven non-scalable)',
          'Centralized SQL locking (causes severe database bottleneck)',
          'Static unweighted IP blacklisting (inadequate for distributed bots)'
        ],
        speakerNotes: 'Slide 4: Clearly demarcate the scope. External examiners reward candidates who define precise technical boundaries.'
      },
      {
        id: 'sl-25-5',
        layout: 'bullets',
        title: 'Literature Survey & Existing Approaches',
        subtitle: 'Review of peer-reviewed papers and industry state of the art',
        bullets: [
          'Leaky Bucket (Nagle et al.): Smooths bursty traffic but penalizes legitimate bursty client requests with unnecessary drops',
          'Fixed Window Counter: Vulnerable to 2x quota exploitation at window boundary transitions',
          'Sliding Window Log: High space complexity O(N) memory consumption storing individual timestamps for high-volume users',
          'Token Bucket with Atomic Scripts: Optimal blend of burst allowance and O(1) space efficiency'
        ],
        speakerNotes: 'Slide 5: Contrast the four classic rate limiting algorithms. Point out why our hybrid Token Bucket approach was selected.'
      },
      {
        id: 'sl-25-6',
        layout: 'two-column',
        title: 'Comparative Analysis Matrix',
        subtitle: 'Theoretical tradeoff comparison across standard algorithms',
        bullets: [],
        columnLeftTitle: 'Algorithm Complexity',
        columnLeft: [
          'Fixed Window: O(1) Time, O(1) Space, Boundary Flaw: Critical',
          'Sliding Window Log: O(log N) Time, O(N) Space, High RAM cost',
          'Sliding Window Counter: O(1) Time, O(1) Space, Approx Error: 5%',
          'Atomic Token Bucket: O(1) Time, O(1) Space, Accuracy: 100%'
        ],
        columnRightTitle: 'Key Takeaways for Examiners',
        columnRight: [
          'Atomic Token Bucket provides mathematically exact enforcement with zero memory overhead growth under high load',
          'Ideal for distributed Redis caching layers'
        ],
        speakerNotes: 'Slide 6: Highlight that the Atomic Token Bucket provides exact accuracy with constant O(1) space complexity.'
      },
      {
        id: 'sl-25-7',
        layout: 'bullets',
        title: 'Research Gaps Identified & Core Objectives',
        subtitle: 'Specific technical questions addressed in this capstone work',
        bullets: [
          'Gap 1: Preventing check-then-act race conditions without expensive distributed consensus locks (e.g. Paxos/Raft)',
          'Gap 2: Maintaining deterministic throughput when network connections to cache nodes experience packet jitter',
          'Gap 3: Automated health check and exponential backoff retry jitter for dropped worker queues'
        ],
        speakerNotes: 'Slide 7: Formulate the research gaps as questions: How do we prevent race conditions without 200ms consensus delays?'
      },
      {
        id: 'sl-25-8',
        layout: 'image-text',
        title: 'High-Level System Architecture',
        subtitle: 'End-to-end distributed topology and ingress flow',
        bullets: [
          'Ingress Reverse Proxy: Intercepts client payloads before upstream microservices',
          'Redis Atomic Cache Cluster: Evaluates token bucket state via single-hop Lua execution',
          'Asynchronous Task Queue: Routes accepted jobs to background Go worker daemons'
        ],
        imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
        speakerNotes: 'Slide 8: Walk the panel through the ingress traffic path from the reverse proxy down to the Redis cache cluster.'
      },
      {
        id: 'sl-25-9',
        layout: 'two-column',
        title: 'Component Decomposition & Microservices',
        subtitle: 'Detailed responsibilities of architectural subsystems',
        bullets: [],
        columnLeftTitle: 'Edge & Gateway Layer',
        columnLeft: [
          'API Gateway: TLS 1.3 termination, JWT validation, client IP extraction',
          'Rate Limit Middleware: Generates HMAC client fingerprint and evaluates quota',
          'Metrics Exporter: Emits p95/p99 prometheus counters every 100ms'
        ],
        columnRightTitle: 'Worker & Storage Layer',
        columnRight: [
          'Redis Cluster: Master-replica sharding with hash slot distribution',
          'Worker Pool: Asynchronous task executor with auto-scaling Goroutines',
          'Dead-Letter Store: Persistent storage for failed or poisoned payloads'
        ],
        speakerNotes: 'Slide 9: Detail the separation of concerns. Emphasize that the API Gateway never queries persistent disks synchronously.'
      },
      {
        id: 'sl-25-10',
        layout: 'bullets',
        title: 'Mathematical Formulation of Token Refill',
        subtitle: 'Continuous time state transition equations',
        bullets: [
          'Tokens Available at time t: T(t) = min(C, T(t_last) + (t - t_last) * R)',
          'Where C = Maximum Burst Capacity, R = Token Refill Rate per millisecond',
          'Admission Condition: If T(t) >= Requested_Cost then Accept, else Reject (HTTP 429)',
          'Updated State: T_new = T(t) - Requested_Cost, t_last = t'
        ],
        speakerNotes: 'Slide 10: Show the continuous-time refill formula. Emphasize that we do not run cron timers; tokens are calculated lazily on request arrival.'
      },
      {
        id: 'sl-25-11',
        layout: 'code-architecture',
        title: 'Atomic Redis Lua Script Execution',
        subtitle: 'Eliminating check-then-act race conditions at 12,000 RPS',
        bullets: [
          'Single-threaded Redis event loop guarantees atomic execution without mutex contention',
          'State retrieved and updated in a single in-memory cycle'
        ],
        codeSnippet: `-- Atomic Token Bucket Script
local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local refill_rate = tonumber(ARGV[2])
local now = tonumber(ARGV[3])
local cost = tonumber(ARGV[4])

local data = redis.call('HMGET', key, 'tokens', 'last_updated')
local tokens = tonumber(data[1]) or capacity
local last_updated = tonumber(data[2]) or now

-- Compute elapsed refill
local elapsed = math.max(0, now - last_updated)
tokens = math.min(capacity, tokens + elapsed * refill_rate)

if tokens >= cost then
  tokens = tokens - cost
  redis.call('HMSET', key, 'tokens', tokens, 'last_updated', now)
  redis.call('EXPIRE', key, 60)
  return 1 -- Allowed
else
  return 0 -- Rate Limited
end`,
        codeLanguage: 'lua',
        speakerNotes: 'Slide 11: Point out why standard GET then SET is broken. The Lua script executes atomically inside Redis.'
      },
      {
        id: 'sl-25-12',
        layout: 'image-text',
        title: 'Relational & Time-Series Data Schema',
        subtitle: 'ER schema modeling for audit trails and billing telemetry',
        bullets: [
          'Clients Table: Account ID, Tier (Free/Pro/Enterprise), Max QPS quota',
          'RateLimitState (Redis Hash): Tokens balance, Last Refill epoch',
          'ViolationAuditLogs (TimescaleDB): Timestamp, IP, ClientID, DroppedCount'
        ],
        imageUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800',
        speakerNotes: 'Slide 12: Explain that ephemeral counters live in Redis RAM, while long-term violation audits stream into TimescaleDB.'
      },
      {
        id: 'sl-25-13',
        layout: 'bullets',
        title: 'API Protocols & Gateway Contract',
        subtitle: 'HTTP standard compliance (RFC 6585) & gRPC streaming',
        bullets: [
          'Standard Response Headers: X-RateLimit-Limit, X-RateLimit-Remaining, Retry-After',
          'Error Payload: HTTP 429 Too Many Requests with JSON error metadata',
          'gRPC Interceptor: Low-overhead binary Protobuf metadata inspection (<0.8ms overhead)'
        ],
        speakerNotes: 'Slide 13: Note the RFC compliance. Providing standard headers allows SDK clients to back off politely.'
      },
      {
        id: 'sl-25-14',
        layout: 'bullets',
        title: 'Security Hardening & Distributed Denial of Service (DDoS) Mitigation',
        subtitle: 'Layer-7 protection mechanisms',
        bullets: [
          'IP Spoofing Countermeasure: Combines X-Forwarded-For with authenticated API token HMAC',
          'Sliding Penalty Box: Clients triggering >50 rejections in 10s are jailed for 5 minutes',
          'Memory Exhaustion Protection: Redis maxmemory policy with volatile-lru eviction'
        ],
        speakerNotes: 'Slide 14: Discuss security: how the system prevents malicious clients from evading rate limits using IP rotation.'
      },
      {
        id: 'sl-25-15',
        layout: 'two-column',
        title: 'Deployment Topology & Cloud Infrastructure',
        subtitle: 'Containerized staging setup for reproducible verification',
        bullets: [],
        columnLeftTitle: 'Infrastructure Stack',
        columnLeft: [
          'Docker Compose multi-container testbed with simulated network lag',
          'Redis 7.2 with AOF persistence enabled',
          'Go 1.22 compiled binaries running in alpine scratch containers'
        ],
        columnRightTitle: 'Resource Footprint',
        columnRight: [
          'RAM Consumption: <64MB per 100,000 active client token buckets',
          'CPU Utilization: <18% core usage at 8,000 requests/sec',
          'Zero external proprietary cloud dependencies'
        ],
        speakerNotes: 'Slide 15: Highlight the lightweight resource footprint: less than 64MB RAM for 100k active keys.'
      },
      {
        id: 'sl-25-16',
        layout: 'bullets',
        title: 'Experimental Setup & Test Methodology',
        subtitle: 'Empirical verification across multiple stress profiles',
        bullets: [
          'Load Testing Engine: k6 open-source distributed load generator',
          'Virtual Users: Scaled from 50 to 500 concurrent threads over 15 minutes',
          'Telemetry Collection: Prometheus exporter scraping node metrics at 1-second intervals'
        ],
        speakerNotes: 'Slide 16: Describe the testing harness. Emphasize that tests were run on realistic hardware, not mocked memory loops.'
      },
      {
        id: 'sl-25-17',
        layout: 'image-text',
        title: 'Throughput & Scalability Benchmark Results',
        subtitle: 'Validating linear scaling from 2,000 to 12,000+ RPS',
        bullets: [
          'Peak Sustained Throughput: 12,450 requests/second with zero dropped connections',
          'Linear Worker Scaling: Adding 2 worker pods increased throughput by 94%',
          'Zero False-Positive Rate: Verified 0.00% legitimate requests dropped'
        ],
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
        speakerNotes: 'Slide 17: Present the core empirical victory: 12,450 RPS sustained over 10 minutes without crashes.'
      },
      {
        id: 'sl-25-18',
        layout: 'two-column',
        title: 'Latency Profile: p50, p95 & p99 Analysis',
        subtitle: 'Microsecond-level breakdown under peak traffic load',
        bullets: [],
        columnLeftTitle: 'Measured Latencies',
        columnLeft: [
          'p50 (Median): 4.2ms end-to-end response time',
          'p90: 12.8ms including network transmission',
          'p95: 18.2ms under 80% saturation load',
          'p99: 27.6ms under maximum stress test'
        ],
        columnRightTitle: 'SLA Evaluation',
        columnRight: [
          'Standard Tier-1 Enterprise SLA: p99 < 50ms (Passed with 44% margin)',
          'Redis execution time alone accounted for only 0.42ms of total delay'
        ],
        speakerNotes: 'Slide 18: Focus on the p99 latency metric (27.6ms). This proves the candidate understands production SLA compliance.'
      },
      {
        id: 'sl-25-19',
        layout: 'bullets',
        title: 'Fault Tolerance & Chaos Injection Testing',
        subtitle: 'Resilience under node crashes and network partitions',
        bullets: [
          'Redis Node Crash: Automatic Sentinel failover completed within 1.8 seconds',
          'Network Partition: Worker queue automatically buffered 50,000 jobs in local ring buffer',
          'Zero Duplicate Processing: Guaranteed exactly-once execution via client idempotency keys'
        ],
        speakerNotes: 'Slide 19: Discuss chaos testing: what happens when Redis master dies? Sentinel promotes replica in 1.8s.'
      },
      {
        id: 'sl-25-20',
        layout: 'bullets',
        title: 'Cost Analysis & Cloud Economics',
        subtitle: 'Financial comparison vs commercial API gateway rate limiters',
        bullets: [
          'AWS API Gateway Throttling Cost: ₹290 per million requests = ~₹3,15,000/month at 40M daily calls',
          'Our Self-Hosted Cluster: 2 t4g.medium instances + ElastiCache = ~₹7,000/month total',
          'Estimated Cloud Savings: 97.7% reduction in API gateway operational expense'
        ],
        speakerNotes: 'Slide 20: Cost economics! External examiners love seeing that the candidate calculated return on investment (ROI).'
      },
      {
        id: 'sl-25-21',
        layout: 'two-column',
        title: 'Viva Defense Prep: Concurrency & Lock Questions',
        subtitle: 'Anticipated technical questions from the external examiners',
        bullets: [],
        columnLeftTitle: 'Examiner Question',
        columnLeft: [
          'Q1: "Why not use Redlock distributed lock instead of Lua scripts?"',
          'Q2: "What happens if the system clock drifts backwards across nodes?"'
        ],
        columnRightTitle: 'Model Candidate Defense',
        columnRight: [
          'A1: Redlock requires 3-5 network round-trips adding 15ms latency per call. Lua executes atomically in a single in-memory hop.',
          'A2: We use monotonic time counters and enforce NTP synchronization with maximum 5ms threshold drift.'
        ],
        speakerNotes: 'Slide 21: Review these two critical questions. Examiners almost always ask about distributed locks and clock drift.'
      },
      {
        id: 'sl-25-22',
        layout: 'two-column',
        title: 'Viva Defense Prep: Failure & Recovery Questions',
        subtitle: 'Answering high-availability and partition scenarios',
        bullets: [],
        columnLeftTitle: 'Examiner Question',
        columnLeft: [
          'Q3: "If Redis runs completely out of memory, does your gateway fail open or closed?"',
          'Q4: "How do you prevent worker poison pills from blocking the queue?"'
        ],
        columnRightTitle: 'Model Candidate Defense',
        columnRight: [
          'A3: Configurable fail-open with emergency fallback local token bucket to avoid total customer blackout.',
          'A4: Poison pills route to Dead-Letter Queue (DLQ) after 3 failed retries with exponential backoff jitter.'
        ],
        speakerNotes: 'Slide 22: Prepare to defend fail-open vs fail-closed. In high-value payment flows you fail closed; in streaming you fail open.'
      },
      {
        id: 'sl-25-23',
        layout: 'bullets',
        title: 'Key Project Deliverables & Contributions',
        subtitle: 'Summary of artifacts submitted to the examination department',
        bullets: [
          'Production Go & Redis Lua codebase with 94% unit test coverage',
          'Automated k6 benchmarking suite with reproducible Docker Compose manifest',
          'Published project technical documentation & ATS-ready architectural whitepaper'
        ],
        speakerNotes: 'Slide 23: Summarize your concrete engineering deliverables: source repository, tests, documentation.'
      },
      {
        id: 'sl-25-24',
        layout: 'bullets',
        title: 'Future Enhancements & Advanced Research',
        subtitle: 'Identified opportunities for phase-2 development',
        bullets: [
          'Integration of eBPF / XDP kernel-level packet drops to bypass user space at 100,000 RPS',
          'Machine Learning adaptive quota scaling predicting traffic surges based on historical seasonality',
          'Multi-region active-active CRDT synchronization for cross-continental clusters'
        ],
        speakerNotes: 'Slide 24: Show intellectual curiosity by proposing eBPF kernel drops and ML adaptive quotas.'
      },
      {
        id: 'sl-25-25',
        layout: 'conclusion',
        title: 'Conclusion & Viva Examination Defense',
        subtitle: 'Formal conclusion and invitation for board questions',
        bullets: [
          'Engineered and benchmarked a distributed rate limiter sustaining 12,450 RPS at <28ms p99 latency',
          'Eliminated race conditions via atomic Lua scripts and provided resilient Dead-Letter Queue recovery',
          'Thank you to the faculty and board of examiners. I welcome your questions.'
        ],
        speakerNotes: 'Slide 25: Conclude confidently with a smile. Thank the external examiner by name and invite questions.'
      }
    ]
  };
};

export const generate25PageExamBooklet = (
  studentName: string,
  rollNumber: string,
  courseCode: string = 'CS601'
): PdfPageItem[] => {
  const titles = [
    'Cover Sheet & Hall Ticket Verification',
    'Question 1a: Distributed Systems Architecture Flowchart',
    'Question 1b: Token Bucket Mathematical Derivation',
    'Question 2a: Relational Schema & 3NF Normalization Diagram',
    'Question 2b: Entity-Relationship Diagram with Foreign Keys',
    'Question 3a: Algorithm State Transition Decision Tree',
    'Question 3b: Dynamic Programming Memoization Table',
    'Question 4a: Concurrency Race Condition Proof & Lua Script',
    'Question 4b: Worker Thread Pool Heartbeat State Diagram',
    'Question 5a: Microservices Ingress & Reverse Proxy Topology',
    'Question 5b: Load Balancer Consistent Hashing Ring Diagram',
    'Question 6a: Throughput Saturation Benchmark Curve',
    'Question 6b: p95 & p99 Latency vs Concurrency Graph',
    'Question 7a: Dead-Letter Queue (DLQ) Retry Logic Flowchart',
    'Question 7b: Exponential Backoff with Jitter Timing Diagram',
    'Question 8a: Circuit Schematic & Hardware Microcontroller Pinout',
    'Question 8b: SPI & I2C Bus Timing Waveform Diagram',
    'Question 9a: Database Query Execution Plan & B-Tree Index',
    'Question 9b: Sharding Key Distribution & Hash Slot Map',
    'Question 10a: Security TLS 1.3 Handshake & Handshake Keys',
    'Question 10b: JWT Signature Verification & Claims Topology',
    'Question 11a: Unit Test Matrix & Code Coverage Trace Sheet',
    'Question 11b: Chaos Engineering Failure Injection Results',
    'Question 12a: Cost & Resource Utilization Comparison Chart',
    'Question 12b: Final Summary, Examiner Signatures & Honor Code'
  ];

  const imageUrls = [
    SAMPLE_EXAM_IMAGES[0].url,
    SAMPLE_EXAM_IMAGES[1].url,
    SAMPLE_EXAM_IMAGES[2].url,
    SAMPLE_EXAM_IMAGES[3].url,
    SAMPLE_EXAM_IMAGES[4].url
  ];

  return titles.map((title, index) => {
    return {
      id: `pdf-page-${index + 1}`,
      pageNumber: index + 1,
      name: `Exam_Sheet_Page_${String(index + 1).padStart(2, '0')}.png`,
      imageUrl: imageUrls[index % imageUrls.length],
      rotation: 0,
      annotations: [],
      note: `Page ${index + 1} of 25: ${title} (${courseCode})`,
      hasMistakeRectified: false
    };
  });
};

