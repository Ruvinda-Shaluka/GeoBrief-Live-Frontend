import { type ReactNode } from 'react';
import Navbar from './Navbar';
import BottomNav from './BottomNav';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen bg-darkBg text-slate-800 dark:text-slate-200">
      <Navbar />
      <main className="grow pt-24 pb-20 md:pb-6">
        {children}
      </main>
      
      {/* Bottom mobile navigation */}
      <BottomNav />
      
      <footer className="hidden md:block p-6 border-t border-darkBorder/30 bg-darkCard/30 text-center text-slate-500 text-xs">
        GeoBrief-Live Civic Spatial Dashboard &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default MainLayout;