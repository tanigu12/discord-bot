// Technical interview questions organized by category
export const TECHNICAL_QUESTIONS = {
  algorithms: [
    'Explain the difference between Array and LinkedList. When would you use each?',
    'What is Big O notation? Explain with examples of O(1), O(n), and O(log n).',
    'How would you reverse a string without using built-in methods?',
    'Explain how a hash table works and its time complexity for common operations.',
    "What's the difference between stack and queue? Give real-world examples.",
    'How would you detect a cycle in a linked list?',
    'Explain binary search and when you would use it.',
    'What is recursion? Write a simple recursive function example.',
    'How would you find the middle element of a linked list in one pass?',
    'Explain sorting algorithms: bubble sort vs quicksort vs merge sort.',
  ],

  programming: [
    "What's the difference between call by value and call by reference?",
    'Explain Object-Oriented Programming principles (inheritance, polymorphism, encapsulation).',
    'What is the difference between == and === in JavaScript?',
    'Explain closures in JavaScript with an example.',
    "What's the difference between synchronous and asynchronous programming?",
    'What is a promise in JavaScript? How is it different from callbacks?',
    'Explain the concept of hoisting in JavaScript.',
    "What's the difference between let, const, and var?",
    'What is event delegation in JavaScript?',
    'Explain the difference between deep copy and shallow copy.',
  ],

  systemDesign: [
    'How would you design a URL shortener like bit.ly?',
    'Explain the difference between SQL and NoSQL databases.',
    'What is REST API? What are HTTP methods?',
    'How would you handle authentication in a web application?',
    'What is caching? Explain different caching strategies.',
    'Explain the concept of load balancing.',
    "What's the difference between horizontal and vertical scaling?",
    'How would you design a real-time chat application?',
    'What is microservices architecture vs monolithic architecture?',
    'Explain database indexing and its benefits.',
  ],

  webDevelopment: [
    "What's the difference between client-side and server-side rendering?",
    'Explain the CSS box model.',
    'What is responsive web design? How do you implement it?',
    "What's the difference between HTTP and HTTPS?",
    'Explain cross-origin resource sharing (CORS).',
    'What are web sockets and when would you use them?',
    'What is the DOM? How do you manipulate it?',
    'Explain the concept of progressive web apps (PWA).',
    "What's the difference between cookies, localStorage, and sessionStorage?",
    'How does browser rendering work? Explain the critical rendering path.',
  ],

  frontend: [
    "What's the difference between functional and class components in React?",
    'Explain React hooks: useState, useEffect, useContext.',
    'What is the virtual DOM and how does it work?',
    "What's the difference between props and state in React?",
    'Explain component lifecycle methods in React.',
    'What is Redux and when would you use it?',
    'How do you optimize React application performance?',
    "What's the difference between controlled and uncontrolled components?",
    'Explain React Router and client-side routing.',
    'What is server-side rendering (SSR) with React/Next.js?',
  ],

  backend: [
    'What is Node.js and how is it different from browser JavaScript?',
    'Explain the event loop in Node.js.',
    "What's the difference between blocking and non-blocking I/O?",
    'How do you handle errors in Node.js applications?',
    'What are middleware functions in Express.js?',
    'Explain streams in Node.js.',
    'How do you manage environment variables in Node.js?',
    "What's the difference between npm and yarn?",
    'How do you handle file uploads in Node.js?',
    'Explain clustering in Node.js applications.',
  ],
};

export type QuestionCategory = keyof typeof TECHNICAL_QUESTIONS;

export interface TechnicalQuestion {
  question: string;
  category: QuestionCategory;
}

export class TechnicalQuestionService {
  /**
   * Get random questions from all categories
   */
  getRandomQuestions(count: number = 3): TechnicalQuestion[] {
    const allQuestions = this.getAllQuestions();
    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * Get random questions from specific categories
   */
  getRandomQuestionsFromCategories(
    categories: QuestionCategory[],
    count: number = 3
  ): TechnicalQuestion[] {
    const categoryQuestions = categories.flatMap(category =>
      TECHNICAL_QUESTIONS[category].map(question => ({
        question,
        category,
      }))
    );

    const shuffled = [...categoryQuestions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * Get random questions from a specific category
   */
  getRandomQuestionsFromCategory(
    category: QuestionCategory,
    count: number = 3
  ): TechnicalQuestion[] {
    const questions = TECHNICAL_QUESTIONS[category].map(question => ({
      question,
      category,
    }));

    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * Get all questions with their categories
   */
  getAllQuestions(): TechnicalQuestion[] {
    return Object.entries(TECHNICAL_QUESTIONS).flatMap(([category, questions]) =>
      questions.map(question => ({
        question,
        category: category as QuestionCategory,
      }))
    );
  }

  /**
   * Get available categories
   */
  getCategories(): QuestionCategory[] {
    return Object.keys(TECHNICAL_QUESTIONS) as QuestionCategory[];
  }

  /**
   * Get category display name
   */
  getCategoryDisplayName(category: QuestionCategory): string {
    const displayNames: Record<QuestionCategory, string> = {
      algorithms: '🔢 Algorithms & Data Structures',
      programming: '💻 Programming Concepts',
      systemDesign: '🏗️ System Design & Architecture',
      webDevelopment: '🌐 Web Development',
      frontend: '⚛️ React/Frontend',
      backend: '🖥️ Node.js/Backend',
    };

    return displayNames[category];
  }
}
