#!/usr/bin/env tsx

/**
 * Translation API Test Script
 * 
 * This script tests the Google Translation API integration
 * Usage: npx tsx scripts/test-translation.ts
 * 
 * Requires GOOGLE_API_KEY environment variable to be set
 */

import dotenv from 'dotenv';
import { GoogleTranslationService } from '../src/features/translation/googleTranslationService';

// Load environment variables
dotenv.config();

async function testTranslationAPI() {
  console.log('🔧 Google Translation API Test Script');
  console.log('=====================================\n');

  // Check API key availability
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.log('❌ GOOGLE_API_KEY environment variable is not set');
    console.log('   Please add GOOGLE_API_KEY to your .env file');
    console.log('   Get your API key from: https://console.cloud.google.com/');
    process.exit(1);
  }

  console.log('✅ API key found, testing translation service...\n');

  const service = new GoogleTranslationService();

  try {
    // Test 1: Simple Japanese to English
    console.log('📝 Test 1: Japanese → English');
    const test1Input = 'こんにちは';
    const test1Result = await service.translateToEnglish(test1Input);
    console.log(`   Input:  "${test1Input}"`);
    console.log(`   Output: "${test1Result}"`);
    console.log('   ✅ Success\n');

    // Test 2: Simple English to Japanese  
    console.log('📝 Test 2: English → Japanese');
    const test2Input = 'Hello';
    const test2Result = await service.translateToJapanese(test2Input);
    console.log(`   Input:  "${test2Input}"`);
    console.log(`   Output: "${test2Result}"`);
    console.log('   ✅ Success\n');

    // Test 3: Complex Japanese sentence
    console.log('📝 Test 3: Complex Japanese sentence');
    const test3Input = '今日は学校に行きました';
    const test3Result = await service.translateToEnglish(test3Input);
    console.log(`   Input:  "${test3Input}"`);
    console.log(`   Output: "${test3Result}"`);
    console.log('   ✅ Success\n');

    // Test 4: Complex English sentence
    console.log('📝 Test 4: Complex English sentence');
    const test4Input = 'I went to school today';
    const test4Result = await service.translateToJapanese(test4Input);
    console.log(`   Input:  "${test4Input}"`);
    console.log(`   Output: "${test4Result}"`);
    console.log('   ✅ Success\n');

    // Test 5: Special characters
    console.log('📝 Test 5: Special characters and punctuation');
    const test5Input = 'これは素晴らしいです！';
    const test5Result = await service.translateToEnglish(test5Input);
    console.log(`   Input:  "${test5Input}"`);
    console.log(`   Output: "${test5Result}"`);
    console.log('   ✅ Success\n');

    console.log('🎉 All tests passed! Google Translation API is working properly.');
    console.log('\n📊 Summary:');
    console.log('   • Japanese to English: ✅ Working');
    console.log('   • English to Japanese: ✅ Working');
    console.log('   • Complex sentences: ✅ Working');
    console.log('   • Special characters: ✅ Working');

  } catch (error) {
    console.error('❌ Translation test failed:');
    console.error(`   Error: ${error.message}`);
    
    if (error.message.includes('API_KEY')) {
      console.error('   💡 Check your Google Cloud Console:');
      console.error('   - Make sure Translation API is enabled');
      console.error('   - Verify your API key is valid');
      console.error('   - Check if billing is enabled');
    }
    
    process.exit(1);
  }
}

// Run the test
testTranslationAPI().catch(console.error);