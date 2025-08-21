# Search Result Aggregation Implementation Plan

## Overview
Update the search command to aggregate all search results into a single text file attachment with line folding at 100 characters, instead of displaying results directly in Discord messages.

## Current State Analysis
- Search command exists and returns results in Discord messages/threads
- Need to identify current search implementation location
- Results likely displayed as separate messages or embeds
- No current file attachment functionality for search results

## Implementation Plan
1. Locate current search command implementation
2. Find similar file attachment patterns in other features
3. Create text aggregation utility with 100-character line folding
4. Modify search command to:
   - Collect all search results into memory
   - Format results with proper line breaks
   - Create text file attachment
   - Send single message with attachment instead of multiple messages

## Files to Modify
- Search command file (to be identified)
- Potentially create utility for text formatting with line folding

## Testing Approach
- Test line folding logic with unit tests
- Manual testing of search command with various result sizes
- Verify file attachment works correctly in Discord

## Potential Risks
- Large search results might create very large files
- Discord file size limits (8MB for non-Nitro users)
- Need to handle empty search results gracefully