import { ChatInputCommandInteraction, SlashCommandBuilder, AttachmentBuilder } from 'discord.js';
import { ThreadReaderService } from '../services/threadReaderService';
import { OpenAIService } from '../services/openai';

const threadReaderService = new ThreadReaderService();
const openaiService = new OpenAIService();

export const formatCommand = {
  data: new SlashCommandBuilder()
    .setName('format')
    .setDescription('Format thread messages into Obsidian-ready blog post with organized structure'),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    try {
      // Check if command is used in idea channel thread
      if (!threadReaderService.isIdeaChannel(interaction)) {
        await interaction.editReply({
          content: '❌ This command can only be used in threads within the "idea" channel!'
        });
        return;
      }

      if (!interaction.channel?.isThread()) {
        await interaction.editReply({
          content: '❌ This command can only be used within a thread!'
        });
        return;
      }

      console.log(`📋 Formatting thread content for ${interaction.user.tag} in thread: ${interaction.channel.name}`);
      console.log(`🔍 Thread ID: ${interaction.channel.id}, Parent: ${interaction.channel.parentId}`);

      // Read thread messages
      const threadData = await threadReaderService.readThreadMessages(interaction.channel);
      
      if (threadData.messages.length === 0) {
        await interaction.editReply({
          content: '📝 No messages found in this thread to format.'
        });
        return;
      }

      // Generate formatted content with AI
      const formattedContent = await openaiService.formatToObsidianBlog(threadData);

      // Create file attachment
      const fileName = `${threadData.threadName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_formatted.md`;
      const attachment = new AttachmentBuilder(Buffer.from(formattedContent.markdown, 'utf8'), {
        name: fileName
      });

      // Send response with formatted content
      await interaction.editReply({
        content: `✨ **Thread formatted successfully!**\n\n` +
                `📊 **Statistics:**\n` +
                `• Messages processed: ${threadData.messages.length}\n` +
                `• Participants: ${threadData.participants.length}\n` +
                `• Thread: "${threadData.threadName}"\n` +
                `• Created: ${threadData.createdAt}\n\n` +
                `📄 **Generated content:**\n` +
                `• Title: ${formattedContent.title}\n` +
                `• Sections: ${formattedContent.sections}\n` +
                `• Word count: ~${formattedContent.wordCount}\n\n` +
                `💡 Ready for Obsidian import and blog publishing!`,
        files: [attachment]
      });

      console.log('✅ Thread formatting completed successfully');

    } catch (error) {
      console.error('❌ Error formatting thread:', error);
      
      await interaction.editReply({
        content: '❌ **Error formatting thread**\n\n' +
                'There was an issue processing the thread content. This could be due to:\n' +
                '• Thread is too long or has too many messages\n' +
                '• Permission issues reading messages\n' +
                '• Temporary API issues\n\n' +
                'Please try again or contact support if the issue persists.'
      });
    }
  },
};