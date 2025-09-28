import { ReactNode } from 'react';

export default function Button({
  children,
  onClick,
  type = 'default',
}: {
  children: ReactNode;
  onClick: () => void;
  type?: 'default' | 'danger';
}) {
  const baseClasses =
    'rounded-[8px] py-[4px] px-[8px] border-[1px] transition-colors';

  const typeClasses = {
    default: 'border-textColor-secondary hover:bg-border',
    danger: 'border-red-500 text-red-500 hover:bg-red-100',
  };

  return (
    <button onClick={onClick} className={`${baseClasses} ${typeClasses[type]}`}>
      {children}
    </button>
  );
}
