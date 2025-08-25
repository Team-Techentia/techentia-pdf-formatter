import { FieldType } from "../types";

export const FIELD_TYPES: { value: FieldType; label: string }[] = [
    { value: 'input', label: 'Text Input' },
    { value: 'textarea', label: 'Text Area' },
    { value: 'select', label: 'Select Dropdown' },
    { value: 'date', label: 'Date' },
    { value: 'number', label: 'Number' },
    { value: 'email', label: 'Email' },
    { value: 'file', label: 'File Upload' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'radio', label: 'Radio Button' }
];