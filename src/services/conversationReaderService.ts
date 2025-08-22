import { ThreadChannel, Message, Attachment, User, MessageReaction } from 'discord.js';

interface ThreadMessage {
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

export class ConversationReaderService {
  async readThreadMessages(
    thread: ThreadChannel,
    includeAllMessages: boolean = false
  ): Promise<ThreadData> {
    try {
      console.log(`📖 Reading messages from thread: ${thread.name} (ID: ${thread.id})`);
      console.log(`🔧 Thread archived: ${thread.archived}, locked: ${thread.locked}`);
      console.log(`👥 Thread member count: ${thread.memberCount}`);

      // Start with a simple fetch of the most recent messages
      let fetchedMessages = await thread.messages.fetch({ limit: 100 });
      console.log(`📥 Initial fetch: ${fetchedMessages.size} messages`);

      // If no messages found, try fetching with different parameters
      if (fetchedMessages.size === 0) {
        console.log('🔄 Trying alternative fetch method...');
        fetchedMessages = await thread.messages.fetch();
        console.log(`📥 Alternative fetch: ${fetchedMessages.size} messages`);
      }

      const allMessages = Array.from(fetchedMessages.values());
      console.log(`📊 Total messages collected: ${allMessages.length}`);

      // Filter messages based on includeAllMessages parameter
      const messagesToProcess = includeAllMessages
        ? allMessages
        : this.filterReplyRelatedMessages(allMessages);

      console.log(
        `🔗 Messages to process: ${messagesToProcess.length} (${includeAllMessages ? 'all messages' : 'filtered conversations'})`
      );

      // Process messages and extract data
      const processedMessages: ThreadMessage[] = [];
      const participants = new Set<string>();

      // Sort messages by timestamp (oldest first)
      messagesToProcess
        .sort((a, b) => a.createdTimestamp - b.createdTimestamp)
        .forEach(msg => {
          console.log(
            `🔍 Processing message from ${msg.author.username}: "${msg.content.substring(0, 50)}..."`
          );

          // Include relevant messages for formatting purposes
          participants.add(msg.author.username);

          processedMessages.push({
            id: msg.id,
            author: msg.author.username,
            authorId: msg.author.id,
            content: msg.content,
            timestamp: msg.createdAt,
            attachments: msg.attachments.map((att: Attachment) => att.url),
            mentions: msg.mentions.users.map((user: User) => user.username),
            reactions: msg.reactions.cache.map(
              (reaction: MessageReaction) => reaction.emoji.name || reaction.emoji.toString()
            ),
          });
        });

      const threadData: ThreadData = {
        threadName: thread.name || 'Unnamed Thread',
        threadId: thread.id,
        parentChannelName: thread.parent?.name || 'Unknown Channel',
        createdAt: thread.createdAt?.toISOString().split('T')[0] || 'Unknown Date',
        participants: Array.from(participants),
        messages: processedMessages,
        totalMessages: processedMessages.length,
      };

      console.log(
        `✅ Successfully read ${processedMessages.length} messages from ${participants.size} participants`
      );
      return threadData;
    } catch (error) {
      console.error('❌ Error reading thread messages:', error);
      throw new Error('Failed to read thread messages');
    }
  }

  // Helper method to check if channel is idea-related (kept for potential future use)

  // Helper method to get thread context information

  // Helper method to clean and format message content

  // Filter messages to only include reply-related messages to reduce noise
  private filterReplyRelatedMessages(messages: Message[]): Message[] {
    const relatedMessages = new Set<string>();

    // First pass: identify all messages that are replies or being replied to
    messages.forEach(msg => {
      // If this message is a reply, include both the reply and the original
      if (msg.reference?.messageId) {
        relatedMessages.add(msg.id); // The reply itself
        relatedMessages.add(msg.reference.messageId); // The original message being replied to
      }

      // If this message has substantial content (not just reactions/short responses)
      // and is from a human user, include it (reduced threshold for better coverage)
      if (!msg.author.bot && msg.content.trim().length > 10) {
        relatedMessages.add(msg.id);
      }

      // Include messages with attachments as they're likely important
      if (msg.attachments.size > 0) {
        relatedMessages.add(msg.id);
      }
    });

    // Second pass: include messages that mention other users (likely part of conversation)
    messages.forEach(msg => {
      if (msg.mentions.users.size > 0 && msg.content.trim().length > 10) {
        relatedMessages.add(msg.id);
      }
    });

    // Always include the first few messages to provide context
    const sortedMessages = messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);
    sortedMessages.slice(0, 3).forEach(msg => {
      relatedMessages.add(msg.id);
    });

    // Always include the most recent messages for context
    sortedMessages.slice(-3).forEach(msg => {
      relatedMessages.add(msg.id);
    });

    return messages.filter(msg => relatedMessages.has(msg.id));
  }
}
