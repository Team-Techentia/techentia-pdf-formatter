// @/lib/store/formStore.ts

import { create } from 'zustand';
import { Form, FormField, FormData } from '@/lib/types';

interface FormStore {
  // State
  forms: Form[];
  selectedForm: Form | null;
  selectedFields: string[];
  formData: FormData;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadForms: () => Promise<void>;
  selectForm: (form: Form) => void;
  createForm: (form: Omit<Form, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Form>;
  updateForm: (id: string, updates: Partial<Form>) => Promise<void>;
  deleteForm: (id: string) => Promise<void>;
  
  // Field management
  addField: (formId: string, field: FormField) => Promise<void>;
  updateField: (formId: string, fieldId: string, updates: Partial<FormField>) => Promise<void>;
  removeField: (formId: string, fieldId: string) => Promise<void>;
  
  // Field selection for preview
  selectField: (fieldId: string) => void;
  deselectField: (fieldId: string) => void;
  toggleFieldSelection: (fieldId: string) => void;
  clearFieldSelection: () => void;
  
  // Form data management
  updateFormData: (fieldName: string, value: any) => void;
  clearFormData: () => void;
  
  // Utility
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useFormStore = create<FormStore>((set, get) => ({
  // Initial state
  forms: [],
  selectedForm: null,
  selectedFields: [],
  formData: {},
  isLoading: false,
  error: null,

  // Actions
  loadForms: async () => {
    set({ isLoading: true, error: null });
    try {
      const firebase = FirebaseService.getInstance();
      await firebase.initializeSampleData(); // Initialize sample data
      const forms = await firebase.getForms();
      set({ forms, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load forms', 
        isLoading: false 
      });
    }
  },

  selectForm: (form: Form) => {
    set({ 
      selectedForm: form,
      selectedFields: [],
      formData: {}
    });
  },

  createForm: async (formData: Omit<Form, 'id' | 'createdAt' | 'updatedAt'>) => {
    set({ isLoading: true, error: null });
    try {
      const firebase = FirebaseService.getInstance();
      const newForm = await firebase.createForm(formData);
      set(state => ({
        forms: [...state.forms, newForm],
        isLoading: false
      }));
      return newForm;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create form';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  updateForm: async (id: string, updates: Partial<Form>) => {
    set({ isLoading: true, error: null });
    try {
      const firebase = FirebaseService.getInstance();
      const updatedForm = await firebase.updateForm(id, updates);
      set(state => ({
        forms: state.forms.map(form => form.id === id ? updatedForm : form),
        selectedForm: state.selectedForm?.id === id ? updatedForm : state.selectedForm,
        isLoading: false
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update form';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  deleteForm: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const firebase = FirebaseService.getInstance();
      await firebase.deleteForm(id);
      set(state => ({
        forms: state.forms.filter(form => form.id !== id),
        selectedForm: state.selectedForm?.id === id ? null : state.selectedForm,
        isLoading: false
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete form';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Field management
  addField: async (formId: string, field: FormField) => {
    try {
      const firebase = FirebaseService.getInstance();
      const updatedForm = await firebase.addFieldToForm(formId, field);
      set(state => ({
        forms: state.forms.map(form => form.id === formId ? updatedForm : form),
        selectedForm: state.selectedForm?.id === formId ? updatedForm : state.selectedForm
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add field';
      set({ error: errorMessage });
      throw error;
    }
  },

  updateField: async (formId: string, fieldId: string, updates: Partial<FormField>) => {
    try {
      const firebase = FirebaseService.getInstance();
      const updatedForm = await firebase.updateFieldInForm(formId, fieldId, updates);
      set(state => ({
        forms: state.forms.map(form => form.id === formId ? updatedForm : form),
        selectedForm: state.selectedForm?.id === formId ? updatedForm : state.selectedForm
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update field';
      set({ error: errorMessage });
      throw error;
    }
  },

  removeField: async (formId: string, fieldId: string) => {
    try {
      const firebase = FirebaseService.getInstance();
      const updatedForm = await firebase.removeFieldFromForm(formId, fieldId);
      set(state => ({
        forms: state.forms.map(form => form.id === formId ? updatedForm : form),
        selectedForm: state.selectedForm?.id === formId ? updatedForm : state.selectedForm,
        selectedFields: state.selectedFields.filter(id => id !== fieldId)
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove field';
      set({ error: errorMessage });
      throw error;
    }
  },

  // Field selection
  selectField: (fieldId: string) => {
    set(state => ({
      selectedFields: state.selectedFields.includes(fieldId) 
        ? state.selectedFields 
        : [...state.selectedFields, fieldId]
    }));
  },

  deselectField: (fieldId: string) => {
    set(state => ({
      selectedFields: state.selectedFields.filter(id => id !== fieldId)
    }));
  },

  toggleFieldSelection: (fieldId: string) => {
    set(state => ({
      selectedFields: state.selectedFields.includes(fieldId)
        ? state.selectedFields.filter(id => id !== fieldId)
        : [...state.selectedFields, fieldId]
    }));
  },

  clearFieldSelection: () => {
    set({ selectedFields: [] });
  },

  // Form data management
  updateFormData: (fieldName: string, value: any) => {
    set(state => ({
      formData: {
        ...state.formData,
        [fieldName]: value
      }
    }));
  },

  clearFormData: () => {
    set({ formData: {} });
  },

  // Utility
  setError: (error: string | null) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  }
}));