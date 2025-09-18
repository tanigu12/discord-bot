export interface TechInterviewAnswer {
  question: string;
  definition: string[];
  keyCharacteristics: string[];
  advantages?: string[];
  disadvantages?: string[];
  practicalExample: string[];
  bestPractices: string[];
  conclusion: string[];
}

export class TechInterviewService {
  private readonly questions: TechInterviewAnswer[] = [
    // Original 10 questions
    {
      question: "Can you explain the difference between a process and a thread?",
      definition: [
        "A process is an independent program running in memory",
        "A thread is a smaller execution unit inside a process"
      ],
      keyCharacteristics: [
        "Processes do not share memory space",
        "Threads inside the same process share memory and resources",
        "Threads are lighter and faster to create compared to processes"
      ],
      advantages: [
        "Processes are safer because they are isolated",
        "Threads are efficient for parallel execution"
      ],
      disadvantages: [
        "Processes use more memory overhead",
        "Threads can cause race conditions and synchronization issues"
      ],
      practicalExample: [
        "A browser is a process with multiple tabs as threads",
        "If one tab crashes, other tabs may still work",
        "Each process has its own memory space"
      ],
      bestPractices: [
        "Use multiple processes for stability and isolation (e.g., web servers)",
        "Use multiple threads for parallel tasks within an application",
        "Consider thread safety when sharing data between threads"
      ],
      conclusion: [
        "Processes are heavy but safe, threads are light but risky",
        "Choose based on system requirements (safety vs performance)",
        "Modern applications often use both approaches strategically"
      ]
    },
    {
      question: "What is the time complexity of a binary search algorithm?",
      definition: [
        "Binary search finds a target value in a sorted array",
        "Works by repeatedly dividing the search interval in half"
      ],
      keyCharacteristics: [
        "Time complexity is O(log n)",
        "Space complexity is O(1) for iterative implementation",
        "Array must be sorted beforehand"
      ],
      advantages: [
        "Very efficient for large datasets",
        "Much faster than linear search O(n)"
      ],
      disadvantages: [
        "Requires the array to be sorted first",
        "Not suitable for unsorted data"
      ],
      practicalExample: [
        "Like looking up a word in a dictionary",
        "Open to the middle, then go left or right based on alphabetical order",
        "Continue until you find the target word"
      ],
      bestPractices: [
        "Use when you have a sorted dataset with frequent lookups",
        "Consider the cost of sorting if data changes frequently",
        "Ideal for static or rarely-changed datasets"
      ],
      conclusion: [
        "Binary search is extremely efficient O(log n) but only works on sorted data",
        "Perfect for scenarios with many searches on stable datasets",
        "Trade-off between sorting cost and search efficiency"
      ]
    },
    {
      question: "How would you design a RESTful API?",
      definition: [
        "REST is an architectural style for networked applications",
        "Uses standard HTTP methods for communication"
      ],
      keyCharacteristics: [
        "Uses HTTP methods (GET, POST, PUT, DELETE)",
        "Stateless communication between client and server",
        "Resource-based URLs with clear hierarchy",
        "JSON/XML data format for responses"
      ],
      advantages: [
        "Simple and intuitive to understand",
        "Cacheable responses improve performance",
        "Scalable and stateless architecture"
      ],
      disadvantages: [
        "Can be chattier than other approaches (multiple requests)",
        "Limited by HTTP methods and status codes"
      ],
      practicalExample: [
        "GET /api/users/123 retrieves user 123",
        "POST /api/users creates a new user",
        "PUT /api/users/123 updates user 123"
      ],
      bestPractices: [
        "Use proper HTTP status codes (200, 404, 500)",
        "Version your API (/v1/users, /v2/users)",
        "Implement proper authentication and authorization",
        "Use consistent naming conventions"
      ],
      conclusion: [
        "RESTful APIs provide standardized, scalable web services",
        "Leverages familiar HTTP methods and clear resource URLs",
        "Ideal for web applications requiring simple, stateless communication"
      ]
    },
    {
      question: "What are the differences between SQL and NoSQL databases?",
      definition: [
        "SQL databases use structured query language and relational tables",
        "NoSQL databases use various models: document, key-value, graph"
      ],
      keyCharacteristics: [
        "SQL: ACID compliance, fixed schema, complex joins",
        "NoSQL: Flexible schema, horizontal scaling, eventual consistency",
        "SQL: Complex queries with relationships",
        "NoSQL: Simpler queries, better performance for specific use cases"
      ],
      advantages: [
        "SQL: Strong consistency and mature ecosystem",
        "SQL: Complex queries and transactions",
        "NoSQL: Excellent scalability and flexibility",
        "NoSQL: Better performance for simple queries"
      ],
      disadvantages: [
        "SQL: Harder to scale horizontally, rigid schema changes",
        "NoSQL: Eventual consistency, less mature tooling",
        "NoSQL: Limited complex query capabilities"
      ],
      practicalExample: [
        "SQL: PostgreSQL for e-commerce with financial transactions",
        "NoSQL: MongoDB for social media posts and user profiles",
        "NoSQL: Redis for caching and session storage"
      ],
      bestPractices: [
        "Choose SQL for complex relationships and ACID transactions",
        "Choose NoSQL for rapid scaling and flexible data structures",
        "Consider hybrid approaches for different parts of your system"
      ],
      conclusion: [
        "SQL excels at consistency and complex relationships",
        "NoSQL offers flexibility and horizontal scalability",
        "Choose based on consistency requirements and scale needs"
      ]
    },
    {
      question: "Explain how garbage collection works in Java or another language you use.",
      definition: [
        "Automatic memory management process",
        "Reclaims memory from objects no longer reachable or referenced"
      ],
      keyCharacteristics: [
        "Automatically frees unused memory",
        "Runs in background during program execution",
        "Uses algorithms like mark-and-sweep or generational collection",
        "Prevents memory leaks in managed languages"
      ],
      advantages: [
        "Prevents memory leaks automatically",
        "Reduces programming errors related to memory management",
        "Simplifies development by handling memory automatically"
      ],
      disadvantages: [
        "Performance overhead during collection cycles",
        "Unpredictable timing can affect application performance",
        "Can cause application pauses (stop-the-world events)"
      ],
      practicalExample: [
        "In Java, objects created with 'new' are automatically managed",
        "When no variables reference an object, it becomes eligible for GC",
        "GC runs periodically to free up memory from unreachable objects"
      ],
      bestPractices: [
        "Minimize object creation in performance-critical loops",
        "Choose appropriate GC algorithms for your use case",
        "Monitor GC performance and tune parameters in production",
        "Use object pooling for frequently created/destroyed objects"
      ],
      conclusion: [
        "GC provides automatic memory management with some performance cost",
        "Greatly reduces memory-related bugs and development complexity",
        "Modern GC algorithms minimize impact on application performance"
      ]
    },
    {
      question: "How would you design a URL shortening service like bit.ly?",
      definition: [
        "Service that converts long URLs into shorter, manageable links",
        "Provides redirection from short URL to original destination"
      ],
      keyCharacteristics: [
        "Database mapping long URLs to unique short codes",
        "Base62 encoding for generating short URL identifiers",
        "HTTP redirect service for URL resolution",
        "Analytics tracking for click metrics and usage patterns"
      ],
      advantages: [
        "Saves space in messages and social media posts",
        "Provides detailed click analytics and metrics",
        "Can update destination without changing short URL",
        "Enables A/B testing with different destinations"
      ],
      disadvantages: [
        "Single point of failure if service goes down",
        "Link rot problem if service discontinues",
        "Security concerns with malicious redirect possibilities",
        "Dependency on third-party service for critical links"
      ],
      practicalExample: [
        "User submits 'https://very-long-url.com/article'",
        "System generates unique short code: 'bit.ly/abc123'",
        "When clicked, service redirects to original URL",
        "Analytics track clicks, geography, and referrer data"
      ],
      bestPractices: [
        "Use distributed architecture for high availability",
        "Implement aggressive caching for popular URLs",
        "Add expiration policies for temporary links",
        "Include security scanning for malicious URLs",
        "Design for horizontal scaling and load balancing"
      ],
      conclusion: [
        "Requires careful database design and caching strategy",
        "Must plan for high traffic and provide reliable service",
        "Balance between simplicity and feature-rich analytics"
      ]
    },
    {
      question: "What are microservices, and what are their pros and cons?",
      definition: [
        "Architectural pattern using small, independent services",
        "Services communicate over well-defined APIs"
      ],
      keyCharacteristics: [
        "Loosely coupled, independently deployable services",
        "Each service has its own database and business logic",
        "Communication via REST APIs, messaging, or events",
        "Services can use different technologies and languages"
      ],
      advantages: [
        "Technology diversity - choose best tool for each service",
        "Independent scaling based on individual service needs",
        "Fault isolation - failure in one service doesn't crash others",
        "Team autonomy - different teams can own different services"
      ],
      disadvantages: [
        "Increased system complexity and operational overhead",
        "Network latency between service communications",
        "Data consistency challenges across services",
        "Distributed system debugging is more difficult"
      ],
      practicalExample: [
        "E-commerce app with separate services:",
        "- User management service handles authentication",
        "- Inventory service manages product catalog",
        "- Payment service processes transactions",
        "- Notification service sends emails/SMS"
      ],
      bestPractices: [
        "Start with monolith, then split when team/complexity grows",
        "Use API gateways for routing and cross-cutting concerns",
        "Implement comprehensive monitoring and distributed tracing",
        "Plan carefully for distributed transactions and data consistency"
      ],
      conclusion: [
        "Offers flexibility and scalability but increases complexity",
        "Best for large teams and complex applications",
        "Requires strong DevOps practices and monitoring"
      ]
    },
    {
      question: "Tell me about a time you faced a difficult bug. How did you solve it?",
      definition: [
        "Behavioral question about problem-solving skills",
        "Assesses debugging methodology in real situations"
      ],
      keyCharacteristics: [
        "Use STAR method (Situation, Task, Action, Result)",
        "Focus on systematic debugging approach",
        "Show learning and growth from the experience",
        "Demonstrate technical problem-solving skills"
      ],
      practicalExample: [
        "Situation: Memory leak causing production crashes",
        "Task: Find root cause and fix without downtime",
        "Action: Used profiling tools, analyzed heap dumps",
        "Result: Identified cause, fixed leak, prevented future occurrences"
      ],
      bestPractices: [
        "Be specific about tools and techniques used",
        "Explain your systematic thought process",
        "Mention what you learned from the experience",
        "Show how you prevented similar issues in the future",
        "Include collaboration with team members if applicable"
      ],
      conclusion: [
        "Good answers demonstrate systematic problem-solving",
        "Show appropriate use of debugging tools and techniques",
        "Highlight learning and continuous improvement mindset"
      ]
    },
    {
      question: "Have you worked with a team using Git? How did you manage merge conflicts?",
      definition: [
        "Assesses collaboration skills in team environments",
        "Tests version control knowledge and conflict resolution"
      ],
      keyCharacteristics: [
        "Understanding of Git workflows and branching strategies",
        "Knowledge of conflict resolution techniques",
        "Emphasis on team communication and coordination",
        "Prevention techniques to minimize conflicts"
      ],
      practicalExample: [
        "Used Git flow with feature branches for development",
        "When conflicts occurred, communicated with team members",
        "Used merge tools like VS Code or Git GUI tools",
        "Tested thoroughly after resolving conflicts"
      ],
      bestPractices: [
        "Make frequent, small commits with clear messages",
        "Communicate with team before merging large changes",
        "Use pull requests for code review and discussion",
        "Keep feature branches short-lived and focused",
        "Regularly sync with main branch to avoid large conflicts"
      ],
      conclusion: [
        "Effective Git collaboration requires good communication",
        "Proper branching strategies prevent most conflicts",
        "Systematic conflict resolution ensures code quality"
      ]
    },
    {
      question: "What is CI/CD, and how have you used it in your projects?",
      definition: [
        "CI/CD: Continuous Integration and Continuous Deployment",
        "Practices that automate testing and deployment of code changes"
      ],
      keyCharacteristics: [
        "Automated testing runs on every code commit",
        "Automated deployment to staging and production environments",
        "Quick feedback loops for developers",
        "Integration with version control systems"
      ],
      advantages: [
        "Faster delivery of features to users",
        "Reduced manual errors in deployment process",
        "Quick detection and fixing of bugs",
        "Consistent, repeatable deployments"
      ],
      disadvantages: [
        "Initial setup complexity and learning curve",
        "Requires comprehensive test coverage to be effective",
        "Can be resource-intensive for build/test infrastructure"
      ],
      practicalExample: [
        "GitHub Actions pipeline example:",
        "1. Developer pushes code → triggers pipeline",
        "2. Run automated tests and linting",
        "3. Build Docker image if tests pass",
        "4. Deploy to staging environment",
        "5. Manual approval step for production deployment"
      ],
      bestPractices: [
        "Start with simple pipelines and gradually add complexity",
        "Ensure comprehensive test coverage before automating",
        "Use staging environments that mirror production",
        "Implement rollback strategies for quick recovery",
        "Monitor deployments and set up alerting"
      ],
      conclusion: [
        "CI/CD is essential for modern software development",
        "Provides automation that increases reliability and delivery speed",
        "Investment in setup pays off with reduced deployment risks"
      ]
    },

    // Computer Science Fundamentals (10 questions)
    {
      question: "What is the difference between time complexity and space complexity?",
      definition: [
        "Time complexity measures how runtime grows with input size",
        "Space complexity measures how memory usage grows with input size"
      ],
      keyCharacteristics: [
        "Both use Big O notation (O(n), O(log n), O(n²))",
        "Time complexity focuses on computational steps",
        "Space complexity includes auxiliary space used by algorithm",
        "Both help predict algorithm scalability"
      ],
      advantages: [
        "Time complexity: Predicts performance bottlenecks",
        "Space complexity: Helps manage memory constraints",
        "Both enable comparison between different algorithms"
      ],
      disadvantages: [
        "Worst-case analysis may not reflect real-world performance",
        "Constants and lower-order terms are ignored",
        "Hardware-specific optimizations not considered"
      ],
      practicalExample: [
        "Bubble sort: O(n²) time, O(1) space - slow but memory efficient",
        "Merge sort: O(n log n) time, O(n) space - faster but uses more memory",
        "Hash table: O(1) average time, O(n) space - fast lookups, more memory"
      ],
      bestPractices: [
        "Analyze both time and space complexity for complete understanding",
        "Consider average-case complexity, not just worst-case",
        "Balance time vs space trade-offs based on constraints",
        "Profile real performance when complexity analysis isn't enough"
      ],
      conclusion: [
        "Time and space complexity provide different optimization perspectives",
        "Both are crucial for designing scalable algorithms",
        "Real-world algorithm choice depends on specific constraints"
      ]
    },
    {
      question: "Explain how a compiler works compared to an interpreter.",
      definition: [
        "Compiler translates entire source code to machine code before execution",
        "Interpreter executes source code line by line during runtime"
      ],
      keyCharacteristics: [
        "Compiler: Source → Machine code → Execution",
        "Interpreter: Source → Direct execution (no separate executable)",
        "Compiler produces standalone executable files",
        "Interpreter requires runtime environment to execute code"
      ],
      advantages: [
        "Compiler: Faster execution, early error detection, no runtime dependency",
        "Interpreter: Faster development cycle, interactive debugging, platform independence"
      ],
      disadvantages: [
        "Compiler: Slower development, platform-specific executables",
        "Interpreter: Slower execution, requires interpreter installation"
      ],
      practicalExample: [
        "C/C++: Compiled to native machine code for specific architecture",
        "Python: Interpreted (or compiled to bytecode then interpreted)",
        "Java: Hybrid approach - compiled to bytecode, then interpreted/JIT compiled"
      ],
      bestPractices: [
        "Use compilers for performance-critical production applications",
        "Use interpreters for rapid prototyping and development",
        "Consider hybrid approaches (Java, C#) for balance",
        "Choose based on deployment requirements and team workflow"
      ],
      conclusion: [
        "Compilers optimize for runtime performance and deployment",
        "Interpreters optimize for development speed and flexibility",
        "Modern languages often use hybrid approaches for best of both worlds"
      ]
    },
    {
      question: "What is the difference between BFS (Breadth-First Search) and DFS (Depth-First Search)?",
      definition: [
        "BFS explores graph level by level, visiting all neighbors first",
        "DFS explores graph by going as deep as possible before backtracking"
      ],
      keyCharacteristics: [
        "BFS uses queue data structure (FIFO)",
        "DFS uses stack data structure (LIFO) or recursion",
        "BFS finds shortest path in unweighted graphs",
        "DFS uses less memory but may not find shortest path"
      ],
      advantages: [
        "BFS: Finds shortest path, explores systematically",
        "DFS: Lower memory usage, good for exploring all paths"
      ],
      disadvantages: [
        "BFS: Higher memory usage due to queue storage",
        "DFS: May not find optimal solution, risk of infinite loops"
      ],
      practicalExample: [
        "BFS: Finding shortest route in GPS navigation",
        "DFS: Solving mazes, checking if path exists",
        "BFS: Social network - friends of friends discovery",
        "DFS: File system traversal, dependency resolution"
      ],
      bestPractices: [
        "Use BFS when shortest path is required",
        "Use DFS when you need to explore all possibilities",
        "Implement cycle detection to avoid infinite loops in DFS",
        "Consider memory constraints when choosing between them"
      ],
      conclusion: [
        "BFS excels at finding optimal solutions in unweighted scenarios",
        "DFS is memory-efficient and good for exhaustive exploration",
        "Choice depends on specific problem requirements and constraints"
      ]
    },
    {
      question: "Explain how a deadlock occurs in operating systems.",
      definition: [
        "Deadlock occurs when processes wait indefinitely for resources",
        "Each process holds resources needed by others, creating circular dependency"
      ],
      keyCharacteristics: [
        "Mutual exclusion: Resources cannot be shared",
        "Hold and wait: Processes hold resources while waiting for others",
        "No preemption: Resources cannot be forcibly taken",
        "Circular wait: Circular chain of resource dependencies"
      ],
      practicalExample: [
        "Process A holds File1, needs File2",
        "Process B holds File2, needs File1",
        "Both processes wait forever, creating deadlock",
        "Real example: Database transactions waiting for locked records"
      ],
      advantages: [
        "Understanding deadlocks helps design robust systems",
        "Prevention techniques ensure system reliability"
      ],
      disadvantages: [
        "Deadlock detection and recovery can be expensive",
        "Prevention may reduce system efficiency",
        "Can cause system freezes and resource wastage"
      ],
      bestPractices: [
        "Order resource acquisition consistently across processes",
        "Use timeouts for resource requests",
        "Implement deadlock detection algorithms",
        "Design systems to avoid circular dependencies",
        "Use tools like database transaction isolation levels"
      ],
      conclusion: [
        "Deadlocks are preventable through careful system design",
        "Understanding the four conditions helps in prevention strategies",
        "Trade-off between prevention overhead and system robustness"
      ]
    },
    {
      question: "What is a race condition, and how can you prevent it?",
      definition: [
        "Race condition occurs when multiple processes access shared data concurrently",
        "Final result depends on timing and order of execution"
      ],
      keyCharacteristics: [
        "Non-deterministic behavior - results vary between runs",
        "Occurs in multi-threaded or multi-process environments",
        "Involves shared mutable state",
        "Timing-dependent execution leads to inconsistent results"
      ],
      practicalExample: [
        "Two threads incrementing a counter simultaneously",
        "Thread A reads counter (value 5), Thread B reads counter (value 5)",
        "Both increment and write back 6, but result should be 7",
        "Banking example: Two withdrawals from same account simultaneously"
      ],
      advantages: [
        "Understanding race conditions improves concurrent programming",
        "Prevention techniques ensure data consistency"
      ],
      disadvantages: [
        "Race conditions cause unpredictable system behavior",
        "Difficult to debug due to timing-dependent nature",
        "Can lead to data corruption and system crashes"
      ],
      bestPractices: [
        "Use synchronization primitives: mutexes, semaphores, locks",
        "Implement atomic operations for simple shared data",
        "Use immutable data structures when possible",
        "Apply thread-safe programming patterns",
        "Test concurrent code extensively with tools like ThreadSanitizer"
      ],
      conclusion: [
        "Race conditions are serious bugs in concurrent systems",
        "Prevention through proper synchronization is essential",
        "Modern languages provide tools to help avoid race conditions"
      ]
    },
    {
      question: "What are ACID properties in databases?",
      definition: [
        "ACID ensures database transactions are processed reliably",
        "Stands for Atomicity, Consistency, Isolation, Durability"
      ],
      keyCharacteristics: [
        "Atomicity: Transaction is all-or-nothing",
        "Consistency: Database remains in valid state",
        "Isolation: Concurrent transactions don't interfere",
        "Durability: Committed changes persist permanently"
      ],
      practicalExample: [
        "Bank transfer: Debit from Account A, Credit to Account B",
        "Atomicity: Both operations succeed or both fail",
        "Consistency: Total money remains same before/after",
        "Isolation: Other transactions don't see partial transfer",
        "Durability: Transfer persists even after system crash"
      ],
      advantages: [
        "Ensures data integrity and consistency",
        "Provides reliable transaction processing",
        "Prevents data corruption in concurrent environments"
      ],
      disadvantages: [
        "Can impact performance due to locking and logging overhead",
        "May reduce system throughput in high-concurrency scenarios",
        "Stricter isolation levels can cause deadlocks"
      ],
      bestPractices: [
        "Use appropriate isolation levels for your use case",
        "Keep transactions as short as possible",
        "Design for idempotency to handle retry scenarios",
        "Consider eventual consistency for non-critical operations"
      ],
      conclusion: [
        "ACID properties are fundamental to reliable database systems",
        "Trade-off between consistency guarantees and performance",
        "Essential for financial and critical data applications"
      ]
    },
    {
      question: "Can you explain CAP theorem in distributed systems?",
      definition: [
        "CAP theorem states you can only guarantee 2 out of 3 properties",
        "Consistency, Availability, Partition tolerance in distributed systems"
      ],
      keyCharacteristics: [
        "Consistency: All nodes see the same data simultaneously",
        "Availability: System remains operational even with failures",
        "Partition tolerance: System continues despite network splits",
        "Network partitions are inevitable in distributed systems"
      ],
      practicalExample: [
        "CA (Consistency + Availability): Traditional RDBMS in single datacenter",
        "CP (Consistency + Partition tolerance): MongoDB, Redis Cluster",
        "AP (Availability + Partition tolerance): Cassandra, DynamoDB",
        "During network partition, choose consistency or availability"
      ],
      advantages: [
        "Provides framework for understanding distributed system trade-offs",
        "Helps architects make informed decisions about system design",
        "Clarifies why certain guarantees are impossible to achieve together"
      ],
      disadvantages: [
        "Oversimplifies complex distributed system considerations",
        "Real systems often provide varying levels of each property",
        "Doesn't account for latency and performance trade-offs"
      ],
      bestPractices: [
        "Design for partition tolerance in distributed systems",
        "Choose consistency vs availability based on business requirements",
        "Consider eventual consistency for non-critical data",
        "Use techniques like circuit breakers for graceful degradation"
      ],
      conclusion: [
        "CAP theorem guides distributed system architecture decisions",
        "Partition tolerance is usually mandatory in real distributed systems",
        "Modern systems often provide tunable consistency levels"
      ]
    },
    {
      question: "What is the difference between strong consistency and eventual consistency?",
      definition: [
        "Strong consistency guarantees all reads receive the most recent write",
        "Eventual consistency guarantees data will converge to consistent state over time"
      ],
      keyCharacteristics: [
        "Strong consistency: Immediate consistency across all nodes",
        "Eventual consistency: Temporary inconsistencies are acceptable",
        "Strong consistency requires coordination and waiting",
        "Eventual consistency prioritizes availability and performance"
      ],
      practicalExample: [
        "Strong consistency: Banking system - account balance must be accurate",
        "Eventual consistency: Social media likes - slight delays acceptable",
        "Strong: ATM withdrawal requires real-time balance check",
        "Eventual: Friend count on profile can be slightly outdated"
      ],
      advantages: [
        "Strong: Simplifies application logic, guarantees data correctness",
        "Eventual: Higher availability, better performance, scalable"
      ],
      disadvantages: [
        "Strong: Lower availability, higher latency, scalability limits",
        "Eventual: Complex conflict resolution, temporary inconsistencies"
      ],
      bestPractices: [
        "Use strong consistency for critical business operations",
        "Use eventual consistency for user-facing, non-critical features",
        "Design conflict resolution strategies for eventual consistency",
        "Consider hybrid approaches with different consistency per data type"
      ],
      conclusion: [
        "Choice depends on business requirements and user experience needs",
        "Strong consistency for critical data, eventual for user convenience",
        "Modern systems often combine both approaches strategically"
      ]
    },
    {
      question: "How does a garbage collector decide which objects to free?",
      definition: [
        "Garbage collector identifies unreachable objects and reclaims their memory",
        "Uses various algorithms to determine object reachability and lifecycle"
      ],
      keyCharacteristics: [
        "Reachability analysis: Traces from root references (stack, globals)",
        "Mark and sweep: Mark reachable objects, sweep unmarked ones",
        "Generational collection: Young objects collected more frequently",
        "Reference counting: Track number of references to each object"
      ],
      practicalExample: [
        "Root objects: Local variables in stack, static variables",
        "Mark phase: Starting from roots, mark all reachable objects",
        "Sweep phase: Free memory of all unmarked objects",
        "Generational: Assume young objects die young, old objects survive"
      ],
      advantages: [
        "Automatic memory management reduces programming errors",
        "Prevents memory leaks in most cases",
        "Optimizes for common object lifecycle patterns"
      ],
      disadvantages: [
        "GC pauses can affect application performance",
        "Memory overhead for tracking object metadata",
        "Less predictable memory usage patterns"
      ],
      bestPractices: [
        "Minimize object allocations in performance-critical paths",
        "Use object pooling for frequently created/destroyed objects",
        "Tune GC parameters based on application characteristics",
        "Monitor GC performance and adjust heap sizes appropriately"
      ],
      conclusion: [
        "Modern GC algorithms are sophisticated and efficient",
        "Understanding GC behavior helps optimize application performance",
        "Trade-off between automatic management and performance control"
      ]
    },
    {
      question: "What is a bloom filter, and where is it used?",
      definition: [
        "Probabilistic data structure that tests set membership",
        "Can definitively say 'not in set' but may have false positives"
      ],
      keyCharacteristics: [
        "Space-efficient probabilistic data structure",
        "Uses bit array and multiple hash functions",
        "No false negatives, but allows false positives",
        "Cannot remove elements once added"
      ],
      practicalExample: [
        "Web crawling: Check if URL already visited before expensive fetch",
        "Database: Check if key might exist before disk lookup",
        "CDN: Quickly filter requests that definitely won't be cached",
        "Spell checkers: Quick check if word might be misspelled"
      ],
      advantages: [
        "Extremely space-efficient compared to hash tables",
        "Constant-time operations regardless of set size",
        "Useful for avoiding expensive operations (disk I/O, network calls)"
      ],
      disadvantages: [
        "False positives can trigger unnecessary expensive operations",
        "Cannot remove elements or get exact count",
        "Requires careful tuning of size and hash function count"
      ],
      bestPractices: [
        "Use when false positives are acceptable but false negatives aren't",
        "Tune bit array size and hash count based on expected elements",
        "Consider counting bloom filters if removal is needed",
        "Use as first-level filter before more expensive exact checks"
      ],
      conclusion: [
        "Excellent for scenarios where space is limited and false positives acceptable",
        "Commonly used in distributed systems and databases",
        "Powerful optimization tool when applied to appropriate problems"
      ]
    },

    // Software Engineering & Architecture (10 questions)
    {
      question: "What is the difference between layered architecture and hexagonal architecture?",
      definition: [
        "Layered architecture organizes code in horizontal layers (presentation, business, data)",
        "Hexagonal architecture isolates core business logic from external concerns"
      ],
      keyCharacteristics: [
        "Layered: Top-down dependencies, each layer talks to layer below",
        "Hexagonal: Core business logic at center, ports/adapters for external systems",
        "Layered: Traditional 3-tier or N-tier architecture",
        "Hexagonal: Also called 'Ports and Adapters' pattern"
      ],
      practicalExample: [
        "Layered: Web Controller → Service Layer → Repository → Database",
        "Hexagonal: Business Core ← Port → Database Adapter",
        "Hexagonal: Business Core ← Port → REST API Adapter",
        "External systems connect through adapters, not directly to business logic"
      ],
      advantages: [
        "Layered: Simple to understand, clear separation of concerns",
        "Hexagonal: Business logic independent of frameworks and external systems",
        "Hexagonal: Better testability, easier to swap implementations"
      ],
      disadvantages: [
        "Layered: Tight coupling between layers, difficult to test in isolation",
        "Hexagonal: More complex initial setup, learning curve for developers"
      ],
      bestPractices: [
        "Use layered for simple applications with clear hierarchies",
        "Use hexagonal for complex business logic that needs isolation",
        "Apply dependency inversion principle in both approaches",
        "Consider hexagonal for applications requiring multiple interfaces"
      ],
      conclusion: [
        "Layered architecture works well for straightforward applications",
        "Hexagonal architecture better for complex, testable business logic",
        "Choice depends on complexity and testing requirements"
      ]
    },
    {
      question: "Explain the concept of 'loose coupling' and why it is important.",
      definition: [
        "Loose coupling minimizes dependencies between system components",
        "Components interact through well-defined interfaces rather than direct implementation"
      ],
      keyCharacteristics: [
        "Components know little about internal implementation of others",
        "Changes in one component minimally affect others",
        "Communication through interfaces, contracts, or message passing",
        "Opposite of tight coupling where components are highly interdependent"
      ],
      practicalExample: [
        "Payment processing: OrderService uses PaymentInterface",
        "Can swap PayPal, Stripe, or Bank adapters without changing OrderService",
        "Microservices communicate via REST APIs or message queues",
        "Database abstraction layer allows switching between MySQL and PostgreSQL"
      ],
      advantages: [
        "Easier maintenance and bug fixes",
        "Better testability through mocking and stubbing",
        "Improved reusability and modularity",
        "Facilitates parallel development by different teams"
      ],
      disadvantages: [
        "Can lead to over-engineering in simple systems",
        "Additional abstraction layers may impact performance",
        "Requires careful interface design and documentation"
      ],
      bestPractices: [
        "Design clear, stable interfaces between components",
        "Use dependency injection to manage component relationships",
        "Apply single responsibility principle to each component",
        "Minimize shared state between loosely coupled components",
        "Use events or messaging for asynchronous communication"
      ],
      conclusion: [
        "Loose coupling is essential for maintainable, scalable systems",
        "Enables flexibility to change implementations without breaking dependencies",
        "Key principle in modern software architecture and microservices"
      ]
    },
    {
      question: "What is dependency injection, and why is it useful?",
      definition: [
        "Design pattern where dependencies are provided to an object rather than created internally",
        "Inverts control of dependency creation to external container or framework"
      ],
      keyCharacteristics: [
        "Dependencies passed via constructor, setter, or interface injection",
        "Object doesn't create its own dependencies",
        "IoC (Inversion of Control) container manages object lifecycle",
        "Promotes loose coupling and testability"
      ],
      practicalExample: [
        "Without DI: class OrderService { private payment = new PayPalPayment() }",
        "With DI: class OrderService { constructor(payment: PaymentInterface) }",
        "Container injects appropriate payment implementation at runtime",
        "Easy to inject mock payment service for testing"
      ],
      advantages: [
        "Improved testability through easy mocking of dependencies",
        "Better flexibility to change implementations",
        "Promotes loose coupling between components",
        "Centralized configuration and dependency management"
      ],
      disadvantages: [
        "Additional complexity and learning curve",
        "Runtime dependency resolution can hide compile-time errors",
        "Debugging can be more difficult with complex dependency graphs",
        "Performance overhead of reflection-based frameworks"
      ],
      bestPractices: [
        "Prefer constructor injection for required dependencies",
        "Use interfaces to define contracts between components",
        "Keep dependency graphs simple and avoid circular dependencies",
        "Configure dependencies close to application entry point",
        "Document dependency relationships clearly"
      ],
      conclusion: [
        "Essential pattern for writing testable, maintainable code",
        "Enables flexible architecture with swappable implementations",
        "Standard practice in modern frameworks and enterprise applications"
      ]
    },
    {
      question: "What is the difference between functional programming and object-oriented programming?",
      definition: [
        "Functional programming treats computation as evaluation of mathematical functions",
        "Object-oriented programming organizes code around objects and their interactions"
      ],
      keyCharacteristics: [
        "FP: Immutability, pure functions, no side effects",
        "OOP: Encapsulation, inheritance, polymorphism",
        "FP: Functions as first-class citizens, higher-order functions",
        "OOP: Objects contain both data and methods that operate on data"
      ],
      practicalExample: [
        "FP: map, filter, reduce operations on data collections",
        "OOP: Customer class with methods like calculateDiscount()",
        "FP: Pure function: add(a, b) => a + b (no side effects)",
        "OOP: BankAccount object with withdraw() method (modifies internal state)"
      ],
      advantages: [
        "FP: Easier to reason about, better parallelization, fewer bugs",
        "OOP: Intuitive modeling of real-world entities, code reuse through inheritance",
        "FP: Excellent for data transformation and mathematical computation",
        "OOP: Great for complex systems with clear entity relationships"
      ],
      disadvantages: [
        "FP: Steep learning curve, performance overhead of immutability",
        "OOP: Can lead to complex inheritance hierarchies, tight coupling",
        "FP: Not natural for stateful interactive applications",
        "OOP: Mutable state can cause concurrency issues"
      ],
      bestPractices: [
        "Use FP for data processing, algorithms, and stateless operations",
        "Use OOP for modeling complex business domains and entities",
        "Combine both: OOP for structure, FP for behavior",
        "Apply immutability principles even in OOP languages",
        "Choose paradigm based on problem domain and team expertise"
      ],
      conclusion: [
        "Both paradigms have strengths for different types of problems",
        "Modern languages support both approaches (multi-paradigm)",
        "Best practice is to use the most appropriate paradigm for each situation"
      ]
    },
    {
      question: "Explain the concept of 'event-driven architecture.'",
      definition: [
        "Architectural pattern where components communicate through events",
        "Producers generate events, consumers react to events asynchronously"
      ],
      keyCharacteristics: [
        "Asynchronous communication between loosely coupled components",
        "Event producers don't know about event consumers",
        "Events represent state changes or significant occurrences",
        "Message brokers or event buses facilitate event distribution"
      ],
      practicalExample: [
        "E-commerce: OrderCreated event triggers inventory update, payment processing, email notification",
        "User registration: UserSignedUp event triggers welcome email, analytics, account setup",
        "Microservices communicate via events rather than direct API calls",
        "Event sourcing: Store events rather than current state"
      ],
      advantages: [
        "High scalability and performance through asynchronous processing",
        "Loose coupling between components",
        "Easy to add new event consumers without modifying producers",
        "Natural fit for distributed systems and microservices"
      ],
      disadvantages: [
        "Complex debugging and tracing of event flows",
        "Eventual consistency challenges",
        "Potential for event ordering and duplicate processing issues",
        "Requires robust error handling and retry mechanisms"
      ],
      bestPractices: [
        "Design events to be immutable and self-contained",
        "Use event schemas and versioning for compatibility",
        "Implement idempotent event handlers to handle duplicates",
        "Monitor event flows and implement distributed tracing",
        "Consider event sourcing for audit trails and replay capability"
      ],
      conclusion: [
        "Excellent for building scalable, resilient distributed systems",
        "Enables reactive architecture with loose coupling",
        "Requires careful design for complexity management"
      ]
    },
    {
      question: "What is the difference between vertical scaling and horizontal scaling?",
      definition: [
        "Vertical scaling (scale up) increases power of existing machines",
        "Horizontal scaling (scale out) adds more machines to the pool of resources"
      ],
      keyCharacteristics: [
        "Vertical: Add more CPU, RAM, or storage to single machine",
        "Horizontal: Add more servers or instances to distribute load",
        "Vertical: Limited by hardware maximum capacity",
        "Horizontal: Theoretically unlimited scaling potential"
      ],
      practicalExample: [
        "Vertical: Upgrade database server from 8GB to 32GB RAM",
        "Horizontal: Add 3 more web servers behind load balancer",
        "Vertical: Replace 4-core CPU with 16-core CPU",
        "Horizontal: Auto-scaling groups adding EC2 instances based on load"
      ],
      advantages: [
        "Vertical: Simpler to implement, no architectural changes needed",
        "Horizontal: Better fault tolerance, cost-effective, unlimited growth potential",
        "Vertical: No network latency between components"
      ],
      disadvantages: [
        "Vertical: Single point of failure, expensive hardware, hard limits",
        "Horizontal: Complex distributed system challenges, network latency",
        "Vertical: Downtime required for hardware upgrades"
      ],
      bestPractices: [
        "Use vertical scaling for databases and stateful applications initially",
        "Use horizontal scaling for stateless web applications and services",
        "Design applications to be horizontally scalable from the start",
        "Combine both approaches: scale up individual nodes and scale out clusters"
      ],
      conclusion: [
        "Horizontal scaling is preferred for modern cloud-native applications",
        "Vertical scaling is simpler but has natural limits",
        "Most successful systems use a combination of both approaches"
      ]
    },
    {
      question: "What are design patterns, and can you give an example (e.g., Singleton, Factory, Observer)?",
      definition: [
        "Design patterns are reusable solutions to commonly occurring software design problems",
        "Provide templates for how to solve problems in specific situations"
      ],
      keyCharacteristics: [
        "Three categories: Creational, Structural, Behavioral patterns",
        "Language-independent architectural guidance",
        "Proven solutions with known trade-offs",
        "Improve code communication and maintainability"
      ],
      practicalExample: [
        "Singleton: Database connection pool - ensure only one instance exists",
        "Factory: Create different types of payment processors based on country",
        "Observer: Newsletter subscription - notify all subscribers when new article published",
        "Strategy: Different algorithms for tax calculation based on region"
      ],
      advantages: [
        "Provide proven solutions to common problems",
        "Improve code readability and communication between developers",
        "Reduce development time by reusing established patterns",
        "Help avoid common design pitfalls"
      ],
      disadvantages: [
        "Can lead to over-engineering if applied inappropriately",
        "May add unnecessary complexity to simple problems",
        "Some patterns can impact performance (like Singleton global state)",
        "Risk of forcing problems to fit patterns rather than finding best solution"
      ],
      bestPractices: [
        "Learn patterns but don't force them into every situation",
        "Focus on solving the problem first, then see if patterns apply",
        "Understand the trade-offs and context where each pattern works best",
        "Modern languages and frameworks often provide built-in pattern implementations"
      ],
      conclusion: [
        "Design patterns are valuable tools in software architect's toolkit",
        "Most useful when applied thoughtfully to appropriate problems",
        "Understanding patterns improves design skills and team communication"
      ]
    },
    {
      question: "Explain the concept of 'technical debt' and how to manage it.",
      definition: [
        "Technical debt represents shortcuts or compromises in code quality for faster delivery",
        "Like financial debt, it accumulates 'interest' in the form of increased maintenance costs"
      ],
      keyCharacteristics: [
        "Deliberate or inadvertent compromises in code quality",
        "Manifests as outdated dependencies, poor documentation, code duplication",
        "Slows down feature development over time",
        "Creates risks for security, performance, and maintainability"
      ],
      practicalExample: [
        "Intentional: Skipping unit tests to meet deadline",
        "Unintentional: Using deprecated API because team wasn't aware",
        "Architecture debt: Monolithic structure when microservices would be better",
        "Documentation debt: Code without comments or updated documentation"
      ],
      advantages: [
        "Can speed up short-term delivery when time-to-market is critical",
        "Allows learning from user feedback before investing in perfect architecture",
        "Sometimes necessary for competitive business reasons"
      ],
      disadvantages: [
        "Slows down future development velocity",
        "Increases bug frequency and maintenance costs",
        "Can lead to system instability and security vulnerabilities",
        "Demoralizes development team over time"
      ],
      bestPractices: [
        "Track technical debt explicitly in backlog with business cost estimates",
        "Allocate percentage of each sprint to paying down technical debt",
        "Make technical debt visible to stakeholders and product owners",
        "Prioritize debt that blocks new feature development",
        "Use automated tools to identify code quality issues"
      ],
      conclusion: [
        "Technical debt is inevitable but must be managed proactively",
        "Balance short-term delivery pressure with long-term code health",
        "Regular investment in debt reduction keeps systems maintainable"
      ]
    },
    {
      question: "What is a message queue, and why do we use it?",
      definition: [
        "Message queue is middleware that enables asynchronous communication between systems",
        "Messages are stored in queue until receiving application processes them"
      ],
      keyCharacteristics: [
        "Decouples producer and consumer applications",
        "Provides reliable message delivery and persistence",
        "Supports various messaging patterns (point-to-point, pub/sub)",
        "Handles backpressure when consumers are slower than producers"
      ],
      practicalExample: [
        "E-commerce: Order processing triggers inventory update, payment, shipping notifications",
        "Image processing: Upload triggers resize, thumbnail generation, metadata extraction",
        "Email service: User registration queues welcome email for batch processing",
        "Log aggregation: Applications send logs to queue for centralized processing"
      ],
      advantages: [
        "Improves system reliability and fault tolerance",
        "Enables horizontal scaling of processing components",
        "Smooths out traffic spikes by buffering requests",
        "Allows different components to evolve independently"
      ],
      disadvantages: [
        "Adds complexity and potential single point of failure",
        "Introduces latency due to asynchronous processing",
        "Requires careful handling of message ordering and duplicates",
        "Additional infrastructure to monitor and maintain"
      ],
      bestPractices: [
        "Choose appropriate message queue based on delivery guarantees needed",
        "Implement idempotent message handlers to handle duplicates",
        "Monitor queue depth and processing latency",
        "Use dead letter queues for failed message handling",
        "Consider message ordering requirements when designing system"
      ],
      conclusion: [
        "Essential building block for scalable, distributed systems",
        "Enables loose coupling and improved system resilience",
        "Trade-off between simplicity and system scalability"
      ]
    },
    {
      question: "What is the difference between batch processing and stream processing?",
      definition: [
        "Batch processing handles large volumes of data at scheduled intervals",
        "Stream processing handles data continuously as it arrives in real-time"
      ],
      keyCharacteristics: [
        "Batch: High latency, high throughput, processes bounded datasets",
        "Stream: Low latency, continuous processing, handles unbounded data streams",
        "Batch: ETL jobs, data warehousing, periodic reports",
        "Stream: Real-time analytics, fraud detection, live monitoring"
      ],
      practicalExample: [
        "Batch: Nightly ETL job processing day's sales data for reporting",
        "Stream: Credit card fraud detection analyzing transactions in real-time",
        "Batch: Monthly payroll processing for all employees",
        "Stream: Live dashboard showing website traffic and user actions"
      ],
      advantages: [
        "Batch: High efficiency for large datasets, simpler error recovery",
        "Stream: Immediate insights, better user experience, timely responses",
        "Batch: Cost-effective for non-time-sensitive operations"
      ],
      disadvantages: [
        "Batch: High latency, delayed insights, resource scheduling complexity",
        "Stream: More complex infrastructure, harder to ensure exactly-once processing",
        "Stream: Higher operational overhead and monitoring requirements"
      ],
      bestPractices: [
        "Use batch processing for large-scale analytics and historical data",
        "Use stream processing for real-time alerts and user-facing features",
        "Consider lambda architecture combining both approaches",
        "Choose based on latency requirements and data volume characteristics",
        "Implement proper error handling and recovery for both patterns"
      ],
      conclusion: [
        "Both approaches serve different use cases and requirements",
        "Modern systems often combine batch and stream processing",
        "Choice depends on latency requirements and business needs"
      ]
    },

    // System Design & Large-Scale Systems (5 questions)
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
    },

