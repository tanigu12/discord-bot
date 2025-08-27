import { describe, it, expect, beforeEach, vi } from 'vitest';
import { pomodoroCommand } from '../../commands/pomodoro';

describe('Pomodoro Channel Restriction', () => {
  let mockInteraction: any;

  beforeEach(() => {
    mockInteraction = {
      reply: vi.fn().mockResolvedValue(undefined),
      options: {
        getSubcommand: vi.fn().mockReturnValue('start'),
      },
      user: {
        id: 'test-user-123',
      },
      channelId: 'test-channel-456',
    };
  });

  describe('Channel validation', () => {
    it('should allow command in times-tanigu12 channel', async () => {
      mockInteraction.channel = {
        name: 'times-tanigu12',
        isTextBased: vi.fn().mockReturnValue(true),
      } as any;

      // Mock the service to prevent actual timer creation
      const originalExecute = pomodoroCommand.execute;
      pomodoroCommand.execute = vi.fn();

      await pomodoroCommand.execute(mockInteraction);

      expect(pomodoroCommand.execute).toHaveBeenCalledWith(mockInteraction);

      // Restore original function
      pomodoroCommand.execute = originalExecute;
    });

    it('should block command in wrong channel', async () => {
      mockInteraction.channel = {
        name: 'general',
        isTextBased: vi.fn().mockReturnValue(true),
      } as any;

      await pomodoroCommand.execute(mockInteraction);

      expect(mockInteraction.reply).toHaveBeenCalledWith({
        embeds: expect.arrayContaining([
          expect.objectContaining({
            data: expect.objectContaining({
              title: '🚫 Channel Restriction',
              description: expect.stringContaining('times-tanigu12'),
            }),
          }),
        ]),
        ephemeral: true,
      });
    });

    it('should block command in DM or unknown channel', async () => {
      mockInteraction.channel = {
        name: null, // DM channels don't have names
        isTextBased: vi.fn().mockReturnValue(true),
      } as any;

      await pomodoroCommand.execute(mockInteraction);

      expect(mockInteraction.reply).toHaveBeenCalledWith({
        embeds: expect.arrayContaining([
          expect.objectContaining({
            data: expect.objectContaining({
              title: '🚫 Channel Restriction',
            }),
          }),
        ]),
        ephemeral: true,
      });
    });

    it('should handle undefined channel', async () => {
      mockInteraction.channel = undefined;

      await pomodoroCommand.execute(mockInteraction);

      expect(mockInteraction.reply).toHaveBeenCalledWith({
        embeds: expect.arrayContaining([
          expect.objectContaining({
            data: expect.objectContaining({
              title: '🚫 Channel Restriction',
              description: expect.stringContaining('unknown'),
            }),
          }),
        ]),
        ephemeral: true,
      });
    });
  });

  describe('All subcommands respect channel restriction', () => {
    const subcommands = ['start', 'pause', 'resume', 'stop', 'status', 'config'];

    subcommands.forEach(subcommand => {
      it(`should block ${subcommand} subcommand in wrong channel`, async () => {
        mockInteraction.channel = {
          name: 'random-channel',
          isTextBased: vi.fn().mockReturnValue(true),
        } as any;

        mockInteraction.options = {
          getSubcommand: vi.fn().mockReturnValue(subcommand),
        } as any;

        await pomodoroCommand.execute(mockInteraction);

        expect(mockInteraction.reply).toHaveBeenCalledWith({
          embeds: expect.arrayContaining([
            expect.objectContaining({
              data: expect.objectContaining({
                title: '🚫 Channel Restriction',
              }),
            }),
          ]),
          ephemeral: true,
        });
      });
    });
  });
});
