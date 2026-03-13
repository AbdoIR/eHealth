import React from 'react';

export default function FormField({ label, description, children, className = '' }) {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <div className="w-full">
        {children}
      </div>
      {description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {description}
        </p>
      )}
    </div>
  );
}
