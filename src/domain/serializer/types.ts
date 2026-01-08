import type { ValidationError } from '../../types/parser';

export type SaveFormat = 'json' | 'xml';

export interface JsonSerializeOptions {
  pretty?: boolean;
  indent?: number;
}

export interface SaveValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}
