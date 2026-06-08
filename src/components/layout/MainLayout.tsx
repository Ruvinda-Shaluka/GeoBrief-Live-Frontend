import { type ReactNode } from 'react';
import Navbar from './Navbar';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen bg-darkBg text-slate-200">
      {/* Navbar Placeholder (We will build the real one next) */}
      <Navbar />
      <main className="grow pt-24">
        {children}
      </main>
      
      {/* Footer Placeholder */}
      <footer className="p-4 border-t border-darkBorder bg-darkCard text-center text-slate-500 text-sm">
        Footer Placeholder
      </footer>
    </div>
  );
};

export default MainLayout;