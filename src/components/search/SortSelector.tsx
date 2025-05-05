'use client';

import React from 'react';

export type SortOption = {
  value: string;
  label: string;
};

interface SortSelectorProps {
  options: SortOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  label?: string;
}

const SortSelector: React.FC<SortSelectorProps> = ({
  options,
  value,
  onChange,
  className = '',
  label = 'ソート:'
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {label && (
        <label 
          htmlFor="sort-select" 
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
        </label>
      )}
      <select
        id="sort-select"
        value={value}
        onChange={handleChange}
        className="text-sm rounded-md border border-gray-300 text-gray-700 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SortSelector;
