import { db } from '@/lib/firebase/firestore';
import { ApiResponse, Form, FormField } from '@/lib/types';
import { FormSchema } from '@/lib/zod';
import { addDoc, collection, deleteDoc, doc, getCountFromServer, getDoc, getDocs, limit, orderBy, query, serverTimestamp, startAfter, updateDoc, where, } from 'firebase/firestore';
import { errorServerUtils } from '../error/error.utils';

function ensureFieldIds(fields: FormField[]): FormField[] {
    return fields.map((field) => ({ ...field, id: field.id || doc(collection(db, 'forms')).id, }));
}

export const formServerUtils = {
    async createForm(formData: Partial<Form>): Promise<ApiResponse<Form>> {
        try {
            const parsed = FormSchema.safeParse(formData);

            if (!parsed.success) {
                return { success: false, message: "Validation failed", error: errorServerUtils.handleZodError(parsed.error), };
            }

            const fieldsWithIds = parsed.data.fields.map((field) => ({ ...field, id: field.id || doc(collection(db, "forms")).id, }));

            const payload = { ...parsed.data, fields: fieldsWithIds, createdAt: serverTimestamp(), updatedAt: serverTimestamp(), };

            const docRef = await addDoc(collection(db, "forms"), payload);
            const docSnap = await getDoc(docRef);

            const createdForm = docSnap.data() as Omit<Form, "id">;

            return { success: true, data: { id: docRef.id, ...createdForm, } };
        } catch (error: any) {
            return { success: false, message: "Failed to create the form", error };
        }
    },
    async getForm(formId: string): Promise<ApiResponse<Form>> {
        try {
            const docRef = doc(db, 'forms', formId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const raw = docSnap.data();

                const data = {
                    id: docSnap.id,
                    ...raw,
                    createdAt: raw.createdAt?.toDate ? raw.createdAt.toDate().toISOString() : null,
                    updatedAt: raw.updatedAt?.toDate ? raw.updatedAt.toDate().toISOString() : null,
                };

                const parsed = FormSchema.safeParse(data);
                if (parsed.success) {
                    return { success: true, data: parsed.data as Form };
                } else {
                    return { success: false, message: "Invalid form schema", error: parsed.error };
                }
            }

            return { success: false, message: 'Form not found' };
        } catch (error: any) {
            return { success: false, message: 'Failed to fetch form', error };
        }
    },
    async getForms(options: { limit?: number; offset?: number } = {}) {
        try {
            const baseQuery = collection(db, "forms");
            const limitValue = options.limit || 10;
            let constraints: any[] = [orderBy("createdAt", "desc")];

            if (options.offset && options.offset > 0) {
                const skipQuery = query(
                    baseQuery,
                    orderBy("createdAt", "desc"),
                    limit(options.offset)
                );
                const skipSnapshot = await getDocs(skipQuery);

                if (skipSnapshot.docs.length > 0) {
                    const lastDoc = skipSnapshot.docs[skipSnapshot.docs.length - 1];
                    constraints.push(startAfter(lastDoc));
                }
            }

            constraints.push(limit(limitValue));

            const q = query(baseQuery, ...constraints);
            const querySnapshot = await getDocs(q);

            const forms: Form[] = [];
            querySnapshot.forEach((doc) => {
                try {
                    const raw = doc.data();

                    const data = {
                        id: doc.id,
                        ...raw,
                        createdAt: raw.createdAt?.toDate ? raw.createdAt.toDate().toISOString() : null,
                        updatedAt: raw.updatedAt?.toDate ? raw.updatedAt.toDate().toISOString() : null,
                    };

                    const parsed = FormSchema.safeParse(data);

                    if (parsed.success) {
                        forms.push(parsed.data as Form);
                    } else {
                        console.warn(`Failed to parse form ${doc.id}:`, parsed.error);
                    }
                } catch (parseError) {
                    console.error(`Error parsing document ${doc.id}:`, parseError);
                }
            });

            const countSnapshot = await getCountFromServer(baseQuery);
            const total = countSnapshot.data().count;

            return { success: true, data: { forms, total } };
        } catch (error: any) {
            console.error("Error in getForms:", error);
            return { success: false, message: "Failed to fetch forms", error };
        }
    },
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
            const updatePayload = { ...allowedUpdates, updatedAt: serverTimestamp(), };

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
    async addField(formId: string, field: FormField): Promise<ApiResponse<Form>> {
        try {
            const docRef = doc(db, 'forms', formId);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                return { success: false, message: 'Form not found' };
            }

            const formData = docSnap.data() as Form;
            const currentFields = formData.fields || [];

            const fieldWithId = { ...field, id: field.id || doc(collection(db, 'forms')).id, };
            const updatedFields = [...currentFields, fieldWithId];

            await updateDoc(docRef, { fields: updatedFields, updatedAt: serverTimestamp(), });

            const updatedDoc = await getDoc(docRef);
            const updatedFormData = { id: updatedDoc.id, ...updatedDoc.data() } as Form;

            return { success: true, data: updatedFormData };
        } catch (error: any) {
            return { success: false, message: 'Failed to add field', error };
        }
    },
    async updateField(formId: string, fieldId: string, fieldUpdates: Partial<FormField>): Promise<ApiResponse<Form>> {
        try {
            const docRef = doc(db, 'forms', formId);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                return { success: false, message: 'Form not found' };
            }

            const formData = docSnap.data() as Form;
            const currentFields = formData.fields || [];

            const fieldIndex = currentFields.findIndex(field => field.id === fieldId);
            if (fieldIndex === -1) {
                return { success: false, message: 'Field not found' };
            }

            const updatedFields = [...currentFields];
            updatedFields[fieldIndex] = { ...updatedFields[fieldIndex], ...fieldUpdates, id: fieldId, };

            await updateDoc(docRef, { fields: updatedFields, updatedAt: serverTimestamp(), });

            const updatedDoc = await getDoc(docRef);
            const updatedFormData = { id: updatedDoc.id, ...updatedDoc.data() } as Form;

            return { success: true, data: updatedFormData };
        } catch (error: any) {
            return { success: false, message: 'Failed to update field', error };
        }
    },
    async removeField(formId: string, fieldId: string): Promise<ApiResponse<Form>> {
        try {
            const docRef = doc(db, 'forms', formId);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                return { success: false, message: 'Form not found' };
            }

            const formData = docSnap.data() as Form;
            const currentFields = formData.fields || [];

            const updatedFields = currentFields.filter(field => field.id !== fieldId);

            await updateDoc(docRef, { fields: updatedFields, updatedAt: serverTimestamp(), });

            const updatedDoc = await getDoc(docRef);
            const updatedFormData = { id: updatedDoc.id, ...updatedDoc.data() } as Form;

            return { success: true, data: updatedFormData };
        } catch (error: any) {
            return { success: false, message: 'Failed to remove field', error };
        }
    },
    async searchForms(searchTerm: string, userId?: string): Promise<ApiResponse<Form[]>> {
        try {
            let constraints: any[] = [orderBy('createdAt', 'desc')];
            if (userId) constraints.unshift(where('userId', '==', userId));

            const q = query(collection(db, 'forms'), ...constraints);
            const querySnapshot = await getDocs(q);

            const forms: Form[] = [];
            const searchLower = searchTerm.toLowerCase();

            querySnapshot.forEach((d) => {
                const formData = { id: d.id, ...d.data() } as Form;
                if (!formData.fields) {
                    formData.fields = [];
                }

                if (formData.name.toLowerCase().includes(searchLower) || (formData.description && formData.description.toLowerCase().includes(searchLower))) {
                    forms.push(formData);
                }
            });

            return { success: true, data: forms };
        } catch (error: any) {
            return { success: false, message: 'Failed to search forms', error };
        }
    },
};