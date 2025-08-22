import {
  ChatInputCommandInteraction,
  Message,
  TextChannel,
  ThreadChannel,
  Collection,
} from 'discord.js';

interface ContextMessage {
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
  /**
   * Collect context specifically from Discord threads
   * Optimized for thread-based conversations and interactions
   */
  async collectThreadContext(
    interaction: ChatInputCommandInteraction | Message,
    maxMessages: number
  ): Promise<ChannelContext> {
    try {
      const channel = interaction instanceof Message ? interaction.channel : interaction.channel;
      if (!channel?.isThread()) {
        throw new Error('Channel is not a thread');
      }

      console.log(`🧵 Collecting thread context from: ${channel.id}`);

      const channelName = channel.name || 'Unknown Thread';
      const parentChannelName = channel.parent?.name;

      console.log(`🧵 Reading thread: ${channelName} in ${parentChannelName}`);
      const messages = await this.fetchThreadMessages(channel, maxMessages);

      const context = this.processMessagesForContext(
        messages,
        channelName,
        'thread',
        parentChannelName
      );

      console.log(
        `✅ Thread context collected: ${context.messageCount} messages from ${context.participants.length} participants over ${context.timespan}`
      );
      return context;
    } catch (error) {
      console.error('❌ Error collecting thread context:', error);
      throw new Error('Failed to collect thread context');
    }
  }

  /**
   * Collect context specifically from text channels for reply scenarios
   * Optimized for channel-wide conversation history
   */
  async collectReplyContext(message: Message, maxMessages: number): Promise<ChannelContext> {
    try {
      const channel = message.channel;
      if (!channel.isTextBased() || !('messages' in channel) || channel.isThread()) {
        throw new Error('Channel is not a text channel or is a thread');
      }

      console.log(`💬 Collecting reply context from channel: ${channel.id}`);

      const channelName = 'name' in channel ? channel.name || 'Unknown Channel' : 'DM';

      console.log(`💬 Reading channel: ${channelName}`);
      const messages = await this.fetchChannelMessages(channel as TextChannel, maxMessages);

      const context = this.processMessagesForContext(messages, channelName, 'text');

      console.log(
        `✅ Reply context collected: ${context.messageCount} messages from ${context.participants.length} participants over ${context.timespan}`
      );
      return context;
    } catch (error) {
      console.error('❌ Error collecting reply context:', error);
      throw new Error('Failed to collect reply context');
    }
  }

  /**
   * Legacy method - delegates to thread context for backward compatibility
   * @deprecated Use collectThreadContext or collectReplyContext instead
   */

  /**
   * Internal method to process messages into context format
   * Shared logic for both thread and reply contexts
   */
  private processMessagesForContext(
    messages: Collection<string, Message>,
    channelName: string,
    channelType: 'text' | 'thread',
    parentChannelName?: string
  ): ChannelContext {
    const processedMessages: ContextMessage[] = [];
    const participants = new Set<string>();

    // Sort messages chronologically (oldest first)
    const sortedMessages = Array.from(messages.values()).sort(
      (a, b) => a.createdTimestamp - b.createdTimestamp
    );

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
        isBot: msg.author.bot,
      });
    }

    // Calculate timespan
    let timespan = 'Unknown';
    if (processedMessages.length > 0) {
      const firstMessage = processedMessages[0];
      const lastMessage = processedMessages[processedMessages.length - 1];
      const timeDiff = lastMessage.timestamp.getTime() - firstMessage.timestamp.getTime();

      if (timeDiff < 1000 * 60 * 60) {
        // Less than 1 hour
        const minutes = Math.ceil(timeDiff / (1000 * 60));
        timespan = `${minutes} minute${minutes !== 1 ? 's' : ''}`;
      } else if (timeDiff < 1000 * 60 * 60 * 24) {
        // Less than 1 day
        const hours = Math.ceil(timeDiff / (1000 * 60 * 60));
        timespan = `${hours} hour${hours !== 1 ? 's' : ''}`;
      } else {
        const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        timespan = `${days} day${days !== 1 ? 's' : ''}`;
      }
    }

    return {
      channelName,
      channelType,
      parentChannelName,
      messages: processedMessages,
      messageCount: processedMessages.length,
      participants: Array.from(participants),
      timespan,
    };
  }

  private async fetchThreadMessages(
    thread: ThreadChannel,
    maxMessages: number
  ): Promise<Collection<string, Message>> {
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

  private async fetchChannelMessages(
    channel: TextChannel,
    maxMessages: number
  ): Promise<Collection<string, Message>> {
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

  // Create summary of context for token efficiency
}
