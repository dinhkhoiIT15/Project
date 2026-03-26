import React from 'react';

const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  disabled = false
}) => {
  return (
    <div className="flex flex-col w-full">
      {label && (
        <label className="mb-1.5 text-xs font-bold text-[#1f2328] uppercase tracking-wide">
          {label} {required && <span className="text-[#d1242f]">*</span>}
        </label>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`px-3 py-2 h-[38px] w-full border rounded-md text-sm transition-all duration-200 outline-none
          ${error 
            ? 'border-[#d1242f] ring-1 ring-[#d1242f] bg-[#fff8f7]' 
            : 'border-[#d0d7de] focus:border-[#0969da] focus:ring-3 focus:ring-[#0969da]/20 bg-white'
          }
          ${disabled ? 'bg-[#f6f8fa] cursor-not-allowed text-[#6e7781]' : ''}
        `}
      />
      {error && <span className="mt-1 text-xs text-[#d1242f] font-medium">{error}</span>}
    </div>
  );
};

export default Input;