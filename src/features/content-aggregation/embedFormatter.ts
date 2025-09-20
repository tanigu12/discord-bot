import { EmbedBuilder, User, ChatInputCommandInteraction } from 'discord.js';
import { RandomContentResult } from './contentAggregationService';
import { TechnicalQuestion } from '../technical-questions';
import { EnglishPhrase } from '../english-phrases';

const EXTERNAL_LINKS = [
  `**For Listening:**`,
  `[YouTube Subscriptions](https://www.youtube.com/feed/subscriptions)`,
  `**For Reading:**`,
  `[Google News](https://news.google.com/home?hl=en-US&gl=US&ceid=US:en)`,
  `[X (Twitter)](https://x.com/home)`,
  `**Checking Tasks:**`,
  `[Duo3.0](https://app.abceed.com/libraries/detail/duo?from=home)`,
  `[英語のハノン](https://app.abceed.com/libraries/detail/hanon_shokyu_2?from=find-text)`,
];
export class RandomContentEmbedFormatter {
  /**
   * Create comprehensive response with main embed and follow-up messages for long content
   */
  async createRandomContentResponse(
    content: RandomContentResult,
    user: User,
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    // Create main embed with essential info and short content
    const embed = new EmbedBuilder()
      .setTitle("✨ Today's Random Content")
      .setDescription(
        'Here are diary topics, technical questions, English phrases, debate topics, and your tasks! 📖💻🗣️🎭📋'
      )
      .setColor(0x00d4aa)
      .setTimestamp()
      .setFooter({
        text: 'Your Learning & Productivity Partner 🤝',
        iconURL: user.displayAvatarURL(),
      });

    // Add short diary content to main embed (if available and short)
    if (content.diaryPrompts) {
      this.addShortDiaryFields(embed, content);
    }

    // Always add technical questions, English phrases, and debate questions to main embed (these are controlled length)
    this.addTechnicalQuestionsField(embed, content.technicalQuestions);
    this.addEnglishPhrasesField(embed, content.englishPhrases);
    this.addDebateQuestionsField(embed, content.debateQuestions);


    // Add tips and resources
    this.addTipsAndResourcesFields(embed);

    // Send main embed
    await interaction.editReply({ embeds: [embed] });

    // Send long diary content as separate messages (use followUp for interactions)
    if (content.diaryPrompts) {
      await this.sendLongDiaryContentInteraction(content, interaction);
    }

  }

  /**
   * Create fallback embed when services fail
   */
  createFallbackEmbed(
    technicalQuestions: TechnicalQuestion[],
    englishPhrases: EnglishPhrase[],
    debateQuestions: EnglishPhrase[]
  ): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setTitle('📝 Random Content (Backup)')
      .setDescription('Here are some topics, questions, and phrases to get you started!')
      .setColor(0xff6b6b);

    // Add fallback diary topics
    embed.addFields({
      name: '📰 General Diary Topics',
      value:
        "1. What's one thing that made you smile today?\n2. Describe a challenge you faced and how you handled it\n3. What are you grateful for right now?",
      inline: false,
    });

    embed.addFields({
      name: '💭 Reflection Questions',
      value:
        "1. How are you feeling today and why?\n2. What's one goal you want to work on this week?\n3. What did you learn something new about today?",
      inline: false,
    });

    // Add technical questions
    this.addTechnicalQuestionsField(embed, technicalQuestions);

    // Add English phrases
    this.addEnglishPhrasesField(embed, englishPhrases);

    // Add debate questions
    this.addDebateQuestionsField(embed, debateQuestions);

    // Add daily check-in
    embed.addFields({
      name: '🌟 Daily Check-in',
      value:
        "Hey there! 😊 I'm here to support your learning journey. Practice writing, coding, speaking, and staying organized!",
      inline: false,
    });

    // Add resources
    embed.addFields({
      name: '🔗 Recommended Resources',
      value: EXTERNAL_LINKS.join(`\n`),
      inline: false,
    });

