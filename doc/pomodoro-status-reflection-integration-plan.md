# Pomodoro Status Reflection Integration Plan

## Overview
Add automatic AI-generated reflection messages to the `/pomodoro status` command to encourage self-reflection during active pomodoro sessions, similar to how the coaching system works.

## Current State Analysis

### Existing Components:
- **Status Command**: `handleStatus()` in `src/features/commands/pomodoro.ts:342-357`
- **AI Coaching Service**: `AICoachingService` with `buildReflectionPrompt()` method
- **Reflection Type**: Already exists in `CoachingMessage` interface as 'reflection' type
- **Coaching Integration**: Existing coaching callback system for AI message generation

### Current Status Command Behavior:
- Shows current session status (timer, phase, completed pomodoros)  
- Simple embed response with no AI interaction
- No reflection or coaching element

### Available Reflection Features:
- `buildReflectionPrompt()` method with accountability questions
- Questions focus on: reporting progress, barriers, timeline, task lists
- Already integrated with OpenAI service through coaching system

## Implementation Plan

### 1. Modify Status Command
- **File**: `src/features/commands/pomodoro.ts`
- **Function**: `handleStatus()` 
- **Changes**:
  - After displaying status embed, generate reflection message
  - Use existing coaching callback system
  - Only show reflection for active sessions (not paused/completed)

### 2. Add Reflection Generation Logic
- **Location**: Within `handleStatus()` function
- **Approach**:
  - Check if user has active session with coaching enabled
  - Generate reflection message using `pomodoroService.generateCoachingMessage(userId, 'reflection')`
  - Send as follow-up message or in thread if available
  - Handle graceful fallback if AI service fails

### 3. Integration Pattern
- **Follow Existing Pattern**: Similar to coach command implementation
- **Thread Support**: Use existing thread if available, otherwise reply in channel
- **Error Handling**: Graceful degradation if AI service unavailable

## Files to Modify

- `src/features/commands/pomodoro.ts:handleStatus()` - Add reflection generation logic

## Testing Approach

### Unit Tests
- Test reflection message generation in status command
- Test error handling when AI service fails
- Test behavior with and without active sessions
- Test thread vs channel message delivery

### Integration Tests  
- Verify reflection appears after status command
- Test with different session states (active, paused)
- Test thread integration functionality

### Manual Testing
1. Start pomodoro session  
2. Run `/pomodoro status` command
3. Verify status embed displays
4. Verify reflection message appears as follow-up
5. Test in both channel and thread contexts

## Potential Risks

### Performance
- Additional AI API call on every status check
- Consider rate limiting or caching for frequent status checks

### User Experience
- May feel intrusive if reflection appears too frequently
- Consider adding user preference to enable/disable auto-reflection
- Ensure reflection doesn't interfere with quick status checks

### Error Handling
- AI service failures shouldn't break status command
- Graceful degradation required
- Clear error messages if reflection fails

## Implementation Notes

### Existing Architecture
- Coaching system already handles AI message generation
- Thread management already implemented
- Error handling patterns established

### User Flow
1. User runs `/pomodoro status`
2. Status embed displays immediately
3. AI reflection message generated asynchronously  
4. Reflection sent as follow-up (in thread if available)
5. User can engage with reflection or ignore

### Configuration
- Leverage existing coaching profile system
- Respect user's coaching preferences
- No additional configuration needed initially