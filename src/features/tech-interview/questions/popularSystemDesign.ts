import { TechInterviewAnswer } from '../types';

export const popularSystemDesignQuestions: TechInterviewAnswer[] = [
  {
    question: "How would you design Twitter?",
    definition: [
      "Social media platform supporting millions of users posting and reading tweets",
      "Must handle high write volume, timeline generation, and real-time interactions"
    ],
    keyCharacteristics: [
      "Timeline generation: Home timeline, user timeline, trending topics",
      "Fan-out strategies: Push (write-heavy) vs Pull (read-heavy) models",
      "Media storage and CDN for images/videos",
      "Real-time notifications and activity feeds"
    ],
    practicalExample: [
      "Tweet posting: Store in database, fan-out to followers' timelines",
      "Home timeline: Merge sorted lists from followed users",
      "Trending topics: Count hashtags and topics with time decay",
      "Media handling: Upload to object storage, serve via CDN"
    ],
    advantages: [
      "Push model: Fast timeline reads, good for users with few followers",
      "Pull model: Efficient for celebrity users with millions of followers",
      "Hybrid approach: Combines benefits of both strategies",
      "Horizontal scaling through sharding and replication"
    ],
    disadvantages: [
      "Push model: Expensive for users with many followers",
      "Pull model: Slow timeline generation for users following many accounts",
      "Complex caching strategies needed for performance",
      "Consistency challenges across distributed systems"
    ],
    bestPractices: [
      "Use hybrid fan-out: push for normal users, pull for celebrities",
      "Implement aggressive caching at multiple levels",
      "Use message queues for asynchronous processing",
      "Design for eventual consistency with conflict resolution",
      "Implement rate limiting and spam detection",
      "Use analytics pipeline for trending and recommendations"
    ],
    conclusion: [
      "Requires careful balance between read and write performance",
      "Fan-out strategy is critical architectural decision",
      "Must handle both high throughput and real-time requirements"
    ]
  },
  {
    question: "How would you design Uber?",
    definition: [
      "Real-time ride-sharing platform matching drivers and riders",
      "Requires geolocation services, routing, pricing, and payment processing"
    ],
    keyCharacteristics: [
      "Real-time location tracking and updates",
      "Matching algorithm based on proximity and availability",
      "Dynamic pricing based on supply and demand",
      "Route optimization and ETA calculations"
    ],
    practicalExample: [
      "Rider requests ride → system finds nearby available drivers",
      "Driver accepts → route calculated → real-time tracking begins",
      "Trip completion → payment processing → rating system",
      "Surge pricing during high demand periods"
    ],
    advantages: [
      "Efficient matching reduces wait times",
      "Real-time tracking improves user experience",
      "Dynamic pricing optimizes supply and demand",
      "Scalable microservices architecture"
    ],
    disadvantages: [
      "Complex real-time location processing",
      "High infrastructure costs for GPS tracking",
      "Surge pricing can be controversial",
      "Challenging to ensure driver safety and verification"
    ],
    bestPractices: [
      "Use geospatial databases (PostGIS, MongoDB) for location queries",
      "Implement quadtree or geohashing for spatial indexing",
      "Use WebSocket or server-sent events for real-time updates",
      "Cache frequently accessed routes and ETAs",
      "Implement circuit breakers for external mapping APIs",
      "Design fraud detection for both riders and drivers"
    ],
    conclusion: [
      "Geospatial processing is core technical challenge",
      "Real-time systems require careful architecture design",
      "Must balance user experience with operational efficiency"
    ]
  },
  {
    question: "How would you design Netflix?",
    definition: [
      "Video streaming platform serving millions of concurrent users globally",
      "Requires content delivery, recommendation system, and adaptive streaming"
    ],
    keyCharacteristics: [
      "Global content delivery network for video streaming",
      "Adaptive bitrate streaming based on network conditions",
      "Personalized recommendation engine",
      "Content metadata and search functionality"
    ],
    practicalExample: [
      "User browses → recommendation engine suggests content",
      "User selects video → CDN serves from nearest edge server",
      "Adaptive streaming adjusts quality based on bandwidth",
      "View history updates recommendation algorithms"
    ],
    advantages: [
      "CDN ensures low latency and high availability globally",
      "Adaptive streaming optimizes for varying network conditions",
      "Machine learning improves content discovery",
      "Horizontal scaling handles traffic spikes"
    ],
    disadvantages: [
      "Massive storage requirements for video content",
      "Complex encoding pipeline for multiple formats",
      "Expensive CDN and bandwidth costs",
      "Cold start problem for new users' recommendations"
    ],
    bestPractices: [
      "Use multiple CDN providers for redundancy",
      "Implement multiple video encodings (H.264, H.265, AV1)",
      "Pre-generate thumbnails and preview videos",
      "Use collaborative filtering and content-based recommendations",
      "Implement progressive download and prefetching",
      "Monitor QoS metrics and optimize based on user experience"
    ],
    conclusion: [
      "Content delivery optimization is crucial for user experience",
      "Recommendation systems drive user engagement",
      "Must balance quality with bandwidth costs globally"
    ]
  },
  {
    question: "How would you design WhatsApp?",
    definition: [
      "Real-time messaging platform supporting billions of users worldwide",
      "Requires instant message delivery, group chats, and multimedia sharing"
    ],
    keyCharacteristics: [
      "Real-time bidirectional communication using WebSocket",
      "Message delivery guarantees and read receipts",
      "End-to-end encryption for security",
      "Group messaging and broadcast lists"
    ],
    practicalExample: [
      "User sends message → encrypted and stored temporarily",
      "Push notification sent to recipient's device",
      "Message delivered when recipient comes online",
      "Group messages fan out to all participants"
    ],
    advantages: [
      "WebSocket enables real-time communication",
      "Message queuing ensures delivery even when offline",
      "End-to-end encryption provides security",
      "Efficient protocol minimizes battery usage"
    ],
    disadvantages: [
      "Complex offline message handling",
      "Group message scaling challenges",
      "End-to-end encryption limits server-side features",
      "Push notification dependencies on platform providers"
    ],
    bestPractices: [
      "Use message queues for offline users",
      "Implement message acknowledgments and retry logic",
      "Use compression for multimedia content",
      "Design efficient group message fan-out",
      "Implement presence system for online status",
      "Use database sharding by user ID or conversation"
    ],
    conclusion: [
      "Real-time messaging requires robust message delivery guarantees",
      "Security and privacy are primary concerns",
      "Must handle both peer-to-peer and group communication efficiently"
    ]
  },
  {
    question: "How would you design Instagram?",
    definition: [
      "Photo and video sharing social media platform",
      "Requires media processing, social features, and content discovery"
    ],
    keyCharacteristics: [
      "Image and video upload, processing, and storage",
      "Social graph with followers and following relationships",
      "Timeline generation and content discovery",
      "Real-time interactions (likes, comments, stories)"
    ],
    practicalExample: [
      "User uploads photo → processing pipeline resizes and filters",
      "Photo stored in object storage, metadata in database",
      "Timeline generation shows content from followed users",
      "Stories feature with 24-hour expiration"
    ],
    advantages: [
      "CDN optimizes media delivery globally",
      "Social graph enables personalized content",
      "Processing pipeline ensures consistent quality",
      "Timeline algorithms increase user engagement"
    ],
    disadvantages: [
      "Large storage requirements for high-resolution media",
      "Complex content discovery algorithms",
      "Moderation challenges for user-generated content",
      "Timeline generation computationally expensive"
    ],
    bestPractices: [
      "Use object storage (S3) with CDN for media files",
      "Implement async processing pipeline for uploads",
      "Generate multiple image sizes for different devices",
      "Use graph databases for social relationships",
      "Implement content-based and collaborative filtering",
      "Cache timeline data with appropriate invalidation"
    ],
    conclusion: [
      "Media processing and storage are core technical challenges",
      "Social features require careful data modeling",
      "Content discovery algorithms drive user engagement"
    ]
  },
  {
    question: "How would you design YouTube?",
    definition: [
      "Video hosting and streaming platform with user-generated content",
      "Requires video processing, recommendation system, and massive scale"
    ],
    keyCharacteristics: [
      "Video upload, encoding, and transcoding pipeline",
      "Multiple quality formats and adaptive streaming",
      "Recommendation and discovery algorithms",
      "Comment system and user interactions"
    ],
    practicalExample: [
      "User uploads video → encoding pipeline creates multiple formats",
      "Video stored across CDN for global distribution",
      "Recommendation system suggests videos based on history",
      "Real-time analytics track views and engagement"
    ],
    advantages: [
      "Distributed encoding handles massive video processing",
      "CDN ensures smooth playback globally",
      "Machine learning improves content discovery",
      "Monetization through ads integrated into platform"
    ],
    disadvantages: [
      "Enormous storage and bandwidth costs",
      "Complex content moderation at scale",
      "Copyright detection and enforcement",
      "Quality vs storage size optimization challenges"
    ],
    bestPractices: [
      "Use distributed encoding with multiple quality levels",
      "Implement progressive upload with chunking",
      "Use content delivery network with edge caching",
      "Implement copyright detection algorithms",
      "Design scalable comment and interaction systems",
      "Use analytics pipeline for recommendation training"
    ],
    conclusion: [
      "Video processing at scale requires sophisticated pipeline",
      "Content moderation and copyright are major challenges",
      "Recommendation algorithms crucial for user retention"
    ]
  },
  {
    question: "How would you design Amazon?",
    definition: [
      "E-commerce platform handling product catalog, orders, and payments",
      "Requires inventory management, recommendation system, and order fulfillment"
    ],
    keyCharacteristics: [
      "Product catalog with search and filtering",
      "Shopping cart and checkout process",
      "Order management and fulfillment system",
      "Payment processing and fraud detection"
    ],
    practicalExample: [
      "User searches products → search service returns relevant results",
      "User adds to cart → session/database stores cart state",
      "Checkout process → payment, inventory check, order creation",
      "Order fulfillment → warehouse management, shipping"
    ],
    advantages: [
      "Microservices architecture enables independent scaling",
      "Search and recommendation systems improve discovery",
      "Distributed inventory management handles global scale",
      "Multiple payment options increase conversion"
    ],
    disadvantages: [
      "Complex inventory synchronization across warehouses",
      "Fraud detection requires sophisticated algorithms",
      "Order consistency challenges in distributed system",
      "Price optimization requires real-time data processing"
    ],
    bestPractices: [
      "Use event-driven architecture for order processing",
      "Implement eventual consistency for inventory updates",
      "Design idempotent payment processing",
      "Use caching for product catalog and search",
      "Implement distributed transaction patterns",
      "Design comprehensive fraud detection system"
    ],
    conclusion: [
      "E-commerce requires complex business logic and data consistency",
      "Payment processing and fraud detection are critical components",
      "Must handle high traffic spikes during sales events"
    ]
  },
  {
    question: "How would you design Slack?",
    definition: [
      "Team collaboration platform with real-time messaging and file sharing",
      "Requires workspace management, channel organization, and integrations"
    ],
    keyCharacteristics: [
      "Real-time messaging within channels and direct messages",
      "File sharing and collaborative features",
      "Third-party integrations and bot framework",
      "Search functionality across messages and files"
    ],
    practicalExample: [
      "User joins workspace → access control checks permissions",
      "Message sent to channel → real-time delivery to online users",
      "File upload → storage in cloud, searchable metadata extraction",
      "Bot integration → webhook triggers external service calls"
    ],
    advantages: [
      "Channel-based organization improves team communication",
      "Real-time updates keep teams synchronized",
      "Integration platform enables workflow automation",
      "Search functionality makes information discoverable"
    ],
    disadvantages: [
      "Message history storage grows rapidly",
      "Complex permission system for enterprise features",
      "Real-time performance challenges with large teams",
      "Integration management complexity"
    ],
    bestPractices: [
      "Use WebSocket for real-time messaging",
      "Implement message archiving and retention policies",
      "Design hierarchical permission system",
      "Use full-text search with proper indexing",
      "Cache frequently accessed channels and users",
      "Design secure webhook and API system for integrations"
    ],
    conclusion: [
      "Real-time collaboration requires careful architecture",
      "Permission systems become complex at enterprise scale",
      "Integration ecosystem drives platform adoption"
    ]
  }
];