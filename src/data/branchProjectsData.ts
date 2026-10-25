import { BranchProjectItem, EngineeringBranchId, ProjectSquadMessage } from '../types';

export interface BranchDefinition {
  id: EngineeringBranchId;
  label: string;
  shortLabel: string;
  badge: string;
  iconName: string;
  description: string;
  averageHighPackage: string;
  activeStudentsInPortal: number;
}

export const ENGINEERING_BRANCHES: BranchDefinition[] = [
  {
    id: 'ALL',
    label: 'All Engineering Branches',
    shortLabel: 'All Branches',
    badge: 'Universal Core',
    iconName: 'Sparkles',
    description: 'Explore high-yield software projects across all domains and high-CTC recruitment tracks.',
    averageHighPackage: '₹22 - ₹48 LPA',
    activeStudentsInPortal: 168
  },
  {
    id: 'CSE_IT',
    label: 'Computer Science & Information Technology',
    shortLabel: 'CSE / IT',
    badge: 'High Scale & Distributed',
    iconName: 'Code2',
    description: 'High-concurrency systems, distributed storage, real-time collaboration engines, and API microservices.',
    averageHighPackage: '₹24 - ₹50 LPA',
    activeStudentsInPortal: 64
  },
  {
    id: 'AIML_DS',
    label: 'AI, Machine Learning & Data Science',
    shortLabel: 'AI / ML / Data',
    badge: 'Production GenAI & ML',
    iconName: 'Cpu',
    description: 'Enterprise hybrid RAG engines, low-latency streaming fraud detection, and Edge model quantization.',
    averageHighPackage: '₹26 - ₹52 LPA',
    activeStudentsInPortal: 42
  },
  {
    id: 'ECE_EMBEDDED',
    label: 'Electronics, Communication & Embedded IoT',
    shortLabel: 'ECE / Embedded',
    badge: 'Firmware & Edge Computing',
    iconName: 'Layers',
    description: 'FreeRTOS telemetry edge gateways, real-time DSP audio processing, and automotive CAN-Bus firmware.',
    averageHighPackage: '₹18 - ₹42 LPA',
    activeStudentsInPortal: 28
  },
  {
    id: 'EEE_SMART',
    label: 'Electrical & Smart Grid Systems',
    shortLabel: 'EEE / Smart Power',
    badge: 'SCADA & Energy Tech',
    iconName: 'Flame',
    description: 'Smart microgrid load balancers, EV battery management digital twin, and industrial SCADA protocols.',
    averageHighPackage: '₹16 - ₹38 LPA',
    activeStudentsInPortal: 18
  },
  {
    id: 'MECH_ROBOTICS',
    label: 'Mechanical, Robotics & Mechatronics',
    shortLabel: 'Mechanical / Robotics',
    badge: 'ROS2 & Digital Twin',
    iconName: 'TrendingUp',
    description: 'Autonomous mobile robot (AMR) navigation stacks, cloud parametric 3D CAD/FEA engines, and inverse kinematics.',
    averageHighPackage: '₹18 - ₹42 LPA',
    activeStudentsInPortal: 16
  },
  {
    id: 'CIVIL_GIS',
    label: 'Civil & Smart Infrastructure (GIS / BIM)',
    shortLabel: 'Civil / Smart Infra',
    badge: 'Spatial & BIM Tech',
    iconName: 'Database',
    description: 'Geospatial flood mitigation platforms (PostGIS), BIM 3D structural sensor monitoring, and predictive asset safety.',
    averageHighPackage: '₹15 - ₹34 LPA',
    activeStudentsInPortal: 12
  }
];

