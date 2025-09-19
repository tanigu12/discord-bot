export interface TechInterviewAnswer {
  question: string;
  definition: string[];
  keyCharacteristics: string[];
  advantages?: string[];
  disadvantages?: string[];
  practicalExample: string[];
  bestPractices: string[];
  conclusion: string[];
}

export interface SystemDesignConcept {
  question: string;
  requirementsGathering: string[];
  functionalRequirements: string[];
  nonFunctionalRequirements: string[];
  capacityEstimation: string[];
  highLevelDesign: string[];
  detailedDesign: string[];
  databaseDesign: string[];
  apiDesign: string[];
  scalingStrategy: string[];
  monitoring: string[];
  tradeoffs: string[];
}
