import { TechInterviewAnswer } from '../types';

export const softwareEngineeringQuestions: TechInterviewAnswer[] = [
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
  }
];