export const BRANCH_PROJECTS: BranchProjectItem[] = [
  // --- CSE / IT PROJECTS ---
  {
    id: 'proj-cse-distributed-queue',
    branch: 'CSE_IT',
    branchLabel: 'Computer Science & IT',
    title: 'High-Throughput Distributed Rate Limiter & Token-Bucket Task Queue',
    roleTarget: 'Backend SDE-1 / Infrastructure Engineer (Uber, Swiggy, Amazon)',
    packageTier: 'Tier-1 Product (₹24 - ₹48 LPA)',
    industryImportanceScore: 9.9,
    summary: 'A distributed queue with Redis Lua atomic scripts, exponential backoff retries, and dead-letter queues benchmarked to 12,000 RPS under simulated node failure.',
    industrySignificance: 'Every Tier-1 cloud service (Uber, Stripe, Swiggy, Netflix) uses distributed token buckets to prevent server crashing during flash sales and traffic surges. Generic projects fail here because they use in-memory timers; building this with atomic Redis scripts and worker threads proves you understand distributed concurrency, idempotency, and cluster fault tolerance.',
    whyCompaniesHireThis: 'Hiring managers at Tier-1 companies say this project eliminates the need for 3 separate interview rounds because it proves the candidate can handle concurrency race conditions, database connection pools, and resilience under heavy load.',
    coreBranchConcepts: [
      'Distributed State & Race Conditions',
      'Atomic Operations with Redis Lua',
      'Worker Thread Pools & Asynchronous I/O',
      'Exponential Backoff & Dead-Letter Queues (DLQ)',
      'k6 / Locust Stress Benchmarking'
    ],
    techStack: ['Go / TypeScript', 'Redis (Lua)', 'PostgreSQL', 'Docker Compose', 'k6 Benchmarking'],
    architectureModules: [
      'Token Bucket / Sliding Window Log rate limiter executed as an atomic Redis script',
      'Asynchronous worker daemon processing priority jobs with heartbeat lease renewal',
      'Dead-Letter Queue (DLQ) persistent storage with auto-replay triggers',
      'Prometheus latency metrics exporter & Grafana dashboard tracking p95/p99 SLA'
    ],
    keyResumeBullets: [
      'Architected distributed rate-limiting engine in Go/Redis handling 12,000+ RPS with <28ms p99 latency, preventing API starvation across 6 microservices.',
      'Engineered asynchronous worker queue with exponential backoff and Dead-Letter Queue (DLQ), ensuring 99.99% message delivery reliability during broker disconnects.',
      'Benchmarked system with k6 stress scripts, documenting horizontal scaling from 2 to 8 worker nodes with linear throughput gains.'
    ],
    milestones: [
      {
        step: 1,
        title: 'Architecture & Redis Data Model',
        description: 'Design key schema, token refresh interval, and atomic Lua script to calculate remaining token quotas.',
        deliverable: 'Tested Lua script running against local Redis CLI with concurrency test.'
      },
      {
        step: 2,
        title: 'Asynchronous Worker Daemon',
        description: 'Implement job producer and consumer worker pool with graceful shutdown and heartbeat leases.',
        deliverable: 'Go or Node.js worker service processing 1,000 simulated jobs.'
      },
      {
        step: 3,
        title: 'Fault Tolerance & DLQ Replay',
        description: 'Implement dead-letter queue routing for poison pills and exponential backoff jitter.',
        deliverable: 'Automatic retry handler catching failed network payloads.'
      },
      {
        step: 4,
        title: 'Stress Benchmarks & Dockerized Deployment',
        description: 'Run k6 load test simulating 10,000 RPS; generate latency charts and publish GitHub documentation.',
        deliverable: 'Reproducible Docker Compose setup and GitHub README with benchmark graphs.'
      }
    ],
    interviewQuestions: [
      {
        question: 'Why did you use Redis Lua scripts instead of standard Redis GET and SET commands?',
        answerKey: 'Standard GET followed by SET introduces a race condition (check-then-act) between concurrent threads. A Lua script executes atomically inside Redis single-threaded event loop, guaranteeing no two requests can read the same stale token balance.'
      },
      {
        question: 'How do you handle a worker node crashing midway through processing an expensive job?',
        answerKey: 'We use worker heartbeats with a lock lease (visibility timeout). If the worker stops renewing the lease, Redis automatically re-queues the job for another worker node, ensuring no payload loss.'
      }
    ],
    targetCompanies: ['Uber', 'Amazon', 'Swiggy', 'Salesforce', 'Atlassian', 'Zomato'],
    activePeersCount: 24,
    sampleGithubRepo: 'https://github.com/campus-peer-cohort/distributed-rate-limiter-go'
  },
  {
    id: 'proj-cse-crdt-collab',
    branch: 'CSE_IT',
    branchLabel: 'Computer Science & IT',
    title: 'Real-Time Collaborative Multi-Cursor Canvas & CRDT Delta Sync Engine',
    roleTarget: 'Fullstack / Systems Frontend Engineer (Atlassian, Notion, Figma, Canva)',
    packageTier: 'Tier-1 Product (₹22 - ₹44 LPA)',
    industryImportanceScore: 9.8,
    summary: 'A multi-user infinite canvas where 50+ simultaneous editors work offline-first with zero merge conflicts using Yjs Conflict-Free Replicated Data Types (CRDTs).',
    industrySignificance: 'Collaborative software is the gold standard for modern tech products. Companies like Notion, Figma, Canva, and Atlassian explicitly look for candidates who understand state convergence without centralized locking, WebSockets delta compression, and optimistic UI rendering.',
    whyCompaniesHireThis: 'Interviewers rarely see candidates who truly understand CRDTs vs operational transformation. Presenting this project demonstrates elite client-side engineering skills that stand out among 1,000+ applicants.',
    coreBranchConcepts: [
      'Conflict-Free Replicated Data Types (CRDTs)',
      'WebSocket Heartbeats & Delta Compression',
      'Optimistic Local UI Updates & IndexedDB',
      'Multi-Cursor Spatial Coordinates Throttling',
      'Vector Clocks & State Reconciliation'
    ],
    techStack: ['React 19', 'TypeScript', 'Yjs / Automerge', 'WebSockets', 'IndexedDB', 'Tailwind CSS'],
    architectureModules: [
      'CRDT document state engine with binary delta message compression',
      'WebSocket gateway server with room auth, ping-pong keepalives, and reconnection replay',
      'Real-time cursor position broadcaster with 30ms throttle and smooth interpolation',
      'Local IndexedDB offline sync cache reconciling changes when network restores'
    ],
    keyResumeBullets: [
      'Engineered real-time collaborative canvas using Yjs CRDTs and WebSockets, supporting 50+ concurrent users with <45ms sync latency.',
      'Implemented offline-first local persistence with IndexedDB, automatically reconciling disconnected edits upon reconnection without conflict errors.',
      'Optimized remote cursor broadcasting via binary coordinate packing and debouncing, reducing network bandwidth by 65%.'
    ],
    milestones: [
      {
        step: 1,
        title: 'CRDT State Engine Setup',
        description: 'Initialize Yjs document and test local concurrent edits with simulated delayed events.',
        deliverable: 'Conflict-free state merges verified in automated unit test suite.'
      },
      {
        step: 2,
        title: 'WebSocket Real-Time Provider',
        description: 'Build backend WebSocket server to broadcast binary Yjs state updates to room subscribers.',
        deliverable: 'Live multi-tab sync working on localhost with room ID isolation.'
      },
      {
        step: 3,
        title: 'Presence Awareness & Remote Cursors',
        description: 'Broadcast ephemeral mouse cursor positions, color tags, and selection boxes across connected clients.',
        deliverable: 'Smooth multi-cursor UI with name badges and latency indicators.'
      },
      {
        step: 4,
        title: 'Offline-First Storage & Production Deploy',
        description: 'Add IndexedDB persistence provider; deploy to production cloud with Vercel and WebSocket backend.',
        deliverable: 'Live deployed URL tested under simulated airplane mode with recovery.'
      }
    ],
    interviewQuestions: [
      {
        question: 'What is the primary difference between Operational Transformation (OT) and CRDTs?',
        answerKey: 'OT requires a centralized server to order operations and transform incoming changes against concurrent history (like Google Docs). CRDTs are mathematically designed to be commutative and associative, allowing peers to sync state directly or in any order without a central transformation server.'
      }
    ],
    targetCompanies: ['Atlassian', 'Notion', 'Canva', 'Figma', 'Microsoft', 'Postman'],
    activePeersCount: 19,
    sampleGithubRepo: 'https://github.com/campus-peer-cohort/crdt-canvas-engine'
  },

  // --- AI / ML & DATA SCIENCE PROJECTS ---
  {
    id: 'proj-ai-hybrid-rag',
    branch: 'AIML_DS',
    branchLabel: 'AI & Data Science',
    title: 'Enterprise Hybrid-Search RAG Platform with Cross-Encoder & Evaluation Guardrails',
    roleTarget: 'AI/ML Engineer & GenAI Systems SDE (Google, Microsoft, Adobe, Cohere)',
    packageTier: 'High-CTC Unicorn & Labs (₹26 - ₹52 LPA)',
    industryImportanceScore: 9.9,
    summary: 'A production-grade Retrieval-Augmented Generation system combining dense vector search (Pgvector) with sparse BM25 keyword matching, semantic caching, and Ragas automated faithfulness benchmarks.',
    industrySignificance: 'Every major tech company is adopting GenAI, but 90% of student projects are superficial prompt wrappers. Companies hire candidates who know how to solve real engineering bottlenecks: hallucination guardrails, hybrid dense+sparse retrieval math, latency reduction via semantic Redis caching, and continuous evaluation pipelines.',
    whyCompaniesHireThis: 'Shows recruiters you can evaluate and deploy GenAI architectures responsibly with measurable metrics (Context Precision, Faithfulness > 92%), saving enterprise companies millions in cloud API expenditures.',
    coreBranchConcepts: [
      'Dense Embeddings vs Sparse BM25 Search',
      'Cross-Encoder Reranking Math',
      'Semantic Vector Caching in Redis',
      'Hallucination Guardrails & Token Economics',
      'Ragas / TruLens Automated Evaluation Benchmarks'
    ],
    techStack: ['Python / FastAPI', 'Pgvector / Qdrant', 'LangChain / LlamaIndex', 'Redis', 'Docker', 'Ragas'],
    architectureModules: [
      'Document chunking pipeline with recursive token splitters and semantic boundary detection',
      'Hybrid retriever merging dense cosine similarity with BM25 keyword scoring using Reciprocal Rank Fusion (RRF)',
      'Cross-encoder reranking layer boosting top-k relevant document precision by 38%',
      'Redis semantic cache matching similar query embeddings to bypass LLM inference calls',
      'Automated CI/CD evaluation harness scoring faithfulness and answer relevance'
    ],
    keyResumeBullets: [
      'Architected hybrid-retrieval RAG engine (Pgvector + BM25) with Reciprocal Rank Fusion, improving retrieval precision@5 from 68% to 92%.',
      'Implemented semantic embedding cache in Redis, dropping p90 query latency from 2.8s to 190ms and slashing external LLM API costs by 58%.',
      'Built automated evaluation CI/CD pipeline using Ragas, continuously tracking hallucination rate and Context Recall.'
    ],
    milestones: [
      {
        step: 1,
        title: 'Chunking & Hybrid Vector Store',
        description: 'Set up Pgvector database with HNSW indexing; ingest PDF technical manuals and generate dense embeddings.',
        deliverable: 'PostgreSQL instance running Pgvector with hybrid BM25 full-text query.'
      },
      {
        step: 2,
        title: 'Reranking & Prompt Guardrails',
        description: 'Integrate cross-encoder reranker and prompt injection guardrail filter.',
        deliverable: 'FastAPI endpoint returning reranked citations and confidence score.'
      },
      {
        step: 3,
        title: 'Semantic Redis Caching',
        description: 'Store previous query embeddings in Redis; check cosine threshold > 0.94 to serve instant cached responses.',
        deliverable: 'Cache hit demonstration showing 15x latency drop on repeated queries.'
      },
      {
        step: 4,
        title: 'Ragas Evaluation Benchmark',
        description: 'Run automated evaluation dataset; generate metric reports for Faithfulness and Context Recall.',
        deliverable: 'Published benchmark report with precision graphs on GitHub.'
      }
    ],
    interviewQuestions: [
      {
        question: 'Why is hybrid search (Dense + BM25) superior to pure vector embedding search?',
        answerKey: 'Pure vector search struggles with exact keyword queries (e.g. error codes like "ERR_404_TX_TIMEOUT" or specific product serial numbers). BM25 excels at exact keyword matches, while vector embeddings capture semantic meaning. Combining them via Reciprocal Rank Fusion (RRF) yields the highest precision across all user query types.'
      }
    ],
    targetCompanies: ['Google', 'Microsoft', 'Adobe', 'Databricks', 'Cohere', 'Amazon AWS'],
    activePeersCount: 28,
    sampleGithubRepo: 'https://github.com/campus-peer-cohort/enterprise-hybrid-rag-platform'
  },
  {
    id: 'proj-ai-fraud-streaming',
    branch: 'AIML_DS',
    branchLabel: 'AI & Data Science',
    title: 'Real-Time Financial Fraud Detection Streaming Pipeline with Kafka & XGBoost',
    roleTarget: 'Data Platform / Machine Learning Engineer (Mastercard, Visa, Razorpay, CRED)',
    packageTier: 'Tier-1 FinTech & MNC (₹24 - ₹46 LPA)',
    industryImportanceScore: 9.8,
    summary: 'Streaming ML inference engine that evaluates credit card transactions in under 40 milliseconds using Kafka message brokers, Feast feature store, and an optimized XGBoost model.',
    industrySignificance: 'FinTech and e-commerce companies process thousands of payments per second. Building this demonstrates streaming architecture (Kafka), sub-50ms model inference latency, and feature drift detection in high-stakes financial environments.',
    whyCompaniesHireThis: 'Payment companies pay top compensation for engineers who know how to deploy machine learning into high-throughput live streaming pipelines without blocking customer checkouts.',
    coreBranchConcepts: [
      'Event Streaming with Apache Kafka',
      'Sub-50ms Low-Latency Model Inference',
      'Feast Online Feature Store (Redis-backed)',
      'Model Drift Monitoring & Population Stability Index',
      'High-Throughput Microservice Architecture'
    ],
    techStack: ['Python / Go', 'Apache Kafka', 'XGBoost / ONNX', 'Redis (Online Feature Store)', 'Docker', 'Prometheus'],
    architectureModules: [
      'Kafka transaction ingestion stream partitioned by cardholder ID',
      'Real-time feature aggregation computing rolling 10-minute spending velocity',
      'ONNX-optimized XGBoost classifier delivering sub-40ms inference decisions',
      'Prometheus telemetry tracking model score distributions and false-positive rates'
    ],
    keyResumeBullets: [
      'Developed real-time fraud detection pipeline processing 4,500 transactions/sec with sub-40ms end-to-end inference latency using Kafka and ONNX runtime.',
      'Constructed Redis-backed online feature store serving 15 real-time aggregated features (e.g. 10-min velocity, geo-velocity) under 5ms p99 lookup time.',
      'Integrated automated model drift monitor tracking Population Stability Index (PSI) to alert on emerging transaction fraud patterns.'
    ],
    milestones: [
      {
        step: 1,
        title: 'Kafka Event Producer & Consumer',
        description: 'Set up Kafka topic with multi-partition consumer groups to ingest payment payloads.',
        deliverable: 'Simulated payment generator pushing 2,000 transactions/second.'
      },
      {
        step: 2,
        title: 'Feature Engineering & Store',
        description: 'Compute rolling velocity counters in Redis and pull static customer features.',
        deliverable: 'Feature extraction module returning feature vectors in <8ms.'
      },
      {
        step: 3,
        title: 'Model Training & ONNX Optimization',
        description: 'Train XGBoost on financial dataset; convert to ONNX for low-latency C++ / Python runtime.',
        deliverable: 'Trained model achieving 0.94 ROC-AUC and 35ms inference latency.'
      },
      {
        step: 4,
        title: 'End-to-End Pipeline & Stress Test',
        description: 'Run end-to-end pipeline with Locust stress tests; monitor queue backlog and false positives.',
        deliverable: 'Complete architecture diagram and GitHub demonstration repository.'
      }
    ],
    interviewQuestions: [
      {
        question: 'How do you prevent data leakage when engineering real-time features in a streaming pipeline?',
        answerKey: 'We enforce strict event-time timestamps using watermarking in Kafka, ensuring features only aggregate historical events prior to the current transaction timestamp, preventing future event leakage.'
      }
    ],
    targetCompanies: ['Mastercard', 'Visa', 'Razorpay', 'CRED', 'Stripe', 'Paypal'],
    activePeersCount: 17,
    sampleGithubRepo: 'https://github.com/campus-peer-cohort/realtime-fraud-streaming-pipeline'
  },

  // --- ECE & EMBEDDED SYSTEMS / IOT PROJECTS ---
  {
    id: 'proj-ece-freertos-gateway',
    branch: 'ECE_EMBEDDED',
    branchLabel: 'Electronics & Embedded IoT',
    title: 'Industrial IoT Edge Gateway with FreeRTOS, Secure MQTT-SN & Cloud Telemetry Stream',
    roleTarget: 'Embedded Software Engineer / Firmware SDE (Qualcomm, Cisco, Texas Instruments, Intel)',
    packageTier: 'Tier-1 Embedded & Semiconductor (₹18 - ₹40 LPA)',
    industryImportanceScore: 9.8,
    summary: 'A deterministic FreeRTOS edge gateway running on ESP32/ARM Cortex with sensor telemetry, TLS 1.3 mutual authentication, local flash circular buffer, and MQTT-SN cloud synchronization.',
    industrySignificance: 'Semiconductor, automotive, and networking companies value embedded candidates who know real-time operating systems (RTOS), deterministic priority scheduling, low-power interrupt routines, and secure firmware communications over basic Arduino toy projects.',
    whyCompaniesHireThis: 'Shows recruiters you can write production C/C++ firmware with mutexes, ring buffers, memory management, and zero memory leaks under hardware resource constraints.',
    coreBranchConcepts: [
      'FreeRTOS Task Scheduling & Priority Inversion',
      'Thread-Safe Ring Buffers & Interrupt Service Routines (ISR)',
      'TLS 1.3 Mutual Authentication on Microcontrollers',
      'Low-Power Sleep Modes & Watchdog Timers',
      'MQTT-SN / CoAP Protocol Handlers'
    ],
    techStack: ['C / C++', 'FreeRTOS', 'ESP-IDF / STM32Cube', 'MQTT / TLS 1.3', 'Node.js / Python Cloud Receiver'],
    architectureModules: [
      'Multi-task FreeRTOS firmware with sensor sampling, telemetry buffer, and WiFi/LTE uplink tasks',
      'Lock-free circular ring buffer storing readings when cloud network connectivity drops',
      'TLS mutual authentication client securing hardware private keys in secure flash',
      'Hardware Watchdog Timer (WDT) and brownout detection ensuring 99.999% uninterrupted uptime'
    ],
    keyResumeBullets: [
      'Architected FreeRTOS edge gateway in C/C++ on ARM Cortex microcontrollers, managing 4 concurrent real-time tasks with zero deadline misses.',
      'Engineered lock-free circular ring buffer in flash memory, buffering 72 hours of sensor telemetry during network outages with zero data loss.',
      'Secured MQTT uplink with TLS 1.3 mutual authentication, reducing power consumption by 40% via deep-sleep duty cycles.'
    ],
    milestones: [
      {
        step: 1,
        title: 'FreeRTOS Task & Queue Setup',
        description: 'Create sensor acquisition, processing, and communication tasks using FreeRTOS queues and semaphores.',
        deliverable: 'Firmware binary running deterministic tasks on ESP32 or QEMU ARM emulator.'
      },
      {
        step: 2,
        title: 'Lock-Free Flash Ring Buffer',
        description: 'Implement circular storage in non-volatile flash to persist telemetry when broker is unreachable.',
        deliverable: 'Unit tests proving zero data corruption during sudden power-off resets.'
      },
      {
        step: 3,
        title: 'TLS 1.3 Secure MQTT Telemetry',
        description: 'Connect to cloud broker using TLS client certificates and publish structured JSON/Protobuf packets.',
        deliverable: 'Live telemetry verified on AWS IoT Core or local Mosquitto broker.'
      },
      {
        step: 4,
        title: 'Power Optimization & Watchdog',
        description: 'Implement hardware watchdog timer, brownout protection, and automatic light-sleep power transitions.',
        deliverable: 'Current consumption benchmark report (<15mA active, <25µA sleep).'
      }
    ],
    interviewQuestions: [
      {
        question: 'How do you avoid Priority Inversion in FreeRTOS when a low-priority task holds a mutex needed by a high-priority task?',
        answerKey: 'We use Priority Inheritance built into FreeRTOS mutexes. When a high-priority task attempts to acquire a mutex held by a low-priority task, the kernel temporarily boosts the low-priority task priority to match the high-priority task until it releases the mutex.'
      }
    ],
    targetCompanies: ['Qualcomm', 'Cisco', 'Texas Instruments', 'Intel', 'Apple Hardware', 'Bosch'],
    activePeersCount: 14,
    sampleGithubRepo: 'https://github.com/campus-peer-cohort/freertos-industrial-iot-gateway'
  },
  {
    id: 'proj-ece-can-ota',
    branch: 'ECE_EMBEDDED',
    branchLabel: 'Electronics & Embedded IoT',
    title: 'Automotive CAN-Bus Telemetry Logger & Over-The-Air (OTA) Dual-Bank Firmware Updater',
    roleTarget: 'Automotive Embedded SDE / Systems Engineer (Bosch, Tesla, Continental, Rivian)',
    packageTier: 'Tier-1 Automotive & Mobility (₹19 - ₹42 LPA)',
    industryImportanceScore: 9.7,
    summary: 'Automotive CAN-bus diagnostic reader with dual-bank flash memory partitioning for secure, fail-safe Over-The-Air (OTA) firmware updates with rollback protection.',
    industrySignificance: 'Modern vehicles are software-defined machines running hundreds of electronic control units (ECUs). Mastering the Controller Area Network (CAN) bus and atomic bootloader firmware flashing is in immense demand across automotive tech giants.',
    whyCompaniesHireThis: 'Interviewers look for candidates who understand safety-critical software standards (ISO 26262), dual-boot flash partitions, and cryptographic checksum validation.',
    coreBranchConcepts: [
      'CAN 2.0B Protocol & DBC Frame Decoding',
      'Dual-Bank Flash Memory Bootloader Architecture',
      'SHA-256 Signature Verification & Rollback Prevention',
      'Hardware Watchdog & Fail-Safe Safe State Transitions',
      'Real-Time OBD-II PID Diagnostics'
    ],
    techStack: ['C / C++', 'CAN-Bus Controller (MCP2515 / SocketCAN)', 'Embedded Linux / FreeRTOS', 'Python CAN Tools', 'Docker'],
    architectureModules: [
      'CAN frame parser decoding RPM, vehicle speed, and battery temperature using DBC specification',
      'Dual-bank bootloader (Partition A / Partition B) enabling background firmware downloads',
      'Cryptographic verification module validating digital signatures before partition swap',
      'Automatic rollback mechanism restoring previous firmware if boot health checks fail within 10 seconds'
    ],
    keyResumeBullets: [
      'Engineered automotive CAN-bus telematics stack decoding 800+ frames/sec with zero buffer overflows using SocketCAN and C++.',
      'Implemented dual-bank flash bootloader supporting Over-The-Air (OTA) firmware updates with automated rollback upon failed health checks.',
      'Integrated cryptographic SHA-256 signature verification, eliminating unauthorized firmware injection risks.'
    ],
    milestones: [
      {
        step: 1,
        title: 'CAN-Bus Simulation & DBC Parser',
        description: 'Set up virtual CAN interface (vcan0) and write C++ decoder matching standard vehicle signals.',
        deliverable: 'Console logger parsing real-time speed, RPM, and brake pressure.'
      },
      {
        step: 2,
        title: 'Dual-Bank Partition Flash Map',
        description: 'Partition microcontroller flash into Bootloader, App Bank A, and App Bank B with metadata flags.',
        deliverable: 'Working bootloader booting alternate partitions based on status flags.'
      },
      {
        step: 3,
        title: 'Secure OTA Transfer Protocol',
        description: 'Download binary chunk-by-chunk over encrypted channel; compute CRC32 and SHA-256 signature.',
        deliverable: 'Flashing test passing integrity check and toggling active bank.'
      },
      {
        step: 4,
        title: 'Fail-Safe Health Checks & Documentation',
        description: 'Simulate corrupted binary update; verify watchdog trigger and automatic rollback to stable Bank A.',
        deliverable: 'Complete test suite video demo and GitHub repository.'
      }
    ],
    interviewQuestions: [
      {
        question: 'Why is dual-bank flash partitioning essential for automotive OTA updates?',
        answerKey: 'Single-bank flashing overwrites the running program in place; if power is cut midway, the device is bricked. Dual-bank partitioning writes the new update to an inactive bank while the vehicle continues running on the active bank. The swap only occurs after full cryptographic verification, and rollback is instantaneous if the new version fails to boot.'
      }
    ],
    targetCompanies: ['Tesla', 'Bosch', 'Continental', 'Rivian', 'Tata Motors EV', 'Ather'],
    activePeersCount: 11,
    sampleGithubRepo: 'https://github.com/campus-peer-cohort/automotive-can-ota-updater'
  },

  // --- EEE & ELECTRICAL SMART SYSTEMS PROJECTS ---
  {
    id: 'proj-eee-smart-microgrid',
    branch: 'EEE_SMART',
    branchLabel: 'Electrical & Smart Systems',
    title: 'Smart Microgrid Energy Management & Dynamic Load-Balancing SCADA Telemetry Engine',
    roleTarget: 'Smart Grid Software Engineer / Energy Systems SDE (Schneider Electric, Siemens, ABB, Enphase)',
    packageTier: 'Tier-1 Energy Tech & MNC (₹16 - ₹38 LPA)',
    industryImportanceScore: 9.7,
    summary: 'A real-time microgrid SCADA system utilizing MODBUS TCP telemetry, peak-shaving optimization algorithms, and battery-solar inverter load balancing.',
    industrySignificance: 'The global transition to renewable energy and EV charging requires software engineers who understand electrical power systems, power factor correction, battery depth-of-discharge, and SCADA industrial communication protocols.',
    whyCompaniesHireThis: 'Energy tech leaders hire engineers who bridge the gap between electrical grid equations (active/reactive power, frequency regulation) and modern software microservices.',
    coreBranchConcepts: [
      'MODBUS TCP / DNP3 Industrial Protocols',
      'Peak Shaving & Demand Response Algorithms',
      'Active & Reactive Power Flow Balance (kW / kVAR)',
      'Time-Series Database Storage (TimescaleDB / InfluxDB)',
      'Grid Frequency & Voltage Stability Feedback Loops'
    ],
    techStack: ['Python / Go', 'MODBUS TCP', 'TimescaleDB', 'Docker', 'FastAPI', 'Grafana'],
    architectureModules: [
      'MODBUS TCP polling engine querying simulated inverters, solar panels, and battery storage',
      'Dynamic dispatch algorithm computing optimal battery charge/discharge schedule based on hourly tariff',
      'TimescaleDB time-series ingestion pipeline storing sub-second electrical parameters',
      'Web SCADA dashboard with alarm thresholds for grid frequency deviations and overcurrent'
    ],
    keyResumeBullets: [
      'Developed real-time microgrid energy management engine in Go/Python communicating with 20+ solar inverters via MODBUS TCP at 100ms intervals.',
      'Implemented peak-shaving optimization algorithm that reduced peak grid demand charges by 28% using automated battery discharge schedules.',
      'Architected time-series pipeline in TimescaleDB handling 15,000 electrical telemetry points/sec with sub-50ms query response.'
    ],
    milestones: [
      {
        step: 1,
        title: 'MODBUS Telemetry Simulator',
        description: 'Build simulated smart meter and solar inverter publishing voltage, current, and frequency over MODBUS TCP.',
        deliverable: 'Working MODBUS server responding to standard register read commands.'
      },
      {
        step: 2,
        title: 'Time-Series Data Store',
        description: 'Set up TimescaleDB with hypertables and continuous aggregates for hourly power analytics.',
        deliverable: 'Ingestion service recording real-time active and reactive power.'
      },
      {
        step: 3,
        title: 'Peak Shaving Optimization Engine',
        description: 'Write optimization logic to trigger battery discharge when total facility load exceeds target threshold.',
        deliverable: 'Simulated 24-hour tariff cost reduction verified with unit tests.'
      },
      {
        step: 4,
        title: 'SCADA Dashboard & Fault Alarms',
        description: 'Build real-time monitoring dashboard with threshold alerts for under-voltage and frequency excursions.',
        deliverable: 'Live web dashboard with audible alarm states and GitHub documentation.'
      }
    ],
    interviewQuestions: [
      {
        question: 'How do you calculate active power versus reactive power, and why does an industrial microgrid care about power factor?',
        answerKey: 'Active power (P = V*I*cos φ in kW) does real work, while reactive power (Q = V*I*sin φ in kVAR) maintains electromagnetic fields in transformers and motors. A low power factor (<0.95) causes excessive current draw and line losses, resulting in massive utility penalty charges that our optimization software prevents.'
      }
    ],
    targetCompanies: ['Schneider Electric', 'Siemens', 'ABB', 'Enphase Energy', 'Tesla Energy', 'Eaton'],
    activePeersCount: 9,
    sampleGithubRepo: 'https://github.com/campus-peer-cohort/smart-microgrid-scada-engine'
  },

  // --- MECHANICAL, ROBOTICS & MECHATRONICS PROJECTS ---
  {
    id: 'proj-mech-ros2-navigation',
    branch: 'MECH_ROBOTICS',
    branchLabel: 'Mechanical & Robotics',
    title: 'Autonomous Mobile Robot (AMR) Navigation & Obstacle Avoidance Stack in ROS2 & Nav2',
    roleTarget: 'Robotics Software Engineer / Autonomous Systems SDE (Boston Dynamics, Amazon Robotics, Waymo)',
    packageTier: 'Tier-1 Robotics & Autonomous Tech (₹18 - ₹42 LPA)',
    industryImportanceScore: 9.8,
    summary: 'A complete autonomous robot navigation stack built with ROS2 Humble, LiDAR SLAM mapping, sensor fusion (Extended Kalman Filter), and Nav2 dynamic path planning.',
    industrySignificance: 'Warehouse automation (Amazon Kiva), self-driving vehicles, and factory robotics require engineers who know kinematic models, coordinate frame transformations (TF2), costmap generation, and ROS2 C++ nodes.',
    whyCompaniesHireThis: 'Robotics companies reject pure theory candidates. Showing a working ROS2 simulation with LiDAR mapping and dynamic obstacle avoidance proves practical robotics engineering excellence.',
    coreBranchConcepts: [
      'ROS2 Node Communication & Actions/Services',
      'TF2 Coordinate Frames & Forward/Inverse Kinematics',
      'LiDAR SLAM (Cartographer / Slam Toolbox)',
      'Sensor Fusion with Extended Kalman Filter (robot_localization)',
      'Dynamic Path Planning (A* Global Planner + DWA Local Planner)'
    ],
    techStack: ['C++', 'Python', 'ROS2 Humble', 'Nav2', 'Gazebo Simulation', 'RViz'],
    architectureModules: [
      'Differential drive kinematic controller calculating wheel velocities from cmd_vel vectors',
      'Sensor fusion node combining wheel odometry with IMU acceleration via Extended Kalman Filter',
      '2D LiDAR SLAM node generating occupancy grid maps in real time',
      'Nav2 navigation pipeline generating costmaps and dynamic trajectory avoidance around moving obstacles'
    ],
    keyResumeBullets: [
      'Engineered autonomous navigation stack in ROS2 C++ for a differential-drive robot, navigating dynamic obstacle courses with <3cm waypoint accuracy.',
      'Implemented sensor fusion node utilizing Extended Kalman Filter (EKF) combining wheel encoders and 9-DOF IMU, cutting odometry drift by 70%.',
      'Configured Nav2 costmaps and DWA local planners to achieve smooth 1.2 m/s autonomous navigation in Gazebo warehouse simulation.'
    ],
    milestones: [
      {
        step: 1,
        title: 'URDF Model & Gazebo World',
        description: 'Define robot physical dimensions, collision meshes, LiDAR, and wheel joints in URDF/Xacro.',
        deliverable: 'Robot spawning inside simulated Gazebo industrial warehouse.'
      },
      {
        step: 2,
        title: 'Teleoperation & Odometry Fusion',
        description: 'Publish wheel odometry and fuse with IMU data using robot_localization EKF node.',
        deliverable: 'Stable TF tree (odom -> base_link -> laser_frame) verified in RViz.'
      },
      {
        step: 3,
        title: 'SLAM Occupancy Grid Mapping',
        description: 'Drive robot to generate high-resolution 2D occupancy grid map using Slam Toolbox.',
        deliverable: 'Saved map YAML file of the warehouse environment.'
      },
      {
        step: 4,
        title: 'Autonomous Navigation with Nav2',
        description: 'Send navigation goals via Nav2 Action client; verify recovery behaviors and obstacle avoidance.',
        deliverable: 'Video demonstration of autonomous navigation and published GitHub code.'
      }
    ],
    interviewQuestions: [
      {
        question: 'Why do pure wheel encoders cause robots to get lost over time, and how does the Extended Kalman Filter fix this?',
        answerKey: 'Wheel encoders suffer from wheel slip, uneven terrain, and mechanical backlash, causing errors to accumulate quadratically. The Extended Kalman Filter combines encoder data with independent high-frequency inertial measurements (IMU gyro/accelerometer), weighting each sensor based on covariance matrices to produce an optimal state estimate.'
      }
    ],
    targetCompanies: ['Amazon Robotics', 'Boston Dynamics', 'Waymo', 'GreyOrange', 'MathWorks', 'Aptiv'],
    activePeersCount: 8,
    sampleGithubRepo: 'https://github.com/campus-peer-cohort/ros2-autonomous-mobile-robot'
  },

  // --- CIVIL & SMART INFRASTRUCTURE / GIS PROJECTS ---
  {
    id: 'proj-civil-gis-disaster',
    branch: 'CIVIL_GIS',
    branchLabel: 'Civil & Smart Infrastructure',
    title: 'Smart City Flood Mitigation & Disaster Response GIS Engine (PostGIS & Satellite InSAR)',
    roleTarget: 'Geospatial Software Engineer / Smart City SDE (Trimble, Esri, Bentley Systems, Mapbox)',
    packageTier: 'Tier-1 Geospatial & Infra Tech (₹15 - ₹34 LPA)',
    industryImportanceScore: 9.6,
    summary: 'A cloud geospatial simulation platform analyzing digital elevation models (DEM), rainfall runoff hydrographs, and PostGIS spatial queries to predict urban flood zones in real time.',
    industrySignificance: 'Climate resilience, smart cities, and infrastructure engineering rely on engineers who understand spatial topology, PostGIS spatial indexing (R-Tree), GeoJSON pipelines, and hydrological elevation models.',
    whyCompaniesHireThis: 'Firms like Trimble, Esri, and Bentley Systems seek engineers who understand civil infrastructure parameters combined with modern web map APIs and spatial database performance.',
    coreBranchConcepts: [
      'Spatial Database Indexing with PostGIS (R-Tree / GIST)',
      'Digital Elevation Model (DEM) Raster Processing',
      'Hydrological Runoff Equations (Rational Method / Manning)',
      'Vector Tile Streaming (Mapbox Vector Tiles / Protobuf)',
      'Emergency Route Optimization with pgRouting'
    ],
    techStack: ['TypeScript / Python', 'PostgreSQL / PostGIS', 'GeoServer / Mapbox GL', 'Docker', 'pgRouting'],
    architectureModules: [
      'PostGIS spatial database storing urban stormwater drainage lines, catchments, and floodplains',
      'Hydrological computation engine calculating stormwater surge heights during heavy rainfall scenarios',
      'Vector tile streaming server rendering 500,000+ building footprint geometries at 60fps',
      'Emergency evacuation router using pgRouting Dijkstra algorithms to avoid flooded road segments'
    ],
    keyResumeBullets: [
      'Architected geospatial flood risk platform in PostGIS/TypeScript, querying 350,000 spatial geometries with sub-40ms latency using GiST spatial indexing.',
      'Engineered hydrological runoff simulation engine predicting water surge depths across 12 urban catchments during torrential rain events.',
      'Implemented emergency evacuation router using pgRouting that calculates safest detour paths avoiding inundated streets in real time.'
    ],
    milestones: [
      {
        step: 1,
        title: 'PostGIS Spatial Schema Setup',
        description: 'Import elevation contours, road networks, and drainage pipelines into PostGIS with SRID 4326/3857.',
        deliverable: 'Indexed spatial tables executing ST_DWithin and ST_Intersects queries.'
      },
      {
        step: 2,
        title: 'Hydrological Runoff Computation',
        description: 'Implement runoff calculation based on soil permeability, rainfall intensity, and drainage capacity.',
        deliverable: 'Service outputting predicted flood depth polygons as GeoJSON.'
      },
      {
        step: 3,
        title: 'Interactive Web Map Visualization',
        description: 'Render dynamic flood zones on Mapbox/Leaflet with slider for rainfall intensity (mm/hr).',
        deliverable: 'Interactive map displaying color-coded flood inundation zones.'
      },
      {
        step: 4,
        title: 'Emergency Evacuation Routing & Deploy',
        description: 'Integrate pgRouting to compute dynamic shortest evacuation routes avoiding flooded segments.',
        deliverable: 'Working live demo and GitHub repository with full deployment steps.'
      }
    ],
    interviewQuestions: [
      {
        question: 'Why is a GiST index essential for spatial bounding box queries in PostGIS compared to a standard B-Tree index?',
        answerKey: 'A standard B-Tree only orders one-dimensional scalar data (less than or greater than). Geographic geometries are two- or three-dimensional. A GiST (Generalized Search Tree) implements an R-Tree structure that indexes hierarchical bounding boxes, allowing rapid spatial filtering (ST_Intersects, ST_Contains) without scanning millions of individual polygon points.'
      }
    ],
    targetCompanies: ['Trimble', 'Esri', 'Bentley Systems', 'Mapbox', 'L&T Technology Services', 'UrbanFootprint'],
    activePeersCount: 6,
    sampleGithubRepo: 'https://github.com/campus-peer-cohort/smart-city-gis-flood-engine'
  }
];

