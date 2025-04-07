
import React, { ReactNode } from 'react';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header activeTab={activeTab} onTabChange={onTabChange} />
      <main className="flex-1 container px-4 py-6">
        {children}
      </main>
      <footer className="bg-white border-t border-border py-4">
        <div className="container px-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Road Eye Spotter System. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Layout;
