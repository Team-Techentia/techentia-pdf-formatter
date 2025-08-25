// @/lib/store/formStore.ts
import { create } from "zustand";
import { subscribeWithSelector } from 'zustand/middleware';
import { Form, FormField, FormData } from "@/lib/types";
import { FormService } from "@/lib/services";
import toast from "react-hot-toast";

interface FormStore {
  // State
  forms: Form[];
  selectedForm: Form | null;
  selectedFields: string[];
  formData: FormData;
  isFormLoading: boolean;
  formError: string | null;

  // Form CRUD operations
  loadForms: () => Promise<void>;
  selectForm: (form: Form) => void;
  createForm: (form: Omit<Form, "id" | "createdAt" | "updatedAt">) => Promise<Form>;
  updateForm: (id: string, updates: Partial<Form>) => Promise<void>;
  deleteForm: (id: string) => Promise<void>;
  refreshForm: (id: string) => Promise<void>;

  // Field operations
  addField: (formId: string, field: FormField) => Promise<void>;
  updateField: (formId: string, fieldId: string, updates: Partial<FormField>) => Promise<void>;
  removeField: (formId: string, fieldId: string) => Promise<void>;
  reorderFields: (formId: string, fieldIds: string[]) => Promise<void>;

  // Field selection
  selectField: (fieldId: string) => void;
  deselectField: (fieldId: string) => void;
  toggleFieldSelection: (fieldId: string) => void;
  clearFieldSelection: () => void;
  selectAllFields: () => void;
  getSelectedFields: () => FormField[];

  // Form data management
  updateFormData: (fieldName: string, value: any) => void;
  clearFormData: () => void;
  resetFormData: () => void;
  validateFormData: () => { isValid: boolean; errors: { [key: string]: string } };

  // Utility methods
  findForm: (id: string) => Form | undefined;
  findField: (formId: string, fieldId: string) => FormField | undefined;
  duplicateField: (formId: string, fieldId: string) => Promise<void>;

  // Error handling
  setError: (formError: string | null) => void;
  clearError: () => void;

  // Bulk operations
  deleteMultipleFields: (formId: string, fieldIds: string[]) => Promise<void>;
  updateMultipleFields: (formId: string, updates: { [fieldId: string]: Partial<FormField> }) => Promise<void>;
}

