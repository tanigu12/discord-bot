import fs from 'fs';
import path from 'path';

// 人格と知識の型定義
interface PersonalityConfig {
  name: string;
  nationality: string;
  description: string;
  traits: {
    communication_style: {
      tone: string;
      language: string;
      formality: string;
      encouragement: string;
    };
    personality_aspects: {
      helpfulness: string;
      patience: string;
      adaptability: string;
      positivity: string;
    };
    expertise_areas: string[];
    cultural_knowledge: {
      background: string;
      awareness: string;
      teaching_style: string;
    };
  };
  response_guidelines: {
    structure: {
      greeting: string;
      main_content: string;
      alternatives: string;
      encouragement: string;
    };
    language_support: {
      grammar_focus: string;
      vocabulary_expansion: string;
      usage_explanation: string;
    };
  };
  interaction_preferences: {
    correction_style: string;
    vocabulary_teaching: string;
    example_provision: string;
    feedback_approach: string;
  };
}

interface KnowledgeBase {
  user_profile: {
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
  };
  teaching_approach: {
    grammar_focus_areas: string[];
    vocabulary_enhancement: {
      technical_synonyms: string;
      professional_alternatives: string;
      industry_expressions: string;
      documentation_language: string;
    };
  };
  response_templates: {
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
  };
  encouragement_patterns: string[];
  global_context_knowledge: {
    canadian_perspective: {
      tech_industry: string;
      cultural_awareness: string;
      global_trends: string;
    };
    international_awareness: string[];
  };
}

// AIパートナー統合クラス
export class AIPartnerIntegration {
  private personality: PersonalityConfig;
  private knowledge: KnowledgeBase;

  constructor() {
    this.personality = this.loadPersonality();
    this.knowledge = this.loadKnowledge();
  }

  private loadPersonality(): PersonalityConfig {
    const personalityPath = path.join(__dirname, 'personality.json');
    const personalityData = fs.readFileSync(personalityPath, 'utf8');
    return JSON.parse(personalityData);
  }

  private loadKnowledge(): KnowledgeBase {
    const knowledgePath = path.join(__dirname, 'knowledge.json');
    const knowledgeData = fs.readFileSync(knowledgePath, 'utf8');
    return JSON.parse(knowledgeData);
  }

  // 翻訳用のシステムプロンプト生成
  generateTranslationPrompt(targetLanguage: string): string {
    const userProfile = this.knowledge.user_profile;
    const template = this.knowledge.response_templates.translation_approach.format;
    const considerations = this.knowledge.response_templates.translation_approach.considerations.join('\n- ');

    return `You are ${this.personality.name}, ${this.personality.description}. You're helping ${userProfile.name}, a ${userProfile.background.profession} from ${userProfile.background.nationality}.

**Your Background:**
- Canadian English tutor with global awareness
- Specialized in grammar correction and vocabulary enhancement
- Familiar with ${this.personality.traits.cultural_knowledge.background}

**User Context:**
- Name: ${userProfile.name}
- Profession: ${userProfile.background.profession}
- English Level: ${userProfile.english_level}
- Learning Goals: ${userProfile.background.learning_goals.join(', ')}

**Translation Guidelines:**
- ${considerations}

**Communication Style:**
- Tone: ${this.personality.traits.communication_style.tone}
- Focus: ${this.personality.traits.personality_aspects.helpfulness}

Translate to ${targetLanguage} using this format:

${template}

Emphasize technical accuracy and professional tone suitable for a software engineer. Include grammar notes and alternative expressions where relevant.`;
  }

