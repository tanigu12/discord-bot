import { TechInterviewAnswer, SystemDesignConcept } from './types';
import { basicQuestions } from './questions/basicQuestions';
import { computerScienceFundamentals } from './questions/computerScienceFundamentals';
import { softwareEngineeringQuestions } from './questions/softwareEngineering';
import { systemDesignConcepts } from './questions/systemDesignConcepts';
import { cloudSecurityQuestions } from './questions/cloudSecurity';
import { algorithmQuestions } from './questions/algorithmQuestions';
import { popularSystemDesignQuestions } from './questions/popularSystemDesign';

export class TechInterviewService {
  private readonly questions: TechInterviewAnswer[] = [
    ...basicQuestions,
    ...computerScienceFundamentals,
    ...softwareEngineeringQuestions,
    ...cloudSecurityQuestions,
    ...algorithmQuestions,
    ...popularSystemDesignQuestions,
  ];

  private readonly systemDesignConcepts: SystemDesignConcept[] = [
    ...systemDesignConcepts,
  ];

  getRandomTechInterviewAnswer(): TechInterviewAnswer {
    const randomIndex = Math.floor(Math.random() * this.questions.length);
    return this.questions[randomIndex];
  }

  getRandomSystemDesignConcept(): SystemDesignConcept {
    const randomIndex = Math.floor(Math.random() * this.systemDesignConcepts.length);
    return this.systemDesignConcepts[randomIndex];
  }

  getAllQuestions(): TechInterviewAnswer[] {
    return [...this.questions];
  }

  getAllSystemDesignConcepts(): SystemDesignConcept[] {
    return [...this.systemDesignConcepts];
  }

  getQuestionCount(): number {
    return this.questions.length;
  }

  getSystemDesignConceptCount(): number {
    return this.systemDesignConcepts.length;
  }

  getRandomTechContent(): TechInterviewAnswer | SystemDesignConcept {
    const totalQuestions = this.questions.length;
    const totalConcepts = this.systemDesignConcepts.length;
    const totalItems = totalQuestions + totalConcepts;
    
    const randomIndex = Math.floor(Math.random() * totalItems);
    
    if (randomIndex < totalQuestions) {
      return this.questions[randomIndex];
    } else {
      return this.systemDesignConcepts[randomIndex - totalQuestions];
    }
  }

  getTotalCount(): number {
    return this.questions.length + this.systemDesignConcepts.length;
  }
}

export const techInterviewService = new TechInterviewService();
