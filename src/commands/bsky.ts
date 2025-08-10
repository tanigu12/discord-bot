import { ChatInputCommandInteraction, SlashCommandBuilder, AttachmentBuilder } from 'discord.js';
import { BlueskyService } from '../services/blueskyService';
import axios from 'axios';

const blueskyService = new BlueskyService();

export const bskyCommand = {
  data: new SlashCommandBuilder()
    .setName('bsky')
    .setDescription('Post a message to Bluesky (@taka1415.bsky.social)')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('Message to post to Bluesky (max 300 characters)')
        .setRequired(true)
    )
    .addAttachmentOption(option =>
      option.setName('image')
        .setDescription('Optional image to attach to the post')
        .setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const message = interaction.options.getString('message', true);
    const imageAttachment = interaction.options.getAttachment('image');

    await interaction.deferReply();

    try {
      console.log(`🐦 Processing Bluesky post request from ${interaction.user.tag}: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`);

      // Validate message length
      if (message.length > 300) {
        await interaction.editReply({
          content: `❌ **Message too long!**\n\nYour message is ${message.length} characters, but Bluesky has a 300 character limit.\n\nPlease shorten your message by ${message.length - 300} characters.`
        });
        return;
      }

      // Format message for Bluesky
      const formattedMessage = blueskyService.formatForBluesky(message);
      
      // Handle image attachment if provided
      let imageBuffer: Buffer | undefined;
      if (imageAttachment) {
        console.log(`🖼️ Processing image attachment: ${imageAttachment.name}`);
        
        // Validate image type
        const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!imageAttachment.contentType || !validImageTypes.includes(imageAttachment.contentType)) {
          await interaction.editReply({
            content: '❌ **Invalid image format!**\n\nSupported formats: JPEG, PNG, GIF, WebP\n\nPlease try again with a valid image file.'
          });
          return;
        }

        // Check image size (Bluesky limit is typically 1MB)
        if (imageAttachment.size > 1024 * 1024) {
          await interaction.editReply({
            content: `❌ **Image too large!**\n\nYour image is ${(imageAttachment.size / 1024 / 1024).toFixed(2)}MB, but the limit is 1MB.\n\nPlease use a smaller image.`
          });
          return;
        }

        try {
          console.log(`📥 Downloading image from: ${imageAttachment.url}`);
          const response = await axios.get(imageAttachment.url, {
            responseType: 'arraybuffer',
            timeout: 10000,
            headers: {
              'User-Agent': 'Discord-Bot-Bluesky-Poster/1.0'
            }
          });
          
          imageBuffer = Buffer.from(response.data);
          console.log(`✅ Image downloaded successfully: ${imageBuffer.length} bytes`);
        } catch (error) {
          console.error('❌ Failed to download image:', error);
          await interaction.editReply({
            content: '❌ **Failed to process image**\n\nCould not download the attached image. Please try again or post without an image.'
          });
          return;
        }
      }

      // Post to Bluesky
      console.log('🚀 Posting to Bluesky...');
      const result = await blueskyService.post(formattedMessage, imageBuffer);

      // Success response
      const successEmbed = {
        color: 0x00D4F1, // Bluesky blue
        title: '✅ Posted to Bluesky!',
        description: `Successfully posted to [@taka1415.bsky.social](${result.url})`,
        fields: [
          {
            name: 'Message',
            value: formattedMessage.length > 100 
              ? `${formattedMessage.substring(0, 97)}...`
              : formattedMessage,
            inline: false
          },
          {
            name: 'Character Count',
            value: `${formattedMessage.length}/300`,
            inline: true
          },
          {
            name: 'Post URL',
            value: `[View on Bluesky](${result.url})`,
            inline: true
          }
        ],
        footer: {
          text: `URI: ${result.uri.split('/').pop()}`,
          icon_url: 'https://bsky.social/static/favicon-32x32.png'
        },
        timestamp: new Date().toISOString()
      };

      if (imageAttachment) {
        successEmbed.fields.push({
          name: 'Image',
          value: `✅ ${imageAttachment.name} (${(imageAttachment.size / 1024).toFixed(1)}KB)`,
          inline: true
        });
      }

      await interaction.editReply({
        embeds: [successEmbed]
      });

      console.log(`✅ Bluesky post completed successfully: ${result.url}`);

    } catch (error) {
      console.error('❌ Error in bsky command:', error);
      
      let errorMessage = 'Unknown error occurred';
      let helpText = 'Please try again later.';

      if (error instanceof Error) {
        if (error.message.includes('Rate limit')) {
          errorMessage = 'Rate limit exceeded';
          helpText = 'Bluesky limits posts to prevent spam. Please wait a few minutes before posting again.';
        } else if (error.message.includes('credentials') || error.message.includes('authentication')) {
          errorMessage = 'Authentication failed';
          helpText = 'There\'s an issue with the Bluesky account configuration. Please contact the bot administrator.';
        } else if (error.message.includes('too long')) {
          errorMessage = 'Message too long';
          helpText = 'Please shorten your message to 300 characters or less.';
        } else if (error.message.includes('Invalid post content')) {
          errorMessage = 'Invalid content';
          helpText = 'Your message contains content that cannot be posted. Please try rephrasing.';
        } else {
          errorMessage = error.message;
        }
      }

      const errorEmbed = {
        color: 0xFF3333, // Red
        title: '❌ Failed to Post to Bluesky',
        description: `**Error:** ${errorMessage}`,
        fields: [
          {
            name: 'What you can do',
            value: helpText,
            inline: false
          },
          {
            name: 'Tips for success',
            value: '• Keep messages under 300 characters\n• Use common image formats (JPEG, PNG)\n• Wait between posts to avoid rate limits\n• Avoid special Discord formatting',
            inline: false
          }
        ],
        footer: {
          text: 'If the problem persists, please contact support',
          icon_url: 'https://bsky.social/static/favicon-32x32.png'
        },
        timestamp: new Date().toISOString()
      };

      await interaction.editReply({
        embeds: [errorEmbed]
      });
    }
  },

  // Helper method for testing
  async testConnection(): Promise<boolean> {
    try {
      return await blueskyService.validateCredentials();
    } catch (error) {
      console.error('Bluesky connection test failed:', error);
      return false;
    }
  }
};