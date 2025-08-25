// @/lib/types/index.ts

export interface Form {
  id: string;
  name: string;
  description?: string;
  pdfUrl: string;
  fields: FormField[];
  createdAt: string;
  updatedAt: string;
}

export interface FormField {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: SelectOption[];
  position?: FieldPosition;
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}

export type FieldType = 'input' | 'textarea' | 'select' | 'date' | 'datetime-local' | 'number' | 'email' | 'file' | 'checkbox' | 'radio';

export interface SelectOption {
  value: string;
  label: string;
}

export interface FieldPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  pdfPageNo: number;
}

export interface FormData {
  [key: string]: string | number | boolean | File | null | string[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: any;
}