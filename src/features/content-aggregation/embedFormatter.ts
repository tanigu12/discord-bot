import { EmbedBuilder, User, Message, ChatInputCommandInteraction } from 'discord.js';
import { RandomContentResult } from './contentAggregationService';
import { TechnicalQuestion } from '../technical-questions';
import { EnglishPhrase } from '../english-phrases';

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
        'Here are diary topics, technical questions, English phrases, and your tasks! 📖💻🗣️📋'
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

    // Always add technical questions and English phrases to main embed (these are controlled length)
    this.addTechnicalQuestionsField(embed, content.technicalQuestions);
    this.addEnglishPhrasesField(embed, content.englishPhrases);

    // Add short task list to main embed
    if (content.asanaTasks && content.asanaTasks.length > 0) {
      this.addShortAsanaTasksField(embed, content.asanaTasks);
    }

    // Add tips and resources
    this.addTipsAndResourcesFields(embed, content.resources);

    // Send main embed
    const reply = await interaction.editReply({ embeds: [embed] });

    // Send long diary content as separate messages (use followUp for interactions)
    if (content.diaryPrompts) {
      await this.sendLongDiaryContentInteraction(content, interaction);
    }

    // Always send complete task details as follow-up if there are any tasks
    if (content.asanaTasks && content.asanaTasks.length > 0) {
      await this.sendLongTasksContentInteraction(content.asanaTasks, interaction);
    }
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
  private async sendLongDiaryContentInteraction(content: RandomContentResult, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!content.diaryPrompts) return;

    // Send news-inspired topics
    if (content.diaryPrompts.newsTopics && content.diaryPrompts.newsTopics.length > 0) {
      const newsText = content.diaryPrompts.newsTopics
        .map((topic, index) => `**${index + 1}.** ${topic}`)
        .join('\n');
      
      await this.sendLongContentInteraction("📰 Today's News-Inspired Topics", newsText, interaction);
    }

    // Send personal reflection prompts
    if (content.diaryPrompts.personalPrompts && content.diaryPrompts.personalPrompts.length > 0) {
      const personalText = content.diaryPrompts.personalPrompts
        .map((prompt, index) => `**${index + 1}.** ${prompt}`)
        .join('\n');
      
      await this.sendLongContentInteraction("💭 Personal Reflection Prompts", personalText, interaction);
    }

    // Send news sources if available
    if (content.newsTopics && content.newsTopics.length > 0) {
      const sourcesText = content.newsTopics
        .filter(item => item.url)
        .map((item, index) => `**${index + 1}.** [${item.title}](${item.url})`)
        .join('\n');

      if (sourcesText) {
        await this.sendLongContentInteraction("🔗 News Sources", sourcesText, interaction);
      }
    }

    // Send encouragement if available
    if (content.diaryPrompts.encouragement) {
      await this.sendLongContentInteraction("🌟 Your Daily Check-in", content.diaryPrompts.encouragement, interaction);
    }
  }

  /**
   * Send complete diary content as separate messages (for regular messages)
   */
  private async sendLongDiaryContent(content: RandomContentResult, replyMessage: Message): Promise<void> {
    if (!content.diaryPrompts) return;

    // Send news-inspired topics
    if (content.diaryPrompts.newsTopics && content.diaryPrompts.newsTopics.length > 0) {
      const newsText = content.diaryPrompts.newsTopics
        .map((topic, index) => `**${index + 1}.** ${topic}`)
        .join('\n');
      
      await this.sendLongContent("📰 Today's News-Inspired Topics", newsText, replyMessage);
    }

    // Send personal reflection prompts
    if (content.diaryPrompts.personalPrompts && content.diaryPrompts.personalPrompts.length > 0) {
      const personalText = content.diaryPrompts.personalPrompts
        .map((prompt, index) => `**${index + 1}.** ${prompt}`)
        .join('\n');
      
      await this.sendLongContent("💭 Personal Reflection Prompts", personalText, replyMessage);
    }

    // Send news sources if available
    if (content.newsTopics && content.newsTopics.length > 0) {
      const sourcesText = content.newsTopics
        .filter(item => item.url)
        .map((item, index) => `**${index + 1}.** [${item.title}](${item.url})`)
        .join('\n');

      if (sourcesText) {
        await this.sendLongContent("🔗 News Sources", sourcesText, replyMessage);
      }
    }

    // Send encouragement if available
    if (content.diaryPrompts.encouragement) {
      await this.sendLongContent("🌟 Your Daily Check-in", content.diaryPrompts.encouragement, replyMessage);
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
   * Add summary of Asana tasks to main embed
   */
  private addShortAsanaTasksField(embed: EmbedBuilder, tasks: any[]): void {
    // Show up to 5 tasks in main embed to give better preview
    const shortList = tasks.slice(0, 5); 
    const tasksText = shortList
      .map((task, index) => {
        const status = task.completed ? '✅' : '⏳';
        const dueDate = task.due_on ? ` (Due: ${task.due_on})` : '';
        return `${index + 1}. ${status} **${task.name}**${dueDate}`;
      })
      .join('\n');

    const moreTasksText = tasks.length > 5 ? `\n\n*📋 Complete list with details sent below*` : '';

    embed.addFields({
      name: `📋 Your Current Tasks (${tasks.length} total)`,
      value: tasksText + moreTasksText,
      inline: false,
    });
  }

  /**
   * Send complete task list for interactions (up to 10 tasks with full details)
   */
  private async sendLongTasksContentInteraction(tasks: any[], interaction: ChatInputCommandInteraction): Promise<void> {
    // Show up to 10 tasks as requested
    const displayTasks = tasks.slice(0, 10);
    const tasksText = displayTasks
      .map((task, index) => {
        const status = task.completed ? '✅' : '⏳';
        const dueDate = task.due_on ? ` (Due: ${task.due_on})` : '';
        const projectName = task.projects && task.projects.length > 0 ? ` [${task.projects[0].name}]` : '';
        return `${index + 1}. ${status} **${task.name}**${dueDate}${projectName}\n   \`GID: ${task.gid}\``;
      })
      .join('\n\n');

    const remainingText = tasks.length > 10 ? `\n\n*Note: Showing 10 of ${tasks.length} tasks. Use \`/asana list\` to see all.*` : '';
    const title = `📋 Your Asana Tasks (${Math.min(tasks.length, 10)}${tasks.length > 10 ? ` of ${tasks.length}` : ''})`;

    await this.sendLongContentInteraction(title, tasksText + remainingText, interaction);
  }

  /**
   * Send complete task list as separate message if there are many tasks
   */
  private async sendLongTasksContent(tasks: any[], replyMessage: Message): Promise<void> {
    const tasksText = tasks
      .map((task, index) => {
        const status = task.completed ? '✅' : '⏳';
        const dueDate = task.due_on ? ` (Due: ${task.due_on})` : '';
        const projectName = task.projects && task.projects.length > 0 ? ` [${task.projects[0].name}]` : '';
        return `${index + 1}. ${status} **${task.name}**${dueDate}${projectName}\n   \`GID: ${task.gid}\``;
      })
      .join('\n\n');

    await this.sendLongContent(`📋 Complete Task List (${tasks.length} tasks)`, tasksText, replyMessage);
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

  /**
   * Send long content for interactions using followUp
   */
  private async sendLongContentInteraction(title: string, content: string, interaction: ChatInputCommandInteraction): Promise<void> {
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
   * Send long content in appropriate chunks (copied from diary formatter)
   */
  private async sendLongContent(title: string, content: string, replyMessage: Message): Promise<void> {
    if (content.length <= 2000) {
      // Single message
      const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(content)
        .setColor(0x00d4aa)
        .setTimestamp();
      
      await replyMessage.reply({ embeds: [embed] });
    } else {
      // Multiple messages
      const chunks = this.splitTextIntoChunks(content, 2000);
      
      for (let i = 0; i < chunks.length; i++) {
        const embed = new EmbedBuilder()
          .setTitle(`${title} (${i + 1}/${chunks.length})`)
          .setDescription(chunks[i])
          .setColor(0x00d4aa)
          .setTimestamp();
        
        await replyMessage.reply({ embeds: [embed] });
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
