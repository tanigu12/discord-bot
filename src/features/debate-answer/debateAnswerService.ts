import { EnglishPhraseService } from '../english-phrases';

export interface DebateAnswer {
  question: string;
  opinion: string;
  strongReason: string;
  acknowledgeOtherSide: string;
  conclusion: string;
}

export class DebateAnswerService {
  private englishPhraseService: EnglishPhraseService;

  // Model answers for debate questions
  private readonly modelAnswers: Record<string, Omit<DebateAnswer, 'question'>> = {
    'Do you think remote work will remain the standard in the future, or will most companies return to office-based work?': {
      opinion: 'I think remote work will continue to be a major part of the workplace, but it will not completely replace offices.',
      strongReason: 'Many companies have seen that remote work increases productivity and reduces costs, while employees enjoy better work-life balance.',
      acknowledgeOtherSide: 'However, collaboration and creativity are often easier face-to-face, and some jobs require physical presence.',
      conclusion: 'Therefore, a hybrid model will become the standard, because it offers the best of both worlds.'
    },

    'Should governments regulate social media platforms more strictly to prevent misinformation?': {
      opinion: 'I believe governments should implement some regulation, but it needs to be carefully balanced.',
      strongReason: 'Misinformation can cause real harm to society, affecting public health decisions and democratic processes.',
      acknowledgeOtherSide: 'However, excessive regulation could limit free speech and give governments too much control over information.',
      conclusion: 'The best approach would be requiring transparency in algorithms and fact-checking, while protecting fundamental freedoms.'
    },

    'Do you believe space exploration is worth the huge financial investment, or should the money be used for solving problems on Earth?': {
      opinion: 'I think space exploration is worth the investment, though we must also address earthly problems.',
      strongReason: 'Space technology has led to countless innovations that benefit life on Earth, from GPS to medical devices.',
      acknowledgeOtherSide: 'However, we do have pressing issues like poverty and climate change that need immediate attention.',
      conclusion: 'We should pursue both goals simultaneously, as space research often provides solutions to earthly challenges.'
    },

    'Will renewable energy fully replace fossil fuels within the next 50 years?': {
      opinion: 'I believe renewable energy will largely replace fossil fuels, but complete replacement may take longer.',
      strongReason: 'Technology costs are dropping rapidly, and many countries are committing to carbon neutrality goals.',
      acknowledgeOtherSide: 'However, some industries like aviation and shipping still face technical challenges with current renewable alternatives.',
      conclusion: 'We will likely achieve 80-90% renewable energy in 50 years, with remaining fossil fuel use in specialized applications.'
    },

    'Do you think universal basic income (UBI) is a realistic solution to automation and job loss?': {
      opinion: 'I think UBI could be part of the solution, but it is not a complete answer by itself.',
      strongReason: 'UBI would provide security for people during career transitions and allow them to pursue education or entrepreneurship.',
      acknowledgeOtherSide: 'However, the costs would be enormous, and it might reduce incentives to work or develop new skills.',
      conclusion: 'A combination of UBI, job retraining programs, and new job creation would be more effective than UBI alone.'
    },

    'Should companies prioritize employee well-being over maximizing profits?': {
      opinion: 'I believe companies should prioritize employee well-being, as it ultimately benefits profits too.',
      strongReason: 'Happy and healthy employees are more productive, creative, and loyal, leading to better long-term performance.',
      acknowledgeOtherSide: 'However, companies have responsibilities to shareholders and need profits to survive and grow.',
      conclusion: 'The best approach recognizes that employee well-being and profitability are connected, not competing goals.'
    },

    'Do you think globalization has done more good or more harm to local cultures?': {
      opinion: 'I think globalization has brought both benefits and challenges to local cultures.',
      strongReason: 'It has enabled cultural exchange, spread knowledge and technology, and connected people across the world.',
      acknowledgeOtherSide: 'However, it has also led to the loss of some traditional practices and languages as global culture dominates.',
      conclusion: 'The key is finding ways to embrace global connections while preserving and celebrating local cultural diversity.'
    },

    'Will human creativity always remain unique, or could AI eventually surpass us in art, literature, and music?': {
      opinion: 'I believe human creativity will remain unique, even as AI becomes more sophisticated.',
      strongReason: 'Human creativity comes from personal experiences, emotions, and cultural context that AI cannot truly understand.',
      acknowledgeOtherSide: 'However, AI is already creating impressive art and music, and it may become indistinguishable from human work.',
      conclusion: 'AI will become a powerful creative tool, but human creativity will remain valuable for its authenticity and meaning.'
    },

    'Should higher education be free for everyone, or should students pay to ensure value and responsibility?': {
      opinion: 'I think higher education should be more affordable, but completely free may not be the best solution.',
      strongReason: 'Education is a public good that benefits society, and financial barriers prevent many talented people from accessing it.',
      acknowledgeOtherSide: 'However, when education is completely free, students might not value it as much, and taxpayers bear a heavy burden.',
      conclusion: 'A system with income-based repayment and generous need-based aid would be more sustainable and fair.'
    },

    'Do you think climate change can still be reversed, or is it too late to prevent serious damage?': {
      opinion: 'I believe we can still limit climate change, but we need immediate and dramatic action.',
      strongReason: 'We have the technology and knowledge needed to reduce emissions significantly within the next decade.',
      acknowledgeOtherSide: 'However, some effects are already irreversible, and global cooperation has been slow and insufficient.',
      conclusion: 'While we cannot reverse all damage, we can still prevent the worst-case scenarios if we act now.'
    },

    'Do you think it is better to live in a big city or in the countryside for a happy life?': {
      opinion: 'I think both have advantages, and the best choice depends on individual priorities and life stage.',
      strongReason: 'Cities offer career opportunities, cultural diversity, and convenience, while countryside provides peace, nature, and community.',
      acknowledgeOtherSide: 'However, cities can be stressful and expensive, while rural areas may lack opportunities and services.',
      conclusion: 'The happiest people are those who choose the environment that matches their personality and current needs.'
    },

    'Should children start learning programming at the same level of importance as mathematics?': {
      opinion: 'I think programming should be taught in schools, but perhaps not at exactly the same level as mathematics.',
      strongReason: 'Programming develops logical thinking and problem-solving skills that are increasingly valuable in many careers.',
      acknowledgeOtherSide: 'However, mathematics is fundamental to many fields and develops abstract reasoning in ways programming cannot.',
      conclusion: 'Schools should offer strong programming education while maintaining mathematics as a core subject for all students.'
    },

    'Do you believe sports stars and entertainers are paid too much compared to doctors and teachers?': {
      opinion: 'I think there is an imbalance, but market forces largely determine these salaries.',
      strongReason: 'Teachers and doctors provide essential services to society and often require years of education and training.',
      acknowledgeOtherSide: 'However, entertainers and athletes generate enormous revenue and have very short peak earning periods.',
      conclusion: 'Rather than limiting entertainment salaries, we should focus on increasing support and pay for essential professions.'
    },

    'Should governments ban meat consumption in order to fight climate change?': {
      opinion: 'I do not think governments should ban meat consumption, but they should encourage reduction.',
      strongReason: 'Personal choice in diet is a fundamental freedom, and bans often create resistance rather than cooperation.',
      acknowledgeOtherSide: 'However, livestock farming does contribute significantly to greenhouse gas emissions and environmental damage.',
      conclusion: 'Governments should use education, incentives, and investment in alternatives to encourage more sustainable eating habits.'
    },

    'Is it better to specialize deeply in one skill, or to become a generalist with many skills?': {
      opinion: 'I think the best approach is to have one deep specialization plus several complementary skills.',
      strongReason: 'Deep expertise makes you valuable and irreplaceable, while diverse skills help you adapt to changing markets.',
      acknowledgeOtherSide: 'However, pure generalists may lack the depth needed for complex problems, while pure specialists may become obsolete.',
      conclusion: 'The most successful people combine deep knowledge in one area with broad skills that enhance their primary expertise.'
    },

    'Do you think the world will ever achieve lasting global peace?': {
      opinion: 'I am optimistic that we can reduce conflicts significantly, though perfect peace may be unrealistic.',
      strongReason: 'History shows decreasing violence over time, and international institutions have prevented many potential wars.',
      acknowledgeOtherSide: 'However, human nature includes competition and tribalism, and resources will always create some tensions.',
      conclusion: 'We should work toward peace while accepting that managing conflict peacefully is more realistic than eliminating it entirely.'
    },

    'Should people have the right to choose euthanasia if they are suffering from a serious illness?': {
      opinion: 'I believe people should have this right, but with careful safeguards and professional support.',
      strongReason: 'Individuals should have control over their own lives and deaths, especially when facing unbearable suffering.',
      acknowledgeOtherSide: 'However, there are concerns about pressure on vulnerable people and the possibility of recovery or new treatments.',
      conclusion: 'Strict guidelines involving multiple doctors and waiting periods can protect against abuse while respecting personal autonomy.'
    },

    'Do you think online friendships can be as strong and meaningful as in-person friendships?': {
      opinion: 'I believe online friendships can be genuine and meaningful, though they have different characteristics.',
      strongReason: 'People can share deep thoughts and emotions online, and some find it easier to be authentic in digital spaces.',
      acknowledgeOtherSide: 'However, physical presence provides nonverbal communication and shared experiences that online interaction cannot fully replace.',
      conclusion: 'Online friendships are valuable and real, but the strongest relationships often benefit from both digital and in-person connection.'
    },

    'Should space tourism be allowed, even though it may harm the environment?': {
      opinion: 'I think space tourism should be allowed but regulated to minimize environmental impact.',
      strongReason: 'Space tourism drives innovation and makes space technology more affordable, which benefits scientific research.',
      acknowledgeOtherSide: 'However, the environmental cost per passenger is currently very high, and it mainly serves wealthy individuals.',
      conclusion: 'We should allow space tourism while requiring companies to invest in cleaner technologies and offset their emissions.'
    },

    'Do you think future generations will value physical books, or will digital content completely replace them?': {
      opinion: 'I believe physical books will survive, but they will become more specialized and less common.',
      strongReason: 'Books offer a tactile experience and focused reading without digital distractions that many people still prefer.',
      acknowledgeOtherSide: 'However, digital content is more convenient, environmentally friendly, and accessible to people with disabilities.',
      conclusion: 'Physical books will likely become luxury items or collectibles, while digital formats handle most everyday reading needs.'
    }
  };

  constructor() {
    this.englishPhraseService = new EnglishPhraseService();
  }

  /**
   * Get a random debate question with its model answer
   */
  getRandomDebateAnswer(): DebateAnswer {
    const debateQuestions = this.englishPhraseService.getRandomDebateQuestions(1);
    
    if (debateQuestions.length === 0) {
      throw new Error('No debate questions available');
    }

    const question = debateQuestions[0].phrase;
    const modelAnswer = this.modelAnswers[question];

    if (!modelAnswer) {
      throw new Error(`No model answer found for question: ${question}`);
    }

    return {
      question,
      ...modelAnswer
    };
  }

  /**
   * Get model answer for a specific debate question
   */
  getDebateAnswerForQuestion(questionText: string): DebateAnswer | null {
    const modelAnswer = this.modelAnswers[questionText];
    
    if (!modelAnswer) {
      return null;
    }

    return {
      question: questionText,
      ...modelAnswer
    };
  }

  /**
   * Get all available debate questions
   */
  getAllDebateQuestions(): string[] {
    return Object.keys(this.modelAnswers);
  }
}