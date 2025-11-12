/**
 * Application Constants
 */

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Arukuwa';
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';

// Question Steps
export const TOTAL_QUESTION_STEPS = 4;

export const QUESTION_STEPS = {
  AGE: 1,
  MONTHLY_EXPENSES: 2,
  TOTAL_ASSETS: 3,
  SUPPORT: 4,
} as const;

// Validation Rules
export const VALIDATION = {
  AGE: {
    MIN: 0,
    MAX: 120,
  },
  MONTHLY_EXPENSES: {
    MIN: 0,
    MAX: 10000000,
  },
  TOTAL_ASSETS: {
    MIN: 0,
    MAX: 10000000000,
  },
  MONTHLY_SUPPORT: {
    MIN: 0,
    MAX: 1000000,
  },
  GOAL_TITLE: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 200,
  },
  GOAL_DESCRIPTION: {
    MAX_LENGTH: 500,
  },
} as const;

// Support Types
export const SUPPORT_TYPES = [
  { value: 'none', label: 'なし' },
  { value: 'pension', label: '障害年金' },
  { value: 'welfare', label: '生活保護' },
  { value: 'other', label: 'その他' },
] as const;

// Goal Categories
export const GOAL_CATEGORIES = [
  { value: 'finance', label: '家計・お金' },
  { value: 'health', label: '健康' },
  { value: 'social', label: '社会参加' },
  { value: 'other', label: 'その他' },
] as const;

// Goal Frequencies
export const GOAL_FREQUENCIES = [
  { value: 'daily', label: '毎日' },
  { value: 'weekly', label: '毎週' },
  { value: 'monthly', label: '毎月' },
] as const;

// Routes
export const ROUTES = {
  HOME: '/',
  QUESTIONS: '/questions',
  CALCULATING: '/calculating',
  RESULT: '/result/:calculationId',
  GOALS_NEW: '/goals/new',
  GOALS: '/goals',
  HELP: '/help',
  PRIVACY: '/privacy',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  SESSION_ID: 'arukuwa_session_id',
  QUESTION_ANSWERS: 'arukuwa_question_answers',
  CALCULATION_ID: 'arukuwa_calculation_id',
} as const;

// Messages
export const MESSAGES = {
  ERROR: {
    GENERIC: '申し訳ありません。エラーが発生しました。',
    NETWORK: 'ネットワークエラーが発生しました。インターネット接続を確認してください。',
    SESSION_EXPIRED: 'セッションの有効期限が切れました。再度お試しください。',
    VALIDATION: '入力内容に誤りがあります。',
  },
  SUCCESS: {
    SESSION_CREATED: 'セッションを作成しました',
    CALCULATION_COMPLETE: '計算が完了しました',
    GOAL_CREATED: '目標を保存しました',
    GOAL_UPDATED: '目標を更新しました',
    GOAL_DELETED: '目標を削除しました',
  },
} as const;

// Chart Colors
export const CHART_COLORS = {
  PRIMARY: 'rgb(59, 130, 246)',
  PRIMARY_LIGHT: 'rgba(59, 130, 246, 0.1)',
  DANGER: 'rgb(239, 68, 68)',
  SUCCESS: 'rgb(34, 197, 94)',
  WARNING: 'rgb(245, 158, 11)',
} as const;
