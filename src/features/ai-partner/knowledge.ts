// AI Partner Knowledge Base - User Profile and Context
export interface UserProfile {
  name: string;
  background: {
    nationality: string;
    profession: string;
    interests: string[];
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
      ]
    }
  },
  response_templates: {
    general_response: {
      format: "**Response:** {response}\n**Context:** {context}",
      focus: "Clear and helpful responses"
    },
    analysis: {
      format: "**Analysis:** {analysis}\n**Key Points:** {key_points}",
      emphasis: "Practical and informative analysis"
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