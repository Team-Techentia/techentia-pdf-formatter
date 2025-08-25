// @/lib/utils/client/form/form.client.ts
import { FormField, FormData, FieldType } from '@/lib/types';

export const formClientUtils = {
  generateFieldId: (): string => {
    return `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  createField: (
    name: string, 
    label: string, 
    type: FieldType, 
    options?: {
      required?: boolean;
      placeholder?: string;
      selectOptions?: Array<{value: string; label: string}>;
    }
  ): FormField => {
    return {
      id: formClientUtils.generateFieldId(),
      name: name.toLowerCase().replace(/\s+/g, '_'),
      label,
      type,
      required: options?.required || false,
      placeholder: options?.placeholder,
      options: options?.selectOptions // This maps selectOptions to options
    };
  },

  getDefaultValue: (field: FormField): string | boolean | null | string[] => {
    switch (field.type) {
      case 'checkbox':
        return []; // Return empty array for checkboxes
      case 'number':
        return '';
      case 'date':
        return '';
      case 'file':
        return null;
      default:
        return '';
    }
  },

  initializeFormData: (fields: FormField[]): FormData => {
    const formData: FormData = {};
    fields.forEach(field => {
      formData[field.name] = formClientUtils.getDefaultValue(field);
    });
    return formData;
  },

  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    formData: FormData,
    setFormData: React.Dispatch<React.SetStateAction<FormData>>
  ) => {
    const { name, value, type } = e.target;
    
    let processedValue: string | boolean | File | null | string[] = value;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      const { checked } = checkbox;
      
      const currentValues = Array.isArray(formData[name]) ? formData[name] as string[] : [];
      
      if (checked) {
        processedValue = [...currentValues, value];
      } else {
        processedValue = currentValues.filter(v => v !== value);
      }
    } else if (type === 'file') {
      const fileInput = e.target as HTMLInputElement;
      processedValue = fileInput.files?.[0] || null;
    } else if (type === 'number') {
      processedValue = value === '' ? '' : value;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  },

  clearFormData: (setFormData: React.Dispatch<React.SetStateAction<FormData>>) => {
    setFormData({});
  },

  exportFormConfig: (fields: FormField[]): string => {
    return JSON.stringify(fields, null, 2);
  },

  importFormConfig: (configString: string): FormField[] => {
    try {
      const parsed = JSON.parse(configString);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
};