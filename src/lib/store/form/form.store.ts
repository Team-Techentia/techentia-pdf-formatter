// @/lib/store/formStore.ts
import { create } from "zustand";
import { Form, FormField, FormData } from "@/lib/types";
import { FormService } from "@/lib/services";

interface FormStore {
  forms: Form[];
  selectedForm: Form | null;
  selectedFields: string[];
  formData: FormData;
  isFormLoading: boolean;
  formError: string | null;

  loadForms: () => Promise<void>;
  selectForm: (form: Form) => void;
  createForm: (form: Omit<Form, "id" | "createdAt" | "updatedAt">) => Promise<Form>;
  updateForm: (id: string, updates: Partial<Form>) => Promise<void>;
  deleteForm: (id: string) => Promise<void>;

  addField: (formId: string, field: FormField) => Promise<void>;
  updateField: (formId: string, fieldId: string, updates: Partial<FormField>) => Promise<void>;
  removeField: (formId: string, fieldId: string) => Promise<void>;

  selectField: (fieldId: string) => void;
  deselectField: (fieldId: string) => void;
  toggleFieldSelection: (fieldId: string) => void;
  clearFieldSelection: () => void;

  updateFormData: (fieldName: string, value: any) => void;
  clearFormData: () => void;

  setError: (formError: string | null) => void;
  clearError: () => void;
}

export const useFormStore = create<FormStore>((set, get) => ({
  forms: [],
  selectedForm: null,
  selectedFields: [],
  formData: {},
  isFormLoading: false,
  formError: null,

  loadForms: async () => {
    set({ isFormLoading: true, formError: null });
    try {
      const { forms } = await FormService.getForms();
      set({ forms, isFormLoading: false });
    } catch (formError) {
      set({
        formError: formError instanceof Error ? formError.message : "Failed to load forms",
        isFormLoading: false,
      });
    }
  },

  selectForm: (form: Form) => {
    set({
      selectedForm: form,
      selectedFields: [],
      formData: {},
    });
  },

  createForm: async (formData) => {
    set({ isFormLoading: true, formError: null });
    try {
      const newForm = await FormService.createForm(formData);
      set((state) => ({
        forms: [...state.forms, newForm],
        isFormLoading: false,
      }));
      return newForm;
    } catch (formError) {
      const errorMessage =
        formError instanceof Error ? formError.message : "Failed to create form";
      set({ formError: errorMessage, isFormLoading: false });
      throw formError;
    }
  },

  updateForm: async (id, updates) => {
    set({ isFormLoading: true, formError: null });
    try {
      const updatedForm = await FormService.updateForm(id, updates);
      set((state) => ({
        forms: state.forms.map((form) =>
          form.id === id ? updatedForm : form
        ),
        selectedForm:
          state.selectedForm?.id === id ? updatedForm : state.selectedForm,
        isFormLoading: false,
      }));
    } catch (formError) {
      const errorMessage =
        formError instanceof Error ? formError.message : "Failed to update form";
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
        selectedForm:
          state.selectedForm?.id === id ? null : state.selectedForm,
        isFormLoading: false,
      }));
    } catch (formError) {
      const errorMessage =
        formError instanceof Error ? formError.message : "Failed to delete form";
      set({ formError: errorMessage, isFormLoading: false });
      throw formError;
    }
  },

  addField: async (formId, field) => {
    try {
      const updatedForm = await FormService.addField(formId, field);
      set((state) => ({
        forms: state.forms.map((form) =>
          form.id === formId ? updatedForm : form
        ),
        selectedForm:
          state.selectedForm?.id === formId ? updatedForm : state.selectedForm,
      }));
    } catch (formError) {
      set({ formError: "Failed to add field" });
      throw formError;
    }
  },

  updateField: async (formId, fieldId, updates) => {
    try {
      const updatedForm = await FormService.updateField(formId, fieldId, updates);
      set((state) => ({
        forms: state.forms.map((form) =>
          form.id === formId ? updatedForm : form
        ),
        selectedForm:
          state.selectedForm?.id === formId ? updatedForm : state.selectedForm,
      }));
    } catch (formError) {
      set({ formError: "Failed to update field" });
      throw formError;
    }
  },

  removeField: async (formId, fieldId) => {
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

  selectField: (fieldId) => {
    set((state) => ({
      selectedFields: state.selectedFields.includes(fieldId)
        ? state.selectedFields
        : [...state.selectedFields, fieldId],
    }));
  },

  deselectField: (fieldId) => {
    set((state) => ({
      selectedFields: state.selectedFields.filter((id) => id !== fieldId),
    }));
  },

  toggleFieldSelection: (fieldId) => {
    set((state) => ({
      selectedFields: state.selectedFields.includes(fieldId)
        ? state.selectedFields.filter((id) => id !== fieldId)
        : [...state.selectedFields, fieldId],
    }));
  },

  clearFieldSelection: () => {
    set({ selectedFields: [] });
  },

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

  setError: (formError) => {
    set({ formError });
  },

  clearError: () => {
    set({ formError: null });
  },
}));
