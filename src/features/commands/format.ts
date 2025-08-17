import { ChatInputCommandInteraction, SlashCommandBuilder, AttachmentBuilder } from 'discord.js';
import { ConversationReaderService } from '../../services/conversationReaderService';
import { ContentAnalysisService } from '../search/contentAnalysisService';

const conversationReaderService = new ConversationReaderService();
const contentAnalysisService = new ContentAnalysisService();

export const formatCommand = {
  data: new SlashCommandBuilder()
    .setName('format')
    .setDescription('Format thread messages into Obsidian-ready blog post with organized structure')
    .addBooleanOption(option =>
      option.setName('include_all')
        .setDescription('Include all messages (default: only conversation-related messages)')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('title')
        .setDescription('Custom title for the formatted document (default: thread name)')
        .setRequired(false)),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    try {
      // Check if command is used in a thread
      if (!interaction.channel?.isThread()) {
        await interaction.editReply({
          content: '❌ This command can only be used within a thread!\n\nℹ️ **How to use:**\n• Go to any thread\n• Use `/format` to convert thread messages to Obsidian format\n• Optional: Add custom title or include all messages'
        });
        return;
      }

      // Get command options
      const includeAll = interaction.options.getBoolean('include_all') ?? false;
      const customTitle = interaction.options.getString('title');

      console.log(`📋 Formatting thread content for ${interaction.user.tag} in thread: ${interaction.channel.name}`);
      console.log(`🔍 Thread ID: ${interaction.channel.id}, Parent: ${interaction.channel.parentId}`);
      console.log(`⚙️ Options: includeAll=${includeAll}, customTitle=${customTitle}`);

      // Read thread messages with options
      const threadData = await conversationReaderService.readThreadMessages(interaction.channel, includeAll);
      
      if (threadData.messages.length === 0) {
        await interaction.editReply({
          content: '📝 No messages found in this thread to format.\n\n💡 **Tip:** Try using `include_all: true` option to include all messages including bot responses.'
        });
        return;
      }

      // Override title if custom title is provided
      if (customTitle) {
        threadData.threadName = customTitle;
      }

      // Generate formatted content with AI
      const formattedContent = await contentAnalysisService.formatToObsidianBlog(threadData);

      // Create file attachment with better naming
      const baseFileName = customTitle || threadData.threadName;
      const fileName = `${baseFileName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.md`;
      const attachment = new AttachmentBuilder(Buffer.from(formattedContent.markdown, 'utf8'), {
        name: fileName
      });

      // Enhanced response with more details
      const channelInfo = interaction.channel.parent ? ` (from #${interaction.channel.parent.name})` : '';
      
      await interaction.editReply({
        content: `✨ **Thread formatted successfully!**\n\n` +
                `📊 **Statistics:**\n` +
                `• Messages processed: ${threadData.messages.length}\n` +
                `• Participants: ${threadData.participants.length}\n` +
                `• Thread: "${threadData.threadName}"${channelInfo}\n` +
                `• Created: ${threadData.createdAt}\n` +
                `• Processing mode: ${includeAll ? 'All messages' : 'Conversation-focused'}\n\n` +
                `📄 **Generated content:**\n` +
                `• Title: ${formattedContent.title}\n` +
                `• Sections: ${formattedContent.sections}\n` +
                `• Word count: ~${formattedContent.wordCount}\n\n` +
                `💡 Ready for Obsidian import and blog publishing!\n` +
                `📎 Download the .md file above to import into your notes.\n` +
                `🎯 **Tip:** React with blog emojis (📝 📄 ✍️ 📰) to push directly to your GitHub blog!`,
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