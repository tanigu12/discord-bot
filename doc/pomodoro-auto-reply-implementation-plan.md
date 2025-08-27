# Pomodoro Auto-Reply Status Updates Implementation Plan

## Overview
Implement an auto-reply function that sends Pomodoro status updates every 5 minutes when a session is active. This will help users track their progress and provide logic checking functionality.

## Current State Analysis
- PomodoroService exists with timer management and Discord notification callbacks
- Phase completion notifications are already implemented
- Thread-based communication is established for Pomodoro sessions
- No automatic status broadcasting during active sessions

## Requirements
1. **Auto-reply functionality**: Send status updates every 5 minutes during active sessions
2. **Logic checking**: Verify session state and timer accuracy
3. **Status broadcasting**: Include remaining time, phase, and session progress
4. **Non-intrusive**: Send updates to existing thread, not main channel

## Implementation Plan

### 1. Add Interval Timer Management to PomodoroService
- Add `statusIntervals` Map to track 5-minute interval timers per user
- Create `startStatusInterval()` method to begin auto-updates
- Create `clearStatusInterval()` method to stop auto-updates
- Integrate with existing timer lifecycle

### 2. Extend Types for Auto-Status Updates
- Add `AutoStatusUpdate` interface for status broadcast messages
- Update `DiscordNotificationCallback` to handle auto-status updates
- Add configuration option for interval duration (default 5 minutes)

### 3. Implement Status Broadcasting Logic
- Create method to generate status update messages
- Include logic checking (verify timer accuracy, session consistency)
- Format status updates with current progress and diagnostics

### 4. Integrate with Discord Notifications
- Extend existing notification callback system
- Send auto-status updates to thread (if available)
- Handle edge cases (paused sessions, thread unavailable)

## Files to Modify

### Core Service Files
- `src/features/pomodoro/pomodoroService.ts` - Add interval management and auto-status logic
- `src/features/pomodoro/types.ts` - Add new interfaces for auto-status updates

### Formatting and Display
- `src/features/pomodoro/pomodoroFormatter.ts` - Add auto-status embed creation
- `src/features/commands/pomodoro.ts` - Register auto-status callback in start handler

## Testing Approach

### Unit Tests to Write
- `pomodoroService.test.ts` - Test interval management and auto-status generation
- `pomodoroAutoStatus.test.ts` - Test auto-status update logic and formatting

### Integration Testing
- Manual testing with 5-minute intervals (or shorter for testing)
- Verify status accuracy and logic checking
- Test pause/resume behavior with auto-updates

## Logic Checking Features
1. **Timer Accuracy**: Compare calculated remaining time with expected values
2. **Session Consistency**: Verify phase transitions and completion counts
3. **State Validation**: Check for inconsistent pause/active states
4. **Diagnostic Info**: Include technical details for debugging

## Potential Risks
- **Performance**: Multiple interval timers could impact bot performance
- **Spam Prevention**: Ensure updates don't overwhelm Discord channels
- **Edge Cases**: Handle session state changes during status broadcasts
- **Thread Permissions**: Verify bot can send messages to created threads

## Configuration Options
- `autoStatusInterval`: Duration between status updates (default 5 minutes)
- `enableAutoStatus`: Toggle for auto-status functionality (default true)
- `includeLogicChecking`: Include diagnostic information (default true)