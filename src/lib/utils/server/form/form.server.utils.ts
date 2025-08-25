import { db } from '@/lib/firebase/firestore';
import { ApiResponse, Form, FormField } from '@/lib/types';
import { FormSchema } from '@/lib/zod';
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getCountFromServer,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    updateDoc,
    where,
} from 'firebase/firestore';
import { errorServerUtils } from '../error/error.utils';

function ensureFieldIds(fields: FormField[]): FormField[] {
    return fields.map((field) => ({
        ...field,
        id: field.id || doc(collection(db, 'forms')).id,
    }));
}

export const formServerUtils = {
    /**
     * Create a new form
     */
    async createForm(formData: Partial<Form>): Promise<ApiResponse<Form>> {
        try {
            const parsed = FormSchema.safeParse(formData);

            if (!parsed.success) {
                return { success: false, message: "Validation failed", error: errorServerUtils.handleZodError(parsed.error), };
            }

            const fieldsWithIds: FormField[] = parsed.data.fields.map((field) => ({ ...field, id: field.id || doc(collection(db, "forms")).id, }));

            const payload = {
                ...parsed.data,
                fields: fieldsWithIds,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            const docRef = await addDoc(collection(db, "forms"), payload);
            const docSnap = await getDoc(docRef);

            const createdForm = docSnap.data() as Omit<Form, "id">;

            return { success: true, data: { id: docRef.id, ...createdForm, } };
        } catch (error: any) {
            return { success: false, message: "Failed to create the form", error };
        }
    },

    /**
     * Get a single form by ID
     */
    async getForm(formId: string): Promise<ApiResponse<Form>> {
        try {
            const docRef = doc(db, 'forms', formId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return { success: false, data: { ...docSnap.data() as Form } };
            }
            return { success: false, message: 'Failed to fetch form', };
        } catch (error: any) {
            return { success: false, message: 'Failed to fetch form', error };
        }
    },

    /**
     * Get multiple forms with optional filtering
     */
    async getForms(options: { limit?: number; offset?: number; } = {}): Promise<ApiResponse<{ forms: Form[]; total: number }>> {
        try {
            const baseQuery = collection(db, 'forms');
            let constraints: any[] = [orderBy('createdAt', 'desc')];

            if (options.limit) constraints.push(limit(options.limit));

            const q = query(baseQuery, ...constraints);
            const querySnapshot = await getDocs(q);

            const forms: Form[] = [];
            querySnapshot.forEach((d) => {
                const parsed = FormSchema.safeParse({ id: d.id, ...d.data() });
                if (parsed.success) forms.push(parsed.data as Form);
            });

            const offset = options.offset || 0;
            const paginatedForms = forms.slice(offset, offset + (options.limit || 10));

            const countSnapshot = await getCountFromServer(baseQuery);
            const total = countSnapshot.data().count;

            return { success: true, data: { forms: paginatedForms, total } };
        } catch (error: any) {
            return { success: false, message: 'Failed to fetch forms', error };
        }
    },

    /**
     * Update an existing form
     */
    async updateForm(
        formId: string,
        updateData: Partial<Form>
    ): Promise<ApiResponse<Form>> {
        try {
            const docRef = doc(db, 'forms', formId);
            const docSnap = await getDoc(docRef);
            if (!docSnap.exists()) {
                return { success: false, message: 'Form not found' };
            }

            const { id, createdAt, ...allowedUpdates } = updateData;
            const updatePayload = {
                ...allowedUpdates,
                updatedAt: new Date().toISOString(),
            };

            if (updatePayload.fields) {
                updatePayload.fields = ensureFieldIds(updatePayload.fields as FormField[]);
            }

            const parsed = FormSchema.safeParse({ ...docSnap.data(), ...updatePayload, id: formId, });

            if (!parsed.success) {
                return { success: false, message: 'Validation failed', error: errorServerUtils.handleZodError(parsed.error), };
            }

            await updateDoc(docRef, updatePayload);
            return { success: true, data: parsed.data as Form };
        } catch (error: any) {
            return { success: false, message: 'Failed to update form', error };
        }
    },

    /**
     * Delete a form
     */
    async deleteForm(formId: string): Promise<ApiResponse<null>> {
        try {
            const docRef = doc(db, 'forms', formId);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                return { success: false, message: 'Form not found' };
            }

            await deleteDoc(docRef);
            return { success: true, message: 'Form deleted successfully', data: null };
        } catch (error: any) {
            return { success: false, message: 'Failed to delete form', error };
        }
    },

    /**
     * Search forms by name or description
     */
    async searchForms(
        searchTerm: string,
        userId?: string
    ): Promise<ApiResponse<Form[]>> {
        try {
            let constraints: any[] = [orderBy('createdAt', 'desc')];
            if (userId) constraints.unshift(where('userId', '==', userId));

            const q = query(collection(db, 'forms'), ...constraints);
            const querySnapshot = await getDocs(q);

            const forms: Form[] = [];
            const searchLower = searchTerm.toLowerCase();

            querySnapshot.forEach((d) => {
                const parsed = FormSchema.safeParse({ id: d.id, ...d.data() });
                if (parsed.success) {
                    const form = parsed.data;
                    if (
                        form.name.toLowerCase().includes(searchLower) ||
                        (form.description &&
                            form.description.toLowerCase().includes(searchLower))
                    ) {
                        forms.push(form as Form);
                    }
                }
            });

            return { success: true, data: forms };
        } catch (error: any) {
            return { success: false, message: 'Failed to search forms', error };
        }
    },
};
