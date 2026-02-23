import React from 'react';

const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  required = false,
  error
}) => {
  return (
    <div className="flex flex-col mb-4">
      {label && (
        <label className="mb-1 text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 outline-none
          ${error 
            ? 'border-red-500 focus:ring-red-200 bg-red-50' 
            : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200 bg-surface'
          }
        `}
      />
      {error && <span className="mt-1 text-sm text-red-500">{error}</span>}
    </div>
  );
};

export default Input;