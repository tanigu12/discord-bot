import { describe, it, expect, beforeEach } from 'vitest';
import { PomodoroFormatter } from '../pomodoroFormatter';
import { CoachingMessage } from '../types';

describe('PomodoroFormatter AI Coaching Features', () => {
  let pomodoroFormatter: PomodoroFormatter;
  let mockUser: any;

  beforeEach(() => {
    pomodoroFormatter = new PomodoroFormatter();
    mockUser = {
      displayName: 'TestUser',
      username: 'testuser',
    };
  });

  describe('createCoachingEmbed', () => {
    it('should create start coaching embed', () => {
      const message: CoachingMessage = {
        type: 'start',
        content: 'Great energy this morning! Focus on your main task for this session.',
        timestamp: new Date(),
      };

      const embed = pomodoroFormatter.createCoachingEmbed(mockUser, message);

      expect(embed.data.title).toBe('🚀 Focus Coaching');
      expect(embed.data.description).toBe('Great energy this morning! Focus on your main task for this session.');
      expect(embed.data.color).toBe(0x2ECC71); // Green for start
      expect(embed.data.timestamp).toBeTruthy();
    });

    it('should create break coaching embed', () => {
      const message: CoachingMessage = {
        type: 'break',
        content: 'Time to recharge! Try a quick walk or some stretches.',
        timestamp: new Date(),
      };

      const embed = pomodoroFormatter.createCoachingEmbed(mockUser, message);

      expect(embed.data.title).toBe('🌊 Break Guidance');
      expect(embed.data.description).toBe('Time to recharge! Try a quick walk or some stretches.');
      expect(embed.data.color).toBe(0x3498DB); // Blue for break
    });

    it('should create completion coaching embed', () => {
      const message: CoachingMessage = {
        type: 'completion',
        content: 'Fantastic work! You completed 4 focused sessions today.',
        timestamp: new Date(),
      };

      const embed = pomodoroFormatter.createCoachingEmbed(mockUser, message);

      expect(embed.data.title).toBe('🎉 Session Complete');
      expect(embed.data.description).toBe('Fantastic work! You completed 4 focused sessions today.');
      expect(embed.data.color).toBe(0xF39C12); // Orange for completion
    });

    it('should create motivation coaching embed', () => {
      const message: CoachingMessage = {
        type: 'motivation',
        content: 'You can do this! Your focus is building stronger with each session.',
        timestamp: new Date(),
      };

      const embed = pomodoroFormatter.createCoachingEmbed(mockUser, message);

      expect(embed.data.title).toBe('💪 Motivation Boost');
      expect(embed.data.description).toBe('You can do this! Your focus is building stronger with each session.');
      expect(embed.data.color).toBe(0xE74C3C); // Red for motivation
    });

    it('should create reflection coaching embed with special footer', () => {
      const message: CoachingMessage = {
        type: 'reflection',
        content: 'What did you learn about your focus patterns during this session?',
        timestamp: new Date(),
      };

      const embed = pomodoroFormatter.createCoachingEmbed(mockUser, message);

      expect(embed.data.title).toBe('🤔 Reflection Time');
      expect(embed.data.description).toBe('What did you learn about your focus patterns during this session?');
      expect(embed.data.color).toBe(0x9B59B6); // Purple for reflection
      expect(embed.data.footer?.text).toBe('💭 Take a moment to reflect on this question');
    });
  });

  describe('createInsightEmbed', () => {
    it('should create performance insight embed', () => {
      const insight = 'Morning sessions often yield the highest focus. You\'re starting strong! 🌅 Your 3-session streak shows excellent consistency!';

      const embed = pomodoroFormatter.createInsightEmbed(mockUser, insight);

      expect(embed.data.title).toBe('💡 Performance Insight');
      expect(embed.data.description).toBe(insight);
      expect(embed.data.color).toBe(0x3498DB); // Blue for insights
      expect(embed.data.footer?.text).toBe('Personalized for TestUser');
      expect(embed.data.timestamp).toBeTruthy();
    });
  });

  describe('createCoachingConfigEmbed', () => {
    it('should create coaching config embed with all fields', () => {
      const preferredStyle = 'encouraging';
      const goals = ['improve focus', 'increase productivity', 'reduce distractions'];
      const motivationalKeywords = ['determination', 'success', 'achievement'];

      const embed = pomodoroFormatter.createCoachingConfigEmbed(
        mockUser,
        preferredStyle,
        goals,
        motivationalKeywords
      );

      expect(embed.data.title).toBe('🎯 AI Coaching Profile');
      expect(embed.data.description).toBe('TestUser\'s coaching preferences');
      expect(embed.data.color).toBe(0x8E44AD); // Purple for config

      expect(embed.data.fields).toHaveLength(3);
      expect(embed.data.fields?.[0]).toMatchObject({
        name: '🎨 Coaching Style',
        value: 'Encouraging',
        inline: true,
      });
      expect(embed.data.fields?.[1]).toMatchObject({
        name: '🎯 Goals',
        value: 'improve focus, increase productivity, reduce distractions',
        inline: true,
      });
      expect(embed.data.fields?.[2]).toMatchObject({
        name: '💪 Keywords',
        value: 'determination, success, achievement',
        inline: false,
      });
      expect(embed.data.timestamp).toBeTruthy();
    });

    it('should handle empty goals and keywords', () => {
      const embed = pomodoroFormatter.createCoachingConfigEmbed(
        mockUser,
        'neutral',
        [],
        []
      );

      expect(embed.data.fields?.[0]?.value).toBe('Neutral');
      expect(embed.data.fields?.[1]?.value).toBe('No goals set');
      expect(embed.data.fields?.[2]?.value).toBe('Default keywords');
    });

    it('should handle different coaching styles', () => {
      const encouragingEmbed = pomodoroFormatter.createCoachingConfigEmbed(mockUser, 'encouraging', [], []);
      expect(encouragingEmbed.data.fields?.[0]?.value).toBe('Encouraging');

      const neutralEmbed = pomodoroFormatter.createCoachingConfigEmbed(mockUser, 'neutral', [], []);
      expect(neutralEmbed.data.fields?.[0]?.value).toBe('Neutral');

      const challengingEmbed = pomodoroFormatter.createCoachingConfigEmbed(mockUser, 'challenging', [], []);
      expect(challengingEmbed.data.fields?.[0]?.value).toBe('Challenging');
    });
  });

  describe('color and title mapping through embeds', () => {
    it('should use correct colors for different coaching types', () => {
      const startMessage: CoachingMessage = { type: 'start', content: 'test', timestamp: new Date() };
      const startEmbed = pomodoroFormatter.createCoachingEmbed(mockUser, startMessage);
      expect(startEmbed.data.color).toBe(0x2ECC71);

      const breakMessage: CoachingMessage = { type: 'break', content: 'test', timestamp: new Date() };
      const breakEmbed = pomodoroFormatter.createCoachingEmbed(mockUser, breakMessage);
      expect(breakEmbed.data.color).toBe(0x3498DB);

      const completionMessage: CoachingMessage = { type: 'completion', content: 'test', timestamp: new Date() };
      const completionEmbed = pomodoroFormatter.createCoachingEmbed(mockUser, completionMessage);
      expect(completionEmbed.data.color).toBe(0xF39C12);

      const motivationMessage: CoachingMessage = { type: 'motivation', content: 'test', timestamp: new Date() };
      const motivationEmbed = pomodoroFormatter.createCoachingEmbed(mockUser, motivationMessage);
      expect(motivationEmbed.data.color).toBe(0xE74C3C);

      const reflectionMessage: CoachingMessage = { type: 'reflection', content: 'test', timestamp: new Date() };
      const reflectionEmbed = pomodoroFormatter.createCoachingEmbed(mockUser, reflectionMessage);
      expect(reflectionEmbed.data.color).toBe(0x9B59B6);
    });

    it('should use correct titles for different coaching types', () => {
      const types = ['start', 'break', 'completion', 'motivation', 'reflection'] as const;
      const expectedTitles = ['🚀 Focus Coaching', '🌊 Break Guidance', '🎉 Session Complete', '💪 Motivation Boost', '🤔 Reflection Time'];
      
      types.forEach((type, index) => {
        const message: CoachingMessage = { type, content: 'test', timestamp: new Date() };
        const embed = pomodoroFormatter.createCoachingEmbed(mockUser, message);
        expect(embed.data.title).toBe(expectedTitles[index]);
      });
    });
  });

  describe('edge cases', () => {
    it('should handle very long coaching messages', () => {
      const longMessage: CoachingMessage = {
        type: 'motivation',
        content: 'This is a very long coaching message that should still be displayed properly in the embed. '.repeat(10),
        timestamp: new Date(),
      };

      const embed = pomodoroFormatter.createCoachingEmbed(mockUser, longMessage);

      expect(embed.data.description).toBeTruthy();
      expect(embed.data.title).toBe('💪 Motivation Boost');
    });

    it('should handle empty coaching message content', () => {
      const emptyMessage: CoachingMessage = {
        type: 'start',
        content: '',
        timestamp: new Date(),
      };

      const embed = pomodoroFormatter.createCoachingEmbed(mockUser, emptyMessage);

      expect(embed.data.description).toBe('No coaching message available');
      expect(embed.data.title).toBe('🚀 Focus Coaching');
    });

    it('should handle special characters in content', () => {
      const specialMessage: CoachingMessage = {
        type: 'reflection',
        content: 'How do you feel about today\'s progress? 🤔💭 What would you do differently?',
        timestamp: new Date(),
      };

      const embed = pomodoroFormatter.createCoachingEmbed(mockUser, specialMessage);

      expect(embed.data.description).toContain('🤔💭');
      expect(embed.data.description).toContain('\'s');
    });
  });
});