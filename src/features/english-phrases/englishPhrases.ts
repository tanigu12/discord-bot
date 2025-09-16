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

  debate: [
    'Do you think remote work will remain the standard in the future, or will most companies return to office-based work? - Future of work discussion',
    'Should governments regulate social media platforms more strictly to prevent misinformation? - Social media regulation debate',
    'Do you believe space exploration is worth the huge financial investment, or should the money be used for solving problems on Earth? - Space exploration priorities',
    'Will renewable energy fully replace fossil fuels within the next 50 years? - Energy transition debate',
    'Do you think universal basic income (UBI) is a realistic solution to automation and job loss? - Economic policy discussion',
    'Should companies prioritize employee well-being over maximizing profits? - Corporate responsibility debate',
    'Do you think globalization has done more good or more harm to local cultures? - Globalization impact discussion',
    'Will human creativity always remain unique, or could AI eventually surpass us in art, literature, and music? - AI vs human creativity',
    'Should higher education be free for everyone, or should students pay to ensure value and responsibility? - Education funding debate',
    'Do you think climate change can still be reversed, or is it too late to prevent serious damage? - Climate change discussion',
    'Do you think it is better to live in a big city or in the countryside for a happy life? - Lifestyle choice debate',
    'Should children start learning programming at the same level of importance as mathematics? - Education curriculum discussion',
    'Do you believe sports stars and entertainers are paid too much compared to doctors and teachers? - Salary inequality debate',
    'Should governments ban meat consumption in order to fight climate change? - Environmental policy discussion',
    'Is it better to specialize deeply in one skill, or to become a generalist with many skills? - Career development debate',
    'Do you think the world will ever achieve lasting global peace? - World peace discussion',
    'Should people have the right to choose euthanasia if they are suffering from a serious illness? - Medical ethics debate',
    'Do you think online friendships can be as strong and meaningful as in-person friendships? - Digital relationships discussion',
    'Should space tourism be allowed, even though it may harm the environment? - Space tourism ethics debate',
    'Do you think future generations will value physical books, or will digital content completely replace them? - Digital vs physical media',
    'Do you think traditional cultures should adapt to globalization, or should they resist to preserve their uniqueness? - Culture vs globalization',
    'Should voting be mandatory in democratic countries? - Mandatory voting debate',
    'Do you believe social media creates more division in society, or does it connect people more strongly? - Social media impact discussion',
    'Should governments provide free public transportation to reduce traffic and pollution? - Public transport policy',
    'Do you think income inequality will always exist, or can it be solved? - Economic inequality discussion',
    'Should people be allowed to use genetic engineering to design "perfect" babies? - Genetic engineering ethics',
    'Do you think robots will one day develop emotions like humans? - AI consciousness debate',
    'Is it safe to rely on self-driving cars, or will human drivers always be necessary? - Autonomous vehicle safety',
    'Should governments tax companies that use AI to replace human workers? - AI automation policy',
    'Do you think brain–computer interfaces will change what it means to be human? - Human-AI integration ethics',
    'Should wealthy countries be more responsible for fighting climate change than developing countries? - Climate responsibility debate',
    'Do you think nuclear power is necessary to fight global warming, or is it too dangerous? - Nuclear energy discussion',
    'Should people be forced to limit how many flights they take each year to protect the environment? - Travel restrictions debate',
    'Do you think future cities will be mostly vertical (skyscrapers) or spread horizontally (suburbs)? - Urban development discussion',
    'Should governments ban fast fashion because of its environmental impact? - Fashion industry regulation',
    'Do you think grades in school measure real intelligence, or do they only test memorization? - Education assessment debate',
    'Should schools replace traditional exams with project-based assessments? - Alternative assessment methods',
    'Do you think learning foreign languages will still be important in the future when translation AI is everywhere? - Language learning relevance',
    'Should universities focus more on teaching practical job skills instead of theory? - Higher education focus',
    'Do you think creativity can be taught, or is it only a natural talent? - Nature vs nurture creativity',
    'Should companies shorten the workweek to four days for better work-life balance? - Four-day workweek debate',
    'Do you think job security is more important than career growth? - Job security vs growth',
    'Should salaries be made public to promote fairness in the workplace? - Salary transparency debate',
    'Do you think freelancing will eventually replace traditional full-time jobs? - Future of employment',
    'Should retirement age be lowered since life expectancy is increasing? - Retirement age discussion',
    'Should human cloning be allowed if it helps save lives? - Human cloning ethics',
    'Do you think privacy is more important than national security? - Privacy vs security debate',
    'Should scientists be free to experiment with AI without government restrictions? - AI research regulation',
    'Do you think technology will ever solve the problem of death (immortality)? - Technology and mortality',
    'Should medical data be shared globally to speed up scientific progress? - Medical data sharing ethics',
    'Do you think marriage will still be important in the future, or will it lose relevance? - Future of marriage',
    'Should parents control how much technology their children use? - Children and technology limits',
    'Do you think people are happier today than in the past? - Modern happiness vs past',
    'Should wealthy people have the right to buy luxury goods while others struggle to survive? - Wealth inequality ethics',
    'Do you think traveling is the best way to learn about the world? - Travel vs other learning methods',
    'Do you believe free will truly exists, or are all our choices influenced by outside factors? - Free will vs determinism',
    'Should people always tell the truth, even if it hurts someone\'s feelings? - Truth vs kindness',
    'Do you think human beings are naturally good or naturally selfish? - Human nature debate',
    'Should happiness be considered more important than success? - Happiness vs success priorities',
    'Do you think there is such a thing as universal morality, or is it always relative to culture? - Universal vs relative morality',
  ],
};

type PhraseCategory = keyof typeof ENGLISH_PHRASES;

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
   * Get random debate questions specifically
   */
  getRandomDebateQuestions(count: number = 2): EnglishPhrase[] {
    const debateQuestions = ENGLISH_PHRASES.debate.map(phraseString => 
      this.parsePhrase(phraseString, 'debate')
    );
    const shuffled = [...debateQuestions].sort(() => 0.5 - Math.random());
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
}
