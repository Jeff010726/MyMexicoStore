import type { ApiResponse } from '../types';

export function successResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    message
  };
}

export function errorResponse(error: string, message?: string): ApiResponse {
  return {
    success: false,
    error,
    message
  };
}

export function validateRequired(data: Record<string, any>, fields: string[]): string | null {
  for (const field of fields) {
    if (!data[field]) {
      return `${field} is required`;
    }
  }
  return null;
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}