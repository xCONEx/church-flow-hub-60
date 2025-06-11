
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  showSearch?: boolean;
}

export const DashboardLayout = ({ children, title, showSearch = true }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="ml-64 transition-all duration-300">
        <Header title={title} showSearch={showSearch} />
        
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
