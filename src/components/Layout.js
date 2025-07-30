import Sidebar from './Sidebar';
import Header from './Header';
import { useState } from 'react';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => setSidebarOpen((v) => !v);
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {sidebarOpen && <Sidebar />}
      <div style={{ flex: 1, background: '#f5f6fa', marginLeft: sidebarOpen ? '14rem' : 0, transition: 'margin-left 0.3s' }}>
        <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        <div
          className="max-w-6xl mx-auto my-8 p-6 bg-white rounded-xl shadow-lg min-h-[70vh] md:p-6 sm:p-2 sm:my-2 w-full overflow-y-auto"
          style={{ maxHeight: 'calc(100vh - 64px)' }}
        >
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}