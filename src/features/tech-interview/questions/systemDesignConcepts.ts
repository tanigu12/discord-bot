import { SystemDesignConcept } from '../types';

export const systemDesignConcepts: SystemDesignConcept[] = [
  {
    question: "How would you design a search engine like Google?",
    requirementsGathering: [
      "Clarify scope: Web search or specific domain? Global or regional?",
      "Scale expectations: ~100B web pages indexed, ~10B searches/day",
      "Performance: Sub-second response time, 99.9% availability"
    ],
    functionalRequirements: [
      "Web crawling: Discover and fetch web pages continuously",
      "Indexing: Process content and build searchable index",
      "Query processing: Parse and understand search queries",
      "Ranking: Return most relevant results for each query"
    ],
    nonFunctionalRequirements: [
      "Latency: <200ms response time for 95% of queries",
      "Availability: 99.9% uptime (8.76 hours downtime/year)",
      "Throughput: Handle 100K queries per second at peak",
      "Consistency: Fresh index updates within 24 hours"
    ],
    capacityEstimation: [
      "Storage: 100B pages × 100KB avg = 10PB raw content + index overhead",
      "QPS: 10B queries/day = ~115K QPS average, ~300K QPS peak",
      "Bandwidth: Crawling 10TB/day, serving 100GB/s query results",
      "Servers: ~10K servers for indexing, ~5K for query serving"
    ],
    highLevelDesign: [
      "Client → CDN/Load Balancer → Web Frontend → Query Service",
      "Crawler Service → Content Processor → Index Builder → Distributed Index",
      "Ranking Service → Result Aggregator → Response Cache",
      "Separate read (query) and write (indexing) paths for optimization"
    ],
    detailedDesign: [
      "Crawler: Distributed crawlers with URL frontier, politeness policies",
      "Indexer: MapReduce pipeline for inverted index construction",
      "Query Service: Parse query → Index lookup → Ranking → Aggregation",
      "Caching: Query cache (Redis), Index cache, CDN for static assets"
    ],
    databaseDesign: [
      "Inverted Index: Sharded by term hash across multiple servers",
      "Document Store: Sharded by document ID for snippet generation",
      "Link Graph: For PageRank calculation, graph database or distributed storage",
      "URL Frontier: Queue system (Kafka) for managing crawl candidates"
    ],
    apiDesign: [
      "GET /search?q={query}&page={n}&size={m} - Main search endpoint",
      "GET /suggest?q={partial} - Query auto-completion",
      "POST /index/submit - Submit URLs for indexing",
      "Rate limiting: 1000 requests/hour per API key"
    ],
    scalingStrategy: [
      "Horizontal partitioning: Shard index by term hash",
      "Read replicas: Multiple copies of index for query load distribution",
      "Caching layers: Query cache → Index cache → Storage",
      "Auto-scaling: Scale query servers based on QPS, crawlers based on queue depth"
    ],
    monitoring: [
      "Business metrics: Query latency P99, result relevance score, index freshness",
      "System metrics: CPU/memory usage, disk I/O, network bandwidth",
      "Application metrics: Cache hit rate, crawler success rate, index size",
      "Alerts: P99 latency > 500ms, availability < 99.9%, index lag > 48h"
    ],
    tradeoffs: [
      "Freshness vs Performance: Real-time indexing increases latency",
      "Relevance vs Speed: Complex ranking algorithms slow down queries",
      "Storage vs Compute: Pre-computed results use more storage but faster queries",
      "Consistency vs Availability: Strong consistency reduces availability during updates"
    ]
  },
  {
    question: "How would you design a load balancer?",
    requirementsGathering: [
      "Traffic scale: 1M requests/second, 100+ backend servers",
      "Latency requirement: <1ms additional latency overhead",
      "Availability: 99.99% uptime, graceful handling of server failures"
    ],
    functionalRequirements: [
      "Route incoming requests to healthy backend servers",
      "Health monitoring: Detect and remove failed servers from rotation",
      "Load balancing algorithms: Round-robin, least connections, weighted",
      "SSL termination: Handle HTTPS encryption/decryption"
    ],
    nonFunctionalRequirements: [
      "Performance: <1ms latency overhead, handle 1M+ concurrent connections",
      "Availability: 99.99% uptime with automatic failover",
      "Scalability: Support adding/removing backend servers dynamically",
      "Security: DDoS protection, rate limiting, SSL/TLS support"
    ],
    capacityEstimation: [
      "Connections: 1M concurrent connections, 10K new connections/second",
      "Throughput: 1M requests/second, 10GB/s data transfer",
      "CPU: SSL termination for 100K HTTPS connections requires dedicated resources",
      "Memory: Connection state tracking, ~1KB per connection = 1GB for 1M connections"
    ],
    highLevelDesign: [
      "Client → L4 Load Balancer (TCP/UDP) → L7 Load Balancer (HTTP)",
      "Health Check Service → Backend Server Pool",
      "Configuration Service → Load Balancer Instances",
      "Active-Passive HA setup with shared state synchronization"
    ],
    detailedDesign: [
      "Request Flow: Accept connection → Choose server → Proxy request → Return response",
      "Health Checks: HTTP /health endpoint every 5s, remove after 3 failures",
      "Session Persistence: Consistent hashing or sticky sessions for stateful apps",
      "Circuit Breaker: Stop routing to servers with high error rates"
    ],
    databaseDesign: [
      "Server Registry: Current server list with health status and weights",
      "Connection Pool: Reusable connections to backend servers",
      "Metrics Store: Request counts, response times, error rates per server",
      "Configuration: Load balancing rules and health check settings"
    ],
    apiDesign: [
      "GET /health - Load balancer health status",
      "POST /servers - Add backend server to pool",
      "DELETE /servers/{id} - Remove server from pool",
      "GET /stats - Current traffic and performance statistics"
    ],
    scalingStrategy: [
      "Horizontal: Multiple load balancer instances with consistent hashing",
      "Vertical: Scale up hardware for single-instance performance",
      "Geographic: Regional load balancers with global traffic management",
      "Auto-scaling: Add LB instances based on connection count and CPU usage"
    ],
    monitoring: [
      "Performance: Request latency P50/P95/P99, throughput, connection count",
      "Health: Backend server availability, health check success rate",
      "Errors: 4xx/5xx error rates, connection failures, timeout rates",
      "Capacity: CPU/memory usage, active connections, backend server utilization"
    ],
    tradeoffs: [
      "L4 vs L7: L4 faster but less intelligent routing, L7 slower but content-aware",
      "Session Persistence vs Load Distribution: Sticky sessions can create hotspots",
      "Health Check Frequency: More frequent = faster detection but higher overhead",
      "Failover Speed vs False Positives: Faster failover may trigger on temporary issues"
    ]
  }
];