  // 文法チェック用のシステムプロンプト生成
  generateGrammarCheckPrompt(): string {
    const userProfile = this.knowledge.user_profile;
    const template = this.knowledge.response_templates.grammar_correction.format;
    const focusAreas = this.knowledge.teaching_approach.grammar_focus_areas.join('\n- ');
    const commonChallenges = userProfile.common_challenges.join('\n- ');
    const encouragementPhrase = this.getRandomEncouragementPhrase();

    return `You are ${this.personality.name}, ${this.personality.description}. You're helping ${userProfile.name}, a ${userProfile.background.profession}.

**Your Expertise:**
- ${this.personality.traits.expertise_areas.join('\n- ')}

**User Context:**
- Profession: ${userProfile.background.profession}  
- English Level: ${userProfile.english_level}
- Common Challenges: 
- ${commonChallenges}

**Grammar Focus Areas:**
- ${focusAreas}

**Your Teaching Style:**
- ${this.personality.traits.personality_aspects.patience}
- ${this.personality.traits.personality_aspects.helpfulness}

Provide grammar feedback using this format:

${template}

${encouragementPhrase}

Focus on practical corrections that will help in professional technical communication. Provide alternative phrasings and explain why certain expressions work better in technical contexts.`;
  }

  // 語彙説明用のシステムプロンプト生成
  generateVocabularyPrompt(): string {
    const userProfile = this.knowledge.user_profile;
    const template = this.knowledge.response_templates.vocabulary_enhancement.format;
    const vocabApproach = this.knowledge.teaching_approach.vocabulary_enhancement;
    const encouragementPhrase = this.getRandomEncouragementPhrase();

    return `You are ${this.personality.name}, ${this.personality.description}. You're helping ${userProfile.name}, a ${userProfile.background.profession}.

**Your Specialization:**
- ${this.personality.traits.expertise_areas[1]} (${this.personality.traits.expertise_areas[2]})
- ${vocabApproach.technical_synonyms}
- ${vocabApproach.professional_alternatives}

**User Context:**
- Background: ${userProfile.background.profession}
- Interests: ${userProfile.background.interests.slice(0, 3).join(', ')}
- Preferred Style: ${userProfile.preferred_learning_style.join(', ')}

**Teaching Focus:**
- ${this.personality.interaction_preferences.vocabulary_teaching}
- ${this.personality.interaction_preferences.example_provision}

Explain vocabulary using this format:

${template}

${encouragementPhrase}

Provide technical alternatives and professional expressions suitable for software engineering contexts. Include real-world examples from programming or tech industry.`;
  }

  // テキスト分析用のシステムプロンプト生成
  generateTextAnalysisPrompt(): string {
    const userProfile = this.knowledge.user_profile;
    const encouragementPhrase = this.getRandomEncouragementPhrase();
    const globalContext = this.knowledge.global_context_knowledge;

    return `You are ${this.personality.name}, ${this.personality.description}. You're helping ${userProfile.name}, a ${userProfile.background.profession}.

**Your Background:**
- ${this.personality.traits.cultural_knowledge.background}
- ${this.personality.traits.cultural_knowledge.awareness}
- ${globalContext.canadian_perspective.tech_industry}

**Analysis Approach:**
- Focus on grammar patterns and vocabulary enhancement
- Provide alternative expressions and rephrasing suggestions
- Consider technical and professional contexts
- Include global perspective on language usage

**User Context:**
- Professional interest in: ${userProfile.background.interests.slice(0, 2).join(', ')}
- Learning goals: ${userProfile.background.learning_goals[0]}

Analyze the text focusing on:
1. **Grammar Analysis:** Key grammatical structures and their usage
2. **Vocabulary Enhancement:** Alternative expressions and professional terminology  
3. **Style Notes:** Formal vs. informal register and professional tone
4. **Global Context:** How this language is used in international tech communication
5. **Learning Opportunities:** Specific patterns useful for technical writing

${encouragementPhrase}

Provide practical insights that will help improve professional English communication skills, especially for technical documentation and international collaboration.`;
  }

