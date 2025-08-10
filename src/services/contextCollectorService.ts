import { 
  ChatInputCommandInteraction, 
  Message, 
  TextChannel, 
  ThreadChannel, 
  Collection 
} from 'discord.js';

export interface ContextMessage {
  id: string;
  author: string;
  authorId: string;
  content: string;
  timestamp: Date;
  isBot: boolean;
}

export interface ChannelContext {
  channelName: string;
  channelType: 'text' | 'thread';
  parentChannelName?: string;
  messages: ContextMessage[];
  messageCount: number;
  participants: string[];
  timespan: string;
}

export class ContextCollectorService {

  async collectChannelContext(interaction: ChatInputCommandInteraction, maxMessages: number = 50): Promise<ChannelContext> {
    try {
      const channel = interaction.channel;
      if (!channel) {
        throw new Error('Unable to access channel');
      }

      console.log(`📖 Collecting context from channel: ${channel.id}`);

      let channelName: string;
      let channelType: 'text' | 'thread';
      let parentChannelName: string | undefined;
      let messages: Collection<string, Message>;

      // Handle different channel types
      if (channel.isThread()) {
        channelType = 'thread';
        channelName = channel.name || 'Unknown Thread';
        parentChannelName = channel.parent?.name;
        
        console.log(`🧵 Reading thread: ${channelName} in ${parentChannelName}`);
        messages = await this.fetchThreadMessages(channel, maxMessages);
      } else if (channel.isTextBased() && 'messages' in channel) {
        channelType = 'text';
        channelName = 'name' in channel ? (channel.name || 'Unknown Channel') : 'DM';
        
        console.log(`💬 Reading channel: ${channelName}`);
        messages = await this.fetchChannelMessages(channel as TextChannel, maxMessages);
      } else {
        throw new Error('Unsupported channel type for context collection');
      }

      // Process messages
      const processedMessages: ContextMessage[] = [];
      const participants = new Set<string>();

      // Sort messages chronologically (oldest first)
      const sortedMessages = Array.from(messages.values())
        .sort((a, b) => a.createdTimestamp - b.createdTimestamp);

      for (const msg of sortedMessages) {
        // Skip empty messages but include bot messages for context
        if (!msg.content.trim() && msg.attachments.size === 0) continue;

        participants.add(msg.author.username);

        processedMessages.push({
          id: msg.id,
          author: msg.author.username,
          authorId: msg.author.id,
          content: msg.content,
          timestamp: msg.createdAt,
          isBot: msg.author.bot
        });
      }

      // Calculate timespan
      let timespan = 'Unknown';
      if (processedMessages.length > 0) {
        const firstMessage = processedMessages[0];
        const lastMessage = processedMessages[processedMessages.length - 1];
        const timeDiff = lastMessage.timestamp.getTime() - firstMessage.timestamp.getTime();
        
        if (timeDiff < 1000 * 60 * 60) { // Less than 1 hour
          const minutes = Math.ceil(timeDiff / (1000 * 60));
          timespan = `${minutes} minute${minutes !== 1 ? 's' : ''}`;
        } else if (timeDiff < 1000 * 60 * 60 * 24) { // Less than 1 day
          const hours = Math.ceil(timeDiff / (1000 * 60 * 60));
          timespan = `${hours} hour${hours !== 1 ? 's' : ''}`;
        } else {
          const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
          timespan = `${days} day${days !== 1 ? 's' : ''}`;
        }
      }

      const context: ChannelContext = {
        channelName,
        channelType,
        parentChannelName,
        messages: processedMessages,
        messageCount: processedMessages.length,
        participants: Array.from(participants),
        timespan
      };

      console.log(`✅ Context collected: ${processedMessages.length} messages from ${participants.size} participants over ${timespan}`);
      return context;

    } catch (error) {
      console.error('❌ Error collecting channel context:', error);
      throw new Error('Failed to collect channel context');
    }
  }

  private async fetchThreadMessages(thread: ThreadChannel, maxMessages: number): Promise<Collection<string, Message>> {
    const messages: Collection<string, Message> = new Collection();
    let lastMessage: string | undefined;
    let fetched = 0;

    while (fetched < maxMessages) {
      const remainingMessages = Math.min(100, maxMessages - fetched);
      
      const batch = await thread.messages.fetch({
        limit: remainingMessages,
        before: lastMessage,
      });

      if (batch.size === 0) break;

      // Merge messages
      batch.forEach((msg, id) => messages.set(id, msg));
      
      lastMessage = batch.lastKey();
      fetched += batch.size;

      if (batch.size < remainingMessages) break;
    }

    return messages;
  }

  private async fetchChannelMessages(channel: TextChannel, maxMessages: number): Promise<Collection<string, Message>> {
    const messages: Collection<string, Message> = new Collection();
    let lastMessage: string | undefined;
    let fetched = 0;

    while (fetched < maxMessages) {
      const remainingMessages = Math.min(100, maxMessages - fetched);
      
      const batch = await channel.messages.fetch({
        limit: remainingMessages,
        before: lastMessage,
      });

      if (batch.size === 0) break;

      // Merge messages
      batch.forEach((msg, id) => messages.set(id, msg));
      
      lastMessage = batch.lastKey();
      fetched += batch.size;

      if (batch.size < remainingMessages) break;
    }

    return messages;
  }

  // Format context for AI consumption
  formatContextForAI(context: ChannelContext, includeMetadata: boolean = true): string {
    let formatted = '';

    if (includeMetadata) {
      formatted += `**Context Information:**\n`;
      formatted += `- Channel: ${context.channelName} (${context.channelType})\n`;
      if (context.parentChannelName) {
        formatted += `- Parent: ${context.parentChannelName}\n`;
      }
      formatted += `- Messages: ${context.messageCount}\n`;
      formatted += `- Participants: ${context.participants.join(', ')}\n`;
      formatted += `- Timespan: ${context.timespan}\n\n`;
    }

    formatted += `**Recent Conversation:**\n`;
    
    for (const msg of context.messages) {
      const timestamp = msg.timestamp.toISOString().split('T')[0];
      const author = msg.isBot ? `🤖 ${msg.author}` : msg.author;
      formatted += `${author} (${timestamp}): ${msg.content}\n\n`;
    }

    return formatted;
  }

  // Create summary of context for token efficiency
  summarizeContext(context: ChannelContext): string {
    const recentMessages = context.messages.slice(-10); // Last 10 messages
    let summary = `Recent discussion in ${context.channelName}`;
    
    if (context.channelType === 'thread' && context.parentChannelName) {
      summary += ` (thread in ${context.parentChannelName})`;
    }
    
    summary += ` with ${context.participants.length} participants over ${context.timespan}:\n\n`;
    
    for (const msg of recentMessages) {
      if (msg.content.trim()) {
        summary += `${msg.author}: ${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}\n`;
      }
    }
    
    return summary;
  }
}