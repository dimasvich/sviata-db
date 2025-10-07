import { ReactNode } from 'react';

export default function Typography({
  children,
  type,
  className,
}: {
  children: ReactNode;
  type: 'title' | 'text';
  className?: string;
}) {
  return (
    <>
      {type == 'title' && (
        <h1 className={className || 'font-medium text-[24px]'}>{children}</h1>
      )}
      {type == 'text' && (
        <span className={className || 'text-[16px]'}>{children}</span>
      )}
    </>
  );
}
