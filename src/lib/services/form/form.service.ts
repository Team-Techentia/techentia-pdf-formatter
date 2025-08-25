// @/lib/services/formService.ts
import { Form, FormField, ApiResponse } from "@/lib/types";

const BASE_URL = "/api/form";

export const FormService = {
  async getForms(limit = 10, offset = 0): Promise<{ forms: Form[]; total: number }> {
    const res = await fetch(`${BASE_URL}?limit=${limit}&offset=${offset}`);
    if (!res.ok) throw new Error("Failed to fetch forms");
    return res.json();
  },

  async getForm(id: string): Promise<Form> {
    const res = await fetch(`${BASE_URL}?id=${id}`);
    if (!res.ok) throw new Error("Form not found");
    return res.json();
  },

  async createForm(form: Omit<Form, "id" | "createdAt" | "updatedAt">): Promise<Form> {
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data: ApiResponse<Form> = await res.json();
    if (!data.success || !data.data) throw new Error(data.message || "Failed to create form");
    return data.data;
  },

  async updateForm(id: string, updates: Partial<Form>): Promise<Form> {
    const res = await fetch(`${BASE_URL}?id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Failed to update form");
    return res.json();
  },

  async deleteForm(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}?id=${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete form");
  },

  // --- Field-specific endpoints ---
  async addField(formId: string, field: FormField): Promise<Form> {
    const res = await fetch(`${BASE_URL}?id=${formId}&action=addField`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(field),
    });
    if (!res.ok) throw new Error("Failed to add field");
    return res.json();
  },

  async updateField(formId: string, fieldId: string, updates: Partial<FormField>): Promise<Form> {
    const res = await fetch(`${BASE_URL}?id=${formId}&action=updateField&fieldId=${fieldId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Failed to update field");
    return res.json();
  },

  async removeField(formId: string, fieldId: string): Promise<Form> {
    const res = await fetch(`${BASE_URL}?id=${formId}&action=removeField&fieldId=${fieldId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to remove field");
    return res.json();
  },
};
