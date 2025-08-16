import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { DiaryAIService } from '../diary/diaryAIService';
import { NewsService } from '../../services/newsService';

const diaryAIService = new DiaryAIService();
const newsService = new NewsService();

export const randomCommand = {
  data: new SlashCommandBuilder()
    .setName('random')
    .setDescription('Get diary topic suggestions with today\'s news and personal prompts for English learning'),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    try {
      console.log(`📝 Generating diary topics for ${interaction.user.tag}`);

      // Get today's news
      const newsTopics = await newsService.getTodaysTopics();
      
      // Generate diary prompts with AI
      const diaryPrompts = await diaryAIService.generateDiaryTopics(newsTopics);

      // Create beautiful embed response
      const embed = new EmbedBuilder()
        .setTitle('✨ Today\'s Diary Topics')
        .setDescription('Here are some interesting topics to write about today! Choose one that speaks to you 📖')
        .setColor(0x00D4AA)
        .setTimestamp()
        .setFooter({ 
          text: 'Your English Learning Partner 🤝',
          iconURL: interaction.user.displayAvatarURL()
        });

      // Add news-based topics with sources
      if (diaryPrompts.newsTopics && diaryPrompts.newsTopics.length > 0) {
        const newsText = diaryPrompts.newsTopics
          .map((topic, index) => `**${index + 1}.** ${topic}`)
          .join('\n');
        
        embed.addFields({
          name: '📰 Today\'s News-Inspired Topics',
          value: newsText,
          inline: false
        });
      }

      // Add news sources if available
      if (newsTopics && newsTopics.length > 0) {
        const sourcesText = newsTopics
          .filter(item => item.url)
          .map((item, index) => `**${index + 1}.** [${item.title}](${item.url})`)
          .join('\n');
        
        if (sourcesText) {
          embed.addFields({
            name: '🔗 News Sources',
            value: sourcesText,
            inline: false
          });
        }
      }

      // Add personal reflection prompts
      if (diaryPrompts.personalPrompts && diaryPrompts.personalPrompts.length > 0) {
        const personalText = diaryPrompts.personalPrompts
          .map((prompt, index) => `**${index + 1}.** ${prompt}`)
          .join('\n');

        embed.addFields({
          name: '💭 Personal Reflection Prompts',
          value: personalText,
          inline: false
        });
      }

      // Add partner-style encouragement
      if (diaryPrompts.encouragement) {
        embed.addFields({
          name: '🌟 Your Daily Check-in',
          value: diaryPrompts.encouragement,
          inline: false
        });
      }

      // Add helpful tips
      embed.addFields({
        name: '💡 Writing Tips',
        value: '• Try writing in both English and Japanese\n• Don\'t worry about perfect grammar - focus on expressing your thoughts\n• Use the diary channel for automatic translation help!',
        inline: false
      });

      await interaction.editReply({ embeds: [embed] });
      console.log('✅ Diary topics generated successfully');

    } catch (error) {
      console.error('❌ Error generating diary topics:', error);
      
      // Fallback response if services fail
      const fallbackEmbed = new EmbedBuilder()
        .setTitle('📝 Diary Topics (Backup)')
        .setDescription('Here are some general diary topics to get you started!')
        .setColor(0xFF6B6B)
        .addFields(
          {
            name: '📰 General Topics',
            value: '1. What\'s one thing that made you smile today?\n2. Describe a challenge you faced and how you handled it\n3. What are you grateful for right now?',
            inline: false
          },
          {
            name: '💭 Reflection Questions',
            value: '1. How are you feeling today and why?\n2. What\'s one goal you want to work on this week?\n3. What did you learn something new about today?',
            inline: false
          },
          {
            name: '🌟 Daily Check-in',
            value: 'Hey there! 😊 I\'m here to support your English learning journey. Take a moment to write about whatever\'s on your mind - it\'s great practice!',
            inline: false
          }
        );

      await interaction.editReply({ 
        embeds: [fallbackEmbed],
        content: '⚠️ Having trouble fetching today\'s news, but here are some great topics to write about!'
      });
    }
  },
};