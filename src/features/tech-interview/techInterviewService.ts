export interface TechInterviewAnswer {
  question: string;
  definition: string;
  keyCharacteristics: string;
  advantages?: string;
  disadvantages?: string;
  practicalExample: string;
  bestPractices: string;
  conclusion: string;
}

export class TechInterviewService {
  private readonly questions: TechInterviewAnswer[] = [
    {
      question: "Can you explain the difference between a process and a thread?",
      definition: "A process is an independent program running in memory. A thread is a smaller execution unit inside a process.",
      keyCharacteristics: "Processes do not share memory space. Threads inside the same process share memory and resources. Threads are lighter and faster to create compared to processes.",
      advantages: "Processes are safer because they are isolated, but they use more memory.",
      disadvantages: "Threads are efficient, but bugs like race conditions can happen.",
      practicalExample: "A browser is a process. Each open tab is a thread. If one tab crashes, the others may still work.",
      bestPractices: "Use multiple processes when you need stability and isolation (e.g., servers). Use multiple threads for parallel tasks inside one application (e.g., background tasks).",
      conclusion: "In short, processes are heavy but safe, threads are light but risky. Choosing depends on system requirements (safety vs performance)."
    },
    {
      question: "What is the time complexity of a binary search algorithm?",
      definition: "Binary search is a search algorithm that finds the position of a target value within a sorted array by repeatedly dividing the search interval in half.",
      keyCharacteristics: "Time complexity is O(log n). Space complexity is O(1) for iterative implementation. The array must be sorted beforehand.",
      advantages: "Very efficient for large datasets. Much faster than linear search O(n).",
      disadvantages: "Requires the array to be sorted first. Not suitable for unsorted data.",
      practicalExample: "Like looking up a word in a dictionary - you open to the middle, then go left or right based on alphabetical order until you find the word.",
      bestPractices: "Use when you have a sorted dataset and need frequent lookups. Consider the cost of sorting if data changes frequently.",
      conclusion: "Binary search is extremely efficient O(log n) but only works on sorted data. It's ideal for static or rarely-changed datasets with frequent searches."
    },
    {
      question: "How would you design a RESTful API?",
      definition: "REST (Representational State Transfer) is an architectural style for designing networked applications using standard HTTP methods.",
      keyCharacteristics: "Uses HTTP methods (GET, POST, PUT, DELETE). Stateless communication. Resource-based URLs. JSON/XML data format.",
      advantages: "Simple and intuitive. Cacheable responses. Scalable and stateless.",
      disadvantages: "Can be chattier than other approaches. Limited by HTTP methods.",
      practicalExample: "GET /api/users/123 retrieves user 123, POST /api/users creates a new user, PUT /api/users/123 updates user 123.",
      bestPractices: "Use proper HTTP status codes. Version your API (/v1/users). Implement proper authentication. Use consistent naming conventions.",
      conclusion: "RESTful APIs provide a standardized, scalable way to build web services using familiar HTTP methods and clear resource-based URLs."
    },
    {
      question: "What are the differences between SQL and NoSQL databases?",
      definition: "SQL databases use structured query language and relational tables. NoSQL databases use various data models like document, key-value, or graph structures.",
      keyCharacteristics: "SQL: ACID compliance, fixed schema, joins, complex queries. NoSQL: Flexible schema, horizontal scaling, eventual consistency, simpler queries.",
      advantages: "SQL: Strong consistency, mature ecosystem, complex queries. NoSQL: Scalability, flexibility, performance for simple queries.",
      disadvantages: "SQL: Harder to scale horizontally, rigid schema. NoSQL: Eventual consistency, less mature tooling, limited query capabilities.",
      practicalExample: "SQL: PostgreSQL for e-commerce with transactions. NoSQL: MongoDB for social media posts, Redis for caching.",
      bestPractices: "Choose SQL for complex relationships and transactions. Choose NoSQL for rapid scaling and flexible data structures.",
      conclusion: "SQL databases excel at consistency and complex queries, while NoSQL databases offer flexibility and scalability. Choose based on your specific requirements."
    },
    {
      question: "Explain how garbage collection works in Java or another language you use.",
      definition: "Garbage collection is an automatic memory management process that reclaims memory occupied by objects that are no longer reachable or referenced.",
      keyCharacteristics: "Automatically frees unused memory. Runs in background. Uses algorithms like mark-and-sweep or generational collection. Prevents memory leaks.",
      advantages: "Prevents memory leaks. Reduces programming errors. Automatic memory management.",
      disadvantages: "Performance overhead. Unpredictable timing. Can cause application pauses.",
      practicalExample: "In Java, when you create objects with 'new', the GC automatically removes them when no variables point to them anymore.",
      bestPractices: "Minimize object creation in tight loops. Use appropriate GC algorithms for your use case. Monitor GC performance in production.",
      conclusion: "Garbage collection provides automatic memory management at the cost of some performance overhead, but greatly reduces memory-related bugs."
    },
    {
      question: "How would you design a URL shortening service like bit.ly?",
      definition: "A URL shortening service converts long URLs into shorter, more manageable links that redirect to the original URL.",
      keyCharacteristics: "Database mapping long URLs to short codes. Base62 encoding for short URLs. Redirect service. Analytics tracking.",
      advantages: "Saves space in messages. Provides click analytics. Can update destination without changing short URL.",
      disadvantages: "Single point of failure. Link rot if service goes down. Security concerns with malicious redirects.",
      practicalExample: "User submits 'https://very-long-url.com/article' → System generates 'bit.ly/abc123' → When clicked, redirects to original URL.",
      bestPractices: "Use distributed systems for scale. Implement caching. Add expiration policies. Include security scanning for malicious URLs.",
      conclusion: "URL shorteners require careful database design, caching strategy, and scalability planning to handle high traffic and provide reliable service."
    },
    {
      question: "What are microservices, and what are their pros and cons?",
      definition: "Microservices is an architectural pattern where applications are built as a collection of small, independent services that communicate over well-defined APIs.",
      keyCharacteristics: "Loosely coupled services. Independent deployment. Service-specific databases. Communication via APIs or messaging.",
      advantages: "Technology diversity. Independent scaling. Fault isolation. Team autonomy.",
      disadvantages: "Increased complexity. Network latency. Data consistency challenges. More operational overhead.",
      practicalExample: "E-commerce app: separate services for user management, inventory, payments, and notifications, each deployable independently.",
      bestPractices: "Start with monolith, then split. Use API gateways. Implement proper monitoring. Plan for distributed transactions.",
      conclusion: "Microservices offer flexibility and scalability but increase complexity. They're best for large teams and complex applications that need independent scaling."
    },
    {
      question: "Tell me about a time you faced a difficult bug. How did you solve it?",
      definition: "This is a behavioral question asking about problem-solving skills and debugging methodology in real situations.",
      keyCharacteristics: "Use STAR method (Situation, Task, Action, Result). Focus on systematic debugging approach. Show learning from the experience.",
      practicalExample: "Situation: Memory leak in production. Task: Find and fix without downtime. Action: Used profiling tools, analyzed heap dumps, identified the cause. Result: Fixed leak, prevented future occurrences.",
      bestPractices: "Be specific about tools and techniques used. Explain your thought process. Mention what you learned. Show how you prevented similar issues.",
      conclusion: "Good answers demonstrate systematic problem-solving, use of appropriate tools, and learning from challenges."
    },
    {
      question: "Have you worked with a team using Git? How did you manage merge conflicts?",
      definition: "This question assesses collaboration skills and version control knowledge in team environments.",
      keyCharacteristics: "Understanding of Git workflows. Conflict resolution strategies. Team communication. Prevention techniques.",
      practicalExample: "Used Git flow with feature branches. When conflicts occurred, communicated with team members, used merge tools like VS Code, tested thoroughly after resolution.",
      bestPractices: "Frequent small commits. Clear commit messages. Communication before merging. Use of pull requests for code review.",
      conclusion: "Effective Git collaboration requires good communication, proper branching strategies, and systematic conflict resolution approaches."
    },
    {
      question: "What is CI/CD, and how have you used it in your projects?",
      definition: "CI/CD stands for Continuous Integration and Continuous Deployment - practices that automate testing and deployment of code changes.",
      keyCharacteristics: "Automated testing on every commit. Automated deployment to staging/production. Quick feedback loops. Version control integration.",
      advantages: "Faster delivery. Reduced manual errors. Quick bug detection. Consistent deployments.",
      disadvantages: "Initial setup complexity. Requires good test coverage. Can be resource-intensive.",
      practicalExample: "GitHub Actions pipeline: on push → run tests → build Docker image → deploy to staging → manual approval → deploy to production.",
      bestPractices: "Start with simple pipelines. Ensure good test coverage. Use staging environments. Implement rollback strategies.",
      conclusion: "CI/CD is essential for modern development, providing automation that increases reliability and speed of software delivery."
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