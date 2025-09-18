import { TechInterviewAnswer } from '../types';

export const cloudSecurityQuestions: TechInterviewAnswer[] = [
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