export const useFormStore = create<FormStore>()(
  subscribeWithSelector((set, get) => ({
    forms: [],
    selectedForm: null,
    selectedFields: [],
    formData: {},
    isFormLoading: false,
    formError: null,

    loadForms: async () => {
      set({ isFormLoading: true, formError: null });
      try {
        const data = await FormService.getForms();
        set({ forms: data?.forms || [], isFormLoading: false });
      } catch (formError) {
        set({
          formError: formError instanceof Error ? formError.message : "Failed to load forms",
          isFormLoading: false,
        });
      }
    },

    selectForm: (form: Form) => {
      set({ selectedForm: form, selectedFields: [], formData: {}, formError: null });
    },

    createForm: async (formData) => {
      set({ isFormLoading: true, formError: null });
      try {
        const newForm = await FormService.createForm(formData);
        set((state) => ({ forms: [...state.forms, newForm], isFormLoading: false, }));
        return newForm;
      } catch (formError) {
        const errorMessage = formError instanceof Error ? formError.message : "Failed to create form";
        set({ formError: errorMessage, isFormLoading: false });
        throw formError;
      }
    },

    updateForm: async (id, updates) => {
      set({ isFormLoading: true, formError: null });
      try {
        const updatedForm = await FormService.updateForm(id, updates);
        set((state) => ({
          forms: state.forms.map((form) => form.id === id ? updatedForm : form),
          selectedForm: state.selectedForm?.id === id ? updatedForm : state.selectedForm,
          isFormLoading: false,
        }));
      } catch (formError) {
        const errorMessage = formError instanceof Error ? formError.message : "Failed to update form";
        set({ formError: errorMessage, isFormLoading: false });
        throw formError;
      }
    },

    deleteForm: async (id) => {
      set({ isFormLoading: true, formError: null });
      try {
        await FormService.deleteForm(id);
        set((state) => ({
          forms: state.forms.filter((form) => form.id !== id),
          selectedForm: state.selectedForm?.id === id ? null : state.selectedForm,
          isFormLoading: false,
        }));
      } catch (formError) {
        const errorMessage =
          formError instanceof Error ? formError.message : "Failed to delete form";
        set({ formError: errorMessage, isFormLoading: false });
        throw formError;
      }
    },

    refreshForm: async (id) => {
      try {
        const form = await FormService.getForm(id);
        set((state) => ({
          forms: state.forms.map((f) => f.id === id ? form : f),
          selectedForm: state.selectedForm?.id === id ? form : state.selectedForm,
        }));
      } catch (formError) {
        set({ formError: "Failed to refresh form" });
        throw formError;
      }
    },

    addField: async (formId, field) => {
      set({ formError: null });
      try {
        const updatedForm = await FormService.addField(formId, field);
        set((state) => ({
          forms: state.forms.map((form) => form.id === formId ? updatedForm : form),
          selectedForm: state.selectedForm?.id === formId ? updatedForm : state.selectedForm,
        }));
        toast.success('Field added successfully');
      } catch (formError) {
        set({ formError: "Failed to add field" });
        throw formError;
      }
    },

    updateField: async (formId, fieldId, updates) => {
      set({ formError: null });
      try {
        const updatedForm = await FormService.updateField(formId, fieldId, updates);
        set((state) => ({
          forms: state.forms.map((form) =>
            form.id === formId ? updatedForm : form
          ),
          selectedForm:
            state.selectedForm?.id === formId ? updatedForm : state.selectedForm,
        }));
        toast.success('Field updated successfully');
      } catch (formError) {
        set({ formError: "Failed to update field" });
        throw formError;
      }
    },

    removeField: async (formId, fieldId) => {
      set({ formError: null });
      try {
        const updatedForm = await FormService.removeField(formId, fieldId);
        set((state) => ({
          forms: state.forms.map((form) =>
            form.id === formId ? updatedForm : form
          ),
          selectedForm:
            state.selectedForm?.id === formId ? updatedForm : state.selectedForm,
          selectedFields: state.selectedFields.filter((id) => id !== fieldId),
        }));
      } catch (formError) {
        set({ formError: "Failed to remove field" });
        throw formError;
      }
    },

    reorderFields: async (formId, fieldIds) => {
      set({ formError: null });
      try {
        console.log("Reorder fields not implemented in API yet");
      } catch (formError) {
        set({ formError: "Failed to reorder fields" });
        throw formError;
      }
    },

    selectField: (fieldId) => {
      set((state) => ({
        selectedFields: state.selectedFields.includes(fieldId) ? state.selectedFields : [...state.selectedFields, fieldId],
      }));
    },

    deselectField: (fieldId) => {
      set((state) => ({
        selectedFields: state.selectedFields.filter((id) => id !== fieldId),
      }));
    },

    toggleFieldSelection: (fieldId) => {
      set((state) => ({
        selectedFields: state.selectedFields.includes(fieldId) ? state.selectedFields.filter((id) => id !== fieldId) : [...state.selectedFields, fieldId],
      }));
    },

    clearFieldSelection: () => {
      set({ selectedFields: [] });
    },

    selectAllFields: () => {
      const { selectedForm } = get();
      if (selectedForm) {
        set({ selectedFields: selectedForm.fields.map(f => f.id) });
      }
    },

    getSelectedFields: () => {
      const { selectedForm, selectedFields } = get();
      if (!selectedForm) return [];
      return selectedForm.fields.filter(field => selectedFields.includes(field.id));
    },

    // Form data management
    updateFormData: (fieldName, value) => {
      set((state) => ({
        formData: {
          ...state.formData,
          [fieldName]: value,
        },
      }));
    },

    clearFormData: () => {
      set({ formData: {} });
    },

    resetFormData: () => {
      const { selectedForm } = get();
      if (!selectedForm) return;

      const initialData: FormData = {};
      selectedForm.fields.forEach(field => {
        switch (field.type) {
          case 'checkbox':
            initialData[field.name] = [];
            break;
          case 'number':
            initialData[field.name] = '';
            break;
          case 'file':
            initialData[field.name] = null;
            break;
          default:
            initialData[field.name] = '';
        }
      });

      set({ formData: initialData });
    },

    validateFormData: () => {
      const { selectedForm, formData } = get();
      if (!selectedForm) return { isValid: true, errors: {} };

      const errors: { [key: string]: string } = {};

      selectedForm.fields.forEach(field => {
        const value = formData[field.name];
        if (field.required) {
          if (field.type === 'checkbox' && (!Array.isArray(value) || value.length === 0)) {
            errors[field.name] = `${field.label} is required`;
          } else if (field.type === 'file' && !value) {
            errors[field.name] = `${field.label} is required`;
          } else if (!value || (typeof value === 'string' && !value.trim())) {
            errors[field.name] = `${field.label} is required`;
          }
        }

        if (value && field.validation) {
          const val = field.validation;
          const stringValue = String(value);

          if (val.minLength && stringValue.length < val.minLength) {
            errors[field.name] = `${field.label} must be at least ${val.minLength} characters`;
          }
          if (val.maxLength && stringValue.length > val.maxLength) {
            errors[field.name] = `${field.label} must be no more than ${val.maxLength} characters`;
          }
          if (field.type === 'number') {
            const numValue = Number(value);
            if (val.min !== undefined && numValue < val.min) {
              errors[field.name] = `${field.label} must be at least ${val.min}`;
            }
            if (val.max !== undefined && numValue > val.max) {
              errors[field.name] = `${field.label} must be no more than ${val.max}`;
            }
          }
        }
      });

      return {
        isValid: Object.keys(errors).length === 0,
        errors
      };
    },

    findForm: (id) => {
      return get().forms.find(form => form.id === id);
    },

    findField: (formId, fieldId) => {
      const form = get().findForm(formId);
      return form?.fields.find(field => field.id === fieldId);
    },

    duplicateField: async (formId, fieldId) => {
      const field = get().findField(formId, fieldId);
      if (!field) throw new Error("Field not found");

      const duplicatedField: FormField = {
        ...field,
        id: `${field.id}_copy_${Date.now()}`,
        name: `${field.name}_copy`,
        label: `${field.label} (Copy)`
      };

      await get().addField(formId, duplicatedField);
    },

    setError: (formError) => {
      set({ formError });
    },

    clearError: () => {
      set({ formError: null });
    },

    deleteMultipleFields: async (formId, fieldIds) => {
      set({ formError: null });
      try {
        for (const fieldId of fieldIds) {
          await FormService.removeField(formId, fieldId);
        }
        await get().refreshForm(formId);
      } catch (formError) {
        set({ formError: "Failed to delete multiple fields" });
        throw formError;
      }
    },

    updateMultipleFields: async (formId, updates) => {
      set({ formError: null });
      try {
        for (const [fieldId, fieldUpdates] of Object.entries(updates)) {
          await FormService.updateField(formId, fieldId, fieldUpdates);
        }
        await get().refreshForm(formId);
      } catch (formError) {
        set({ formError: "Failed to update multiple fields" });
        throw formError;
      }
    },
  }))
);

export const useFormList = () => useFormStore(state => state.forms);
export const useSelectedForm = () => useFormStore(state => state.selectedForm);
export const useFormLoading = () => useFormStore(state => state.isFormLoading);
export const useFormError = () => useFormStore(state => state.formError);
export const useFormData = () => useFormStore(state => state.formData);