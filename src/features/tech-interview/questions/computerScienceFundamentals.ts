import { TechInterviewAnswer } from '../types';

export const computerScienceFundamentals: TechInterviewAnswer[] = [
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
  }
];