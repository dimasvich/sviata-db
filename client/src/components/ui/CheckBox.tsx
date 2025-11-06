import React from 'react';

interface CheckBoxProps {
  label: string;
  value: boolean;
  setValue: (newValue: boolean) => void;
}

const CheckBox: React.FC<CheckBoxProps> = ({ label, value, setValue }) => {
  return (
    <label className="flex items-center justify-between w-full px-3 py-2 rounded-2xl bg-surface border border-border cursor-pointer hover:bg-background transition-colors">
      <span className="text-secondary select-none">{label}</span>
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => setValue(e.target.checked)}
        className="w-5 h-5 accent-primary cursor-pointer"
      />
    </label>
  );
};

export default CheckBox;
