// @/lib/services/formService.ts
import axios, { AxiosError } from "axios";
import { Form, FormField, ApiResponse } from "@/lib/types";

const BASE_URL = "/api/forms";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 8000, 
  headers: { "Content-Type": "application/json" },
});

function handleError(err: unknown): never {
  if (axios.isAxiosError(err)) {
    const axiosErr = err as AxiosError<any>;
    const message = axiosErr.response?.data?.message || axiosErr.message || "Unexpected error occurred";
    throw new Error(message);
  }
  throw err instanceof Error ? err : new Error("Unknown error occurred");
}

export const FormService = {
  async getForms(limit = 10, offset = 0): Promise<{ forms: Form[]; total: number }> {
    try {
      const res = await api.get<ApiResponse<{ forms: Form[]; total: number }>>(`?limit=${limit}&offset=${offset}`);
      console.log(res.data.data?.forms);
      
      if (!res.data.success || !res.data.data) {
        throw new Error(res.data.message || "Failed to fetch forms");
      }
      
      return res.data.data;
    } catch (err) {
      handleError(err);
    }
  },

  async getForm(id: string): Promise<Form> {
    try {
      const { data } = await api.get<ApiResponse<Form>>(`?id=${id}`);
      
      if (!data.success || !data.data) {
        throw new Error(data.message || "Failed to fetch form");
      }
      
      return data.data;
    } catch (err) {
      handleError(err);
    }
  },

  async createForm(form: Omit<Form, "id" | "createdAt" | "updatedAt">): Promise<Form> {
    try {
      const { data } = await api.post<ApiResponse<Form>>("/", form);
      if (!data.success || !data.data) {
        throw new Error(data.message || "Failed to create form");
      }
      return data.data;
    } catch (err) {
      handleError(err);
    }
  },

  async updateForm(id: string, updates: Partial<Form>): Promise<Form> {
    try {
      const { data } = await api.put<ApiResponse<Form>>(`?id=${id}`, updates);
      
      if (!data.success || !data.data) {
        throw new Error(data.message || "Failed to update form");
      }
      
      return data.data;
    } catch (err) {
      handleError(err);
    }
  },

  async deleteForm(id: string): Promise<void> {
    try {
      await api.delete<ApiResponse<void>>(`?id=${id}`);
    } catch (err) {
      handleError(err);
    }
  },

  async addField(formId: string, field: FormField): Promise<Form> {
    try {
      const { data } = await api.put<ApiResponse<Form>>(`?id=${formId}&action=addField`, field);
      
      if (!data.success || !data.data) {
        throw new Error(data.message || "Failed to add field");
      }
      
      return data.data;
    } catch (err) {
      handleError(err);
    }
  },

  async updateField(formId: string, fieldId: string, updates: Partial<FormField>): Promise<Form> {
    try {
      const { data } = await api.put<ApiResponse<Form>>(`?id=${formId}&action=updateField&fieldId=${fieldId}`, updates);
      
      if (!data.success || !data.data) {
        throw new Error(data.message || "Failed to update field");
      }
      
      return data.data;
    } catch (err) {
      handleError(err);
    }
  },

  async removeField(formId: string, fieldId: string): Promise<Form> {
    try {
      const { data } = await api.delete<ApiResponse<Form>>(`?id=${formId}&action=removeField&fieldId=${fieldId}`);
      
      if (!data.success || !data.data) {
        throw new Error(data.message || "Failed to remove field");
      }
      
      return data.data;
    } catch (err) {
      handleError(err);
    }
  },
};