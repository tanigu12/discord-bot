// AI Partner Knowledge Base - User Profile and Learning Context
export interface UserProfile {
  name: string;
  background: {
    nationality: string;
    profession: string;
    interests: string[];
    learning_goals: string[];
  };
  english_level: string;
  common_challenges: string[];
  strengths: string[];
  preferred_learning_style: string[];
}

export interface TeachingApproach {
  grammar_focus_areas: string[];
  vocabulary_enhancement: {
    technical_synonyms: string;
    professional_alternatives: string;
    industry_expressions: string;
    documentation_language: string;
  };
}

export interface ResponseTemplates {
  grammar_correction: {
    format: string;
    focus: string;
  };
  vocabulary_enhancement: {
    format: string;
    emphasis: string;
  };
  translation_approach: {
    format: string;
    considerations: string[];
  };
}

export interface GlobalContextKnowledge {
  canadian_perspective: {
    tech_industry: string;
    cultural_awareness: string;
    global_trends: string;
  };
  international_awareness: string[];
}

export interface KnowledgeBase {
  user_profile: UserProfile;
  teaching_approach: TeachingApproach;
  response_templates: ResponseTemplates;
  encouragement_patterns: string[];
  global_context_knowledge: GlobalContextKnowledge;
}

export const knowledgeBase: KnowledgeBase = {
  user_profile: {
    name: "Taka",
    background: {
      nationality: "Japanese",
      profession: "Software Engineer/Developer",
      interests: [
        "Programming and software development",
        "Technology trends and innovations",
        "Discord bot development",
        "AI and automation tools",
        "Learning English for professional development"
      ],
      learning_goals: [
        "Improving technical English communication",
        "Writing better documentation and comments",
        "Understanding international tech discussions",
        "Enhancing presentation skills in English"
      ]
    },
    english_level: "Intermediate to Advanced",
    common_challenges: [
      "Articles (a, an, the) usage",
      "Preposition selection",
      "Natural word order in complex sentences",
      "Technical terminology nuances",
      "Formal vs. casual register in professional contexts"
    ],
    strengths: [
      "Technical vocabulary comprehension",
      "Written communication",
      "Logical sentence structure",
      "Understanding of programming-related English"
    ],
    preferred_learning_style: [
      "Practical examples from tech industry",
      "Grammar explanations with technical contexts",
      "Alternative expressions for professional communication",
      "Real-world application in software development scenarios"
    ]
  },
  teaching_approach: {
    grammar_focus_areas: [
      "Conditional statements and their variations",
      "Present perfect vs. simple past in tech contexts",
      "Passive voice in documentation",
      "Modal verbs for suggestions and requirements",
      "Relative clauses in technical descriptions"
    ],
    vocabulary_enhancement: {
      technical_synonyms: "Alternative terms for common programming concepts",
      professional_alternatives: "More sophisticated ways to express technical ideas",
      industry_expressions: "Common phrases used in tech industry",
      documentation_language: "Formal language patterns for technical writing"
    }
  },
  response_templates: {
    grammar_correction: {
      format: "**Original:** {original}\n**Corrected:** {corrected}\n**Explanation:** {explanation}\n**Alternative:** {alternative}",
      focus: "Clear correction with technical context examples"
    },
    vocabulary_enhancement: {
      format: "**Word/Phrase:** {term}\n**Alternatives:** {alternatives}\n**Usage Context:** {context}\n**Example:** {example}",
      emphasis: "Practical alternatives for professional communication"
    },
    translation_approach: {
      format: "**Translation:** {translation}\n**Notes:** {cultural_notes}\n**Tech Context:** {technical_relevance}",
      considerations: [
        "Technical accuracy",
        "Professional tone",
        "Cultural nuances in international tech communication",
        "Industry-standard terminology"
      ]
    }
  },
  encouragement_patterns: [
    "That's a great technical question!",
    "Your programming background really helps with understanding complex structures.",
    "This kind of precision will serve you well in professional documentation.",
    "You're developing a strong sense for technical English!",
    "Keep applying these patterns in your coding projects."
  ],
  global_context_knowledge: {
    canadian_perspective: {
      tech_industry: "Familiar with Canadian tech scene and terminology",
      cultural_awareness: "Understanding of North American business communication",
      global_trends: "Awareness of international tech developments and their linguistic impact"
    },
    international_awareness: [
      "Global software development practices",
      "Cross-cultural communication in tech teams",
      "Industry standards and documentation conventions",
      "Regional variations in technical English"
    ]
  }
};