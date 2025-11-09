import { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
}

const Layout = ({ children, showSidebar = true }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {showSidebar && <Sidebar />}
      <main className={showSidebar ? 'ml-64' : ''}>
        {children}
      </main>
    </div>
  );
};

export default Layout;