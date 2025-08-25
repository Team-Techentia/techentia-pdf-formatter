"use client";
import React, { useState, useEffect } from 'react';
import { FormField, FieldType, SelectOption } from '@/lib/types';
import { FIELD_TYPES } from '@/lib/consts';
import { X, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface AddFieldModalProps {
    isOpen: boolean;
    closeModal: () => void;
    onAddField: (field: FormField) => void;
    editingField?: FormField | null;
}

export default function AddFieldModal({ isOpen, closeModal, onAddField, editingField }: AddFieldModalProps) {
    const [formData, setFormData] = useState<Partial<FormField>>({ name: '', label: '', type: 'input', required: false, placeholder: '', options: [] });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        if (isOpen) {
            if (editingField) {
                setFormData({ ...editingField, options: editingField.options || [] });
            } else {
                setFormData({ name: '', label: '', type: 'input', required: false, placeholder: '', options: [] });
            }
            setErrors({});
        }
    }, [isOpen, editingField]);

    const generateFieldName = (label: string) => {
        return label.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        if (field === 'label' && !editingField) {
            const generatedName = generateFieldName(value);
            setFormData(prev => ({ ...prev, name: generatedName }));
        }

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(p => {
                const newErrors = { ...p };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleValidationChange = (validationField: string, value: any) => {
        setFormData(p => ({ ...p, validation: { ...p.validation, [validationField]: value || undefined } }));
    };

    const addOption = () => {
        const newOption: SelectOption = { value: '', label: '' };
        setFormData(p => ({ ...p, options: [...(p.options || []), newOption] }));
    };

    const updateOption = (index: number, field: 'value' | 'label', value: string) => {
        setFormData(p => ({ ...p, options: p.options?.map((option, i) => i === index ? { ...option, [field]: value } : option) || [] }));
    };

    const removeOption = (index: number) => {
        setFormData(p => ({ ...p, options: p.options?.filter((_, i) => i !== index) || [] }));
    };

    const generateOptionValue = (label: string) => {
        return label.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
    };

    const validate = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.label?.trim()) {
            newErrors.label = 'Label is required';
        }

        if (!formData.name?.trim()) {
            newErrors.name = 'Name is required';
        }

        // Validate options for fields that need them
        if (['select', 'radio', 'checkbox'].includes(formData.type!) &&
            (!formData.options || formData.options.length === 0)) {
            newErrors.options = 'At least one option is required';
        }

        // Validate individual options
        if (formData.options && formData.options.length > 0) {
            const hasEmptyOptions = formData.options.some(opt => !opt.label.trim() || !opt.value.trim());
            if (hasEmptyOptions) {
                newErrors.options = 'All options must have both label and value';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        const fieldData: FormField = {
            id: editingField?.id || `field_${Date.now()}`,
            name: formData.name!,
            label: formData.label!,
            type: formData.type!,
            required: formData.required || false,
            placeholder: formData.placeholder || undefined,
            options: ['select', 'radio', 'checkbox'].includes(formData.type!) ? formData.options : undefined,
            position: editingField?.position,
            validation: formData.validation
        };

        try {
            console.log(fieldData)
            onAddField(fieldData);
            closeModal();
        } catch (error) {
            toast.error('Failed to save field');
        }
    };

    const needsOptions = ['select', 'radio', 'checkbox'].includes(formData.type!);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-bold text-[#1F3047]">
                        {editingField ? 'Edit Field' : 'Add New Field'}
                    </h2>
                    <button
                        onClick={closeModal}
                        className="p-1 hover:bg-gray-100 rounded-full"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Field Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Field Type *
                        </label>
                        <select
                            value={formData.type}
                            onChange={(e) => handleInputChange('type', e.target.value as FieldType)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {FIELD_TYPES.map(type => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Label */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Label *
                        </label>
                        <input
                            type="text"
                            value={formData.label}
                            onChange={(e) => handleInputChange('label', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.label ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Enter field label"
                        />
                        {errors.label && <p className="text-red-500 text-sm mt-1">{errors.label}</p>}
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Field Name *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="field_name"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Used in form data. {!editingField && 'Auto-generated from label.'}
                        </p>
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>

                    {/* Placeholder */}
                    {!['date', 'datetime-local', 'file', 'select', 'radio', 'checkbox'].includes(formData.type!) && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Placeholder
                            </label>
                            <input
                                type="text"
                                value={formData.placeholder}
                                onChange={(e) => handleInputChange('placeholder', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter placeholder text"
                            />
                        </div>
                    )}

                    {/* Required */}
                    <div>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={formData.required}
                                onChange={(e) => handleInputChange('required', e.target.checked)}
                                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="text-sm font-medium text-gray-700">Required field</span>
                        </label>
                    </div>

                    {/* Options for select/radio/checkbox */}
                    {needsOptions && (
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <label className="block text-sm font-medium text-gray-700">
                                    Options *
                                </label>
                                <button
                                    type="button"
                                    onClick={addOption}
                                    className="flex items-center gap-1 text-sm bg-[#1F3047] text-white px-3 py-1 rounded hover:opacity-90"
                                >
                                    <Plus size={14} />
                                    Add Option
                                </button>
                            </div>

                            <div className="space-y-3 max-h-48 overflow-y-auto">
                                {formData.options?.map((option, index) => (
                                    <div key={index} className="flex gap-2 items-start">
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                value={option.label}
                                                onChange={(e) => {
                                                    updateOption(index, 'label', e.target.value);
                                                    // Auto-generate value if empty
                                                    if (!option.value) {
                                                        updateOption(index, 'value', generateOptionValue(e.target.value));
                                                    }
                                                }}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                placeholder="Option label"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                value={option.value}
                                                onChange={(e) => updateOption(index, 'value', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                placeholder="option_value"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeOption(index)}
                                            className="p-2 text-red-500 hover:text-red-700"
                                            title="Remove option"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {formData.options?.length === 0 && (
                                <p className="text-sm text-gray-500 text-center py-4 border-2 border-dashed border-gray-200 rounded">
                                    No options added yet. Click "Add Option" to get started.
                                </p>
                            )}

                            {errors.options && <p className="text-red-500 text-sm mt-1">{errors.options}</p>}
                        </div>
                    )}

                    {/* Validation Rules */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Validation (Optional)
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            {(formData.type === 'input' || formData.type === 'textarea') && (
                                <>
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Min Length</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.validation?.minLength || ''}
                                            onChange={(e) => handleValidationChange('minLength', e.target.value ? Number(e.target.value) : undefined)}
                                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Max Length</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={formData.validation?.maxLength || ''}
                                            onChange={(e) => handleValidationChange('maxLength', e.target.value ? Number(e.target.value) : undefined)}
                                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            placeholder="∞"
                                        />
                                    </div>
                                </>
                            )}

                            {formData.type === 'number' && (
                                <>
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Min Value</label>
                                        <input
                                            type="number"
                                            value={formData.validation?.min || ''}
                                            onChange={(e) => handleValidationChange('min', e.target.value ? Number(e.target.value) : undefined)}
                                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Max Value</label>
                                        <input
                                            type="number"
                                            value={formData.validation?.max || ''}
                                            onChange={(e) => handleValidationChange('max', e.target.value ? Number(e.target.value) : undefined)}
                                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-[#1F3047] text-white rounded-md hover:opacity-90 transition-colors"
                        >
                            {editingField ? 'Update Field' : 'Add Field'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};