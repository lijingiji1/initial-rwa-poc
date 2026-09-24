export type QuestionType = 'mcq' | 'fill-in-blanks' | 'matching';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface Question {
  id: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
  text: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  marks: number;
  negativeMarks: number;
  sectionId: string;
}

export interface Section {
  id: string;
  title: string;
  description: string;
  timeInMinutes: number;
  questions: Question[];
}

export interface Test {
  id: string;
  title: string;
  subject: string;
  description: string;
  totalMarks: number;
  passingPercentage: number;
  duration: number;
  sections: Section[];
  instructions: string[];
}

export interface UserAnswer {
  questionId: string;
  answer: string | string[];
  isBookmarked: boolean;
  timeSpent: number;
}

export interface TestAttempt {
  id: string;
  testId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  answers: Record<string, UserAnswer>;
  score?: number;
  status: 'in-progress' | 'completed' | 'paused';
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  attempts: TestAttempt[];
}