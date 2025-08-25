// @/components/FormField.tsx
import React from 'react';
import { FormField as FormFieldType } from '@/lib/types';

interface FormFieldProps {
  field: FormFieldType;
  value: any;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  error?: string;
}

const FormField: React.FC<FormFieldProps> = ({ field, value, onChange, error }) => {
  const baseInputClass = `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
    error ? 'border-red-500' : 'border-gray-300'
  }`;

  const renderField = () => {
    switch (field.type) {
      case 'input':
        return (
          <input
            type="text"
            name={field.name}
            value={value || ''}
            onChange={onChange}
            placeholder={field.placeholder}
            className={baseInputClass}
          />
        );

      case 'email':
        return (
          <input
            type="email"
            name={field.name}
            value={value || ''}
            onChange={onChange}
            placeholder={field.placeholder}
            className={baseInputClass}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            name={field.name}
            value={value || ''}
            onChange={onChange}
            placeholder={field.placeholder}
            className={baseInputClass}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            name={field.name}
            value={value || ''}
            onChange={onChange}
            className={baseInputClass}
          />
        );

      case 'datetime-local': // ✅ Added support here
        return (
          <input
            type="datetime-local"
            name={field.name}
            value={value || ''}
            onChange={onChange}
            className={baseInputClass}
            required={field.required}
          />
        );

      case 'textarea':
        return (
          <textarea
            name={field.name}
            value={value || ''}
            onChange={onChange}
            placeholder={field.placeholder}
            rows={4}
            className={baseInputClass}
          />
        );

      case 'select':
        return (
          <select
            name={field.name}
            value={value || ''}
            onChange={onChange}
            className={baseInputClass}
          >
            <option value="">Select an option</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        const checkboxValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            {field.options?.map((option) => {
              const isChecked = checkboxValues.includes(option.value);
              return (
                <div key={option.value} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`${field.name}_${option.value}`}
                    name={field.name}
                    value={option.value}
                    checked={isChecked}
                    onChange={onChange}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor={`${field.name}_${option.value}`}
                    className="text-sm text-gray-700 cursor-pointer"
                  >
                    {option.label}
                  </label>
                </div>
              );
            })}
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <div key={option.value} className="flex items-center">
                <input
                  type="radio"
                  name={field.name}
                  value={option.value}
                  checked={value === option.value}
                  onChange={onChange}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </div>
            ))}
          </div>
        );

      case 'file':
        return (
          <div>
            <input
              type="file"
              name={field.name}
              onChange={onChange}
              accept="image/*"
              className={baseInputClass}
            />
            {value && (
              <div className="mt-2 text-sm text-gray-600">
                Selected: {value instanceof File ? value.name : 'Unknown file'}
              </div>
            )}
          </div>
        );

      default:
        return (
          <input
            type="text"
            name={field.name}
            value={value || ''}
            onChange={onChange}
            placeholder={field.placeholder}
            className={baseInputClass}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      {field.type !== 'checkbox' && (
        <label className="block text-sm font-medium text-gray-700">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {field.type === 'checkbox' && (
        <div className="mb-2">
          <span className="block text-sm font-medium text-gray-700">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </span>
        </div>
      )}

      {renderField()}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default FormField;
