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
    },

    // Society & Culture
    'Do you think traditional cultures should adapt to globalization, or should they resist to preserve their uniqueness?': {
      opinion: 'I believe traditional cultures should selectively adapt while preserving their core values and unique practices.',
      strongReason: 'This approach allows cultures to benefit from global knowledge and technology while maintaining their identity and heritage.',
      acknowledgeOtherSide: 'However, complete resistance could lead to isolation and missed opportunities, while total adaptation might erase cultural diversity.',
      conclusion: 'The key is finding balance—embracing beneficial changes while protecting essential cultural elements that define a community.'
    },

    'Should voting be mandatory in democratic countries?': {
      opinion: 'I think voting should remain voluntary, but governments should make it as easy and accessible as possible.',
      strongReason: 'Mandatory voting could force uninformed decisions and violate personal freedom, while voluntary systems respect individual choice.',
      acknowledgeOtherSide: 'However, mandatory voting does increase participation and can make election results more representative of the entire population.',
      conclusion: 'Instead of forcing people to vote, we should focus on civic education and removing barriers to participation.'
    },

    'Do you believe social media creates more division in society, or does it connect people more strongly?': {
      opinion: 'I think social media has the potential for both, but currently it creates more division than genuine connection.',
      strongReason: 'Algorithms tend to show us information that confirms our existing beliefs, creating echo chambers and polarization.',
      acknowledgeOtherSide: 'However, social media does help people maintain relationships across distances and find communities with shared interests.',
      conclusion: 'The key is reforming how social media algorithms work to promote understanding rather than engagement through conflict.'
    },

    'Should governments provide free public transportation to reduce traffic and pollution?': {
      opinion: 'I believe governments should provide free or heavily subsidized public transportation in urban areas.',
      strongReason: 'Free public transport reduces traffic congestion, air pollution, and provides mobility for low-income people who need it most.',
      acknowledgeOtherSide: 'However, the costs are significant, and without user fees, there might be less incentive to maintain efficient services.',
      conclusion: 'The environmental and social benefits justify the cost, especially when funded through carbon taxes or congestion charges.'
    },

    'Do you think income inequality will always exist, or can it be solved?': {
      opinion: 'I believe some income inequality will always exist, but we can significantly reduce extreme inequality.',
      strongReason: 'People have different skills, efforts, and contributions, so perfect equality is unrealistic and might reduce innovation.',
      acknowledgeOtherSide: 'However, current levels of inequality in many countries are excessive and harm social cohesion and economic growth.',
      conclusion: 'We should aim for fair inequality where everyone has genuine opportunities, rather than trying to eliminate all differences.'
    },

    // Technology & Future
    'Should people be allowed to use genetic engineering to design "perfect" babies?': {
      opinion: 'I think genetic engineering should be allowed to prevent serious diseases, but not for enhancement traits.',
      strongReason: 'Using this technology to prevent genetic diseases could reduce immense suffering and improve quality of life.',
      acknowledgeOtherSide: 'However, allowing genetic enhancement could create social inequality and raise questions about what makes us human.',
      conclusion: 'We need strict regulations that permit medical treatments while prohibiting cosmetic or advantage-based modifications.'
    },

    'Do you think robots will one day develop emotions like humans?': {
      opinion: 'I believe robots might simulate emotions convincingly, but they will not experience genuine emotions like humans do.',
      strongReason: 'Emotions in humans arise from complex biological processes and consciousness that we do not fully understand yet.',
      acknowledgeOtherSide: 'However, AI is advancing rapidly, and we might discover that consciousness can emerge from non-biological systems.',
      conclusion: 'Even if robots never truly feel emotions, they may become so sophisticated that the distinction becomes practically irrelevant.'
    },

    'Is it safe to rely on self-driving cars, or will human drivers always be necessary?': {
      opinion: 'I think self-driving cars can become safer than human drivers, but we will need human oversight for complex situations.',
      strongReason: 'Computers do not get tired, drunk, or distracted, and they can react faster than humans in most situations.',
      acknowledgeOtherSide: 'However, humans are better at handling unexpected situations and making ethical decisions in complex scenarios.',
      conclusion: 'A hybrid system where AI handles routine driving while humans remain alert for unusual circumstances would be safest.'
    },

    'Should governments tax companies that use AI to replace human workers?': {
      opinion: 'I believe there should be some form of automation tax to support displaced workers and fund retraining programs.',
      strongReason: 'Companies benefit from AI efficiency while society bears the cost of unemployment and social disruption.',
      acknowledgeOtherSide: 'However, excessive taxes on automation could slow beneficial technological progress and economic growth.',
      conclusion: 'A moderate tax that funds education and social programs would help manage the transition without stopping innovation.'
    },

    'Do you think brain–computer interfaces will change what it means to be human?': {
      opinion: 'I think brain-computer interfaces will enhance human capabilities but will not fundamentally change what makes us human.',
      strongReason: 'These technologies could help disabled people and expand our mental abilities, similar to how glasses or smartphones already enhance us.',
      acknowledgeOtherSide: 'However, direct brain interfaces could blur the line between human thought and artificial processing in unprecedented ways.',
      conclusion: 'As long as we maintain our core consciousness and ability to choose, these interfaces will be tools rather than identity changes.'
    },

    // Environment & Sustainability
    'Should wealthy countries be more responsible for fighting climate change than developing countries?': {
      opinion: 'I believe wealthy countries should take greater responsibility, but all countries need to participate based on their capabilities.',
      strongReason: 'Rich nations have contributed most to historical emissions and have more resources to invest in clean technology.',
      acknowledgeOtherSide: 'However, developing countries are now major emitters too, and climate change affects everyone regardless of responsibility.',
      conclusion: 'A fair approach would have wealthy nations lead on funding and technology while all countries commit to emissions reductions.'
    },

    'Do you think nuclear power is necessary to fight global warming, or is it too dangerous?': {
      opinion: 'I believe nuclear power is necessary as a transitional technology while we develop renewable energy infrastructure.',
      strongReason: 'Nuclear power produces massive amounts of clean energy and can provide reliable baseload power that wind and solar cannot.',
      acknowledgeOtherSide: 'However, nuclear accidents can be catastrophic, and radioactive waste remains dangerous for thousands of years.',
      conclusion: 'Modern nuclear plants are much safer than older designs, and the climate crisis requires us to use all low-carbon options available.'
    },

    'Should people be forced to limit how many flights they take each year to protect the environment?': {
      opinion: 'I do not think flight restrictions should be mandatory, but we should use carbon taxes to make flying more expensive.',
      strongReason: 'Market-based solutions like carbon pricing are more efficient and fair than arbitrary limits on individual behavior.',
      acknowledgeOtherSide: 'However, voluntary measures have not reduced aviation emissions fast enough to meet climate goals.',
      conclusion: 'Higher prices through carbon taxes would reduce unnecessary flights while allowing people to choose what travel is worth the cost.'
    },

    'Do you think future cities will be mostly vertical (skyscrapers) or spread horizontally (suburbs)?': {
      opinion: 'I believe future cities will be primarily vertical, with dense urban cores surrounded by green spaces.',
      strongReason: 'Vertical development is more environmentally sustainable, reduces transportation needs, and preserves land for agriculture and nature.',
      acknowledgeOtherSide: 'However, many people prefer the space and privacy of suburban living and may resist dense urban environments.',
      conclusion: 'Cities will likely offer both options, but environmental pressures will drive more people toward well-designed vertical communities.'
    },

    'Should governments ban fast fashion because of its environmental impact?': {
      opinion: 'I think governments should regulate fast fashion rather than ban it completely, focusing on sustainability standards.',
      strongReason: 'Complete bans could harm low-income consumers who depend on affordable clothing, but regulations could improve industry practices.',
      acknowledgeOtherSide: 'However, fast fashion does cause enormous environmental damage through waste, chemicals, and carbon emissions.',
      conclusion: 'A combination of sustainability requirements, extended producer responsibility, and support for sustainable alternatives would be more effective.'
    },

    // Education & Personal Growth
    'Do you think grades in school measure real intelligence, or do they only test memorization?': {
      opinion: 'I believe traditional grades measure certain types of learning but miss many aspects of real intelligence.',
      strongReason: 'Grades often reward memorization and test-taking skills rather than creativity, critical thinking, or practical problem-solving.',
      acknowledgeOtherSide: 'However, grades do measure important skills like discipline, attention to detail, and the ability to learn and apply information.',
      conclusion: 'We need a more comprehensive assessment system that includes grades but also evaluates creativity, collaboration, and real-world application.'
    },

    'Should schools replace traditional exams with project-based assessments?': {
      opinion: 'I think schools should use a combination of both traditional exams and project-based assessments.',
      strongReason: 'Project-based learning develops practical skills and creativity, while exams test fundamental knowledge and recall ability.',
      acknowledgeOtherSide: 'However, project assessments can be subjective and time-consuming, while exams may not reflect real-world skills.',
      conclusion: 'The best approach would balance both methods, using exams for core knowledge and projects for applying that knowledge creatively.'
    },

    'Do you think learning foreign languages will still be important in the future when translation AI is everywhere?': {
      opinion: 'I believe language learning will remain important, though its focus may shift from basic communication to cultural understanding.',
      strongReason: 'Learning languages develops cognitive flexibility, cultural empathy, and nuanced understanding that AI translation cannot provide.',
      acknowledgeOtherSide: 'However, AI translation is becoming very sophisticated and can handle most practical communication needs effectively.',
      conclusion: 'Languages will still matter for deep cultural connection, creative work, and cognitive development, even if AI handles routine translation.'
    },

    'Should universities focus more on teaching practical job skills instead of theory?': {
      opinion: 'I think universities should maintain a balance between theoretical knowledge and practical skills, but improve their integration.',
      strongReason: 'Theoretical understanding provides the foundation for innovation and adaptability, while practical skills ensure immediate employability.',
      acknowledgeOtherSide: 'However, the job market changes rapidly, and graduates often struggle to apply theoretical knowledge in real workplaces.',
      conclusion: 'Universities should teach theory through practical applications and real-world projects rather than treating them as separate subjects.'
    },

    'Do you think creativity can be taught, or is it only a natural talent?': {
      opinion: 'I believe creativity can definitely be taught and developed, although some people may have natural advantages.',
      strongReason: 'Creative techniques, brainstorming methods, and exposure to diverse ideas can help anyone become more creative and innovative.',
      acknowledgeOtherSide: 'However, some individuals do seem naturally more imaginative and willing to take creative risks than others.',
      conclusion: 'Like any skill, creativity improves with practice and proper instruction, regardless of starting ability level.'
    },

    // Work & Economy
    'Should companies shorten the workweek to four days for better work-life balance?': {
      opinion: 'I think companies should experiment with four-day workweeks, but it depends on the industry and job type.',
      strongReason: 'Studies show that shorter workweeks can increase productivity, reduce burnout, and improve employee satisfaction and mental health.',
      acknowledgeOtherSide: 'However, some industries require constant coverage, and reducing hours might increase costs or reduce customer service quality.',
      conclusion: 'A flexible approach where suitable companies trial four-day weeks could prove the concept before wider adoption.'
    },

    'Do you think job security is more important than career growth?': {
      opinion: 'I believe the importance depends on individual circumstances, but career growth often leads to better long-term security.',
      strongReason: 'Developing new skills and advancing professionally makes you more valuable and adaptable in a changing job market.',
      acknowledgeOtherSide: 'However, stable employment provides financial security and peace of mind, especially for people with families or debts.',
      conclusion: 'The ideal situation combines both: a secure position that also offers opportunities for professional development and advancement.'
    },

    'Should salaries be made public to promote fairness in the workplace?': {
      opinion: 'I think salary transparency should be implemented gradually, starting with salary ranges rather than exact amounts.',
      strongReason: 'Transparency helps identify and correct pay gaps, ensures fair compensation, and builds trust between employers and employees.',
      acknowledgeOtherSide: 'However, complete salary disclosure might create workplace tension and could discourage high performers or talented recruits.',
      conclusion: 'Publishing salary ranges for each role would promote fairness while maintaining some privacy for individual negotiations.'
    },

    'Do you think freelancing will eventually replace traditional full-time jobs?': {
      opinion: 'I believe freelancing will become much more common, but traditional employment will still exist for many roles.',
      strongReason: 'Technology makes remote collaboration easier, and many people prefer the flexibility and variety that freelancing offers.',
      acknowledgeOtherSide: 'However, full-time employment provides benefits, stability, and team collaboration that many industries and workers still need.',
      conclusion: 'The future will likely be a hybrid economy where people move between freelancing and traditional employment throughout their careers.'
    },

    'Should retirement age be lowered since life expectancy is increasing?': {
      opinion: 'I think retirement age should remain flexible rather than being lowered, despite longer life expectancy.',
      strongReason: 'People are living longer and staying healthier, so they can work longer if they choose, which benefits both individuals and society.',
      acknowledgeOtherSide: 'However, longer life expectancy also means people need more savings for retirement, and some jobs are too physically demanding for older workers.',
      conclusion: 'The best approach is flexible retirement with options to reduce hours or change roles rather than a fixed earlier age.'
    },

    // Science & Ethics
    'Should human cloning be allowed if it helps save lives?': {
      opinion: 'I think therapeutic cloning for medical research should be allowed, but reproductive cloning should remain prohibited.',
      strongReason: 'Cloning techniques could help develop treatments for genetic diseases and provide organs for transplants, potentially saving millions of lives.',
      acknowledgeOtherSide: 'However, human cloning raises serious ethical concerns about identity, exploitation, and what it means to be human.',
      conclusion: 'Strict regulations should permit medical applications while preventing the cloning of whole human beings for reproduction.'
    },

    'Do you think privacy is more important than national security?': {
      opinion: 'I believe both privacy and security are essential, and we need careful balance rather than choosing one over the other.',
      strongReason: 'Privacy protects individual freedom and prevents government abuse, which is fundamental to democratic society.',
      acknowledgeOtherSide: 'However, some security measures are necessary to protect citizens from terrorism, crime, and other serious threats.',
      conclusion: 'The key is having strong oversight, time limits, and transparency to ensure security measures do not become permanent privacy violations.'
    },

    'Should scientists be free to experiment with AI without government restrictions?': {
      opinion: 'I think AI research needs some government oversight, but regulations should focus on safety rather than limiting innovation.',
      strongReason: 'AI development could create technologies that transform society, so public input and safety standards are essential.',
      acknowledgeOtherSide: 'However, excessive regulation could slow beneficial research and give advantages to countries with fewer restrictions.',
      conclusion: 'International cooperation on AI safety standards would be better than national restrictions that could harm competitiveness.'
    },

    'Do you think technology will ever solve the problem of death (immortality)?': {
      opinion: 'I believe technology will significantly extend human lifespan, but true immortality is unlikely and may not be desirable.',
      strongReason: 'Medical advances are already extending life, and technologies like genetic therapy and organ regeneration show great promise.',
      acknowledgeOtherSide: 'However, death is a fundamental part of life cycles, and immortality could create resource problems and social stagnation.',
      conclusion: 'We should focus on extending healthy lifespan and quality of life rather than pursuing complete immortality.'
    },

    'Should medical data be shared globally to speed up scientific progress?': {
      opinion: 'I think medical data should be shared globally, but with strong privacy protections and patient consent.',
      strongReason: 'Sharing data accelerates research into diseases, helps identify patterns across populations, and could save millions of lives.',
      acknowledgeOtherSide: 'However, medical data is highly personal, and sharing it raises concerns about privacy, discrimination, and misuse.',
      conclusion: 'Anonymous data sharing with strict security measures and patient control over their information would maximize benefits while protecting privacy.'
    },

    // Lifestyle & Society
    'Do you think marriage will still be important in the future, or will it lose relevance?': {
      opinion: 'I believe marriage will remain important but will continue evolving to become more flexible and inclusive.',
      strongReason: 'Marriage provides legal protections, emotional commitment, and social recognition that many couples value for stability.',
      acknowledgeOtherSide: 'However, changing social attitudes mean many people prefer cohabitation or other relationship arrangements without formal marriage.',
      conclusion: 'Marriage will likely remain one option among many, with society recognizing various forms of committed relationships.'
    },

    'Should parents control how much technology their children use?': {
      opinion: 'I think parents should guide and limit children\'s technology use, but the approach should vary by age and individual needs.',
      strongReason: 'Children need help developing healthy habits and may not understand the risks of excessive screen time or inappropriate content.',
      acknowledgeOtherSide: 'However, technology is essential for modern life, and overly restrictive parents might leave children unprepared for the digital world.',
      conclusion: 'Parents should teach responsible technology use through education and gradual independence rather than complete control or total freedom.'
    },

    'Do you think people are happier today than in the past?': {
      opinion: 'I think people today have better living conditions but may not be happier due to new types of stress and social problems.',
      strongReason: 'Modern medicine, education, and technology have reduced poverty, disease, and many hardships that previous generations faced.',
      acknowledgeOtherSide: 'However, social media, work pressure, and social isolation create new mental health challenges that didn\'t exist before.',
      conclusion: 'Happiness is complex and individual, but we should use modern advantages while addressing the new problems they create.'
    },

    'Should wealthy people have the right to buy luxury goods while others struggle to survive?': {
      opinion: 'I believe people have the right to spend their money as they choose, but society should also address extreme inequality.',
      strongReason: 'Economic freedom and property rights are important principles, and preventing people from buying legal goods is difficult to justify.',
      acknowledgeOtherSide: 'However, extreme wealth inequality is morally troubling and economically harmful when basic needs go unmet.',
      conclusion: 'Rather than restricting purchases, we should focus on progressive taxation and social programs to reduce inequality at its source.'
    },

    'Do you think traveling is the best way to learn about the world?': {
      opinion: 'I think traveling is one excellent way to learn about the world, but it is not the only or necessarily the best way.',
      strongReason: 'Travel provides direct experience of different cultures, challenges assumptions, and creates personal connections that books cannot replicate.',
      acknowledgeOtherSide: 'However, travel can be expensive and environmentally harmful, and some people learn better through reading, documentaries, or online interactions.',
      conclusion: 'The best approach combines multiple methods: travel when possible, but also read, study, and engage with diverse perspectives locally.'
    },

    // Philosophy & Human Values
    'Do you believe free will truly exists, or are all our choices influenced by outside factors?': {
      opinion: 'I believe we have some degree of free will, even though our choices are heavily influenced by genetics, environment, and experience.',
      strongReason: 'People can make different choices in similar situations, learn from mistakes, and change their behavior through conscious effort.',
      acknowledgeOtherSide: 'However, neuroscience shows that much decision-making happens unconsciously, and our backgrounds strongly shape our choices.',
      conclusion: 'Whether or not free will is completely real, believing in personal responsibility helps people make better choices and improve their lives.'
    },

    'Should people always tell the truth, even if it hurts someone\'s feelings?': {
      opinion: 'I think honesty is generally important, but the way truth is delivered matters as much as the truth itself.',
      strongReason: 'Truth builds trust in relationships and helps people make informed decisions about their lives and circumstances.',
      acknowledgeOtherSide: 'However, harsh truths delivered without care can damage relationships and self-esteem unnecessarily.',
      conclusion: 'The best approach is being honest but also being kind, timing truth appropriately, and focusing on constructive rather than destructive honesty.'
    },

    'Do you think human beings are naturally good or naturally selfish?': {
      opinion: 'I believe humans have natural tendencies toward both cooperation and self-interest, depending on the situation.',
      strongReason: 'Humans evolved in groups and show natural empathy, fairness, and cooperation, especially with family and community members.',
      acknowledgeOtherSide: 'However, people also compete for resources and can be selfish, especially when they feel threatened or stressed.',
      conclusion: 'Our social institutions and culture can encourage either our cooperative or selfish tendencies, so both possibilities exist within us.'
    },

    'Should happiness be considered more important than success?': {
      opinion: 'I think happiness and success should both be valued, but happiness should probably be the higher priority.',
      strongReason: 'Happiness affects mental health, relationships, and overall quality of life, which matter regardless of external achievements.',
      acknowledgeOtherSide: 'However, some forms of success contribute to happiness, and achieving goals can provide deep satisfaction and meaning.',
      conclusion: 'The ideal is finding success that also brings happiness, rather than pursuing achievement at the expense of well-being.'
    },

    'Do you think there is such a thing as universal morality, or is it always relative to culture?': {
      opinion: 'I believe there are some universal moral principles, but their application can vary significantly across cultures.',
      strongReason: 'Basic values like avoiding harm, treating others fairly, and caring for children seem to exist across most cultures and throughout history.',
      acknowledgeOtherSide: 'However, what counts as harm, fairness, or proper care varies greatly between cultures, suggesting significant moral relativity.',
      conclusion: 'Universal moral intuitions may exist, but respectful dialogue between cultures is needed to apply them in our diverse world.'
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