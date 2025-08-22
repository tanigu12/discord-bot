# Analysis Service Refactor Implementation Plan

## Overview
The current `analysisService.ts` needs to be refactored to follow the package-by-feature pattern and properly separate concerns between general analysis and Larry's AI partner context.

## Current State Analysis

### Issues Identified:
1. **Code Comments**: Comments mention "Larry consult" but the service doesn't actually use Larry's personality/context
2. **Architecture Violation**: Current `analysisService.ts` violates package-by-feature pattern by being in root features directory
3. **Missing Larry's Context**: `handleBotMention` should use Larry's AI partner context but currently uses generic analysis service

### Current Structure:
- `src/features/analysisService.ts` - Generic analysis service (650+ lines)
- `src/features/bot-mention/botHandler.ts` - Uses generic analysis service
- `src/features/ai-partner/personality.ts` - Larry's personality config (not integrated)

## Implementation Plan

### Step 1: Create Analysis Feature Package
Move current `analysisService.ts` to proper package-by-feature structure:
- Create `src/features/analysis/` directory
- Move `analysisService.ts` → `src/features/analysis/analysisService.ts`
- Create `src/features/analysis/types.ts` for interfaces
- Update imports across codebase

### Step 2: Create Larry AI Partner Service
Create new service that incorporates Larry's personality:
- Create `src/features/ai-partner/larryAIService.ts`
- Integrate with existing `personality.ts` config
- Implement Larry-specific system prompts and context handling
- Focus on English tutoring, grammar correction, and supportive responses

### Step 3: Update Bot Mention Handler
Modify `handleBotMention` to use Larry's AI service:
- Import and use `larryAIService` instead of generic `analysisService`
- Apply Larry's personality traits to responses
- Use Larry-specific context collection and response generation

### Step 4: Fix Code Comments and Documentation
- Remove misleading "Larry consult" comments from generic analysis service
- Update comments to accurately reflect each service's purpose
- Add proper documentation for Larry's AI partner functionality

## Files to Modify

### New Files:
- `src/features/analysis/analysisService.ts` (moved from current location)
- `src/features/analysis/types.ts` (extracted interfaces)
- `src/features/ai-partner/larryAIService.ts` (new Larry-specific service)
- `src/features/ai-partner/types.ts` (Larry-specific interfaces)

### Modified Files:
- `src/features/bot-mention/botHandler.ts` - Switch to Larry's AI service
- `src/index.ts` - Update imports
- Any other files importing the old analysisService path

## Testing Approach

### Unit Tests to Write:
- `src/features/analysis/__tests__/analysisService.test.ts` - Generic analysis functionality
- `src/features/ai-partner/__tests__/larryAIService.test.ts` - Larry-specific functionality

### Integration Tests:
- Test bot mention handling uses Larry's personality
- Test generic analysis still works for search commands
- Verify proper context collection for both services

### Manual Testing:
1. Bot mentions should respond with Larry's personality
2. Search commands should use generic analysis
3. All existing functionality should remain intact

## Potential Risks

### Backward Compatibility:
- Import paths will change - need to update all references
- Ensure no breaking changes to existing APIs

### Performance Implications:
- Two separate services may increase memory usage
- Monitor response times for both services

### Edge Cases:
- Ensure proper fallback handling if Larry's service fails
- Maintain existing error handling patterns

## Success Criteria

1. **Code Organization**: Analysis service follows package-by-feature pattern
2. **Functionality Separation**: Clear distinction between generic analysis and Larry's AI
3. **Accurate Comments**: Code comments reflect actual functionality
4. **Larry Integration**: Bot mentions use Larry's personality and context
5. **No Regressions**: All existing functionality works as before
6. **Test Coverage**: Both services have comprehensive unit tests