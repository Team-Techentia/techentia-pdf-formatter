"use client";
import { useFormStore } from '@/lib/store'
import { Form } from '@/lib/types';
import { Calendar, Edit2, Eye, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation';
import React from 'react'

interface AllFormsTableProps {
    setEditingForm: (x: Form) => void;
    setNewFormData: (x: { name: string, description: string, pdfUrl: string }) => void;
    setShowCreateForm: (x: boolean) => void;
}

export default function AllFormsTable({ setEditingForm, setNewFormData, setShowCreateForm, }: AllFormsTableProps) {
    const router = useRouter();
    const { forms, selectForm, deleteForm } = useFormStore();

    const getFieldCount = (form: Form) => {
        return form.fields?.length || 0;
    };

    const handleEditForm = (form: Form) => {
        setEditingForm(form);
        setNewFormData({ name: form.name, description: form.description || "", pdfUrl: form.pdfUrl });
        setShowCreateForm(true);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const handleDeleteForm = async (formId: string) => {
        if (confirm("Are you sure you want to delete this form? This action cannot be undone.")) {
            try {
                await deleteForm(formId);
            } catch (error) {
                console.error("Failed to delete form:", error);
            }
        }
    };

    const handlePreviewForm = (form: Form) => {
        selectForm(form);
        router.push('/preview');
    };
    return (
        <table className="w-full">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Form Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fields
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Updated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                    </th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {forms?.map((form) => (
                    <tr key={form.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{form.name}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                                {form.pdfUrl}
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate">
                                {form.description || (
                                    <span className="text-gray-400 italic">No description</span>
                                )}
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {getFieldCount(form)} field{getFieldCount(form) !== 1 ? 's' : ''}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                                <Calendar size={14} className="mr-1" />
                                {formatDate(form.createdAt)}
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                                <Calendar size={14} className="mr-1" />
                                {formatDate(form.updatedAt)}
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePreviewForm(form)}
                                    className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                    title="Preview Form"
                                >
                                    <Eye size={16} />
                                </button>
                                <button
                                    onClick={() => handleEditForm(form)}
                                    className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                                    title="Edit Form"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => handleDeleteForm(form.id)}
                                    className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                    title="Delete Form"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}
