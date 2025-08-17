import { EmbedBuilder, User } from 'discord.js';
import { RandomContentResult } from './contentAggregationService';
import { TechnicalQuestion } from '../technical-questions';
import { EnglishPhrase } from '../english-phrases';

export class RandomContentEmbedFormatter {
  /**
   * Create the main embed with all content
   */
  createMainEmbed(content: RandomContentResult, user: User): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setTitle("✨ Today's Random Content")
      .setDescription(
        'Here are diary topics, technical questions, English phrases, and your tasks! 📖💻🗣️📋'
      )
      .setColor(0x00d4aa)
      .setTimestamp()
      .setFooter({
        text: 'Your Learning & Productivity Partner 🤝',
        iconURL: user.displayAvatarURL(),
      });

    // Add diary content if available
    if (content.diaryPrompts) {
      this.addDiaryFields(embed, content);
    }

    // Add technical questions
    this.addTechnicalQuestionsField(embed, content.technicalQuestions);

    // Add English phrases
    this.addEnglishPhrasesField(embed, content.englishPhrases);

    // Add Asana tasks if available
    if (content.asanaTasks && content.asanaTasks.length > 0) {
      this.addAsanaTasksField(embed, content.asanaTasks);
    }

    // Add tips and resources
    this.addTipsAndResourcesFields(embed, content.resources);

    return embed;
  }

  /**
   * Create fallback embed when services fail
   */
  createFallbackEmbed(
    technicalQuestions: TechnicalQuestion[],
    englishPhrases: EnglishPhrase[],
    resources: { listening: string; reading: string }
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
      value: `**For Listening:** [YouTube Subscriptions](${resources.listening})\n**For Reading:** [Google News](${resources.reading})`,
      inline: false,
    });

    return embed;
  }

  /**
   * Add diary-related fields to embed
   */
  private addDiaryFields(embed: EmbedBuilder, content: RandomContentResult): void {
    if (!content.diaryPrompts) return;

    // Add news-based topics
    if (content.diaryPrompts.newsTopics && content.diaryPrompts.newsTopics.length > 0) {
      const newsText = content.diaryPrompts.newsTopics
        .map((topic, index) => `**${index + 1}.** ${topic}`)
        .join('\n');

      embed.addFields({
        name: "📰 Today's News-Inspired Topics",
        value: newsText,
        inline: false,
      });
    }

    // Add news sources if available
    if (content.newsTopics && content.newsTopics.length > 0) {
      const sourcesText = content.newsTopics
        .filter(item => item.url)
        .map((item, index) => `**${index + 1}.** [${item.title}](${item.url})`)
        .join('\n');

      if (sourcesText) {
        embed.addFields({
          name: '🔗 News Sources',
          value: sourcesText,
          inline: false,
        });
      }
    }

    // Add personal reflection prompts
    if (content.diaryPrompts.personalPrompts && content.diaryPrompts.personalPrompts.length > 0) {
      const personalText = content.diaryPrompts.personalPrompts
        .map((prompt, index) => `**${index + 1}.** ${prompt}`)
        .join('\n');

      embed.addFields({
        name: '💭 Personal Reflection Prompts',
        value: personalText,
        inline: false,
      });
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
   * Add Asana tasks field
   */
  private addAsanaTasksField(embed: EmbedBuilder, tasks: any[]): void {
    const tasksText = tasks
      .map((task, index) => {
        const dueDate = task.due_on ? ` (Due: ${task.due_on})` : '';
        const projectName =
          task.projects && task.projects.length > 0 ? ` [${task.projects[0].name}]` : '';
        return `**${index + 1}.** ${task.name}${dueDate}${projectName}`;
      })
      .join('\n');

    embed.addFields({
      name: `📋 Your Current Tasks (${tasks.length})`,
      value: tasksText,
      inline: false,
    });
  }

  /**
   * Add tips and resources fields
   */
  private addTipsAndResourcesFields(
    embed: EmbedBuilder,
    resources: { listening: string; reading: string }
  ): void {
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
      value: `**For Listening:** [YouTube Subscriptions](${resources.listening})\n**For Reading:** [Google News](${resources.reading})`,
      inline: false,
    });
  }
}
