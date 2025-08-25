// app/preview/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormStore } from "@/lib/store";
import { useModal } from "@/hooks";
import { AddFieldModal, FormField as FormFieldComponent } from "@/components";
import { FormField, Form } from "@/lib/types";
import { ArrowLeft, Plus, Edit2, Trash2, FileText, ExternalLink, ZoomIn, ZoomOut, RotateCw, Download } from "lucide-react";

export default function PreviewPage() {
    const router = useRouter();
    const [editingField, setEditingField] = useState<FormField | null>(null);
    const [pdfScale, setPdfScale] = useState(1.0);
    const [pdfRotation, setPdfRotation] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pdfError, setPdfError] = useState<string | null>(null);

    const {
        forms,
        selectedForm,
        loadForms,
        isFormLoading,
        formError,
        selectForm,
        addField,
        updateField,
        removeField,
        updateFormData,
        formData,
        clearFormData,
        validateFormData
    } = useFormStore();

    const { isOpen, openModal, closeModal } = useModal();

    useEffect(() => {
        loadForms();
    }, [loadForms]);

    const getFieldCount = (form: Form) => {
        return form.fields?.length || 0;
    };

    const getFormFields = (form: Form) => {
        return form.fields || [];
    };

    const handleFormSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const formId = e.target.value;
        if (formId) {
            const form = forms.find(f => f.id === formId);
            if (form) {
                selectForm(form);
                clearFormData();
                setPdfError(null);
                setCurrentPage(1);
                setPdfScale(1.0);
                setPdfRotation(0);
            }
        } else {
            selectForm(null as any);
        }
    };

    const handleAddField = async (field: FormField) => {
        try {
            if (!selectedForm) {
                alert("Please select a form first");
                return;
            }
            await addField(selectedForm.id, field);
            closeModal();
        } catch (error) {
            console.error("Failed to add field:", error);
        }
    };

    const handleUpdateField = async (field: FormField) => {
        if (!selectedForm || !editingField) return;

        try {
            await updateField(selectedForm.id, editingField.id, field);
            setEditingField(null);
            closeModal();
        } catch (error) {
            console.error("Failed to update field:", error);
        }
    };

    const handleDeleteField = async (fieldId: string) => {
        if (!selectedForm) return;

        if (confirm("Are you sure you want to delete this field?")) {
            try {
                await removeField(selectedForm.id, fieldId);
            } catch (error) {
                console.error("Failed to delete field:", error);
            }
        }
    };

    const handleEditField = (field: FormField) => {
        setEditingField(field);
        openModal();
    };

    const handleFormInputChange = (fieldName: string, value: any) => {
        updateFormData(fieldName, value);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const validation = validateFormData();

        if (validation.isValid) {
            console.log("Form Data:", formData);
            alert("Form submitted successfully! Check console for data.");
        } else {
            console.log("Validation Errors:", validation.errors);
            alert("Please fix the form errors before submitting.");
        }
    };

    const handleModalClose = () => {
        setEditingField(null);
        closeModal();
    };

    const handleOpenModal = () => {
        setEditingField(null);
        openModal();
    };

    const handleZoomIn = () => {
        setPdfScale(prev => Math.min(prev + 0.25, 3.0));
    };

    const handleZoomOut = () => {
        setPdfScale(prev => Math.max(prev - 0.25, 0.5));
    };

    const handleRotate = () => {
        setPdfRotation(prev => (prev + 90) % 360);
    };

    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };

    const handleDownloadPdf = () => {
        if (selectedForm?.pdfUrl) {
            const link = document.createElement('a');
            link.href = selectedForm.pdfUrl;
            link.download = `${selectedForm.name}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Form Preview</h1>
                            <p className="mt-1 text-gray-500">Preview and test your forms</p>
                        </div>

                        {/* Form Selector */}
                        <div className="flex items-center gap-4">
                            <label htmlFor="form-select" className="text-sm font-medium text-gray-700">
                                Select Form:
                            </label>
                            <select
                                id="form-select"
                                value={selectedForm?.id || ''}
                                onChange={handleFormSelection}
                                className="min-w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Choose a form...</option>
                                {forms?.map((form) => (
                                    <option key={form.id} value={form.id}>
                                        {form.name} ({getFieldCount(form)} field{getFieldCount(form) !== 1 ? 's' : ''})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {isFormLoading && (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-gray-500 mt-2">Loading forms...</p>
                    </div>
                )}

                {formError && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-md">
                        <p className="text-red-700">{formError}</p>
                    </div>
                )}

                {!selectedForm && !isFormLoading && (
                    <div className="text-center py-20">
                        <FileText size={64} className="mx-auto mb-4 text-gray-300" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Form Selected</h2>
                        <p className="text-gray-500 mb-6">Choose a form from the dropdown above to preview it</p>
                        <button
                            onClick={() => router.push('/forms')}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Go to Forms Management
                        </button>
                    </div>
                )}

                {selectedForm && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Panel - Form Fields Management */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-lg shadow-sm border p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">{selectedForm.name}</h2>
                                        <p className="text-gray-600 mt-1">
                                            {getFieldCount(selectedForm)} field{getFieldCount(selectedForm) !== 1 ? 's' : ''} • Manage form structure
                                        </p>
                                        {selectedForm.description && (
                                            <p className="text-gray-500 text-sm mt-2">{selectedForm.description}</p>
                                        )}
                                    </div>
                                    <button
                                        onClick={handleOpenModal}
                                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <Plus size={16} />
                                        Add Field
                                    </button>
                                </div>

                                {/* Fields List */}
                                <div className="space-y-3">
                                    {getFieldCount(selectedForm) === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            <p className="mb-2">No fields configured</p>
                                            <p className="text-sm">Add your first field to get started</p>
                                        </div>
                                    ) : (
                                        getFormFields(selectedForm).map((field) => (
                                            <div
                                                key={field.id}
                                                className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow group"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h3 className="font-medium text-gray-800">{field.label}</h3>
                                                        <p className="text-sm text-gray-500">
                                                            {field.name} • {field.type}
                                                            {field.required && <span className="text-red-500 ml-1">*</span>}
                                                        </p>
                                                        {field.placeholder && (
                                                            <p className="text-xs text-gray-400 mt-1">
                                                                Placeholder: {field.placeholder}
                                                            </p>
                                                        )}
                                                        {field.options && field.options.length > 0 && (
                                                            <div className="text-xs text-gray-400 mt-1">
                                                                Options: {field.options.map(opt => opt.label).join(", ")}
                                                            </div>
                                                        )}
                                                        {field.position && (
                                                            <div className="text-xs text-blue-500 mt-1">
                                                                Position: Page {field.position.pdfPageNo}, X:{field.position.x}, Y:{field.position.y}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleEditField(field)}
                                                            className="p-1 text-gray-500 hover:text-blue-600"
                                                            title="Edit Field"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteField(field.id)}
                                                            className="p-1 text-gray-500 hover:text-red-600"
                                                            title="Delete Field"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Interactive Form Preview */}
                            <div className="bg-white rounded-lg shadow-sm border p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Form Preview</h3>
                                    <span className="text-sm text-gray-500">Interactive preview</span>
                                </div>

                                {getFieldCount(selectedForm) === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <p>No fields to preview</p>
                                        <p className="text-sm mt-1">Add some fields to see the form preview</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleFormSubmit} className="space-y-4">
                                        {getFormFields(selectedForm).map((field) => (
                                            <FormFieldComponent
                                                key={field.id}
                                                field={field}
                                                value={formData[field.name]}
                                                onChange={(e) => {
                                                    const target = e.target;
                                                    let value: any = target.value;
                                                    if (field.type === 'checkbox') {
                                                        const tg = e.target as HTMLInputElement
                                                        const currentValues = Array.isArray(formData[field.name])
                                                            ? formData[field.name] as string[]
                                                            : [];

                                                        if (tg.checked) {
                                                            value = [...currentValues, tg.value];
                                                        } else {
                                                            value = currentValues.filter(v => v !== tg.value);
                                                        }
                                                    } else if (field.type === 'file') {
                                                        value = (target as HTMLInputElement).files?.[0] || null;
                                                    } else if (field.type === 'number') {
                                                        value = target.value ? Number(target.value) : '';
                                                    }

                                                    handleFormInputChange(field.name, value);
                                                }}
                                            />
                                        ))}

                                        <div className="pt-4 border-t flex gap-3">
                                            <button
                                                type="submit"
                                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                Test Submit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={clearFormData}
                                                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                                            >
                                                Clear Form
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>

                        {/* Right Panel - PDF Viewer */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-lg shadow-sm border">
                                {/* PDF Header */}
                                <div className="p-4 border-b border-gray-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-lg font-semibold text-gray-900">PDF Document</h3>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={handleDownloadPdf}
                                                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm px-2 py-1 rounded"
                                                title="Download PDF"
                                            >
                                                <Download size={16} />
                                                Download
                                            </button>
                                            <a
                                                href={selectedForm.pdfUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm px-2 py-1 rounded"
                                                title="Open in new tab"
                                            >
                                                <ExternalLink size={16} />
                                                Open
                                            </a>
                                        </div>
                                    </div>

                                    {/* PDF Controls */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={handleZoomOut}
                                                className="p-1 text-gray-600 hover:text-gray-900 border rounded"
                                                title="Zoom Out"
                                            >
                                                <ZoomOut size={16} />
                                            </button>
                                            <span className="text-sm text-gray-600 min-w-12 text-center">
                                                {Math.round(pdfScale * 100)}%
                                            </span>
                                            <button
                                                onClick={handleZoomIn}
                                                className="p-1 text-gray-600 hover:text-gray-900 border rounded"
                                                title="Zoom In"
                                            >
                                                <ZoomIn size={16} />
                                            </button>
                                            <button
                                                onClick={handleRotate}
                                                className="p-1 text-gray-600 hover:text-gray-900 border rounded ml-2"
                                                title="Rotate"
                                            >
                                                <RotateCw size={16} />
                                            </button>
                                        </div>

                                        {/* Page Navigation */}
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={handlePrevPage}
                                                disabled={currentPage <= 1}
                                                className="px-2 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Previous
                                            </button>
                                            <span className="text-sm text-gray-600">
                                                Page {currentPage} of {totalPages}
                                            </span>
                                            <button
                                                onClick={handleNextPage}
                                                disabled={currentPage >= totalPages}
                                                className="px-2 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* PDF Viewer Container */}
                                <div className="relative bg-gray-100 min-h-96">
                                    {pdfError ? (
                                        <div className="flex items-center justify-center h-96">
                                            <div className="text-center">
                                                <FileText size={48} className="mx-auto mb-4 text-gray-400" />
                                                <p className="text-red-600 mb-2">Failed to load PDF</p>
                                                <p className="text-sm text-gray-500">{pdfError}</p>
                                                <button
                                                    onClick={() => setPdfError(null)}
                                                    className="mt-3 text-blue-600 hover:text-blue-800 text-sm"
                                                >
                                                    Try Again
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-4 overflow-auto max-h-96">
                                            <div
                                                className="mx-auto bg-white shadow-lg"
                                                style={{
                                                    transform: `scale(${pdfScale}) rotate(${pdfRotation}deg)`,
                                                    transformOrigin: 'center top',
                                                    transition: 'transform 0.2s ease'
                                                }}
                                            >
                                                {/* PDF Embed */}
                                                <iframe
                                                    src={`${selectedForm.pdfUrl}#page=${currentPage}&zoom=${pdfScale * 100}`}
                                                    className="w-full h-96 border-0"
                                                    title={`${selectedForm.name} PDF`}
                                                    onLoad={() => setPdfError(null)}
                                                    onError={() => setPdfError("Unable to display PDF. The file might be corrupted or inaccessible.")}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Field Positioning Hints */}
                                {getFieldCount(selectedForm) > 0 && (
                                    <div className="p-4 border-t bg-blue-50">
                                        <h4 className="text-sm font-medium text-blue-900 mb-2">Field Positions</h4>
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            {getFormFields(selectedForm)
                                                .filter(field => field.position)
                                                .map((field) => (
                                                    <div key={field.id} className="flex justify-between">
                                                        <span className="text-blue-700">{field.label}:</span>
                                                        <span className="text-blue-600">
                                                            Page {field.position?.pdfPageNo}, ({field.position?.x}, {field.position?.y})
                                                        </span>
                                                    </div>
                                                ))}
                                        </div>
                                        {getFormFields(selectedForm).filter(field => field.position).length === 0 && (
                                            <p className="text-blue-700 text-xs">No positioned fields yet. Add field positions to see them here.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Add/Edit Field Modal */}
            {isOpen && (
                <AddFieldModal
                    isOpen={isOpen}
                    closeModal={handleModalClose}
                    onAddField={editingField ? handleUpdateField : handleAddField}
                    editingField={editingField}
                />
            )}
        </div>
    );
}