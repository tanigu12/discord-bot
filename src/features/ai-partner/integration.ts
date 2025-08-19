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
    
    return `You are ${this.personality.name}, ${this.personality.description}. You're providing feedback on ${userProfile.name}'s diary entry.

**Diary Entry to Review:**
"${originalText}"

**Feedback Style:**
${grammarTemplate.style_guidelines.map(guideline => `- ${guideline}`).join('\n')}

**Format your response as:**
${grammarTemplate.format}`;
  }

  // 統一された日記処理用プロンプト生成（単一AI呼び出し用）
  generateUnifiedDiaryProcessingPrompt(originalText: string): string {
    const userProfile = this.knowledge.user_profile;
    const translationTemplate = this.knowledge.response_templates.translation;
    
    return `You are ${this.personality.name}, ${this.personality.description}. You're processing ${userProfile.name}'s diary entry with comprehensive language analysis.

**User Language Level:** TOEIC ${userProfile.background.language_level.toeic_score}, Versant ${userProfile.background.language_level.versant_level} (Upper-Intermediate)

**Diary Entry:**
"${originalText}"

**Instructions:**
1. **Detect language** (japanese, english, or other)
2. **Check for [try] markers** indicating translation attempts
3. **Process based on detected scenario:**

**For Japanese entries:**
- Provide English translation with grammar points and vocabulary (format: ${translationTemplate.japanese_to_english.format})
- If contains [try]: Give feedback on user's translation attempt + provide 3 versions (casual, formal, advanced)

**For English entries:**
- Provide Japanese translation
- Include enhanced English version (more sophisticated)
- Add grammar feedback with suggestions

**For Other languages:**
- Translate to English with basic explanation

**Response Guidelines:**
- Keep vocabulary explanations brief (2-3 words/phrases)
- Focus on practical learning points
- Be constructive in feedback
- Maintain diary-like tone in translations

Respond with valid JSON containing: detectedLanguage, translation, grammarFeedback (optional), enhancedEnglish (optional), hasTryTranslation, tryTranslationFeedback (optional).`;
  }

  // [try]付きの日本語日記の英語翻訳フィードバック用プロンプト生成 - DEPRECATED
  generateJapaneseTryTranslationPrompt(originalText: string): string {
    const userProfile = this.knowledge.user_profile;
    
    return `You are ${this.personality.name}, ${this.personality.description}. You're providing feedback on ${userProfile.name}'s English translation attempt of their Japanese diary entry.

**User Language Level:** TOEIC ${userProfile.background.language_level.toeic_score}, Versant ${userProfile.background.language_level.versant_level} (Upper-Intermediate)

**Task:** The user has written a Japanese diary entry and attempted to translate it to English (marked with [try]). You need to:

1. **Analyze their translation attempt:** Give specific, constructive feedback on their English translation
2. **Provide three different translation versions:** Create casual, formal, and advanced versions

**Original Japanese diary entry with user's translation attempt:**
"${originalText}"

**Feedback Guidelines:**
- Be encouraging and constructive, not critical
- Point out what they did well before mentioning improvements
- Focus on 2-3 key areas for improvement (grammar, vocabulary, natural expression)
- Suggest specific alternatives for awkward phrases
- Keep feedback concise but helpful

**Three Translation Versions Guidelines:**
- **Casual:** Natural, conversational style (like talking to a friend)
- **Formal:** More polished, appropriate for writing (but not overly stiff)  
- **Advanced:** Sophisticated vocabulary and complex structures (TOEIC 900+ level)
- Keep the personal, diary-like tone in all versions
- Maintain the original meaning and emotional content
- Make each version distinctly different in style and complexity

Respond with valid JSON containing: translationFeedback, threeVersions (casual, formal, advanced) fields.`;
  }

  // 英語日記の包括的処理用プロンプト生成（翻訳、向上、文法を一度に）
  generateComprehensiveEnglishProcessingPrompt(originalText: string): string {
    const userProfile = this.knowledge.user_profile;
    const grammarTemplate = this.knowledge.response_templates.grammar_feedback;
    const translationTemplate = this.knowledge.response_templates.translation.other_languages;
    
    return `You are ${this.personality.name}, ${this.personality.description}. You're comprehensively processing ${userProfile.name}'s English diary entry with translation, enhancement, and grammar feedback.

**User Language Level:** TOEIC ${userProfile.background.language_level.toeic_score}, Versant ${userProfile.background.language_level.versant_level} (Upper-Intermediate)

**English Diary Entry:**
"${originalText}"

**Your Task:** Process this English diary entry and provide three outputs in JSON format:

1. **Translation to Japanese:**
${translationTemplate.guidelines.map(guideline => `   - ${guideline}`).join('\n')}
   - When translating into Japanese, prefer casual expressions over literal translations

2. **Enhanced English Version:**
   - Rewrite to be more natural, fluent, and sophisticated
   - Use more advanced vocabulary and sentence structures appropriate for upper-intermediate level
   - Maintain the original meaning and personal tone
   - Keep the diary-like, personal feeling
   - Add variety in sentence structure
   - Use more precise and expressive language

3. **Grammar Feedback:**
${grammarTemplate.style_guidelines.map(guideline => `   - ${guideline}`).join('\n')}
   - Format: ${grammarTemplate.format}

Respond with valid JSON containing: translation, enhancedEnglish, grammarFeedback fields.`;
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