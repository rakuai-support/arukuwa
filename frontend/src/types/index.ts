/**
 * Type Definitions
 */

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Session Types
export interface Session {
  session_id: string;
  created_at: string;
  last_accessed: string;
  expires_at: string;
  has_calculations: boolean;
  has_goals: boolean;
}

// Question/Input Types
export interface QuestionInput {
  age: number;
  monthly_expenses: number;
  total_assets: number;
  monthly_support?: number;
  support_type?: 'pension' | 'welfare' | 'none' | 'other';
}

// Calculation Types
export interface CalculationInput {
  user_info: QuestionInput;
  options?: {
    use_ai_analysis?: boolean;
    simulation_years?: number;
  };
}

export interface CalculationResult {
  calculation_id: string;
  created_at: string;
  input: QuestionInput;
  result: {
    depletion_age?: number;
    depletion_year?: number;
    years_until_depletion?: number;
    total_years_simulated: number;
    yearly_data: YearlyData[];
    summary: {
      total_income: number;
      total_expenses: number;
      net_balance: number;
      average_monthly_balance: number;
    };
    ai_analysis?: AiAnalysis;
  };
}

export interface YearlyData {
  year: number;
  age: number;
  balance: number;
  annual_income: number;
  annual_expenses: number;
  net_change: number;
}

export interface AiAnalysis {
  risk_factors: string[];
  suggestions: string[];
  advice_message: string;
  generated_at?: string;
  model_version?: string;
}

// Goal Types
export interface Goal {
  goal_id: string;
  title: string;
  description?: string;
  category?: 'finance' | 'health' | 'social' | 'other';
  frequency?: 'daily' | 'weekly' | 'monthly';
  status: 'active' | 'completed' | 'archived' | 'paused';
  progress: number;
  start_date?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateGoalInput {
  session_id: string;
  calculation_id?: string;
  goal: {
    title: string;
    description?: string;
    category?: string;
    frequency?: string;
    start_date?: string;
  };
}

export interface GoalSuggestion {
  title: string;
  description: string;
  category: string;
  frequency: string;
  estimated_difficulty: 'easy' | 'medium' | 'hard';
}

// UI State Types
export interface QuestionState {
  currentStep: number;
  totalSteps: number;
  answers: Partial<QuestionInput>;
  isValid: boolean;
}

export interface CalculationState {
  isCalculating: boolean;
  result: CalculationResult | null;
  error: ApiError | null;
}

export interface GoalState {
  goals: Goal[];
  isLoading: boolean;
  error: ApiError | null;
}
