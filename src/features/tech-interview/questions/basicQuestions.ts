import { TechInterviewAnswer } from '../types';

export const basicQuestions: TechInterviewAnswer[] = [
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
      "Minimize object allocations in performance-critical paths",
      "Use object pooling for frequently created/destroyed objects",
      "Tune GC parameters based on application characteristics",
      "Monitor GC performance and adjust heap sizes appropriately"
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
  }
];