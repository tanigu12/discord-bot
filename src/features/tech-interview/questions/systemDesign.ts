import { TechInterviewAnswer } from '../types';

export const systemDesignQuestions: TechInterviewAnswer[] = [
  {
    question: "How would you design a search engine like Google?",
    definition: [
      "Large-scale system that crawls, indexes, and retrieves relevant web content",
      "Must handle billions of web pages and millions of concurrent search queries"
    ],
    keyCharacteristics: [
      "Web crawler to discover and download web pages",
      "Indexing system to process and store searchable content",
      "Query processing engine for fast retrieval and ranking",
      "Distributed architecture across multiple data centers"
    ],
    practicalExample: [
      "Crawler: Distributed bots following links and fetching web pages",
      "Indexer: Extract keywords, create inverted index mapping terms to documents",
      "Query processor: Parse search query, find matching documents, rank by relevance",
      "Result aggregator: Combine results from multiple data centers"
    ],
    advantages: [
      "Horizontal scalability across multiple machines and data centers",
      "Fault tolerance through replication and redundancy",
      "Fast response times through caching and pre-computation"
    ],
    disadvantages: [
      "Enormous infrastructure and operational complexity",
      "Requires sophisticated algorithms for relevance and spam detection",
      "Constant battle against SEO manipulation and low-quality content"
    ],
    bestPractices: [
      "Use distributed systems patterns: sharding, replication, load balancing",
      "Implement caching at multiple levels (query cache, page cache, CDN)",
      "Design for horizontal scaling from day one",
      "Monitor and optimize for both latency and throughput",
      "Implement gradual rollout and A/B testing for ranking algorithm changes"
    ],
    conclusion: [
      "One of the most complex distributed systems engineering challenges",
      "Requires expertise in algorithms, distributed systems, and massive scale",
      "Success depends on continuous optimization and infrastructure investment"
    ]
  },
  {
    question: "How would you design a load balancer?",
    definition: [
      "System that distributes incoming requests across multiple backend servers",
      "Improves availability, scalability, and performance of web applications"
    ],
    keyCharacteristics: [
      "Multiple load balancing algorithms (round-robin, least connections, weighted)",
      "Health checking to detect and route around failed servers",
      "Session persistence and SSL termination capabilities",
      "Both Layer 4 (transport) and Layer 7 (application) load balancing"
    ],
    practicalExample: [
      "Layer 4: Route TCP/UDP traffic based on IP and port",
      "Layer 7: Route HTTP requests based on URL path or headers",
      "Health checks: Ping servers every 30 seconds, remove unhealthy ones",
      "Algorithms: Round-robin for equal servers, weighted for different capacities"
    ],
    advantages: [
      "Improves application availability and fault tolerance",
      "Enables horizontal scaling by adding more backend servers",
      "Can provide SSL termination and security features",
      "Optimizes resource utilization across server pool"
    ],
    disadvantages: [
      "Introduces single point of failure unless made highly available",
      "Adds network latency and complexity to request path",
      "Session stickiness can lead to uneven load distribution",
      "Requires careful monitoring and capacity planning"
    ],
    bestPractices: [
      "Deploy load balancers in high availability pairs",
      "Use health checks appropriate for your application",
      "Choose load balancing algorithm based on server characteristics",
      "Monitor both load balancer and backend server metrics",
      "Implement graceful handling of server additions/removals"
    ],
    conclusion: [
      "Critical component for building scalable web applications",
      "Choice between hardware and software load balancers depends on scale",
      "Modern cloud environments provide managed load balancing services"
    ]
  },
  {
    question: "How would you design a distributed file system like HDFS?",
    definition: [
      "File system that stores large files across multiple machines in a cluster",
      "Provides fault tolerance, high throughput, and scalability for big data workloads"
    ],
    keyCharacteristics: [
      "Master-slave architecture with NameNode and DataNodes",
      "Large block sizes (typically 64MB-128MB) to reduce metadata overhead",
      "Replication factor (usually 3) for fault tolerance",
      "Write-once, read-many access pattern optimized for streaming reads"
    ],
    practicalExample: [
      "NameNode: Stores file system metadata and block locations",
      "DataNodes: Store actual file blocks and report to NameNode",
      "Client: Contacts NameNode for metadata, directly reads from DataNodes",
      "Replication: Each block stored on 3 different DataNodes in different racks"
    ],
    advantages: [
      "Handles very large files and datasets efficiently",
      "Automatic fault tolerance through replication",
      "High throughput for sequential access patterns",
      "Scales horizontally by adding more DataNodes"
    ],
    disadvantages: [
      "Not suitable for small files or random access patterns",
      "NameNode can become bottleneck and single point of failure",
      "High network overhead due to replication",
      "Write-once design limits use cases requiring frequent updates"
    ],
    bestPractices: [
      "Size blocks appropriately for your workload and cluster",
      "Monitor NameNode health and implement HA with standby NameNode",
      "Use rack awareness for intelligent replica placement",
      "Regular backup of NameNode metadata",
      "Consider alternatives like object storage for certain use cases"
    ],
    conclusion: [
      "Excellent for batch processing and analytics workloads",
      "Foundation for many big data processing frameworks",
      "Design principles apply to other distributed storage systems"
    ]
  },
  {
    question: "How would you design a global content delivery network (CDN)?",
    definition: [
      "Globally distributed network of servers that cache and serve content close to users",
      "Reduces latency, bandwidth costs, and improves user experience worldwide"
    ],
    keyCharacteristics: [
      "Edge servers distributed across multiple geographic locations",
      "Intelligent routing to direct users to nearest/best server",
      "Caching strategies for static and dynamic content",
      "Origin servers that hold the authoritative content"
    ],
    practicalExample: [
      "User in Tokyo requests image from US website",
      "DNS routes request to Tokyo edge server",
      "If cached, serve immediately; if not, fetch from origin and cache",
      "Future requests for same content served from Tokyo cache"
    ],
    advantages: [
      "Dramatically reduces page load times for global users",
      "Reduces bandwidth costs and server load on origin",
      "Improves availability through geographic distribution",
      "Can provide DDoS protection and security features"
    ],
    disadvantages: [
      "Complex cache invalidation and consistency challenges",
      "High infrastructure and operational costs",
      "Potential for serving stale content if caching policies are wrong",
      "Geographic compliance and data sovereignty issues"
    ],
    bestPractices: [
      "Implement intelligent cache eviction policies (LRU, TTL-based)",
      "Use anycast routing for automatic failover",
      "Monitor cache hit rates and origin server load",
      "Implement proper cache invalidation strategies",
      "Consider edge computing capabilities for dynamic content"
    ],
    conclusion: [
      "Essential for any global web application or service",
      "Trade-offs between performance, cost, and complexity",
      "Modern cloud providers offer managed CDN services"
    ]
  },
  {
    question: "How would you design an online multiplayer game server?",
    definition: [
      "Real-time system supporting concurrent players in shared virtual environment",
      "Must handle low-latency updates, state synchronization, and scale to many players"
    ],
    keyCharacteristics: [
      "Real-time networking with minimal latency requirements",
      "Authoritative server architecture to prevent cheating",
      "State synchronization between server and all connected clients",
      "Matchmaking system to group players into game sessions"
    ],
    practicalExample: [
      "Player movement: Client sends input, server validates and broadcasts position",
      "Combat system: Server calculates damage and health updates authoritatively",
      "Matchmaking: Queue players by skill level and find optimal game sessions",
      "Persistence: Save player progress and game state to database"
    ],
    advantages: [
      "Authoritative server prevents most forms of cheating",
      "Centralized state management ensures consistency",
      "Can implement sophisticated game mechanics and AI",
      "Enables large-scale multiplayer experiences"
    ],
    disadvantages: [
      "High infrastructure costs for real-time processing",
      "Network latency affects gameplay experience",
      "Complex synchronization and prediction algorithms needed",
      "Scaling challenges for popular games with millions of players"
    ],
    bestPractices: [
      "Use UDP for real-time game state updates, TCP for critical data",
      "Implement client-side prediction with server reconciliation",
      "Design game loop to run at consistent tick rate (e.g., 60Hz)",
      "Use regional servers to minimize network latency",
      "Implement anti-cheat measures and input validation",
      "Plan for horizontal scaling with multiple game server instances"
    ],
    conclusion: [
      "One of the most demanding real-time distributed system challenges",
      "Success requires expertise in networking, game design, and scalability",
      "Must balance performance, security, and user experience"
    ]
  }
];