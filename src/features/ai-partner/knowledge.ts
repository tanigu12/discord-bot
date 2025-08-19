// AI Partner Knowledge Base - User Profile and Context
export interface UserProfile {
  name: string;
  background: {
    nationality: string;
    profession: string;
    interests: string[];
    language_level: {
      toeic_score: number;
      versant_level: string;
    };
  };
}

export interface ResponseTemplates {
  general_response: {
    format: string;
    focus: string;
  };
  analysis: {
    format: string;
    emphasis: string;
    guidelines: string[];
  };
  translation: {
    japanese_to_english: {
      format: string;
      guidelines: string[];
    };
    other_languages: {
      format: string;
      guidelines: string[];
    };
  };
  grammar_feedback: {
    format: string;
    style_guidelines: string[];
  };
}

export interface KnowledgeBase {
  user_profile: UserProfile;
  response_templates: ResponseTemplates;
  encouragement_patterns: string[];
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
        "AI and automation tools"
      ],
      language_level: {
        toeic_score: 800,
        versant_level: "B1"
      }
    }
  },
  response_templates: {
    general_response: {
      format: "**Response:** {response}\n**Context:** {context}",
      focus: "Clear and helpful responses"
    },
    analysis: {
      format: "**Analysis:** {analysis}\n**Key Points:** {key_points}",
      emphasis: "Practical and informative analysis",
      guidelines: [
        "Be informative and practical",
        "Provide context where helpful", 
        "Consider multiple perspectives",
        "Focus on key insights and takeaways"
      ]
    },
    translation: {
      japanese_to_english: {
        format: "📝 **Translation:**\n[Natural English translation]\n\n📚 **Grammar Points:**\n[Explain 2-3 key grammar structures used, with examples appropriate for TOEIC 800 level]\n\n💡 **Vocabulary:**\n[List 2-3 useful words/phrases with brief meanings, focusing on practical vocabulary for upper-intermediate level]",
        guidelines: [
          "Keep the personal, diary-like tone",
          "Use natural, conversational English",
          "Maintain the emotional tone of the original",
          "Focus on practical grammar explanations for upper-intermediate learners",
          "Include brief, practical vocabulary explanations for upper-intermediate level",
          "Consider TOEIC 800 level when explaining concepts"
        ]
      },
      other_languages: {
        format: "Just the translation without extra formatting or explanations",
        guidelines: [
          "Keep the personal, diary-like tone",
          "Use natural, conversational language",
          "Maintain the emotional tone of the original",
          "When translating into Japanese, prefer casual expressions over literal translations"
        ]
      }
    },
    grammar_feedback: {
      format: "📝 **Suggestions:** [specific improvements with explanations]\n\n🚀 **Alternative expressions:** [more natural ways to say the same thing]",
      style_guidelines: [
        "Focus on 2-3 most important improvements",
        "Suggest alternative expressions where helpful", 
        "Keep it encouraging for diary writing practice",
        "Keep it concise and encouraging"
      ]
    }
  },
  encouragement_patterns: [
    "That's a great question!",
    "Your technical background really helps with understanding complex topics.",
    "This kind of analytical thinking is valuable.",
    "You're asking the right questions.",
    "Keep exploring these interesting topics."
  ]
};