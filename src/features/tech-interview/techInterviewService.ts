import { TechInterviewAnswer } from './types';
import { basicQuestions } from './questions/basicQuestions';
import { computerScienceFundamentals } from './questions/computerScienceFundamentals';
import { softwareEngineeringQuestions } from './questions/softwareEngineering';
import { systemDesignQuestions } from './questions/systemDesign';
import { cloudSecurityQuestions } from './questions/cloudSecurity';
import { algorithmQuestions } from './questions/algorithmQuestions';
import { popularSystemDesignQuestions } from './questions/popularSystemDesign';

export class TechInterviewService {
  private readonly questions: TechInterviewAnswer[] = [
    ...basicQuestions,
    ...computerScienceFundamentals,
    ...softwareEngineeringQuestions,
    ...systemDesignQuestions,
    ...cloudSecurityQuestions,
    ...algorithmQuestions,
    ...popularSystemDesignQuestions,
  ];

  getRandomTechInterviewAnswer(): TechInterviewAnswer {
    const randomIndex = Math.floor(Math.random() * this.questions.length);
    return this.questions[randomIndex];
  }

  getAllQuestions(): TechInterviewAnswer[] {
    return [...this.questions];
  }

  getQuestionCount(): number {
    return this.questions.length;
  }
}

export const techInterviewService = new TechInterviewService();
