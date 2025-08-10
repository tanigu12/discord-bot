import { ThreadChannel, Message, ChatInputCommandInteraction, Collection } from 'discord.js';

export interface ThreadMessage {
  id: string;
  author: string;
  authorId: string;
  content: string;
  timestamp: Date;
  attachments: string[];
  mentions: string[];
  reactions?: string[];
}

export interface ThreadData {
  threadName: string;
  threadId: string;
  parentChannelName: string;
  createdAt: string;
  participants: string[];
  messages: ThreadMessage[];
  totalMessages: number;
}

export class ThreadReaderService {

  async readThreadMessages(thread: ThreadChannel): Promise<ThreadData> {
    try {
      console.log(`📖 Reading messages from thread: ${thread.name}`);

      // Fetch all messages from the thread
      const messages: Collection<string, Message> = new Collection();
      let lastMessage: string | undefined;

      // Discord limits to 100 messages per fetch, so we need to paginate
      while (true) {
        const fetchedMessages = await thread.messages.fetch({
          limit: 100,
          before: lastMessage,
        });

        if (fetchedMessages.size === 0) break;

        messages.concat(fetchedMessages);
        lastMessage = fetchedMessages.lastKey();

        // Add a reasonable limit to prevent excessive API calls
        if (messages.size >= 500) {
          console.log('⚠️ Message limit reached (500), truncating...');
          break;
        }
      }

      // Process messages and extract data
      const processedMessages: ThreadMessage[] = [];
      const participants = new Set<string>();

      messages
        .sort((a, b) => a.createdTimestamp - b.createdTimestamp)
        .forEach(msg => {
          // Skip bot messages and system messages
          if (msg.author.bot || msg.system) return;

          participants.add(msg.author.username);

          processedMessages.push({
            id: msg.id,
            author: msg.author.username,
            authorId: msg.author.id,
            content: msg.content,
            timestamp: msg.createdAt,
            attachments: msg.attachments.map(att => att.url),
            mentions: msg.mentions.users.map(user => user.username),
            reactions: msg.reactions.cache.map(reaction => reaction.emoji.name || reaction.emoji.toString())
          });
        });

      const threadData: ThreadData = {
        threadName: thread.name || 'Unnamed Thread',
        threadId: thread.id,
        parentChannelName: thread.parent?.name || 'Unknown Channel',
        createdAt: thread.createdAt?.toISOString().split('T')[0] || 'Unknown Date',
        participants: Array.from(participants),
        messages: processedMessages,
        totalMessages: processedMessages.length
      };

      console.log(`✅ Successfully read ${processedMessages.length} messages from ${participants.size} participants`);
      return threadData;

    } catch (error) {
      console.error('❌ Error reading thread messages:', error);
      throw new Error('Failed to read thread messages');
    }
  }

  isIdeaChannel(interaction: ChatInputCommandInteraction): boolean {
    // Check if we're in a thread
    if (!interaction.channel?.isThread()) {
      return false;
    }

    // Check if the parent channel is an "idea" channel
    const parentChannel = interaction.channel.parent;
    if (!parentChannel) {
      return false;
    }

    const channelName = parentChannel.name.toLowerCase();
    return channelName.includes('idea');
  }

  // Helper method to clean and format message content
  cleanMessageContent(content: string): string {
    // Remove Discord formatting that doesn't translate well to markdown
    return content
      .replace(/<@!?(\d+)>/g, '@user') // Replace user mentions
      .replace(/<#(\d+)>/g, '#channel') // Replace channel mentions
      .replace(/<@&(\d+)>/g, '@role') // Replace role mentions
      .replace(/https?:\/\/[^\s]+/g, '[link]') // Simplify URLs for readability
      .trim();
  }

  // Helper method to generate thread summary statistics
  generateThreadStats(threadData: ThreadData): {
    messageCount: number;
    participantCount: number;
    averageMessageLength: number;
    timespan: string;
    mostActiveUser: string;
  } {
    const messageCount = threadData.messages.length;
    const participantCount = threadData.participants.length;
    
    const totalLength = threadData.messages.reduce((sum, msg) => sum + msg.content.length, 0);
    const averageMessageLength = messageCount > 0 ? Math.round(totalLength / messageCount) : 0;

    // Calculate timespan
    let timespan = 'Unknown';
    if (threadData.messages.length > 0) {
      const firstMessage = threadData.messages[0];
      const lastMessage = threadData.messages[threadData.messages.length - 1];
      const timeDiff = lastMessage.timestamp.getTime() - firstMessage.timestamp.getTime();
      const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      timespan = `${days} day${days !== 1 ? 's' : ''}`;
    }

    // Find most active user
    const userMessageCounts = new Map<string, number>();
    threadData.messages.forEach(msg => {
      userMessageCounts.set(msg.author, (userMessageCounts.get(msg.author) || 0) + 1);
    });
    
    const mostActiveUser = Array.from(userMessageCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';

    return {
      messageCount,
      participantCount,
      averageMessageLength,
      timespan,
      mostActiveUser
    };
  }
}