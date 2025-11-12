/**
 * Calculation Service
 */
import { api } from './api';
import type { CalculationInput, CalculationResult } from '@/types';

export const calculationService = {
  /**
   * Calculate life plan
   */
  async calculate(input: CalculationInput): Promise<CalculationResult> {
    const response = await api.post<CalculationResult>('/calculate', input);
    if (!response.success || !response.data) {
      throw new Error('Failed to calculate');
    }
    return response.data;
  },

  /**
   * Get calculation result by ID
   */
  async getCalculation(calculationId: string): Promise<CalculationResult> {
    const response = await api.get<CalculationResult>(`/calculate/${calculationId}`);
    if (!response.success || !response.data) {
      throw new Error('Failed to get calculation');
    }
    return response.data;
  },
};
