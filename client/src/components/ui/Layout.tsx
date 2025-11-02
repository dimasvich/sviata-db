import { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-background w-full min-h-[100vh] text-primary p-8">
      {children}
    </div>
  );
}
