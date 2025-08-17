import { personalityConfig, type PersonalityConfig } from './personality';
import { knowledgeBase, type KnowledgeBase } from './knowledge';

// AIパートナー統合クラス
export class AIPartnerIntegration {
  private personality: PersonalityConfig;
  private knowledge: KnowledgeBase;

  constructor() {
    this.personality = personalityConfig;
    this.knowledge = knowledgeBase;
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

**User Context:**
- Profession: ${userProfile.background.profession}
- Interests: ${userProfile.background.interests.join(', ')}

**Current Topic:** ${topic}

${encouragementPhrase}

Focus on providing helpful, informative responses. Keep conversations educational but conversational, drawing from your Canadian perspective and global awareness.`;
  }

  // テキスト分析用のシステムプロンプト生成
  generateTextAnalysisPrompt(): string {
    const userProfile = this.knowledge.user_profile;
    const encouragementPhrase = this.getRandomEncouragementPhrase();

    return `You are ${this.personality.name}, ${this.personality.description}. You're helping ${userProfile.name}, a ${userProfile.background.profession}.

**Your Background:**
- ${this.personality.traits.cultural_knowledge.background}
- ${this.personality.traits.cultural_knowledge.awareness}

**Analysis Approach:**
- Focus on clear explanations and helpful insights
- Provide alternative perspectives when relevant
- Consider technical and professional contexts
- Include global perspective when useful

**User Context:**
- Professional interest in: ${userProfile.background.interests.slice(0, 2).join(', ')}

Analyze the text focusing on:
1. **Content Analysis:** Key concepts and their significance
2. **Context:** Relevant background information
3. **Insights:** Practical applications and implications
4. **Global Perspective:** How this relates to broader trends or practices

${encouragementPhrase}

Provide practical insights that will be helpful and informative.`;
  }

  // 汎用分析プロンプト生成
  generateAnalysisPrompt(content: string): string {
    const userProfile = this.knowledge.user_profile;
    const analysisTemplate = this.knowledge.response_templates.analysis;
    const encouragementPhrase = this.getRandomEncouragementPhrase();

    return `You are ${this.personality.name}, ${this.personality.description}. You're analyzing content for ${userProfile.name}, a ${userProfile.background.profession}.

**Your Role:**
- Provide clear, helpful analysis
- Focus on practical insights
- Consider technical and professional contexts

**User Context:**
- Background: ${userProfile.background.profession}
- Interests: ${userProfile.background.interests.join(', ')}

**Content to Analyze:**
"${content}"

**Analysis Guidelines:**
${analysisTemplate.guidelines.map(guideline => `- ${guideline}`).join('\n')}

${encouragementPhrase}

Provide a thoughtful analysis that will be useful and informative.`;
  }

  // 日記翻訳用のプロンプト生成（拡張版）
  generateDiaryTranslationPrompt(targetLanguage: string, originalText: string): string {
    const userProfile = this.knowledge.user_profile;
    const translationTemplates = this.knowledge.response_templates.translation;
    
    // 日本語から英語への翻訳の場合、文法説明と語彙を含める
    if (targetLanguage.toLowerCase() === 'english') {
      const template = translationTemplates.japanese_to_english;
      return `You are ${this.personality.name}, ${this.personality.description}. You're helping ${userProfile.name} with comprehensive diary translation from Japanese to English.

**User Language Level:** TOEIC ${userProfile.background.language_level.toeic_score}, Versant ${userProfile.background.language_level.versant_level} (Upper-Intermediate)

**Translation Task:**
Translate this Japanese diary entry to English with educational support:

"${originalText}"

**Format your response exactly like this:**

${template.format}

**Guidelines:**
${template.guidelines.map(guideline => `- ${guideline}`).join('\n')}`;
    }
    
    // その他の言語翻訳の場合は従来通り
    const template = translationTemplates.other_languages;
    return `You are ${this.personality.name}, ${this.personality.description}. You're helping ${userProfile.name} with diary translation.

**Translation Task:**
Translate this diary entry to ${targetLanguage}:

"${originalText}"

**Guidelines:**
${template.guidelines.map(guideline => `- ${guideline}`).join('\n')}

Provide ${template.format}.`;
  }

  // 日記文法チェック用のプロンプト生成（簡素化版）
  generateDiaryGrammarPrompt(originalText: string): string {
    const userProfile = this.knowledge.user_profile;
    const grammarTemplate = this.knowledge.response_templates.grammar_feedback;
    const encouragementPhrase = this.getRandomEncouragementPhrase();
    
    return `You are ${this.personality.name}, ${this.personality.description}. You're providing feedback on ${userProfile.name}'s diary entry.

**Diary Entry to Review:**
"${originalText}"

**Feedback Style:**
${grammarTemplate.style_guidelines.map(guideline => `- ${guideline}`).join('\n')}

${encouragementPhrase}

**Format your response as:**
${grammarTemplate.format}`;
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