import { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import type { QuestionInput, QuestionState } from '@/types';
import { TOTAL_QUESTION_STEPS } from '@/constants';

// Context type
interface QuestionContextType extends QuestionState {
  setAnswer: (field: keyof QuestionInput, value: any) => void;
  nextStep: () => void;
  previousStep: () => void;
  resetAnswers: () => void;
  goToStep: (step: number) => void;
}

// Action types
type QuestionAction =
  | { type: 'SET_ANSWER'; payload: { field: keyof QuestionInput; value: any } }
  | { type: 'NEXT_STEP' }
  | { type: 'PREVIOUS_STEP' }
  | { type: 'GO_TO_STEP'; payload: number }
  | { type: 'RESET' };

// Initial state
const initialState: QuestionState = {
  currentStep: 1,
  totalSteps: TOTAL_QUESTION_STEPS,
  answers: {},
  isValid: false,
};

// Reducer
function questionReducer(state: QuestionState, action: QuestionAction): QuestionState {
  switch (action.type) {
    case 'SET_ANSWER':
      const newAnswers = {
        ...state.answers,
        [action.payload.field]: action.payload.value,
      };
      return {
        ...state,
        answers: newAnswers,
        isValid: isValidAnswers(newAnswers, state.currentStep),
      };

    case 'NEXT_STEP':
      if (state.currentStep < state.totalSteps) {
        return {
          ...state,
          currentStep: state.currentStep + 1,
          isValid: isValidAnswers(state.answers, state.currentStep + 1),
        };
      }
      return state;

    case 'PREVIOUS_STEP':
      if (state.currentStep > 1) {
        return {
          ...state,
          currentStep: state.currentStep - 1,
          isValid: isValidAnswers(state.answers, state.currentStep - 1),
        };
      }
      return state;

    case 'GO_TO_STEP':
      return {
        ...state,
        currentStep: action.payload,
        isValid: isValidAnswers(state.answers, action.payload),
      };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

// Validation helper
function isValidAnswers(answers: Partial<QuestionInput>, step: number): boolean {
  switch (step) {
    case 1:
      return typeof answers.age === 'number' && answers.age >= 0 && answers.age <= 120;
    case 2:
      return typeof answers.monthly_expenses === 'number' && answers.monthly_expenses >= 0;
    case 3:
      return typeof answers.total_assets === 'number' && answers.total_assets >= 0;
    case 4:
      // Step 4 is optional, so it's always valid
      return true;
    default:
      return false;
  }
}

// Create context
const QuestionContext = createContext<QuestionContextType | undefined>(undefined);

// Provider component
export function QuestionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(questionReducer, initialState);

  const setAnswer = useCallback((field: keyof QuestionInput, value: any) => {
    dispatch({ type: 'SET_ANSWER', payload: { field, value } });
  }, []);

  const nextStep = useCallback(() => {
    dispatch({ type: 'NEXT_STEP' });
  }, []);

  const previousStep = useCallback(() => {
    dispatch({ type: 'PREVIOUS_STEP' });
  }, []);

  const resetAnswers = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const goToStep = useCallback((step: number) => {
    dispatch({ type: 'GO_TO_STEP', payload: step });
  }, []);

  const value: QuestionContextType = {
    ...state,
    setAnswer,
    nextStep,
    previousStep,
    resetAnswers,
    goToStep,
  };

  return <QuestionContext.Provider value={value}>{children}</QuestionContext.Provider>;
}

// Custom hook
export function useQuestion() {
  const context = useContext(QuestionContext);
  if (context === undefined) {
    throw new Error('useQuestion must be used within a QuestionProvider');
  }
  return context;
}
