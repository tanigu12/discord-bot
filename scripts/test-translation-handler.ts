#!/usr/bin/env tsx

/**
 * Translation Handler Integration Test Script
 * 
 * Tests the translation handler with parseTranslationEntry integration
 * Usage: npx tsx scripts/test-translation-handler.ts
 */

import dotenv from 'dotenv';
import { TranslationService } from '../src/features/translation/translationService';
import { googleTranslationService } from '../src/features/translation/googleTranslationService';

// Load environment variables
dotenv.config();

async function testTranslationHandler() {
  console.log('🔧 Translation Handler Integration Test');
  console.log('======================================\n');

  // Check API key
  if (!process.env.GOOGLE_API_KEY) {
    console.log('❌ GOOGLE_API_KEY not found - skipping real translation tests');
    return;
  }

  const translationService = new TranslationService();

  // Test scenarios based on the actual handler logic
  const testCases = [
    {
      name: 'Japanese-only scenario',
      input: '今日は学校に行きました',
      expectedScenario: 'japanese-only',
      expectedDirection: 'JA→EN'
    },
    {
      name: 'English-only scenario', 
      input: 'I went to school today',
      expectedScenario: 'english-only',
      expectedDirection: 'EN→JA'
    },
    {
      name: 'Japanese with [try] scenario',
      input: '今日は学校に行きました\n[try] I went to school today',
      expectedScenario: 'japanese-with-try',
      expectedDirection: 'JA→EN'
    },
    {
      name: 'Mixed language scenario',
      input: 'Hello 世界',
      expectedScenario: 'japanese-with-try', // mixing becomes japanese-with-try without [try]
      expectedDirection: 'JA→EN'
    }
  ];

  console.log('🧪 Testing translation scenarios...\n');

  for (const testCase of testCases) {
    try {
      console.log(`📝 ${testCase.name}`);
      console.log(`   Input: "${testCase.input}"`);

      // Parse the entry using the existing service
      const parsedEntry = translationService.parseTranslationEntry(testCase.input);
      console.log(`   Parsed target: "${parsedEntry.targetSentence}"`);

      // Determine scenario
      const scenario = translationService.determineProcessingScenario(parsedEntry);
      console.log(`   Scenario: ${scenario}`);

      // Verify expected scenario
      if (scenario !== testCase.expectedScenario) {
        console.log(`   ⚠️  Expected "${testCase.expectedScenario}", got "${scenario}"`);
      }

      // Test Google Translation based on scenario
      let translation: string | null = null;
      let direction: string = '';

      if (scenario === 'japanese-only' || scenario === 'japanese-with-try') {
        // Translate Japanese to English
        translation = await googleTranslationService.translateToEnglish(parsedEntry.targetSentence);
        direction = 'JA→EN';
      } else if (scenario === 'english-only') {
        // Translate English to Japanese  
        translation = await googleTranslationService.translateToJapanese(parsedEntry.targetSentence);
        direction = 'EN→JA';
      }

      if (translation) {
        console.log(`   Translation (${direction}): "${translation}"`);
        console.log('   ✅ Success');
      } else {
        console.log('   ℹ️  No translation (scenario not supported)');
      }

      console.log('');

    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      console.log('');
    }
  }

  // Test with questions and try combinations
  console.log('🧪 Testing complex formats...\n');

  const complexTest = `今日は図書館で勉強しました
[try] I studied at the library today
[q] What is the difference between 図書館 and 本屋?`;

  console.log('📝 Complex format test');
  console.log(`   Input: ${complexTest.replace(/\n/g, '\\n')}`);

  const complexParsed = translationService.parseTranslationEntry(complexTest);
  console.log(`   Target sentence: "${complexParsed.targetSentence}"`);
  console.log(`   Try translation: "${complexParsed.tryTranslation}"`);
  console.log(`   Questions: ${complexParsed.questions?.length || 0}`);

  const complexScenario = translationService.determineProcessingScenario(complexParsed);
  console.log(`   Scenario: ${complexScenario}`);

  if (complexScenario === 'japanese-with-try') {
    const complexTranslation = await googleTranslationService.translateToEnglish(complexParsed.targetSentence);
    console.log(`   Google Translation: "${complexTranslation}"`);
    console.log('   ✅ Success');
  }

  console.log('\n🎉 Translation handler integration test completed!');
}

// Run the test
testTranslationHandler().catch(console.error);