    // DevOps, Security, and Cloud (5 questions)
    {
      question: "What is the principle of least privilege in security?",
      definition: [
        "Security principle giving users minimum access rights needed to perform their job",
        "Limits potential damage from compromised accounts or insider threats"
      ],
      keyCharacteristics: [
        "Users granted only permissions necessary for their role",
        "Default deny approach - explicitly grant only required access",
        "Regular review and removal of unused permissions",
        "Applies to both human users and system accounts"
      ],
      practicalExample: [
        "Database admin: Can modify database structure but not access payroll data",
        "Web server: Can read web files but cannot write to system directories",
        "Developer: Has access to development environment but not production",
        "API service account: Can only call specific endpoints it needs"
      ],
      advantages: [
        "Reduces impact of security breaches and compromised accounts",
        "Limits insider threat potential and accidental damage",
        "Simplifies compliance and audit requirements",
        "Reduces attack surface for malicious actors"
      ],
      disadvantages: [
        "Can impact productivity if permissions are too restrictive",
        "Requires ongoing management and regular permission reviews",
        "May slow down legitimate work if approval processes are lengthy",
        "Complex to implement in large organizations with many roles"
      ],
      bestPractices: [
        "Implement role-based access control (RBAC) systems",
        "Regular access reviews and permission audits",
        "Use just-in-time access for elevated privileges",
        "Automate permission management where possible",
        "Document and justify all access exceptions",
        "Implement monitoring and alerting for privilege escalation"
      ],
      conclusion: [
        "Fundamental security principle for reducing risk exposure",
        "Balance between security and operational efficiency",
        "Essential for compliance and governance frameworks"
      ]
    },
    {
      question: "What is the difference between symmetric and asymmetric encryption?",
      definition: [
        "Symmetric encryption uses same key for both encryption and decryption",
        "Asymmetric encryption uses public-private key pairs for encryption and decryption"
      ],
      keyCharacteristics: [
        "Symmetric: Fast, efficient, but key distribution challenge",
        "Asymmetric: Slower but solves key distribution problem",
        "Symmetric: AES, DES algorithms with shared secret keys",
        "Asymmetric: RSA, ECC algorithms with mathematically related key pairs"
      ],
      practicalExample: [
        "Symmetric: AES encryption for file storage with shared password",
        "Asymmetric: SSL/TLS handshake using server's public key",
        "Hybrid approach: Use asymmetric to exchange symmetric keys",
        "Digital signatures: Use private key to sign, public key to verify"
      ],
      advantages: [
        "Symmetric: Very fast encryption/decryption, low computational overhead",
        "Asymmetric: Solves key distribution, enables digital signatures",
        "Symmetric: Suitable for encrypting large amounts of data",
        "Asymmetric: Enables secure communication without prior key sharing"
      ],
      disadvantages: [
        "Symmetric: Key distribution and management challenges",
        "Asymmetric: Much slower, computationally expensive",
        "Symmetric: Same key compromise affects all encrypted data",
        "Asymmetric: More complex mathematics and larger key sizes"
      ],
      bestPractices: [
        "Use hybrid encryption: asymmetric for key exchange, symmetric for data",
        "Rotate encryption keys regularly",
        "Use established algorithms (AES, RSA) rather than custom implementations",
        "Protect private keys with hardware security modules (HSMs)",
        "Implement proper key lifecycle management"
      ],
      conclusion: [
        "Both types are essential in modern cryptographic systems",
        "Hybrid approaches combine benefits of both methods",
        "Choice depends on performance requirements and key distribution needs"
      ]
    },
    {
      question: "How would you secure an API from unauthorized access?",
      definition: [
        "Implement multiple security layers to control and monitor API access",
        "Protect against common attack vectors and unauthorized usage"
      ],
      keyCharacteristics: [
        "Authentication to verify user identity",
        "Authorization to control access to resources",
        "Input validation and sanitization",
        "Rate limiting and monitoring"
      ],
      practicalExample: [
        "OAuth 2.0 with JWT tokens for stateless authentication",
        "API keys with usage quotas and expiration dates",
        "Role-based access control for different user types",
        "HTTPS encryption for all API communications"
      ],
      advantages: [
        "Prevents unauthorized access to sensitive data",
        "Enables audit trails and compliance reporting",
        "Protects against common web vulnerabilities",
        "Allows fine-grained access control"
      ],
      disadvantages: [
        "Adds complexity to API implementation and usage",
        "Can impact API performance due to security checks",
        "Requires ongoing security maintenance and updates",
        "May create usability barriers for legitimate users"
      ],
      bestPractices: [
        "Implement OAuth 2.0 or similar standard authentication",
        "Use HTTPS everywhere and validate SSL certificates",
        "Apply input validation and sanitization on all inputs",
        "Implement rate limiting and throttling",
        "Log all API access for monitoring and forensics",
        "Use API gateways for centralized security policies",
        "Regular security testing and vulnerability assessments"
      ],
      conclusion: [
        "API security requires multiple layers of protection",
        "Balance between security and usability is crucial",
        "Regular security assessments and updates are essential"
      ]
    },
    {
      question: "What is the shared responsibility model in cloud computing?",
      definition: [
        "Security framework dividing responsibilities between cloud provider and customer",
        "Defines who is responsible for securing different layers of cloud infrastructure"
      ],
      keyCharacteristics: [
        "Provider responsible for 'security of the cloud' (infrastructure)",
        "Customer responsible for 'security in the cloud' (data and applications)",
        "Responsibilities vary by cloud service model (IaaS, PaaS, SaaS)",
        "Clear boundaries prevent security gaps and overlaps"
      ],
      practicalExample: [
        "AWS IaaS: AWS secures data centers, customer secures OS and applications",
        "Google PaaS: Google secures platform, customer secures code and data",
        "Microsoft SaaS: Microsoft secures application, customer manages user access",
        "Network security: Provider secures infrastructure, customer configures firewall rules"
      ],
      advantages: [
        "Clear division of security responsibilities",
        "Leverages provider expertise for infrastructure security",
        "Allows customers to focus on application-level security",
        "Reduces total cost of security ownership"
      ],
      disadvantages: [
        "Confusion about responsibility boundaries can create security gaps",
        "Customer must still maintain significant security expertise",
        "Shared responsibility can complicate compliance requirements",
        "Security incidents may involve coordination between parties"
      ],
      bestPractices: [
        "Clearly understand your responsibilities for each cloud service used",
        "Implement security controls for all customer-responsible areas",
        "Regular security assessments and compliance audits",
        "Use cloud provider security tools and services",
        "Maintain incident response procedures involving cloud provider",
        "Document security configurations and access policies"
      ],
      conclusion: [
        "Essential concept for secure cloud adoption",
        "Requires clear understanding of responsibility boundaries",
        "Success depends on both parties fulfilling their security obligations"
      ]
    },
    {
      question: "What are the main differences between IaaS, PaaS, and SaaS?",
      definition: [
        "Three main cloud service models offering different levels of abstraction",
        "Each model provides different balance of control, responsibility, and management overhead"
      ],
      keyCharacteristics: [
        "IaaS: Infrastructure as a Service - virtual machines, storage, networks",
        "PaaS: Platform as a Service - development platform with runtime environment",
        "SaaS: Software as a Service - complete applications ready to use",
        "Different levels of customer control and provider management"
      ],
      practicalExample: [
        "IaaS: Amazon EC2, Google Compute Engine - rent virtual servers",
        "PaaS: Heroku, Google App Engine - deploy code without managing servers",
        "SaaS: Gmail, Salesforce, Office 365 - use applications via web browser",
        "Hybrid: Use IaaS for databases, PaaS for web apps, SaaS for email"
      ],
      advantages: [
        "IaaS: Maximum control and flexibility, cost savings over physical hardware",
        "PaaS: Faster development, automatic scaling, reduced operational overhead",
        "SaaS: No maintenance required, immediate availability, predictable costs"
      ],
      disadvantages: [
        "IaaS: Still requires significant technical expertise and management",
        "PaaS: Less control over underlying infrastructure, potential vendor lock-in",
        "SaaS: Limited customization options, dependency on provider availability"
      ],
      bestPractices: [
        "Choose service model based on technical expertise and requirements",
        "Consider hybrid approaches combining multiple service models",
        "Evaluate vendor lock-in implications for each service model",
        "Plan migration strategies and data portability from the start",
        "Match service model to team capabilities and organizational maturity"
      ],
      conclusion: [
        "Each model serves different organizational needs and technical requirements",
        "Many organizations use combination of all three models",
        "Choice impacts cost, control, complexity, and time-to-market"
      ]
    }
  ];

  getRandomTechInterviewAnswer(): TechInterviewAnswer {
    const randomIndex = Math.floor(Math.random() * this.questions.length);
    return this.questions[randomIndex];
  }

  getAllQuestions(): TechInterviewAnswer[] {
    return [...this.questions];
  }

  getQuestionCount(): number {
    return this.questions.length;
  }
}

export const techInterviewService = new TechInterviewService();