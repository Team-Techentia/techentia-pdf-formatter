// app/forms/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormStore } from "@/lib/store";
import {AllFormsTable } from "@/components";
import { Form } from "@/lib/types";
import { Plus, Eye, FileText, Upload, X } from "lucide-react";

export default function FormsPage() {
  const router = useRouter();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newFormData, setNewFormData] = useState({ name: "", description: "", pdfUrl: "" });
  const [editingForm, setEditingForm] = useState<Form | null>(null);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);

  const { forms, loadForms, isFormLoading, formError, createForm, updateForm, } = useFormStore();

  useEffect(() => {
    loadForms();
  }, [loadForms]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setFormErrors({ ...formErrors, file: "Please select a PDF file" });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setFormErrors({ ...formErrors, file: "File size must be less than 10MB" });
        return;
      }
      setSelectedFile(file);
      setFormErrors({ ...formErrors, file: "" });
    }
  };
  const uploadPDFToCloudinary = async (file: File): Promise<string> => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error("Cloudinary configuration is missing");
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
        {
          method: 'POST',
          body: formData,
          headers: {
            "X-Requested-With": "XMLHttpRequest"
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Upload failed: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      setUploadProgress(100);

      return data.secure_url;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleUploadPDF = async () => {
    if (!selectedFile) return;

    try {
      const uploadedUrl = await uploadPDFToCloudinary(selectedFile);
      setNewFormData(prev => ({ ...prev, pdfUrl: uploadedUrl }));
      setSelectedFile(null);
    } catch (error) {
      setFormErrors({ ...formErrors, file: "Failed to upload PDF. Please try again." });
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setFormErrors({ ...formErrors, file: "" });
  };

  const removePDFUrl = () => {
    setNewFormData(prev => ({ ...prev, pdfUrl: "" }));
  };

  const handleCreateForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const errors: { [key: string]: string } = {};
    if (!newFormData.name.trim()) errors.name = "Form name is required";
    if (!newFormData.pdfUrl.trim()) errors.pdfUrl = "PDF URL is required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      await createForm({
        ...newFormData,
        fields: []
      });
      setNewFormData({ name: "", description: "", pdfUrl: "" });
      setShowCreateForm(false);
      setFormErrors({});
      setSelectedFile(null);
    } catch (error) {
      console.error("Failed to create form:", error);
    }
  };

  const handleUpdateForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingForm) return;

    setFormErrors({});

    const errors: { [key: string]: string } = {};
    if (!newFormData.name.trim()) errors.name = "Form name is required";
    if (!newFormData.pdfUrl.trim()) errors.pdfUrl = "PDF URL is required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      await updateForm(editingForm.id, newFormData);
      setNewFormData({ name: "", description: "", pdfUrl: "" });
      setEditingForm(null);
      setShowCreateForm(false);
      setFormErrors({});
      setSelectedFile(null);
    } catch (error) {
      console.error("Failed to update form:", error);
    }
  };

  const handleCancelForm = () => {
    setShowCreateForm(false);
    setEditingForm(null);
    setFormErrors({});
    setNewFormData({ name: "", description: "", pdfUrl: "" });
    setSelectedFile(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Forms Management</h1>
              <p className="mt-1 text-gray-500">Manage all your forms in one place</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/preview')}
                className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Eye size={16} />
                Preview Forms
              </button>
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} />
                Create New Form
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create/Edit Form Panel */}
        {showCreateForm && (
          <div className="mb-8 bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingForm ? 'Edit Form' : 'Create New Form'}
            </h2>
            <form onSubmit={editingForm ? handleUpdateForm : handleCreateForm} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Form Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter form name"
                    value={newFormData.name}
                    onChange={(e) => setNewFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    placeholder="Enter form description (optional)"
                    value={newFormData.description}
                    onChange={(e) => setNewFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* PDF Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PDF Document *
                </label>

                {/* Current PDF URL Display */}
                {newFormData.pdfUrl && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-green-600" />
                        <span className="text-sm text-green-700">PDF uploaded successfully</span>
                        <a
                          href={newFormData.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline text-sm"
                        >
                          View PDF
                        </a>
                      </div>
                      <button
                        type="button"
                        onClick={removePDFUrl}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {/* File Upload Area */}
                {!newFormData.pdfUrl && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center w-full">
                      <label htmlFor="pdf-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-4 text-gray-500" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload PDF</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">PDF files only (MAX. 10MB)</p>
                        </div>
                        <input
                          id="pdf-upload"
                          type="file"
                          accept=".pdf,application/pdf"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Selected File Display */}
                    {selectedFile && (
                      <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <div className="flex items-center gap-2">
                          <FileText size={16} className="text-blue-600" />
                          <span className="text-sm text-blue-700">{selectedFile.name}</span>
                          <span className="text-xs text-gray-500">
                            ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleUploadPDF}
                            disabled={isUploading}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                          >
                            {isUploading ? 'Uploading...' : 'Upload'}
                          </button>
                          <button
                            type="button"
                            onClick={removeSelectedFile}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Upload Progress */}
                    {isUploading && uploadProgress > 0 && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    )}

                    {/* Manual URL Input */}
                    <div className="border-t pt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Or enter PDF URL manually
                      </label>
                      <input
                        type="url"
                        placeholder="https://example.com/form.pdf"
                        value={newFormData.pdfUrl}
                        onChange={(e) => setNewFormData(prev => ({ ...prev, pdfUrl: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                {formErrors.pdfUrl && <p className="text-red-500 text-sm mt-1">{formErrors.pdfUrl}</p>}
                {formErrors.file && <p className="text-red-500 text-sm mt-1">{formErrors.file}</p>}
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  disabled={isFormLoading || isUploading}
                >
                  {isFormLoading ? "Processing..." : (editingForm ? "Update Form" : "Create Form")}
                </button>
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Forms Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">All Forms</h2>
            <p className="text-sm text-gray-500 mt-1">
              {forms?.length || 0} form{forms?.length !== 1 ? 's' : ''} total
            </p>
          </div>

          {isFormLoading && (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading forms...</p>
            </div>
          )}

          {formError && (
            <div className="p-6 bg-red-50 border-l-4 border-red-400">
              <p className="text-red-700">{formError}</p>
            </div>
          )}

          {!isFormLoading && !formError && (
            <>
              {forms?.length === 0 ? (
                <div className="text-center py-12">
                  <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No forms yet</h3>
                  <p className="text-gray-500 mb-4">Get started by creating your first form</p>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Your First Form
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <AllFormsTable setEditingForm={setEditingForm} setNewFormData={setNewFormData} setShowCreateForm={setShowCreateForm} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}