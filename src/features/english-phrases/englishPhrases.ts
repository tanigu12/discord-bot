// English phrases organized by category for learning
const ENGLISH_PHRASES = {
  business: [
    "Let's touch base on this later - Let's discuss this again later",
    "I'm swamped with work - I'm very busy with work",
    "That's a game changer - That will make a big difference",
    "Let's circle back to this - Let's return to discuss this later",
    "I'm on the same wavelength - I agree/understand completely",
    "Let's think outside the box - Let's be creative and innovative",
    "That's a win-win situation - That benefits everyone involved",
    "I'll keep you in the loop - I'll keep you informed/updated",
    "Let's hit the ground running - Let's start working immediately and energetically",
    "That's cutting-edge technology - That's the most advanced technology available",
  ],

  daily: [
    "It's a piece of cake - It's very easy",
    'Break a leg! - Good luck!',
    'Spill the beans - Tell the secret/truth',
    "It's raining cats and dogs - It's raining heavily",
    "Don't beat around the bush - Be direct and honest",
    'That rings a bell - That sounds familiar',
    "I'm all ears - I'm listening carefully",
    "It's not rocket science - It's not complicated",
    "Better late than never - It's better to do something late than not at all",
    "Time flies when you're having fun - Time passes quickly during enjoyable activities",
  ],

  emotions: [
    "I couldn't agree more - I completely agree",
    "That's debatable - That's questionable/arguable",
    "I'm torn between two options - I can't decide between two choices",
    'I have mixed feelings about it - I have both positive and negative feelings',
    "That's music to my ears - That's exactly what I wanted to hear",
    "I'm over the moon - I'm extremely happy",
    "I'm feeling under the weather - I'm feeling sick",
    "That's the last straw - That's the final thing that makes me angry",
    "I'm walking on air - I'm extremely happy and excited",
    "It's a blessing in disguise - Something bad that turns out to be good",
  ],

  learning: [
    'Knowledge is power - Information and learning give you strength',
    'Practice makes perfect - Doing something repeatedly helps you improve',
    "You learn something new every day - There's always something to learn",
    "It's never too late to learn - You can always start learning at any age",
    'Learning is a lifelong journey - Education continues throughout life',
    'Curiosity killed the cat - Being too curious can get you in trouble',
    'The devil is in the details - Small details are very important',
    "Rome wasn't built in a day - Great things take time to accomplish",
    "Where there's a will, there's a way - If you really want something, you'll find a way",
    'Experience is the best teacher - Learning from doing is most effective',
  ],

  technology: [
    'I need to unplug for a while - I need to disconnect from technology',
    "Let's take this offline - Let's discuss this privately/later",
    'That went viral - That became very popular online quickly',
    "I'm digitally detoxing - I'm avoiding digital devices temporarily",
    "That's user-friendly - That's easy to use",
    "Let's sync up our calendars - Let's coordinate our schedules",
    "I'm working remotely - I'm working from home/outside the office",
    "That's cloud-based - That's stored/running on internet servers",
    "Let's video call - Let's have a meeting using video",
    "I'll send you the link - I'll share the website address with you",
  ],

  motivation: [
    'Every cloud has a silver lining - Every bad situation has something good',
    'When life gives you lemons, make lemonade - Turn bad situations into good ones',
    "Don't give up, keep pushing - Continue trying despite difficulties",
    "You've got this! - You can do it! You're capable!",
    "Hang in there - Keep trying, don't quit",
    'This too shall pass - Bad times are temporary',
    'Believe in yourself - Have confidence in your abilities',
    "Take it one step at a time - Do things gradually, don't rush",
    "You're making great progress - You're improving well",
    'Keep up the good work - Continue doing well',
  ],
};

export type PhraseCategory = keyof typeof ENGLISH_PHRASES;

export interface EnglishPhrase {
  phrase: string;
  meaning: string;
  category: PhraseCategory;
}

export class EnglishPhraseService {
  /**
   * Parse phrase string into phrase and meaning
   */
  private parsePhrase(phraseString: string, category: PhraseCategory): EnglishPhrase {
    const [phrase, meaning] = phraseString.split(' - ');
    return {
      phrase: phrase.trim(),
      meaning: meaning.trim(),
      category,
    };
  }

  /**
   * Get random phrases from all categories
   */
  getRandomPhrases(count: number = 3): EnglishPhrase[] {
    const allPhrases = this.getAllPhrases();
    const shuffled = [...allPhrases].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * Get random phrases from specific categories
   */
  getRandomPhrasesFromCategories(categories: PhraseCategory[], count: number = 3): EnglishPhrase[] {
    const categoryPhrases = categories.flatMap(category =>
      ENGLISH_PHRASES[category].map(phraseString => this.parsePhrase(phraseString, category))
    );

    const shuffled = [...categoryPhrases].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * Get random phrases from a specific category
   */
  getRandomPhrasesFromCategory(category: PhraseCategory, count: number = 3): EnglishPhrase[] {
    const phrases = ENGLISH_PHRASES[category].map(phraseString =>
      this.parsePhrase(phraseString, category)
    );

    const shuffled = [...phrases].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * Get all phrases with their categories
   */
  getAllPhrases(): EnglishPhrase[] {
    return Object.entries(ENGLISH_PHRASES).flatMap(([category, phrases]) =>
      phrases.map(phraseString => this.parsePhrase(phraseString, category as PhraseCategory))
    );
  }

  /**
   * Get available categories
   */
  getCategories(): PhraseCategory[] {
    return Object.keys(ENGLISH_PHRASES) as PhraseCategory[];
  }

  /**
   * Get category display name
   */
  getCategoryDisplayName(category: PhraseCategory): string {
    const displayNames: Record<PhraseCategory, string> = {
      business: '💼 Business/Professional',
      daily: '🗣️ Daily Conversation',
      emotions: '❤️ Expressing Feelings',
      learning: '📚 Academic/Learning',
      technology: '💻 Technology & Modern Life',
      motivation: '🌟 Encouragement & Motivation',
    };

    return displayNames[category];
  }

  /**
   * Format phrase for display
   */
  formatPhrase(phrase: EnglishPhrase): string {
    return `${phrase.phrase} - ${phrase.meaning}`;
  }

  /**
   * Format multiple phrases for display
   */
  formatPhrases(phrases: EnglishPhrase[]): string[] {
    return phrases.map(phrase => this.formatPhrase(phrase));
  }
}
