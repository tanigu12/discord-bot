# Pomodoro Command Implementation Plan

## Overview
Implement a `/pomodoro` slash command that helps users manage their focus sessions using the Pomodoro Technique. The command will provide timer functionality with customizable work/break intervals, session tracking, and Discord thread-based progress updates.

## Current State Analysis
- **Existing commands**: Located in `src/features/commands/` with consistent structure
- **Command pattern**: Each command exports `data` (SlashCommandBuilder) and `execute` function
- **Registration**: Commands are exported from `src/features/commands/index.ts` and registered in main bot files
- **Architecture**: Following "package by feature" pattern established in the codebase

## Requirements
1. **Timer Management**: Start, pause, resume, stop pomodoro sessions
2. **Customizable Intervals**: Default 25min work / 5min break, user configurable
3. **Session Tracking**: Track completed pomodoros and breaks within a session
4. **Thread Integration**: Create Discord threads for session updates and notifications
5. **Persistence**: Maintain timer state across bot restarts (using memory system if available)
6. **User Experience**: Clear status updates, progress indicators, and completion notifications

## Implementation Plan

### Phase 1: Core Pomodoro Service
1. **Create pomodoro feature structure**:
   ```
   src/features/pomodoro/
   ├── pomodoroService.ts      # Core timer logic and state management
   ├── pomodoroFormatter.ts    # Discord embed and message formatting
   ├── types.ts               # TypeScript interfaces and types
   ├── __tests__/             # Unit tests
   └── index.ts               # Feature exports
   ```

2. **Implement core timer functionality**:
   - Timer state management (work/break phases)
   - Configurable intervals (default: 25min work, 5min break, 15min long break)
   - Session tracking (completed pomodoros, current phase)
   - Timer controls (start, pause, resume, stop, status)

### Phase 2: Discord Command Integration
1. **Create command file**: `src/features/commands/pomodoro.ts`
2. **Implement slash command**:
   - Subcommands: `start`, `pause`, `resume`, `stop`, `status`, `config`
   - Optional parameters for custom intervals
   - User-specific timer management

3. **Register command**:
   - Add export to `src/features/commands/index.ts`
   - Ensure command is picked up by bot registration

### Phase 3: Discord Integration Features
1. **Thread management**:
   - Create dedicated thread for pomodoro session
   - Send progress updates to thread
   - Notify on phase transitions (work → break, break → work)

2. **Status formatting**:
   - Rich embeds showing current phase, remaining time
   - Progress bars using Discord formatting
   - Session statistics (completed pomodoros, total time)

### Phase 4: Advanced Features
1. **Persistence** (optional):
   - Integrate with existing memory system if available
   - Restore active timers on bot restart
   
2. **Statistics tracking**:
   - Daily/weekly pomodoro completion tracking
   - Productivity insights

## Files to Create/Modify

### New Files:
- `src/features/pomodoro/index.ts`
- `src/features/pomodoro/types.ts`
- `src/features/pomodoro/pomodoroService.ts`
- `src/features/pomodoro/pomodoroFormatter.ts`
- `src/features/pomodoro/__tests__/pomodoroService.test.ts`
- `src/features/commands/pomodoro.ts`

### Modified Files:
- `src/features/commands/index.ts` - Add pomodoro command export

## Technical Implementation Details

### Timer Architecture
```typescript
interface PomodoroSession {
  userId: string;
  channelId: string;
  threadId?: string;
  phase: 'work' | 'short-break' | 'long-break';
  startTime: Date;
  duration: number; // minutes
  completedPomodoros: number;
  isPaused: boolean;
  pausedAt?: Date;
  config: PomodoroConfig;
}

interface PomodoroConfig {
  workDuration: number;     // default: 25 minutes
  shortBreakDuration: number; // default: 5 minutes
  longBreakDuration: number;  // default: 15 minutes
  longBreakInterval: number;  // default: 4 (every 4th break is long)
}
```

### Command Structure
```typescript
/pomodoro start [work-minutes] [break-minutes]
/pomodoro pause
/pomodoro resume  
/pomodoro stop
/pomodoro status
/pomodoro config [work-minutes] [short-break] [long-break] [long-interval]
```

## Testing Approach

### Unit Tests:
1. **PomodoroService tests**:
   - Timer state transitions
   - Duration calculations
   - Pause/resume functionality
   - Session completion logic

2. **PomodoroFormatter tests**:
   - Embed generation
   - Progress bar formatting
   - Time formatting utilities

### Integration Tests:
1. **Command interaction tests**:
   - Slash command handling
   - Thread creation and management
   - Error scenarios (already active timer, invalid parameters)

### Manual Testing Steps:
1. Start pomodoro with default settings
2. Start pomodoro with custom intervals
3. Test pause/resume functionality
4. Test stop command mid-session
5. Verify thread creation and updates
6. Test multiple concurrent users
7. Test invalid inputs and error handling

## Potential Risks

### Technical Risks:
1. **Timer persistence**: Timers may be lost on bot restart without proper persistence
2. **Memory usage**: Multiple active timers could consume memory
3. **Discord rate limits**: Frequent thread updates might hit API limits
4. **Thread permissions**: Bot needs `Create Public Threads` permission

### User Experience Risks:
1. **Notification spam**: Too frequent updates might annoy users
2. **Thread clutter**: Multiple sessions could create many threads
3. **Timezone handling**: Timer display might confuse users in different timezones

### Mitigation Strategies:
1. **Implement smart batching** for Discord updates (max 1 update per minute)
2. **Add thread cleanup** for completed/abandoned sessions
3. **Use in-memory storage initially**, add persistence later if needed
4. **Clear error messages** for permission and usage issues
5. **Reasonable defaults** and validation for custom intervals

## Success Criteria
- [ ] Users can start, pause, resume, and stop pomodoro sessions
- [ ] Timer accurately tracks work and break phases
- [ ] Discord threads provide clear progress updates
- [ ] Multiple users can run concurrent sessions
- [ ] Command handles errors gracefully
- [ ] All unit tests pass
- [ ] Integration with existing bot architecture
- [ ] Follows established code patterns and conventions