    return embed;
  }

  /**
   * Add short diary summary to main embed
   */
  private addShortDiaryFields(embed: EmbedBuilder, content: RandomContentResult): void {
    if (!content.diaryPrompts) return;

    const newsCount = content.diaryPrompts.newsTopics?.length || 0;
    const personalCount = content.diaryPrompts.personalPrompts?.length || 0;
    const sourcesCount = content.newsTopics?.filter(item => item.url)?.length || 0;

    if (newsCount > 0 || personalCount > 0) {
      embed.addFields({
        name: '📝 Diary Topics Available',
        value: `📰 **${newsCount}** news-inspired topics\n💭 **${personalCount}** personal prompts${sourcesCount > 0 ? `\n🔗 **${sourcesCount}** news sources` : ''}\n\n*Full topics will be sent in follow-up messages*`,
        inline: false,
      });
    }
  }

  /**
   * Send complete diary content for interactions
   */
  private async sendLongDiaryContentInteraction(
    content: RandomContentResult,
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    if (!content.diaryPrompts) return;

    // Collect all content in one text first
    let allContent = '';

    // Add news-inspired topics
    if (content.diaryPrompts.newsTopics && content.diaryPrompts.newsTopics.length > 0) {
      const newsText = content.diaryPrompts.newsTopics
        .map((topic, index) => `**${index + 1}.** ${topic}`)
        .join('\n');
      allContent += `📰 **Today's News-Inspired Topics**\n${newsText}\n\n`;
    }

    // Add personal reflection prompts
    if (content.diaryPrompts.personalPrompts && content.diaryPrompts.personalPrompts.length > 0) {
      const personalText = content.diaryPrompts.personalPrompts
        .map((prompt, index) => `**${index + 1}.** ${prompt}`)
        .join('\n');
      allContent += `💭 **Personal Reflection Prompts**\n${personalText}\n\n`;
    }

    // Add news sources if available
    if (content.newsTopics && content.newsTopics.length > 0) {
      const sourcesText = content.newsTopics
        .filter(item => item.url)
        .map((item, index) => `**${index + 1}.** [${item.title}](${item.url})`)
        .join('\n');

      if (sourcesText) {
        allContent += `🔗 **News Sources**\n${sourcesText}\n\n`;
      }
    }

    // Add encouragement if available
    if (content.diaryPrompts.encouragement) {
      allContent += `🌟 **Your Daily Check-in**\n${content.diaryPrompts.encouragement}\n\n`;
    }

    // Apply long content treatment function to the collected text
    if (allContent.trim()) {
      await this.sendLongContentInteraction(
        '📝 Complete Diary Content',
        allContent.trim(),
        interaction
      );
    }
  }

  /**
   * Add technical questions field
   */
  private addTechnicalQuestionsField(embed: EmbedBuilder, questions: TechnicalQuestion[]): void {
    if (questions.length === 0) return;

    const techText = questions
      .map((item, index) => `**${index + 1}.** ${item.question}`)
      .join('\n');

    embed.addFields({
      name: '💻 Technical Interview Questions',
      value: techText,
      inline: false,
    });
  }

  /**
   * Add English phrases field
   */
  private addEnglishPhrasesField(embed: EmbedBuilder, phrases: EnglishPhrase[]): void {
    if (phrases.length === 0) return;

    const phrasesText = phrases
      .map((item, index) => `**${index + 1}.** ${item.phrase} - ${item.meaning}`)
      .join('\n');

    embed.addFields({
      name: '🗣️ English Phrases to Study',
      value: phrasesText,
      inline: false,
    });
  }

  /**
   * Add debate questions field
   */
  private addDebateQuestionsField(embed: EmbedBuilder, debateQuestions: EnglishPhrase[]): void {
    if (debateQuestions.length === 0) return;

    const debateText = debateQuestions
      .map((item, index) => `**${index + 1}.** ${item.phrase}`)
      .join('\n');

    embed.addFields({
      name: '🎭 Debate Topics for English Practice',
      value: debateText,
      inline: false,
    });
  }



  /**
   * Add tips and resources fields
   */
  private addTipsAndResourcesFields(embed: EmbedBuilder): void {
    // Add encouragement from diary prompts if available
    // (This would be passed in the content if available)

    // Add tips
    embed.addFields({
      name: '💡 Usage Tips',
      value:
        '• Practice diary writing in both languages\n• Use technical questions for interview prep\n• Study English phrases to improve natural conversation\n• Tasks help you stay organized and productive!',
      inline: false,
    });

    // Add resources
    embed.addFields({
      name: '🔗 Recommended Resources',
      value: EXTERNAL_LINKS.join(`\n`),
      inline: false,
    });
  }

  /**
   * Send long content for interactions using followUp
   */
  private async sendLongContentInteraction(
    title: string,
    content: string,
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    if (content.length <= 2000) {
      // Single message
      const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(content)
        .setColor(0x00d4aa)
        .setTimestamp();

      await interaction.followUp({ embeds: [embed] });
    } else {
      // Multiple messages
      const chunks = this.splitTextIntoChunks(content, 2000);

      for (let i = 0; i < chunks.length; i++) {
        const embed = new EmbedBuilder()
          .setTitle(`${title} (${i + 1}/${chunks.length})`)
          .setDescription(chunks[i])
          .setColor(0x00d4aa)
          .setTimestamp();

        await interaction.followUp({ embeds: [embed] });
      }
    }
  }

  /**
   * Split text into chunks at natural breakpoints (copied from diary formatter)
   */
  private splitTextIntoChunks(text: string, chunkSize: number): string[] {
    const chunks: string[] = [];
    let currentIndex = 0;

    while (currentIndex < text.length) {
      let endIndex = currentIndex + chunkSize;

      // Find optimal breakpoint
      if (endIndex < text.length) {
        const lastSentenceEnd = text.lastIndexOf('.', endIndex);
        const lastParagraphEnd = text.lastIndexOf('\n', endIndex);
        const lastSpaceEnd = text.lastIndexOf(' ', endIndex);

        // Choose best breakpoint (sentence > paragraph > word boundary)
        if (lastSentenceEnd > currentIndex + chunkSize * 0.7) {
          endIndex = lastSentenceEnd + 1;
        } else if (lastParagraphEnd > currentIndex + chunkSize * 0.7) {
          endIndex = lastParagraphEnd;
        } else if (lastSpaceEnd > currentIndex + chunkSize * 0.7) {
          endIndex = lastSpaceEnd;
        }
      }

      chunks.push(text.substring(currentIndex, endIndex).trim());
      currentIndex = endIndex;
    }

    return chunks;
  }
}