export const INITIAL_SQUAD_MESSAGES: ProjectSquadMessage[] = [
  {
    id: 'squad-msg-1',
    projectId: 'proj-cse-distributed-queue',
    authorName: 'Varun M.',
    authorBranch: '3rd Year CSE (Squad Lead)',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    timestamp: 'Today at 08:30 AM',
    message: 'Hey squad! For the Redis Lua script, make sure you use redis.call("eval") with KEYS and ARGV separated properly. If you hardcode keys inside the script, Redis Cluster won’t be able to route requests across hash slots!',
    likes: 8,
    hasLiked: true
  },
  {
    id: 'squad-msg-2',
    projectId: 'proj-cse-distributed-queue',
    authorName: 'Karthik N.',
    authorBranch: '3rd Year CSE',
    authorAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    timestamp: 'Today at 09:12 AM',
    message: 'Thanks Varun! I just ran a k6 benchmark test with 500 virtual users. Without Lua scripts, we had a 4% race condition duplicate rate. With the atomic script, duplicate rate dropped to exactly 0.00%! Putting this in my resume bullet right now.',
    likes: 12,
    hasLiked: false
  },
  {
    id: 'squad-msg-3',
    projectId: 'proj-ai-hybrid-rag',
    authorName: 'Tanya Sengupta',
    authorBranch: 'Amazon AWS Intern / Senior Mentor',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    timestamp: 'Yesterday at 04:45 PM',
    message: 'Pro tip for AI squad members: In your resume, do NOT just say "Built RAG". Explicitly write: "Evaluated with Ragas achieving 0.93 Faithfulness and 0.89 Context Recall on a 200-question ground-truth test suite." That one sentence will get you shortlisted for every GenAI interview.',
    likes: 24,
    hasLiked: true
  },
  {
    id: 'squad-msg-4',
    projectId: 'proj-ece-freertos-gateway',
    authorName: 'Ananya Rao',
    authorBranch: 'Goldman Sachs Tech / ECE Alum',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    timestamp: 'Yesterday at 06:10 PM',
    message: 'To everyone building the FreeRTOS gateway: Qualcomm interviewers will 100% ask you how you prevented Priority Inversion and how you sized your task stacks to avoid stack overflow in RAM. Review the answer key in the interview tab!',
    likes: 15,
    hasLiked: true
  }
];
