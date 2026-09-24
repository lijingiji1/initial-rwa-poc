import { create } from 'zustand';
import { Test, TestAttempt, UserAnswer } from '@/types/test';

interface TestState {
  currentTest: Test | null;
  currentAttempt: TestAttempt | null;
  setCurrentTest: (test: Test) => void;
  startTest: (testId: string, userId: string) => void;
  submitAnswer: (questionId: string, answer: string | string[]) => void;
  bookmarkQuestion: (questionId: string) => void;
  pauseTest: () => void;
  resumeTest: () => void;
  submitTest: () => void;
}

export const useTestStore = create<TestState>((set, get) => ({
  currentTest: null,
  currentAttempt: null,

  setCurrentTest: (test) => {
    set({ currentTest: test });
  },

  startTest: (testId, userId) => {
    const attempt: TestAttempt = {
      id: crypto.randomUUID(),
      testId,
      userId,
      startTime: new Date(),
      answers: {},
      status: 'in-progress',
    };
    set({ currentAttempt: attempt });
  },

  submitAnswer: (questionId, answer) => {
    const { currentAttempt } = get();
    if (!currentAttempt) return;

    const userAnswer: UserAnswer = {
      questionId,
      answer,
      isBookmarked: currentAttempt.answers[questionId]?.isBookmarked || false,
      timeSpent: 0, // Calculate time spent
    };

    set({
      currentAttempt: {
        ...currentAttempt,
        answers: {
          ...currentAttempt.answers,
          [questionId]: userAnswer,
        },
      },
    });
  },

  bookmarkQuestion: (questionId) => {
    const { currentAttempt } = get();
    if (!currentAttempt) return;

    const answer = currentAttempt.answers[questionId];
    if (!answer) return;

    set({
      currentAttempt: {
        ...currentAttempt,
        answers: {
          ...currentAttempt.answers,
          [questionId]: {
            ...answer,
            isBookmarked: !answer.isBookmarked,
          },
        },
      },
    });
  },

  pauseTest: () => {
    const { currentAttempt } = get();
    if (!currentAttempt) return;

    set({
      currentAttempt: {
        ...currentAttempt,
        status: 'paused',
      },
    });
  },

  resumeTest: () => {
    const { currentAttempt } = get();
    if (!currentAttempt) return;

    set({
      currentAttempt: {
        ...currentAttempt,
        status: 'in-progress',
      },
    });
  },

  submitTest: () => {
    const { currentAttempt, currentTest } = get();
    if (!currentAttempt || !currentTest) return;

    // Calculate score
    let totalScore = 0;
    Object.entries(currentAttempt.answers).forEach(([questionId, answer]) => {
      const question = currentTest.sections
        .flatMap((s) => s.questions)
        .find((q) => q.id === questionId);

      if (!question) return;

      if (Array.isArray(question.correctAnswer)) {
        const isCorrect = Array.isArray(answer.answer) &&
          question.correctAnswer.every((a) => answer.answer.includes(a));
        totalScore += isCorrect ? question.marks : -question.negativeMarks;
      } else {
        const isCorrect = answer.answer === question.correctAnswer;
        totalScore += isCorrect ? question.marks : -question.negativeMarks;
      }
    });

    set({
      currentAttempt: {
        ...currentAttempt,
        status: 'completed',
        endTime: new Date(),
        score: totalScore,
      },
    });
  },
}));