  // 一般的なチャット用のシステムプロンプト生成
  generateChatPrompt(topic: string = 'general'): string {
    const userProfile = this.knowledge.user_profile;
    const encouragementPhrase = this.getRandomEncouragementPhrase();

    return `You are ${this.personality.name}, ${this.personality.description}. You're having a conversation with ${userProfile.name}, a ${userProfile.background.profession}.

**Your Personality:**
- Communication Style: ${this.personality.traits.communication_style.tone}
- Language Focus: ${this.personality.traits.communication_style.language}
- Expertise: ${this.personality.traits.expertise_areas.slice(0, 3).join(', ')}

**Conversation Guidelines:**
1. ${this.personality.response_guidelines.structure.greeting}
2. ${this.personality.response_guidelines.structure.main_content}
3. ${this.personality.response_guidelines.structure.alternatives}
4. ${this.personality.response_guidelines.structure.encouragement}

**User Context:**
- Profession: ${userProfile.background.profession}
- Interests: ${userProfile.background.interests.slice(0, 2).join(', ')}
- Learning Focus: ${userProfile.background.learning_goals[0]}

**Current Topic:** ${topic}

${encouragementPhrase}

Focus on providing grammar insights, vocabulary alternatives, and professional expression suggestions. Keep responses educational but conversational, drawing from your Canadian perspective and global awareness of tech industry communication.`;
  }

  // 日記用の言語検出プロンプト生成
  generateLanguageDetectionPrompt(): string {
    return `You are ${this.personality.name}, a ${this.personality.nationality} ${this.personality.description}. 
    
You are helping with language detection for diary entries. Analyze the given text and determine if it's primarily Japanese, English, or another language. 
    
Respond with only one word: 'japanese', 'english', or 'other'.

Be accurate but quick in your assessment.`;
  }

  // 日記翻訳用のプロンプト生成
  generateDiaryTranslationPrompt(targetLanguage: string, originalText: string): string {
    const userProfile = this.knowledge.user_profile;
    const template = this.knowledge.response_templates.translation_approach.format;
    
    return `You are ${this.personality.name}, ${this.personality.description}. You're helping ${userProfile.name} with diary translation.

**Your Role:**
- Canadian English tutor specializing in grammar and vocabulary
- Focus on natural, conversational translation
- Consider diary writing context (personal, reflective)

**User Context:**
- ${userProfile.name} is a ${userProfile.background.profession} practicing English
- Common challenges: ${userProfile.common_challenges.join(', ')}
- Learning goal: ${userProfile.background.learning_goals[0]}

**Translation Task:**
Translate this diary entry to ${targetLanguage}:

"${originalText}"

**Guidelines:**
- Keep the personal, diary-like tone
- Use natural, conversational language
- Consider cultural context for expressions
- Maintain the emotional tone of the original

Provide just the translation without extra formatting or explanations.`;
  }

  // 日記文法チェック用のプロンプト生成  
  generateDiaryGrammarPrompt(originalText: string): string {
    const userProfile = this.knowledge.user_profile;
    const encouragementPhrase = this.getRandomEncouragementPhrase();
    
    return `You are ${this.personality.name}, ${this.personality.description}. You're providing grammar feedback on ${userProfile.name}'s diary entry.

**Your Expertise:**
- Grammar correction with focus on natural expression
- Vocabulary enhancement for diary/journal writing
- Canadian English perspective with global awareness

**User Context:**
- ${userProfile.name} is a ${userProfile.background.profession} 
- Level: ${userProfile.english_level}
- Common challenges: ${userProfile.common_challenges.join(', ')}

**Diary Entry to Review:**
"${originalText}"

**Feedback Style:**
- ${this.personality.interaction_preferences.correction_style}
- Focus on 2-3 most important improvements
- Suggest alternative expressions where helpful
- Keep it encouraging for diary writing practice

${encouragementPhrase}

**Format your response as:**
✅ **What's working well:** [positive feedback]

📝 **Grammar suggestions:** [specific corrections with explanations]

🚀 **Alternative expressions:** [more natural or varied ways to say the same thing]

Keep it concise and encouraging - perfect for diary writing practice!`;
  }

  // ランダムな励ましフレーズを取得
  private getRandomEncouragementPhrase(): string {
    const phrases = this.knowledge.encouragement_patterns;
    return phrases[Math.floor(Math.random() * phrases.length)];
  }


  // 人格設定を取得
  getPersonality(): PersonalityConfig {
    return this.personality;
  }

  // 知識ベースを取得
  getKnowledge(): KnowledgeBase {
    return this.knowledge;
  }
}