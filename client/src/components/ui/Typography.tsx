import { ReactNode } from 'react';

export default function Typography({
  children,
  type,
}: {
  children: ReactNode;
  type: 'title' | 'text';
}) {
  return (
    <>
      {type == 'title' && (
        <h1 className="font-medium text-[24px]">{children}</h1>
      )}
      {type == 'text' && <span className="text-[16px]">{children}</span>}
    </>
  );
}
